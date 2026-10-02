import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  RotateCcw,
  Trophy,
  Zap,
  Clock,
  Target,
  Info,
  Award,
  CheckCircle2,
  AlertTriangle,
  Brain,
  ShieldCheck,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../../services/soundEffects';
import { haptics } from '../../../services/hapticFeedback';

interface StroopTestProps {
  onAwardXP: (amount: number, description: string, stat: 'reflex' | 'awareness' | 'recovery') => void;
}

interface ColorOption {
  id: string;
  label: string;
  cssColor: string;
  bgClass: string;
  borderClass: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { id: 'red', label: 'RED', cssColor: '#ef4444', bgClass: 'bg-red-500/20 hover:bg-red-500/30', borderClass: 'border-red-500/50' },
  { id: 'blue', label: 'BLUE', cssColor: '#3b82f6', bgClass: 'bg-blue-500/20 hover:bg-blue-500/30', borderClass: 'border-blue-500/50' },
  { id: 'green', label: 'GREEN', cssColor: '#10b981', bgClass: 'bg-emerald-500/20 hover:bg-emerald-500/30', borderClass: 'border-emerald-500/50' },
  { id: 'yellow', label: 'YELLOW', cssColor: '#eab308', bgClass: 'bg-yellow-500/20 hover:bg-yellow-500/30', borderClass: 'border-yellow-500/50' },
  { id: 'purple', label: 'PURPLE', cssColor: '#a855f7', bgClass: 'bg-purple-500/20 hover:bg-purple-500/30', borderClass: 'border-purple-500/50' }
];

interface TrialRecord {
  isCongruent: boolean;
  latencyMs: number;
  correct: boolean;
}

export const StroopTest: React.FC<StroopTestProps> = ({ onAwardXP }) => {
  const [gameState, setGameState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [currentWord, setCurrentWord] = useState<string>('RED');
  const [currentColor, setCurrentColor] = useState<ColorOption>(COLOR_OPTIONS[1]); // e.g. blue color
  const [score, setScore] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [trials, setTrials] = useState<TrialRecord[]>([]);
  const [trialStartTime, setTrialStartTime] = useState<number>(0);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('levelup_stroop_best') || 0);
    } catch {
      return 0;
    }
  });

  const timerRef = useRef<any | null>(null);

  // Pick random next word & font color
  const generateTrial = () => {
    const wordOption = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
    // ~75% chance of incongruent interference, ~25% congruent
    const makeCongruent = Math.random() < 0.25;
    let colorOption = wordOption;

    if (!makeCongruent) {
      const candidates = COLOR_OPTIONS.filter(c => c.id !== wordOption.id);
      colorOption = candidates[Math.floor(Math.random() * candidates.length)];
    }

    setCurrentWord(wordOption.label);
    setCurrentColor(colorOption);
    setTrialStartTime(Date.now());
  };

  const handleStartGame = () => {
    sounds.playClick();
    setGameState('running');
    setSecondsLeft(30);
    setScore(0);
    setTotalAttempts(0);
    setStreak(0);
    setMaxStreak(0);
    setTrials([]);
    setFeedback(null);
    generateTrial();
  };

  useEffect(() => {
    if (gameState === 'running') {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            handleCompleteGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleCompleteGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('completed');
    sounds.playTimerDone();

    setScore(currentScore => {
      if (currentScore > bestScore) {
        setBestScore(currentScore);
        try {
          localStorage.setItem('levelup_stroop_best', String(currentScore));
        } catch {}
      }
      return currentScore;
    });

    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } catch {}

    onAwardXP(25, '30-Second Stroop Inhibitory Focus Test', 'reflex');
  };

  const handleColorSelect = (selectedId: string) => {
    if (gameState !== 'running') return;
    const latency = Date.now() - trialStartTime;
    const isCorrect = selectedId === currentColor.id;
    const isCongruent = currentWord === currentColor.label;

    setTotalAttempts(t => t + 1);
    setTrials(prev => [...prev, { isCongruent, latencyMs: latency, correct: isCorrect }]);

    if (isCorrect) {
      sounds.playClick();
      haptics.light();
      setFeedback('correct');
      setScore(s => s + 1);
      setStreak(st => {
        const next = st + 1;
        setMaxStreak(m => Math.max(m, next));
        return next;
      });
    } else {
      sounds.playReflexBeep(false);
      haptics.alert();
      setFeedback('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      setFeedback(null);
    }, 150);

    generateTrial();
  };

  // Metrics calculations
  const correctTrials = trials.filter(t => t.correct);
  const accuracy = totalAttempts > 0 ? Math.round((correctTrials.length / totalAttempts) * 100) : 0;
  const avgLatency = correctTrials.length > 0
    ? Math.round(correctTrials.reduce((a, b) => a + b.latencyMs, 0) / correctTrials.length)
    : 0;

  const incongruentTrials = correctTrials.filter(t => !t.isCongruent);
  const congruentTrials = correctTrials.filter(t => t.isCongruent);

  const avgIncongruent = incongruentTrials.length > 0
    ? Math.round(incongruentTrials.reduce((a, b) => a + b.latencyMs, 0) / incongruentTrials.length)
    : 0;

  const avgCongruent = congruentTrials.length > 0
    ? Math.round(congruentTrials.reduce((a, b) => a + b.latencyMs, 0) / congruentTrials.length)
    : 0;

  // Stroop Interference effect = Incongruent latency minus Congruent latency
  const stroopInterference = Math.max(0, avgIncongruent - avgCongruent);

  const getRank = () => {
    if (score >= 35 && accuracy >= 92) return { rank: 'SSS-Rank', title: 'Sovereign Prefrontal Focus', color: 'text-amber-400' };
    if (score >= 28 && accuracy >= 88) return { rank: 'S-Rank', title: 'Diamond Distraction Filter', color: 'text-purple-400' };
    if (score >= 22 && accuracy >= 82) return { rank: 'A-Rank', title: 'Elite Executive Control', color: 'text-cyan-400' };
    if (score >= 16) return { rank: 'B-Rank', title: 'Adept Cognitive Agility', color: 'text-emerald-400' };
    return { rank: 'C-Rank', title: 'Standard Human Reflex', color: 'text-slate-400' };
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Target className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
              Neuroscience Executive Test
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Inhibitory Control
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            Stroop Focus & Inhibitory Control
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Tap the <strong>FONT INK COLOR</strong>, not what the word says! Measures your prefrontal cortex&apos;s ability to suppress automatic reading impulses and resist distraction.
          </p>
        </div>

        {/* Top Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Record</span>
            <span className="text-base font-black text-cyan-400 font-mono">
              {bestScore} pts
            </span>
          </div>

          <button
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Scientific Context"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info Collapsible */}
      {isInfoOpen && (
        <div className="p-5 rounded-3xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 text-xs text-cyan-200/90 animate-in fade-in duration-200">
          <h4 className="font-black text-cyan-300 flex items-center gap-1.5 text-sm">
            <Brain className="w-4 h-4 text-cyan-400" /> The Stroop Effect & Executive Function
          </h4>
          <p className="leading-relaxed">
            Discovered by John Ridley Stroop in 1935, this benchmark tests selective attention and processing speed. When reading the word &quot;RED&quot; displayed in blue ink, your brain automatically attempts to read the word first.
          </p>
          <p className="leading-relaxed text-[11px] text-cyan-300/80">
            Overriding this impulse requires active inhibitory control in the anterior cingulate cortex and dorsolateral prefrontal cortex. High accuracy and low Stroop interference correlate directly with deep work focus and resilience against digital distractions.
          </p>
        </div>
      )}

      {/* Game Card */}
      <div className="p-5 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center max-w-xl mx-auto">
        {/* Top HUD */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-black text-white">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{secondsLeft}s</span>
            </div>

            {/* Streak */}
            {streak > 1 && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-950/60 border border-orange-500/30 text-xs font-black text-orange-400 animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-orange-500" />
                <span>{streak}x Streak</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Score:</span>
            <span className="text-base font-black font-mono text-cyan-400">{score}</span>
          </div>
        </div>

        {/* Word Display Box */}
        <div className="relative py-12 px-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[180px] select-none transition-all">
          {gameState === 'running' ? (
            <>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                TAP INK COLOR:
              </span>
              <span
                className="text-5xl sm:text-6xl font-black tracking-wider transition-all duration-75 select-none"
                style={{ color: currentColor.cssColor }}
              >
                {currentWord}
              </span>
            </>
          ) : gameState === 'idle' ? (
            <div className="space-y-3">
              <span className="text-4xl font-black tracking-wider text-cyan-400 block">
                STROOP TEST
              </span>
              <p className="text-xs text-slate-400 max-w-xs">
                30 seconds rapid-fire. Choose the button matching the <strong>color</strong> of the text.
              </p>
              <button
                onClick={handleStartGame}
                className="py-3 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 active:scale-95 transition-all"
              >
                Start 30s Challenge
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-xs font-black uppercase text-slate-400 block">Time Up!</span>
              <div className="text-4xl font-black text-white">{score} Points</div>
              <div className={`text-sm font-black ${getRank().color}`}>
                [{getRank().rank}] {getRank().title}
              </div>
            </div>
          )}

          {/* Feedback Splash */}
          {feedback === 'correct' && (
            <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/50 pointer-events-none animate-in fade-in duration-75" />
          )}
          {feedback === 'wrong' && (
            <div className="absolute inset-0 rounded-3xl bg-red-500/15 border-2 border-red-500/50 pointer-events-none animate-in fade-in duration-75" />
          )}
        </div>

        {/* 5 Color Buttons */}
        {gameState === 'running' && (
          <div className="grid grid-cols-5 gap-2 pt-2">
            {COLOR_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleColorSelect(opt.id)}
                className={`py-3.5 px-2 rounded-2xl border-2 ${opt.borderClass} ${opt.bgClass} flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer shadow-md`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: opt.cssColor }}
                />
                <span className="text-[11px] font-black font-mono text-white tracking-wider">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Post Game Stats */}
        {gameState === 'completed' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">Accuracy</span>
                <span className="text-sm font-mono font-black text-white">{accuracy}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">Avg Reaction</span>
                <span className="text-sm font-mono font-black text-cyan-400">{avgLatency} ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">Interference Delay</span>
                <span className="text-sm font-mono font-black text-amber-400">+{stroopInterference} ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">Max Streak</span>
                <span className="text-sm font-mono font-black text-emerald-400">{maxStreak}x</span>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
