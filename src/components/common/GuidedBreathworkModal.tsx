import React, { useState, useEffect, useRef } from 'react';
import { X, Wind, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { haptics } from '../../services/hapticFeedback';

interface GuidedBreathworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'box' | 'relax';
}

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

export const GuidedBreathworkModal: React.FC<GuidedBreathworkModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'box'
}) => {
  const [mode, setMode] = useState<'box' | 'relax'>(initialMode);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('inhale');
  const [secondsInPhase, setSecondsInPhase] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  // Phase durations
  // Box: 4s Inhale, 4s Hold, 4s Exhale, 4s Hold
  // Relax (4-7-8): 4s Inhale, 7s Hold, 8s Exhale, 0s Hold
  const phaseDurations = React.useMemo(() => {
    if (mode === 'box') {
      return { inhale: 4, 'hold-in': 4, exhale: 4, 'hold-out': 4 };
    }
    return { inhale: 4, 'hold-in': 7, exhale: 8, 'hold-out': 0 };
  }, [mode]);

  // Reset when mode changes
  useEffect(() => {
    setCurrentPhase('inhale');
    setSecondsInPhase(phaseDurations.inhale);
  }, [mode, phaseDurations]);

  // Timer loop
  useEffect(() => {
    if (!isOpen || !isActive) return;

    const interval = setInterval(() => {
      setSecondsInPhase(prev => {
        if (prev <= 1) {
          // Transition to next phase
          sounds.playTick();
          haptics.light();

          if (currentPhase === 'inhale') {
            setCurrentPhase('hold-in');
            return phaseDurations['hold-in'];
          } else if (currentPhase === 'hold-in') {
            setCurrentPhase('exhale');
            return phaseDurations.exhale;
          } else if (currentPhase === 'exhale') {
            if (phaseDurations['hold-out'] > 0) {
              setCurrentPhase('hold-out');
              return phaseDurations['hold-out'];
            } else {
              setCompletedCycles(c => c + 1);
              setCurrentPhase('inhale');
              sounds.playTimerDone();
              return phaseDurations.inhale;
            }
          } else {
            // hold-out ended
            setCompletedCycles(c => c + 1);
            setCurrentPhase('inhale');
            sounds.playTimerDone();
            return phaseDurations.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isActive, currentPhase, phaseDurations]);

  if (!isOpen) return null;

  const phaseLabels: Record<BreathPhase, { title: string; instruction: string; color: string }> = {
    inhale: { title: 'INHALE', instruction: 'Breathe in slowly through your nose...', color: 'text-cyan-300' },
    'hold-in': { title: 'HOLD GENTLE', instruction: 'Keep airways relaxed, do not clamp...', color: 'text-amber-300' },
    exhale: { title: 'EXHALE', instruction: 'Release smoothly through your mouth...', color: 'text-purple-300' },
    'hold-out': { title: 'HOLD EMPTY', instruction: 'Rest in stillness...', color: 'text-emerald-300' }
  };

  // Scale of visual circle
  const getCircleScale = () => {
    if (currentPhase === 'inhale') return 'scale-125';
    if (currentPhase === 'hold-in') return 'scale-125';
    if (currentPhase === 'exhale') return 'scale-90';
    return 'scale-90';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-center text-slate-100 space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wind className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-extrabold text-white">Guided Breathwork</h3>
              <p className="text-[10px] text-slate-400">Autonomic Nervous System Downregulation</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-center gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 relative z-10">
          <button
            onClick={() => {
              sounds.playClick();
              setMode('box');
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
              mode === 'box'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Box (4-4-4-4)
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setMode('relax');
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
              mode === 'relax'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Relax (4-7-8)
          </button>
        </div>

        {/* Breathing Animation Canvas */}
        <div className="py-6 flex flex-col items-center justify-center relative z-10 min-h-[220px]">
          <div
            className={`w-36 h-36 rounded-full border-4 border-cyan-400/80 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex flex-col items-center justify-center shadow-2xl shadow-cyan-500/20 transition-all duration-1000 ease-in-out ${getCircleScale()}`}
          >
            <span className="font-mono text-4xl font-black text-white">{secondsInPhase}</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300 mt-1">
              {phaseLabels[currentPhase].title}
            </span>
          </div>

          <p className="text-xs text-slate-300 font-medium mt-6 min-h-[20px] transition-all">
            {phaseLabels[currentPhase].instruction}
          </p>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
            Cycles Completed: {completedCycles}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pt-2 relative z-10">
          <button
            onClick={() => {
              sounds.playClick();
              setIsActive(!isActive);
            }}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              isActive
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause Pacer' : 'Resume'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setCompletedCycles(0);
              setCurrentPhase('inhale');
              setSecondsInPhase(phaseDurations.inhale);
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reset Pacer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
