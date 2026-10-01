import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Activity,
  Info,
  Target,
  Clock,
  Zap,
  Grid,
  Shuffle,
  Trophy,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../../services/soundEffects';
import { useDragScroll } from '../../../hooks/useDragScroll';

interface EyeCareTrainerProps {
  onAwardXP: (amount: number, description: string, stat: 'awareness' | 'recovery' | 'reflex') => void;
}

// Fisher-Yates shuffle algorithm to generate a brand new randomized pattern every round
function generateSchulteGrid(size: number): number[] {
  const total = size * size;
  const arr = Array.from({ length: total }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const EyeCareTrainer: React.FC<EyeCareTrainerProps> = ({ onAwardXP }) => {
  const [subTab, setSubTab] = useState<'schulte' | 'saccades' | 'nearfar' | 'break20' | 'palming' | 'science'>('schulte');
  const subTabScroll = useDragScroll();

  // ==========================================
  // 0. SCHULTE TABLE: PERIPHERAL VISION & SPEED
  // ==========================================
  const [schulteSize, setSchulteSize] = useState<3 | 4 | 5>(5);
  const [schulteNumbers, setSchulteNumbers] = useState<number[]>(() => generateSchulteGrid(5));
  const [schulteTarget, setSchulteTarget] = useState<number>(1);
  const [schulteIsRunning, setSchulteIsRunning] = useState<boolean>(false);
  const [schulteElapsedMs, setSchulteElapsedMs] = useState<number>(0);
  const [schulteCompleted, setSchulteCompleted] = useState<boolean>(false);
  const [schulteChaosMode, setSchulteChaosMode] = useState<boolean>(false);
  const [schulteErrorNum, setSchulteErrorNum] = useState<number | null>(null);
  const [schulteRound, setSchulteRound] = useState<number>(1);
  const [isSchulteInfoOpen, setIsSchulteInfoOpen] = useState<boolean>(false);
  const schulteTimerRef = useRef<any | null>(null);
  const schulteStartRef = useRef<number>(0);

  const [schulteRecords, setSchulteRecords] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('levelup_schulte_records');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const totalSchulteCells = schulteSize * schulteSize;

  const resetSchulte = (newSize?: 3 | 4 | 5, incrementRound: boolean = true) => {
    const size = newSize ?? schulteSize;
    if (schulteTimerRef.current) clearInterval(schulteTimerRef.current);
    setSchulteSize(size);
    setSchulteNumbers(generateSchulteGrid(size));
    setSchulteTarget(1);
    setSchulteIsRunning(false);
    setSchulteElapsedMs(0);
    setSchulteCompleted(false);
    setSchulteErrorNum(null);
    if (incrementRound) {
      setSchulteRound(r => r + 1);
    }
  };

  const handleSchulteClick = (num: number) => {
    if (schulteCompleted) return;

    // Start timer on first tap
    if (!schulteIsRunning) {
      schulteStartRef.current = Date.now() - schulteElapsedMs;
      setSchulteIsRunning(true);
      schulteTimerRef.current = setInterval(() => {
        setSchulteElapsedMs(Date.now() - schulteStartRef.current);
      }, 30);
    }

    if (num === schulteTarget) {
      sounds.playClick();
      setSchulteErrorNum(null);

      if (num === totalSchulteCells) {
        // Complete the table!
        if (schulteTimerRef.current) clearInterval(schulteTimerRef.current);
        const finalMs = Date.now() - schulteStartRef.current;
        setSchulteElapsedMs(finalMs);
        setSchulteIsRunning(false);
        setSchulteCompleted(true);
        sounds.playQuestComplete();
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });

        // Save PR
        const prev = schulteRecords[schulteSize];
        if (!prev || finalMs < prev) {
          const updated = { ...schulteRecords, [schulteSize]: finalMs };
          setSchulteRecords(updated);
          localStorage.setItem('levelup_schulte_records', JSON.stringify(updated));
        }

        const sec = (finalMs / 1000).toFixed(2);
        onAwardXP(25, `Schulte Table ${schulteSize}x${schulteSize} completed in ${sec}s`, 'awareness');
      } else {
        const next = schulteTarget + 1;
        setSchulteTarget(next);

        // Optional Chaos Shuffle Mode: shuffles remaining unclicked numbers!
        if (schulteChaosMode) {
          setSchulteNumbers(prev => {
            const unclicked = prev.filter(n => n >= next);
            for (let i = unclicked.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [unclicked[i], unclicked[j]] = [unclicked[j], unclicked[i]];
            }
            let idx = 0;
            return prev.map(n => (n < next ? n : unclicked[idx++]));
          });
        }
      }
    } else if (num > schulteTarget) {
      sounds.playReflexBeep(false);
      setSchulteErrorNum(num);
      setTimeout(() => setSchulteErrorNum(null), 350);
    }
  };

  useEffect(() => {
    return () => {
      if (schulteTimerRef.current) clearInterval(schulteTimerRef.current);
    };
  }, []);

  // ==========================================
  // 1. SACCADIC DYNAMIC VISION TRACKER (BADMINTON & COMBAT)
  // ==========================================
  const [isSaccadeRunning, setIsSaccadeRunning] = useState(false);
  const [saccadeTimeLeft, setSaccadeTimeLeft] = useState(45); // 45 seconds
  const [saccadeSpeed, setSaccadeSpeed] = useState<'rally' | 'smash'>('rally'); // rally: 1.0s, smash: 0.55s
  // 9 grid positions: 0 to 8 (3x3 grid)
  const [targetPos, setTargetPos] = useState<number>(4); // center default
  const saccadeIntervalRef = useRef<any | null>(null);

  useEffect(() => {
    if (!isSaccadeRunning) return;

    const delay = saccadeSpeed === 'rally' ? 1000 : 550;
    saccadeIntervalRef.current = setInterval(() => {
      setTargetPos(prev => {
        let next;
        do {
          next = Math.floor(Math.random() * 9);
        } while (next === prev);
        sounds.playTick();
        return next;
      });
    }, delay);

    const countdownTimer = setInterval(() => {
      setSaccadeTimeLeft(t => {
        if (t <= 1) {
          clearInterval(countdownTimer);
          if (saccadeIntervalRef.current) clearInterval(saccadeIntervalRef.current);
          setIsSaccadeRunning(false);
          sounds.playLevelUp();
          const bonusXP = saccadeSpeed === 'smash' ? 25 : 20;
          onAwardXP(bonusXP, `Dynamic Visual Acuity Drill (${saccadeSpeed.toUpperCase()} Pace)`, 'awareness');
          return 45;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
      if (saccadeIntervalRef.current) clearInterval(saccadeIntervalRef.current);
    };
  }, [isSaccadeRunning, saccadeSpeed, onAwardXP]);

  const toggleSaccade = () => {
    sounds.playClick();
    if (!isSaccadeRunning) {
      setIsSaccadeRunning(true);
    } else {
      setIsSaccadeRunning(false);
      if (saccadeIntervalRef.current) clearInterval(saccadeIntervalRef.current);
    }
  };

  const resetSaccade = () => {
    sounds.playClick();
    setIsSaccadeRunning(false);
    if (saccadeIntervalRef.current) clearInterval(saccadeIntervalRef.current);
    setSaccadeTimeLeft(45);
    setTargetPos(4);
  };

  // ==========================================
  // 2. NEAR-FAR ACCOMMODATION TRAINER (CILIARY RELAXER)
  // ==========================================
  const [isNearFarRunning, setIsNearFarRunning] = useState(false);
  const [nearFarPhase, setNearFarPhase] = useState<'near' | 'far'>('near');
  const [nearFarPhaseSeconds, setNearFarPhaseSeconds] = useState(5);
  const [nearFarRound, setNearFarRound] = useState(1);
  const totalNearFarRounds = 8;

  useEffect(() => {
    let timer: any | null = null;
    if (isNearFarRunning) {
      timer = setInterval(() => {
        setNearFarPhaseSeconds(sec => {
          if (sec > 1) return sec - 1;

          // Switch phase
          sounds.playCueBeep(nearFarPhase === 'near' ? 660 : 880);
          if (nearFarPhase === 'near') {
            setNearFarPhase('far');
            return 5;
          } else {
            // End of round
            if (nearFarRound >= totalNearFarRounds) {
              setIsNearFarRunning(false);
              sounds.playQuestComplete();
              onAwardXP(20, 'Accommodative Near-Far Ciliary Muscle Cycle', 'recovery');
              setNearFarRound(1);
              setNearFarPhase('near');
              return 5;
            } else {
              setNearFarRound(r => r + 1);
              setNearFarPhase('near');
              return 5;
            }
          }
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isNearFarRunning, nearFarPhase, nearFarRound, onAwardXP]);

  const toggleNearFar = () => {
    sounds.playClick();
    setIsNearFarRunning(!isNearFarRunning);
  };

  const resetNearFar = () => {
    sounds.playClick();
    setIsNearFarRunning(false);
    setNearFarPhase('near');
    setNearFarPhaseSeconds(5);
    setNearFarRound(1);
  };

  // ==========================================
  // 3. 20-20-20 SCREEN REST
  // ==========================================
  const [eyeSeconds, setEyeSeconds] = useState(20);
  const [isEyeActive, setIsEyeActive] = useState(false);

  useEffect(() => {
    if (!isEyeActive) return;
    const timer = setInterval(() => {
      setEyeSeconds(s => {
        if (s <= 1) {
          clearInterval(timer);
          setIsEyeActive(false);
          sounds.playTimerDone();
          onAwardXP(10, '20-20-20 Screen Rest Break', 'recovery');
          return 20;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isEyeActive, onAwardXP]);

  // ==========================================
  // 4. PALMING REST
  // ==========================================
  const [palmingSeconds, setPalmingSeconds] = useState(60);
  const [isPalmingActive, setIsPalmingActive] = useState(false);

  useEffect(() => {
    if (!isPalmingActive) return;
    const timer = setInterval(() => {
      setPalmingSeconds(s => {
        if (s <= 1) {
          clearInterval(timer);
          setIsPalmingActive(false);
          sounds.playTimerDone();
          onAwardXP(15, '60-second Deep Palming Warmth Rest', 'recovery');
          return 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPalmingActive, onAwardXP]);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Sub-navigation (Wraps cleanly on desktop, swipeable/draggable on mobile) */}
      <div 
        ref={subTabScroll.ref}
        {...subTabScroll.dragProps}
        className="flex md:flex-wrap items-center gap-1.5 overflow-x-auto md:overflow-visible p-1.5 rounded-2xl bg-slate-950 border border-slate-800 scrollbar-none cursor-grab active:cursor-grabbing select-none"
      >
        {[
          { id: 'schulte', label: '🔢 Schulte Table (Peripheral Speed)', icon: Grid },
          { id: 'saccades', label: '🏸 Dynamic Vision (Badminton/Combat)', icon: Zap },
          { id: 'nearfar', label: '🎯 Near-Far Focus Cycle', icon: Target },
          { id: 'break20', label: '⏱️ 20-20-20 Screen Break', icon: Clock },
          { id: 'palming', label: '🤲 Deep Palming (Relax)', icon: Activity },
          { id: 'science', label: '📖 Spectacles & Eyesight Truth', icon: Info }
        ].map(item => {
          const isSel = subTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (subTabScroll.hasMoved.current) return;
                sounds.playClick();
                setSubTab(item.id as typeof subTab);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                isSel
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 0. SCHULTE TABLE: PERIPHERAL VISION & SPEED */}
      {subTab === 'schulte' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  <Grid className="w-4 h-4" />
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">Schulte Table: Peripheral Vision & Speed</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
                  Round #{schulteRound}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                Fix your gaze on the <strong>center dot</strong>. Locate numbers sequentially from <strong>1 to {totalSchulteCells}</strong> using only your <strong>peripheral vision</strong>.
              </p>
            </div>

            {/* Quick Action: New Shuffled Grid */}
            <button
              onClick={() => {
                sounds.playClick();
                resetSchulte();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all self-start sm:self-auto active:scale-95"
              title="Generate a brand new random permutation"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle New Pattern</span>
            </button>
          </div>

          {/* SCIENTIFIC EXPLANATION BANNER (Collapsible for Mobile Ergonomics) */}
          <div className="rounded-xl bg-cyan-950/30 border border-cyan-500/30 overflow-hidden text-xs text-slate-300">
            <button
              onClick={() => setIsSchulteInfoOpen(!isSchulteInfoOpen)}
              className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-cyan-900/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span className="text-[11px] sm:text-xs">Why does the number pattern change every time?</span>
              </div>
              <span className="text-[10px] text-cyan-400 flex items-center gap-1 shrink-0 font-bold">
                {isSchulteInfoOpen ? 'Collapse' : 'Explain'}
                {isSchulteInfoOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>
            {isSchulteInfoOpen && (
              <div className="p-3 pt-0 border-t border-cyan-500/20 text-slate-300 text-[11px] leading-relaxed animate-in fade-in duration-150">
                By Walter Schulte's scientific protocol, <strong>the numbers MUST randomize on every round</strong>. If the numbers stayed in fixed spots, your brain would use muscle memory rather than your visual field. A new randomized pattern every game forces your eyes to expand their peripheral field of view, eliminates subconscious eye-head turning, and speeds up mental processing!
              </div>
            )}
          </div>

          {/* Controls Bar: Size Selector & Chaos Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
            {/* Grid Size Selection */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Grid Size:</span>
              {[
                { size: 3, label: '3×3 (1-9)' },
                { size: 4, label: '4×4 (1-16)' },
                { size: 5, label: '5×5 (1-25 Standard)' }
              ].map(opt => (
                <button
                  key={opt.size}
                  onClick={() => {
                    sounds.playClick();
                    resetSchulte(opt.size as 3 | 4 | 5);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    schulteSize === opt.size
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Chaos Shuffle Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setSchulteChaosMode(!schulteChaosMode);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  schulteChaosMode
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                }`}
                title="When ON: remaining numbers re-shuffle dynamically after every correct click!"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Chaos Shuffle: {schulteChaosMode ? 'ON (After Each Tap)' : 'OFF (Classic Round)'}</span>
              </button>
            </div>
          </div>

          {/* HUD Status Bar: Next Target & Millisecond Stopwatch */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Next Target */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Next Number</span>
                <span className="text-xl font-black font-mono text-cyan-400">
                  {schulteCompleted ? 'DONE!' : schulteTarget}
                </span>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-semibold">
                of {totalSchulteCells}
              </div>
            </div>

            {/* Stopwatch */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Time</span>
                <span className="text-xl font-black font-mono text-white">
                  {(schulteElapsedMs / 1000).toFixed(2)}s
                </span>
              </div>
              <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>

            {/* Best Record */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Best PR ({schulteSize}×{schulteSize})</span>
                <span className="text-xl font-black font-mono text-amber-300">
                  {schulteRecords[schulteSize] ? `${(schulteRecords[schulteSize] / 1000).toFixed(2)}s` : '--'}
                </span>
              </div>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>

            {/* Reset / Restart */}
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
              <button
                onClick={() => {
                  sounds.playClick();
                  resetSchulte(schulteSize, true);
                }}
                className="w-full h-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Round</span>
              </button>
            </div>
          </div>

          {/* THE SCHULTE INTERACTIVE GRID */}
          <div className="relative p-4 sm:p-6 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[340px]">
            {/* Central Peripheral Focal Dot */}
            <div
              className="absolute z-20 w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/80 pointer-events-none animate-pulse"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              title="Keep your gaze fixed here and use peripheral vision!"
            />

            <div
              className={`grid gap-2 sm:gap-3 w-full max-w-md aspect-square ${
                schulteSize === 3
                  ? 'grid-cols-3'
                  : schulteSize === 4
                  ? 'grid-cols-4'
                  : 'grid-cols-5'
              }`}
            >
              {schulteNumbers.map(num => {
                const isFound = num < schulteTarget;
                const isError = schulteErrorNum === num;

                return (
                  <button
                    key={`${num}_${schulteRound}`}
                    onClick={() => handleSchulteClick(num)}
                    disabled={isFound}
                    className={`relative rounded-xl font-mono font-extrabold text-lg sm:text-2xl flex items-center justify-center transition-all select-none aspect-square ${
                      isFound
                        ? 'bg-emerald-950/40 text-emerald-500/50 border border-emerald-500/20 cursor-default'
                        : isError
                        ? 'bg-rose-950 text-rose-300 border-2 border-rose-500 animate-shake scale-95'
                        : 'bg-slate-900 hover:bg-slate-800 active:scale-95 text-white border border-slate-800 hover:border-cyan-500/50 cursor-pointer shadow-sm'
                    }`}
                  >
                    {isFound ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500/60" />
                    ) : (
                      num
                    )}
                  </button>
                );
              })}
            </div>

            {/* Completion Screen Banner */}
            {schulteCompleted && (
              <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 p-0.5 shadow-xl shadow-amber-500/20">
                  <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-amber-400" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    Schulte Grid Cleared!
                  </span>
                  <h4 className="text-2xl font-black text-white mt-1">
                    {(schulteElapsedMs / 1000).toFixed(2)} Seconds
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {schulteElapsedMs < 22000
                      ? '🏆 Olympian Peripheral Speed (< 22s)'
                      : schulteElapsedMs < 32000
                      ? '⚡ Elite Focus & Scanning (< 32s)'
                      : schulteElapsedMs < 45000
                      ? '🎯 Great Speed & Vision (< 45s)'
                      : '🌱 Good training run! Repeat to expand vision field.'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      resetSchulte(schulteSize, true);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 active:scale-95"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>Play Next Shuffled Round</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. SACCADIC DYNAMIC VISION TRACKER */}
      {subTab === 'saccades' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  <Zap className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-white">Dynamic Vision & Saccadic Eye Trainer</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Trains Dynamic Visual Acuity (DVA). Keeps head completely stationary while eyes rapidly lock onto fast targets (shuttlecocks, incoming punches/kicks).
              </p>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSaccadeSpeed('rally');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  saccadeSpeed === 'rally'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏸 Rally Pace (1.0s)
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSaccadeSpeed('smash');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  saccadeSpeed === 'smash'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Smash / Combat (0.55s)
              </button>
            </div>
          </div>

          {/* Interactive Visual Arena (3x3 Grid) */}
          <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-950 rounded-2xl border-2 border-slate-800 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Background Court / Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
              <div className="border-r border-b border-cyan-500/40" />
              <div className="border-r border-b border-cyan-500/40" />
              <div className="border-b border-cyan-500/40" />
              <div className="border-r border-b border-cyan-500/40" />
              <div className="border-r border-b border-cyan-500/40" />
              <div className="border-b border-cyan-500/40" />
              <div className="border-r border-cyan-500/40" />
              <div className="border-r border-cyan-500/40" />
              <div />
            </div>

            {/* Target Display Grid */}
            <div className="relative z-10 w-full h-full grid grid-cols-3 grid-rows-3 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => {
                const isActive = targetPos === index && isSaccadeRunning;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-center relative rounded-xl"
                  >
                    {isActive ? (
                      <div className="relative flex items-center justify-center animate-in zoom-in-75 duration-100">
                        {/* Outer Glow Ring */}
                        <div className="absolute w-16 h-16 rounded-full bg-cyan-400/20 animate-ping" />
                        <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-amber-300 flex items-center justify-center shadow-lg shadow-cyan-500/50 border-2 border-white">
                          <span className="text-xl select-none">🏸</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-800/60" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* In-Arena Timer & Overlay if not running */}
            {!isSaccadeRunning && (
              <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-2 text-cyan-400">
                  <Eye className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">Dynamic Visual Tracking Ready</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Keep your head firmly fixed forward. Move <strong>ONLY your eyeballs</strong> to lock onto the shuttlecock as it flashes across the court.
                </p>
                <button
                  onClick={toggleSaccade}
                  className="mt-4 px-6 py-2.5 rounded-xl font-black text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" /> START 45s EYE DRILL
                </button>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Drill Duration:</span>
              <span className="font-mono text-base font-black text-cyan-400">{saccadeTimeLeft}s</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSaccade}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isSaccadeRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                {isSaccadeRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
                {isSaccadeRunning ? 'PAUSE' : 'RESUME'}
              </button>
              <button
                onClick={resetSaccade}
                className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 hover:text-white"
                title="Reset drill"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Badminton & Combat Application:
            </p>
            <p className="text-slate-400">
              When returning high-speed smashes (over 250 km/h) or slipping punches, you have less than 0.15 seconds to identify trajectory. Saccadic training strengthens the 6 extraocular eye muscles and sharpens peripheral reaction.
            </p>
          </div>
        </div>
      )}

      {/* 2. NEAR-FAR ACCOMMODATION (CILIARY MUSCLE EXERCISE) */}
      {subTab === 'nearfar' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                <Target className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black text-white">Accommodative Near-Far Focus Cycle</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Directly combats "Accommodative Spasm / Pseudo-Myopia" caused by reading books and screens for hours. Relaxes and flexes the internal ciliary lens muscles.
            </p>
          </div>

          {/* Dynamic Visual Pacing Card */}
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Round {nearFarRound} of {totalNearFarRounds}</span>
            </div>

            {/* Target Representation */}
            <div className="py-6 flex flex-col items-center justify-center min-h-[160px]">
              {nearFarPhase === 'near' ? (
                <div className="space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
                    👍
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-amber-300 uppercase tracking-wider">
                      FOCUS NEAR: YOUR THUMB
                    </h4>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
                      Hold thumb 15 cm (6 inches) from nose. Focus sharply on the tiny lines of your fingerprint.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
                    🏔️
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-cyan-300 uppercase tracking-wider">
                      FOCUS FAR: DISTANT HORIZON
                    </h4>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
                      Look beyond your thumb at a wall, tree, or building across the room or outside window (&gt;6 meters / 20 ft).
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Giant Countdown */}
            <div className="text-5xl font-mono font-black text-white">
              {nearFarPhaseSeconds}s
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={toggleNearFar}
                className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-all ${
                  isNearFarRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {isNearFarRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                {isNearFarRunning ? 'PAUSE CYCLE' : 'START 8-ROUND CYCLE'}
              </button>
              <button
                onClick={resetNearFar}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. 20-20-20 SCREEN REST */}
      {subTab === 'break20' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-xl mx-auto text-center space-y-4">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 font-bold border border-cyan-500/30 uppercase tracking-wider">
            STUDY BREAK PROTOCOL
          </span>
          <h3 className="text-2xl font-black text-white">The 20-20-20 Rule</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            Every 20 minutes of study or screen time, look at an object at least 20 feet (6 meters) away for 20 seconds. This stops your eye lens from locking up.
          </p>

          <div className="text-6xl font-black font-mono text-cyan-400 tracking-wider my-4">
            {eyeSeconds}s
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setIsEyeActive(true);
            }}
            disabled={isEyeActive}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 shadow-md flex items-center gap-2 mx-auto"
          >
            <Eye className="w-4 h-4" /> START 20-SECOND REST
          </button>
        </div>
      )}

      {/* 4. DEEP PALMING REST */}
      {subTab === 'palming' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-xl mx-auto text-center space-y-5">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 font-bold border border-amber-500/30 uppercase tracking-wider">
            RETINA & OPTIC NERVE RELAXATION
          </span>
          <h3 className="text-2xl font-black text-white">Deep Warm Palming Drill</h3>
          <div className="text-xs text-slate-300 text-left bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <p className="font-bold text-white">Instructions:</p>
            <ol className="list-decimal pl-4 space-y-1 text-slate-400">
              <li>Rub your palms together vigorously for 10 seconds until warm from friction.</li>
              <li>Cup your palms gently over your closed eyes without pressing directly on your eyeballs.</li>
              <li>Ensure 100% of room light is blocked out into total blackness.</li>
              <li>Take slow, deep nasal breaths (4s in, 6s out). Let your optic nerves and ciliary muscles reset.</li>
            </ol>
          </div>

          <div className="text-6xl font-black font-mono text-amber-400 tracking-wider my-2">
            {palmingSeconds}s
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setIsPalmingActive(!isPalmingActive);
            }}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-2 mx-auto"
          >
            <Activity className="w-4 h-4" />
            {isPalmingActive ? 'PAUSE PALMING' : 'START 60s PALMING REST'}
          </button>
        </div>
      )}

      {/* 5. THE TRUTH ABOUT SPECTACLES & EYESIGHT */}
      {subTab === 'science' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <span className="p-1 rounded-md bg-blue-950 text-blue-400 border border-blue-500/30">
              <Info className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-black text-white">Spectacles, Eyesight, & Sports Vision: The Honest Science</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Myth vs Reality */}
            <div className="p-4 rounded-xl bg-slate-950 border border-red-500/20 space-y-2">
              <h4 className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                ❌ What Eye Exercises CANNOT Do
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Eye exercises <strong>cannot cure or reverse true refractive myopia or astigmatism</strong> (e.g. shrinking an elongated eyeball or flattening your cornea). Anyone claiming you can discard -3.0D glasses in 30 days using exercises alone is promoting pseudoscience.
              </p>
            </div>

            {/* What Exercises DO Do */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 space-y-2">
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                ✅ What Exercises CAN Accomplish
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Exercises release <strong>Accommodative Spasm ("Pseudo-Myopia")</strong>, prevent spectacle numbers from worsening during heavy study months, reduce severe eye strain and headaches, and dramatically boost <strong>Dynamic Visual Acuity (DVA)</strong> for sports.
              </p>
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <h4 className="font-bold text-white text-sm">Why Do Eyes Feel Blurry During Exams?</h4>
            <p className="leading-relaxed text-slate-400">
              When you read books or stare at computer screens for 8-12 hours per day, your <strong>ciliary muscles</strong> remain locked in a continuous state of contraction to keep near text in focus. When you finally look up across the room, the muscle is in a cramp/spasm and fails to relax. This causes distance blur, making you feel your vision has worsened.
            </p>
            <p className="leading-relaxed text-slate-400">
              Performing the <strong>Near-Far Accommodation Cycles</strong> and <strong>Palming</strong> un-clamps this muscle spasm, restoring your baseline clarity.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
              🏸 The Badminton & Combat Advantage
            </h4>
            <p className="leading-relaxed text-slate-300">
              In badminton and martial arts, great players do not necessarily have better static 20/20 vision than others—they have superior <strong>Dynamic Visual Tracking</strong>, <strong>Depth Perception</strong>, and <strong>Peripheral Motion Detection</strong>. Doing daily saccades drills trains your visual cortex to process fast-moving objects (shuttlecocks and strikes) with minimal lag.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
