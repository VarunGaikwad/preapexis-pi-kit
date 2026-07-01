import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { EventContext } from "./lib/pi-helpers.js";

const PREAPEXIS_ART = [
  "██████╗ ██████╗ ███████╗ █████╗ ██████╗ ███████╗██╗  ██╗██╗███████╗",
  "██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝╚██╗██╔╝██║██╔════╝",
  "██████╔╝██████╔╝█████╗  ███████║██████╔╝█████╗   ╚███╔╝ ██║███████╗",
  "██╔═══╝ ██╔══██╗██╔══╝  ██╔══██║██╔═══╝ ██╔══╝   ██╔██╗ ██║╚════██║",
  "██║     ██║  ██║███████╗██║  ██║██║     ███████╗██╔╝ ██╗██║███████║",
  "╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝"
];

const COMPACT_HEADER = "π  PreApeXis  π";

const RAINBOW = [
  [255, 90, 90],
  [255, 170, 70],
  [255, 230, 90],
  [90, 220, 130],
  [90, 190, 255],
  [180, 130, 255]
] as const;

function rgb(text: string, r: number, g: number, b: number): string {
  return `\x1b[1;38;2;${r};${g};${b}m${text}\x1b[0m`;
}

function rainbowText(text: string): string {
  let colorIndex = 0;

  return [...text]
    .map((char) => {
      if (char === " ") return char;

      const [r, g, b] = RAINBOW[colorIndex % RAINBOW.length];
      colorIndex += 1;

      return rgb(char, r, g, b);
    })
    .join("");
}

function rainbowPi(): string {
  return rainbowText("π");
}

export default function (pi: ExtensionAPI): void {
  function applyBrandUI(ctx: EventContext): void {
    if (!ctx.hasUI || ctx.mode !== "tui") return;

    ctx.ui.setTitle("PreApeXis");

    ctx.ui.setHeader((_tui, theme) => ({
      render(width: number): string[] {
        if (width < 90) {
          return [
            rainbowText(COMPACT_HEADER),
            theme.fg("dim", "safe changes · clear plans")
          ];
        }

        return [
          ...PREAPEXIS_ART.map((line) => rainbowText(line)),
          theme.fg("dim", "safe changes · clear plans")
        ];
      },
      invalidate() {}
    }));

    ctx.ui.setWorkingMessage("Thinking");

    ctx.ui.setWorkingIndicator({
      frames: [
        rainbowPi(),
        `${rainbowPi()}·`,
        `${rainbowPi()}··`,
        `${rainbowPi()}···`
      ],
      intervalMs: 300
    });
  }

  pi.on("session_start", async (_event, ctx) => {
    applyBrandUI(ctx);
  });

  pi.registerCommand("brand", {
    description: "Re-apply PreApeXis brand UI",
    handler: async (_args, ctx) => {
      applyBrandUI(ctx);
      ctx.ui.notify("PreApeXis brand UI applied.", "info");
    }
  });

  pi.registerCommand("brand-reset", {
    description: "Restore default Pi header and working indicator",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;

      ctx.ui.setHeader(undefined);
      ctx.ui.setWorkingMessage();
      ctx.ui.setWorkingIndicator();
      ctx.ui.notify("Default Pi UI restored.", "info");
    }
  });
}
