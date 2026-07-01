import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { EventContext } from "./lib/pi-helpers.js";

type AssistantMessageLike = {
  role: "assistant";
  usage?: {
    input?: number;
    output?: number;
    cacheRead?: number;
    cacheWrite?: number;
    cost?: {
      total?: number;
    };
  };
};
type UsageTotals = {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost: number;
};

export default function (pi: ExtensionAPI): void {
  const STATUS_KEY = "usage-tracker";
  let baseline: UsageTotals = emptyTotals();

  function emptyTotals(): UsageTotals {
    return {
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
      totalTokens: 0,
      cost: 0
    };
  }

  function formatNumber(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    return String(value);
  }

  function formatCost(value: number): string {
    if (value < 0.001) return "$0.000";
    return `$${value.toFixed(3)}`;
  }

  function subtractTotals(
    current: UsageTotals,
    base: UsageTotals
  ): UsageTotals {
    return {
      input: Math.max(0, current.input - base.input),
      output: Math.max(0, current.output - base.output),
      cacheRead: Math.max(0, current.cacheRead - base.cacheRead),
      cacheWrite: Math.max(0, current.cacheWrite - base.cacheWrite),
      totalTokens: Math.max(0, current.totalTokens - base.totalTokens),
      cost: Math.max(0, current.cost - base.cost)
    };
  }

  function getUsageTotals(ctx: EventContext): UsageTotals {
    const totals = emptyTotals();

    for (const entry of ctx.sessionManager.getBranch()) {
      if (entry.type !== "message") continue;
      if (entry.message.role !== "assistant") continue;

      const message = entry.message as AssistantMessageLike;
      const usage = message.usage;

      if (!usage) continue;

      totals.input += usage.input ?? 0;
      totals.output += usage.output ?? 0;
      totals.cacheRead += usage.cacheRead ?? 0;
      totals.cacheWrite += usage.cacheWrite ?? 0;
      totals.cost += usage.cost?.total ?? 0;
    }

    totals.totalTokens =
      totals.input + totals.output + totals.cacheRead + totals.cacheWrite;

    return totals;
  }

  function updateStatus(ctx: EventContext): void {
    if (!ctx.hasUI) return;

    const totals = subtractTotals(getUsageTotals(ctx), baseline);

    ctx.ui.setStatus(
      STATUS_KEY,
      `usage: ${formatNumber(totals.totalTokens)} ${formatCost(totals.cost)}`
    );
  }

  function buildUsageReport(ctx: EventContext): string {
    const totals = subtractTotals(getUsageTotals(ctx), baseline);

    return [
      "Token and price usage",
      "",
      `Input tokens: ${totals.input.toLocaleString()}`,
      `Output tokens: ${totals.output.toLocaleString()}`,
      `Cache read tokens: ${totals.cacheRead.toLocaleString()}`,
      `Cache write tokens: ${totals.cacheWrite.toLocaleString()}`,
      `Total tokens: ${totals.totalTokens.toLocaleString()}`,
      `Estimated cost: ${formatCost(totals.cost)}`,
      "",
      `Model: ${ctx.model?.id ?? "unknown"}`
    ].join("\n");
  }

  pi.on("session_start", async (_event, ctx) => {
    baseline = emptyTotals();
    updateStatus(ctx);
  });

  pi.on("message_end", async (event, ctx) => {
    if (event.message.role === "assistant") {
      updateStatus(ctx);
    }
  });

  pi.on("model_select", async (_event, ctx) => {
    updateStatus(ctx);
  });

  pi.registerCommand("usage", {
    description: "Show token and price usage for this session",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      ctx.ui.notify(buildUsageReport(ctx), "info");
      updateStatus(ctx);
    }
  });

  pi.registerCommand("usage-reset", {
    description: "Reset token and price tracker baseline",
    handler: async (_args, ctx) => {
      baseline = getUsageTotals(ctx);

      if (ctx.hasUI) {
        ctx.ui.notify("Usage tracker reset for this session.", "info");
        updateStatus(ctx);
      }
    }
  });
}
