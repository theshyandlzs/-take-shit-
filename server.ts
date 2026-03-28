import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { parseAnalyzeRequestPayload, proxyAnalyzeRequest, UpstreamApiError } from "./src/server/analyzeProxy";

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
    try {
      console.log("Received AI analysis request for provider:", req.body?.provider?.type);
      const payload = parseAnalyzeRequestPayload(req.body);
      const result = await proxyAnalyzeRequest(payload);
      res.json(result);
    } catch (error: any) {
      console.error("Server AI Proxy Error:", error);
      const status = error instanceof UpstreamApiError ? error.status : 500;
      const errorMessage = error.message || "AI 分析失败";
      const errorDetails =
        error instanceof UpstreamApiError ? error.details : error.stack || error;
      
      res.status(status).json({ 
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
