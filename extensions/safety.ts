import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getFileName, getPathSegments } from "./lib/paths.js";
import { isRiskyCommand } from "./lib/command-classifier.js";
import { confirmOrBlock } from "./lib/pi-helpers.js";

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

  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName === "bash") {
      const command = String(event.input.command ?? "");

      if (isRiskyCommand(command)) {
        const decision = await confirmOrBlock(
          ctx,
          "Risky shell command",
          `${command}\n\nAllow it?`,
          {
            noUiReason:
              "Risky shell command blocked because no UI is available to confirm it.",
            blockedReason: "Blocked by safety extension."
          }
        );

        if (decision) return decision;

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
        const decision = await confirmOrBlock(
          ctx,
          "Protected file edit",
          `${filePath}\n\nAllow editing ${confirmFile}?`,
          {
            noUiReason: `Editing ${confirmFile} blocked because no UI is available to confirm it.`,
            blockedReason: `Editing ${confirmFile} cancelled by user.`
          }
        );

        if (decision) return decision;

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
