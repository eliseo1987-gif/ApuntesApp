'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, GraduationCap, Award, TrendingUp, Calendar as CalendarIcon, ChevronDown, ChevronUp, BarChart3, Table } from 'lucide-react';
import { getSubjects, getGrades, addGrade, deleteGrade, getUpcomingTests, addUpcomingTest, deleteUpcomingTest } from '@/lib/store';

export default function GradesPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<any[]>([]);

  // Grade form state
  const [newSubject, setNewSubject] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newScore, setNewScore] = useState('');
  const [newMaxScore, setNewMaxScore] = useState('10');

  // Upcoming test form state
  const [testSubject, setTestSubject] = useState('');
  const [testTitle, setTestTitle] = useState('');
  const [testDate, setTestDate] = useState('');

  // Chart state
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const loadedSubjects = getSubjects();
      setSubjects(loadedSubjects);
      if (loadedSubjects.length > 0) {
        setNewSubject(loadedSubjects[0].name);
        setTestSubject(loadedSubjects[0].name);
      }
      setGrades(getGrades());
      setUpcomingTests(getUpcomingTests());
    };
    loadData();
  }, []);

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newTitle || !newScore || !newMaxScore) return;

    const grade = addGrade({
      subjectName: newSubject,
      title: newTitle,
      score: parseFloat(newScore),
      maxScore: parseFloat(newMaxScore),
      date: new Date().toISOString().split('T')[0]
    });

    setGrades([grade, ...grades]);
    setNewTitle('');
    setNewScore('');
  };

  const handleDeleteGrade = (id: string) => {
    deleteGrade(id);
    setGrades(grades.filter(g => g.id !== id));
  };

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSubject || !testTitle || !testDate) return;

    const newTest = addUpcomingTest({
      subjectName: testSubject,
      title: testTitle,
      date: testDate
    });

    // Re-sort the local state to match the store
    const updatedTests = [...upcomingTests, newTest].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setUpcomingTests(updatedTests);
    setTestTitle('');
    setTestDate('');
  };

  const handleDeleteTest = (id: string) => {
    deleteUpcomingTest(id);
    setUpcomingTests(upcomingTests.filter(t => t.id !== id));
  };

  const gradesBySubject = subjects.map(subject => {
    const subjectGrades = grades.filter(g => g.subjectName === subject.name);
    let average = 0;
    let percentage = 0;
    if (subjectGrades.length > 0) {
      const totalScore = subjectGrades.reduce((acc, g) => acc + (g.score / g.maxScore), 0);
      percentage = (totalScore / subjectGrades.length) * 100;
      average = percentage;
    }
    return {
      ...subject,
      grades: subjectGrades,
      average: percentage
    };
  });

  const chartData = gradesBySubject.filter(s => s.grades.length > 0).map(s => ({
    name: s.name,
    promedio: parseFloat(s.average.toFixed(1)),
    color: s.color.split(' ')[0].replace('bg-', '').replace('-100', '-500') // Extract a color for the chart
  }));

  // Helper to map tailwind color names to hex for Recharts
  const getHexColor = (colorClass: string) => {
    if (colorClass.includes('blue')) return '#3b82f6';
    if (colorClass.includes('emerald')) return '#10b981';
    if (colorClass.includes('rose')) return '#f43f5e';
    if (colorClass.includes('amber')) return '#f59e0b';
    if (colorClass.includes('purple')) return '#a855f7';
    if (colorClass.includes('indigo')) return '#6366f1';
    return '#94a3b8'; // default slate
  };

  const columns = ['F1', '1P', 'F2', '2P', 'F3', '3P', 'FT', 'EF', 'PGE', 'EXF', 'TSF', 'PFE'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold font-display text-slate-900 tracking-tight">Calificaciones</h1>
          <p className="text-slate-500 mt-2 text-lg">Registra tus notas y haz seguimiento de tu progreso.</p>
        </div>
        <button 
          onClick={() => setShowChart(!showChart)}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm"
        >
          <Table className="w-5 h-5 text-indigo-600" />
          {showChart ? 'Ocultar Cuadro' : 'Ver Cuadro'}
          {showChart ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </button>
      </header>

      {/* Collapsible Chart Section */}
      {showChart && subjects.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 overflow-x-auto">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" /> Cuadro de Calificaciones
          </h3>
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
      
      {showChart && subjects.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center animate-in fade-in slide-in-from-top-4 duration-300">
          <Table className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No hay materias</h3>
          <p className="text-slate-500 mt-2">Añade algunas materias para ver tu cuadro de calificaciones.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-1 space-y-8">
          {/* Add Grade Form */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Añadir Nota</h2>
            </div>

            <form onSubmit={handleAddGrade} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Materia</label>
                <select 
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-white"
                  disabled={subjects.length === 0}
                >
                  {subjects.length === 0 ? (
                    <option value="">Añade una materia en Configuración</option>
                  ) : (
                    subjects.map(subject => (
                      <option key={subject.id} value={subject.name}>{subject.name}</option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Título (ej. Parcial 1)</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Examen Parcial" 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Nota</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    placeholder="8.5" 
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Nota Máxima</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(e.target.value)}
                    placeholder="10" 
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={!newSubject || !newTitle || !newScore || !newMaxScore || subjects.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 mt-4"
              >
                <Plus className="w-4 h-4" />
                Guardar Calificación
              </button>
            </form>
          </section>

          {/* Add Upcoming Test Form */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Próxima Prueba</h2>
            </div>

            <form onSubmit={handleAddTest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Materia</label>
                <select 
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm bg-white"
                  disabled={subjects.length === 0}
                >
                  {subjects.length === 0 ? (
                    <option value="">Añade una materia en Configuración</option>
                  ) : (
                    subjects.map(subject => (
                      <option key={subject.id} value={subject.name}>{subject.name}</option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Título de la Prueba</label>
                <input 
                  type="text" 
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="Examen Final" 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Fecha</label>
                <input 
                  type="date" 
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                />
              </div>

              <button 
                type="submit"
                disabled={!testSubject || !testTitle || !testDate || subjects.length === 0}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 mt-4"
              >
                <Plus className="w-4 h-4" />
                Agendar Prueba
              </button>
            </form>
          </section>
        </div>

        {/* Right Column: Lists */}
        <section className="lg:col-span-2 space-y-8">
          {/* Upcoming Tests List */}
          {upcomingTests.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Próximas Evaluaciones</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingTests.map(test => {
                  const subject = subjects.find(s => s.name === test.subjectName);
                  const colorClass = subject ? subject.color : 'bg-slate-100 text-slate-600';
                  
                  // Format date nicely
                  const dateObj = new Date(test.date);
                  // Add timezone offset to prevent date shifting
                  dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
                  const formattedDate = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
                  
                  // Calculate days left
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const diffTime = Math.abs(dateObj.getTime() - today.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const isPast = dateObj < today;

                  return (
                    <div key={test.id} className="flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50 relative group">
                      <button 
                        onClick={() => handleDeleteTest(test.id)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar prueba"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${colorClass}`}>
                          {test.subjectName}
                        </span>
                        <span className={`text-xs font-bold ${isPast ? 'text-slate-400' : diffDays <= 3 ? 'text-rose-600' : 'text-slate-500'}`}>
                          {isPast ? 'Pasado' : diffDays === 0 ? '¡Hoy!' : `En ${diffDays} días`}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">{test.title}</h4>
                      <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-sm font-medium">
                        <CalendarIcon className="w-4 h-4" />
                        {formattedDate}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grades List */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 px-1">Historial de Calificaciones</h3>
            {gradesBySubject.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">No hay materias</h3>
                <p className="text-slate-500 mt-2">Ve a Configuración para añadir tus materias primero.</p>
              </div>
            ) : (
              gradesBySubject.map(subject => (
                <div key={subject.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${subject.color.split(' ')[0]}`}></div>
                      <h3 className="text-xl font-bold text-slate-900">{subject.name}</h3>
                    </div>
                    {subject.grades.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <TrendingUp className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-700">
                          Promedio: {subject.average.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {subject.grades.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No hay calificaciones registradas.</p>
                  ) : (
                    <div className="space-y-3">
                      {subject.grades.map((grade: any) => (
                        <div key={grade.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${subject.color}`}>
                              <Award className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{grade.title}</p>
                              <p className="text-xs text-slate-500">{grade.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-lg font-bold text-slate-900">{grade.score} <span className="text-sm font-medium text-slate-400">/ {grade.maxScore}</span></p>
                              <p className="text-xs font-medium text-slate-500">{((grade.score / grade.maxScore) * 100).toFixed(1)}%</p>
                            </div>
                            <button 
                              onClick={() => handleDeleteGrade(grade.id)}
                              className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Eliminar calificación"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
