import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as fs from "fs/promises";
import * as path from "path";

type EventContext = Parameters<Parameters<ExtensionAPI["on"]>[1]>[1];

type ModelLike = {
  provider?: string;
  id?: string;
  name?: string;
};

export default function (pi: ExtensionAPI): void {
  const STATUS_KEYS = {
    model: "project-status-model",
    mode: "project-status-mode",
    tests: "project-status-tests",
    repo: "project-status-repo"
  };

  function mapProviderToShort(provider: string): string {
    const lower = provider.toLowerCase();

    if (lower.includes("anthropic")) return "claude";
    if (lower.includes("openai")) return "gpt";
    if (lower.includes("google") || lower.includes("gemini")) return "gemini";
    if (lower.includes("openrouter")) return "openrouter";

    return provider.split(/[-_.]/)[0] ?? provider;
  }

  function getModel(ctx: EventContext): ModelLike | undefined {
    const model = (ctx as { model?: unknown }).model;

    if (model && typeof model === "object") {
      return model as ModelLike;
    }

    return undefined;
  }

  function updateModel(ctx: EventContext): void {
    const model = getModel(ctx);

    if (!model) {
      ctx.ui.setStatus(STATUS_KEYS.model, "model: unknown");
      return;
    }

    const { provider, id, name } = model;

    if (provider && id) {
      const shortProvider = mapProviderToShort(provider);
      ctx.ui.setStatus(STATUS_KEYS.model, `model: ${shortProvider}/${id}`);
      return;
    }

    if (name) {
      ctx.ui.setStatus(STATUS_KEYS.model, `model: ${name}`);
      return;
    }

    ctx.ui.setStatus(STATUS_KEYS.model, "model: unknown");
  }

  function updateMode(ctx: EventContext): void {
    ctx.ui.setStatus(STATUS_KEYS.mode, "mode: safe");
  }

  async function updateTests(ctx: EventContext): Promise<void> {
    try {
      const pkgPath = path.join(ctx.cwd, "package.json");
      const content = await fs.readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(content) as {
        scripts?: Record<string, string>;
      };

      if (typeof pkg.scripts?.test === "string") {
        ctx.ui.setStatus(STATUS_KEYS.tests, "tests: not run");
      } else {
        ctx.ui.setStatus(STATUS_KEYS.tests, "tests: none");
      }
    } catch {
      ctx.ui.setStatus(STATUS_KEYS.tests, "tests: none");
    }
  }

  async function updateRepo(ctx: EventContext): Promise<void> {
    try {
      const isProjectTrusted = (
        ctx as {
          isProjectTrusted?: () => boolean;
        }
      ).isProjectTrusted;

      const trusted = isProjectTrusted ? isProjectTrusted() : false;
      ctx.ui.setStatus(
        STATUS_KEYS.repo,
        trusted ? "repo: trusted" : "repo: untrusted"
      );
    } catch {
      ctx.ui.setStatus(STATUS_KEYS.repo, "repo: unknown");
    }
  }

  async function updateAll(ctx: EventContext): Promise<void> {
    if (!ctx.hasUI) return;

    updateModel(ctx);
    updateMode(ctx);
    await updateTests(ctx);
    await updateRepo(ctx);
  }

  pi.on("session_start", async (_event, ctx) => {
    await updateAll(ctx);
  });

  pi.on("model_select", async (_event, ctx) => {
    if (!ctx.hasUI) return;
    updateModel(ctx);
  });

  pi.registerCommand("test-pass", {
    description: "Mark tests as passed",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      ctx.ui.setStatus(STATUS_KEYS.tests, "tests: passed");
    }
  });

  pi.registerCommand("test-fail", {
    description: "Mark tests as failed",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      ctx.ui.setStatus(STATUS_KEYS.tests, "tests: failed");
    }
  });

  pi.registerCommand("test-none", {
    description: "Mark tests as not run",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      ctx.ui.setStatus(STATUS_KEYS.tests, "tests: not run");
    }
  });
}
