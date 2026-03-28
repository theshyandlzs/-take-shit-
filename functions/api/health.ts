export async function onRequestGet(context) {
  return new Response(JSON.stringify({ 
    status: "ok", 
    platform: "Cloudflare Workers",
    timestamp: new Date().toISOString()
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
