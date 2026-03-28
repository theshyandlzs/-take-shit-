import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import OpenAI from "openai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Proxy for AI Analysis to avoid CORS issues
  app.post("/api/analyze", async (req, res) => {
    const { provider, base64Image, prompt } = req.body;

    if (!provider || !base64Image || !prompt) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    try {
      const client = new OpenAI({
        apiKey: provider.apiKey,
        baseURL: provider.baseUrl,
      });

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
        // Some providers (like Moonshot) might not support response_format for all models
        response_format: provider.type === 'OpenAI' ? { type: "json_object" } : undefined
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("AI 返回内容为空");
      
      // Extract JSON from markdown if needed
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      
      res.json(JSON.parse(jsonStr));
    } catch (error: any) {
      console.error("Server AI Proxy Error:", error);
      res.status(500).json({ 
        error: error.message || "AI 分析失败",
        details: error.response?.data || error
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
