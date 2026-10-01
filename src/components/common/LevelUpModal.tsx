import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../../types';
import { getRankTier } from '../../services/rpgEngine';
import { sounds } from '../../services/soundEffects';

interface LevelUpModalProps {
  profile: UserProfile;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ profile, onClose }) => {
  const { rank, badgeColor } = getRankTier(profile.level);

  useEffect(() => {
    sounds.playLevelUp();

    // Trigger double confetti blast
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } catch {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md p-6 overflow-hidden text-center border shadow-2xl rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-cyan-500/40 shadow-cyan-500/20">
        {/* Glow ambient background */}
        <div className="absolute top-0 w-48 h-48 -translate-x-1/2 rounded-full -translate-y-1/2 left-1/2 bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Level Up Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 text-xs font-black tracking-widest uppercase rounded-full border border-cyan-400/30 bg-cyan-950/50 text-cyan-300 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          SYSTEM AWAKENING
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300">
          LEVEL UP!
        </h2>

        {/* Level Number Ring */}
        <div className="relative flex items-center justify-center w-28 h-28 mx-auto my-5 rounded-full border-4 border-cyan-400/40 bg-slate-950 shadow-xl shadow-cyan-500/30">
          <div className="absolute inset-1 rounded-full border border-dashed border-cyan-300/30 animate-spin" style={{ animationDuration: '12s' }} />
          <div className="text-center">
            <span className="block text-xs font-semibold tracking-wider text-cyan-400/80">LVL</span>
            <span className="text-4xl font-black text-white">{profile.level}</span>
          </div>
        </div>

        {/* Rank & Title */}
        <div className="space-y-1 mb-6">
          <div className={`inline-block px-3 py-0.5 text-xs font-bold rounded-md bg-gradient-to-r ${badgeColor}`}>
            {rank}
          </div>
          <p className="text-sm font-medium text-slate-300">
            {profile.name} · <span className="text-cyan-400">{profile.title}</span>
          </p>
          <p className="text-xs text-slate-400 pt-2 px-4 italic">
            "Every completed quest hardens your discipline and strengthens your real-world character."
          </p>
        </div>

        {/* Bonus Stat perks */}
        <div className="grid grid-cols-2 gap-2 p-3 mb-6 rounded-xl bg-slate-800/50 border border-slate-700/60 text-left text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Discipline stat reinforced</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>New achievement progress</span>
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 active:scale-98"
        >
          CLAIM REWARDS & CONTINUE <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
