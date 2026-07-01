import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as fs from "fs/promises";
import * as path from "path";
import type { EventContext } from "./lib/pi-helpers.js";

export default function (pi: ExtensionAPI): void {
  const STATUS_KEY = "preapexis-kit-status";

  let testStatus = "tests:none";

  async function detectTests(ctx: EventContext): Promise<void> {
    try {
      const pkgPath = path.join(ctx.cwd, "package.json");
      const content = await fs.readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(content) as {
        scripts?: Record<string, string>;
      };

      testStatus =
        typeof pkg.scripts?.test === "string" ? "tests:not-run" : "tests:none";
    } catch {
      testStatus = "tests:none";
    }
  }

  function getRepoTrust(ctx: EventContext): string {
    try {
      const isProjectTrusted = (
        ctx as {
          isProjectTrusted?: () => boolean;
        }
      ).isProjectTrusted;

      return isProjectTrusted?.() ? "trusted" : "untrusted";
    } catch {
      return "unknown";
    }
  }

  function updateStatus(ctx: EventContext): void {
    if (!ctx.hasUI) return;

    const trust = getRepoTrust(ctx);

    ctx.ui.setStatus(STATUS_KEY, `kit: safe · ${trust} · ${testStatus}`);
  }

  async function updateAll(ctx: EventContext): Promise<void> {
    if (!ctx.hasUI) return;

    await detectTests(ctx);
    updateStatus(ctx);
  }

  pi.on("session_start", async (_event, ctx) => {
    await updateAll(ctx);
  });

  pi.registerCommand("test-pass", {
    description: "Mark tests as passed",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      testStatus = "tests:passed";
      updateStatus(ctx);
    }
  });

  pi.registerCommand("test-fail", {
    description: "Mark tests as failed",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      testStatus = "tests:failed";
      updateStatus(ctx);
    }
  });

  pi.registerCommand("test-none", {
    description: "Mark tests as not run",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      testStatus = "tests:not-run";
      updateStatus(ctx);
    }
  });
}
