import React from 'react';
import {
  Home,
  Calendar,
  Dumbbell,
  Target,
  BarChart2,
  Menu
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMore: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMore
}) => {
  const handleNav = (tabId: string) => {
    sounds.playClick();
    onSelectTab(tabId);
  };

  const navButtons = [
    { id: 'today', label: 'Home', icon: Home },
    { id: 'timetable', label: 'Schedule', icon: Calendar },
    { id: 'train', label: 'Train', icon: Dumbbell },
    { id: 'quests', label: 'Quests', icon: Target },
    { id: 'progress', label: 'Progress', icon: BarChart2 }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {navButtons.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] min-w-[44px] rounded-xl transition-all relative ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              )}
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* More Drawer Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenMore();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] min-w-[44px] rounded-xl transition-all ${
            ['focus', 'skills', 'confidence', 'notes', 'reminders', 'calendar', 'settings'].includes(currentTab)
              ? 'text-purple-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </div>
    </nav>
  );
};
