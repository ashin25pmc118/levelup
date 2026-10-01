import React, { useState, useEffect } from 'react';
import {
  X,
  Watch,
  Heart,
  Footprints,
  Flame,
  Bluetooth,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Info,
  Smartphone
} from 'lucide-react';
import { smartwatch, SmartwatchConnectionState } from '../../services/smartwatchService';
import { sounds } from '../../services/soundEffects';

interface SmartwatchSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAwardXP?: (amount: number, description: string, stat: 'stamina' | 'recovery') => void;
}

export const SmartwatchSyncModal: React.FC<SmartwatchSyncModalProps> = ({
  isOpen,
  onClose,
  onAwardXP
}) => {
  const [swState, setSwState] = useState<SmartwatchConnectionState>(smartwatch.state);
  const [isConnecting, setIsConnecting] = useState(false);

  // Daily Step Tracker
  const todayKey = new Date().toISOString().split('T')[0];
  const [steps, setSteps] = useState<number>(() => {
    const saved = localStorage.getItem(`levelup_daily_steps_${todayKey}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [syncedSteps, setSyncedSteps] = useState<number>(() => {
    const saved = localStorage.getItem(`levelup_daily_synced_steps_${todayKey}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const stepGoal = 10000;
  const stepPercent = Math.min(100, Math.round((steps / stepGoal) * 100));

  useEffect(() => {
    smartwatch.setStatusListener(state => {
      setSwState({ ...state });
      setIsConnecting(false);
    });
  }, []);

  if (!isOpen) return null;

  const handleConnectBluetooth = async () => {
    sounds.playClick();
    setIsConnecting(true);
    await smartwatch.connect();
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    sounds.playClick();
    smartwatch.disconnect();
  };

  const handleAddSteps = (added: number) => {
    sounds.playClick();
    const newTotal = Math.max(0, steps + added);
    setSteps(newTotal);
    localStorage.setItem(`levelup_daily_steps_${todayKey}`, String(newTotal));
  };

  const handleBankStepXP = () => {
    const unbanked = steps - syncedSteps;
    if (unbanked < 1000) {
      alert('Accumulate at least 1,000 steps from your Noise watch to bank XP!');
      return;
    }

    sounds.playQuestComplete();
    const thousands = Math.floor(unbanked / 1000);
    const xpReward = thousands * 12;

    if (onAwardXP) {
      onAwardXP(xpReward, `Synced ${thousands * 1000} steps from Noise watch`, 'stamina');
    }

    const newSynced = syncedSteps + thousands * 1000;
    setSyncedSteps(newSynced);
    localStorage.setItem(`levelup_daily_synced_steps_${todayKey}`, String(newSynced));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-5 sm:p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                Noise Smartwatch & Health Sync
              </h3>
              <p className="text-xs text-slate-400">
                Live Heart Rate via Bluetooth & Step XP Bank
              </p>
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

        {/* 1. LIVE BLUETOOTH HEART RATE SENSOR */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Bluetooth className="w-3.5 h-3.5 text-blue-400" /> Live Web Bluetooth Pulse
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                swState.connected
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {swState.connected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  swState.heartRate
                    ? 'bg-rose-950/80 text-rose-400 animate-pulse'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black font-mono text-white">
                    {swState.heartRate ? swState.heartRate : '--'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">BPM</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {swState.deviceName || 'No watch paired'}
                </p>
              </div>
            </div>

            {swState.connected ? (
              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-bold border border-red-500/30 transition-all active:scale-[0.98]"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectBluetooth}
                disabled={isConnecting}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all active:scale-[0.98]"
              >
                {isConnecting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Bluetooth className="w-3.5 h-3.5" />
                )}
                <span>Pair Noise Watch</span>
              </button>
            )}
          </div>

          {swState.error && (
            <p className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
              {swState.error}
            </p>
          )}
        </div>

        {/* 2. DAILY NOISE STEP SYNC & XP CONVERTER */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-orange-400" /> NoiseFit Steps & Distance
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300">
              {steps.toLocaleString()} / {stepGoal.toLocaleString()}
            </span>
          </div>

          {/* Step Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${stepPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>{stepPercent}% of Daily Goal</span>
              <span className="flex items-center gap-2">
                <span>{(steps * 0.00075).toFixed(2)} km</span>
                <span className="text-orange-400 font-bold flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-orange-400" />
                  {Math.round(steps * 0.04)} kcal
                </span>
              </span>
            </div>
          </div>

          {/* Direct Input & Quick Presets */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Enter NoiseFit Steps:</span>
              <input
                type="number"
                min="0"
                max="100000"
                value={steps || ''}
                placeholder="e.g. 6420"
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                  setSteps(val);
                  localStorage.setItem(`levelup_daily_steps_${todayKey}`, String(val));
                }}
                className="w-28 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-500">steps today</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 font-medium">Quick Add:</span>
              {[500, 1000, 2500, 5000].map(amt => (
                <button
                  key={amt}
                  onClick={() => handleAddSteps(amt)}
                  className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-semibold transition-all active:scale-[0.98]"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Bank Step XP Action */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Unsynced Steps:</span>
              <span className="text-xs font-extrabold text-amber-300 font-mono">
                {Math.max(0, steps - syncedSteps).toLocaleString()} steps ready
              </span>
            </div>

            <button
              onClick={handleBankStepXP}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Convert to XP</span>
            </button>
          </div>
        </div>

        {/* How It Works Guide */}
        <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300">
            <Smartphone className="w-4 h-4" />
            <span>How your Noise watch syncs:</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            1. Your watch automatically sends steps & sleep to the <strong>NoiseFit</strong> app.
            <br />
            2. NoiseFit syncs with <strong>Google Fit</strong> on your phone.
            <br />
            3. Tap <strong>Convert to XP</strong> here to turn your real-world movement into Stamina stats & XP!
          </p>
        </div>
      </div>
    </div>
  );
};
