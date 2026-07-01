/**
 * Consolidated shell command classification.
 *
 * Centralizes regex patterns previously scattered across:
 * - safety.ts (risky commands)
 * - change-preview.ts (file-modifying commands)
 * - workspace-guard.ts (outside-workspace commands)
 * - git-guard.ts (force-push, reset-hard)
 * - sound-cues.ts (install, reset-hard)
 */

// ─── Destructive / admin risky patterns ─────────────────────────────────────

const riskyPatterns: RegExp[] = [
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

// ─── File-modifying command patterns ────────────────────────────────────────

const fileModifyingPatterns: RegExp[] = [
  />/,
  />>/,
  /\|\s*tee\b/i,
  /\bsed\s+.*\s-i\b/i,
  /\bperl\s+.*\s-pi\b/i,
  /\brm\s+/i,
  /\bdel\s+/i,
  /\berase\s+/i,
  /\bmove\s+/i,
  /\bmv\s+/i,
  /\bcopy\s+/i,
  /\bcp\s+/i,
  /\btouch\s+/i,
  /\bmkdir\s+/i,
  /\brmdir\s+/i,
  /\bnpm\s+version\b/i,
  /\bprettier\s+.*--write\b/i,
  /\beslint\s+.*--fix\b/i,
  /\btsc\s+.*--build\b/i,
  /\bgit\s+checkout\s+.*--\s+/i,
  /\bgit\s+restore\b/i,
  /\bgit\s+reset\b/i,
  /\bgit\s+clean\b/i,
  /\bgit\s+apply\b/i,
  /\bgit\s+am\b/i,
  /\bgit\s+merge\b/i,
  /\bgit\s+rebase\b/i,

  // Package manager file-modifying commands.
  /\bnpm\s+(install|i|update|upgrade|uninstall|remove|rm|add)\b/i,
  /\bnpm\s+publish\b/i,
  /\bpnpm\s+(install|i|update|upgrade|remove|rm|add)\b/i,
  /\bpnpm\s+publish\b/i,
  /\byarn\s+(install|add|upgrade|up|remove|publish)\b/i,

  // Pi update commands.
  /\bpi\s+update\b/i,
  /\bpi\s+update\s+--extensions\b/i
];

// ─── Outside-workspace command patterns ─────────────────────────────────────

const outsideWorkspacePatterns: RegExp[] = [
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

// ─── Git-specific patterns ──────────────────────────────────────────────────

const gitForcePushPattern: RegExp = /\bgit\s+push\s+.*(--force|-f)\b/i;
const gitResetHardPattern: RegExp = /\bgit\s+reset\s+--hard\b/i;

// ─── Package install patterns (subset of riskyPatterns) ─────────────────────

const packageInstallPatterns: RegExp[] = [
  /\bnpm\s+install\b/i,
  /\bnpm\s+update\b/i,
  /\bgit\s+reset\s+--hard\b/i
];

// ─── Public functions ───────────────────────────────────────────────────────

export function isRiskyCommand(command: string): boolean {
  return riskyPatterns.some((pattern) => pattern.test(command));
}

export function commandMayModifyFiles(command: string): boolean {
  return fileModifyingPatterns.some((pattern) => pattern.test(command));
}

export function commandLooksOutside(command: string): boolean {
  return outsideWorkspacePatterns.some((pattern) => pattern.test(command));
}

export function isGitForcePush(command: string): boolean {
  return gitForcePushPattern.test(command);
}

export function isGitResetHard(command: string): boolean {
  return gitResetHardPattern.test(command);
}

export function isPackageInstall(command: string): boolean {
  return packageInstallPatterns.some((pattern) => pattern.test(command));
}

// ─── Raw pattern arrays (for direct use if needed) ──────────────────────────

export {
  fileModifyingPatterns,
  gitForcePushPattern,
  gitResetHardPattern,
  outsideWorkspacePatterns,
  packageInstallPatterns,
  riskyPatterns
};
