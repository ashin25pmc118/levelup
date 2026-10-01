import React, { useState } from 'react';
import {
  Trophy,
  Activity,
  Plus,
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  ChevronRight,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BenchmarkRecord, FitnessBenchmarkType } from '../../../services/fitness/fitnessTypes';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';

interface BenchmarkStandards {
  beginner: string;
  intermediate: string;
  advanced: string;
  instructions: string;
}

const BENCHMARK_STANDARDS: Record<FitnessBenchmarkType, BenchmarkStandards> = {
  max_pushups: {
    beginner: '< 15 reps',
    intermediate: '15–30 reps',
    advanced: '30+ clean reps',
    instructions: 'Perform as many consecutive, controlled push-ups as possible. Chest must touch or come within 2 inches of floor. No resting in downward dog.'
  },
  plank_hold: {
    beginner: '< 45 seconds',
    intermediate: '45–90 seconds',
    advanced: '90+ seconds',
    instructions: 'Hold a forearm plank with posterior pelvic tilt. Stop timing immediately when hips sag or pike.'
  },
  squats_2min: {
    beginner: '< 35 reps',
    intermediate: '35–60 reps',
    advanced: '60+ deep reps',
    instructions: 'Perform continuous bodyweight squats for 2 minutes. Hips must break parallel crease on each rep.'
  },
  dead_hang: {
    beginner: '< 30 seconds',
    intermediate: '30–75 seconds',
    advanced: '75+ seconds',
    instructions: 'Dead hang from a pull-up bar or sturdy ledge with active scapular tension. Time until grip releases.'
  },
  pullups_max: {
    beginner: '0–3 reps (or 5 eccentrics)',
    intermediate: '4–10 strict reps',
    advanced: '12+ strict reps',
    instructions: 'Dead-hang start, pull until chin completely clears the bar without kicking or kipping.'
  },
  hollow_hold: {
    beginner: '< 25 seconds',
    intermediate: '25–50 seconds',
    advanced: '50+ seconds',
    instructions: 'Gymnastic hollow body hold with arms overhead and lower back flattened completely against the floor.'
  },
  cardio_test: {
    beginner: '5–12 minutes',
    intermediate: '13–25 minutes',
    advanced: '25+ minutes',
    instructions: 'Sustained continuous aerobic output (brisk walking, light jog, quiet shadow boxing, or hostel stepping) without stopping.'
  }
};

export const FitnessBenchmarkTests: React.FC = () => {
  const [records, setRecords] = useState<BenchmarkRecord[]>(() => storage.getBenchmarkRecords());
  const [activeTest, setActiveTest] = useState<BenchmarkRecord | null>(null);
  const [inputScore, setInputScore] = useState<number>(10);
  const [inputNotes, setInputNotes] = useState<string>('');
  const [prCelebration, setPrCelebration] = useState<string | null>(null);

  const handleOpenLogModal = (rec: BenchmarkRecord) => {
    sounds.playClick();
    setActiveTest(rec);
    setInputScore(rec.bestScore || 10);
    setInputNotes('');
    setPrCelebration(null);
  };

  const handleSaveScore = () => {
    if (!activeTest) return;

    const isNewPR = inputScore > activeTest.bestScore;
    if (isNewPR) {
      sounds.playLevelUp();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      setPrCelebration(`🎉 NEW PERSONAL RECORD! ${inputScore} ${activeTest.unit}!`);
    } else {
      sounds.playQuestComplete();
    }

    const updated = storage.saveBenchmarkRecord(activeTest.testType, inputScore, inputNotes);
    setRecords([...updated]);

    // Give XP bonus for testing
    const prof = storage.getProfile();
    const xpBonus = isNewPR ? 60 : 30;
    prof.currentXP += xpBonus;
    prof.totalXP += xpBonus;
    prof.todayXP += xpBonus;
    prof.stats.discipline = (prof.stats.discipline || 15) + 1;
    storage.saveProfile(prof);

    setTimeout(() => {
      setActiveTest(null);
      setPrCelebration(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Objective Fitness Testing</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
              Personal Records
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">Baseline Benchmark Tests</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Test yourself every 3 to 4 weeks. Progression is measured in controlled repetitions, hold seconds, and technical mastery, not arbitrary calendar weeks.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 shrink-0">
          <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Benchmarks</span>
            <span className="text-base font-extrabold text-white">{records.length} Monitored Tests</span>
          </div>
        </div>
      </div>

      {/* BENCHMARK CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map(rec => {
          const std = BENCHMARK_STANDARDS[rec.testType];

          return (
            <div
              key={rec.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-500/30">
                    {rec.unit.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {rec.lastTestDate || 'Untested'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                  {rec.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {std?.instructions}
                </p>

                {/* Standards Pills */}
                {std && (
                  <div className="mt-3 grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[10px] text-center">
                    <div>
                      <span className="text-slate-500 block">Beg</span>
                      <span className="font-bold text-slate-300">{std.beginner}</span>
                    </div>
                    <div className="border-x border-slate-800 px-1">
                      <span className="text-cyan-400 block">Int</span>
                      <span className="font-bold text-cyan-300">{std.intermediate}</span>
                    </div>
                    <div>
                      <span className="text-amber-400 block">Adv</span>
                      <span className="font-bold text-amber-300">{std.advanced}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Best Score & Log Button */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Personal Record</span>
                  <span className="text-2xl font-black text-amber-400">
                    {rec.bestScore} <span className="text-xs font-semibold text-slate-400">{rec.unit}</span>
                  </span>
                </div>

                <button
                  onClick={() => handleOpenLogModal(rec)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Score</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* LOG SCORE MODAL */}
      {activeTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl text-slate-100 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Benchmark Logging</span>
                <h3 className="text-xl font-black text-white">{activeTest.title}</h3>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTest(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {prCelebration ? (
              <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-400 text-amber-200 text-center font-bold animate-bounce">
                {prCelebration}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Current All-Time Best</span>
                  <span className="text-base font-black text-amber-400">
                    {activeTest.bestScore} {activeTest.unit}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Recorded Score ({activeTest.unit}):
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInputScore(s => Math.max(1, s - 1))}
                      className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={inputScore}
                      onChange={e => setInputScore(Number(e.target.value))}
                      className="flex-1 text-center font-mono text-2xl font-black bg-slate-950 border border-slate-800 rounded-xl py-2.5 text-cyan-300 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={() => setInputScore(s => s + 1)}
                      className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Session Notes (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. Clean pauses, full chest contact, zero wrist strain"
                    value={inputNotes}
                    onChange={e => setInputNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  onClick={handleSaveScore}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Save Benchmark Record (+XP)
                </button>
              </div>
            )}

            {/* Test History List */}
            {activeTest.history && activeTest.history.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Previous Tests</span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {activeTest.history.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-400">{h.date}</span>
                      <span className="font-extrabold text-slate-200">
                        {h.score} {activeTest.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
