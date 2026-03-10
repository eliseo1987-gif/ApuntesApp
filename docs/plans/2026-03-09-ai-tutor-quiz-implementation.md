# AI Quiz Blocks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement interactive Quiz Blocks that generate questions based on study material context, allow the user to answer, and evaluate their answer using Gemini 2.0.

**Architecture:**

- `lib/ai/quizActions.ts` handles the server-side LLM calls (generate question, evaluate answer).
- `components/ai/AIQuizBlock.tsx` is the interactive client component displaying the question, an input field, and the feedback.

**Tech Stack:** Next.js Server Actions, `@google/generative-ai`, framer-motion, Tailwind CSS.

---

### Task 1: Create Server Actions for Quiz Generation and Evaluation

**Files:**

- Create: `lib/ai/quizActions.ts`

**Step 1: Write minimal implementation**

```typescript
"use server"
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function generateQuizQuestion(context: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Eres un tutor. Genera UNA pregunta de práctica (ejercicio o concepto) basada en el siguiente contexto. Sólo devuelve la pregunta, de forma directa: "${context}"`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function evaluateQuizAnswer(question: string, answer: string, context: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Pregunta generada: "${question}". Respuesta del alumno: "${answer}". Contexto: "${context}". Como tutor, evalúa si la respuesta es correcta. Devuelve un JSON estrictamente con este formato: {"isCorrect": true/false, "feedback": "tu explicación correctiva y amable"}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
  return JSON.parse(rawText);
}
```

**Step 2: Commit**

```bash
git add lib/ai/quizActions.ts
git commit -m "feat: setup gemini server actions for dynamic quizzes"
```

### Task 2: Create AIQuizBlock Component

**Files:**

- Create: `components/ai/AIQuizBlock.tsx`

**Step 1: Write minimal implementation**

```tsx
"use client"
import React, { useState } from 'react';
import { generateQuizQuestion, evaluateQuizAnswer } from '@/lib/ai/quizActions';
import { motion, AnimatePresence } from 'motion/react';

interface AIQuizBlockProps {
   contextData: string;
}

export default function AIQuizBlock({ contextData }: AIQuizBlockProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
     setLoading(true);
     setFeedback("");
     setIsCorrect(null);
     const result = await generateQuizQuestion(contextData);
     setQuestion(result);
     setLoading(false);
  };

  const handleSubmit = async () => {
     if (!answer.trim()) return;
     setLoading(true);
     try {
        const evalResult = await evaluateQuizAnswer(question, answer, contextData);
        setIsCorrect(evalResult.isCorrect);
        setFeedback(evalResult.feedback);
     } catch (e) {
        setFeedback("Hubo un error evaluando tu respuesta.");
     }
     setLoading(false);
  };

  return (
    <div className="my-6 p-5 border border-amber-500/30 bg-amber-50/50 rounded-xl">
       {!question ? (
         <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 transition">
            {loading ? "Generando ejercicio..." : "🧠 Generar Ejercicio"}
         </button>
       ) : (
         <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="space-y-4">
            <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
               🧠 Pregunta del Profesor
            </h4>
            <p className="text-slate-700 italic">{question}</p>
            
            <div className="flex gap-2">
               <input 
                  type="text" 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Escribe tu paso a paso o respuesta..."
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
               />
               <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50">
                   {loading ? "Revisando..." : "Enviar Respuesta"}
               </button>
            </div>

            <AnimatePresence>
               {feedback && (
                  <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: "auto"}} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                     <div className="font-bold mb-1 flex items-center gap-2">
                         {isCorrect ? "✅ ¡Correcto!" : "❌ Ups, revisemos eso:"}
                     </div>
                     <p className="text-sm">{feedback}</p>
                     
                     {!isCorrect && (
                        <button onClick={handleGenerate} className="mt-3 text-xs font-bold underline">Intentar otro ejercicio similar</button>
                     )}
                  </motion.div>
               )}
            </AnimatePresence>
         </motion.div>
       )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/ai/AIQuizBlock.tsx
git commit -m "feat: interactive AI quiz blocks component"
```
