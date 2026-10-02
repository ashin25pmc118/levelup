import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  CheckCircle2,
  Circle,
  Sparkles,
  Droplets,
  Calendar,
  FileText,
  CalendarDays,
  Wind,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyProtocolsState, StatType } from '../../../types';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';
import { haptics } from '../../../services/hapticFeedback';

interface DailyProtocolsCardProps {
  onAwardXP?: (amount: number, description: string, stat: StatType) => void;
  onOpenBreathwork?: () => void;
  onNavigate?: (tab: string) => void;
  className?: string;
}

const STEP_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Droplets,
  Sun,
  Calendar,
  Sparkles,
  FileText,
  CalendarDays,
  Wind
};

export const DailyProtocolsCard: React.FC<DailyProtocolsCardProps> = ({
  onAwardXP,
  onOpenBreathwork,
  onNavigate,
  className = ''
}) => {
  // Determine smart initial tab based on current local hour
  const currentHour = new Date().getHours();
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>(() => {
    return currentHour < 15 ? 'morning' : 'evening';
  });

  const [protocols, setProtocols] = useState<DailyProtocolsState>(() => storage.getDailyProtocols());

  useEffect(() => {
    setProtocols(storage.getDailyProtocols());
  }, []);

  const section = protocols[activeTab];
  const totalSteps = section.steps.length;
  const completedSteps = section.steps.filter(s => s.isCompleted).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const isAllDone = section.isCompleted;

  const handleToggleStep = (stepId: string) => {
    sounds.playHabitCheck();
    haptics.light();

    const { state, xpAwarded } = storage.toggleProtocolStep(activeTab, stepId);
    setProtocols({ ...state });

    if (xpAwarded) {
      sounds.playQuestComplete();
      haptics.success();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      if (onAwardXP) {
        const stat: StatType = activeTab === 'morning' ? 'discipline' : 'recovery';
        onAwardXP(
          xpAwarded,
          `${activeTab === 'morning' ? 'Morning Wake-Up' : 'Evening Shutdown'} Protocol Complete`,
          stat
        );
      }
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 ${className}`}>
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-xl border ${
            activeTab === 'morning'
              ? 'bg-amber-950/80 border-amber-500/40 text-amber-400'
              : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
          }`}>
            {activeTab === 'morning' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </span>
          <div>
            <h3 className="text-xs font-black tracking-wide text-white uppercase">
              Circadian Protocols
            </h3>
            <p className="text-[10px] text-slate-400">Scientifically calibrated bookends of your day</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start xs:self-auto">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('morning');
            }}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'morning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Morning</span>
            {protocols.morning.isCompleted && <span className="text-emerald-400 text-[10px]">✓</span>}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('evening');
            }}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'evening'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Evening</span>
            {protocols.evening.isCompleted && <span className="text-emerald-400 text-[10px]">✓</span>}
          </button>
        </div>
      </div>

      {/* Progress & Status Pill */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            {activeTab === 'morning' ? '☀️ Morning Protocol (+20 Discipline XP)' : '🌙 Evening Protocol (+20 Recovery XP)'}
          </span>
          <span className="font-mono font-bold text-white text-[11px]">
            {completedSteps}/{totalSteps} Steps ({progressPercent}%)
          </span>
        </div>

        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAllDone
                ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50'
                : activeTab === 'morning'
                ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                : 'bg-gradient-to-r from-indigo-500 to-purple-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Checklists */}
      <div className="space-y-2">
        {section.steps.map(step => {
          const IconComp = STEP_ICONS[step.icon] || Sparkles;
          return (
            <div
              key={step.id}
              onClick={() => handleToggleStep(step.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between gap-3 ${
                step.isCompleted
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : 'bg-slate-950/30 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/60 text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 transition-transform group-hover:scale-110">
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                  )}
                </div>

                <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  <IconComp className={`w-3.5 h-3.5 ${
                    step.isCompleted
                      ? 'text-slate-500'
                      : activeTab === 'morning'
                      ? 'text-amber-400'
                      : 'text-indigo-400'
                  }`} />
                </div>

                <div className="min-w-0">
                  <span className={`text-xs font-bold block truncate transition-all ${
                    step.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                  }`}>
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {step.subtitle}
                  </span>
                </div>
              </div>

              {/* Context Action Shortcut Buttons */}
              <div className="shrink-0">
                {step.id === 'e_breathe' && onOpenBreathwork && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      onOpenBreathwork();
                    }}
                    className="p-1 px-2 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1"
                    title="Open Box Breathing"
                  >
                    <Wind className="w-3 h-3" /> Breathe
                  </button>
                )}
                {step.id === 'm_timetable' && onNavigate && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      onNavigate('timetable');
                    }}
                    className="p-1 px-2 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1"
                    title="View Schedule"
                  >
                    Schedule <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isAllDone && (
        <div className="p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{activeTab === 'morning' ? 'Morning Wake-Up' : 'Evening Shutdown'} Complete!</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">+20 XP Earned</span>
        </div>
      )}
    </div>
  );
};
