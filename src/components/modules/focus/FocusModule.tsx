import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  Eye,
  Zap,
  Headphones,
  Waves,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { FocusSession } from '../../../types';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';

interface FocusModuleProps {
  onAwardXP: (amount: number, description: string, stat: 'focus' | 'discipline') => void;
}

export const FocusModule: React.FC<FocusModuleProps> = ({ onAwardXP }) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // minutes
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [distractionCount, setDistractionCount] = useState<number>(0);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Ambient sound state
  const [ambientType, setAmbientType] = useState<'off' | 'brown' | 'binaural' | 'rain'>('off');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.25);

  // Fullscreen Zen Mode state
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Ref for accurate background tab timing
  const targetEndTimeRef = useRef<number | null>(null);

  // Re-sync timer on tab visibility change (solves background tab throttling)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isRunning && targetEndTimeRef.current) {
        const remaining = Math.max(0, Math.round((targetEndTimeRef.current - Date.now()) / 1000));
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          handleCompleteSession();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning]);

  useEffect(() => {
    let interval: any | null = null;
    if (isRunning && secondsLeft > 0) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + secondsLeft * 1000;
      }
      interval = setInterval(() => {
        if (targetEndTimeRef.current) {
          const remaining = Math.max(0, Math.round((targetEndTimeRef.current - Date.now()) / 1000));
          setSecondsLeft(remaining);
          if (remaining <= 0) {
            handleCompleteSession();
          }
        }
      }, 500);
    } else if (secondsLeft === 0 && isRunning) {
      handleCompleteSession();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  // Clean up ambient audio on unmount
  useEffect(() => {
    return () => {
      sounds.stopAmbient();
    };
  }, []);

  const handleStartPause = () => {
    sounds.playClick();
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);

    if (nextRunning) {
      targetEndTimeRef.current = Date.now() + secondsLeft * 1000;
      if (ambientType !== 'off') {
        sounds.startAmbient(ambientType, ambientVolume);
      }
    } else {
      targetEndTimeRef.current = null;
      if (ambientType !== 'off') {
        sounds.stopAmbient();
      }
    }
  };

  const handleReset = (mins: number = selectedDuration) => {
    sounds.playClick();
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setSelectedDuration(mins);
    setSecondsLeft(mins * 60);
    setDistractionCount(0);
    sounds.stopAmbient();
  };

  const handleLogDistraction = () => {
    sounds.playClick();
    setDistractionCount(c => c + 1);
  };

  const handleAmbientChange = (type: 'off' | 'brown' | 'binaural' | 'rain') => {
    sounds.playClick();
    setAmbientType(type);
    if (type === 'off') {
      sounds.stopAmbient();
    } else {
      sounds.startAmbient(type, ambientVolume);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    if (ambientType !== 'off') {
      sounds.startAmbient(ambientType, vol);
    }
  };

  const handleCompleteSession = () => {
    sounds.playTimerDone();
    sounds.stopAmbient();
    setIsRunning(false);
    setIsZenMode(false);

    const xp = Math.round(selectedDuration * 1.2);
    const session: FocusSession = {
      id: `foc_${Date.now()}`,
      type: selectedDuration === 25 ? 'pomodoro' : 'deep_work',
      durationMinutes: selectedDuration,
      completedAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      distractionsCount: distractionCount,
      notes: sessionNotes.trim() || undefined,
      xpEarned: xp
    };

    const existing = storage.getFocusSessions();
    storage.saveFocusSessions([session, ...existing]);

    onAwardXP(
      xp,
      `Completed ${selectedDuration}-min Focus Session (${distractionCount} distractions logged)`,
      'focus'
    );

    setSecondsLeft(selectedDuration * 60);
    setDistractionCount(0);
    setSessionNotes('');
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalSeconds = selectedDuration * 60;
  const progressPercent = Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100));

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* FULLSCREEN ZEN STUDY MODE OVERLAY */}
      {isZenMode && (
        <div className="fixed inset-0 z-50 bg-[#030712] flex flex-col justify-between p-6 sm:p-10 select-none animate-in fade-in zoom-in-95 duration-200">
          {/* Top Bar in Zen Mode */}
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Zen Exam Study Mode
              </span>
            </div>
            <button
              onClick={() => setIsZenMode(false)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Exit Zen Mode"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Central Zen Display */}
          <div className="text-center space-y-6 my-auto">
            {sessionNotes && (
              <div className="px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-200 text-sm font-bold inline-block">
                🎯 {sessionNotes}
              </div>
            )}

            <div className="text-8xl sm:text-9xl font-black font-mono tracking-wider text-white">
              {formatTime(secondsLeft)}
            </div>

            <div className="text-sm font-semibold text-slate-400">
              {isRunning ? 'Locked In. Block out the world.' : 'Session Paused'}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleStartPause}
                className={`px-10 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-2xl transition-all ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                {isRunning ? 'PAUSE' : 'RESUME'}
              </button>

              <button
                onClick={handleLogDistraction}
                className="px-6 py-3.5 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800"
              >
                +1 Distraction ({distractionCount})
              </button>
            </div>
          </div>

          {/* Bottom Ambient Info */}
          <div className="text-center text-xs text-slate-500">
            Press Esc or tap the exit icon to return to dashboard.
          </div>
        </div>
      )}

      {/* Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-500/30">
              <Brain className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">Mind & Deep Focus</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Distraction-free focus sessions strengthen concentration, willpower, and the Focus stat.
          </p>
        </div>

        {/* Quick Duration Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { mins: 15, label: '15m Sprint' },
            { mins: 25, label: '25m Pomodoro' },
            { mins: 50, label: '50m Deep Work' },
            { mins: 90, label: '90m Exam Block' }
          ].map(preset => (
            <button
              key={preset.mins}
              onClick={() => handleReset(preset.mins)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                selectedDuration === preset.mins
                  ? 'border-purple-500 bg-purple-950/40 text-purple-300 shadow-sm'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}

          {/* Fullscreen Zen Mode Button */}
          <button
            onClick={() => setIsZenMode(true)}
            className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5"
            title="Open Fullscreen Zen Study Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" /> Zen Mode
          </button>
        </div>
      </div>

      {/* Main Focus Dial Card */}
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl text-center space-y-6">
        {/* Circular Ring Timer */}
        <div className="relative flex items-center justify-center w-56 h-56 mx-auto my-2">
          <svg className="w-56 h-56 -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="96"
              className="stroke-slate-800"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="112"
              cy="112"
              r="96"
              className="stroke-purple-500 transition-all duration-700 ease-out"
              strokeWidth="10"
              fill="none"
              strokeDasharray={603.2}
              strokeDashoffset={603.2 - (603.2 * progressPercent) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-5xl font-black font-mono text-white tracking-wider block">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-xs font-semibold text-purple-400/80 mt-1 block">
              {isRunning ? 'DEEP IN ZONE' : 'READY TO FOCUS'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={handleStartPause}
            className={`px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-98 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            {isRunning ? 'PAUSE TIMER' : 'START FOCUS'}
          </button>

          <button
            onClick={() => handleReset()}
            className="p-3 rounded-2xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* AMBIENT SOUND GENERATOR (Web Audio API Synthesizer) */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-cyan-400" />
              Ambient Focus Audio (Offline Synthesizer)
            </span>
            {ambientType !== 'off' && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30 uppercase animate-pulse">
                Playing
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'off', label: '🔇 Silent' },
              { id: 'brown', label: '🌊 Brown Noise' },
              { id: 'binaural', label: '🧠 40Hz Gamma' },
              { id: 'rain', label: '🌧️ Rain Rest' }
            ].map(snd => (
              <button
                key={snd.id}
                type="button"
                onClick={() => handleAmbientChange(snd.id as typeof ambientType)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                  ambientType === snd.id
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>

          {ambientType !== 'off' && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] text-slate-400">Volume:</span>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={ambientVolume}
                onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] font-mono text-cyan-400">{Math.round(ambientVolume * 100)}%</span>
            </div>
          )}
        </div>

        {/* Distraction Logger */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-left">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Distraction Counter
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Caught your mind wandering? Log it without shame and gently refocus.
            </p>
          </div>
          <button
            onClick={handleLogDistraction}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-colors"
          >
            +1 Distraction ({distractionCount})
          </button>
        </div>

        {/* Notes for session */}
        <div>
          <input
            type="text"
            placeholder="Focus objective (e.g. Finish chemistry module 2)..."
            value={sessionNotes}
            onChange={e => setSessionNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
