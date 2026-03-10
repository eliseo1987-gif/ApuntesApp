'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Mic, Video, Plus, ArrowRight, Clock, Calendar as CalendarIcon, Sparkles, TrendingUp, Trash2, X, Table } from 'lucide-react';
import { getNotes, getGrades, getSubjects, getSchedules, addSchedule, deleteSchedule, subscribeToNotes, subscribeToData } from '@/lib/store';

export default function Dashboard() {
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);

  // Schedule form state
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newScheduleSubject, setNewScheduleSubject] = useState('');
  const [newScheduleDay, setNewScheduleDay] = useState('1');
  const [newScheduleStart, setNewScheduleStart] = useState('08:00');
  const [newScheduleEnd, setNewScheduleEnd] = useState('10:00');

  useEffect(() => {
    // Real-time Notes
    const unsubscribeNotes = subscribeToNotes((loadedNotes) => {
      setTotalNotes(loadedNotes.length);
      setRecentNotes(loadedNotes.slice(0, 3));
    }) as () => void;

    // Real-time Subjects
    const unsubscribeSubjects = subscribeToData('subjects', (loadedSubjects) => {
      setSubjects(loadedSubjects);
      if (loadedSubjects.length > 0) {
        setNewScheduleSubject(prev => prev || loadedSubjects[0].name);
      }
    }) as () => void;

    // Real-time Schedules
    const unsubscribeSchedules = subscribeToData('schedules', (loadedSchedules) => {
      setSchedules(loadedSchedules);
    }) as () => void;

    // Real-time Grades
    const unsubscribeGrades = subscribeToData('grades', (loadedGrades) => {
      setGrades(loadedGrades);
    }) as () => void;

    return () => {
      unsubscribeNotes();
      unsubscribeSubjects();
      unsubscribeSchedules();
      unsubscribeGrades();
    };
  }, []);

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleSubject || !newScheduleDay || !newScheduleStart || !newScheduleEnd) return;

    const schedule = addSchedule({
      subjectName: newScheduleSubject,
      dayOfWeek: parseInt(newScheduleDay),
      startTime: newScheduleStart,
      endTime: newScheduleEnd
    });

    setSchedules([...schedules, schedule]);
    setShowScheduleForm(false);
  };

  const handleDeleteSchedule = (id: string) => {
    deleteSchedule(id);
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const days = [
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
  ];

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

  const getScheduleStyle = (schedule: any) => {
    const startParts = schedule.startTime.split(':');
    const endParts = schedule.endTime.split(':');

    const startHour = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
    const endHour = parseInt(endParts[0]) + parseInt(endParts[1]) / 60;

    const top = (startHour - 8) * 60; // 60px per hour, starting at 8:00
    const height = (endHour - startHour) * 60;

    const subject = subjects.find(s => s.name === schedule.subjectName);
    const colorClass = subject ? subject.color : 'bg-slate-100 text-slate-600';

    return { top: `${top}px`, height: `${height}px`, colorClass };
  };

  const columns = ['F1', '1P', 'F2', '2P', 'F3', '3P', 'FT', 'EF', 'PGE', 'EXF', 'TSF', 'PFE'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">Hola, Eliseo 👋</h1>
          <p className="text-slate-500 mt-2 text-base sm:text-lg">¿Qué vamos a estudiar hoy?</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href="/notes/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm w-full sm:w-auto">
            <Plus className="w-5 h-5" />
            <span>Nuevo Apunte</span>
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
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Grades Table Section */}
          {subjects.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                    <Table className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">Cuadro de Calificaciones</h2>
                </div>
                <Link href="/grades" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1 shrink-0">
                  Ver detalles <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="min-w-[800px]">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-200 text-slate-700 font-bold text-xs uppercase border border-slate-400">
                    <tr>
                      <th className="px-4 py-2 border border-slate-400">MATERIAS</th>
                      {columns.map(col => (
                        <th key={col} className="px-2 py-2 border border-slate-400 text-center">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => {
                      const subjectGrades = grades.filter(g => g.subjectName === subject.name);
                      const getGrade = (title: string) => {
                        const g = subjectGrades.find(g => g.title.toUpperCase() === title);
                        return g ? g.score : '';
                      };
                      return (
                        <tr key={subject.id} className="border-b border-slate-300 hover:bg-slate-50">
                          <td className="px-4 py-2 border border-slate-300 font-medium text-slate-900 uppercase">{subject.name}</td>
                          {columns.map(col => (
                            <td key={col} className="px-2 py-2 border border-slate-300 text-center">{getGrade(col)}</td>
                          ))}
                        </tr>
                      );
                    })}
                    {/* Promedio row */}
                    <tr className="bg-slate-100 font-bold">
                      <td className="px-4 py-2 border border-slate-300 uppercase">PROMEDIO</td>
                      {columns.map(col => {
                        const allScores = grades.filter(g => g.title.toUpperCase() === col).map(g => g.score);
                        const avg = allScores.length > 0 ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : '';
                        return <td key={col} className="px-2 py-2 border border-slate-300 text-center">{avg}</td>;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Weekly Schedule Module */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">Horario Semanal</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Organiza tus clases por hora</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleForm(!showScheduleForm)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm text-sm w-full sm:w-auto"
              >
                {showScheduleForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showScheduleForm ? 'Cancelar' : 'Añadir Clase'}
              </button>
            </div>

            {showScheduleForm && (
              <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <form onSubmit={handleAddSchedule} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                  <div className="sm:col-span-2 md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Materia</label>
                    <select
                      value={newScheduleSubject}
                      onChange={(e) => setNewScheduleSubject(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                      disabled={subjects.length === 0}
                    >
                      {subjects.length === 0 ? (
                        <option value="">Añade materias primero</option>
                      ) : (
                        subjects.map(subject => (
                          <option key={subject.id} value={subject.name}>{subject.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Día</label>
                    <select
                      value={newScheduleDay}
                      onChange={(e) => setNewScheduleDay(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                    >
                      {days.map(day => (
                        <option key={day.id} value={day.id}>{day.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hora</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="time"
                        value={newScheduleStart}
                        onChange={(e) => setNewScheduleStart(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="time"
                        value={newScheduleEnd}
                        onChange={(e) => setNewScheduleEnd(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={!newScheduleSubject || subjects.length === 0}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 text-sm"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="p-4 sm:p-6 overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Schedule Grid Header */}
                <div className="grid grid-cols-6 border-b border-slate-200 pb-2 mb-2">
                  <div className="text-xs font-semibold text-slate-400 text-center">Hora</div>
                  {days.map(day => (
                    <div key={day.id} className="text-sm font-bold text-slate-700 text-center">{day.name}</div>
                  ))}
                </div>

                {/* Schedule Grid Body */}
                <div className="relative" style={{ height: `${12 * 60}px` }}> {/* 12 hours * 60px */}
                  {/* Background grid lines */}
                  {hours.slice(0, -1).map((hour, index) => (
                    <div key={hour} className="absolute w-full flex border-b border-slate-100" style={{ top: `${index * 60}px`, height: '60px' }}>
                      <div className="w-1/6 text-xs font-medium text-slate-400 text-center relative -top-2 pr-2">
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </div>
                      <div className="w-5/6 grid grid-cols-5">
                        <div className="border-l border-slate-100 h-full"></div>
                        <div className="border-l border-slate-100 h-full"></div>
                        <div className="border-l border-slate-100 h-full"></div>
                        <div className="border-l border-slate-100 h-full"></div>
                        <div className="border-l border-slate-100 h-full"></div>
                      </div>
                    </div>
                  ))}

                  {/* Schedule Items */}
                  <div className="absolute top-0 left-0 w-full h-full flex">
                    <div className="w-1/6"></div> {/* Time column spacer */}
                    <div className="w-5/6 grid grid-cols-5 relative">
                      {days.map((day, dayIndex) => (
                        <div key={day.id} className="relative h-full">
                          {schedules.filter(s => s.dayOfWeek === day.id).map(schedule => {
                            const style = getScheduleStyle(schedule);
                            return (
                              <div
                                key={schedule.id}
                                className={`absolute left-1 right-1 rounded-lg p-2 border border-white/20 shadow-sm overflow-hidden group ${style.colorClass}`}
                                style={{ top: style.top, height: style.height }}
                              >
                                <button
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                  className="absolute top-1 right-1 p-1 bg-white/50 hover:bg-white rounded-md text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <p className="font-bold text-xs leading-tight mb-1">{schedule.subjectName}</p>
                                <p className="text-[10px] opacity-80 font-medium">{schedule.startTime} - {schedule.endTime}</p>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
