import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { AnalysisResult, ApiProvider } from "../types";

export async function analyzeStoolImage(base64Image: string, provider: ApiProvider): Promise<AnalysisResult> {
  const prompt = `
    Analyze this stool image for health purposes. 
    Provide a detailed assessment including:
    1. Overall health status (e.g., "Healthy", "Needs Attention").
    2. Confidence level (0-1).
    3. Key observations (texture, signs of fermentation, etc.).
    4. Personalized advice (dietary, hydration).
    5. Biological breakdown metrics (transit speed, hydration, fiber match).
    
    IMPORTANT: All text content (status, observations, advice, metrics labels) MUST be in Chinese.
    
    Return the result in JSON format matching this structure:
    {
      "status": "string (in Chinese)",
      "confidence": number,
      "observations": [{"title": "string (in Chinese)", "description": "string (in Chinese)", "type": "positive|neutral|negative"}],
      "advice": [{"category": "string (in Chinese)", "content": "string (in Chinese)"}],
      "metrics": [{"label": "string (in Chinese)", "value": number, "status": "string (in Chinese)"}]
    }
  `;

  if (provider.type === 'Gemini') {
    const ai = new GoogleGenAI({ apiKey: provider.apiKey });
    const response = await ai.models.generateContent({
      model: provider.model || "gemini-3.1-flash-lite-preview",
      contents: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] || base64Image } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            observations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["positive", "neutral", "negative"] }
                },
                required: ["title", "description", "type"]
              }
            },
            advice: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["category", "content"]
              }
            },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  status: { type: Type.STRING }
                },
                required: ["label", "value", "status"]
              }
            }
          },
          required: ["status", "confidence", "observations", "advice", "metrics"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } else {
    // OpenAI, Moonshot, or Custom (OpenAI-compatible)
    // Use backend proxy to avoid CORS issues
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          base64Image,
          prompt,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      if (!text) throw new Error("服务器返回内容为空");
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse server response:", text);
        throw new Error("服务器返回格式错误，无法解析为 JSON");
      }
    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      throw error;
    }
  }
}
