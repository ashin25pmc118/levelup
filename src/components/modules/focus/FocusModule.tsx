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
  VolumeX,
  Wind,
  Flame,
  Coffee,
  CloudRain,
  Sliders
} from 'lucide-react';
import { FocusSession } from '../../../types';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';
import { haptics } from '../../../services/hapticFeedback';
import { GuidedBreathworkModal } from '../../common/GuidedBreathworkModal';

interface FocusModuleProps {
  onAwardXP: (amount: number, description: string, stat: 'focus' | 'discipline') => void;
}

export const FocusModule: React.FC<FocusModuleProps> = ({ onAwardXP }) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // minutes
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [distractionCount, setDistractionCount] = useState<number>(0);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Multi-Track Ambient Sound Mixer State
  const [mixerVolumes, setMixerVolumes] = useState<{ rain: number; campfire: number; cafe: number; gamma: number }>(() => {
    try {
      const saved = localStorage.getItem('levelup_ambient_mixer');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { rain: 0, campfire: 0, cafe: 0, gamma: 0 };
  });
  const [isMixerPlaying, setIsMixerPlaying] = useState<boolean>(false);

  // Fullscreen Zen Mode state
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Guided Breathwork modal state
  const [isBreathworkOpen, setIsBreathworkOpen] = useState<boolean>(false);

  // Ref for accurate background tab timing
  const targetEndTimeRef = useRef<number | null>(null);

  // Screen Wake Lock API during deep focus sessions
  useEffect(() => {
    let wakeLockSentinel: any = null;
    const requestWakeLock = async () => {
      if (isRunning && 'wakeLock' in navigator) {
        try {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        } catch {}
      }
    };
    if (isRunning) {
      requestWakeLock();
    }
    return () => {
      if (wakeLockSentinel && typeof wakeLockSentinel.release === 'function') {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [isRunning]);

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
      sounds.stopMixer();
    };
  }, []);

  const handleStartPause = () => {
    sounds.playClick();
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);

    if (nextRunning) {
      targetEndTimeRef.current = Date.now() + secondsLeft * 1000;
      const hasActiveTrack = Object.values(mixerVolumes).some(v => v > 0);
      if (hasActiveTrack) {
        sounds.startMixer(mixerVolumes);
        setIsMixerPlaying(true);
      }
    } else {
      targetEndTimeRef.current = null;
      sounds.stopMixer();
      setIsMixerPlaying(false);
    }
  };

  const handleReset = (mins: number = selectedDuration) => {
    sounds.playClick();
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setSelectedDuration(mins);
    setSecondsLeft(mins * 60);
    setDistractionCount(0);
    sounds.stopMixer();
    setIsMixerPlaying(false);
  };

  const handleLogDistraction = () => {
    sounds.playClick();
    setDistractionCount(c => c + 1);
  };

  const handleTrackVolumeChange = (track: 'rain' | 'campfire' | 'cafe' | 'gamma', vol: number) => {
    const next = { ...mixerVolumes, [track]: vol };
    setMixerVolumes(next);
    try {
      localStorage.setItem('levelup_ambient_mixer', JSON.stringify(next));
    } catch {}

    sounds.setMixerTrackVolume(track, vol);
    const anyActive = Object.values(next).some(v => v > 0);
    setIsMixerPlaying(anyActive && sounds.isMixerActive());
  };

  const handleApplyPreset = (preset: 'off' | 'rainy_cafe' | 'campfire' | 'gamma_focus') => {
    sounds.playClick();
    let next = { rain: 0, campfire: 0, cafe: 0, gamma: 0 };
    if (preset === 'rainy_cafe') {
      next = { rain: 0.45, campfire: 0, cafe: 0.35, gamma: 0 };
    } else if (preset === 'campfire') {
      next = { rain: 0.15, campfire: 0.55, cafe: 0, gamma: 0 };
    } else if (preset === 'gamma_focus') {
      next = { rain: 0.2, campfire: 0, cafe: 0, gamma: 0.6 };
    }

    setMixerVolumes(next);
    try {
      localStorage.setItem('levelup_ambient_mixer', JSON.stringify(next));
    } catch {}

    if (preset === 'off') {
      sounds.stopMixer();
      setIsMixerPlaying(false);
    } else {
      sounds.startMixer(next);
      setIsMixerPlaying(true);
    }
  };

  const handleToggleMixerMaster = () => {
    sounds.playClick();
    if (isMixerPlaying) {
      sounds.stopMixer();
      setIsMixerPlaying(false);
    } else {
      const anyActive = Object.values(mixerVolumes).some(v => v > 0);
      const toPlay = anyActive ? mixerVolumes : { rain: 0.35, campfire: 0, cafe: 0, gamma: 0.35 };
      if (!anyActive) {
        setMixerVolumes(toPlay);
      }
      sounds.startMixer(toPlay);
      setIsMixerPlaying(true);
    }
  };

  const handleCompleteSession = () => {
    sounds.playTimerDone();
    haptics.alert();
    sounds.stopMixer();
    setIsMixerPlaying(false);
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

          {/* Guided Breathwork Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsBreathworkOpen(true);
            }}
            className="p-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title="Open Guided Box Breathing (4-4-4-4)"
          >
            <Wind className="w-3.5 h-3.5" /> Breathwork
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

        {/* MULTI-TRACK AMBIENT SOUND MIXER (Web Audio API Synthesizer) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Multi-Track Ambient Mixer
                </span>
                <span className="text-[10px] text-slate-400">
                  Offline Synthesized Soundboard · Zero Downloads
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isMixerPlaying && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30 uppercase animate-pulse">
                  Playing
                </span>
              )}
              <button
                type="button"
                onClick={handleToggleMixerMaster}
                className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                  isMixerPlaying
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title={isMixerPlaying ? 'Mute all ambient tracks' : 'Play ambient mix'}
              >
                {isMixerPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{isMixerPlaying ? 'Mute' : 'Play'}</span>
              </button>
            </div>
          </div>

          {/* Quick 1-Tap Ambient Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'off', label: '🔇 Mute All' },
                { id: 'rainy_cafe', label: '🌧️ Rainy Cafe' },
                { id: 'campfire', label: '🔥 Night Fire' },
                { id: 'gamma_focus', label: '🧠 40Hz Gamma' }
              ].map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id as any)}
                  className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-slate-900 hover:bg-slate-850 hover:text-cyan-300 border border-slate-800/80 transition-all text-center text-slate-300 active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Track Channels Volume Sliders */}
          <div className="space-y-2.5 pt-1 border-t border-slate-900">
            {[
              {
                id: 'rain' as const,
                label: 'Rainfall',
                icon: CloudRain,
                color: 'text-cyan-400',
                accent: 'accent-cyan-400'
              },
              {
                id: 'campfire' as const,
                label: 'Campfire',
                icon: Flame,
                color: 'text-orange-400',
                accent: 'accent-orange-400'
              },
              {
                id: 'cafe' as const,
                label: 'Cafe Murmur',
                icon: Coffee,
                color: 'text-amber-400',
                accent: 'accent-amber-400'
              },
              {
                id: 'gamma' as const,
                label: '40Hz Gamma Waves',
                icon: Brain,
                color: 'text-purple-400',
                accent: 'accent-purple-400'
              }
            ].map(track => {
              const Icon = track.icon;
              const vol = mixerVolumes[track.id];
              return (
                <div key={track.id} className="flex items-center gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleTrackVolumeChange(track.id, vol > 0 ? 0 : 0.4)}
                    className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                      vol > 0
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}
                    title={vol > 0 ? `Mute ${track.label}` : `Unmute ${track.label}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${vol > 0 ? track.color : 'text-slate-600'}`} />
                  </button>

                  <span className={`w-28 text-[11px] font-bold truncate ${vol > 0 ? 'text-slate-200' : 'text-slate-500'}`}>
                    {track.label}
                  </span>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={vol}
                    onChange={e => handleTrackVolumeChange(track.id, parseFloat(e.target.value))}
                    className={`flex-1 ${track.accent} h-1.5 bg-slate-900 rounded-lg cursor-pointer`}
                  />

                  <span className="w-9 text-right font-mono text-[10px] text-slate-400">
                    {Math.round(vol * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
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

      {/* Guided Breathwork Modal */}
      <GuidedBreathworkModal
        isOpen={isBreathworkOpen}
        onClose={() => setIsBreathworkOpen(false)}
      />
    </div>
  );
};
