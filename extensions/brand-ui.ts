import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const HEADER = ["π-AGENT · BUG INVADER", "◉ hunting bugs · repo clean"];

export default function (pi: ExtensionAPI): void {
  pi.on("session_start", async (_event, ctx) => {
    if (ctx.mode !== "tui") return;

    ctx.ui.setTitle("π-AGENT · BUG INVADER");

    ctx.ui.setHeader((_tui, theme) => ({
      render(_width: number): string[] {
        return [theme.fg("accent", HEADER[0]), theme.fg("dim", HEADER[1])];
      },
      invalidate() {}
    }));

    ctx.ui.setWorkingIndicator({
      frames: [
        "π scanning ·",
        "π scanning ··",
        "π scanning ···",
        "π fixing ·",
        "π fixing ··",
        "π fixing ···"
      ],
      intervalMs: 250
    });
  });

  pi.registerCommand("builtin-header", {
    description: "Restore the default Pi header",
    handler: async (_args, ctx) => {
      ctx.ui.setHeader(undefined);
      ctx.ui.notify("Default Pi header restored", "info");
    }
  });
}
