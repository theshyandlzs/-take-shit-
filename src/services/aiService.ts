import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { AnalysisResult, ApiProvider } from "../types";

export async function analyzeStoolImage(base64Image: string, provider: ApiProvider): Promise<AnalysisResult> {
  const prompt = `
    Analyze this stool image for health purposes. 
    Provide a detailed assessment including:
    1. Overall health status (e.g., "Healthy", "Needs Attention").
    2. Confidence level (0-100).
    3. Key observations (texture, signs of fermentation, etc.).
    4. Personalized advice (dietary, hydration).
    5. Biological breakdown metrics (transit speed, hydration, fiber match).
    
    Return the result in JSON format matching this structure:
    {
      "status": "string",
      "confidence": number,
      "observations": [{"title": "string", "description": "string", "type": "positive|neutral|negative"}],
      "advice": [{"category": "string", "content": "string"}],
      "metrics": [{"label": "string", "value": number, "status": "string"}]
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
    const client = new OpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.baseUrl,
      dangerouslyAllowBrowser: true
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
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content || "{}");
  }
}
