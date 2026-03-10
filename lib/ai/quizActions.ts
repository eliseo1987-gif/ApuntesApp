import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function generateQuizQuestion(context: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Eres un tutor. Genera UNA pregunta de práctica (ejercicio o concepto) basada en el siguiente contexto. Sólo devuelve la pregunta, de forma directa:\n\nContexto: "${context}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

export async function evaluateQuizAnswer(question: string, answer: string, context: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Pregunta generada: "${question}".
Respuesta del alumno: "${answer}".
Contexto: "${context}".
Como tutor, evalúa si la respuesta es correcta o parcialmente correcta. Devuelve un JSON estrictamente con este formato y nada más: {"isCorrect": true/false, "feedback": "tu explicación correctiva y amable"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    let rawText = response.text();
    // Strip markdown formatting if Gemini returns it
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(rawText);
    } catch (e) {
        return { isCorrect: false, feedback: "No pude procesar la evaluación, intenta de nuevo." };
    }
}
