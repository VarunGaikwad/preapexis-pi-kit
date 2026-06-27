// cSpell:words preapexis npm PowerShell
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type EventContext = Parameters<Parameters<ExtensionAPI["on"]>[1]>[1];

type UpdateOption = {
  id: string;
  label: string;
  shell: string;
};

type ShellCommand = {
  command: string;
  args: string[];
};

const RUN_CHOICE = "▶ Run selected updates";
const CANCEL_CHOICE = "✕ Cancel";
const UPDATE_STATUS_KEY = "preapexis-update-status";

export default function (pi: ExtensionAPI): void {
  const options: UpdateOption[] = [
    {
      id: "pi",
      label: "Update Pi CLI globally",
      shell:
        "npm install -g --ignore-scripts @earendil-works/pi-coding-agent@latest"
    },
    {
      id: "pi-extensions",
      label: "Update installed Pi packages/extensions",
      shell: "pi update --extensions"
    },
    {
      id: "kit-npm",
      label: "Update PreApeXis Pi Kit from npm",
      shell: "pi install npm:@preapexis/pi-kit"
    },
    {
      id: "project-npm",
      label: "Update current project npm packages",
      shell: "npm update"
    }
  ];

  function shellCommand(command: string): ShellCommand {
    if (process.platform === "win32") {
      return {
        command: "cmd",
        args: ["/d", "/s", "/c", command]
      };
    }

    return {
      command: "sh",
      args: ["-lc", command]
    };
  }

  function startUpdateStatus(ctx: EventContext, label: string): () => void {
    const frames = ["◐", "◓", "◑", "◒"];
    let seconds = 0;
    let frame = 0;

    ctx.ui.setStatus(UPDATE_STATUS_KEY, `updating: ${label} ${frames[0]} 0s`);

    const timer = setInterval(() => {
      seconds += 1;
      frame = (frame + 1) % frames.length;

      ctx.ui.setStatus(
        UPDATE_STATUS_KEY,
        `updating: ${label} ${frames[frame]} ${seconds}s`
      );
    }, 1000);

    return () => {
      clearInterval(timer);
      ctx.ui.setStatus(UPDATE_STATUS_KEY, undefined);
    };
  }

  function optionLabel(
    option: UpdateOption,
    selected: Map<string, UpdateOption>
  ): string {
    const marker = selected.has(option.id) ? "✓" : "×";
    return `${marker} ${option.label}`;
  }

  function selectedSummary(selected: UpdateOption[]): string {
    if (selected.length === 0) {
      return "Selected: none";
    }

    return ["Selected:", ...selected.map((option) => `- ${option.label}`)].join(
      "\n"
    );
  }

  function buildMenu(selected: Map<string, UpdateOption>): {
    items: string[];
    optionByMenuItem: Map<string, UpdateOption>;
  } {
    const optionByMenuItem = new Map<string, UpdateOption>();

    const optionItems = options.map((option) => {
      const label = optionLabel(option, selected);
      optionByMenuItem.set(label, option);
      return label;
    });

    return {
      items: [...optionItems, RUN_CHOICE, CANCEL_CHOICE],
      optionByMenuItem
    };
  }

  async function chooseUpdates(ctx: EventContext): Promise<UpdateOption[]> {
    const selected = new Map<string, UpdateOption>();

    while (true) {
      const { items, optionByMenuItem } = buildMenu(selected);

      const choice = await ctx.ui.select(
        [
          "What do you want to update?",
          "",
          "Pick an item to toggle it.",
          "✓ = selected, × = not selected",
          "",
          selectedSummary([...selected.values()])
        ].join("\n"),
        items
      );

      if (!choice || choice === CANCEL_CHOICE) {
        return [];
      }

      if (choice === RUN_CHOICE) {
        if (selected.size === 0) {
          ctx.ui.notify("Select at least one update first.", "warning");
          continue;
        }

        return [...selected.values()];
      }

      const option = optionByMenuItem.get(choice);

      if (!option) {
        continue;
      }

      if (selected.has(option.id)) {
        selected.delete(option.id);
        ctx.ui.notify(`Removed: ${option.label}`, "info");
      } else {
        selected.set(option.id, option);
        ctx.ui.notify(`Added: ${option.label}`, "info");
      }
    }
  }

  async function runUpdate(
    option: UpdateOption,
    ctx: EventContext
  ): Promise<boolean> {
    ctx.ui.notify(`Running update:\n\n${option.shell}`, "info");

    const shell = shellCommand(option.shell);
    const stopStatus = startUpdateStatus(ctx, option.label);

    let result: Awaited<ReturnType<typeof pi.exec>> | undefined;

    try {
      result = await pi.exec(shell.command, shell.args, {
        cwd: ctx.cwd
      });
    } catch (error) {
      ctx.ui.notify(
        [
          `Update failed: ${option.label}`,
          "",
          `Command: ${option.shell}`,
          "",
          error instanceof Error ? error.message : String(error)
        ].join("\n"),
        "error"
      );

      return false;
    } finally {
      stopStatus();
    }

    if (!result) {
      ctx.ui.notify(`Update failed: ${option.label}`, "error");
      return false;
    }

    const stdout = result.stdout?.trim() ?? "";
    const stderr = result.stderr?.trim() ?? "";
    const output = [stdout, stderr].filter(Boolean).join("\n\n");

    if (result.code === 0) {
      ctx.ui.notify(
        [`Update completed: ${option.label}`, "", output || "No output."].join(
          "\n"
        ),
        "info"
      );

      return true;
    }

    ctx.ui.notify(
      [
        `Update failed: ${option.label}`,
        "",
        `Command: ${option.shell}`,
        `Exit code: ${result.code}`,
        "",
        output ||
          "No output captured. Try running this command manually in PowerShell."
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

      const summary = selected
        .map((option) => `- ${option.label}\n  ${option.shell}`)
        .join("\n");

      const ok = await ctx.ui.confirm(
        "Confirm updates",
        `The following updates will run:\n\n${summary}\n\nContinue?`
      );

      if (!ok) {
        ctx.ui.notify("Update cancelled.", "info");
        return;
      }

      let passed = 0;
      let failed = 0;

      for (const option of selected) {
        const updateOk = await runUpdate(option, ctx);

        if (updateOk) {
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
