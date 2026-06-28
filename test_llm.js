const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const metadataSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    abstract: { type: Type.STRING },
    authors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { name: { type: Type.STRING } }
      }
    },
    references: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { rawText: { type: Type.STRING } }
      }
    }
  },
  required: ["title", "abstract", "authors", "references"]
};

async function test() {
  const prompt = "This is a test document. Title: My Great Paper. Abstract: We did science. Author: John Doe. References: 1. Smith J. (2020) Science.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: metadataSchema,
        temperature: 0.1,
      }
    });
    console.log("RAW RESPONSE:", response.text);
    const json = JSON.parse(response.text);
    console.log("PARSED JSON:", json);
  } catch (e) {
    console.error("LLM Error:", e);
  }
}

test();
