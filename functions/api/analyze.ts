import OpenAI from "openai";

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { provider, base64Image, prompt } = body;

    if (!provider || !base64Image || !prompt) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const client = new OpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.baseUrl || undefined,
    });

    let content: string | null = null;

    const response = await client.chat.completions.create({
      model: provider.model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: provider.type === 'OpenAI' ? { type: "json_object" } : undefined
    });
    content = response.choices[0].message.content;

    if (!content) throw new Error("AI 返回内容为空");
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    
    return new Response(jsonStr, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: error.message || "AI 分析失败",
      details: error.stack || error
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
