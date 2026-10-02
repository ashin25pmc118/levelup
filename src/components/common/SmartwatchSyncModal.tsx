import React, { useState, useEffect } from 'react';
import {
  X,
  Watch,
  Heart,
  Footprints,
  Flame,
  Bluetooth,
  Battery,
  Zap,
  Activity,
  Droplets,
  Sparkles,
  ShieldAlert,
  Play,
  Square,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { smartwatch, SmartwatchConnectionState, HRZone } from '../../services/smartwatchService';
import { sounds } from '../../services/soundEffects';

interface SmartwatchSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAwardXP?: (amount: number, description: string, stat: 'stamina' | 'recovery') => void;
}

const ZONE_CONFIG: Record<
  HRZone,
  { label: string; range: string; color: string; bg: string; border: string; xpMultiplier: number }
> = {
  rest: {
    label: 'Resting / Normal',
    range: '< 100 BPM',
    color: 'text-slate-300',
    bg: 'bg-slate-800/60',
    border: 'border-slate-700',
    xpMultiplier: 1.0
  },
  warmup: {
    label: 'Warmup Zone',
    range: '100 - 119 BPM',
    color: 'text-blue-400',
    bg: 'bg-blue-950/60',
    border: 'border-blue-500/40',
    xpMultiplier: 1.1
  },
  fatburn: {
    label: 'Fat Burn Zone',
    range: '120 - 139 BPM',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-500/40',
    xpMultiplier: 1.2
  },
  cardio: {
    label: 'Aerobic Cardio',
    range: '140 - 159 BPM',
    color: 'text-amber-400',
    bg: 'bg-amber-950/60',
    border: 'border-amber-500/40',
    xpMultiplier: 1.35
  },
  peak: {
    label: 'Anaerobic Peak',
    range: '160 - 179 BPM',
    color: 'text-orange-400',
    bg: 'bg-orange-950/60',
    border: 'border-orange-500/40',
    xpMultiplier: 1.45
  },
  berserk: {
    label: 'Hunter Berserk',
    range: '180+ BPM',
    color: 'text-rose-400',
    bg: 'bg-rose-950/80',
    border: 'border-rose-500/60',
    xpMultiplier: 1.5
  }
};

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

  const handleToggleSimulator = () => {
    sounds.playClick();
    if (swState.isSimulated) {
      smartwatch.stopSimulator();
      smartwatch.disconnect();
    } else {
      smartwatch.startSimulator();
    }
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
      alert('Accumulate at least 1,000 steps from your watch to bank XP!');
      return;
    }

    sounds.playQuestComplete();
    const thousands = Math.floor(unbanked / 1000);
    const xpReward = thousands * 12;

    if (onAwardXP) {
      onAwardXP(xpReward, `Synced ${thousands * 1000} steps from smartwatch`, 'stamina');
    }

    const newSynced = syncedSteps + thousands * 1000;
    setSyncedSteps(newSynced);
    localStorage.setItem(`levelup_daily_synced_steps_${todayKey}`, String(newSynced));
  };

  const currentZone = ZONE_CONFIG[swState.hrZone] || ZONE_CONFIG.rest;
  const pulseDuration = swState.heartRate ? Math.max(0.35, 60 / swState.heartRate) : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-5 sm:p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Real-Time Smartwatch Command Center
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  Zero Google Connect
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Direct Web Bluetooth BLE · Real-Time Heart Rate & Blood Oxygen (SpO2)
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

        {/* Telemetry Status Strip */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                swState.connected
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-slate-600'
              }`}
            />
            <span className="text-slate-300 font-bold">
              {swState.connected
                ? swState.isSimulated
                  ? 'SIMULATED TELEMETRY ACTIVE'
                  : 'DIRECT BLE CONNECTED'
                : 'NO WATCH CONNECTED'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            {swState.batteryLevel !== null && (
              <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                <Battery className="w-3.5 h-3.5" />
                {swState.batteryLevel}%
              </span>
            )}
            {swState.hrv !== null && (
              <span className="font-mono text-cyan-400">
                HRV: {swState.hrv}ms
              </span>
            )}
            {swState.lastUpdated && (
              <span className="hidden sm:inline text-slate-500">
                {swState.lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* 1. LIVE BIOMETRIC GAUGES (HEART RATE & SPO2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Card A: Real-Time Heart Rate */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-400" /> Live Heart Rate
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentZone.bg} ${currentZone.color} ${currentZone.border}`}>
                {currentZone.label}
              </span>
            </div>

            <div className="flex items-center gap-3.5 my-1">
              <div
                className={`p-3 rounded-2xl transition-transform ${
                  swState.heartRate
                    ? 'bg-rose-950/80 text-rose-400 shadow-lg shadow-rose-950/50'
                    : 'bg-slate-800 text-slate-600'
                }`}
                style={
                  swState.heartRate
                    ? { animation: `heartbeat ${pulseDuration}s ease-in-out infinite` }
                    : undefined
                }
              >
                <Heart className="w-7 h-7 fill-current" />
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-mono text-white tracking-tight">
                    {swState.heartRate ? swState.heartRate : '--'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">BPM</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-400">
                  {swState.deviceName || 'Pair via Bluetooth'}
                </p>
              </div>
            </div>

            {/* Dynamic SVG EKG Line */}
            <div className="mt-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>EKG RHYTHM</span>
                <span>{swState.heartRate ? `${pulseDuration.toFixed(2)}s cycle` : 'Idle'}</span>
              </div>
              <div className="h-8 w-full bg-slate-900/60 rounded-lg overflow-hidden flex items-center px-1 border border-slate-800">
                <svg
                  className="w-full h-full text-rose-500 stroke-current"
                  viewBox="0 0 200 40"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M 0 20 L 40 20 L 50 20 L 55 5 L 62 35 L 68 12 L 74 24 L 78 20 L 140 20 L 145 5 L 152 35 L 158 12 L 164 24 L 168 20 L 200 20"
                    className={swState.heartRate ? 'animate-pulse' : 'opacity-30'}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card B: Real-Time Blood Oxygen (SpO2) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Blood Oxygen (SpO2)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                GATT 0x1822
              </span>
            </div>

            <div className="flex items-center gap-3.5 my-1">
              <div
                className={`p-3 rounded-2xl ${
                  swState.spO2
                    ? 'bg-cyan-950/80 text-cyan-400 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-800 text-slate-600'
                }`}
              >
                <Droplets className="w-7 h-7 fill-current" />
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-mono text-white tracking-tight">
                    {swState.spO2 ? `${swState.spO2}%` : '--%'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">SpO2</span>
                </div>
                <p className="text-[11px] font-semibold text-emerald-400">
                  {swState.spO2 && swState.spO2 >= 95
                    ? 'Optimal Oxygenation'
                    : swState.spO2 && swState.spO2 < 95
                    ? 'Attention: Take Deep Breaths'
                    : 'Awaiting sensor stream'}
                </p>
              </div>
            </div>

            {/* Oxygen Range Bar */}
            <div className="mt-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>90% (Low)</span>
                <span>95% (Normal)</span>
                <span>100% (Optimal)</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, ((swState.spO2 || 95) - 85) * 6.66))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. REAL-TIME RPG TRAINING ZONE & XP MULTIPLIER */}
        <div className={`p-4 rounded-2xl border transition-all ${currentZone.bg} ${currentZone.border} space-y-2.5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${currentZone.color}`} />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Hunter Cardio Zone: {currentZone.label}
              </span>
            </div>
            <span className={`text-xs font-black font-mono px-2.5 py-0.5 rounded-lg bg-slate-900/80 border ${currentZone.border} ${currentZone.color}`}>
              {currentZone.xpMultiplier}x XP Boost
            </span>
          </div>

          <p className="text-xs text-slate-300">
            {swState.hrZone === 'berserk'
              ? '🔥 MAXIMUM BERSERK EFFORT! 1.5x Stamina XP Multiplier active on all workouts & quests!'
              : swState.hrZone === 'peak' || swState.hrZone === 'cardio'
              ? '⚡ High cardiovascular intensity detected! Elevated XP multiplier active.'
              : 'Keep pushing your physical limits during workouts to trigger higher RPG XP multipliers!'}
          </p>

          {/* 5-Zone Visual Track */}
          <div className="grid grid-cols-5 gap-1.5 pt-1 text-[10px] font-mono text-center">
            {(Object.keys(ZONE_CONFIG) as HRZone[]).filter(z => z !== 'rest').map((zKey) => {
              const z = ZONE_CONFIG[zKey];
              const isActive = swState.hrZone === zKey;
              return (
                <div
                  key={zKey}
                  className={`p-1.5 rounded-lg border font-bold transition-all ${
                    isActive
                      ? `${z.bg} ${z.border} ${z.color} ring-1 ring-white/30 scale-[1.02]`
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="truncate">{z.label.split(' ')[0]}</div>
                  <div className="text-[9px] opacity-80">{z.xpMultiplier}x</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. HARDWARE CONNECTION & SIMULATOR CONTROLS */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Bluetooth className="w-3.5 h-3.5 text-blue-400" /> Bluetooth Hardware Pairing
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">
              100% Direct On-Device (No Cloud)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {swState.connected ? (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-bold border border-red-500/30 transition-all active:scale-[0.98] flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Disconnect Watch</span>
              </button>
            ) : (
              <button
                onClick={handleConnectBluetooth}
                disabled={isConnecting}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                {isConnecting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Bluetooth className="w-4 h-4" />
                )}
                <span>Pair Bluetooth Watch</span>
              </button>
            )}

            {/* Test Simulator Button */}
            <button
              onClick={handleToggleSimulator}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                swState.isSimulated
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-md shadow-amber-950/50'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Test real-time biometrics without physical watch"
            >
              {swState.isSimulated ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Stop Simulator</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-slate-300" />
                  <span>Test Simulator</span>
                </>
              )}
            </button>
          </div>

          {swState.error && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{swState.error}</span>
            </div>
          )}
        </div>

        {/* 4. DAILY STEP TRACKER & XP CONVERTER */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-orange-400" /> Daily Steps & Distance
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300">
              {steps.toLocaleString()} / {stepGoal.toLocaleString()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${stepPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>{stepPercent}% of Goal</span>
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
              <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Watch Steps Today:</span>
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
              <span className="text-[10px] text-slate-500">steps</span>
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

          {/* Bank XP Action */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Unsynced Steps:</span>
              <span className="text-xs font-extrabold text-amber-300 font-mono">
                {Math.max(0, steps - syncedSteps).toLocaleString()} ready
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

        {/* 5. ZERO GOOGLE CONNECT GUIDE */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300">
            <Sliders className="w-4 h-4" />
            <span>How to Connect Any Smartwatch Directly (No Google):</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
            <li>Ensure Bluetooth is enabled on your phone or laptop.</li>
            <li>On your watch (Noise, boAt, Amazfit, Garmin, Polar, etc.), go to <strong>Settings $\rightarrow$ Workout / Heart Rate $\rightarrow$ Turn ON &quot;Broadcast Heart Rate&quot;</strong> or &quot;HR Sharing&quot;.</li>
            <li>Tap <strong>&quot;Pair Bluetooth Watch&quot;</strong> above and select your device from the Chrome Bluetooth menu.</li>
            <li>Your real-time heart rate and SpO2 will stream directly with sub-second latency!</li>
          </ol>
        </div>

      </div>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.15); }
          30% { transform: scale(1.02); }
          45% { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
};
