import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateStudyMaterial(type: 'summary' | 'presentation' | 'quiz', sourceContent: string) {
    if (!API_KEY) {
        throw new Error("API Key de Gemini no configurada. Por favor, añádela en las variables de entorno.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt = "";
    let responseMimeType = "text/plain";

    switch (type) {
        case 'summary':
            prompt = `
        Eres un tutor experto en técnicas de estudio (como Feynman y active recall). 
        Analiza los siguientes apuntes y crea un resumen ESTRUCTURADO Y PREMIUM.
        
        Usa:
        - Títulos claros con emojis.
        - Listas de viñetas para conceptos.
        - Una sección de "Conceptos Clave" en negrita.
        - Una sección final de "Preguntas para Autoevaluación".
        
        Apuntes:
        ${sourceContent}
      `;
            break;
        case 'presentation':
            prompt = `
        Crea un esquema detallado para una presentación académica de 5-7 diapositivas sobre este contenido.
        Para cada diapositiva indica:
        - Título.
        - 3 Puntos clave.
        - Sugerencia visual (qué imagen o gráfico mostrar).
        
        Apuntes:
        ${sourceContent}
      `;
            break;
        case 'quiz':
            prompt = `
        Genera un examen de 5 preguntas de opción múltiple en formato JSON.
        Cada pregunta debe tener: 'question', 'options' (array de 4), 'correctAnswerIndex' (0-3), y 'explanation'.
        
        DEVUELVE SOLO EL JSON.
        
        Apuntes:
        ${sourceContent}
      `;
            responseMimeType = "application/json";
            break;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        if (type === 'quiz') {
            // Clean possible markdown code blocks if the model included them
            text = text.replace(/```json\n?|```/g, '');
        }

        return text;
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
}

export async function processAudioToText(base64Audio: string, mimeType: string) {
    if (!API_KEY) {
        throw new Error("API Key de Gemini no configurada. Por favor, añádela en las variables de entorno.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Por favor, transcribe cuidadosamente todo el audio. Luego, formatea la transcripción en un documento de estudio bien estructurado usando exclusivamente código HTML (etiquetas h1, h2, ul, li, strong, p, etc). 
    Incluye los puntos más importantes destacados.
    NO uses markdown, y no incluyas backticks de código (como \`\`\`html). Devuelve SOLO el HTML puro para inyectar directamente en un editor.`;

    try {
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Audio
                }
            },
            { text: prompt }
        ]);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Audio Generation Error:", error);
        throw error;
    }
}
