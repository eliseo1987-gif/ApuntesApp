'use client';

import { useState, useEffect } from 'react';
import { Sparkles, FileText, Presentation, BookOpen, Loader2, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { getNotes } from '@/lib/store';

export default function StudyToolsPage() {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [toolType, setToolType] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    const loadNotes = () => {
      const loadedNotes = getNotes();
      setNotes(loadedNotes);
      if (loadedNotes.length > 0) {
        setSelectedNotes([loadedNotes[0].id.toString()]);
      }
    };
    loadNotes();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent('');
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    
    try {
      const selectedNotesData = notes.filter(n => selectedNotes.includes(n.id.toString()));
      if (selectedNotesData.length === 0) {
        setGeneratedContent('Por favor, selecciona al menos un apunte.');
        setIsGenerating(false);
        return;
      }

      const combinedContent = selectedNotesData.map(note => {
        const title = note.title || 'Apunte genérico';
        const content = note.content || `Este es un apunte sobre ${title}. Contiene información detallada sobre los conceptos principales, fechas importantes y fórmulas relevantes discutidas en clase.`;
        return `--- Apunte: ${title} ---\n${content}\n`;
      }).join('\n');

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

      if (toolType === 'quiz') {
        const prompt = `Genera un cuestionario interactivo de 5 preguntas de opción múltiple basado en los siguientes apuntes:\n\n${combinedContent}`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING, description: "La pregunta" },
                      options: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "4 opciones de respuesta"
                      },
                      correctAnswerIndex: { type: Type.INTEGER, description: "El índice (0-3) de la respuesta correcta en el array de opciones" },
                      explanation: { type: Type.STRING, description: "Breve explicación de por qué es la respuesta correcta" }
                    },
                    required: ["question", "options", "correctAnswerIndex", "explanation"]
                  }
                }
              },
              required: ["questions"]
            }
          }
        });

        const data = JSON.parse(response.text || '{}');
        setQuizData(data);
      } else {
        let prompt = '';
        if (toolType === 'summary') {
          prompt = `Crea un resumen estructurado y fácil de estudiar basado en los siguientes apuntes:\n\n${combinedContent}\n\nUsa viñetas, negritas para conceptos clave y un tono educativo.`;
        } else if (toolType === 'presentation') {
          prompt = `Crea un esquema para una presentación de 5 diapositivas basado en los siguientes apuntes:\n\n${combinedContent}\n\nPara cada diapositiva, incluye un título y 3-4 puntos clave.`;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });

        setGeneratedContent(response.text || 'No se pudo generar el contenido.');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent('Ocurrió un error al generar el contenido. Por favor, intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerClick = (index: number) => {
    if (selectedAnswer !== null) return; // Already answered
    setSelectedAnswer(index);
    
    if (index === quizData.questions[currentQuestionIndex].correctAnswerIndex) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold font-display text-slate-900 tracking-tight">Estudio IA</h1>
          <p className="text-slate-500 mt-2 text-lg">Convierte tus apuntes en material de estudio interactivo.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 h-fit">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">1. Selecciona tus apuntes</label>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50">
              {notes.map(note => (
                <label key={note.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedNotes.includes(note.id.toString())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNotes([...selectedNotes, note.id.toString()]);
                      } else {
                        setSelectedNotes(selectedNotes.filter(id => id !== note.id.toString()));
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">{note.title}</span>
                </label>
              ))}
              {notes.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No hay apuntes disponibles.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">2. ¿Qué quieres crear?</label>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${toolType === 'summary' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}>
                <input type="radio" name="tool" value="summary" checked={toolType === 'summary'} onChange={() => setToolType('summary')} className="mt-1" />
                <div>
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <FileText className="w-4 h-4 text-indigo-600" /> Resumen Estructurado
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Extrae los puntos clave y organizalos para un repaso rápido.</p>
                </div>
              </label>
              
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${toolType === 'presentation' ? 'border-purple-500 bg-purple-50/50' : 'border-slate-200 hover:border-purple-300'}`}>
                <input type="radio" name="tool" value="presentation" checked={toolType === 'presentation'} onChange={() => setToolType('presentation')} className="mt-1" />
                <div>
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Presentation className="w-4 h-4 text-purple-600" /> Esquema de Presentación
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Crea diapositivas con puntos clave para exponer el tema.</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${toolType === 'quiz' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-emerald-300'}`}>
                <input type="radio" name="tool" value="quiz" checked={toolType === 'quiz'} onChange={() => setToolType('quiz')} className="mt-1" />
                <div>
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <BookOpen className="w-4 h-4 text-emerald-600" /> Cuestionario de Práctica
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Genera preguntas de opción múltiple para ponerte a prueba.</p>
                </div>
              </label>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || selectedNotes.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generar Material
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[600px] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Resultado Generado
              </h3>
              {generatedContent && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completado
                </span>
              )}
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                  </div>
                  <p className="font-medium animate-pulse">La IA está analizando tus apuntes...</p>
                </div>
              ) : quizData ? (
                <div className="max-w-2xl mx-auto py-8">
                  {showResults ? (
                    <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900">¡Trivia Completada!</h2>
                      <p className="text-xl text-slate-600">
                        Tu puntuación: <span className="font-bold text-indigo-600">{score}</span> de {quizData.questions.length}
                      </p>
                      <div className="pt-8">
                        <button 
                          onClick={resetQuiz}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto transition-all shadow-sm"
                        >
                          <RotateCcw className="w-5 h-5" />
                          Intentar de nuevo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                        <span>Pregunta {currentQuestionIndex + 1} de {quizData.questions.length}</span>
                        <span>Puntuación: {score}</span>
                      </div>
                      
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 leading-relaxed">
                          {quizData.questions[currentQuestionIndex].question}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {quizData.questions[currentQuestionIndex].options.map((option: string, index: number) => {
                          const isSelected = selectedAnswer === index;
                          const isCorrect = index === quizData.questions[currentQuestionIndex].correctAnswerIndex;
                          const showCorrectness = selectedAnswer !== null;
                          
                          let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium ";
                          
                          if (!showCorrectness) {
                            buttonClass += "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 bg-white text-slate-700";
                          } else if (isCorrect) {
                            buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-800";
                          } else if (isSelected && !isCorrect) {
                            buttonClass += "border-rose-500 bg-rose-50 text-rose-800";
                          } else {
                            buttonClass += "border-slate-200 bg-slate-50 text-slate-400 opacity-50";
                          }

                          return (
                            <button
                              key={index}
                              onClick={() => handleAnswerClick(index)}
                              disabled={selectedAnswer !== null}
                              className={buttonClass}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {showCorrectness && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {selectedAnswer !== null && (
                        <div className="pt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                          <div className={`p-4 rounded-xl mb-6 ${selectedAnswer === quizData.questions[currentQuestionIndex].correctAnswerIndex ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-rose-50 border border-rose-100 text-rose-800'}`}>
                            <p className="font-semibold mb-1">
                              {selectedAnswer === quizData.questions[currentQuestionIndex].correctAnswerIndex ? '¡Correcto!' : 'Incorrecto'}
                            </p>
                            <p className="text-sm opacity-90">{quizData.questions[currentQuestionIndex].explanation}</p>
                          </div>
                          <button
                            onClick={handleNextQuestion}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-5 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                          >
                            {currentQuestionIndex < quizData.questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : generatedContent ? (
                <div className="prose prose-slate prose-indigo max-w-none">
                  <ReactMarkdown>{generatedContent}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-center max-w-sm">
                    Selecciona un apunte y el tipo de material que deseas generar. La IA hará el resto.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
