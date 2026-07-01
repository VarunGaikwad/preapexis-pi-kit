import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as path from "node:path";
import {
  confirmOrBlock,
  inputRecord,
  type EventContext,
  type InputRecord,
  type ToolDecision
} from "./lib/pi-helpers.js";
import { normalize, resolveFromCwd } from "./lib/paths.js";
import { commandLooksOutside } from "./lib/command-classifier.js";

const STATUS_KEY = "workspace-guard";

export default function (pi: ExtensionAPI): void {
  let workspaceRoot: string | null = null;

  function isInsideWorkspace(targetPath: string): boolean {
    if (!workspaceRoot) return true;

    const root = normalize(workspaceRoot);
    const target = normalize(targetPath);

    return target === root || target.startsWith(root + path.sep);
  }

  function getPathValue(input: InputRecord): string | undefined {
    const keys = [
      "path",
      "filePath",
      "filepath",
      "dir",
      "directory",
      "cwd",
      "root"
    ];

    for (const key of keys) {
      const value = input[key];

      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }

    return undefined;
  }

  async function confirmOutsideAccess(
    ctx: EventContext,
    action: string,
    targetPath: string
  ): Promise<ToolDecision> {
    if (!workspaceRoot) return undefined;

    if (isInsideWorkspace(targetPath)) {
      return undefined;
    }

    const message = [
      `Workspace guard blocked outside-${action} access.`,
      "",
      `Workspace root: ${workspaceRoot}`,
      `Requested path: ${targetPath}`,
      "",
      "Allow this one time?"
    ].join("\n");

    return await confirmOrBlock(
      ctx,
      "Outside workspace access",
      message,
      {
        noUiReason: `Outside workspace ${action} blocked: ${targetPath}`,
        blockedReason: `Outside workspace ${action} cancelled by user.`
      }
    );
  }

  pi.on("session_start", async (_event, ctx) => {
    workspaceRoot = normalize(ctx.cwd);

    if (ctx.hasUI) {
      ctx.ui.setStatus(STATUS_KEY, "workspace: locked");
    }
  });

  pi.on("tool_call", async (event, ctx) => {
    if (!workspaceRoot) {
      workspaceRoot = normalize(ctx.cwd);
    }

    const input = inputRecord(event.input);

    if (
      event.toolName === "read" ||
      event.toolName === "write" ||
      event.toolName === "edit" ||
      event.toolName === "ls" ||
      event.toolName === "grep" ||
      event.toolName === "find"
    ) {
      const rawPath = getPathValue(input);

      if (rawPath) {
        const targetPath = resolveFromCwd(ctx, rawPath);

        return await confirmOutsideAccess(ctx, event.toolName, targetPath);
      }
    }

    if (event.toolName === "bash") {
      const command = String(input.command ?? "");

      const rawCwd = typeof input.cwd === "string" ? input.cwd : undefined;

      if (rawCwd) {
        const targetCwd = resolveFromCwd(ctx, rawCwd);
        const decision = await confirmOutsideAccess(ctx, "command", targetCwd);

        if (decision) return decision;
      }

      if (commandLooksOutside(command)) {
        const decision = await confirmOrBlock(
          ctx,
          "Command may leave workspace",
          [
            "This command appears to move outside the current workspace.",
            "",
            `Workspace root: ${workspaceRoot}`,
            "",
            command,
            "",
            "Allow this one time?"
          ].join("\n"),
          {
            noUiReason: "Command that may leave the workspace was blocked.",
            blockedReason: "Outside-workspace command cancelled by user."
          }
        );

        if (decision) return decision;
      }
    }

    return undefined;
  });

  pi.registerCommand("workspace-root", {
    description: "Show the current locked workspace root",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;

      ctx.ui.notify(
        `Workspace root:\n\n${workspaceRoot ?? normalize(ctx.cwd)}`,
        "info"
      );
    }
  });
}
