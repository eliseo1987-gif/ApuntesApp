'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Mic, Video, Plus, Search, Filter, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { getNotes } from '@/lib/store';

export default function NotesPage() {
  const [filter, setFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    const loadNotes = () => {
      setNotes(getNotes());
    };
    loadNotes();
  }, []);

  const subjects = Array.from(new Set(notes.map(n => n.subject)));
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const filteredNotes = notes.filter(n => {
    const matchType = filter === 'all' || n.type === filter;
    const matchSubject = subjectFilter === 'all' || n.subject === subjectFilter;
    const matchTag = tagFilter === 'all' || n.tags.includes(tagFilter);
    return matchType && matchSubject && matchTag;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold font-display text-slate-900 tracking-tight">Mis Apuntes</h1>
          <p className="text-slate-500 mt-2 text-lg">Gestiona todos tus documentos, audios y videos.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/notes/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm">
            <Plus className="w-5 h-5" />
            Nuevo Apunte
          </Link>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            Todos
          </button>
          <button onClick={() => setFilter('document')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${filter === 'document' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <FileText className="w-4 h-4" /> Documentos
          </button>
          <button onClick={() => setFilter('audio')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${filter === 'audio' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Mic className="w-4 h-4" /> Audios
          </button>
          <button onClick={() => setFilter('video')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${filter === 'video' ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Video className="w-4 h-4" /> Videos
          </button>
          <button onClick={() => setFilter('image')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${filter === 'image' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <ImageIcon className="w-4 h-4" /> Fotos
          </button>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <select 
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700"
          >
            <option value="all">Todas las materias</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar apuntes..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-slate-500 mr-2">Etiquetas:</span>
        <button 
          onClick={() => setTagFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tagFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          Todas
        </button>
        {allTags.map(tag => (
          <button 
            key={tag}
            onClick={() => setTagFilter(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tagFilter === tag ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div key={note.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 group cursor-pointer flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${note.color}`}>
                {note.type === 'document' && <FileText className="w-6 h-6" />}
                {note.type === 'audio' && <Mic className="w-6 h-6" />}
                {note.type === 'video' && <Video className="w-6 h-6" />}
                {note.type === 'image' && <ImageIcon className="w-6 h-6" />}
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wider">{note.subject}</p>
            <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">{note.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{note.date}</p>
            
            <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap gap-2">
              {note.tags.map((tag: string) => (
                <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
