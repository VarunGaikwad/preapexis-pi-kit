import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type EventContext = Parameters<Parameters<ExtensionAPI["on"]>[1]>[1];

export default function (pi: ExtensionAPI): void {
  const CHECKPOINT_PREFIX = "pi-checkpoint";
  const BRANCH_STATUS_KEY = "git-guard-branch";

  async function git(
    cwd: string,
    args: string[]
  ): Promise<{ stdout: string; stderr: string; code: number }> {
    try {
      const result = await pi.exec("git", args, { cwd });

      return {
        stdout: result.stdout,
        stderr: result.stderr,
        code: result.code
      };
    } catch (error) {
      return {
        stdout: "",
        stderr: error instanceof Error ? error.message : String(error),
        code: 1
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

  async function updateBranchStatus(ctx: EventContext): Promise<void> {
    if (!ctx.hasUI) return;

    if (!(await isGitRepo(ctx.cwd))) {
      ctx.ui.setStatus(BRANCH_STATUS_KEY, undefined);
      return;
    }

    const branch = await getBranch(ctx.cwd);
    const dirty = await isDirty(ctx.cwd);
    const marker = dirty ? "*" : "";

    if (branch) {
      ctx.ui.setStatus(BRANCH_STATUS_KEY, `⎇ ${branch}${marker}`);
    } else {
      ctx.ui.setStatus(BRANCH_STATUS_KEY, "⎇ detached");
    }
  }

  pi.on("session_start", async (_event, ctx) => {
    await updateBranchStatus(ctx);
  });

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

  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName === "bash") {
      const command = String(event.input.command ?? "");

      if (/\bgit\s+push\s+.*(--force|-f)\b/i.test(command)) {
        return {
          block: true,
          reason: "Force-push blocked by git-guard."
        };
      }

      if (/\bgit\s+reset\s+--hard\b/i.test(command)) {
        if (!ctx.hasUI) {
          return {
            block: true,
            reason:
              "git reset --hard blocked by git-guard: no UI available for confirmation."
          };
        }

        const ok = await ctx.ui.confirm(
          "git reset --hard detected",
          "This will discard uncommitted changes. Are you sure?"
        );

        if (!ok) {
          return {
            block: true,
            reason: "git reset --hard cancelled by user."
          };
        }
      }
    }

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

      const { code, stderr } = await git(ctx.cwd, ["branch", checkpointName]);

      if (code !== 0) {
        if (!ctx.hasUI) {
          return {
            block: true,
            reason: "Blocked because git checkpoint could not be created."
          };
        }

        const ok = await ctx.ui.confirm(
          "Git checkpoint failed",
          `Could not create checkpoint branch: ${stderr}\n\nContinue editing anyway?`
        );

        if (!ok) {
          return {
            block: true,
            reason: "Blocked because git checkpoint could not be created."
          };
        }
      } else if (ctx.hasUI) {
        ctx.ui.notify(`Git checkpoint created: ${checkpointName}`, "info");
      }
    }

    return undefined;
  });

  pi.on("tool_result", async (event, ctx) => {
    if (!ctx.hasUI) return;

    if (event.toolName === "bash") {
      await updateBranchStatus(ctx);
    }
  });
}
