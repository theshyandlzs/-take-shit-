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

    if (provider.type === 'Moonshot') {
      const base64Data = base64Image.split(',')[1] || base64Image;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const file = new File([bytes], 'image.jpg', { type: 'image/jpeg' });
      
      const fileObject = await client.files.create({
        file: file,
        purpose: "file-extract"
      });

      const fileContentResponse = await client.files.content(fileObject.id);
      const fileContent = await fileContentResponse.text();

      const response = await client.chat.completions.create({
        model: provider.model,
        messages: [
          {
            role: "system",
            content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。",
          },
          {
            role: "system",
            content: fileContent,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.6,
      });
      content = response.choices[0].message.content;
    } else {
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
    }

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
