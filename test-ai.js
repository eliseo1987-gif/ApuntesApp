require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  console.log("Testing generation...");
  const result = await model.generateContent("Di 'Hola mundo' y nada mas.");
  const response = await result.response;
  console.log("Result:", response.text());
}
test().catch(console.error);
