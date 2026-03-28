import type { ApiProvider } from "../types";

interface AnalyzeRequestPayload {
  provider: ApiProvider;
  base64Image: string;
  prompt: string;
}

interface UpstreamErrorShape {
  error?: { message?: string } | string;
  message?: string;
}

export class UpstreamApiError extends Error {
  status: number;
  details?: string;

  constructor(status: number, message: string, details?: string) {
    super(message);
    this.name = "UpstreamApiError";
    this.status = status;
    this.details = details;
  }
}

export function parseAnalyzeRequestPayload(body: unknown): AnalyzeRequestPayload {
  const payload = body as Partial<AnalyzeRequestPayload> | null | undefined;

  if (!payload?.provider || !payload.base64Image || !payload.prompt) {
    throw new Error("Missing parameters");
  }

  return {
    provider: payload.provider,
    base64Image: payload.base64Image,
    prompt: payload.prompt,
  };
}

function resolveBaseUrl(provider: ApiProvider): string {
  const baseUrl = provider.baseUrl?.trim();

  if (baseUrl) {
    return baseUrl.replace(/\/+$/, "");
  }

  if (provider.type === "OpenAI") {
    return "https://api.openai.com/v1";
  }

  if (provider.type === "Moonshot") {
    return "https://api.moonshot.cn/v1";
  }

  throw new Error("API Base URL 不能为空");
}

function extractErrorMessage(bodyText: string): { message: string; details?: string } {
  if (!bodyText) {
    return { message: "上游 API 返回空错误响应" };
  }

  try {
    const parsed = JSON.parse(bodyText) as UpstreamErrorShape;
    const rawMessage =
      typeof parsed.error === "string"
        ? parsed.error
        : parsed.error?.message || parsed.message;

    return {
      message: typeof rawMessage === "string" && rawMessage.trim() ? rawMessage : bodyText,
      details: bodyText,
    };
  } catch {
    return { message: bodyText };
  }
}

function buildImageUrl(base64Image: string): string {
  return base64Image.startsWith("data:")
    ? base64Image
    : `data:image/jpeg;base64,${base64Image}`;
}

function extractJsonPayload(content: string): string {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : content;
}

export async function proxyAnalyzeRequest(
  payload: AnalyzeRequestPayload,
  fetchImpl: typeof fetch = fetch,
) {
  const { provider, base64Image, prompt } = payload;

  if (!provider.apiKey?.trim()) {
    throw new Error("API Key 不能为空");
  }

  if (!provider.model?.trim()) {
    throw new Error("Model 不能为空");
  }

  const baseUrl = resolveBaseUrl(provider);
  const response = await fetchImpl(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: buildImageUrl(base64Image),
              },
            },
          ],
        },
      ],
      ...(provider.type === "OpenAI" ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    const { message, details } = extractErrorMessage(responseText);
    throw new UpstreamApiError(response.status, `上游 API 返回 ${response.status}: ${message}`, details);
  }

  let parsedResponse: any;
  try {
    parsedResponse = JSON.parse(responseText);
  } catch {
    throw new Error("上游 API 返回了非 JSON 响应");
  }

  const content = parsedResponse?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("AI 返回内容为空");
  }

  try {
    return JSON.parse(extractJsonPayload(content));
  } catch {
    throw new Error("AI 返回格式错误，无法解析为 JSON");
  }
}
