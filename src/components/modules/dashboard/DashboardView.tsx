import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  Calendar,
  Dumbbell,
  Brain,
  MessageSquare,
  ArrowRight,
  Clock,
  ChevronRight,
  ShieldAlert,
  Zap,
  Check,
  BookOpen,
  Plus,
  Grid,
  Watch,
  Trophy,
  Compass
} from 'lucide-react';
import {
  UserProfile,
  DailyQuest,
  TimetableEvent,
  ConfidenceQuest,
  Exercise,
  AppSettings
} from '../../../types';
import { sounds } from '../../../services/soundEffects';
import { storage } from '../../../services/storageService';

interface DashboardViewProps {
  profile: UserProfile;
  dailyQuests: DailyQuest[];
  onToggleQuest: (questId: string) => void;
  todayEvents: TimetableEvent[];
  activeTemplateName: string;
  confidenceQuest: ConfidenceQuest | null;
  exercises: Exercise[];
  onNavigate: (tab: string) => void;
  settings: AppSettings;
  onOpenSmartwatch?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  dailyQuests,
  onToggleQuest,
  todayEvents,
  activeTemplateName,
  confidenceQuest,
  onNavigate,
  onOpenSmartwatch
}) => {
  const [xpAnimId, setXpAnimId] = useState<string | null>(null);

  // Daily Reading Habit State
  const readingQuest = dailyQuests.find(q => q.id === 'dq_reading' || q.title.toLowerCase().includes('reading'));
  const todayKey = new Date().toISOString().split('T')[0];
  const [readingPages, setReadingPages] = useState<number>(() => {
    const saved = localStorage.getItem(`levelup_reading_pages_${todayKey}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [readingBook, setReadingBook] = useState<string>(() => {
    return localStorage.getItem('levelup_reading_book') || 'Atomic Habits / Non-Fiction';
  });
  const [isEditingBook, setIsEditingBook] = useState(false);

  const targetPages = 20;
  const readingProgress = Math.min(100, Math.round((readingPages / targetPages) * 100));

  const handleQuestCheck = (quest: DailyQuest) => {
    if (!quest.isCompleted) {
      setXpAnimId(quest.id);
      setTimeout(() => setXpAnimId(null), 1000);
    }
    onToggleQuest(quest.id);
  };

  const handleAddPages = (delta: number) => {
    sounds.playClick();
    const newPages = Math.max(0, readingPages + delta);
    setReadingPages(newPages);
    localStorage.setItem(`levelup_reading_pages_${todayKey}`, String(newPages));

    // If reaching or passing target and quest is not completed, auto complete
    if (newPages >= targetPages && readingQuest && !readingQuest.isCompleted) {
      handleQuestCheck(readingQuest);
    }
  };

  const handleSaveBookTitle = (title: string) => {
    const trimmed = title.trim();
    if (trimmed) {
      setReadingBook(trimmed);
      localStorage.setItem('levelup_reading_book', trimmed);
    }
    setIsEditingBook(false);
  };

  const completedQuestsCount = dailyQuests.filter(q => q.isCompleted).length;
  const totalQuestsCount = dailyQuests.length;
  const questPercent = totalQuestsCount > 0 ? Math.round((completedQuestsCount / totalQuestsCount) * 100) : 0;

  // Determine "What should I do now?"
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

  // Find active or upcoming timetable event
  const currentEvent = todayEvents.find(e => e.startTime <= currentTimeStr && e.endTime >= currentTimeStr);
  const nextEvent = todayEvents.find(e => e.startTime > currentTimeStr);

  // 🚀 Progressive Disclosure: Compute context-aware single "Next Action"
  const primaryNextAction = React.useMemo(() => {
    // 1. If active timetable event right now
    if (currentEvent) {
      return {
        badge: 'ACTIVE TIMETABLE BLOCK',
        badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/30',
        title: currentEvent.title,
        desc: `Scheduled for ${currentEvent.startTime} - ${currentEvent.endTime}. Lock in for deep work.`,
        actionLabel: 'START DEEP FOCUS (25M)',
        xp: '+25 XP',
        icon: Brain,
        onAction: () => onNavigate('focus')
      };
    }
    // 2. If daily calisthenics workout has not been logged today
    const fitnessProfile = storage.getFitnessProfile();
    const today = new Date().toISOString().split('T')[0];
    if (fitnessProfile.lastWorkoutDate !== today) {
      return {
        badge: 'BODYWEIGHT TRAINING RECOMMENDED',
        badgeColor: 'bg-orange-950 text-orange-300 border-orange-500/30',
        title: "Today's Calisthenics Routine",
        desc: `Phase ${fitnessProfile.currentPhase} • Week ${fitnessProfile.currentWeek} (${fitnessProfile.environment.toUpperCase()} Mode). Autoregulated sets to build strength.`,
        actionLabel: 'LAUNCH WORKOUT PLAYER',
        xp: '+35 XP',
        icon: Dumbbell,
        onAction: () => onNavigate('train')
      };
    }
    // 3. If reading goal is not met
    if (readingPages < targetPages) {
      return {
        badge: 'KNOWLEDGE & READING HABIT',
        badgeColor: 'bg-blue-950 text-blue-300 border-blue-500/30',
        title: `Read ${targetPages - readingPages} More Pages of "${readingBook}"`,
        desc: 'Sharpen your mind and expand your vocabulary with 15 minutes of deliberate reading.',
        actionLabel: 'LOG +5 PAGES NOW',
        xp: '+20 XP',
        icon: BookOpen,
        onAction: () => handleAddPages(5)
      };
    }
    // 4. If daily quests remain
    const uncompletedQuest = dailyQuests.find(q => !q.isCompleted);
    if (uncompletedQuest) {
      return {
        badge: 'DAILY QUEST READY',
        badgeColor: 'bg-purple-950 text-purple-300 border-purple-500/30',
        title: uncompletedQuest.title,
        desc: uncompletedQuest.description || 'Complete this task to keep your streak shield charged.',
        actionLabel: 'VIEW QUESTS',
        xp: `+${uncompletedQuest.targetXp} XP`,
        icon: CheckCircle2,
        onAction: () => onNavigate('quests')
      };
    }
    // 5. Evening or completed all
    return {
      badge: 'ALL ESSENTIALS COMPLETED',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/30',
      title: 'Great Job! Rest & Recharge',
      desc: 'You hit today’s targets. Take a walk, test your reflexes, or log sleep recovery.',
      actionLabel: 'INSPECT PROGRESS & XP',
      xp: 'STREAK SAFE',
      icon: Sparkles,
      onAction: () => onNavigate('progress')
    };
  }, [currentEvent, readingPages, readingBook, targetPages, dailyQuests]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Top Banner: Real-Life Character Progression Status */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-xl shadow-cyan-950/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ACTIVE STATUS
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Mode: <span className="text-white font-bold">{activeTemplateName}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{profile.name}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Every day you complete study, exercise, focus, and social challenges, you level up in reality.
            </p>
          </div>

          {/* Quick Progress Wheel Badge */}
          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 p-3 rounded-2xl shrink-0">
            <div className="relative flex items-center justify-center w-14 h-14">
              <svg className="w-14 h-14 -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  className="stroke-slate-800"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  className="stroke-cyan-400 transition-all duration-700 ease-out"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray={144.5}
                  strokeDashoffset={144.5 - (144.5 * questPercent) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-black text-white">{questPercent}%</span>
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Daily Completion
              </span>
              <span className="text-sm font-extrabold text-white">
                {completedQuestsCount} / {totalQuestsCount} Quests
              </span>
              <div className="text-[10px] text-cyan-400 font-semibold">
                +{profile.todayXP} XP Gained Today
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 1-TAP QUICK ACTION COMMAND HUB (Solves Mobile Feature Discovery) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" /> Quick Feature Hub
          </span>
          <span className="text-[10px] text-cyan-400 font-bold hidden xs:inline">
            1-Tap Instant Launch
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {[
            { id: 'workout', label: 'Workout', icon: Dumbbell, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-500/30', action: () => onNavigate('train') },
            { id: 'schulte', label: 'Schulte', icon: Grid, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-500/30', action: () => onNavigate('train') },
            { id: 'reflex', label: 'Reflex', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/30', action: () => onNavigate('train') },
            { id: 'focus', label: 'Pomodoro', icon: Brain, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-500/30', action: () => onNavigate('focus') },
            { id: 'schedule', label: 'Schedule', icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/30', action: () => onNavigate('timetable') },
            { id: 'quests', label: 'Quests', icon: CheckCircle2, color: 'text-pink-400', bg: 'bg-pink-950/40 border-pink-500/30', action: () => onNavigate('quests') },
            { id: 'watch', label: 'Smartwatch', icon: Watch, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-500/30', action: () => onOpenSmartwatch ? onOpenSmartwatch() : onNavigate('train') },
            { id: 'skills', label: 'Skill Tree', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-500/30', action: () => onNavigate('train') }
          ].map(tile => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => {
                  sounds.playClick();
                  tile.action();
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border ${tile.bg} hover:border-cyan-400/50 hover:bg-slate-800/80 transition-all active:scale-95 group text-center cursor-pointer min-h-[64px]`}
                title={`Launch ${tile.label}`}
              >
                <div className={`p-1 rounded-lg mb-0.5 ${tile.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-200 group-hover:text-white line-clamp-1">
                  {tile.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🚀 PRIMARY "NEXT ACTION" HERO CARD (Progressive Disclosure) */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border-2 border-cyan-500/40 shadow-xl shadow-cyan-950/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${primaryNextAction.badgeColor}`}>
              {primaryNextAction.badge}
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {primaryNextAction.xp}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <primaryNextAction.icon className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>{primaryNextAction.title}</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {primaryNextAction.desc}
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            primaryNextAction.onAction();
          }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shrink-0"
        >
          <span>{primaryNextAction.actionLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* THREE ESSENTIAL RPG QUESTIONS: What to do now? What next? How am I progressing? */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: What Should I Do Now? */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> What to do now?
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/20">
                CURRENT
              </span>
            </div>
            {currentEvent ? (
              <div className="mt-1 space-y-2">
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{currentEvent.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{currentEvent.startTime} - {currentEvent.endTime}</span>
                    {(() => {
                      const [eh, em] = currentEvent.endTime.split(':').map(Number);
                      const rem = Math.max(0, (eh * 60 + em) - (currentHour * 60 + currentMin));
                      return (
                        <span className="text-cyan-300 font-bold font-mono">
                          {rem > 0 ? `⏳ ${rem}m left` : 'Ending soon'}
                        </span>
                      );
                    })()}
                  </p>
                </div>

                {/* Progress bar of current block */}
                {(() => {
                  const [sh, sm] = currentEvent.startTime.split(':').map(Number);
                  const [eh, em] = currentEvent.endTime.split(':').map(Number);
                  const total = (eh * 60 + em) - (sh * 60 + sm);
                  const elapsed = (currentHour * 60 + currentMin) - (sh * 60 + sm);
                  const pct = total > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / total) * 100))) : 50;
                  return (
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  );
                })()}

                <div className="text-[11px] font-semibold text-cyan-300">
                  Reward: +{currentEvent.xpAwarded || 20} XP on completion
                </div>
              </div>
            ) : (
              <div className="mt-1">
                <h4 className="text-sm font-bold text-white">No active timetable block</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recommended: Knock out a 25-minute Pomodoro focus block or a workout set.
                </p>
              </div>
            )}
          </div>
          {currentEvent ? (
            <button
              onClick={() => {
                if (/study|revision|exam|solve|read/i.test(currentEvent.title)) {
                  onNavigate('focus');
                } else if (/exercise|stretch|workout|mobility|walk/i.test(currentEvent.title)) {
                  onNavigate('train');
                } else {
                  onNavigate('timetable');
                }
              }}
              className="mt-3 w-full py-1.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 border border-cyan-500/30 transition-colors"
            >
              {/study|revision|exam|solve|read/i.test(currentEvent.title)
                ? '🔥 Launch Deep Focus'
                : /exercise|stretch|workout|mobility|walk/i.test(currentEvent.title)
                ? '💪 Launch Training'
                : 'Open Timetable'} <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('focus')}
              className="mt-3 w-full py-1.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 border border-cyan-500/30 transition-colors"
            >
              Start Focus Session <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Card 2: What Should I Do Next? */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> What is next?
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 font-bold border border-purple-500/20">
                UPCOMING
              </span>
            </div>
            {nextEvent ? (
              <div className="mt-1">
                <h4 className="text-sm font-bold text-white line-clamp-1">{nextEvent.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Starts at {nextEvent.startTime} ({nextEvent.startTime} - {nextEvent.endTime})
                </p>
              </div>
            ) : (
              <div className="mt-1">
                <h4 className="text-sm font-bold text-white">All scheduled blocks done</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Free time unlocked. Check your Confidence Quest or read notes.
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate('timetable')}
            className="mt-3 w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            View Full Schedule <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Character Growth Summary */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Progression Status
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/20">
                LEVEL {profile.level}
              </span>
            </div>
            <div className="space-y-1.5 mt-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Streak:</span>
                <span className="text-orange-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-orange-500" /> {profile.currentStreak} Days
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Total XP:</span>
                <span className="text-cyan-400 font-bold">{profile.totalXP} XP</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Confidence Tier:</span>
                <span className="text-pink-400 capitalize">{profile.confidenceTier}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('progress')}
            className="mt-3 w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            Inspect RPG Stats <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: Today's Quests & Quick RPG Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 spans): Today's Quests Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide text-white uppercase">
                    Today's Quests
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Prioritize consistency over perfection. Small daily actions compound.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('quests')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                All Quests <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {dailyQuests.map(quest => {
                const isAnim = xpAnimId === quest.id;
                return (
                  <div
                    key={quest.id}
                    onClick={() => handleQuestCheck(quest)}
                    className={`relative flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer group ${
                      quest.isCompleted
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                        : 'bg-slate-950 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/60 text-slate-100 shadow-sm'
                    }`}
                  >
                    {/* Floating XP Animation */}
                    {isAnim && (
                      <span className="absolute right-12 -top-2 text-xs font-black text-cyan-400 animate-bounce bg-slate-950 px-2 py-0.5 rounded-full border border-cyan-500 shadow-lg">
                        +{quest.targetXp} XP!
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="shrink-0 transition-transform group-hover:scale-110">
                        {quest.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 group-hover:text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-xs font-bold transition-all ${
                            quest.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                          }`}
                        >
                          {quest.title}
                        </span>
                        <span className="block text-[10px] text-slate-400 capitalize mt-0.5">
                          Category: {quest.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          quest.isCompleted
                            ? 'bg-slate-900 text-slate-400'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        +{quest.targetXp} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Anti-Shame Recovery Notice */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Compassionate Rule:</strong> If you ever miss a day, your progress is not lost. Real character development is picking up right where you are.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Confidence Quest & Training Action Cards */}
        <div className="space-y-4">
          {/* Confidence Quest Spotlight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-pink-950/20 border border-pink-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Daily Confidence Quest
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 font-bold border border-pink-500/20">
                +{confidenceQuest ? confidenceQuest.xpValue : 25} XP
              </span>
            </div>

            {confidenceQuest ? (
              <div>
                <h4 className="text-sm font-bold text-white">{confidenceQuest.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {confidenceQuest.description}
                </p>
                <div className="mt-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Context:</span> {confidenceQuest.exampleContext}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">All confidence challenges for today completed!</p>
            )}

            <button
              onClick={() => onNavigate('confidence')}
              className="mt-3.5 w-full py-2 px-3 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 font-bold text-xs flex items-center justify-center gap-1 border border-pink-500/30 transition-colors"
            >
              Start Confidence Quest <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Daily Reading Habit Tracker Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Daily Reading Habit
              </span>
              {readingQuest?.isCompleted || readingPages >= targetPages ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Goal Met (+30 XP)
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-bold border border-indigo-500/30">
                  Target: {targetPages} Pgs
                </span>
              )}
            </div>

            {/* Current Book title */}
            <div>
              {isEditingBook ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={readingBook}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveBookTitle((e.target as HTMLInputElement).value);
                    }}
                    onBlur={e => handleSaveBookTitle(e.target.value)}
                    autoFocus
                    className="w-full text-xs font-bold bg-slate-950 border border-indigo-500/50 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingBook(true)}
                  className="group flex items-center justify-between cursor-pointer"
                  title="Click to edit current book"
                >
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    📖 {readingBook}
                  </h4>
                  <span className="text-[10px] text-slate-500 group-hover:text-indigo-400">Edit</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs mt-1.5">
                <span className="text-slate-400 font-medium">Pages Today:</span>
                <span className="font-extrabold text-white">
                  <span className="text-indigo-400">{readingPages}</span> / {targetPages} pages
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  readingPages >= targetPages ? 'bg-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                }`}
                style={{ width: `${readingProgress}%` }}
              />
            </div>

            {/* Quick Increment buttons and Complete Action */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddPages(5)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  +5 pgs
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPages(10)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  +10 pgs
                </button>
              </div>

              {readingQuest && (
                <button
                  type="button"
                  onClick={() => handleQuestCheck(readingQuest)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    readingQuest.isCompleted
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  }`}
                >
                  {readingQuest.isCompleted ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Claimed
                    </>
                  ) : (
                    'Claim +30 XP'
                  )}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('focus')}
              className="w-full py-1 text-center text-[10px] font-semibold text-indigo-300/80 hover:text-indigo-200 hover:underline transition-colors block"
            >
              ⏱️ Launch 15-min Deep Reading Focus Session →
            </button>
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('train')}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 hover:bg-slate-800/80 transition-all text-left group"
            >
              <div className="p-2 rounded-xl bg-orange-950/50 text-orange-400 border border-orange-500/30 w-fit mb-2 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-white">Log Workout</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">Push-ups, Squats, Cardio</p>
            </button>

            <button
              onClick={() => onNavigate('focus')}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all text-left group"
            >
              <div className="p-2 rounded-xl bg-purple-950/50 text-purple-400 border border-purple-500/30 w-fit mb-2 group-hover:scale-110 transition-transform">
                <Brain className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-white">Start Focus</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">Pomodoro & Deep Work</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
