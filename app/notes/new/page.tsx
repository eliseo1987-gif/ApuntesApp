'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Mic, Video, UploadCloud, Save, Loader2, Bold, Italic, Underline, List, Play, Square, Circle, Image as ImageIcon, Wand2 } from 'lucide-react';
import { addNote, getSubjects } from '@/lib/store';
import { processAudioToText } from '@/lib/ai';

export default function NewNotePage() {
  const [noteType, setNoteType] = useState<'document' | 'audio' | 'video' | 'image'>('document');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadSubjects = () => {
      setSubjects(getSubjects());
    };
    loadSubjects();
  }, []);

  const formatText = (command: string, e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand(command, false, undefined);
    if (editorRef.current) {
      editorRef.current.focus();
      setContent(editorRef.current.innerHTML);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Create a File object from the Blob
        const file = new File([blob], `grabacion-${new Date().getTime()}.webm`, { type: 'audio/webm' });
        setSelectedFile(file);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("No se pudo acceder al micrófono. Por favor, verifica los permisos.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  const handleSave = async () => {
    setIsSaving(true);

    const selectedSubject = subjects.find(s => s.name === subject);
    const color = selectedSubject ? selectedSubject.color : (noteType === 'document' ? 'bg-blue-100 text-blue-600' : noteType === 'audio' ? 'bg-orange-100 text-orange-600' : noteType === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600');

    addNote({
      title,
      subject,
      type: noteType,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      rawDate: date,
      tags: ['Nuevo'],
      color,
      content: noteType === 'document' ? content : `[Archivo adjunto: ${selectedFile?.name}]`
    });

    setIsSaving(false);
    router.push('/notes');
  };

  const handleProcessAudioAI = async () => {
    if (!selectedFile) return;
    setIsAiProcessing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);

      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          const mimeType = selectedFile.type || 'audio/webm';

          const transcriptHtml = await processAudioToText(base64String, mimeType);

          setNoteType('document');
          setContent(transcriptHtml);

          if (editorRef.current) {
            editorRef.current.innerHTML = transcriptHtml;
          }
        } catch (error) {
          console.error("AI Error:", error);
          alert("Hubo un error al procesar el audio con IA. Asegúrate de que el audio no sea muy largo y esté funcionando tu API Key.");
        } finally {
          setIsAiProcessing(false);
        }
      };

      reader.onerror = () => {
        setIsAiProcessing(false);
        alert("Error al intentar leer la grabación/archivo de audio.");
      };
    } catch (err) {
      setIsAiProcessing(false);
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link href="/notes" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Nuevo Apunte</h1>
          <p className="text-slate-500 mt-1">Crea o sube un nuevo documento, audio o video.</p>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
        {/* Note Type Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-4">Tipo de Apunte</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => { setNoteType('document'); setSelectedFile(null); }}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${noteType === 'document' ? 'border-indigo-600 bg-indigo-50/30 text-indigo-700' : 'border-slate-100 hover:border-indigo-200 text-slate-600'}`}
            >
              <FileText className={`w-8 h-8 ${noteType === 'document' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="font-medium">Documento</span>
            </button>
            <button
              onClick={() => { setNoteType('audio'); setSelectedFile(null); setAudioUrl(null); }}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${noteType === 'audio' ? 'border-orange-600 bg-orange-50/30 text-orange-700' : 'border-slate-100 hover:border-orange-200 text-slate-600'}`}
            >
              <Mic className={`w-8 h-8 ${noteType === 'audio' ? 'text-orange-600' : 'text-slate-400'}`} />
              <span className="font-medium">Audio</span>
            </button>
            <button
              onClick={() => { setNoteType('video'); setSelectedFile(null); }}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${noteType === 'video' ? 'border-purple-600 bg-purple-50/30 text-purple-700' : 'border-slate-100 hover:border-purple-200 text-slate-600'}`}
            >
              <Video className={`w-8 h-8 ${noteType === 'video' ? 'text-purple-600' : 'text-slate-400'}`} />
              <span className="font-medium">Video</span>
            </button>
            <button
              onClick={() => { setNoteType('image'); setSelectedFile(null); }}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${noteType === 'image' ? 'border-emerald-600 bg-emerald-50/30 text-emerald-700' : 'border-slate-100 hover:border-emerald-200 text-slate-600'}`}
            >
              <ImageIcon className={`w-8 h-8 ${noteType === 'image' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="font-medium">Fotografía</span>
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Título del Apunte</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Revolución Francesa"
            className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg font-medium"
          />
        </div>

        {/* Subject and Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Materia</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: Historia Contemporánea"
              list="materias-list"
              className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
            <datalist id="materias-list">
              {subjects.map(s => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Content Area based on type */}
        {noteType === 'document' ? (
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Contenido</label>
            <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all bg-white">
              <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1 items-center">
                <button type="button" onClick={(e) => formatText('bold', e)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors" title="Negrita">
                  <Bold className="w-4 h-4" />
                </button>
                <button type="button" onClick={(e) => formatText('italic', e)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors" title="Cursiva">
                  <Italic className="w-4 h-4" />
                </button>
                <button type="button" onClick={(e) => formatText('underline', e)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors" title="Subrayado">
                  <Underline className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button type="button" onClick={(e) => formatText('insertUnorderedList', e)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors" title="Lista">
                  <List className="w-4 h-4" />
                </button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                className="w-full p-4 min-h-[300px] focus:outline-none prose prose-slate max-w-none"
                data-placeholder="Escribe tus apuntes aquí..."
              />
            </div>
          </div>
        ) : noteType === 'audio' ? (
          <div className="space-y-6">
            <label className="block text-sm font-semibold text-slate-900">Audio del Apunte</label>

            {/* Recording Section */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center space-y-4">
              {audioUrl ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                        <Mic className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Grabación guardada</p>
                        <p className="text-xs text-slate-500">{formatTime(recordingTime)}</p>
                      </div>
                    </div>
                    <audio src={audioUrl} controls className="h-10" />
                  </div>

                  <button
                    onClick={handleProcessAudioAI}
                    disabled={isAiProcessing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
                  >
                    {isAiProcessing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Procesando con IA (puede tardar un minuto)...</>
                    ) : (
                      <><Wand2 className="w-5 h-5" /> ✨ Transcribir y Resumir con IA ✨</>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setAudioUrl(null);
                      setSelectedFile(null);
                      setRecordingTime(0);
                    }}
                    className="text-sm text-red-500 hover:text-red-600 font-medium w-full text-center py-2"
                  >
                    Descartar y grabar de nuevo
                  </button>
                </div>

              ) : (
                <>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-orange-100 text-orange-600'}`}>
                    <Mic className={`w-8 h-8 ${isRecording ? 'animate-bounce' : ''}`} />
                  </div>

                  {isRecording ? (
                    <div className="text-center space-y-4">
                      <p className="text-2xl font-bold text-slate-900 font-mono">{formatTime(recordingTime)}</p>
                      <button
                        onClick={stopRecording}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all shadow-sm mx-auto"
                      >
                        <Square className="w-4 h-4 fill-current" /> Detener Grabación
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">Grabar nota de voz</h3>
                      <p className="text-slate-500 text-sm mb-4">Usa tu micrófono para grabar la clase</p>
                      <button
                        onClick={startRecording}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all shadow-sm mx-auto"
                      >
                        <Circle className="w-4 h-4 fill-current text-red-500" /> Iniciar Grabación
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">O sube un archivo</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Upload Section */}
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="audio/mp3,audio/wav,audio/m4a,audio/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setAudioUrl(null); // Clear recording if file uploaded
                }
              }}
            />
            <label
              htmlFor="file-upload"
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${selectedFile && !audioUrl ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              {selectedFile && !audioUrl ? (
                <>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-emerald-100 text-emerald-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-md font-semibold text-slate-900 mb-1">{selectedFile.name}</h3>
                  <p className="text-emerald-600 font-medium text-xs mb-4">
                    Archivo seleccionado ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>

                  {/* AI Upload Process Button */}
                  <div className="w-full max-w-sm mx-auto z-10" onClick={e => e.preventDefault() /* prevent label click */}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleProcessAudioAI();
                      }}
                      disabled={isAiProcessing}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 mt-2"
                    >
                      {isAiProcessing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analizando Audio...</>
                      ) : (
                        <><Wand2 className="w-4 h-4" /> Procesar a Texto con IA</>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-slate-100 text-slate-500">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-md font-semibold text-slate-900 mb-1">Subir archivo de audio</h3>
                  <p className="text-slate-500 text-xs">Soporta MP3, WAV, M4A (Max 50MB)</p>
                </>
              )}
            </label>
          </div>
        ) : noteType === 'video' ? (
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Sube tu archivo de video</label>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor="file-upload"
              className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${selectedFile ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              {selectedFile ? (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-emerald-100 text-emerald-600">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{selectedFile.name}</h3>
                  <p className="text-emerald-600 font-medium text-sm">
                    Archivo seleccionado ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                  <p className="text-slate-500 text-xs mt-4 underline">Haz clic para cambiar el archivo</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-purple-100 text-purple-600">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Haz clic para subir o arrastra el archivo</h3>
                  <p className="text-slate-500 text-sm">Soporta MP4, MOV, AVI (Max 500MB)</p>
                </>
              )}
            </label>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Sube tu fotografía</label>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor="file-upload"
              className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${selectedFile ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              {selectedFile ? (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-emerald-100 text-emerald-600">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{selectedFile.name}</h3>
                  <p className="text-emerald-600 font-medium text-sm">
                    Imagen seleccionada ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                  <p className="text-slate-500 text-xs mt-4 underline">Haz clic para cambiar la imagen</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-emerald-100 text-emerald-600">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Haz clic para subir o arrastra la imagen</h3>
                  <p className="text-slate-500 text-sm">Soporta JPG, PNG, WEBP (Max 20MB)</p>
                </>
              )}
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
          <Link href="/notes" className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancelar
          </Link>
          <button
            onClick={handleSave}
            disabled={!title || !subject || !date || (noteType === 'document' && !content) || (noteType !== 'document' && !selectedFile) || isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Guardar Apunte
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
