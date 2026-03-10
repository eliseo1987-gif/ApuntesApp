'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Cloud, Loader2, Bold, Italic, Underline, List, Wand2, Download, BrainCircuit } from 'lucide-react';
import { subscribeToNote, updateNote, Note } from '@/lib/store';
import { generateStudyMaterial } from '@/lib/ai';
import AIQuizBlock from '@/components/ai/AIQuizBlock';

function EditorContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [note, setNote] = useState<Note | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (!id) {
            if (!isInitialLoad) router.push('/notes');
            return;
        }

        const unsubscribe = subscribeToNote(id, (loadedNote) => {
            if (!loadedNote) {
                if (!isInitialLoad) router.push('/notes');
                return;
            }
            setNote(loadedNote);

            if (isInitialLoad) {
                setTitle(loadedNote.title);
                if (editorRef.current) {
                    editorRef.current.innerHTML = loadedNote.content || '';
                    setContent(loadedNote.content || '');
                }
                setIsInitialLoad(false);
            }
        }) as () => void;
        return () => unsubscribe();
    }, [id, isInitialLoad, router]);

    // Debounced auto-save
    useEffect(() => {
        if (!note || isInitialLoad || !id) return;

        if (title === note.title && content === (note.content || '')) return;

        const timer = setTimeout(async () => {
            setIsSaving(true);
            try {
                await updateNote(id, { title, content });
                setLastSaved(new Date());
            } catch (err) {
                console.error("Error auto-saving:", err);
            } finally {
                setIsSaving(false);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [title, content, note, id, isInitialLoad]);

    const handleAiSummarize = async () => {
        if (!content || isAiProcessing) return;
        setIsAiProcessing(true);
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const plainText = tempDiv.innerText;

            const summary = await generateStudyMaterial('summary', plainText);

            const summaryHtml = `
        <div style="margin-top: 40px; padding: 32px; background: linear-gradient(135deg, #f8faff 0%, #f1f5ff 100%); border-radius: 24px; border: 1px border-indigo-100; box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.05);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <span style="font-size: 20px;">✨</span>
            <h2 style="color: #4f46e5; margin: 0; font-size: 20px; font-weight: 700;">Resumen Inteligente</h2>
          </div>
          <div style="color: #475569; line-height: 1.6;">
            ${summary.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;

            const newContent = content + summaryHtml;
            setContent(newContent);
            if (editorRef.current) {
                editorRef.current.innerHTML = newContent;
            }

            if (id) await updateNote(id, { content: newContent });
            setLastSaved(new Date());
        } catch (err) {
            console.error("AI Error:", err);
            alert("No se pudo generar el resumen. Verifica tu API Key en las variables de entorno.");
        } finally {
            setIsAiProcessing(false);
        }
    };

    const formatText = (command: string) => {
        document.execCommand(command, false, undefined);
        if (editorRef.current) setContent(editorRef.current.innerHTML);
    };

    if (isInitialLoad && !note) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                <p className="text-slate-500 animate-pulse font-medium">Iniciando editor quantum...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20 px-4 print:pb-0 print:px-0">
            <header className="flex items-center justify-between mb-12 sticky top-0 bg-slate-50/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 border-b border-slate-200/50 print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/notes" className="p-2.5 hover:bg-white rounded-xl transition-all text-slate-500 shadow-sm border border-transparent hover:border-slate-200 active:scale-95">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <Cloud className={`w-3.5 h-3.5 ${isSaving ? 'animate-pulse text-indigo-500' : 'text-slate-300'}`} />
                            <span>{isSaving ? 'Guardando...' : lastSaved ? `Sincronizado ${lastSaved.toLocaleTimeString()}` : 'Cloud Sync'}</span>
                        </div>
                        {note && <span className="text-[10px] text-slate-400 font-medium">Editor • {note.subject}</span>}
                    </div>
                </div>

                <button
                    onClick={handleAiSummarize}
                    disabled={isAiProcessing || !content}
                    className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xl shadow-slate-200 disabled:opacity-50 active:scale-95 uppercase tracking-widest"
                >
                    {isAiProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    {isAiProcessing ? 'Analizando...' : 'Magia IA'}
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowQuiz(!showQuiz)}
                        className="flex items-center gap-2 bg-amber-500 border border-amber-600 hover:bg-amber-600 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xl shadow-amber-200 active:scale-95 uppercase tracking-widest"
                    >
                        <BrainCircuit className="w-3.5 h-3.5" />
                        Quiz IA
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 uppercase tracking-widest"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Exportar PDF
                    </button>
                </div>
            </header>

            <main className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-20 min-h-[85vh] transition-all relative print:shadow-none print:border-none print:rounded-none print:p-0">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sin título"
                    className="w-full text-5xl md:text-7xl font-bold font-display text-slate-900 border-none focus:ring-0 placeholder:text-slate-100 mb-12 bg-transparent leading-tight tracking-tight"
                />

                <div className="flex flex-wrap gap-1 mb-12 items-center bg-slate-50/80 p-2 rounded-2xl w-fit border border-slate-100 backdrop-blur-sm print:hidden">
                    <button onClick={() => formatText('bold')} className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-600" title="Negrita"><Bold className="w-4 h-4" /></button>
                    <button onClick={() => formatText('italic')} className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-600" title="Cursiva"><Italic className="w-4 h-4" /></button>
                    <button onClick={() => formatText('underline')} className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-600" title="Subrayado"><Underline className="w-4 h-4" /></button>
                    <div className="w-px h-6 bg-slate-200 mx-2"></div>
                    <button onClick={() => formatText('insertUnorderedList')} className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-600" title="Lista"><List className="w-4 h-4" /></button>
                </div>

                <div
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => setContent(e.currentTarget.innerHTML)}
                    className="w-full focus:outline-none prose prose-indigo md:prose-2xl max-w-none text-slate-800 min-h-[60vh] selection:bg-indigo-100/50 leading-relaxed"
                    data-placeholder="Escribe algo increíble..."
                />

                {showQuiz && (
                    <div className="mt-12 pt-8 border-t border-slate-100 print:hidden animate-in slide-in-from-bottom-4 duration-500">
                        <AIQuizBlock contextData={content || title || 'Sin contenido'} />
                    </div>
                )}

                <style jsx>{`
          [contentEditable]:empty:before {
            content: attr(data-placeholder);
            color: #e2e8f0;
            cursor: text;
          }
        `}</style>
            </main>
        </div>
    );
}

export default function NoteDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600/20" />
            </div>
        }>
            <EditorContent />
        </Suspense>
    );
}
