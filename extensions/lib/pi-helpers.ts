import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export type EventContext = Parameters<Parameters<ExtensionAPI["on"]>[1]>[1];

export type InputRecord = Record<string, unknown>;

export function inputRecord(input: unknown): InputRecord {
  if (input && typeof input === "object") {
    return input as InputRecord;
  }

  return {};
}

export type ToolDecision =
  | {
      block: true;
      reason: string;
    }
  | undefined;

/**
 * Ask the user to confirm an action via UI, or block if no UI is available.
 * Returns a ToolDecision — either a block (if denied or no-UI) or undefined (approved).
 */
export async function confirmOrBlock(
  ctx: EventContext,
  title: string,
  message: string,
  options: {
    noUiReason?: string;
    blockedReason?: string;
  } = {}
): Promise<ToolDecision> {
  if (!ctx.hasUI) {
    return {
      block: true,
      reason: options.noUiReason ?? "No UI available for confirmation."
    };
  }

  const ok = await ctx.ui.confirm(title, message);

  if (!ok) {
    return {
      block: true,
      reason: options.blockedReason ?? "Action cancelled by user."
    };
  }

  return undefined;
}
