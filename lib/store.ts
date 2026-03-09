export const defaultNotes = [
  { id: 1, title: 'Revolución Industrial', subject: 'Historia Contemporánea', type: 'document', date: 'Hoy, 10:30 AM', rawDate: new Date().toISOString().split('T')[0], tags: ['Examen'], color: 'bg-blue-100 text-blue-600', content: 'La Revolución Industrial marcó un punto de inflexión en la historia, modificando e influenciando todos los aspectos de la vida cotidiana de una u otra manera. La producción tanto agrícola como de la naciente industria se multiplicó a la vez que disminuía el tiempo de producción.' },
  { id: 2, title: 'Clase 5', subject: 'Física Cuántica', type: 'audio', date: 'Ayer, 14:00 PM', rawDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], tags: ['Audio'], color: 'bg-orange-100 text-orange-600' },
  { id: 3, title: 'Seminario', subject: 'Biología', type: 'video', date: 'Lun, 09:15 AM', rawDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], tags: ['Seminario'], color: 'bg-purple-100 text-purple-600' },
  { id: 4, title: 'Apuntes', subject: 'Matemáticas Discretas', type: 'document', date: 'Mar, 11:00 AM', rawDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], tags: ['Práctica'], color: 'bg-blue-100 text-blue-600', content: 'Lógica proposicional, teoría de conjuntos, combinatoria y grafos.' },
  { id: 5, title: 'Grabación', subject: 'Literatura', type: 'audio', date: 'Mié, 16:30 PM', rawDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], tags: ['Análisis'], color: 'bg-orange-100 text-orange-600' },
];

export const defaultSubjects = [
  { id: '1', name: 'Historia Contemporánea', color: 'bg-blue-100 text-blue-600' },
  { id: '2', name: 'Física Cuántica', color: 'bg-orange-100 text-orange-600' },
  { id: '3', name: 'Biología', color: 'bg-purple-100 text-purple-600' },
  { id: '4', name: 'Matemáticas Discretas', color: 'bg-emerald-100 text-emerald-600' },
  { id: '5', name: 'Literatura', color: 'bg-rose-100 text-rose-600' },
];

export const defaultSchedules = [
  { id: '1', subjectName: 'Historia Contemporánea', dayOfWeek: 1, startTime: '10:30', endTime: '12:00' },
  { id: '2', subjectName: 'Física Cuántica', dayOfWeek: 2, startTime: '14:00', endTime: '16:00' },
];

export const defaultGrades = [
  { id: '1', subjectName: 'Historia Contemporánea', title: 'Examen Parcial 1', score: 8.5, maxScore: 10, date: '2026-02-15' },
  { id: '2', subjectName: 'Historia Contemporánea', title: 'Ensayo', score: 9.0, maxScore: 10, date: '2026-03-01' },
  { id: '3', subjectName: 'Física Cuántica', title: 'Práctica 1', score: 85, maxScore: 100, date: '2026-02-20' },
];

export const defaultUpcomingTests = [
  { id: '1', subjectName: 'Biología', title: 'Examen Final', date: '2026-03-15' },
  { id: '2', subjectName: 'Matemáticas Discretas', title: 'Control 2', date: '2026-03-20' },
];

export function getNotes() {
  if (typeof window === 'undefined') return defaultNotes;
  const saved = localStorage.getItem('studysync_notes');
  if (!saved) {
    localStorage.setItem('studysync_notes', JSON.stringify(defaultNotes));
    return defaultNotes;
  }
  return JSON.parse(saved);
}

export function addNote(note: any) {
  const notes = getNotes();
  const newNote = { ...note, id: Date.now().toString() };
  notes.unshift(newNote);
  localStorage.setItem('studysync_notes', JSON.stringify(notes));
  return newNote;
}

export function getSubjects() {
  if (typeof window === 'undefined') return defaultSubjects;
  const saved = localStorage.getItem('studysync_subjects');
  if (!saved) {
    localStorage.setItem('studysync_subjects', JSON.stringify(defaultSubjects));
    return defaultSubjects;
  }
  return JSON.parse(saved);
}

export function addSubject(subject: any) {
  const subjects = getSubjects();
  const newSubject = { ...subject, id: Date.now().toString() };
  subjects.push(newSubject);
  localStorage.setItem('studysync_subjects', JSON.stringify(subjects));
  return newSubject;
}

export function deleteSubject(id: string) {
  const subjects = getSubjects();
  const updated = subjects.filter((s: any) => s.id !== id);
  localStorage.setItem('studysync_subjects', JSON.stringify(updated));
}

export function getSchedules() {
  if (typeof window === 'undefined') return defaultSchedules;
  const saved = localStorage.getItem('studysync_schedules');
  if (!saved) {
    localStorage.setItem('studysync_schedules', JSON.stringify(defaultSchedules));
    return defaultSchedules;
  }
  return JSON.parse(saved);
}

export function addSchedule(schedule: any) {
  const schedules = getSchedules();
  const newSchedule = { ...schedule, id: Date.now().toString() };
  schedules.push(newSchedule);
  localStorage.setItem('studysync_schedules', JSON.stringify(schedules));
  return newSchedule;
}

export function deleteSchedule(id: string) {
  const schedules = getSchedules();
  const updated = schedules.filter((s: any) => s.id !== id);
  localStorage.setItem('studysync_schedules', JSON.stringify(updated));
}

export function getGrades() {
  if (typeof window === 'undefined') return defaultGrades;
  const saved = localStorage.getItem('studysync_grades');
  if (!saved) {
    localStorage.setItem('studysync_grades', JSON.stringify(defaultGrades));
    return defaultGrades;
  }
  return JSON.parse(saved);
}

export function addGrade(grade: any) {
  const grades = getGrades();
  const newGrade = { ...grade, id: Date.now().toString() };
  grades.unshift(newGrade);
  localStorage.setItem('studysync_grades', JSON.stringify(grades));
  return newGrade;
}

export function deleteGrade(id: string) {
  const grades = getGrades();
  const updated = grades.filter((g: any) => g.id !== id);
  localStorage.setItem('studysync_grades', JSON.stringify(updated));
}

export function getUpcomingTests() {
  if (typeof window === 'undefined') return defaultUpcomingTests;
  const saved = localStorage.getItem('studysync_upcoming_tests');
  if (!saved) {
    localStorage.setItem('studysync_upcoming_tests', JSON.stringify(defaultUpcomingTests));
    return defaultUpcomingTests;
  }
  return JSON.parse(saved);
}

export function addUpcomingTest(test: any) {
  const tests = getUpcomingTests();
  const newTest = { ...test, id: Date.now().toString() };
  tests.push(newTest);
  // Sort by date ascending
  tests.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  localStorage.setItem('studysync_upcoming_tests', JSON.stringify(tests));
  return newTest;
}

export function deleteUpcomingTest(id: string) {
  const tests = getUpcomingTests();
  const updated = tests.filter((t: any) => t.id !== id);
  localStorage.setItem('studysync_upcoming_tests', JSON.stringify(updated));
}
