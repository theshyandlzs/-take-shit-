import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export async function analyzeStoolImage(base64Image: string): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    Analyze this stool image for health purposes. 
    Provide a detailed assessment including:
    1. Overall health status (e.g., "Healthy", "Needs Attention").
    2. Confidence level (0-100).
    3. Key observations (texture, signs of fermentation, etc.).
    4. Personalized advice (dietary, hydration).
    5. Biological breakdown metrics (transit speed, hydration, fiber match).
    
    Return the result in JSON format matching the AnalysisResult interface.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
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
}
