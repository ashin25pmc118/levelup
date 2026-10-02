import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Plus,
  CheckCircle2,
  Circle,
  X,
  Trash2,
  Brain,
  Droplets,
  Terminal,
  Activity,
  Edit3,
  Zap,
  Moon,
  Dumbbell,
  BookOpen,
  Award
} from 'lucide-react';
import { AtomicHabit, StatType } from '../../../types';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';
import { haptics } from '../../../services/hapticFeedback';

interface AtomicHabitsTrackerProps {
  onAwardXP?: (amount: number, description: string, stat: StatType) => void;
  className?: string;
}

const HABIT_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Droplets,
  Brain,
  Terminal,
  Activity,
  Edit3,
  Zap,
  Moon,
  Dumbbell,
  BookOpen,
  Award,
  Sparkles
};

export const AtomicHabitsTracker: React.FC<AtomicHabitsTrackerProps> = ({ onAwardXP, className = '' }) => {
  const [habits, setHabits] = useState<AtomicHabit[]>(() => storage.getAtomicHabits());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [xpAnimId, setXpAnimId] = useState<string | null>(null);

  // Form State for Adding Custom Habit
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AtomicHabit['category']>('productivity');
  const [newIcon, setNewIcon] = useState('Sparkles');
  const [newStat, setNewStat] = useState<StatType>('discipline');
  const [newXp, setNewXp] = useState(15);

  useEffect(() => {
    setHabits(storage.getAtomicHabits());
  }, []);

  const todayKey = new Date().toISOString().split('T')[0];

  // Generate the last 7 calendar days (ending with today)
  const past7Days = React.useMemo(() => {
    const days: { dateStr: string; label: string; isToday: boolean }[] = [];
    const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        label: DAY_NAMES[d.getDay()],
        isToday: dateStr === todayKey
      });
    }
    return days;
  }, [todayKey]);

  const handleToggleHabit = (habitId: string) => {
    sounds.playHabitCheck();
    haptics.light();

    const { habit, habits: updatedList, xpAwarded } = storage.toggleHabit(habitId, todayKey);
    setHabits([...updatedList]);

    if (xpAwarded) {
      setXpAnimId(habitId);
      setTimeout(() => setXpAnimId(null), 1000);
      if (onAwardXP) {
        onAwardXP(xpAwarded, `Micro-Habit Complete: ${habit.title}`, habit.statTarget);
      }
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    sounds.playClick();
    const created = storage.addCustomHabit({
      title: newTitle.trim(),
      category: newCategory,
      icon: newIcon,
      statTarget: newStat,
      xpReward: newXp
    });

    setHabits(prev => [...prev, created]);
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  const handleDeleteHabit = (habitId: string) => {
    sounds.playClick();
    const remaining = storage.deleteHabit(habitId);
    setHabits([...remaining]);
  };

  return (
    <div className={`p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-black tracking-wide text-white uppercase">
              Atomic Micro-Habits
            </h3>
            <p className="text-[11px] text-slate-400">
              Daily micro-actions & 7-day consistency dot matrix
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            setIsAddModalOpen(true);
          }}
          className="py-1.5 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Habit
        </button>
      </div>

      {/* Habit List */}
      <div className="space-y-2.5">
        {habits.map(habit => {
          const isDoneToday = Boolean(habit.history[todayKey]);
          const IconComp = HABIT_ICONS[habit.icon] || Sparkles;
          const isAnim = xpAnimId === habit.id;

          return (
            <div
              key={habit.id}
              className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                isDoneToday
                  ? 'bg-slate-950/70 border-purple-500/30 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Checkbox & Habit Title */}
                <div
                  onClick={() => handleToggleHabit(habit.id)}
                  className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                >
                  <div className="shrink-0 transition-transform group-hover:scale-110">
                    {isDoneToday ? (
                      <CheckCircle2 className="w-5 h-5 text-purple-400 fill-purple-950" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 group-hover:text-purple-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold truncate transition-all ${
                        isDoneToday ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}>
                        {habit.title}
                      </span>

                      {habit.currentStreak > 0 && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-950/80 border border-orange-500/30 text-orange-400 text-[10px] font-black shrink-0">
                          <Flame className="w-2.5 h-2.5 fill-orange-500" />
                          <span>{habit.currentStreak}d</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      <span className="capitalize text-purple-300/80">{habit.category}</span>
                      <span>•</span>
                      <span className="capitalize text-slate-400">+{habit.xpReward} {habit.statTarget} XP</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: 7-Day Consistency Dot Matrix & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Floating XP Animation */}
                  {isAnim && (
                    <span className="text-xs font-black text-purple-400 animate-bounce bg-slate-950 px-2 py-0.5 rounded-full border border-purple-500 shadow-lg">
                      +{habit.xpReward} XP!
                    </span>
                  )}

                  {/* 7-Day Dot Matrix */}
                  <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                    {past7Days.map(day => {
                      const completedOnDay = Boolean(habit.history[day.dateStr]);
                      return (
                        <div
                          key={day.dateStr}
                          className="flex flex-col items-center gap-0.5"
                          title={`${day.label} (${day.dateStr}): ${completedOnDay ? 'Completed' : 'Pending'}`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full transition-all ${
                              completedOnDay
                                ? 'bg-purple-400 shadow-sm shadow-purple-500/50'
                                : day.isToday
                                ? 'border border-dashed border-purple-400/60 bg-transparent'
                                : 'bg-slate-800 border border-slate-700/60'
                            }`}
                          />
                          <span className="text-[8px] font-mono text-slate-400">
                            {day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delete button (only on hover or mobile) */}
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {habits.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            No micro-habits created yet. Tap <strong>+ Add Habit</strong> above to set your first routine!
          </div>
        )}
      </div>

      {/* Add Custom Habit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-purple-500/40 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-500/30">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </span>
                <h3 className="text-sm font-black text-white">Create New Micro-Habit</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Habit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 10 Pages, Cold Shower, DuoLingo..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="health">Health & Body</option>
                    <option value="productivity">Productivity</option>
                    <option value="mindset">Mindset & Calm</option>
                    <option value="learning">Learning & Study</option>
                    <option value="fitness">Fitness</option>
                    <option value="routine">Daily Routine</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">RPG Stat Boost</label>
                  <select
                    value={newStat}
                    onChange={e => setNewStat(e.target.value as any)}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="discipline">Discipline</option>
                    <option value="focus">Focus</option>
                    <option value="knowledge">Knowledge</option>
                    <option value="recovery">Recovery</option>
                    <option value="strength">Strength</option>
                    <option value="stamina">Stamina</option>
                    <option value="confidence">Confidence</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">XP Reward Per Completion</label>
                <div className="flex gap-2">
                  {[10, 15, 20, 25].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setNewXp(val)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        newXp === val
                          ? 'bg-purple-600 text-white border-purple-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      +{val} XP
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
