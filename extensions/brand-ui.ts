import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  let mascotVisible = true;

  const mascot = [
    "╭────────────────────────────────────╮",
    "│  π-bot  🛡️  Safe Team Coding Mode  │",
    "│                                    │",
    "│        /\\_/\\\\                     │",
    "│       ( o.o )   I guard the repo   │",
    "│        > ^ <                      │",
    "╰────────────────────────────────────╯"
  ];

  function showMascot(ctx: any) {
    if (!ctx.hasUI || !mascotVisible) return;

    ctx.ui.setTitle("π-bot — Safe Team Coding Agent");

    ctx.ui.setWidget("team-mascot", mascot, { placement: "aboveEditor" });

    ctx.ui.setStatus("team-agent", "π-bot · safe mode · team rules active");

    ctx.ui.setWorkingMessage("π-bot is thinking through the safest change...");

    ctx.ui.setWorkingIndicator({
      frames: ["π", "π·", "π··", "π···"],
      intervalMs: 180
    });
  }

  pi.on("session_start", async (_event, ctx) => {
    showMascot(ctx);
  });

  pi.registerCommand("mascot", {
    description: "Toggle the π-bot mascot",
    handler: async (_args, ctx) => {
      mascotVisible = !mascotVisible;

      if (mascotVisible) {
        showMascot(ctx);
        ctx.ui.notify("π-bot mascot enabled", "info");
      } else {
        ctx.ui.setWidget("team-mascot", undefined);
        ctx.ui.notify("π-bot mascot hidden", "info");
      }
    }
  });
}
