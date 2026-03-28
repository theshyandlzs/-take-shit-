import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import OpenAI from "openai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", environment: process.env.NODE_ENV || 'development' });
  });

  // API Proxy for AI Analysis to avoid CORS issues
  app.post("/api/analyze", async (req, res) => {
    console.log("Received AI analysis request for provider:", req.body?.provider?.type);
    const { provider, base64Image, prompt } = req.body;

    if (!provider || !base64Image || !prompt) {
      console.error("Missing parameters in request body");
      return res.status(400).json({ error: "Missing parameters" });
    }

    try {
      console.log(`Calling ${provider.type} API at ${provider.baseUrl || 'default'} with model ${provider.model}`);
      const client = new OpenAI({
        apiKey: provider.apiKey,
        baseURL: provider.baseUrl || undefined,
        timeout: 60000, // 60 seconds timeout
      });

      let content: string | null = null;

      if (provider.type === 'Moonshot') {
        // Moonshot specific file extraction logic
        console.log("Using Moonshot file extraction flow...");
        const base64Data = base64Image.split(',')[1] || base64Image;
        const buffer = Buffer.from(base64Data, 'base64');
        
        // In Node.js, we can use a Buffer with a filename for the file upload
        // The OpenAI SDK handles this correctly
        const file = await OpenAI.toFile(buffer, 'image.jpg', { type: 'image/jpeg' });
        
        // 1. Upload the file
        console.log("Uploading file to Moonshot...");
        const fileObject = await client.files.create({
          file: file,
          purpose: "file-extract"
        });
        console.log("File uploaded successfully, ID:", fileObject.id);

        // 2. Get extracted content
        console.log("Retrieving extracted content for file:", fileObject.id);
        const fileContentResponse = await client.files.content(fileObject.id);
        const fileContent = await fileContentResponse.text();
        console.log("Extracted content length:", fileContent.length);

        // 3. Call chat completion with extracted content
        console.log("Calling chat completions with extracted content...");
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
        // Standard OpenAI vision flow
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
          // Some providers might not support response_format for all models
          response_format: provider.type === 'OpenAI' ? { type: "json_object" } : undefined
        });
        content = response.choices[0].message.content;
      }

      console.log("AI Response received, content length:", content?.length || 0);
      
      if (!content) {
        console.error("AI returned empty content");
        throw new Error("AI 返回内容为空");
      }
      
      // Extract JSON from markdown if needed
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      
      try {
        const parsed = JSON.parse(jsonStr);
        res.json(parsed);
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", content);
        res.status(500).json({ 
          error: "AI 返回格式错误，无法解析为 JSON",
          rawContent: content
        });
      }
    } catch (error: any) {
      console.error("Server AI Proxy Error:", error);
      const errorMessage = error.message || "AI 分析失败";
      const errorDetails = error.response?.data || error.stack || error;
      
      res.status(500).json({ 
        error: errorMessage,
        details: typeof errorDetails === 'object' ? JSON.stringify(errorDetails) : errorDetails
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
