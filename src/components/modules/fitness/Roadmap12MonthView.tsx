import React from 'react';
import {
  Calendar,
  CheckCircle,
  Flag,
  Sparkles,
  Zap,
  Shield,
  HeartPulse,
  TrendingUp,
  Clock,
  Award,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserFitnessProfile, WorkoutPhase } from '../../../services/fitness/fitnessTypes';
import { PHASE_ROADMAP_DATA } from '../../../services/fitness/progressionEngine';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';

interface Roadmap12MonthViewProps {
  profile: UserFitnessProfile;
  onUpdateProfile: (profile: UserFitnessProfile) => void;
}

export const Roadmap12MonthView: React.FC<Roadmap12MonthViewProps> = ({
  profile,
  onUpdateProfile
}) => {
  const handleSelectPhase = (phaseNumber: WorkoutPhase) => {
    sounds.playLevelUp();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    const updated: UserFitnessProfile = {
      ...profile,
      currentPhase: phaseNumber
    };
    storage.saveFitnessProfile(updated);
    onUpdateProfile(updated);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">12-Month Periodization</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              Active: Phase {profile.currentPhase} of 6
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">Full 12-Month Calisthenics Blueprint</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Designed for beginners starting from ~10 push-ups and low stamina. Progress is dictated by tendon integrity, movement mastery, and autoregulation rather than arbitrary calendar rules.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Target Aerobic Stamina</span>
          <span className="text-xl font-black text-emerald-400">
            {PHASE_ROADMAP_DATA.find(p => p.phase === profile.currentPhase)?.targetStaminaMinutes || 10} Minutes Flow
          </span>
        </div>
      </div>

      {/* PROGRESSION PHILOSOPHY ACCORDION / CARD */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-extrabold text-white">Why Autoregulation Beats 7-Day Increases</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Tendon and ligament adaptations take up to <strong>3 to 5 times longer</strong> than muscular hypertrophy. Blindly adding reps every 7 days leads directly to elbow tendonitis, shoulder impingement, and chronic fatigue. Our system measures <em>repetition cleanliness</em>, <em>perceived effort</em>, and <em>form precision</em> to advance resistance only when your joints are truly prepared.
        </p>
      </div>

      {/* 6 PHASES TIMELINE */}
      <div className="space-y-4">
        {PHASE_ROADMAP_DATA.map(phaseInfo => {
          const isCurrent = profile.currentPhase === phaseInfo.phase;
          const isPassed = profile.currentPhase > phaseInfo.phase;

          return (
            <div
              key={phaseInfo.phase}
              className={`p-6 rounded-3xl border transition-all ${
                isCurrent
                  ? 'bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : isPassed
                  ? 'bg-slate-950/70 border-slate-800 opacity-80'
                  : 'bg-slate-950/50 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                        : isPassed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPassed ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : phaseInfo.phase}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500">{phaseInfo.months}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30 animate-pulse">
                          CURRENT STAGE
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{phaseInfo.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-slate-500">Stamina Goal:</span>{' '}
                    <span className="font-bold text-cyan-300">{phaseInfo.targetStaminaMinutes} mins</span>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => handleSelectPhase(phaseInfo.phase)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Set Active
                    </button>
                  )}
                </div>
              </div>

              {/* Primary Focus */}
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                <strong className="text-white">Primary Focus:</strong> {phaseInfo.primaryFocus}
              </p>

              {/* Key Milestones */}
              <div className="mt-4 pt-3 border-t border-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Phase Milestones</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {phaseInfo.keyMilestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2 text-xs text-slate-300"
                    >
                      <Flag className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
