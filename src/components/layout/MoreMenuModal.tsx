import React from 'react';
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
  Trophy
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  currentTab: string;
}

const MORE_ITEMS = [
  { id: 'focus', label: 'Mind & Focus', desc: 'Pomodoro & Deep Work', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-500/30' },
  { id: 'confidence', label: 'Confidence', desc: 'Social Growth Ladder', icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-950/40 border-pink-500/30' },
  { id: 'skills', label: 'Skills', desc: 'Practice & Mastery', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/30' },
  { id: 'notes', label: 'Notes', desc: 'Ideas & Checklists', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/30' },
  { id: 'reminders', label: 'Reminders', desc: 'Alerts & Habits', icon: Bell, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-500/30' },
  { id: 'calendar', label: 'Calendar', desc: 'History & Day Logs', icon: CalendarDays, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-500/30' },
  { id: 'settings', label: 'Settings & JSON', desc: 'Config & Data Upload', icon: Settings, color: 'text-slate-300', bg: 'bg-slate-900 border-slate-700' }
];

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  currentTab
}) => {
  if (!isOpen) return null;

  const handleSelect = (tabId: string) => {
    sounds.playClick();
    onSelectTab(tabId);
    onClose();
  };

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MORE_ITEMS.map(item => {
            const Icon = item.icon;
            const isSelected = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-800/80'
                }`}
              >
                <div className={`p-2.5 rounded-xl border ${item.bg}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.label}</h4>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
