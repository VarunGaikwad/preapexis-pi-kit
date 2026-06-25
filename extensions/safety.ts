import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as path from "path";

/**
 * Safeguard extension for pi.
 *
 * Goals:
 * - Block destructive shell commands unless the user explicitly approves them.
 * - Prevent accidental edits or reads of sensitive files and paths.
 * - Inject safety rules into the agent's system prompt.
 * - Keep a clear audit trail when risky actions are approved.
 */

export default function (pi: ExtensionAPI) {
  // --------------------------------------------------------------------------
  // Command patterns that can destroy data, run untrusted code, alter system
  // or project state unexpectedly, or require explicit user approval. Each
  // regex should match the requested risky patterns.
  // --------------------------------------------------------------------------
  const riskyCommands = [
    // Any recursive/forced removal
    /\brm\s+(-[rf]+\s*)+/i,

    // Any sudo usage
    /\bsudo\b/i,

    // Overly permissive chmod
    /\bchmod\b.*777/i,

    // Piping curl/wget output into a shell
    /\bcurl\b.*\|\s*(sh|bash|zsh)/i,
    /\bwget\b.*\|\s*(sh|bash|zsh)/i,

    // Remote shell execution via curl/wget
    /\b(curl|wget)\b.*\b(sh|bash|zsh)\s+-c/i,

    // Force-pushing or destructive git history rewrites
    /\bgit\s+push\s+.*(--force|-f)\b/i,
    /\bgit\s+(reset\s+--hard|clean\s+-fd|filter-branch|reflog\s+expire)\b/i,

    // Package installation
    /\b(npm|yarn|pnpm)\s+(install|add|remove|uninstall|ci)\b/i,
    /\b(pip|pip3)\s+(install|uninstall)\b/i,
    /\b(apt-get|apt)\s+(install|remove|purge)\b/i,
    /\bbrew\s+(install|uninstall|remove)\b/i,

    // Docker cleanup that removes containers, images, volumes, networks
    /\bdocker\s+system\s+prune/i,
    /\bdocker\s+(container|image|volume|network)\s+prune/i,

    // Direct disk overwrite
    /\bdd\s+if=.+of=\/dev\/[sh]d[a-z]/i,

    // Filesystem creation and partitioning
    /\bmkfs\b/i,
    /\b(fdisk|parted)\b/i,

    // System shutdown/reboot
    /\bshutdown\b|\breboot\b|\bpoweroff\b/i,

    // Writing raw bytes directly to a disk device
    />\s*\/dev\/[sh]d[a-z]/i,

    // Windows-specific destructive commands
    /\bformat\s+[a-z]:/i,
    /\bdiskpart\b/i,
    /\brd\s+\/s\s+\/q\b/i,
    /\bdel\s+\/f\s+\/s\s+\/q\b/i,
  ];

  // --------------------------------------------------------------------------
  // Paths that should rarely be touched by an agent. Matching is done on whole
  // path segments so that innocent files like "my.env.config.ts" are not
  // blocked.
  // --------------------------------------------------------------------------
  const protectedPaths = [
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    ".env.test",
    ".envrc",
    ".git",
    "node_modules",
    "dist",
    "build",
    "out",
    "coverage",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lockb",
  ];

  const secretFileNames = [
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    ".env.test",
    ".envrc",
  ];

  /**
   * Check whether a file path touches a protected directory or file.
   * Returns the matched protected entry, or undefined if safe.
   */
  function isProtectedPath(filePath: string): string | undefined {
    const normalized = path.normalize(filePath);
    const segments = normalized.split(path.sep);

    return protectedPaths.find((protectedEntry) =>
      segments.some(
        (segment) =>
          segment === protectedEntry ||
          segment === protectedEntry.replace(/\/$/, "")
      )
    );
  }

  /**
   * Check whether a file path is a secret env file.
   */
  function isSecretFile(filePath: string): string | undefined {
    const normalized = path.normalize(filePath);
    const fileName = path.basename(normalized);
    return secretFileNames.find((name) => fileName === name);
  }

  /**
   * Determine if a shell command looks risky and should be confirmed.
   */
  function isRisky(command: string): boolean {
    return riskyCommands.some((pattern) => pattern.test(command));
  }

  // --------------------------------------------------------------------------
  // Inject safety rules into every agent session.
  // --------------------------------------------------------------------------
  pi.on("before_agent_start", async (event) => {
    return {
      systemPrompt:
        event.systemPrompt +
        `

Safety rules:
- Make small, reviewable changes.
- Do not edit secrets, env files, lockfiles, build output, coverage reports, or git internals unless explicitly asked.
- Explain risky commands before running them.
- Run tests or type checks after code changes when available.
- Do not install packages, delete files, or rewrite history without clear user approval.
- Prefer additive changes; avoid destructive updates.
`,
    };
  });

  // --------------------------------------------------------------------------
  // Inspect every tool call and block or confirm risky actions.
  // --------------------------------------------------------------------------
  pi.on("tool_call", async (event, ctx) => {
    // Bash safeguards --------------------------------------------------------
    if (event.toolName === "bash") {
      const command = String(event.input.command ?? "");

      if (isRisky(command)) {
        if (!ctx.hasUI) {
          return {
            block: true,
            reason:
              "Risky shell command blocked because no UI is available to confirm it.",
          };
        }

        const choice = await ctx.ui.select(
          `Risky shell command detected:\n\n${command}\n\nAllow it?`,
          ["No", "Yes"]
        );

        if (choice !== "Yes") {
          return { block: true, reason: "Blocked by safeguard extension." };
        }

        console.log(`[safeguards] User approved risky command: ${command}`);
      }
    }

    // Write/edit safeguards --------------------------------------------------
    if (event.toolName === "write" || event.toolName === "edit") {
      const filePath = String(event.input.path ?? "");
      const protectedHit = isProtectedPath(filePath);

      if (protectedHit) {
        const reason = `Protected path blocked: ${protectedHit}`;
        if (ctx.hasUI) {
          await ctx.ui.notify(reason, "warning");
        }
        return { block: true, reason };
      }
    }

    // Read safeguards for secrets -------------------------------------------
    if (event.toolName === "read") {
      const filePath = String(event.input.path ?? "");
      const secretHit = isSecretFile(filePath);

      if (secretHit) {
        const reason = `Reading secret file blocked: ${secretHit}`;
        if (ctx.hasUI) {
          await ctx.ui.notify(reason, "warning");
        }
        return { block: true, reason };
      }
    }

    return undefined;
  });

  // --------------------------------------------------------------------------
  // Command users can run to verify the extension is active.
  // --------------------------------------------------------------------------
  pi.registerCommand("safety", {
    description: "Show active safety rules",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        "Safety enabled: risky bash confirmation, protected paths, .env protection, package install confirmation, docker prune confirmation, small diffs, no history rewrites.",
        "info"
      );
    },
  });
}
