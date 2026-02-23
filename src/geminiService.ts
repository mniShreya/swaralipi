import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeSwaralipi(imageData: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: "Analyze this Swaralipi (Indian Classical Music notation) image. Identify the swaras (notes) present. Return a JSON object with the following structure: { \"swaras\": [ { \"note\": \"Sa\", \"devanagari\": \"सा\", \"number\": 1, \"confidence\": 0.98, \"bbox\": [x, y, w, h] } ], \"overall_accuracy\": 0.95, \"raga_suggestion\": \"Bhairavi\" }. Note: bbox should be normalized 0-1000.",
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData.split(',')[1],
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}
