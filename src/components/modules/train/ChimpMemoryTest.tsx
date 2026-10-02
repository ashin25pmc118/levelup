import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  RotateCcw,
  Sparkles,
  Trophy,
  AlertTriangle,
  Heart,
  HeartCrack,
  Clock,
  Zap,
  Info,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../../services/soundEffects';
import { haptics } from '../../../services/hapticFeedback';

interface ChimpMemoryTestProps {
  onAwardXP: (amount: number, description: string, stat: 'awareness' | 'reflex' | 'recovery') => void;
}

const GRID_ROWS = 5;
const GRID_COLS = 8;
const TOTAL_CELLS = GRID_ROWS * GRID_COLS; // 40 cells

interface CellData {
  number: number | null; // 1..N or null if empty
  status: 'hidden' | 'visible' | 'masked' | 'correct' | 'wrong';
}

export const ChimpMemoryTest: React.FC<ChimpMemoryTestProps> = ({ onAwardXP }) => {
  const [level, setLevel] = useState<number>(4); // Starts at 4 numbers, up to 9
  const [strikesLeft, setStrikesLeft] = useState<number>(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'round_success' | 'strike' | 'game_over' | 'victory'>('idle');
  const [nextExpected, setNextExpected] = useState<number>(1);
  const [grid, setGrid] = useState<CellData[]>([]);
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [roundLatencies, setRoundLatencies] = useState<number[]>([]);
  const [bestLevel, setBestLevel] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('levelup_chimp_best') || 4);
    } catch {
      return 4;
    }
  });
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  // Generate randomized positions for 1..N
  const generateLevelGrid = (numTiles: number): CellData[] => {
    const cells: CellData[] = Array.from({ length: TOTAL_CELLS }, () => ({
      number: null,
      status: 'hidden'
    }));

    // Random unique cell indices
    const indices: number[] = [];
    while (indices.length < numTiles) {
      const randIdx = Math.floor(Math.random() * TOTAL_CELLS);
      if (!indices.includes(randIdx)) {
        indices.push(randIdx);
      }
    }

    indices.forEach((cellIdx, i) => {
      cells[cellIdx] = {
        number: i + 1,
        status: 'visible'
      };
    });

    return cells;
  };

  const startNewGame = () => {
    sounds.playClick();
    setLevel(4);
    setStrikesLeft(3);
    setRoundLatencies([]);
    setNextExpected(1);
    setIsMasked(false);
    setGrid(generateLevelGrid(4));
    setGameState('playing');
    setRoundStartTime(Date.now());
  };

  const advanceLevel = (nextLvl: number) => {
    if (nextLvl > 9) {
      // Victory! SSS Rank
      triggerVictory();
      return;
    }
    setLevel(nextLvl);
    setNextExpected(1);
    setIsMasked(false);
    setGrid(generateLevelGrid(nextLvl));
    setGameState('playing');
    setRoundStartTime(Date.now());
  };

  const triggerVictory = () => {
    setGameState('victory');
    sounds.playLevelUp();
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch {}
    onAwardXP(35, 'Ayumu Level: Conquered 9-Tile Chimp Memory Benchmark', 'awareness');
    saveBestScore(9);
  };

  const saveBestScore = (lvl: number) => {
    if (lvl > bestLevel) {
      setBestLevel(lvl);
      try {
        localStorage.setItem('levelup_chimp_best', String(lvl));
      } catch {}
    }
  };

  const handleCellClick = (index: number) => {
    if (gameState !== 'playing') return;
    const cell = grid[index];
    if (!cell || cell.number === null || cell.status === 'correct') return;

    // First click: clicking '1' starts masking
    if (nextExpected === 1) {
      if (cell.number === 1) {
        // Correct 1
        sounds.playClick();
        haptics.light();
        const latency = Date.now() - roundStartTime;
        setRoundLatencies(prev => [...prev, latency]);

        // Mask all remaining tiles immediately!
        setIsMasked(true);
        const updated = grid.map((c, i) => {
          if (i === index) {
            return { ...c, status: 'correct' as const };
          }
          if (c.number !== null) {
            return { ...c, status: 'masked' as const };
          }
          return c;
        });
        setGrid(updated);
        setNextExpected(2);
      } else {
        // Wrong first click
        handleStrike(index);
      }
      return;
    }

    // Subsequent clicks when masked
    if (cell.number === nextExpected) {
      // Correct tile clicked!
      sounds.playClick();
      haptics.light();

      const isLastNumber = nextExpected === level;
      const updated = grid.map((c, i) => (i === index ? { ...c, status: 'correct' as const } : c));
      setGrid(updated);

      if (isLastNumber) {
        // Round Success!
        sounds.playQuestComplete();
        haptics.success();
        saveBestScore(level);
        setGameState('round_success');

        setTimeout(() => {
          advanceLevel(level + 1);
        }, 800);
      } else {
        setNextExpected(prev => prev + 1);
      }
    } else {
      // Incorrect tile tapped!
      handleStrike(index);
    }
  };

  const handleStrike = (wrongIndex: number) => {
    sounds.playReflexBeep(false);
    haptics.alert();
    const remainingStrikes = strikesLeft - 1;
    setStrikesLeft(remainingStrikes);

    // Reveal actual numbers and mark wrong
    const revealed = grid.map((c, i) => {
      if (i === wrongIndex) return { ...c, status: 'wrong' as const };
      if (c.number !== null) return { ...c, status: 'visible' as const };
      return c;
    });
    setGrid(revealed);

    if (remainingStrikes <= 0) {
      setGameState('game_over');
      sounds.playTimerDone();
      saveBestScore(level);
      onAwardXP(20, `Completed Chimpanzee Memory Benchmark (Level ${level})`, 'awareness');
    } else {
      setGameState('strike');
      setTimeout(() => {
        // Retry the current level
        setNextExpected(1);
        setIsMasked(false);
        setGrid(generateLevelGrid(level));
        setGameState('playing');
        setRoundStartTime(Date.now());
      }, 1400);
    }
  };

  const getRank = (lvl: number) => {
    if (lvl >= 9) return { rank: 'SSS-Rank', title: 'Sovereign Chimpanzee (Ayumu Class)', color: 'text-amber-400' };
    if (lvl >= 8) return { rank: 'S-Rank', title: 'Primate Agility Master', color: 'text-purple-400' };
    if (lvl >= 7) return { rank: 'A-Rank', title: 'Elite Working Memory', color: 'text-cyan-400' };
    if (lvl >= 6) return { rank: 'B-Rank', title: 'Adept Spatial Retention', color: 'text-emerald-400' };
    if (lvl >= 5) return { rank: 'C-Rank', title: 'Human Average Cognition', color: 'text-blue-400' };
    return { rank: 'D-Rank', title: 'Novice Working Memory', color: 'text-slate-400' };
  };

  const avgLatency = roundLatencies.length > 0
    ? Math.round(roundLatencies.reduce((a, b) => a + b, 0) / roundLatencies.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Brain className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Cambridge & Kyoto Benchmark
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Spatial Working Memory
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            Chimpanzee Working Memory Benchmark
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Based on the famous Matsuzawa Ayumu test. Test your eidetic memory against primate speed. Numbers vanish into white squares the moment you press 1!
          </p>
        </div>

        {/* Top Actions & Score Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Record</span>
            <span className="text-base font-black text-amber-400 font-mono">
              {bestLevel} Tiles
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

      {/* Scientific Context Dropdown */}
      {isInfoOpen && (
        <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs text-amber-200/90 animate-in fade-in duration-200">
          <h4 className="font-black text-amber-300 flex items-center gap-1.5 text-sm">
            <Award className="w-4 h-4 text-amber-400" /> The Primate Working Memory Paradox
          </h4>
          <p className="leading-relaxed">
            In 2007, researchers at Kyoto University discovered that young chimpanzees (like Ayumu) can memorize the positions of 9 numbers shown on screen for just <strong>210 milliseconds</strong> and recall them in exact sequence faster and more accurately than adult human college students.
          </p>
          <p className="leading-relaxed text-[11px] text-amber-300/80">
            This demonstrates eidetic spatial memory retention before human cognitive trade-offs prioritized complex language over raw sensory recall. Training this improves your visual chunking, active recall, and working memory buffer.
          </p>
        </div>
      )}

      {/* Main Game Interface */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
        {/* HUD Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
          {/* Level / Tiles Counter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white">
              <span className="text-slate-400">Level:</span>
              <span className="text-cyan-400 font-black">{level} Tiles</span>
            </div>

            {/* Lives / Strikes */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i}>
                  {i < strikesLeft ? (
                    <Heart className="w-4 h-4 fill-red-500 text-red-500 animate-pulse" />
                  ) : (
                    <HeartCrack className="w-4 h-4 text-slate-700" />
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Status Message */}
          <div className="text-xs font-bold">
            {gameState === 'idle' && (
              <span className="text-slate-400">Click &quot;Start Benchmark&quot; below</span>
            )}
            {gameState === 'playing' && !isMasked && (
              <span className="text-amber-300 animate-pulse">Memorize numbers, then tap 1!</span>
            )}
            {gameState === 'playing' && isMasked && (
              <span className="text-cyan-400">Tap blank tiles in sequence: {nextExpected}</span>
            )}
            {gameState === 'round_success' && (
              <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Perfect Sequence! Level Up...
              </span>
            )}
            {gameState === 'strike' && (
              <span className="text-red-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Strike! Memorize and retry...
              </span>
            )}
            {gameState === 'game_over' && (
              <span className="text-purple-400 font-black">Benchmark Complete!</span>
            )}
            {gameState === 'victory' && (
              <span className="text-amber-400 font-black">SSS-Rank Sovereign Victory!</span>
            )}
          </div>

          {/* Reset / Restart */}
          {gameState !== 'idle' && (
            <button
              onClick={startNewGame}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Restart Test"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 5x8 Interactive Grid */}
        <div className="relative max-w-2xl mx-auto">
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-2xl bg-slate-950 border border-slate-800 aspect-[8/5]">
            {grid.map((cell, idx) => {
              const isTile = cell.number !== null;
              const isCorrect = cell.status === 'correct';
              const isWrong = cell.status === 'wrong';
              const isMask = cell.status === 'masked';
              const isVisible = cell.status === 'visible';

              return (
                <button
                  key={idx}
                  disabled={gameState !== 'playing' || !isTile || isCorrect}
                  onClick={() => handleCellClick(idx)}
                  className={`relative flex items-center justify-center rounded-xl font-mono text-sm sm:text-lg font-black transition-all select-none ${
                    !isTile
                      ? 'bg-slate-900/40 border border-slate-800/40 pointer-events-none'
                      : isCorrect
                      ? 'bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 scale-95 opacity-50'
                      : isWrong
                      ? 'bg-red-500 text-white border-2 border-red-400 animate-shake shadow-lg shadow-red-500/40'
                      : isMask
                      ? 'bg-slate-100 hover:bg-white text-slate-950 border-2 border-slate-300 shadow-md active:scale-95 cursor-pointer'
                      : isVisible
                      ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer'
                      : 'bg-slate-900 border border-slate-800'
                  }`}
                >
                  {isTile && (
                    <>
                      {/* Only show number when visible or wrong */}
                      {(isVisible || isWrong) && <span>{cell.number}</span>}
                      {/* When masked, render blank solid white square */}
                      {isMask && <span className="opacity-0">{cell.number}</span>}
                      {/* When correct, show small check */}
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Idle Start Overlay */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="p-4 rounded-3xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-xl shadow-amber-500/20">
                <Brain className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Ready for the Kyoto Test?</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Numbers 1 to 4 will appear on the grid. As soon as you tap 1, all numbers turn into blank white squares. Remember where they were!
                </p>
              </div>
              <button
                onClick={startNewGame}
                className="py-3 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
              >
                Start Benchmark
              </button>
            </div>
          )}

          {/* Game Over / Results Overlay */}
          {(gameState === 'game_over' || gameState === 'victory') && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white font-black text-xl shadow-xl shadow-purple-500/25">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Benchmark Complete
                </span>
                <h3 className="text-2xl font-black text-white mt-0.5">
                  Level {level} Achieved
                </h3>
                <div className="mt-1">
                  <span className={`text-sm font-black ${getRank(level).color}`}>
                    [{getRank(level).rank}] {getRank(level).title}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-left">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Max Sequence</span>
                  <span className="text-sm font-mono font-black text-white">{level} Numbers</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Avg Latency</span>
                  <span className="text-sm font-mono font-black text-cyan-400">{avgLatency} ms</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={startNewGame}
                  className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  Test Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
