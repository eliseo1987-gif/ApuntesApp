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
        setAnswer("");
        try {
            const result = await generateQuizQuestion(contextData);
            setQuestion(result);
        } catch (e) {
            console.error(e);
        }
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
        <div className="my-6 p-5 border border-amber-500/30 bg-amber-50/50 rounded-xl overflow-hidden backdrop-blur-sm shadow-md">
            {!question ? (
                <button onClick={handleGenerate} disabled={loading} className="px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition drop-shadow-sm flex items-center gap-2">
                    {loading ? "🧠 Generando ejercicio..." : "🧠 Generar Ejercicio Rápido"}
                </button>
            ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        🧠 Pregunta del Profesor
                    </h4>
                    <p className="text-slate-800 font-medium italic bg-white/60 p-3 rounded-lg border border-white/40">{question}</p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Escribe tu paso a paso o respuesta..."
                            className="flex-1 px-4 py-3 rounded-lg border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/90 text-slate-800"
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            disabled={isCorrect === true || loading}
                        />
                        <button onClick={handleSubmit} disabled={loading || isCorrect === true || !answer.trim()} className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 min-w-[140px] shadow-sm transition">
                            {loading ? "Revisando..." : "Enviar Respuesta"}
                        </button>
                    </div>

                    <AnimatePresence>
                        {feedback && (
                            <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 16 }} className={`p-4 rounded-lg border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                <div className="font-bold mb-1 flex items-center gap-2">
                                    {isCorrect ? "✅ ¡Correcto!" : "❌ Ups, revisemos eso:"}
                                </div>
                                <p className="text-sm/relaxed">{feedback}</p>

                                <div className="mt-4 pt-4 border-t border-black/5">
                                    <button onClick={handleGenerate} className="text-sm font-bold opacity-80 hover:opacity-100 flex items-center gap-1 transition">
                                        ↻ Intentar otro ejercicio diferente
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
