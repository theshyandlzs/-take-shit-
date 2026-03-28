import { parseAnalyzeRequestPayload, proxyAnalyzeRequest, UpstreamApiError } from "./src/server/analyzeProxy";

interface WorkerEnv {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function handleAnalyze(request: Request) {
  try {
    const payload = parseAnalyzeRequestPayload(await request.json());
    const result = await proxyAnalyzeRequest(payload);
    return jsonResponse(result);
  } catch (error: any) {
    return jsonResponse(
      {
        error: error.message || "AI 分析失败",
        details: error instanceof UpstreamApiError ? error.details : error.stack || String(error),
      },
      error instanceof UpstreamApiError ? error.status : 500,
    );
  }
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return jsonResponse({
        status: "ok",
        platform: "Cloudflare Workers",
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname === "/api/analyze") {
      if (request.method !== "POST") {
        return jsonResponse({ error: "Method Not Allowed" }, 405);
      }

      return handleAnalyze(request);
    }

    return env.ASSETS.fetch(request);
  },
};
