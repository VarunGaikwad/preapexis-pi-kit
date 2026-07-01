// cSpell:words preapexis
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { EventContext } from "./lib/pi-helpers.js";

type UpdateOption = {
  id: string;
  label: string;
  shell: string;
};

type ShellCommand = {
  command: string;
  args: string[];
};

type UpdateChoice = {
  label: string;
  options: UpdateOption[];
};

const UPDATE_STATUS_KEY = "preapexis-update-status";

const UPDATE_OPTIONS: UpdateOption[] = [
  {
    id: "pi",
    label: "Update Pi",
    shell: "pi update"
  },
  {
    id: "extensions",
    label: "Update Pi packages/extensions",
    shell: "pi update --extensions"
  }
];

const UPDATE_CHOICES: UpdateChoice[] = [
  {
    label: "Update Pi and packages/extensions",
    options: [...UPDATE_OPTIONS]
  },
  {
    label: "Update Pi only",
    options: [UPDATE_OPTIONS[0]]
  },
  {
    label: "Update packages/extensions only",
    options: [UPDATE_OPTIONS[1]]
  },
  {
    label: "Cancel",
    options: []
  }
];

export default function (pi: ExtensionAPI): void {

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

  async function chooseUpdates(ctx: EventContext): Promise<UpdateOption[]> {
    const labels = UPDATE_CHOICES.map((choice) => choice.label);

    const choice = await ctx.ui.select(
      "What do you want to update?",
      labels
    );

    if (!choice) {
      return [];
    }

    const selected = UPDATE_CHOICES.find((item) => item.label === choice);
    return selected?.options ?? [];
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
    description: "Update Pi or installed Pi packages/extensions",
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
