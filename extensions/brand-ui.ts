import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  let mascotVisible = true;

  // FPS Operator — ASCII soldier with helmet, visor, and rifle
  const mascot = [
    "╔══════════════════════════════════════════╗",
    "║   π-OPS  ☠  TACTICAL CODING UNIT  ☠    ║",
    "╠══════════════════════════════════════════╣",
    "║        .-------.                        ║",
    "║       /  [===]  \\   OPERATOR  π-01     ║",
    "║      |  ( x x )  |  ─────────────────  ║",
    "║       \\ '─────' /   CLASS  : SENTINEL  ║",
    "║        |  | |  |    STATUS : DEPLOYED  ║",
    "║      __|__|_|__|__  REPO   : SECURED   ║",
    "║  ___/  SENTINEL  \\___                  ║",
    "║ |  ██  π-CODING  ██  |  [▓▓▓▓▓▓░░] 80%║",
    "║  ───────────────────  AMMO : COMMITS   ║",
    "║   ══╡ M4-EDITOR ╞══  KILLS : 0 BUGS   ║",
    "╚══════════════════════════════════════════╝",
  ];

  function showMascot(ctx: any) {
    if (!ctx.hasUI || !mascotVisible) return;

    ctx.ui.setTitle("π-OPS — Tactical Coding Unit · SENTINEL π-01");

    ctx.ui.setWidget("team-mascot", mascot, { placement: "aboveEditor" });

    ctx.ui.setStatus(
      "team-agent",
      "☠ π-OPS · SENTINEL π-01 · TACTICAL MODE ACTIVE · REPO SECURED"
    );

    ctx.ui.setWorkingIndicator({
      frames: [
        "[ SCANNING·· ]",
        "[ SCANNING·· ]",
        "[ ·AIMING··· ]",
        "[ ·AIMING··· ]",
        "[ ··FIRING·· ]",
        "[ ··FIRING·· ]",
        "[ ···RELOADING ]",
        "[ ···RELOADING ]",
      ],
      intervalMs: 220,
    });
  }

  pi.on("session_start", async (_event, ctx) => {
    showMascot(ctx);
  });

  pi.registerCommand("mascot", {
    description: "Toggle the π-OPS FPS operator mascot",
    handler: async (_args, ctx) => {
      mascotVisible = !mascotVisible;

      if (mascotVisible) {
        showMascot(ctx);
        ctx.ui.notify("☠ π-OPS OPERATOR DEPLOYED — SENTINEL π-01 ON DUTY", "info");
      } else {
        ctx.ui.setWidget("team-mascot", undefined);
        ctx.ui.setStatus("team-agent", undefined);
        ctx.ui.notify("π-OPS OPERATOR STOOD DOWN — GHOST MODE", "info");
      }
    },
  });
}
