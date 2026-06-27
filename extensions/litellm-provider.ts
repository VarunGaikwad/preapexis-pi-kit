// cSpell:words litellm preapexis deepseek
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type LiteLlmModelInfo = {
  model_name?: string;
  model_info?: {
    id?: string;
    name?: string;
    display_name?: string;
    max_tokens?: number;
    max_input_tokens?: number;
    context_window?: number;
    input_cost_per_token?: number;
    output_cost_per_token?: number;
    supports_vision?: boolean;
  };
};

type OpenAiModel = {
  id?: string;
};

type ModelPayload = {
  data?: Array<LiteLlmModelInfo | OpenAiModel>;
};

type PiModel = {
  id: string;
  name: string;
  reasoning: boolean;
  input: Array<"text" | "image">;
  cost: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
  };
  contextWindow: number;
  maxTokens: number;
};

const PROVIDER_ID = "litellm";
const DEFAULT_BASE_URL = "http://localhost:4000/v1";

export default async function (pi: ExtensionAPI): Promise<void> {
  const baseUrl = normalizeBaseUrl(
    process.env.LITELLM_BASE_URL ?? DEFAULT_BASE_URL
  );

  async function registerLiteLlmProvider(): Promise<number> {
    const models = await discoverModels(baseUrl);

    if (models.length === 0) {
      return 0;
    }

    pi.registerProvider(PROVIDER_ID, {
      name: "LiteLLM",
      baseUrl,
      apiKey: "$LITELLM_API_KEY",
      api: "openai-completions",
      models
    });

    return models.length;
  }

  try {
    const count = await registerLiteLlmProvider();

    if (count > 0) {
      console.log(`[litellm] Registered ${count} models from ${baseUrl}`);
    } else {
      console.log("[litellm] No models found. Provider was not registered.");
    }
  } catch (error) {
    console.log(
      [
        "[litellm] Provider skipped.",
        error instanceof Error ? error.message : String(error),
        "Start LiteLLM and run /litellm-refresh."
      ].join("\n")
    );
  }

  pi.registerCommand("litellm-refresh", {
    description: "Refresh LiteLLM models from the LiteLLM proxy",
    handler: async (_args, ctx) => {
      try {
        const count = await registerLiteLlmProvider();

        if (count === 0) {
          ctx.ui.notify(
            [
              "LiteLLM refresh finished, but no models were found.",
              "",
              `Base URL: ${baseUrl}`,
              "",
              "Make sure LiteLLM is running."
            ].join("\n"),
            "warning"
          );

          return;
        }

        ctx.ui.notify(
          [
            "LiteLLM models refreshed.",
            "",
            `Models found: ${count}`,
            `Base URL: ${baseUrl}`,
            "",
            "Run /model to select a LiteLLM model."
          ].join("\n"),
          "info"
        );
      } catch (error) {
        ctx.ui.notify(
          [
            "LiteLLM model refresh failed.",
            "",
            error instanceof Error ? error.message : String(error)
          ].join("\n"),
          "error"
        );
      }
    }
  });
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function getProxyRoot(baseUrl: string): string {
  return baseUrl.endsWith("/v1") ? baseUrl.slice(0, -3) : baseUrl;
}

async function discoverModels(baseUrl: string): Promise<PiModel[]> {
  const proxyRoot = getProxyRoot(baseUrl);

  const endpoints = [
    `${proxyRoot}/v1/model/info`,
    `${proxyRoot}/model/info`,
    `${baseUrl}/models`
  ];

  for (const endpoint of endpoints) {
    try {
      const payload = await fetchModelPayload(endpoint);
      const models = payloadToPiModels(payload);

      if (models.length > 0) {
        return models;
      }
    } catch {
      // Try next endpoint.
    }
  }

  return getFallbackModels();
}

async function fetchModelPayload(url: string): Promise<ModelPayload> {
  const headers: Record<string, string> = {
    accept: "application/json"
  };

  const apiKey = process.env.LITELLM_API_KEY;

  if (apiKey) {
    headers.authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers
  });

  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }

  return (await response.json()) as ModelPayload;
}

function payloadToPiModels(payload: ModelPayload): PiModel[] {
  const data = Array.isArray(payload.data) ? payload.data : [];
  const seen = new Set<string>();
  const models: PiModel[] = [];

  for (const item of data) {
    const model = modelFromPayloadItem(item);

    if (!model) continue;
    if (seen.has(model.id)) continue;

    seen.add(model.id);
    models.push(model);
  }

  return models.sort((a, b) => a.id.localeCompare(b.id));
}

function modelFromPayloadItem(
  item: LiteLlmModelInfo | OpenAiModel
): PiModel | undefined {
  const modelInfo = "model_info" in item ? item.model_info : undefined;

  const id =
    "model_name" in item && item.model_name
      ? item.model_name
      : "id" in item && item.id
        ? item.id
        : modelInfo?.id;

  if (!id) return undefined;

  const name = modelInfo?.display_name ?? modelInfo?.name ?? id;

  const contextWindow =
    modelInfo?.context_window ?? modelInfo?.max_input_tokens ?? 128000;

  const maxTokens = modelInfo?.max_tokens ?? 4096;

  const supportsVision =
    modelInfo?.supports_vision === true || looksLikeVisionModel(id);

  return {
    id,
    name,
    reasoning: looksLikeReasoningModel(id),
    input: supportsVision ? ["text", "image"] : ["text"],
    cost: {
      input: costPerMillion(modelInfo?.input_cost_per_token),
      output: costPerMillion(modelInfo?.output_cost_per_token),
      cacheRead: 0,
      cacheWrite: 0
    },
    contextWindow,
    maxTokens
  };
}

function costPerMillion(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return value * 1_000_000;
}

function looksLikeVisionModel(id: string): boolean {
  const lower = id.toLowerCase();

  return (
    lower.includes("vision") ||
    lower.includes("vl") ||
    lower.includes("gpt-4o") ||
    lower.includes("gemini") ||
    lower.includes("claude")
  );
}

function looksLikeReasoningModel(id: string): boolean {
  const lower = id.toLowerCase();

  return (
    lower.includes("reason") ||
    lower.includes("thinking") ||
    lower.includes("o1") ||
    lower.includes("o3") ||
    lower.includes("o4") ||
    lower.includes("r1") ||
    lower.includes("deepseek")
  );
}

function getFallbackModels(): PiModel[] {
  const raw = process.env.LITELLM_MODELS;

  if (!raw?.trim()) {
    return [];
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((id) => ({
      id,
      name: id,
      reasoning: looksLikeReasoningModel(id),
      input: looksLikeVisionModel(id) ? ["text", "image"] : ["text"],
      cost: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0
      },
      contextWindow: 128000,
      maxTokens: 4096
    }));
}
