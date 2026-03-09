'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, BookOpen } from 'lucide-react';
import { getSubjects, addSubject, deleteSubject, getSchedules, addSchedule, deleteSchedule } from '@/lib/store';

const DAYS_OF_WEEK = [
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sábado' },
  { id: 0, name: 'Domingo' },
];

const COLORS = [
  { id: 'blue', class: 'bg-blue-100 text-blue-600', name: 'Azul' },
  { id: 'orange', class: 'bg-orange-100 text-orange-600', name: 'Naranja' },
  { id: 'purple', class: 'bg-purple-100 text-purple-600', name: 'Morado' },
  { id: 'emerald', class: 'bg-emerald-100 text-emerald-600', name: 'Verde' },
  { id: 'rose', class: 'bg-rose-100 text-rose-600', name: 'Rosa' },
  { id: 'slate', class: 'bg-slate-100 text-slate-600', name: 'Gris' },
];

export default function SettingsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  // Form states for new subject
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState(COLORS[0].class);

  // Form states for new schedule
  const [newScheduleSubject, setNewScheduleSubject] = useState('');
  const [newScheduleDay, setNewScheduleDay] = useState(1);
  const [newScheduleStart, setNewScheduleStart] = useState('08:00');
  const [newScheduleEnd, setNewScheduleEnd] = useState('10:00');

  useEffect(() => {
    const loadData = () => {
      const loadedSubjects = getSubjects();
      setSubjects(loadedSubjects);
      if (loadedSubjects.length > 0) {
        setNewScheduleSubject(loadedSubjects[0].name);
      }
      setSchedules(getSchedules());
    };
    loadData();
  }, []);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    
    const newSubject = addSubject({
      name: newSubjectName,
      color: newSubjectColor
    });
    
    setSubjects([...subjects, newSubject]);
    setNewSubjectName('');
    if (subjects.length === 0) {
      setNewScheduleSubject(newSubject.name);
    }
  };

  const handleDeleteSubject = (id: string) => {
    deleteSubject(id);
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleSubject) return;

    const newSchedule = addSchedule({
      subjectName: newScheduleSubject,
      dayOfWeek: newScheduleDay,
      startTime: newScheduleStart,
      endTime: newScheduleEnd
    });

    setSchedules([...schedules, newSchedule]);
  };

  const handleDeleteSchedule = (id: string) => {
    deleteSchedule(id);
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const getDayName = (dayId: number) => {
    return DAYS_OF_WEEK.find(d => d.id === dayId)?.name || '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-bold font-display text-slate-900 tracking-tight">Configuración</h1>
        <p className="text-slate-500 mt-2 text-lg">Gestiona tus materias y horarios de clase.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subjects Section */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Materias</h2>
          </div>

          <form onSubmit={handleAddSubject} className="mb-8 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Nombre de la Materia</label>
              <input 
                type="text" 
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Ej: Historia Contemporánea" 
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setNewSubjectColor(color.class)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${color.class} ${newSubjectColor === color.class ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <button 
              type="submit"
              disabled={!newSubjectName.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Añadir Materia
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tus Materias</h3>
            {subjects.length === 0 ? (
              <p className="text-slate-500 text-sm">No has añadido ninguna materia aún.</p>
            ) : (
              <ul className="space-y-2">
                {subjects.map(subject => (
                  <li key={subject.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${subject.color.split(' ')[0]}`}></div>
                      <span className="font-medium text-slate-700">{subject.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Eliminar materia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Schedules Section */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Horarios</h2>
          </div>

          <form onSubmit={handleAddSchedule} className="mb-8 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Materia</label>
              <select 
                value={newScheduleSubject}
                onChange={(e) => setNewScheduleSubject(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-white"
                disabled={subjects.length === 0}
              >
                {subjects.length === 0 ? (
                  <option value="">Añade una materia primero</option>
                ) : (
                  subjects.map(subject => (
                    <option key={subject.id} value={subject.name}>{subject.name}</option>
                  ))
                )}
              </select>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 sm:col-span-1">
                <label className="block text-sm font-semibold text-slate-900 mb-2">Día</label>
                <select 
                  value={newScheduleDay}
                  onChange={(e) => setNewScheduleDay(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-white"
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day.id} value={day.id}>{day.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3 sm:col-span-1">
                <label className="block text-sm font-semibold text-slate-900 mb-2">Inicio</label>
                <input 
                  type="time" 
                  value={newScheduleStart}
                  onChange={(e) => setNewScheduleStart(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <label className="block text-sm font-semibold text-slate-900 mb-2">Fin</label>
                <input 
                  type="time" 
                  value={newScheduleEnd}
                  onChange={(e) => setNewScheduleEnd(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={!newScheduleSubject || subjects.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Añadir Horario
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tus Horarios</h3>
            {schedules.length === 0 ? (
              <p className="text-slate-500 text-sm">No has añadido ningún horario aún.</p>
            ) : (
              <ul className="space-y-2">
                {schedules.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)).map(schedule => {
                  const subject = subjects.find(s => s.name === schedule.subjectName);
                  const colorClass = subject ? subject.color.split(' ')[0] : 'bg-slate-100';
                  
                  return (
                    <li key={schedule.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                        <div>
                          <p className="font-medium text-slate-700 text-sm">{schedule.subjectName}</p>
                          <p className="text-xs text-slate-500">{getDayName(schedule.dayOfWeek)} • {schedule.startTime} - {schedule.endTime}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar horario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
