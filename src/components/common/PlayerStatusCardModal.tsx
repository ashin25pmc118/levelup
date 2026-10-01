import React from 'react';
import {
  X,
  Trophy,
  Flame,
  Shield,
  Sparkles,
  Swords,
  Eye,
  Brain,
  Zap,
  Dumbbell,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getRequiredXPForLevel, getRankTier } from '../../services/rpgEngine';
import { StatRadar } from './StatRadar';
import { sounds } from '../../services/soundEffects';

interface PlayerStatusCardModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerStatusCardModal: React.FC<PlayerStatusCardModalProps> = ({
  profile,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const reqXP = getRequiredXPForLevel(profile.level);
  const xpPercent = Math.min(100, Math.round((profile.currentXP / reqXP) * 100));
  const { rank, badgeColor } = getRankTier(profile.level);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20 overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Shield className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
                [ SYSTEM STATUS WINDOW ]
              </span>
              <h3 className="text-base font-black text-white">Player Identity Card</h3>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Card Top: Avatar, Rank & Title */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            {/* Level Badge */}
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/30 to-purple-600/30 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30 shrink-0">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">LEVEL</span>
                <span className="text-2xl font-black text-white">{profile.level}</span>
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h4 className="text-xl font-black text-white">{profile.name}</h4>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${badgeColor}`}>
                  {rank}
                </span>
              </div>
              <p className="text-xs text-cyan-300 font-bold">{profile.title}</p>
              
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-bold text-orange-400">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" /> {profile.currentStreak} Day Streak
                </span>
                <span>•</span>
                <span className="font-mono text-cyan-400 font-bold">+{profile.todayXP} XP Today</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Next Level Progression</span>
              <span className="text-cyan-400 font-mono">{profile.currentXP} / {reqXP} XP ({xpPercent}%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Equipped Reality Gear */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              Equipped Gear & Arsenal
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                <span className="text-lg">🏋️</span>
                <div>
                  <span className="font-bold text-white block">2.5kg & 5kg Dumbbells</span>
                  <span className="text-[11px] text-slate-400">Home Mode Arsenal (High-Volume)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                <span className="text-lg">👓</span>
                <div>
                  <span className="font-bold text-white block">Protective Spectacles</span>
                  <span className="text-[11px] text-slate-400">Near-Far Accommodation Relic</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                <span className="text-lg">🏸</span>
                <div>
                  <span className="font-bold text-white block">Split-Step Elastic Footwork</span>
                  <span className="text-[11px] text-slate-400">Sub-200ms Reaction Technique</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                <span className="text-lg">🧠</span>
                <div>
                  <span className="font-bold text-white block">40Hz Gamma Soundwave</span>
                  <span className="text-[11px] text-slate-400">Deep Study Cognition Buffer</span>
                </div>
              </div>
            </div>
          </div>

          {/* 9-Stat RPG Spider Radar Chart */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block text-center mb-2">
              Character Attribute Matrix (9 Stats)
            </span>
            <div className="flex justify-center">
              <StatRadar stats={profile.stats} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 text-center">
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md transition-colors"
          >
            CONFIRM & RETURN TO SYSTEM
          </button>
        </div>
      </div>
    </div>
  );
};
