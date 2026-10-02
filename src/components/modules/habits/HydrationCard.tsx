import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Plus,
  RotateCcw,
  Check,
  Flame,
  Settings2,
  Sparkles,
  CupSoda
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HydrationState } from '../../../types';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';
import { haptics } from '../../../services/hapticFeedback';

interface HydrationCardProps {
  onAwardXP?: (amount: number, description: string, stat: 'recovery') => void;
  className?: string;
}

export const HydrationCard: React.FC<HydrationCardProps> = ({ onAwardXP, className = '' }) => {
  const [hydration, setHydration] = useState<HydrationState>(() => storage.getHydrationState());
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [justAddedAmount, setJustAddedAmount] = useState<number | null>(null);

  // Sync on mount & storage events
  useEffect(() => {
    setHydration(storage.getHydrationState());
  }, []);

  const targetMl = hydration.targetMl || 3000;
  const currentMl = hydration.currentMl || 0;
  const percent = Math.min(100, Math.round((currentMl / targetMl) * 100));
  const isGoalMet = currentMl >= targetMl;

  const handleAddWater = (amount: number) => {
    sounds.playWaterDrop();
    haptics.light();
    setJustAddedAmount(amount);
    setTimeout(() => setJustAddedAmount(null), 1200);

    const { state, xpAwarded } = storage.updateHydration(amount);
    setHydration({ ...state });

    if (xpAwarded) {
      sounds.playQuestComplete();
      haptics.success();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      if (onAwardXP) {
        onAwardXP(xpAwarded, `Daily Hydration Target Reached (${targetMl}ml)`, 'recovery');
      }
    }
  };

  const handleSelectTarget = (newTarget: number) => {
    sounds.playClick();
    const updated = storage.setHydrationTarget(newTarget);
    setHydration({ ...updated });
    setIsEditingTarget(false);
  };

  // Water level Y coordinate: 0% is at y=100 (empty), 100% is at y=10 (full)
  const waveHeight = Math.max(8, Math.min(94, 96 - (percent * 0.88)));

  return (
    <div className={`p-4 sm:p-5 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-xl relative overflow-hidden flex flex-col justify-between ${className}`}>
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
              <Droplets className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black tracking-wide text-white uppercase">
                  Daily Hydration Wave
                </h3>
                {hydration.streak > 0 && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-950/80 border border-orange-500/30 text-orange-400 text-[10px] font-black">
                    <Flame className="w-3 h-3 fill-orange-500" /> {hydration.streak}d
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Optimal recovery & cognitive flow</p>
            </div>
          </div>

          {/* Target Pill / Edit Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                sounds.playClick();
                setIsEditingTarget(!isEditingTarget);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 ${
                isGoalMet
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-cyan-950/50 border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40'
              }`}
              title="Click to change target"
            >
              {isGoalMet ? (
                <>
                  <Check className="w-3 h-3" /> Goal Met
                </>
              ) : (
                <>
                  <Settings2 className="w-3 h-3 text-cyan-400" /> {targetMl} ml
                </>
              )}
            </button>

            {/* Target Selection Dropdown Popover */}
            {isEditingTarget && (
              <div className="absolute right-0 top-8 z-30 w-44 p-2 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-2xl space-y-1 animate-in fade-in zoom-in-95">
                <span className="text-[10px] font-black uppercase text-slate-400 px-2 block">
                  Select Daily Target
                </span>
                {[2000, 2500, 3000, 3500, 4000].map(val => (
                  <button
                    key={val}
                    onClick={() => handleSelectTarget(val)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      targetMl === val
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{val / 1000} Liters</span>
                    <span className="text-[10px] opacity-75 font-mono">{val}ml</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Water Reservoir with Animated SVG Wave */}
        <div className="relative my-3 w-full h-28 rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/20 shadow-inner flex items-center justify-center">
          {/* SVG Wave Layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-700 ease-out"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="hydrationWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.98" />
              </linearGradient>
              <linearGradient id="hydrationWaveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Background Secondary Wave */}
            <path
              d={`M 0,${waveHeight + 2} Q 25,${waveHeight - 4} 50,${waveHeight + 2} T 100,${waveHeight + 2} L 100,100 L 0,100 Z`}
              fill="url(#hydrationWaveGrad2)"
              className="animate-pulse duration-1000"
            />

            {/* Foreground Primary Wave */}
            <path
              d={`M 0,${waveHeight} Q 25,${waveHeight + 4} 50,${waveHeight} T 100,${waveHeight} L 100,100 L 0,100 Z`}
              fill="url(#hydrationWaterGrad)"
            />
          </svg>

          {/* Floating readout in center of reservoir */}
          <div className="relative z-10 text-center drop-shadow-md">
            <div className="flex items-baseline justify-center gap-1 font-mono font-black text-white text-2xl tracking-tight">
              <span>{currentMl}</span>
              <span className="text-xs font-bold text-cyan-200 uppercase font-sans">
                / {targetMl} ml
              </span>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-950/60 text-cyan-300 border border-cyan-400/30 backdrop-blur-sm">
                {percent}% HYDRATED
              </span>
            </div>
          </div>

          {/* Floating +Amount Notification */}
          {justAddedAmount !== null && (
            <div className="absolute top-2 right-3 z-20 text-xs font-black text-emerald-400 bg-slate-950/90 px-2 py-0.5 rounded-full border border-emerald-500/50 shadow-lg animate-in fade-in slide-in-from-bottom-2">
              {justAddedAmount > 0 ? `+${justAddedAmount}ml` : `${justAddedAmount}ml`}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Matrix (1-Tap Buttons) */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {/* +250ml Glass Button */}
          <button
            type="button"
            onClick={() => handleAddWater(250)}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 text-xs font-bold active:scale-95 transition-all shadow-sm"
            title="Drink 1 Glass of Water (+250ml)"
          >
            <CupSoda className="w-3.5 h-3.5 text-cyan-400" />
            <span>+250 ml</span>
          </button>

          {/* +500ml Bottle Button */}
          <button
            type="button"
            onClick={() => handleAddWater(500)}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 border border-blue-500/40 text-blue-200 text-xs font-bold active:scale-95 transition-all shadow-sm"
            title="Drink 1 Sports Bottle (+500ml)"
          >
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span>+500 ml</span>
          </button>

          {/* -250ml Undo Button */}
          <button
            type="button"
            onClick={() => handleAddWater(-250)}
            disabled={currentMl <= 0}
            className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
            title="Undo last log (-250ml)"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>-250 ml</span>
          </button>
        </div>

        {/* Milestone Indicator */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Target Reward: +25 Recovery XP</span>
          {isGoalMet && (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Target Complete!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
