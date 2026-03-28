import { parseAnalyzeRequestPayload, proxyAnalyzeRequest, UpstreamApiError } from "../../src/server/analyzeProxy";

export async function onRequestPost(context) {
  const { request } = context;
  
  try {
    const body = await request.json();
    const payload = parseAnalyzeRequestPayload(body);
    const result = await proxyAnalyzeRequest(payload);
    
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: error.message || "AI 分析失败",
      details: error instanceof UpstreamApiError ? error.details : error.stack || error
    }), {
      status: error instanceof UpstreamApiError ? error.status : 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
