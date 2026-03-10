'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, FileText, Mic, Video, Clock, Calendar as CalendarIcon, Image as ImageIcon } from 'lucide-react';
import { subscribeToNotes, subscribeToData } from '@/lib/store';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<any[]>([]);

  useEffect(() => {
    const unsubNotes = subscribeToNotes((loadedNotes) => {
      setNotes(loadedNotes);
    }) as () => void;

    const unsubSchedules = subscribeToData('schedules', (loadedSchedules) => {
      setSchedules(loadedSchedules);
    }) as () => void;

    const unsubSubjects = subscribeToData('subjects', (loadedSubjects) => {
      setSubjects(loadedSubjects);
    }) as () => void;

    const unsubTests = subscribeToData('upcoming_tests', (loadedTests) => {
      setUpcomingTests(loadedTests);
    }) as () => void;

    return () => {
      unsubNotes();
      unsubSchedules();
      unsubSubjects();
      unsubTests();
    };
  }, []);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const days = [];
  let day = startDate;
  let formattedDate = "";

  const notesData: Record<string, any[]> = {};
  notes.forEach(note => {
    if (note.rawDate) {
      if (!notesData[note.rawDate]) notesData[note.rawDate] = [];
      notesData[note.rawDate].push(note);
    }
  });

  const testsData: Record<string, any[]> = {};
  upcomingTests.forEach(test => {
    if (test.date) {
      if (!testsData[test.date]) testsData[test.date] = [];
      testsData[test.date].push(test);
    }
  });

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, "d");
      const cloneDay = day;
      const dayKey = format(day, 'yyyy-MM-dd');
      const dayNotes = notesData[dayKey] || [];
      const dayTests = testsData[dayKey] || [];
      const dayOfWeek = day.getDay();
      const daySchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek);

      days.push(
        <div
          key={day.toString()}
          className={`min-h-[120px] p-2 border border-slate-100 bg-white transition-colors ${!isSameMonth(day, monthStart)
              ? "text-slate-300 bg-slate-50/50"
              : isSameDay(day, new Date())
                ? "bg-indigo-50/30"
                : ""
            }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? "bg-indigo-600 text-white" : "text-slate-700"
              }`}>
              {formattedDate}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {daySchedules.map(schedule => {
              const subject = subjects.find(s => s.name === schedule.subjectName);
              const colorClass = subject ? subject.color : 'bg-slate-100 text-slate-600';
              return (
                <div key={`sched-${schedule.id}`} className={`text-xs p-1.5 rounded-md flex items-center gap-1.5 truncate opacity-70 border border-dashed border-current ${colorClass}`}>
                  <Clock className="w-3 h-3 shrink-0" />
                  <span className="truncate font-medium">{schedule.startTime} {schedule.subjectName}</span>
                </div>
              );
            })}
            {dayTests.map(test => {
              const subject = subjects.find(s => s.name === test.subjectName);
              const colorClass = subject ? subject.color : 'bg-rose-100 text-rose-600';
              return (
                <div key={`test-${test.id}`} className={`text-xs p-1.5 rounded-md flex items-center gap-1.5 truncate shadow-sm border border-current ${colorClass}`}>
                  <CalendarIcon className="w-3 h-3 shrink-0" />
                  <span className="truncate font-bold">{test.subjectName}:</span>
                  <span className="truncate">{test.title}</span>
                </div>
              );
            })}
            {dayNotes.map(note => (
              <div key={note.id} className={`text-xs p-1.5 rounded-md flex items-center gap-1.5 truncate cursor-pointer hover:opacity-80 transition-opacity ${note.color}`}>
                {note.type === 'document' && <FileText className="w-3 h-3 shrink-0" />}
                {note.type === 'audio' && <Mic className="w-3 h-3 shrink-0" />}
                {note.type === 'video' && <Video className="w-3 h-3 shrink-0" />}
                {note.type === 'image' && <ImageIcon className="w-3 h-3 shrink-0" />}
                <span className="truncate font-semibold">{note.subject}:</span>
                <span className="truncate">{note.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
  }

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold font-display text-slate-900 tracking-tight">Calendario</h1>
          <p className="text-slate-500 mt-2 text-lg">Organiza y encuentra tus apuntes por fecha.</p>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 capitalize">
            {format(currentDate, dateFormat, { locale: es })}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium text-slate-700">
              Hoy
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    </div>
  );
}
