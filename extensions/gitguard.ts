import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * Git guard extension.
 *
 * Helps avoid losing work in git repositories:
 * - Warns when the working tree is dirty.
 * - Creates a checkpoint branch before risky file edits.
 * - Blocks force-push outright.
 * - Confirms git reset --hard before allowing it.
 * - Shows the current branch in the footer status bar.
 */

export default function (pi: ExtensionAPI) {
  const CHECKPOINT_PREFIX = "pi-checkpoint";

  async function git(
    cwd: string,
    args: string[]
  ): Promise<{ stdout: string; stderr: string; code: number }> {
    try {
      const result = await pi.exec("git", args, { cwd });
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        code: result.code,
      };
    } catch (error) {
      return {
        stdout: "",
        stderr: error instanceof Error ? error.message : String(error),
        code: 1,
      };
    }
  }

  async function isGitRepo(cwd: string): Promise<boolean> {
    const { code } = await git(cwd, ["rev-parse", "--git-dir"]);
    return code === 0;
  }

  async function getBranch(cwd: string): Promise<string | null> {
    const { stdout, code } = await git(cwd, ["branch", "--show-current"]);
    if (code !== 0) return null;
    const branch = stdout.trim();
    return branch.length > 0 ? branch : null;
  }

  async function isDirty(cwd: string): Promise<boolean> {
    const { stdout, code } = await git(cwd, ["status", "--porcelain"]);
    if (code !== 0) return false;
    return stdout.trim().length > 0;
  }

  async function updateBranchStatus(ctx: {
    cwd: string;
    hasUI: boolean;
    ui: { setStatus(key: string, text: string | undefined): void };
  }): Promise<void> {
    if (!ctx.hasUI) return;

    if (!(await isGitRepo(ctx.cwd))) {
      ctx.ui.setStatus("git-guard-branch", undefined);
      return;
    }

    const branch = await getBranch(ctx.cwd);
    const dirty = await isDirty(ctx.cwd);
    const marker = dirty ? "*" : "";

    if (branch) {
      ctx.ui.setStatus("git-guard-branch", `⎇ ${branch}${marker}`);
    } else {
      ctx.ui.setStatus("git-guard-branch", "⎇ detached");
    }
  }

  // Show current branch whenever a session starts.
  pi.on("session_start", async (_event, ctx) => {
    await updateBranchStatus(ctx);
  });

  // Warn if the working tree is dirty before the agent starts working.
  pi.on("before_agent_start", async (_event, ctx) => {
    if (!ctx.hasUI || !(await isGitRepo(ctx.cwd))) return;

    if (await isDirty(ctx.cwd)) {
      ctx.ui.notify(
        "Git working tree is dirty. Consider committing or stashing before making changes.",
        "warning"
      );
    }

    await updateBranchStatus(ctx);
  });

  // Guard git-related bash commands and create checkpoints before risky edits.
  pi.on("tool_call", async (event, ctx) => {
    if (!ctx.hasUI) {
      // Without a UI we cannot confirm anything, so block risky git operations.
      if (event.toolName === "bash") {
        const command = String(event.input.command ?? "");
        if (/\bgit\s+push\s+.*(--force|-f)\b/i.test(command)) {
          return { block: true, reason: "Force-push blocked by git-guard." };
        }
        if (/\bgit\s+reset\s+--hard\b/i.test(command)) {
          return {
            block: true,
            reason:
              "git reset --hard blocked by git-guard: no UI available for confirmation.",
          };
        }
      }
      return undefined;
    }

    // Bash command guards ---------------------------------------------------
    if (event.toolName === "bash") {
      const command = String(event.input.command ?? "");

      // Block force-push completely.
      if (/\bgit\s+push\s+.*(--force|-f)\b/i.test(command)) {
        return { block: true, reason: "Force-push blocked by git-guard." };
      }

      // Confirm reset --hard before allowing it.
      if (/\bgit\s+reset\s+--hard\b/i.test(command)) {
        const ok = await ctx.ui.confirm(
          "git reset --hard detected",
          "This will discard uncommitted changes. Are you sure?"
        );
        if (!ok) {
          return {
            block: true,
            reason: "git reset --hard cancelled by user.",
          };
        }
      }
    }

    // Checkpoint before risky file edits ------------------------------------
    if (
      (event.toolName === "write" || event.toolName === "edit") &&
      (await isGitRepo(ctx.cwd)) &&
      (await isDirty(ctx.cwd))
    ) {
      const branch = await getBranch(ctx.cwd);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const checkpointName = branch
        ? `${CHECKPOINT_PREFIX}-${branch}-${timestamp}`
        : `${CHECKPOINT_PREFIX}-${timestamp}`;

      const { code, stderr } = await git(ctx.cwd, [
        "branch",
        checkpointName,
      ]);

      if (code !== 0) {
        const ok = await ctx.ui.confirm(
          "Git checkpoint failed",
          `Could not create checkpoint branch: ${stderr}\n\nContinue editing anyway?`
        );
        if (!ok) {
          return {
            block: true,
            reason: "Blocked because git checkpoint could not be created.",
          };
        }
      } else {
        ctx.ui.notify(
          `Git checkpoint created: ${checkpointName}`,
          "info"
        );
      }
    }

    return undefined;
  });

  // Refresh branch status after bash commands finish.
  pi.on("tool_result", async (event, ctx) => {
    if (event.toolName === "bash") {
      await updateBranchStatus(ctx);
    }
  });
}
