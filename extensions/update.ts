// cSpell:words Varun Gaikwad preapexis
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type EventContext = Parameters<Parameters<ExtensionAPI["on"]>[1]>[1];

type UpdateOption = {
  id: string;
  label: string;
  command: string;
  args: string[];
};

export default function (pi: ExtensionAPI): void {
  const options: UpdateOption[] = [
    {
      id: "pi",
      label: "Update Pi CLI globally",
      command: "npm",
      args: ["install", "-g", "@earendil-works/pi-coding-agent@latest"]
    },
    {
      id: "kit-github",
      label: "Update PreApexis Pi Kit from GitHub",
      command: "pi",
      args: ["install", "git:github.com/VarunGaikwad/preapexis-pi-kit@master"]
    },
    {
      id: "kit-npm",
      label: "Update PreApexis Pi Kit from npm",
      command: "pi",
      args: ["install", "npm:preapexis-pi-kit"]
    },
    {
      id: "project-npm",
      label: "Update current project npm packages",
      command: "npm",
      args: ["update"]
    }
  ];

  function commandText(option: UpdateOption): string {
    return `${option.command} ${option.args.join(" ")}`;
  }

  function getOptionByLabel(label: string): UpdateOption | undefined {
    return options.find((option) => option.label === label);
  }

  function selectedSummary(selected: UpdateOption[]): string {
    if (selected.length === 0) return "Nothing selected yet.";

    return selected
      .map((option) => `- ${option.label}\n  ${commandText(option)}`)
      .join("\n");
  }

  async function chooseUpdates(ctx: EventContext): Promise<UpdateOption[]> {
    const selected = new Map<string, UpdateOption>();

    while (true) {
      const menuItems = [
        ...options.map((option) => option.label),
        "Run selected updates",
        "Cancel"
      ];

      const choice = await ctx.ui.select(
        [
          "What do you want to update?",
          "",
          selectedSummary([...selected.values()])
        ].join("\n"),
        menuItems
      );

      if (!choice) {
        return [];
      }

      if (choice === "Cancel") {
        return [];
      }

      if (choice === "Run selected updates") {
        return [...selected.values()];
      }

      const option = getOptionByLabel(choice);

      if (option) {
        if (selected.has(option.id)) {
          selected.delete(option.id);
          ctx.ui.notify(`Removed: ${option.label}`, "info");
        } else {
          selected.set(option.id, option);
          ctx.ui.notify(`Added: ${option.label}`, "info");
        }
      }
    }
  }

  async function runUpdate(
    option: UpdateOption,
    ctx: EventContext
  ): Promise<boolean> {
    ctx.ui.notify(`Running update:\n\n${commandText(option)}`, "info");

    const result = await pi.exec(option.command, option.args, {
      cwd: ctx.cwd
    });

    if (result.code === 0) {
      ctx.ui.notify(
        [
          `Update completed: ${option.label}`,
          "",
          result.stdout.trim() || "No output."
        ].join("\n"),
        "info"
      );

      return true;
    }

    ctx.ui.notify(
      [
        `Update failed: ${option.label}`,
        "",
        `Command: ${commandText(option)}`,
        `Exit code: ${result.code}`,
        "",
        result.stderr.trim() || result.stdout.trim() || "No output."
      ].join("\n"),
      "error"
    );

    return false;
  }

  pi.registerCommand("update", {
    description: "Update Pi, this Pi kit, or project packages",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) {
        console.log("The /update command requires the Pi UI.");
        return;
      }

      const selected = await chooseUpdates(ctx);

      if (selected.length === 0) {
        ctx.ui.notify("Update cancelled.", "info");
        return;
      }

      const ok = await ctx.ui.confirm(
        "Confirm updates",
        `The following updates will run:\n\n${selectedSummary(
          selected
        )}\n\nContinue?`
      );

      if (!ok) {
        ctx.ui.notify("Update cancelled.", "info");
        return;
      }

      let passed = 0;
      let failed = 0;

      for (const option of selected) {
        const ok = await runUpdate(option, ctx);

        if (ok) {
          passed += 1;
        } else {
          failed += 1;
        }
      }

      ctx.ui.notify(
        [
          "Update finished.",
          "",
          `Passed: ${passed}`,
          `Failed: ${failed}`,
          "",
          "Run /reload or restart Pi if needed."
        ].join("\n"),
        failed > 0 ? "warning" : "info"
      );
    }
  });
}
