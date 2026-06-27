import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type EventContext = Parameters<Parameters<ExtensionAPI["on"]>[1]>[1];

type SoundName = "start" | "done" | "need-input" | "error";

export default function (pi: ExtensionAPI): void {
  let enabled = true;

  function bell(count = 1): void {
    if (!enabled) return;

    for (let i = 0; i < count; i += 1) {
      setTimeout(() => {
        process.stdout.write("\u0007");
      }, i * 150);
    }
  }

  function play(sound: SoundName): void {
    if (sound === "start") bell(1);
    if (sound === "done") bell(2);
    if (sound === "need-input") bell(3);
    if (sound === "error") bell(4);
  }

  pi.on("before_agent_start", async () => {
    play("start");
  });

  pi.on("agent_end", async () => {
    play("done");
  });

  pi.on("tool_call", async (event) => {
    if (event.toolName === "bash") {
      const command = String(event.input.command ?? "");

      if (
        /\bnpm\s+install\b/i.test(command) ||
        /\bnpm\s+update\b/i.test(command) ||
        /\bgit\s+reset\s+--hard\b/i.test(command)
      ) {
        play("need-input");
      }
    }
  });

  pi.on("tool_result", async (event) => {
    const maybeResult = event as {
      result?: {
        code?: number;
      };
    };

    if (
      typeof maybeResult.result?.code === "number" &&
      maybeResult.result.code !== 0
    ) {
      play("error");
    }
  });

  pi.registerCommand("sound-on", {
    description: "Enable PreApeXis sound cues",
    handler: async (_args, ctx: EventContext) => {
      enabled = true;
      play("done");
      ctx.ui.notify("Sound cues enabled.", "info");
    }
  });

  pi.registerCommand("sound-off", {
    description: "Disable PreApeXis sound cues",
    handler: async (_args, ctx: EventContext) => {
      enabled = false;
      ctx.ui.notify("Sound cues disabled.", "info");
    }
  });

  pi.registerCommand("sound-test", {
    description: "Test PreApeXis sound cues",
    handler: async (_args, ctx: EventContext) => {
      play("need-input");
      ctx.ui.notify("Sound test played.", "info");
    }
  });
}
