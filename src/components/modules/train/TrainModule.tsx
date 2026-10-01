import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  HeartPulse,
  Eye,
  Zap,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Check,
  Trophy,
  Activity,
  Trash2,
  HelpCircle,
  Timer,
  FastForward,
  Flame,
  Calendar,
  Home,
  Building2,
  Shield,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronRight,
  Info,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Layers,
  X
} from 'lucide-react';
import {
  Exercise,
  WorkoutLog,
  CardioSession,
  ReflexScore,
  MuscleGroup
} from '../../../types';
import {
  UserFitnessProfile,
  ExerciseProgressionState,
  GeneratedWorkout,
  CompletedWorkoutSession,
  TrainingEnvironment
} from '../../../services/fitness/fitnessTypes';
import { generateWorkoutForDay } from '../../../services/fitness/workoutGenerator';
import { getExerciseById } from '../../../services/fitness/exerciseRegistry';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';

// Subcomponents
import { ActiveWorkoutSession } from '../fitness/ActiveWorkoutSession';
import { CalisthenicsSkillTree } from '../fitness/CalisthenicsSkillTree';
import { ExerciseLibraryView } from '../fitness/ExerciseLibraryView';
import { Roadmap12MonthView } from '../fitness/Roadmap12MonthView';
import { FitnessBenchmarkTests } from '../fitness/FitnessBenchmarkTests';
import { ExerciseVisualGuide } from '../../common/ExerciseVisualGuide';
import { EyeCareTrainer } from './EyeCareTrainer';
import { ReflexHub } from './ReflexHub';
import { useDragScroll } from '../../../hooks/useDragScroll';

interface TrainModuleProps {
  exercises: Exercise[];
  onSaveExercises: (exercises: Exercise[]) => void;
  onAwardXP: (amount: number, description: string, stat: 'strength' | 'stamina' | 'reflex' | 'awareness' | 'recovery') => void;
  initialTab?: 'today' | 'skills' | 'library' | 'roadmap' | 'benchmarks' | 'classic' | 'eyecare' | 'reflex';
  onTabChange?: (tab: string) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TrainModule: React.FC<TrainModuleProps> = ({
  exercises,
  onSaveExercises,
  onAwardXP,
  initialTab,
  onTabChange
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'today' | 'skills' | 'library' | 'roadmap' | 'benchmarks' | 'classic' | 'eyecare' | 'reflex'
  >(initialTab || 'today');
  const [isMobileModeMenuOpen, setIsMobileModeMenuOpen] = useState(false);
  const [isIntroCollapsed, setIsIntroCollapsed] = useState(false);

  // Sync external tab changes (e.g. from Dashboard 1-tap tile or MoreMenu search)
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleSelectTab = (tabId: typeof activeTab) => {
    sounds.playClick();
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  const mobilePillsScroll = useDragScroll();

  const TRAIN_TABS = [
    { id: 'today', label: "Today's Workout", shortLabel: 'Workout', icon: Zap, color: 'text-cyan-400', desc: 'Autoregulated Calisthenics Routine', group: 'fitness' },
    { id: 'skills', label: 'Calisthenics Skill Tree', shortLabel: 'Skill Tree', icon: Trophy, color: 'text-amber-400', desc: 'Pull-up, Push-up, Dip Trees', group: 'fitness' },
    { id: 'library', label: 'Exercise Library (15 Cat)', shortLabel: 'Library', icon: BookOpen, color: 'text-purple-400', desc: '100+ Exercise Animations & Cues', group: 'fitness' },
    { id: 'roadmap', label: '12-Month Periodization', shortLabel: '12M Plan', icon: Calendar, color: 'text-emerald-400', desc: 'Beginner to Advanced Roadmap', group: 'fitness' },
    { id: 'benchmarks', label: 'PR Benchmarks', shortLabel: 'PR Tests', icon: Award, color: 'text-pink-400', desc: 'Max Reps & Hold Records', group: 'fitness' },
    { id: 'classic', label: 'Quick Log & Cardio', shortLabel: 'Cardio', icon: Flame, color: 'text-orange-400', desc: 'Running, Walking & Free Sets', group: 'fitness' },
    { id: 'eyecare', label: 'Eye-Care & Schulte Table', shortLabel: 'Schulte & Eyes', icon: Eye, color: 'text-purple-300', desc: 'Peripheral Vision & Saccades', group: 'cognitive' },
    { id: 'reflex', label: 'Reflex Test', shortLabel: 'Reflexes', icon: Activity, color: 'text-green-400', desc: 'Millisecond Digital Tap & Agility', group: 'cognitive' }
  ] as const;

  // Fitness Profile & Progression States
  const [fitnessProfile, setFitnessProfile] = useState<UserFitnessProfile>(() => storage.getFitnessProfile());
  const [progressionStates, setProgressionStates] = useState<Record<string, ExerciseProgressionState>>(() =>
    storage.getProgressionStates()
  );

  // Active Day & Generated Workout
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState<string>(
    DAYS_OF_WEEK.includes(currentDayName) ? currentDayName : 'Monday'
  );

  // Active Fullscreen Workout Session Player
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<GeneratedWorkout | null>(null);
  const [inspectedExercise, setInspectedExercise] = useState<any | null>(null);

  // Current Generated Workout strictly capped at <= 60 mins
  const todayWorkout = generateWorkoutForDay(
    selectedDay,
    fitnessProfile.environment,
    fitnessProfile.preferredDurationTier,
    fitnessProfile,
    progressionStates
  );

  // Environment Switcher handler (Home vs Hostel)
  const handleToggleEnvironment = (env: TrainingEnvironment) => {
    sounds.playClick();
    const updated: UserFitnessProfile = { ...fitnessProfile, environment: env };
    setFitnessProfile(updated);
    storage.saveFitnessProfile(updated);
  };

  // Duration Tier handler
  const handleSelectDurationTier = (tier: 'express' | 'standard' | 'full') => {
    sounds.playClick();
    const updated: UserFitnessProfile = { ...fitnessProfile, preferredDurationTier: tier };
    setFitnessProfile(updated);
    storage.saveFitnessProfile(updated);
  };

  // Start active workout
  const handleStartActiveWorkout = () => {
    sounds.playClick();
    setActiveWorkoutSession(todayWorkout);
  };

  // Finish active workout
  const handleFinishWorkout = (summary: CompletedWorkoutSession) => {
    setActiveWorkoutSession(null);
    onAwardXP(summary.totalXpEarned, `Completed ${summary.workoutName}`, 'strength');
    setFitnessProfile(storage.getFitnessProfile());
    setProgressionStates(storage.getProgressionStates());
  };

  // ==========================================
  // CLASSIC QUICK LOGGING & STOPWATCH UTILITIES
  // ==========================================
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(() => exercises[0] || null);
  const [setsCount, setSetsCount] = useState<number>(3);
  const [repsCount, setRepsCount] = useState<number>(12);
  const [weightKg, setWeightKg] = useState<number>(0);
  const [isPR, setIsPR] = useState<boolean>(false);

  // Rest Stopwatch
  const [isRestActive, setIsRestActive] = useState<boolean>(false);
  const [restDuration, setRestDuration] = useState<number>(60);
  const [restTimeLeft, setRestTimeLeft] = useState<number>(60);

  useEffect(() => {
    if (!isRestActive) return;
    const interval = setInterval(() => {
      setRestTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          setIsRestActive(false);
          sounds.playTimerDone();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRestActive]);

  // Stamina Stopwatch
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [cardioActivity, setCardioActivity] = useState<'walking' | 'running' | 'cycling'>('running');

  useEffect(() => {
    let interval: any | null = null;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStopwatchRunning]);

  const handleFinishCardio = () => {
    if (stopwatchSeconds < 10) return;
    sounds.playQuestComplete();
    setIsStopwatchRunning(false);
    const durationMinutes = Math.max(1, Math.round(stopwatchSeconds / 60));
    const xp = Math.min(60, Math.max(15, Math.round(durationMinutes * 2)));

    const session: CardioSession = {
      id: `cs_${Date.now()}`,
      activityType: cardioActivity,
      date: new Date().toISOString().split('T')[0],
      durationMinutes,
      xpEarned: xp,
      completedAt: new Date().toISOString()
    };

    storage.saveCardioSessions([session, ...storage.getCardioSessions()]);
    onAwardXP(xp, `${cardioActivity.toUpperCase()} session: ${durationMinutes} mins`, 'stamina');
    setStopwatchSeconds(0);
  };

  const handleLogSingleExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;
    sounds.playQuestComplete();
    const xp = 25 + (isPR ? 15 : 0);

    const workoutSets = Array.from({ length: setsCount }, (_, i) => ({
      setNumber: i + 1,
      reps: repsCount,
      weightKg: weightKg > 0 ? weightKg : undefined,
      completed: true
    }));

    const log: WorkoutLog = {
      id: `log_${Date.now()}`,
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      sets: workoutSets,
      difficulty: 'moderate',
      date: new Date().toISOString().split('T')[0],
      xpEarned: xp,
      completedAt: new Date().toISOString()
    };

    storage.saveWorkoutLogs([log, ...storage.getWorkoutLogs()]);
    onAwardXP(xp, `Logged: ${selectedExercise.name} (${setsCount}×${repsCount})`, 'strength');

    setRestDuration(60);
    setRestTimeLeft(60);
    setIsRestActive(true);
  };

  // Reflex state
  const [reflexScores, setReflexScores] = useState<ReflexScore[]>(() => storage.getReflexScores());
  const handleSaveReflexScore = (newScore: ReflexScore) => {
    const updated = [newScore, ...reflexScores];
    setReflexScores(updated);
    storage.saveReflexScores(updated);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Active Workout Session Fullscreen Overlay */}
      {activeWorkoutSession && (
        <ActiveWorkoutSession
          workout={activeWorkoutSession}
          onClose={() => setActiveWorkoutSession(null)}
          onFinishWorkout={handleFinishWorkout}
        />
      )}

      {/* Visual Form Demonstration Modal */}
      {inspectedExercise && (
        <ExerciseVisualGuide
          exercise={inspectedExercise}
          onClose={() => setInspectedExercise(null)}
        />
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                <Dumbbell className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Bodyweight & Calisthenics Engine</h2>
            </div>
            {/* Mobile Info Toggle */}
            <button
              onClick={() => setIsIntroCollapsed(!isIntroCollapsed)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Toggle Description"
            >
              {isIntroCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
          {!isIntroCollapsed && (
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed mt-1 animate-in fade-in duration-150">
              12-Month Progressive System for Beginners (~10 push-up baseline). Safe joint loading, autoregulated reps, zero gym equipment.
            </p>
          )}
        </div>

        {/* Global Mode Switcher: Home vs Hostel */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 sm:p-2 rounded-2xl border border-slate-800 shrink-0 self-start sm:self-auto">
          <span className="text-[10px] uppercase font-bold text-slate-500 pl-2">Mode:</span>
          <button
            onClick={() => handleToggleEnvironment('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              fitnessProfile.environment === 'home'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => handleToggleEnvironment('hostel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              fitnessProfile.environment === 'hostel'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hostel (Quiet)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. DESKTOP TAB NAVIGATION (md: and up - 16:9 widescreen) */}
      {/* ======================================================== */}
      <div className="hidden md:flex flex-col gap-3 p-3.5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        {/* Tier 1: Calisthenics & Physical Mastery */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
              Calisthenics & Physical Mastery
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              6 Modes
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {TRAIN_TABS.filter(t => t.group === 'fitness').map(tab => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                    isSel
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-black shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-slate-950' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier 2: Cognitive Speed, Vision & Reflex Training */}
        <div className="pt-2.5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              Cognitive Speed, Vision & Reflexes
            </span>
            <span className="text-[10px] text-purple-400 font-semibold">
              Peripheral Vision & Agility
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {TRAIN_TABS.filter(t => t.group === 'cognitive').map(tab => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                    isSel
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black shadow-lg shadow-purple-500/25 ring-2 ring-purple-400'
                      : 'bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-500/40 hover:border-purple-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSel ? 'text-white' : tab.color}`} />
                  <span className="font-extrabold">{tab.label}</span>
                  {tab.id === 'eyecare' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-500/50 font-mono font-bold">
                      Schulte 5×5
                    </span>
                  )}
                  {tab.id === 'reflex' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-500/50 font-mono font-bold">
                      ms Tap
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MOBILE TRAINING NAVIGATION (md:hidden - 9:16 mobile) */}
      {/* ======================================================== */}
      <div className="flex md:hidden flex-col gap-2">
        {/* Active Mode Display & Mode Switcher Button */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 border border-cyan-500/30">
          <div className="flex items-center gap-2.5">
            {(() => {
              const current = TRAIN_TABS.find(t => t.id === activeTab) || TRAIN_TABS[0];
              const Icon = current.icon;
              return (
                <>
                  <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${current.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Section</span>
                    <span className="text-xs font-black text-white">{current.label}</span>
                  </div>
                </>
              );
            })()}
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setIsMobileModeMenuOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Modes (8)</span>
          </button>
        </div>

        {/* Compact Horizontal Quick-Pill Switcher (Drag-to-Scroll + Wheel enabled) */}
        <div 
          ref={mobilePillsScroll.ref}
          {...mobilePillsScroll.dragProps}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none cursor-grab active:cursor-grabbing select-none"
        >
          {TRAIN_TABS.map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (mobilePillsScroll.hasMoved.current) return;
                  handleSelectTab(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                  isSel
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-slate-950' : tab.color}`} />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE TRAINING MODE SELECTION MODAL SHEET */}
      {/* ======================================================== */}
      {isMobileModeMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-slate-950/85 backdrop-blur-md animate-in fade-in md:hidden">
          <div className="w-full bg-slate-900 border-t border-cyan-500/30 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  <Layers className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Select Training Mode</h3>
                  <p className="text-[11px] text-slate-400">All 8 Calisthenics, Vision & Reflex modules</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileModeMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TRAIN_TABS.map(tab => {
                const Icon = tab.icon;
                const isSel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab(tab.id as any);
                      setIsMobileModeMenuOpen(false);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      isSel
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${tab.color} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>{tab.label}</span>
                        {isSel && <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-bold uppercase">Active</span>}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{tab.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TODAY'S WORKOUT TAB */}
      {/* ======================================================== */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Day of Week Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {DAYS_OF_WEEK.map(day => {
              const isSel = selectedDay === day;
              const isToday = currentDayName === day;

              return (
                <button
                  key={day}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedDay(day);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer relative ${
                    isSel
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
                  )}
                  <span>{day}</span>
                </button>
              );
            })}
          </div>

          {/* WORKOUT HERO CARD */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    Phase {fitnessProfile.currentPhase}: Foundation
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    {fitnessProfile.environment === 'home' ? <Home className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                    {fitnessProfile.environment.toUpperCase()} ADAPTED
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                    🔥 {fitnessProfile.currentWorkoutStreak} Day Streak
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white">{todayWorkout.name}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Focus: <strong className="text-cyan-300">{todayWorkout.focusTheme}</strong>
                </p>
              </div>

              {/* Duration Tier Pill Selector (Strictly <= 60 mins) */}
              <div className="bg-slate-950/90 p-2 rounded-2xl border border-slate-800 space-y-1 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
                  Duration Tier (≤ 60m)
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'express', label: '15-20m', title: 'Express' },
                    { id: 'standard', label: '30-40m', title: 'Standard' },
                    { id: 'full', label: '45-55m', title: 'Full' }
                  ].map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => handleSelectDurationTier(tier.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        fitnessProfile.preferredDurationTier === tier.id
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Active Workout Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleStartActiveWorkout}
                className="w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 font-extrabold text-slate-950 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer text-sm"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Start Interactive Workout ({todayWorkout.totalEstimatedMinutes} mins)</span>
              </button>
            </div>
          </div>

          {/* WORKOUT BLOCKS BREAKDOWN */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
              Workout Structure (~{todayWorkout.totalEstimatedMinutes} Mins Total)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayWorkout.blocks.map((block, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">
                      {block.title}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      ~{block.estimatedMinutes}m
                    </span>
                  </div>

                  <div className="space-y-2">
                    {block.exercises.map((ex, exIdx) => {
                      const cEx = getExerciseById(ex.exerciseId);

                      return (
                        <div
                          key={exIdx}
                          className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white block">{ex.name}</span>
                            <span className="text-[11px] text-slate-400">
                              {ex.sets} sets × {ex.targetDurationSeconds ? `${ex.targetDurationSeconds}s hold` : `${ex.targetReps} reps`} · Tempo: {ex.tempo}
                            </span>
                          </div>

                          {cEx && (
                            <button
                              onClick={() => {
                                sounds.playClick();
                                setInspectedExercise(cEx);
                              }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                              title="View Form Guide"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CALISTHENICS SKILL TREE TAB */}
      {/* ======================================================== */}
      {activeTab === 'skills' && (
        <CalisthenicsSkillTree
          profile={fitnessProfile}
          progressionStates={progressionStates}
          onUpdateProfile={updated => setFitnessProfile(updated)}
        />
      )}

      {/* ======================================================== */}
      {/* 3. EXERCISE LIBRARY TAB */}
      {/* ======================================================== */}
      {activeTab === 'library' && <ExerciseLibraryView />}

      {/* ======================================================== */}
      {/* 4. 12-MONTH ROADMAP TAB */}
      {/* ======================================================== */}
      {activeTab === 'roadmap' && (
        <Roadmap12MonthView
          profile={fitnessProfile}
          onUpdateProfile={updated => setFitnessProfile(updated)}
        />
      )}

      {/* ======================================================== */}
      {/* 5. PR BENCHMARKS TAB */}
      {/* ======================================================== */}
      {activeTab === 'benchmarks' && <FitnessBenchmarkTests />}

      {/* ======================================================== */}
      {/* 6. CLASSIC QUICK LOGGING & CARDIO TAB */}
      {/* ======================================================== */}
      {activeTab === 'classic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Quick Strength Logger */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-orange-400" />
              <span>Manual Set Logger</span>
            </h3>

            <form onSubmit={handleLogSingleExercise} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Select Exercise</label>
                <select
                  value={selectedExercise?.id || ''}
                  onChange={e => {
                    const found = exercises.find(ex => ex.id === e.target.value);
                    if (found) setSelectedExercise(found);
                  }}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                >
                  {exercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Sets</label>
                  <input
                    type="number"
                    value={setsCount}
                    onChange={e => setSetsCount(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Reps / Set</label>
                  <input
                    type="number"
                    value={repsCount}
                    onChange={e => setRepsCount(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 font-bold text-xs text-slate-950 cursor-pointer shadow-lg shadow-orange-500/20"
              >
                Log Sets (+XP)
              </button>
            </form>
          </div>

          {/* Cardio Stopwatch */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-center">
            <h3 className="text-base font-extrabold text-white flex items-center justify-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span>Cardio & Aerobic Stopwatch</span>
            </h3>

            <div className="font-mono text-4xl font-black text-emerald-400 py-4">
              {Math.floor(stopwatchSeconds / 60)}:{(stopwatchSeconds % 60).toString().padStart(2, '0')}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsStopwatchRunning(!isStopwatchRunning);
                }}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs ${
                  isStopwatchRunning
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-500 text-slate-950'
                }`}
              >
                {isStopwatchRunning ? 'Pause' : 'Start Running/Walking'}
              </button>

              <button
                onClick={handleFinishCardio}
                disabled={stopwatchSeconds < 10}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-40"
              >
                Finish & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. EYE-CARE TAB */}
      {/* ======================================================== */}
      {activeTab === 'eyecare' && (
        <EyeCareTrainer onAwardXP={onAwardXP} />
      )}

      {/* ======================================================== */}
      {/* 8. REFLEX TEST TAB */}
      {/* ======================================================== */}
      {activeTab === 'reflex' && (
        <ReflexHub highScores={reflexScores} onSaveHighScore={handleSaveReflexScore} onAwardXP={onAwardXP} />
      )}
    </div>
  );
};
