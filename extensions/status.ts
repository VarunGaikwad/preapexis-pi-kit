import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as fs from "fs/promises";
import * as path from "path";

export default function (pi: ExtensionAPI) {
  const STATUS_KEYS = {
    branch: "project-status-branch",
    model: "project-status-model",
    mode: "project-status-mode",
    tests: "project-status-tests",
    repo: "project-status-repo",
  };

  async function getBranch(cwd: string): Promise<string | null> {
    try {
      const result = await pi.exec("git", ["branch", "--show-current"], { cwd });
      if (result.code === 0) {
        const branch = result.stdout.trim();
        return branch.length > 0 ? branch : null;
      }
      return null;
    } catch {
      return null;
    }
  }

  function mapProviderToShort(provider: string): string {
    const lower = provider.toLowerCase();
    if (lower.includes("anthropic")) return "claude";
    if (lower.includes("openai")) return "gpt";
    if (lower.includes("google") || lower.includes("gemini")) return "gemini";
    // fallback: take first segment before dash or dot
    return provider.split(/[-_.]/)[0];
  }

  async function updateModel(ctx: any) {
    let modelText = "model: unknown";
    const model = ctx.model;
    if (model && typeof model === "object") {
      const provider = (model as any).provider;
      const id = (model as any).id;
      const name = (model as any).name;
      let display: string;
      if (provider && id) {
        const shortProvider = mapProviderToShort(provider);
        display = `${shortProvider}/${id}`;
      } else if (name) {
        display = name;
      } else {
        display = "unknown";
      }
      modelText = `model: ${display}`;
    }
    ctx.ui.setStatus(STATUS_KEYS.model, modelText);
  }

  function updateMode(ctx: any) {
    // For now, hardcode "safe". Could be made configurable later.
    ctx.ui.setStatus(STATUS_KEYS.mode, "mode: safe");
  }

  async function updateTests(ctx: any) {
    const cwd = ctx.cwd;
    try {
      const pkgPath = path.join(cwd, "package.json");
      const content = await fs.readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(content);
      const hasTestScript = pkg.scripts && typeof pkg.scripts.test === "string";
      if (hasTestScript) {
        ctx.ui.setStatus(STATUS_KEYS.tests, "tests: not run");
      } else {
        ctx.ui.setStatus(STATUS_KEYS.tests, "tests: none");
      }
    } catch (_err) {
      ctx.ui.setStatus(STATUS_KEYS.tests, "tests: not run");
    }
  }

  async function updateRepo(ctx: any) {
    try {
      const trusted = ctx.isProjectTrusted ? ctx.isProjectTrusted() : false;
      const repoText = trusted ? "repo: trusted" : "repo: untrusted";
      ctx.ui.setStatus(STATUS_KEYS.repo, repoText);
    } catch (_err) {
      // fallback
      ctx.ui.setStatus(STATUS_KEYS.repo, "repo: unknown");
    }
  }

  async function updateBranchStatus(ctx: any) {
    const branch = await getBranch(ctx.cwd);
    const branchText = branch ? `branch: ${branch}` : "branch: none";
    ctx.ui.setStatus(STATUS_KEYS.branch, branchText);
  }

  // Initial setup on session start
  pi.on("session_start", async (_event, ctx) => {
    if (!ctx.hasUI) return; // only set UI if available
    await updateBranchStatus(ctx);
    updateModel(ctx);
    updateMode(ctx);
    await updateTests(ctx);
    await updateRepo(ctx);
  });

  // Update model when it changes
  pi.on("model_select", async (event, ctx) => {
    if (!ctx.hasUI) return;
    updateModel(ctx);
  });

  // Update branch after bash commands (in case of git checkout, etc.)
  pi.on("tool_result", async (event, ctx) => {
    if (!ctx.hasUI) return;
    if (event.toolName === "bash") {
      // Only update branch status; others unlikely to change from a bash command
      await updateBranchStatus(ctx);
    }
  });

  // Optional: command to manually set test status (for demonstration)
  pi.registerCommand("test-pass", {
    description: "Mark tests as passed",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      ctx.ui.setStatus(STATUS_KEYS.tests, "tests: passed");
    },
  });
  pi.registerCommand("test-fail", {
    description: "Mark tests as failed",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      ctx.ui.setStatus(STATUS_KEYS.tests, "tests: failed");
    },
  });
  pi.registerCommand("test-none", {
    description: "Clear test status",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      ctx.ui.setStatus(STATUS_KEYS.tests, "tests: not run");
    },
  });
}