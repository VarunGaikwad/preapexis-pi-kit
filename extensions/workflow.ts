import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * Workflow commands extension.
 *
 * Registers slash commands that explain how to use each prompt-based workflow.
 */

export default function (pi: ExtensionAPI) {
  const workflows = [
    {
      name: "plan",
      description: "Create a read-only implementation plan",
      usage:
        "Use the 'plan' prompt and paste your request where it says {USER_REQUEST}.",
    },
    {
      name: "save-plan",
      description: "Save a plan as a markdown file",
      usage:
        "Use the 'save-plan' prompt and paste the generated plan where it says {PLAN_CONTENT}.",
    },
    {
      name: "implement",
      description: "Implement a saved plan",
      usage:
        "Use the 'implement' prompt and paste the plan where it says {PLAN_CONTENT}, or provide the plan file path.",
    },
    {
      name: "commit",
      description: "Generate a git commit message",
      usage:
        "Use the 'commit' prompt. It will read the current git changes and suggest a commit message.",
    },
    {
      name: "review",
      description: "Run a safe project review",
      usage:
        "Use the 'review-safe' prompt. It will review the project safely without editing files.",
    },
    {
      name: "security",
      description: "Run a security review",
      usage:
        "Use the 'security' prompt. It will check for security issues without editing files.",
    },
  ];

  workflows.forEach((workflow) => {
    pi.registerCommand(workflow.name, {
      description: workflow.description,
      handler: async (_args, ctx) => {
        ctx.ui.notify(
          `${workflow.description}\n\n${workflow.usage}`,
          "info"
        );
      },
    });
  });

  pi.registerCommand("workflows", {
    description: "List available workflow commands",
    handler: async (_args, ctx) => {
      const list = workflows
        .map((w) => `/${w.name} - ${w.description}`)
        .join("\n");
      ctx.ui.notify(`Available workflows:\n\n${list}`, "info");
    },
  });
}
