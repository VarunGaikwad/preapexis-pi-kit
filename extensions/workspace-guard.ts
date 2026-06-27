import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as path from "node:path";

type EventContext = Parameters<Parameters<ExtensionAPI["on"]>[1]>[1];

type ToolDecision =
  | {
      block: true;
      reason: string;
    }
  | undefined;

type InputRecord = Record<string, unknown>;

const STATUS_KEY = "workspace-guard";

export default function (pi: ExtensionAPI): void {
  let workspaceRoot: string | null = null;

  function normalize(filePath: string): string {
    return path.resolve(filePath);
  }

  function isInsideWorkspace(targetPath: string): boolean {
    if (!workspaceRoot) return true;

    const root = normalize(workspaceRoot);
    const target = normalize(targetPath);

    return target === root || target.startsWith(root + path.sep);
  }

  function inputRecord(input: unknown): InputRecord {
    if (input && typeof input === "object") {
      return input as InputRecord;
    }

    return {};
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

  function resolveFromWorkspaceOrCwd(ctx: EventContext, value: string): string {
    if (path.isAbsolute(value)) {
      return normalize(value);
    }

    return normalize(path.join(ctx.cwd, value));
  }

  function commandLooksOutside(command: string): boolean {
    const patterns = [
      /\bcd\s+\.\./i,
      /\bcd\s+["']?\//i,
      /\bcd\s+["']?[a-zA-Z]:\\/i,
      /\bpushd\s+\.\./i,
      /\bpushd\s+["']?\//i,
      /\bpushd\s+["']?[a-zA-Z]:\\/i,
      /\bgit\s+-C\s+\.\./i,
      /\bnpm\s+--prefix\s+\.\./i,
      /\bpnpm\s+-C\s+\.\./i,
      /\byarn\s+--cwd\s+\.\./i,
      /\bSet-Location\s+\.\./i,
      /\bsl\s+\.\./i
    ];

    return patterns.some((pattern) => pattern.test(command));
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

    if (!ctx.hasUI) {
      return {
        block: true,
        reason: `Outside workspace ${action} blocked: ${targetPath}`
      };
    }

    const ok = await ctx.ui.confirm("Outside workspace access", message);

    if (!ok) {
      return {
        block: true,
        reason: `Outside workspace ${action} cancelled by user.`
      };
    }

    return undefined;
  }

  pi.on("session_start", async (_event, ctx) => {
    workspaceRoot = normalize(ctx.cwd);

    if (ctx.hasUI) {
      ctx.ui.setStatus(STATUS_KEY, "workspace: locked");
    }
  });

  pi.on("before_agent_start", async (event) => {
    return {
      systemPrompt:
        event.systemPrompt +
        `

Workspace boundary rules:
- Treat the current working directory as the workspace root.
- Do not read, search, edit, write, delete, or inspect files outside the current workspace unless the user explicitly asks.
- Before using any path outside the workspace, ask the user for permission.
- Prefer relative paths inside the current repository.
- Do not run commands that cd, pushd, Set-Location, or otherwise move outside the workspace unless explicitly requested.
- If outside-workspace context seems useful, ask first instead of checking it silently.
`
    };
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
        const targetPath = resolveFromWorkspaceOrCwd(ctx, rawPath);

        return await confirmOutsideAccess(ctx, event.toolName, targetPath);
      }
    }

    if (event.toolName === "bash") {
      const command = String(input.command ?? "");

      const rawCwd = typeof input.cwd === "string" ? input.cwd : undefined;

      if (rawCwd) {
        const targetCwd = resolveFromWorkspaceOrCwd(ctx, rawCwd);
        const decision = await confirmOutsideAccess(ctx, "command", targetCwd);

        if (decision) return decision;
      }

      if (commandLooksOutside(command)) {
        if (!ctx.hasUI) {
          return {
            block: true,
            reason: "Command that may leave the workspace was blocked."
          };
        }

        const ok = await ctx.ui.confirm(
          "Command may leave workspace",
          [
            "This command appears to move outside the current workspace.",
            "",
            `Workspace root: ${workspaceRoot}`,
            "",
            command,
            "",
            "Allow this one time?"
          ].join("\n")
        );

        if (!ok) {
          return {
            block: true,
            reason: "Outside-workspace command cancelled by user."
          };
        }
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
