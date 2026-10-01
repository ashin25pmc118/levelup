import React, { useState } from 'react';
import {
  Home,
  Calendar,
  Dumbbell,
  Brain,
  Target,
  MessageSquare,
  BookOpen,
  FileText,
  Bell,
  BarChart2,
  CalendarDays,
  Settings,
  Shield,
  Sparkles
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface DesktopSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: 'today', label: 'Today', icon: Home, highlight: true },
  { id: 'timetable', label: 'Schedule', icon: Calendar },
  { id: 'train', label: 'Train', icon: Dumbbell },
  { id: 'focus', label: 'Focus', icon: Brain },
  { id: 'quests', label: 'Quests', icon: Target },
  { id: 'confidence', label: 'Confidence', icon: MessageSquare },
  { id: 'skills', label: 'Skills', icon: BookOpen },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'progress', label: 'Progress & Stats', icon: BarChart2 },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'settings', label: 'Settings & JSON', icon: Settings }
];

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentTab, onSelectTab }) => {
  const [activeLogo, setActiveLogo] = useState<string>(() => {
    return localStorage.getItem('levelup_active_logo') || '/logos/wolf-split.png';
  });

  const handleNav = (tabId: string) => {
    sounds.playClick();
    onSelectTab(tabId);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-md p-4 min-h-[calc(100vh-57px)]">
      {/* Brand Header with Wolf Emblem */}
      <div className="flex items-center gap-2.5 px-3 py-2 mb-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div 
          onClick={() => {
            const nextLogo = activeLogo.includes('wolf-split') ? '/logos/wolf-howl.jpg' : '/logos/wolf-split.png';
            setActiveLogo(nextLogo);
            localStorage.setItem('levelup_active_logo', nextLogo);
            sounds.playClick();
          }}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-black border border-white/20 overflow-hidden shadow-md shadow-white/5 shrink-0 cursor-pointer hover:border-white/50 transition-all active:scale-95"
          title="Click to toggle between Yin-Yang Wolf & Howling Moon Wolf"
        >
          <img src={activeLogo} alt="Alpha Wolf Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            LEVEL UP
          </h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-wider">
            ALPHA LIFE OS
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Motivational Footer Card */}
      <div className="p-3 mt-4 rounded-xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-cyan-400" /> Real-Life RPG Rule
        </p>
        <p className="italic text-[10px] leading-relaxed">
          "Small progress every day. Complete today's quests. Build better habits. Level up your real life."
        </p>
      </div>
    </aside>
  );
};
