"use server"
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function explainContext(textContext: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(`Eres un profesor experto. Explícame esto de forma sencilla: ${textContext}`);
    const response = await result.response;
    return response.text();
}
