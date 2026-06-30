import { GoogleGenAI } from '@google/genai';
import { loadEnvConfig } from '@next/env';

async function list() {
  loadEnvConfig(process.cwd());
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.list();
  // @ts-ignore
  for (const model of response) {
    if (model.name.includes('flash') || model.name.includes('pro')) console.log(model.name);
  }
}
list();
