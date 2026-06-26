import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type EventContext = Parameters<Parameters<ExtensionAPI["on"]>[1]>[1];

function rgb(text: string, r: number, g: number, b: number): string {
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
}

function rainbowPi(): string {
  return [
    rgb("π", 255, 80, 80),
    rgb("π", 255, 170, 60),
    rgb("π", 255, 230, 80),
    rgb("π", 80, 220, 120),
    rgb("π", 80, 180, 255),
    rgb("π", 180, 120, 255)
  ].join("");
}

function centerLine(
  left: string,
  title: string,
  right: string,
  width: number
): string {
  const plainLength = title.length + 8;
  const space = Math.max(2, Math.floor((width - plainLength) / 2));

  return `${left} ${" ".repeat(space)}${title}${" ".repeat(space)} ${right}`;
}

export default function (pi: ExtensionAPI): void {
  function applyBrandUI(ctx: EventContext): void {
    if (!ctx.hasUI || ctx.mode !== "tui") return;

    ctx.ui.setTitle("π · PreApexis Pi Kit");

    ctx.ui.setHeader((_tui, theme) => ({
      render(width: number): string[] {
        const left = rainbowPi();
        const right = rainbowPi();

        return [
          "",
          centerLine(
            left,
            theme.bold(theme.fg("accent", "PreApexis Pi Kit")),
            right,
            width
          ),
          theme.fg(
            "dim",
            "                 calm coding · safe changes · clear plans"
          ),
          ""
        ];
      },
      invalidate() {}
    }));

    ctx.ui.setWorkingMessage("Thinking");

    ctx.ui.setWorkingIndicator({
      frames: [
        `${rainbowPi()} thinking`,
        `${rainbowPi()} reading`,
        `${rainbowPi()} planning`,
        `${rainbowPi()} coding`,
        `${rainbowPi()} checking`
      ],
      intervalMs: 250
    });
  }

  pi.on("session_start", async (_event, ctx) => {
    applyBrandUI(ctx);
  });

  pi.registerCommand("brand", {
    description: "Re-apply PreApexis brand UI",
    handler: async (_args, ctx) => {
      applyBrandUI(ctx);
      ctx.ui.notify("PreApexis brand UI applied.", "info");
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
