import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  onSnapshot,
  deleteDoc,
  Timestamp,
  orderBy,
  where
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

// --- Types ---
export interface Note {
  id: string;
  title: string;
  subject: string;
  type: 'document' | 'audio' | 'video' | 'image';
  content?: string;
  date: string;
  rawDate: string;
  tags: string[];
  color: string;
  userId?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  userId?: string;
}

export interface Schedule {
  id: string;
  subjectName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  userId?: string;
}

export interface Grade {
  id: string;
  subjectName: string;
  title: string;
  score: number;
  maxScore: number;
  date: string;
  userId?: string;
}

export interface ThemePreference {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  isDarkMode: boolean;
  userId?: string;
}

export const defaultTheme: ThemePreference = {
  primaryColor: '#4f46e5', // indigo-600
  backgroundColor: '#f8fafc', // slate-50
  fontFamily: 'Inter',
  isDarkMode: false,
};

// --- Defaults ---
export const defaultNotes: Note[] = [
  { id: '1', title: 'Revolución Industrial', subject: 'Historia Contemporánea', type: 'document', date: 'Hoy, 10:30 AM', rawDate: new Date().toISOString().split('T')[0], tags: ['Examen'], color: 'bg-blue-100 text-blue-600', content: 'La Revolución Industrial marcó un punto de inflexión en la historia...' },
  { id: '2', title: 'Clase 5', subject: 'Física Cuántica', type: 'audio', date: 'Ayer, 14:00 PM', rawDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], tags: ['Audio'], color: 'bg-orange-100 text-orange-600' },
];

export const defaultSubjects: Subject[] = [
  { id: '1', name: 'Historia Contemporánea', color: 'bg-blue-100 text-blue-600' },
  { id: '2', name: 'Física Cuántica', color: 'bg-orange-100 text-orange-600' },
  { id: '3', name: 'Biología', color: 'bg-purple-100 text-purple-600' },
];

// --- Store Implementation ---

// Initialize Auth
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
      }
    }
  });
}

// Helper to get collection with userId
const getCol = (name: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return collection(db, 'users', user.uid, name);
};

// --- Sync Functions (Superpowers) ---

export function subscribeToNotes(callback: (notes: Note[]) => void) {
  if (typeof window === 'undefined') return () => { };

  return onAuthStateChanged(auth, (user) => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'notes'), orderBy('rawDate', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Note[];
        if (notes.length === 0) {
          // If Firestore is empty, check localStorage or use defaults
          const local = localStorage.getItem('studysync_notes');
          if (!local) {
            defaultNotes.forEach(n => addNote(n));
          } else {
            const parsed = JSON.parse(local);
            parsed.forEach((n: any) => addNote(n));
            localStorage.removeItem('studysync_notes'); // Migration done
          }
        }
        callback(notes);
      });
    }
  });
}

// --- Simplified API for compatibility ---

export function getNotes(): Note[] {
  if (typeof window === 'undefined') return defaultNotes;
  const saved = localStorage.getItem('studysync_notes');
  return saved ? JSON.parse(saved) : defaultNotes;
}

export async function addNote(note: Partial<Note>) {
  const user = auth.currentUser;
  if (!user) return null;

  const id = Date.now().toString();
  const newNote = { ...note, id, userId: user.uid } as Note;

  await setDoc(doc(db, 'users', user.uid, 'notes', id), newNote);
  return newNote;
}

export async function updateNote(id: string, data: Partial<Note>) {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, 'users', user.uid, 'notes', id), data, { merge: true });
}

export function subscribeToNote(id: string, callback: (note: Note | null) => void) {
  if (typeof window === 'undefined') return () => { };
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      return onSnapshot(doc(db, 'users', user.uid, 'notes', id), (snapshot) => {
        if (snapshot.exists()) {
          callback({ ...snapshot.data(), id: snapshot.id } as Note);
        } else {
          callback(null);
        }
      });
    }
  });
}

export function getSubjects(): Subject[] {
  if (typeof window === 'undefined') return defaultSubjects;
  const saved = localStorage.getItem('studysync_subjects');
  return saved ? JSON.parse(saved) : defaultSubjects;
}

export async function addSubject(subject: Partial<Subject>) {
  const user = auth.currentUser;
  if (!user) return null;
  const id = Date.now().toString();
  const data = { ...subject, id, userId: user.uid };
  await setDoc(doc(db, 'users', user.uid, 'subjects', id), data);
  return data;
}

export async function deleteSubject(id: string) {
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(db, 'users', user.uid, 'subjects', id));
}

// --- Specific Syncs for Other Collections ---

export function subscribeToData(colName: string, callback: (data: any[]) => void) {
  if (typeof window === 'undefined') return () => { };
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, colName));
      return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      });
    }
  });
}

// --- Sincronización (Superpoderes) ---
export function getGrades() { return []; }
export function getSchedules() { return []; }

export async function addSchedule(s: any) {
  const user = auth.currentUser;
  if (!user) return;
  const id = Date.now().toString();
  await setDoc(doc(db, 'users', user.uid, 'schedules', id), { ...s, id });
}

export async function deleteSchedule(id: string) {
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(db, 'users', user.uid, 'schedules', id));
}

// --- Grades ---
export async function addGrade(grade: any) {
  const user = auth.currentUser;
  if (!user) return null;
  const id = Date.now().toString();
  const data = { ...grade, id, userId: user.uid };
  await setDoc(doc(db, 'users', user.uid, 'grades', id), data);
  return data;
}

export async function deleteGrade(id: string) {
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(db, 'users', user.uid, 'grades', id));
}

// --- Upcoming Tests ---
export function getUpcomingTests(): any[] {
  return []; // Mock for immediate build fix, real-time subscribe should be used
}

export async function addUpcomingTest(test: any) {
  const user = auth.currentUser;
  if (!user) return null;
  const id = Date.now().toString();
  const data = { ...test, id, userId: user.uid };
  await setDoc(doc(db, 'users', user.uid, 'upcoming_tests', id), data);
  return data;
}

export async function deleteUpcomingTest(id: string) {
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(db, 'users', user.uid, 'upcoming_tests', id));
}

// --- Theme ---
export function subscribeToTheme(callback: (theme: ThemePreference) => void) {
  if (typeof window === 'undefined') return () => { };
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      return onSnapshot(doc(db, 'users', user.uid, 'settings', 'theme'), (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as ThemePreference);
        } else {
          callback(defaultTheme);
        }
      });
    } else {
      callback(defaultTheme);
    }
  });
}

export async function saveTheme(theme: Partial<ThemePreference>) {
  const user = auth.currentUser;
  if (!user) return null;
  const mergedTheme = { ...defaultTheme, ...theme, userId: user.uid };
  await setDoc(doc(db, 'users', user.uid, 'settings', 'theme'), mergedTheme, { merge: true });
  return mergedTheme;
}
