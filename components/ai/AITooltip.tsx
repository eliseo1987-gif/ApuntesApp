"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { explainContext } from '@/lib/ai/actions';

export default function AITooltip() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [selectedText, setSelectedText] = useState("");
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState("");

    useEffect(() => {
        const handleMouseUp = () => {
            // Ignorar clicks si ya hay una explicación flotante o estamos cargando
            if (explanation || loading) return;

            const selection = window.getSelection();
            if (selection && selection.toString().trim() !== "") {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                // Nos posicionamos arriba a la izquierda del cuadro seleccionado
                setPosition({ x: rect.left + rect.width / 2, y: Math.max(0, rect.top - 50) });
                setSelectedText(selection.toString());
            } else {
                setSelectedText("");
            }
        };

        document.addEventListener("mouseup", handleMouseUp);
        return () => document.removeEventListener("mouseup", handleMouseUp);
    }, [explanation, loading]);

    const handleExplain = async () => {
        setLoading(true);
        try {
            const response = await explainContext(selectedText);
            setExplanation(response);
        } catch (error) {
            setExplanation("Hubo un error contactando a tu Profesor IA.");
        }
        setLoading(false);
    };

    const closeExplanation = () => {
        setExplanation("");
        setSelectedText("");
    };

    return (
        <>
            {/* Botón Flotante interactivo usando motion/react según dependencias */}
            <AnimatePresence>
                {selectedText && !explanation && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', left: position.x, top: position.y, transform: 'translateX(-50%)', zIndex: 50 }}
                        className="bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl cursor-pointer flex gap-3 items-center border border-white/10"
                    >
                        <button onClick={handleExplain} disabled={loading} className="hover:text-amber-300 font-medium whitespace-nowrap text-sm flex items-center gap-2">
                            {loading ? (
                                <>🪄 Pensando...</>
                            ) : (
                                <>🪄 Explicar esto con IA</>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cuadro de explicación fijo */}
            <AnimatePresence>
                {explanation && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-10 right-10 w-96 max-h-[60vh] overflow-y-auto bg-zinc-900/95 backdrop-blur border border-white/10 p-5 rounded-2xl shadow-2xl z-50 text-white"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg text-amber-300 flex items-center gap-2">🪄 Profesor IA</h3>
                            <button onClick={closeExplanation} className="text-zinc-400 hover:text-white transition-colors bg-black/50 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
                        </div>
                        <div className="text-sm leading-relaxed text-zinc-300">
                            {/* Aquí a futuro integraremos react-markdown */}
                            {explanation}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
