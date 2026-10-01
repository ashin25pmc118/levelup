import React, { useState } from 'react';
import { X, Check, Pin, Tag, Sparkles } from 'lucide-react';
import { Note, NoteCategory } from '../../types';
import { storage } from '../../services/storageService';
import { sounds } from '../../services/soundEffects';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
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

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('Quick Notes');
  const [isPinned, setIsPinned] = useState(false);
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !title.trim()) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const newNote: Note = {
      id: `nt_${Date.now()}`,
      title: title.trim() || 'Quick Note',
      content: content.trim(),
      category,
      tags,
      isPinned,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const currentNotes = storage.getNotes();
    storage.saveNotes([newNote, ...currentNotes]);
    sounds.playClick();
    onSaved();
    onClose();
    setTitle('');
    setContent('');
    setTagInput('');
    setIsPinned(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-5 border rounded-2xl bg-slate-900 border-cyan-500/30 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">Instant Quick Note</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Title (optional)..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none placeholder-slate-500 text-white"
            />
          </div>

          <div>
            <textarea
              placeholder="Capture thought, reminder, idea, or key concept..."
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none placeholder-slate-500 text-slate-200 resize-none"
            />
          </div>

          {/* Category Pills */}
          <div>
            <label className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    category === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags & Pin */}
          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <Tag className="absolute w-3.5 h-3.5 text-slate-500 left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="tags (comma separated)..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none placeholder-slate-500 text-slate-200"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-lg border transition-colors ${
                isPinned
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Pin Note"
            >
              <Pin className="w-4 h-4" />
            </button>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Check className="w-3.5 h-3.5" /> Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
