// cSpell:words preapexis
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { EventContext } from "./lib/pi-helpers.js";

type AgentMode = "plan" | "build" | "review";

const MODE_STATUS_KEY = "preapexis-agent-mode";

const modes: AgentMode[] = ["plan", "build", "review"];

const modeLabels: Record<AgentMode, string> = {
  plan: "Plan",
  build: "Build",
  review: "Review"
};

let currentMode: AgentMode = "build";

export default function (pi: ExtensionAPI): void {
  function setMode(mode: AgentMode, ctx?: EventContext): void {
    currentMode = mode;

    if (ctx?.hasUI) {
      ctx.ui.setStatus(MODE_STATUS_KEY, `mode: ${mode}`);
      ctx.ui.notify(`Agent mode changed to ${modeLabels[mode]} mode.`, "info");
    }
  }

  function nextMode(): AgentMode {
    const index = modes.indexOf(currentMode);
    return modes[(index + 1) % modes.length];
  }

  function modeRules(): string {
    if (currentMode === "plan") {
      return `
Current mode: PLAN

Plan mode rules:
- Do not edit, write, delete, rename, move, or create files.
- Do not run commands that modify files.
- Inspect the repository only as needed.
- Produce a clear plan before implementation.
- Mention exact files likely to change.
- Mention risks and tests.
- Ask the user before switching to build work.
`;
    }

    if (currentMode === "review") {
      return `
Current mode: REVIEW

Review mode rules:
- Do not edit, write, delete, rename, move, or create files.
- Do not run commands that modify files.
- Inspect and analyze only.
- Report findings clearly.
- Prefer severity labels for issues.
- Suggest fixes, but do not apply them.
`;
    }

    return `
Current mode: BUILD

Build mode rules:
- You may edit files when needed.
- Before editing or writing files, explain the exact files and sections that will change.
- Prefer normal edit/write tools over shell commands when changing files.
- Keep changes small and reviewable.
- Use change-preview approval before edits.
- Run relevant tests or type checks when available.
`;
  }

  function fullRules(): string {
    return `

PreApeXis Agent Behavior Rules:

${modeRules()}

Safety rules:
- Make small, reviewable changes.
- Do not read or edit secret files such as .env files.
- Do not expose secrets, API keys, tokens, passwords, or private credentials.
- Ask before installing, removing, or upgrading packages.
- Explain risky commands before running them.
- Prefer safe, additive changes.
- Run tests or type checks after code changes when available.
- Ask before destructive Git operations such as reset, clean, force-push, or deleting branches.

Clarification rules:
- If the task is clear, continue without asking unnecessary questions.
- If clarification is required before editing files, use the ask_user tool.
- Ask one question at a time.
- Provide 2 to 5 short, useful options.
- Do not manually add "Write something else"; the ask_user tool adds the custom-answer option.
- After the user answers, continue the same task using that answer.
- Do not edit files that depend on unanswered clarification.
- If a reasonable safe default exists, proceed with the default and clearly mention the assumption instead of asking.
- Do not ask broad open-ended questions when a multiple-choice question would work better.

Workspace boundary rules:
- Treat the current working directory as the workspace root.
- By default, only read, search, edit, write, delete, or inspect files inside the current workspace.
- Do not look outside the current workspace just because it might be useful.
- Do not read parent folders, sibling folders, home directories, global config folders, or unrelated repositories unless the user explicitly asks.
- Even when the user explicitly asks to access something outside the workspace, ask for confirmation before each outside read, search, write, edit, delete, or command.
- Prefer relative paths inside the current repository.
- Do not run commands that cd, pushd, Set-Location, sl, git -C, npm --prefix, pnpm -C, or otherwise move outside the workspace unless explicitly requested and confirmed.
- If outside-workspace context seems useful, ask first instead of checking it silently.
- If no UI is available to ask permission, block outside-workspace access.

Change preview rules:
- Before editing or writing files, explain the exact files and sections that will change.
- Prefer normal edit/write tools over shell commands when changing files, because edit/write tools can be previewed.
- Do not use shell commands to modify files when a direct file edit is possible.
- If a shell command may modify files, explain why it is needed before running it.
- Make one focused change at a time so the user can approve it clearly.

Repository behavior:
- Follow AGENTS.md when present.
- Keep AGENTS.md concise.
- Put detailed repository mapping in docs/PROJECT_MAP.md.
- Do not duplicate docs/PROJECT_MAP.md inside AGENTS.md.
- Prefer editing existing files over creating duplicate files.
- Prefer npm install instructions for this package unless the user explicitly asks for GitHub install instructions.

Pi kit behavior:
- Do not duplicate Pi's built-in model, branch, context, or token footer information.
- Keep workspace guard behavior strict by default.
- Keep provider setup commands safe and avoid printing API keys.
`;
  }

  pi.on("session_start", async (_event, ctx) => {
    if (ctx.hasUI) {
      ctx.ui.setStatus(MODE_STATUS_KEY, `mode: ${currentMode}`);
    }
  });

  pi.on("before_agent_start", async (event) => {
    return {
      systemPrompt: event.systemPrompt + fullRules()
    };
  });

  pi.registerCommand("mode", {
    description: "Select agent mode: plan, build, or review",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) {
        console.log(`Current mode: ${currentMode}`);
        return;
      }

      const choice = await ctx.ui.select("Select agent mode", [
        "Plan - inspect and create a plan only",
        "Build - make approved changes",
        "Review - inspect and report only"
      ]);

      if (!choice) {
        return;
      }

      if (choice.startsWith("Plan")) {
        setMode("plan", ctx);
        return;
      }

      if (choice.startsWith("Review")) {
        setMode("review", ctx);
        return;
      }

      setMode("build", ctx);
    }
  });

  pi.registerCommand("plan-mode", {
    description: "Switch to plan mode",
    handler: async (_args, ctx) => {
      setMode("plan", ctx);
    }
  });

  pi.registerCommand("build-mode", {
    description: "Switch to build mode",
    handler: async (_args, ctx) => {
      setMode("build", ctx);
    }
  });

  pi.registerCommand("review-mode", {
    description: "Switch to review mode",
    handler: async (_args, ctx) => {
      setMode("review", ctx);
    }
  });

  pi.registerCommand("mode-status", {
    description: "Show current agent mode",
    handler: async (_args, ctx) => {
      const message = `Current agent mode: ${modeLabels[currentMode]} mode`;

      if (ctx.hasUI) {
        ctx.ui.notify(message, "info");
      } else {
        console.log(message);
      }
    }
  });

  pi.registerShortcut("ctrl+m", {
    description: "Cycle PreApeXis agent mode",
    handler: async (ctx) => {
      setMode(nextMode(), ctx);
    }
  });

  pi.registerShortcut("ctrl+shift+m", {
    description: "Open PreApeXis mode picker",
    handler: async (ctx) => {
      if (!ctx.hasUI) {
        console.log(`Current mode: ${currentMode}`);
        return;
      }

      const choice = await ctx.ui.select("Select agent mode", [
        "Plan - inspect and create a plan only",
        "Build - make approved changes",
        "Review - inspect and report only"
      ]);

      if (!choice) {
        return;
      }

      if (choice.startsWith("Plan")) {
        setMode("plan", ctx);
        return;
      }

      if (choice.startsWith("Review")) {
        setMode("review", ctx);
        return;
      }

      setMode("build", ctx);
    }
  });
}
