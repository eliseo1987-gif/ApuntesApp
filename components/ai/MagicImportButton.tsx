"use client"
import React, { useRef, useState } from 'react';
import { extractContentFromFile } from '@/lib/ai/visionActions';
import { Sparkles, Loader2 } from 'lucide-react';

interface MagicImportButtonProps {
    onExtracted: (markdown: string) => void;
}

export default function MagicImportButton({ onExtracted }: MagicImportButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate supported types
        const supported = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
        if (!supported.includes(file.type)) {
            setError("Solo se admiten: JPG, PNG, WEBP, HEIC o PDF.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Convert to base64
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < uint8Array.byteLength; i++) {
                binary += String.fromCharCode(uint8Array[i]);
            }
            const base64 = btoa(binary);

            const result = await extractContentFromFile(base64, file.type);
            onExtracted(result);
        } catch (err: any) {
            setError(err.message || "Error al procesar el archivo.");
        } finally {
            setLoading(false);
            // Reset input so same file can be re-uploaded
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="relative">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="magic-import-input"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Importar apunte desde imagen o PDF usando IA"
                className="flex items-center gap-2 bg-violet-600 border border-violet-700 hover:bg-violet-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xl shadow-violet-200 disabled:opacity-50 active:scale-95 uppercase tracking-widest"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Analizando...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-3.5 h-3.5" />
                        ✨ Importar con IA
                    </>
                )}
            </button>

            {error && (
                <p className="absolute top-full mt-1 text-xs text-red-500 bg-white border border-red-100 rounded-lg px-2 py-1 shadow-sm whitespace-nowrap">
                    {error}
                </p>
            )}
        </div>
    );
}
