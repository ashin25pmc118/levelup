import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Pin,
  Trash2,
  Tag,
  CheckSquare,
  Square,
  Edit2,
  Sparkles
} from 'lucide-react';
import { Note, NoteCategory } from '../../../types';
import { sounds } from '../../../services/soundEffects';

interface NotesModuleProps {
  notes: Note[];
  onSaveNotes: (notes: Note[]) => void;
  onOpenQuickNote: () => void;
}

const CATEGORIES: NoteCategory[] = [
  'Quick Notes',
  'Don\'t Forget',
  'Study',
  'Ideas',
  'Personal',
  'Projects',
  'Goals'
];

export const NotesModule: React.FC<NotesModuleProps> = ({
  notes,
  onSaveNotes,
  onOpenQuickNote
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(n => {
    if (n.isArchived) return false;
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const handleTogglePin = (noteId: string) => {
    sounds.playClick();
    const updated = notes.map(n => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n));
    onSaveNotes(updated);
  };

  const handleDelete = (noteId: string) => {
    sounds.playClick();
    const updated = notes.filter(n => n.id !== noteId);
    onSaveNotes(updated);
  };

  const handleToggleChecklist = (noteId: string, itemId: string) => {
    sounds.playClick();
    const updated = notes.map(n => {
      if (n.id === noteId && n.checklist) {
        const nextChecklist = n.checklist.map(ci =>
          ci.id === itemId ? { ...ci, done: !ci.done } : ci
        );
        return { ...n, checklist: nextChecklist };
      }
      return n;
    });
    onSaveNotes(updated);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-500/30">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">Character Codex & Notes</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Capture study concepts, checklists, goals, and sudden sparks of inspiration.
          </p>
        </div>

        <button
          onClick={onOpenQuickNote}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create Note
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search notes or tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 focus:outline-none text-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-colors ${
              selectedCategory === 'All'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map(note => (
          <div
            key={note.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              note.isPinned
                ? 'bg-slate-900/90 border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 font-bold text-amber-400 border border-slate-800 uppercase tracking-wider">
                  {note.category}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTogglePin(note.id)}
                    className={`p-1 rounded-md transition-colors ${
                      note.isPinned
                        ? 'text-amber-400 hover:bg-amber-950/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={note.isPinned ? 'Unpin' : 'Pin note'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 rounded-md text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-1.5">{note.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-3">
                {note.content}
              </p>

              {/* Checklist items if any */}
              {note.checklist && note.checklist.length > 0 && (
                <div className="space-y-1.5 my-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {note.checklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(note.id, item.id)}
                      className="flex items-center gap-2 text-xs cursor-pointer select-none"
                    >
                      {item.done ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                      <span
                        className={`text-[11px] ${
                          item.done ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags and date footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
              <div className="flex flex-wrap gap-1">
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-slate-500">
                {note.createdAt.split('T')[0]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
