'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Mic, Video, Plus, ArrowRight, Clock, Calendar as CalendarIcon, Sparkles, TrendingUp } from 'lucide-react';
import { getNotes, getGrades, getSubjects } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      const notes = getNotes();
      setTotalNotes(notes.length);
      setRecentNotes(notes.slice(0, 3));

      const grades = getGrades();
      const subjects = getSubjects();
      
      const data = subjects.map((subject: any) => {
        const subjectGrades = grades.filter((g: any) => g.subjectName === subject.name);
        let percentage = 0;
        if (subjectGrades.length > 0) {
          const totalScore = subjectGrades.reduce((acc: number, g: any) => acc + (g.score / g.maxScore), 0);
          percentage = (totalScore / subjectGrades.length) * 100;
        }
        
        // Extract color hex or use a default if it's a tailwind class
        let fill = '#6366f1'; // default indigo-500
        if (subject.color.includes('blue')) fill = '#3b82f6';
        else if (subject.color.includes('orange')) fill = '#f97316';
        else if (subject.color.includes('purple')) fill = '#a855f7';
        else if (subject.color.includes('emerald')) fill = '#10b981';
        else if (subject.color.includes('rose')) fill = '#f43f5e';

        return {
          name: subject.name.length > 15 ? subject.name.substring(0, 15) + '...' : subject.name,
          promedio: parseFloat(percentage.toFixed(1)),
          fill
        };
      }).filter((d: any) => d.promedio > 0);

      setChartData(data);
    };
    loadData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold font-display text-slate-900 tracking-tight">Hola, Eliseo 👋</h1>
          <p className="text-slate-500 mt-2 text-lg">¿Qué vamos a estudiar hoy?</p>
        </div>
        <div className="flex gap-3">
          <Link href="/notes/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm">
            <Plus className="w-5 h-5" />
            Nuevo Apunte
          </Link>
        </div>
      </header>

      {/* Stats / Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Apuntes</p>
            <p className="text-2xl font-bold text-slate-900">{totalNotes}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Horas de Estudio</p>
            <p className="text-2xl font-bold text-slate-900">18.5h</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Próximo Examen</p>
            <p className="text-2xl font-bold text-slate-900">En 5 días</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Notes & Chart */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Section */}
          {chartData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold font-display text-slate-900">Rendimiento Académico</h2>
                </div>
                <Link href="/grades" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
                  Ver detalles <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value}%`, 'Promedio']}
                    />
                    <Bar dataKey="promedio" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Notes */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-display text-slate-900">Apuntes Recientes</h2>
              <Link href="/notes" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {recentNotes.map((note) => (
                  <div key={note.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center gap-4 cursor-pointer">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${note.color}`}>
                      {note.type === 'document' && <FileText className="w-5 h-5" />}
                      {note.type === 'audio' && <Mic className="w-5 h-5" />}
                      {note.type === 'video' && <Video className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{note.title}</h3>
                      <p className="text-sm text-slate-500">{note.date}</p>
                    </div>
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Study Tools */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-slate-900">Herramientas IA</h2>
          
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
            <Sparkles className="w-8 h-8 mb-4 text-indigo-100" />
            <h3 className="text-xl font-bold mb-2">Generador de Estudio</h3>
            <p className="text-indigo-100 text-sm mb-6">Convierte tus apuntes en resúmenes, flashcards o presentaciones al instante.</p>
            <Link href="/study" className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm inline-flex items-center gap-2 hover:bg-indigo-50 transition-colors w-full justify-center">
              Comenzar a crear
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Sugerencias</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                <p className="text-sm text-slate-600">Repasa <span className="font-semibold text-slate-900">Física Cuántica</span>, hace 3 días que no lo ves.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                <p className="text-sm text-slate-600">Tienes 2 audios sin transcribir de la semana pasada.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
