import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as path from "path";

/**
 * General safety extension for Pi.
 *
 * git-guard.ts handles Git-specific safety.
 * This file handles:
 * - risky shell commands
 * - secret file protection
 * - protected generated/dependency paths
 * - safety instructions in the system prompt
 */

export default function (pi: ExtensionAPI): void {
  // Do NOT include git push/reset checks here.
  // Those belong in git-guard.ts to avoid duplicate prompts.
  const riskyCommands = [
    // Recursive/forced remove
    /\brm\s+(-[a-z]*[rf][a-z]*|--recursive|--force)\b/i,

    // Admin / permission risky
    /\bsudo\b/i,
    /\bchmod\b.*\b777\b/i,

    // Running remote scripts
    /\bcurl\b.*\|\s*(sh|bash|zsh)\b/i,
    /\bwget\b.*\|\s*(sh|bash|zsh)\b/i,

    // Package install/remove
    /\b(npm|yarn|pnpm)\s+(install|add|remove|uninstall|ci)\b/i,
    /\b(pip|pip3)\s+(install|uninstall)\b/i,
    /\b(apt-get|apt)\s+(install|remove|purge)\b/i,
    /\bbrew\s+(install|uninstall|remove)\b/i,

    // Docker cleanup
    /\bdocker\s+system\s+prune/i,
    /\bdocker\s+(container|image|volume|network)\s+prune/i,

    // Disk / filesystem destructive
    /\bdd\s+if=.+of=\/dev\/[sh]d[a-z]/i,
    /\bmkfs\b/i,
    /\b(fdisk|parted)\b/i,
    />\s*\/dev\/[sh]d[a-z]/i,

    // Shutdown/reboot
    /\bshutdown\b|\breboot\b|\bpoweroff\b/i,

    // Windows destructive commands
    /\bformat\s+[a-z]:/i,
    /\bdiskpart\b/i,
    /\brd\s+\/s\s+\/q\b/i,
    /\bdel\s+\/f\s+\/s\s+\/q\b/i
  ];

  const secretFileNames = [
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    ".env.test",
    ".envrc"
  ];

  const blockedEditSegments = [
    ".git",
    "node_modules",
    "dist",
    "build",
    "out",
    "coverage"
  ];

  const confirmEditFileNames = [
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lockb"
  ];

  function getPathSegments(filePath: string): string[] {
    return path
      .normalize(filePath)
      .replaceAll("\\", "/")
      .split("/")
      .filter(Boolean);
  }

  function getFileName(filePath: string): string {
    const segments = getPathSegments(filePath);
    return segments.at(-1) ?? "";
  }

  function findSecretFile(filePath: string): string | undefined {
    const fileName = getFileName(filePath);
    return secretFileNames.find((name) => name === fileName);
  }

  function findBlockedEditSegment(filePath: string): string | undefined {
    const segments = getPathSegments(filePath);
    return blockedEditSegments.find((entry) => segments.includes(entry));
  }

  function findConfirmEditFile(filePath: string): string | undefined {
    const fileName = getFileName(filePath);
    return confirmEditFileNames.find((name) => name === fileName);
  }

  function isRiskyCommand(command: string): boolean {
    return riskyCommands.some((pattern) => pattern.test(command));
  }

  pi.on("before_agent_start", async (event) => {
    return {
      systemPrompt:
        event.systemPrompt +
        `
    Safety rules:
      - Make small, reviewable changes.
      - Do not read or edit secret files such as .env files.
      - Ask before installing or removing packages.
      - Explain risky commands before running them.
      - Prefer safe, additive changes.
      - Run tests or type checks after code changes when available.

    Clarification rules:
      - If the request is unclear, ask questions before editing files.
      - Ask only important questions.
      - Do not ask more than 5 questions.
      - If the task is clear, continue without asking.
      - Do not edit files until the user answers clarification questions.
`
    };
  });

  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName === "bash") {
      const command = String(event.input.command ?? "");

      if (isRiskyCommand(command)) {
        if (!ctx.hasUI) {
          return {
            block: true,
            reason:
              "Risky shell command blocked because no UI is available to confirm it."
          };
        }

        const choice = await ctx.ui.select(
          `Risky shell command detected:\n\n${command}\n\nAllow it?`,
          ["No", "Yes"]
        );

        if (choice !== "Yes") {
          return {
            block: true,
            reason: "Blocked by safety extension."
          };
        }

        console.log(`[safety] User approved risky command: ${command}`);
      }
    }

    if (event.toolName === "read") {
      const filePath = String(event.input.path ?? "");
      const secretHit = findSecretFile(filePath);

      if (secretHit) {
        const reason = `Reading secret file blocked: ${secretHit}`;

        if (ctx.hasUI) {
          ctx.ui.notify(reason, "warning");
        }

        return { block: true, reason };
      }
    }

    if (event.toolName === "write" || event.toolName === "edit") {
      const filePath = String(event.input.path ?? "");

      const secretHit = findSecretFile(filePath);
      if (secretHit) {
        const reason = `Editing secret file blocked: ${secretHit}`;

        if (ctx.hasUI) {
          ctx.ui.notify(reason, "warning");
        }

        return { block: true, reason };
      }

      const blockedSegment = findBlockedEditSegment(filePath);
      if (blockedSegment) {
        const reason = `Protected path blocked: ${blockedSegment}`;

        if (ctx.hasUI) {
          ctx.ui.notify(reason, "warning");
        }

        return { block: true, reason };
      }

      const confirmFile = findConfirmEditFile(filePath);
      if (confirmFile) {
        if (!ctx.hasUI) {
          return {
            block: true,
            reason: `Editing ${confirmFile} blocked because no UI is available to confirm it.`
          };
        }

        const choice = await ctx.ui.select(
          `Protected file edit detected:\n\n${filePath}\n\nAllow editing ${confirmFile}?`,
          ["No", "Yes"]
        );

        if (choice !== "Yes") {
          return {
            block: true,
            reason: `Editing ${confirmFile} cancelled by user.`
          };
        }

        console.log(`[safety] User approved protected file edit: ${filePath}`);
      }
    }

    return undefined;
  });

  pi.registerCommand("safety", {
    description: "Show active safety rules",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        "Safety enabled: risky command confirmation, .env read/edit blocking, dependency/build path protection, and lockfile edit confirmation.",
        "info"
      );
    }
  });
}
