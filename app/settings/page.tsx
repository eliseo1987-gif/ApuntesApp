'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Clock, BookOpen, Palette, RotateCcw, Moon, Sun, Type } from 'lucide-react';
import { subscribeToData, addSubject, deleteSubject, addSchedule, deleteSchedule, subscribeToTheme, saveTheme, defaultTheme, ThemePreference } from '@/lib/store';

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

const FONTS = [
  { id: 'Inter', label: 'Inter', style: 'font-[Inter,sans-serif]', preview: 'Aa — Limpia y funcional' },
  { id: 'Montserrat', label: 'Montserrat', style: 'font-[Montserrat,sans-serif]', preview: 'Aa — Moderna y geométrica' },
  { id: 'Outfit', label: 'Outfit', style: 'font-[Outfit,sans-serif]', preview: 'Aa — Futurista y elegante' },
  { id: 'Merriweather', label: 'Merriweather', style: 'font-[Merriweather,serif]', preview: 'Aa — Clásica y formal' },
];

const PRIMARY_PALETTE = [
  { hex: '#4f46e5', name: 'Índigo' },
  { hex: '#7c3aed', name: 'Violeta' },
  { hex: '#db2777', name: 'Rosa Intenso' },
  { hex: '#0ea5e9', name: 'Azul Cielo' },
  { hex: '#10b981', name: 'Esmeralda' },
  { hex: '#f59e0b', name: 'Ámbar' },
  { hex: '#ef4444', name: 'Rojo Rubí' },
  { hex: '#64748b', name: 'Pizarra' },
];

const BG_PALETTE = [
  { hex: '#f8fafc', name: 'Blanco Nieve' },
  { hex: '#fffbeb', name: 'Papel Cálido' },
  { hex: '#f0fdf4', name: 'Verde Menta' },
  { hex: '#eff6ff', name: 'Azul Cielo Suave' },
  { hex: '#fdf4ff', name: 'Lavanda Pálida' },
  { hex: '#1e1b4b', name: 'Índigo Oscuro' },
  { hex: '#0f172a', name: 'Dark Deep' },
  { hex: '#18181b', name: 'Zinc Negro' },
];

export default function SettingsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [theme, setTheme] = useState<ThemePreference>(defaultTheme);
  const [savingTheme, setSavingTheme] = useState(false);

  // Form states for new subject
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState(COLORS[0].class);

  // Form states for new schedule
  const [newScheduleSubject, setNewScheduleSubject] = useState('');
  const [newScheduleDay, setNewScheduleDay] = useState(1);
  const [newScheduleStart, setNewScheduleStart] = useState('08:00');
  const [newScheduleEnd, setNewScheduleEnd] = useState('10:00');

  useEffect(() => {
    const unsubSubjects = subscribeToData('subjects', (loadedSubjects) => {
      setSubjects(loadedSubjects);
      if (loadedSubjects.length > 0) {
        setNewScheduleSubject(prev => prev || loadedSubjects[0].name);
      }
    }) as () => void;

    const unsubSchedules = subscribeToData('schedules', (loadedSchedules) => {
      setSchedules(loadedSchedules);
    }) as () => void;

    const unsubTheme = subscribeToTheme((loadedTheme) => {
      setTheme(loadedTheme);
    }) as () => void;

    return () => {
      unsubSubjects();
      unsubSchedules();
      unsubTheme();
    };
  }, []);

  const handleThemeChange = useCallback(async (changes: Partial<ThemePreference>) => {
    const newTheme = { ...theme, ...changes };
    setTheme(newTheme);
    // Apply immediately to DOM for real-time feedback
    const root = document.documentElement;
    if (changes.primaryColor) {
      root.style.setProperty('--color-primary', changes.primaryColor);
      const hex = changes.primaryColor;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      root.style.setProperty('--color-primary-rgb', `${r}, ${g}, ${b}`);
    }
    if (changes.backgroundColor) {
      root.style.setProperty('--color-background', changes.backgroundColor);
    }
    if (changes.fontFamily) {
      const fontMap: Record<string, string> = {
        'Inter': 'var(--font-inter)',
        'Montserrat': 'var(--font-montserrat)',
        'Outfit': 'var(--font-outfit)',
        'Merriweather': 'var(--font-merriweather)',
      };
      root.style.setProperty('--font-custom', fontMap[changes.fontFamily] || 'var(--font-inter)');
    }
    if (changes.isDarkMode !== undefined) {
      changes.isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    }
    setSavingTheme(true);
    await saveTheme(newTheme);
    setSavingTheme(false);
  }, [theme]);

  const handleResetTheme = useCallback(async () => {
    setTheme(defaultTheme);
    const root = document.documentElement;
    root.style.setProperty('--color-primary', defaultTheme.primaryColor);
    root.style.setProperty('--color-primary-rgb', '79, 70, 229');
    root.style.setProperty('--color-background', defaultTheme.backgroundColor);
    root.style.setProperty('--font-custom', 'var(--font-inter)');
    root.classList.remove('dark');
    await saveTheme(defaultTheme);
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    await addSubject({
      name: newSubjectName,
      color: newSubjectColor
    });

    setNewSubjectName('');
  };

  const handleDeleteSubject = async (id: string) => {
    await deleteSubject(id);
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleSubject) return;

    await addSchedule({
      subjectName: newScheduleSubject,
      dayOfWeek: newScheduleDay,
      startTime: newScheduleStart,
      endTime: newScheduleEnd
    });
  };

  const handleDeleteSchedule = async (id: string) => {
    await deleteSchedule(id);
  };

  const getDayName = (dayId: number) => {
    return DAYS_OF_WEEK.find(d => d.id === dayId)?.name || '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Configuración</h1>
          <p className="text-slate-500 mt-2 text-lg">Gestiona tus materias, horarios y estilo visual.</p>
        </div>
      </header>

      {/* === PERSONALIZACIÓN VISUAL === */}
      <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${theme.primaryColor}20` }}>
              <Palette className="w-5 h-5" style={{ color: theme.primaryColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Personalización Visual</h2>
              <p className="text-xs text-slate-400 mt-0.5">Los cambios se aplican en tiempo real en toda la app</p>
            </div>
          </div>
          <button
            onClick={handleResetTheme}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-500 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restablecer
          </button>
        </div>

        {/* Color Principal */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-800">🎨 Color Principal (botones e íconos)</label>
          <div className="flex items-center gap-3 flex-wrap">
            {PRIMARY_PALETTE.map(c => (
              <button
                key={c.hex}
                title={c.name}
                onClick={() => handleThemeChange({ primaryColor: c.hex })}
                className="w-9 h-9 rounded-full border-2 transition-all hover:scale-110 shadow-sm"
                style={{
                  backgroundColor: c.hex,
                  borderColor: theme.primaryColor === c.hex ? '#1e293b' : 'transparent',
                  transform: theme.primaryColor === c.hex ? 'scale(1.15)' : undefined,
                }}
              />
            ))}
            {/* Libre selección */}
            <label className="relative w-9 h-9 rounded-full border-2 border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center cursor-pointer transition-all hover:scale-110 overflow-hidden" title="Color personalizado">
              <span className="text-xs text-slate-400">+</span>
              <input
                type="color"
                value={theme.primaryColor}
                onChange={e => handleThemeChange({ primaryColor: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <span className="text-xs font-mono px-2 py-1 bg-slate-100 rounded-lg text-slate-600">{theme.primaryColor}</span>
          </div>
        </div>

        {/* Color de Fondo */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-800">🖼 Color de Fondo</label>
          <div className="flex items-center gap-3 flex-wrap">
            {BG_PALETTE.map(c => (
              <button
                key={c.hex}
                title={c.name}
                onClick={() => handleThemeChange({ backgroundColor: c.hex })}
                className="w-9 h-9 rounded-full border-2 transition-all hover:scale-110 shadow-sm"
                style={{
                  backgroundColor: c.hex,
                  borderColor: theme.backgroundColor === c.hex ? '#1e293b' : '#e2e8f0',
                  transform: theme.backgroundColor === c.hex ? 'scale(1.15)' : undefined,
                }}
              />
            ))}
            <label className="relative w-9 h-9 rounded-full border-2 border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center cursor-pointer transition-all hover:scale-110 overflow-hidden" title="Color personalizado">
              <span className="text-xs text-slate-400">+</span>
              <input
                type="color"
                value={theme.backgroundColor}
                onChange={e => handleThemeChange({ backgroundColor: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <span className="text-xs font-mono px-2 py-1 bg-slate-100 rounded-lg text-slate-600">{theme.backgroundColor}</span>
          </div>
        </div>

        {/* Tipografía */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-800"><Type className="inline w-4 h-4 mr-1 mb-0.5" />Tipografía</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FONTS.map(f => (
              <button
                key={f.id}
                onClick={() => handleThemeChange({ fontFamily: f.id })}
                className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${theme.fontFamily === f.id
                    ? 'border-slate-800 bg-slate-50 shadow-sm'
                    : 'border-slate-100 hover:border-slate-300'
                  }`}
              >
                <p className={`text-lg font-bold text-slate-900 ${f.style}`}>{f.label}</p>
                <p className={`text-xs text-slate-500 mt-0.5 ${f.style}`}>{f.preview}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Modo Oscuro */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            {theme.isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className="text-sm font-semibold text-slate-800">{theme.isDarkMode ? 'Modo Oscuro Activo' : 'Modo Claro Activo'}</p>
              <p className="text-xs text-slate-400">Combínalo con un fondo oscuro para mejor experiencia</p>
            </div>
          </div>
          <button
            onClick={() => handleThemeChange({ isDarkMode: !theme.isDarkMode })}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${theme.isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${theme.isDarkMode ? 'translate-x-6' : ''
              }`} />
          </button>
        </div>

        {savingTheme && (
          <p className="text-xs text-slate-400 text-right animate-pulse">Guardando preferencias...</p>
        )}
      </section>

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
