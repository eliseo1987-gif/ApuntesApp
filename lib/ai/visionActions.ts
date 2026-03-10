import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function extractContentFromFile(base64Data: string, mimeType: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Eres un asistente educativo avanzado para una app de apuntes. Transforma el documento o imagen adjunto en un apunte digital estructurado en formato Markdown.
Reglas estrictas:
1. Extrae y estructura con la máxima precisión TODO el texto, conceptos y temas clave.
2. Si detectas problemas matemáticos o fórmulas, transcríbelas y resuélvelas paso a paso usando estrictamente notación tipográfica amigable y LaTeX (ej: $$ x^2 = 4 $$).
3. Usa encabezados (H1, H2), viñetas, negritas, cursivas y tablas de manera inteligente para hacerlo supremamente fácil de estudiar.
4. Identifica de qué se trata la materia o documento e inclúyelo en una pequeña introducción.
5. Devuelve SOLO el Markdown limpio, sin rodeos, respuestas automáticas ni saludos. ¡Sé directo!`;

    try {
        const imageParts = [
            {
                inlineData: {
                    data: base64Data,
                    mimeType
                }
            }
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini Vision Error:", error);
        throw new Error("No pudimos analizar tu documento. Intenta subiéndolo en menor resolución o formato estándar (JPG/PNG/PDF).");
    }
}
