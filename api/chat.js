// Serverless Function para Vercel
import { GoogleGenAI } from "@google/genai";

// Inicializa la IA con la clave de entorno (MUY IMPORTANTE)
const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY // <-- Vercel la leerá aquí, no en el código
});

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { question, context } = request.body;

        if (!question || !context) {
            return response.status(400).json({ error: 'Faltan parámetros (question o context).' });
        }

        const prompt = `
            Actúa como un asesor experto de Universidad Siglo 21.
            Usa SOLO la siguiente información para responder la pregunta del usuario.
            Si la respuesta no está en el texto, di "No tengo información sobre eso en la base de datos."
            
            INFORMACIÓN DE REFERENCIA:
            ${context}

            PREGUNTA DEL USUARIO: "${question}"
        `;

        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash", 
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const answer = result.text;
        
        response.status(200).json({ text: answer });

    } catch (e) {
        // Captura errores de la API Key, cuota, etc.
        console.error("Error en la API de Gemini:", e);
        response.status(500).json({ error: e.message || "Error desconocido al contactar a la API de Google." });
    }
}