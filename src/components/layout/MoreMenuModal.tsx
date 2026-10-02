import React, { useState } from 'react';
import {
  X,
  Brain,
  MessageSquare,
  BookOpen,
  FileText,
  Bell,
  CalendarDays,
  Settings,
  Sparkles,
  Trophy,
  Search,
  Dumbbell,
  Grid,
  Zap,
  Eye,
  Palette
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string, subTab?: string) => void;
  currentTab: string;
  onOpenThemePicker?: () => void;
}

const ALL_SYSTEM_TOOLS = [
  { id: 'theme', label: 'Theme & Appearance', desc: 'Cyber, Clean Light, OLED & B&W', icon: Palette, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-500/30', keywords: 'theme appearance dark light color clean oled white black background mode' },
  { id: 'focus', label: 'Mind & Focus', desc: 'Pomodoro timer & ambient noise', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-500/30', keywords: 'pomodoro timer study deep work sound binaural rain' },
  { id: 'confidence', label: 'Confidence', desc: 'Social growth comfort ladder', icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-950/40 border-pink-500/30', keywords: 'social confidence speaking comfort challenge' },
  { id: 'skills', label: 'Skills', desc: 'Deliberate practice & mastery', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/30', keywords: 'skills practice coding reading study' },
  { id: 'notes', label: 'Notes', desc: 'Ideas, checklists & fast scratchpad', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/30', keywords: 'notes scratchpad ideas thoughts memo' },
  { id: 'reminders', label: 'Reminders', desc: 'Alerts, water & daily habits', icon: Bell, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-500/30', keywords: 'reminders alerts habits notifications water' },
  { id: 'calendar', label: 'Calendar', desc: 'Day logs & history review', icon: CalendarDays, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-500/30', keywords: 'calendar history log daily review' },
  { id: 'settings', label: 'Settings & JSON', desc: 'Configuration & full data backup', icon: Settings, color: 'text-slate-300', bg: 'bg-slate-900 border-slate-700', keywords: 'settings json backup restore export profile' },
  { id: 'train', subTab: 'eyecare', label: 'Schulte Table & Eye-Care', desc: 'Peripheral vision & 5x5 speed grid', icon: Grid, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-500/30', keywords: 'schulte table vision speed peripheral eye care grid' },
  { id: 'train', subTab: 'reflex', label: 'Reflex Tap Test', desc: 'Millisecond reaction test & agility', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/30', keywords: 'reflex reaction millisecond agility badminton combat' },
  { id: 'train', subTab: 'skills', label: 'Calisthenics Skill Tree', desc: 'Pull-up, dip & push-up progression trees', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-500/30', keywords: 'calisthenics skill tree pullup pushup dips workouts' }
];

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  currentTab,
  onOpenThemePicker
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleSelect = (tabId: string, subTab?: string) => {
    sounds.playClick();
    if (tabId === 'theme') {
      onClose();
      if (onOpenThemePicker) onOpenThemePicker();
      return;
    }
    onSelectTab(tabId, subTab);
    onClose();
  };

  const filteredItems = ALL_SYSTEM_TOOLS.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-5 border-t sm:border rounded-t-3xl sm:rounded-2xl bg-slate-900 border-slate-800 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">System Modules</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden" />

        {/* Live Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features (e.g. Schulte, Reflex, Workout, Pomodoro)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <p className="font-semibold text-slate-400 mb-1">No features found</p>
            <p>Try searching for "schulte", "reflex", "pomodoro", "notes", or "pullup"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredItems.map(item => {
              const Icon = item.icon;
              const isSelected = currentTab === item.id;
              return (
                <button
                  key={`${item.id}-${item.label}`}
                  onClick={() => handleSelect(item.id, item.subTab)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-800/80'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${item.bg}`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{item.label}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
