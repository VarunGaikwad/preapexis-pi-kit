import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Derive the context type from the API's own on() signature so we never import
// a non-existent named export again.
type EventContext = Parameters<Parameters<ExtensionAPI["on"]>[1]>[1];

// ─── Mascot frames ────────────────────────────────────────────────────────────
//  Each line must be exactly 44 chars between the ║ delimiters.
//  Use this ruler to check: 1234567890123456789012345678901234567890123
//  Frames alternate to give a 2-frame invader flap animation.

const INNER_WIDTH = 44;

function pad(s: string): string {
  // Pad a string to INNER_WIDTH with trailing spaces
  const stripped = s; // already correct width or we fix it below
  if (stripped.length >= INNER_WIDTH) return stripped.slice(0, INNER_WIDTH);
  return stripped + " ".repeat(INNER_WIDTH - stripped.length);
}

function row(s: string): string {
  return `║${pad(s)}║`;
}

const DIVIDER = `╠${"═".repeat(INNER_WIDTH)}╣`;
const TOP = `╔${"═".repeat(INNER_WIDTH)}╗`;
const BOTTOM = `╚${"═".repeat(INNER_WIDTH)}╝`;

// Frame A — arms down
const frameA: string[] = [
  TOP,
  row("  π-AGENT  ·  ARCADE EDITION  ·  INSERT π  "),
  DIVIDER,
  row("                                            "),
  row("     ▀▄ ▀▄   B U G   I N V A D E R   ▄▀ ▄▀ "),
  row("                                            "),
  row("          ▄   ▄▄▄▄▄▄▄▄▄▄▄   ▄             "),
  row("         ▄█▄ █ ◉  ───  ◉ █ ▄█▄            "),
  row("        ▄███▄█▄▄▄▄▄▄▄▄▄▄▄█▄███▄           "),
  row("        █ ██ ████████████ ██ █            "),
  row("        ▀▄██▄████████████▄██▄▀            "),
  row("           ▀▀  ▀▀    ▀▀  ▀▀               "),
  row("                                            "),
  DIVIDER,
  row("  SCORE  00000000    LEVEL  01    LIVES ███ "),
  row("  STATUS  HUNTING BUGS · REPO CLEAN         "),
  row("  TARGET  0 BUGS REMAINING · COMMIT READY   "),
  BOTTOM
];

// Frame B — arms up
const frameB: string[] = [
  TOP,
  row("  π-AGENT  ·  ARCADE EDITION  ·  INSERT π  "),
  DIVIDER,
  row("                                            "),
  row("  ▄▀ ▄▀     B U G   I N V A D E R   ▀▄ ▀▄  "),
  row("                                            "),
  row("     ▄   ▄▄▄▄▄▄▄▄▄▄▄   ▄                  "),
  row("    ▄█▄ █ ◉  ───  ◉ █ ▄█▄                 "),
  row("   ▄███▄█▄▄▄▄▄▄▄▄▄▄▄█▄███▄                "),
  row("   █ ██ ████████████ ██ █                 "),
  row("   ▀▄██▄████████████▄██▄▀                 "),
  row("      ▀▀  ▀▀    ▀▀  ▀▀                    "),
  row("                                            "),
  DIVIDER,
  row("  SCORE  00000000    LEVEL  01    LIVES ███ "),
  row("  STATUS  HUNTING BUGS · REPO CLEAN         "),
  row("  TARGET  0 BUGS REMAINING · COMMIT READY   "),
  BOTTOM
];

const MASCOT_FRAMES = [frameA, frameB];

// ─── Working indicator ────────────────────────────────────────────────────────

const WORKING_INDICATOR = {
  frames: [
    "[ ▓░░░░░░░  SCANNING.. ]",
    "[ ▓▓░░░░░░  SCANNING.. ]",
    "[ ▓▓▓░░░░░  LOCKED ON. ]",
    "[ ▓▓▓▓░░░░  LOCKED ON. ]",
    "[ ▓▓▓▓▓░░░  FIRING.... ]",
    "[ ▓▓▓▓▓▓░░  FIRING.... ]",
    "[ ▓▓▓▓▓▓▓░  BUG ZAPPED ]",
    "[ ▓▓▓▓▓▓▓▓  BUG ZAPPED ]"
  ],
  intervalMs: 200
};

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI): void {
  let mascotVisible = true;
  let frameIndex = 0;
  let animInterval: ReturnType<typeof setInterval> | null = null;

  function startAnimation(ctx: EventContext): void {
    if (animInterval) return;
    animInterval = setInterval(() => {
      frameIndex = (frameIndex + 1) % MASCOT_FRAMES.length;
      ctx.ui.setWidget("team-mascot", MASCOT_FRAMES[frameIndex], {
        placement: "aboveEditor"
      });
    }, 600);
  }

  function stopAnimation(): void {
    if (animInterval) {
      clearInterval(animInterval);
      animInterval = null;
    }
  }

  function showMascot(ctx: EventContext): void {
    if (!ctx.hasUI || !mascotVisible) return;

    ctx.ui.setTitle("π-AGENT · ARCADE EDITION · BUG INVADER");

    ctx.ui.setWidget("team-mascot", MASCOT_FRAMES[frameIndex], {
      placement: "aboveEditor"
    });

    ctx.ui.setStatus(
      "team-agent",
      "◉ π-AGENT · BUG INVADER · HUNTING · REPO CLEAN"
    );

    ctx.ui.setWorkingIndicator(WORKING_INDICATOR);

    startAnimation(ctx);
  }

  function hideMascot(ctx: EventContext): void {
    stopAnimation();
    ctx.ui.setWidget("team-mascot", undefined);
    ctx.ui.setStatus("team-agent", undefined);
  }

  pi.on("session_start", async (_event, ctx) => {
    showMascot(ctx);
  });

  pi.on("session_end", async (_event, ctx) => {
    hideMascot(ctx);
  });

  pi.registerCommand("mascot", {
    description: "Toggle the π-AGENT Bug Invader arcade mascot",
    handler: async (_args, ctx) => {
      mascotVisible = !mascotVisible;

      if (mascotVisible) {
        showMascot(ctx);
        ctx.ui.notify("◉ BUG INVADER DEPLOYED — INSERT π TO CONTINUE", "info");
      } else {
        hideMascot(ctx);
        ctx.ui.notify("GAME OVER · π-AGENT STOOD DOWN · PRESS START", "info");
      }
    }
  });
}
