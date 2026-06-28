const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function list() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'hello'
        });
        console.log(response.text);
    } catch(e) {
        console.log("Error 2.5 flash:", e.message);
    }
    
    try {
        const response2 = await ai.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: 'hello'
        });
        console.log(response2.text);
    } catch(e) {
        console.log("Error 1.5 pro:", e.message);
    }
}
list();
