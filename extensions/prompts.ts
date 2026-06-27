import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI): void {
  const prompts = [
    {
      name: "init",
      description:
        "Inspect the repository and create or update AGENTS.md for future Pi sessions",
      usage: "/init"
    },
    {
      name: "plan",
      description:
        "Create a read-only plan with batches, model choice, and effort guidance",
      usage: "/plan <your request>"
    },
    {
      name: "save-plan",
      description: "Save a generated plan as a markdown file",
      usage: "/save-plan <plan content>"
    },
    {
      name: "implement",
      description: "Implement a saved plan or pasted plan content",
      usage: "/implement <plan file path or plan content>"
    },
    {
      name: "commit",
      description: "Generate a git commit message from current changes",
      usage: "/commit"
    },
    {
      name: "review-safe",
      description: "Review the project safely without editing files",
      usage: "/review-safe"
    },
    {
      name: "security",
      description: "Run a read-only security review",
      usage: "/security"
    }
  ];

  pi.registerCommand("prompts", {
    description: "List available prompt workflows",
    handler: async (_args, ctx) => {
      const list = prompts
        .map((prompt) => `${prompt.usage} - ${prompt.description}`)
        .join("\n");

      ctx.ui.notify(`Available prompts:\n\n${list}`, "info");
    }
  });
}
