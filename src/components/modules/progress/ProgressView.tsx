import React, { useState } from 'react';
import {
  BarChart2,
  Trophy,
  Shield,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  CheckCircle,
  HelpCircle,
  HeartHandshake,
  Check
} from 'lucide-react';
import { UserProfile, Achievement, WeeklyReview, StatType } from '../../../types';
import { StatRadar } from '../../common/StatRadar';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';

interface ProgressViewProps {
  profile: UserProfile;
  achievements: Achievement[];
  weeklyReviews: WeeklyReview[];
  onSaveWeeklyReviews: (reviews: WeeklyReview[]) => void;
  onAwardXP: (amount: number, description: string, stat: 'discipline') => void;
}

const STAT_INFO: { key: StatType; label: string; desc: string; icon: string; color: string }[] = [
  { key: 'strength', label: 'Strength', desc: 'Bodyweight sets & physical conditioning', icon: '💪', color: 'text-red-400' },
  { key: 'stamina', label: 'Stamina', desc: 'Cardio endurance and movement duration', icon: '🫀', color: 'text-orange-400' },
  { key: 'focus', label: 'Focus', desc: 'Pomodoro focus blocks & deep work', icon: '🧠', color: 'text-purple-400' },
  { key: 'reflex', label: 'Reflex', desc: 'Reaction test speed & quick response', icon: '⚡', color: 'text-yellow-400' },
  { key: 'awareness', label: 'Awareness', desc: '20-20-20 eye care & screen breaks', icon: '👁️', color: 'text-cyan-400' },
  { key: 'knowledge', label: 'Knowledge', desc: 'Lecture study & deliberate skill practice', icon: '📚', color: 'text-blue-400' },
  { key: 'recovery', label: 'Recovery', desc: 'Stretching, sleep habits & active rest', icon: '😴', color: 'text-emerald-400' },
  { key: 'confidence', label: 'Confidence', desc: 'Progressive social comfort challenges', icon: '🗣️', color: 'text-pink-400' },
  { key: 'discipline', label: 'Discipline', desc: 'Timetable adherence & daily quest completion', icon: '🎯', color: 'text-violet-400' }
];

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  achievements,
  weeklyReviews,
  onSaveWeeklyReviews,
  onAwardXP
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'weekly'>('stats');

  // Weekly review form
  const [improvedNote, setImprovedNote] = useState('');
  const [improveNextWeekNote, setImproveNextWeekNote] = useState('');
  const [skippedNote, setSkippedNote] = useState('');
  const [proudOfNote, setProudOfNote] = useState('');

  const handleSaveWeeklyReview = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playQuestComplete();

    const review: WeeklyReview = {
      id: `wr_${Date.now()}`,
      weekStartDate: new Date().toISOString().split('T')[0],
      xpEarned: profile.todayXP,
      questsCompleted: 5,
      workoutMinutes: 45,
      focusMinutes: 50,
      improvedNote: improvedNote.trim(),
      improveNextWeekNote: improveNextWeekNote.trim(),
      skippedNote: skippedNote.trim(),
      proudOfNote: proudOfNote.trim(),
      completedAt: new Date().toISOString()
    };

    onSaveWeeklyReviews([review, ...weeklyReviews]);
    onAwardXP(50, 'Completed Weekly Self-Reflection & Planning', 'discipline');
    setImprovedNote('');
    setImproveNextWeekNote('');
    setSkippedNote('');
    setProudOfNote('');
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <BarChart2 className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">Character Stats & Progression</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Inspect your 9-stat RPG radar polygon, unlockable badges, and weekly self-reflection reviews.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'stats', label: '9-Stat Radar', icon: Sparkles },
            { id: 'achievements', label: `Achievements (${unlockedCount}/${achievements.length})`, icon: Trophy },
            { id: 'weekly', label: 'Weekly Review', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. 9-STAT RADAR & METRICS */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Radar Chart Display */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-xl flex flex-col items-center justify-center">
            <div className="text-center mb-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-bold border border-cyan-500/30 uppercase tracking-wider">
                CHARACTER POLYGON
              </span>
              <h3 className="text-lg font-black text-white mt-1">9-Dimensional Status Web</h3>
              <p className="text-[11px] text-slate-400">
                Attributes scale automatically from your daily logged workouts, focus blocks, and quests.
              </p>
            </div>

            <StatRadar stats={profile.stats} size={330} />
          </div>

          {/* Stat Details Grid */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Stat Breakdown (1 - 100 Scale)
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {STAT_INFO.map(s => {
                const val = Math.round(profile.stats[s.key] || 10);
                return (
                  <div
                    key={s.key}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {s.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{s.label}</h4>
                          <span className={`text-[11px] font-black ${s.color}`}>{val}/100</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{s.desc}</p>
                      </div>
                    </div>

                    <div className="w-24 h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${Math.min(100, val)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(ach => {
            const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  ach.isUnlocked
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'bg-slate-900/50 border-slate-800/80 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400">
                      <Trophy className={`w-5 h-5 ${ach.isUnlocked ? 'text-amber-400' : 'text-slate-600'}`} />
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        ach.isUnlocked
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      +{ach.xpReward} XP
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{ach.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {ach.description}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{ach.progress} / {ach.maxProgress}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. WEEKLY REVIEW & JOURNAL */}
      {activeTab === 'weekly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Review Input Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
              Weekly Debrief Journal
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Step back once a week. Reflecting on skipped items and proud milestones builds self-compassion.
            </p>

            <form onSubmit={handleSaveWeeklyReview} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">
                  1. What improved this week?
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Woke up on time 4 days, finished calculus chapter..."
                  value={improvedNote}
                  onChange={e => setImprovedNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-300 mb-1">
                  2. What should I improve next week?
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Stop doomscrolling before sleep, do morning stretching..."
                  value={improveNextWeekNote}
                  onChange={e => setImproveNextWeekNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-orange-300 mb-1">
                  3. What did I skip? (No guilt, just awareness)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Skipped Thursday workout because of fatigue..."
                  value={skippedNote}
                  onChange={e => setSkippedNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  4. What am I proud of?
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Spoke up in seminar and remained calm under pressure..."
                  value={proudOfNote}
                  onChange={e => setProudOfNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" /> SAVE REVIEW & EARN +50 XP
              </button>
            </form>
          </div>

          {/* Past Reviews List */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Past Weekly Reviews ({weeklyReviews.length})
            </h3>

            {weeklyReviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No past reviews yet. Submit your first weekly reflection!
              </p>
            ) : (
              <div className="space-y-3">
                {weeklyReviews.map(rev => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex justify-between font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                      <span>Week of {rev.weekStartDate}</span>
                      <span className="text-cyan-400">+{rev.xpEarned} XP</span>
                    </div>
                    <p><strong className="text-cyan-300">Improved:</strong> {rev.improvedNote}</p>
                    <p><strong className="text-purple-300">Next Focus:</strong> {rev.improveNextWeekNote}</p>
                    {rev.skippedNote && (
                      <p><strong className="text-orange-300">Skipped:</strong> {rev.skippedNote}</p>
                    )}
                    <p><strong className="text-emerald-300">Proud of:</strong> {rev.proudOfNote}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
