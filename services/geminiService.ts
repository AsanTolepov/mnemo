import { GoogleGenAI } from "@google/genai";
import { MnemonicTip } from '../types';

// Initialize Gemini
// Note: In a real production app, ensure this is handled securely.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Generates a mnemonic tip for a specific number sequence.
 * This acts as an "AI Coach" to help the user learn how to memorize the specific grid they just failed or are practicing.
 */
export const generateMnemonicTip = async (numbers: string): Promise<MnemonicTip> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      I am practicing memory training. I need to memorize this sequence of numbers: "${numbers}".
      Provide a specific, short, and creative mnemonic device or association strategy to help me remember this exact sequence using the Major System or PAO (Person-Action-Object) system.
      
      Return ONLY a JSON object with this structure (no markdown, no backticks):
      {
        "technique": "Name of the technique used (e.g., Major System)",
        "text": "The actual mnemonic explanation."
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(responseText) as MnemonicTip;
    return result;

  } catch (error) {
    console.error("Gemini Mnemonic Tip Error:", error);
    return {
      technique: "Basic Chunking",
      text: "Try breaking the numbers into groups of 3 (e.g., 123 - 456) and visualizing them as prices or dates."
    };
  }
};
