import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type EventContext = Parameters<Parameters<ExtensionAPI["on"]>[1]>[1];

type UpdateOption = {
  id: string;
  label: string;
  command: string;
  args: string[];
  cwd?: string;
};

export default function (pi: ExtensionAPI): void {
  const options: UpdateOption[] = [
    {
      id: "1",
      label: "Update Pi CLI globally",
      command: "npm",
      args: ["install", "-g", "@earendil-works/pi-coding-agent@latest"]
    },
    {
      id: "2",
      label: "Update PreApexis Pi Kit from GitHub",
      command: "pi",
      args: ["install", "git:github.com/VarunGaikwad/preapexis-pi-kit@master"]
    },
    {
      id: "3",
      label: "Update PreApexis Pi Kit from npm",
      command: "pi",
      args: ["install", "npm:preapexis-pi-kit"]
    },
    {
      id: "4",
      label: "Update current project npm packages",
      command: "npm",
      args: ["update"]
    }
  ];

  function menuText(): string {
    return [
      "Select what you want to update.",
      "",
      ...options.map((option) => `${option.id}. ${option.label}`),
      "",
      "Type one or more numbers separated by commas.",
      "Example: 1,2",
      "",
      "Leave empty to cancel."
    ].join("\n");
  }

  function parseChoices(input: string): UpdateOption[] {
    const selectedIds = new Set(
      input
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    );

    return options.filter((option) => selectedIds.has(option.id));
  }

  function commandText(option: UpdateOption): string {
    return `${option.command} ${option.args.join(" ")}`;
  }

  async function runUpdate(
    option: UpdateOption,
    ctx: EventContext
  ): Promise<void> {
    ctx.ui.notify(`Running update:\n\n${commandText(option)}`, "info");

    const result = await pi.exec(option.command, option.args, {
      cwd: option.cwd ?? ctx.cwd
    });

    if (result.code === 0) {
      ctx.ui.notify(`Update completed:\n\n${option.label}`, "info");
      return;
    }

    ctx.ui.notify(
      [
        `Update failed: ${option.label}`,
        "",
        `Exit code: ${result.code}`,
        "",
        result.stderr || result.stdout || "No output."
      ].join("\n"),
      "error"
    );
  }

  pi.registerCommand("update", {
    description: "Update Pi, this Pi kit, or project packages",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) {
        console.log(menuText());
        return;
      }

      const answer = await ctx.ui.input("Update options", menuText());

      if (!answer?.trim()) {
        ctx.ui.notify("Update cancelled.", "info");
        return;
      }

      const selected = parseChoices(answer);

      if (selected.length === 0) {
        ctx.ui.notify("No valid update option selected.", "warning");
        return;
      }

      const summary = selected
        .map((option) => `- ${option.label}\n  ${commandText(option)}`)
        .join("\n");

      const ok = await ctx.ui.confirm(
        "Confirm updates",
        `The following updates will run:\n\n${summary}\n\nContinue?`
      );

      if (!ok) {
        ctx.ui.notify("Update cancelled.", "info");
        return;
      }

      for (const option of selected) {
        await runUpdate(option, ctx);
      }

      ctx.ui.notify(
        "Selected updates finished. Run /reload or restart Pi if needed.",
        "info"
      );
    }
  });
}
