import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type EventContext = Parameters<Parameters<ExtensionAPI["on"]>[1]>[1];

const MINI_MASCOT = [
  "╭────────────────────────────╮",
  "│ π-AGENT · BUG INVADER      │",
  "│   ▄ ▄   ◉ ─── ◉   ▄ ▄      │",
  "│  ▀███▀  BUG HUNTING  ▀███▀ │",
  "│ STATUS: REPO CLEAN         │",
  "╰────────────────────────────╯"
];

const WORKING_INDICATOR = {
  frames: [
    "π scanning ·",
    "π scanning ··",
    "π scanning ···",
    "π fixing ·",
    "π fixing ··",
    "π fixing ···"
  ],
  intervalMs: 250
};

export default function (pi: ExtensionAPI): void {
  let mascotVisible = true;

  function showMascot(ctx: EventContext): void {
    if (!ctx.hasUI || !mascotVisible) return;

    ctx.ui.setTitle("π-AGENT · BUG INVADER");

    ctx.ui.setWidget("team-mascot", MINI_MASCOT, {
      placement: "aboveEditor"
    });

    ctx.ui.setWorkingIndicator(WORKING_INDICATOR);
  }

  function hideMascot(ctx: EventContext): void {
    if (!ctx.hasUI) return;

    ctx.ui.setWidget("team-mascot", undefined);
  }

  pi.on("session_start", async (_event, ctx) => {
    showMascot(ctx);
  });

  pi.on("session_end", async (_event, ctx) => {
    hideMascot(ctx);
  });

  pi.registerCommand("mascot", {
    description: "Toggle the π-AGENT Bug Invader mascot",
    handler: async (_args, ctx) => {
      mascotVisible = !mascotVisible;

      if (mascotVisible) {
        showMascot(ctx);
        ctx.ui.notify("π-AGENT mascot enabled", "info");
      } else {
        hideMascot(ctx);
        ctx.ui.notify("π-AGENT mascot hidden", "info");
      }
    }
  });
}
