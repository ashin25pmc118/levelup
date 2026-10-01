import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Play,
  RotateCcw,
  Trophy,
  Activity,
  Swords,
  Clock
} from 'lucide-react';
import { ReflexScore } from '../../../types';
import { sounds } from '../../../services/soundEffects';

interface ReflexHubProps {
  highScores: ReflexScore[];
  onSaveHighScore: (score: ReflexScore) => void;
  onAwardXP: (amount: number, description: string, stat: 'reflex' | 'stamina') => void;
}

export const ReflexHub: React.FC<ReflexHubProps> = ({
  highScores,
  onSaveHighScore,
  onAwardXP
}) => {
  const [subTab, setSubTab] = useState<'reaction_test' | 'agility_trainer' | 'physical_drills'>('reaction_test');

  // ==========================================
  // 1. MILLISECOND DIGITAL TAP TESTER
  // ==========================================
  const [reflexState, setReflexState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [reflexReactionTime, setReflexReactionTime] = useState<number | null>(null);
  const reflexStartTimeRef = useRef<number>(0);
  const reflexTimeoutRef = useRef<any | null>(null);

  const startReflexTest = () => {
    sounds.playClick();
    setReflexState('waiting');
    setReflexReactionTime(null);

    const randomDelay = Math.floor(Math.random() * 2500) + 1500; // 1.5s - 4.0s
    reflexTimeoutRef.current = setTimeout(() => {
      reflexStartTimeRef.current = Date.now();
      setReflexState('ready');
      sounds.playReflexBeep(true);
    }, randomDelay);
  };

  const handleReflexClick = () => {
    if (reflexState === 'waiting') {
      if (reflexTimeoutRef.current) clearTimeout(reflexTimeoutRef.current);
      setReflexState('idle');
      sounds.playReflexBeep(false);
      alert('Too early! Wait until the box turns GREEN.');
    } else if (reflexState === 'ready') {
      const ms = Date.now() - reflexStartTimeRef.current;
      setReflexReactionTime(ms);
      setReflexState('result');

      let rating: 'Godlike' | 'Master' | 'Fast' | 'Average' | 'Slow' = 'Average';
      let xp = 15;
      if (ms < 200) { rating = 'Godlike'; xp = 30; }
      else if (ms < 250) { rating = 'Master'; xp = 25; }
      else if (ms < 320) { rating = 'Fast'; xp = 20; }
      else if (ms > 450) { rating = 'Slow'; xp = 10; }

      sounds.playQuestComplete();
      const score: ReflexScore = {
        id: `ref_${Date.now()}`,
        timestamp: new Date().toISOString(),
        reactionTimeMs: ms,
        rating,
        xpEarned: xp
      };
      onSaveHighScore(score);
      onAwardXP(xp, `Reaction Test: ${ms}ms (${rating})`, 'reflex');
    }
  };

  // ==========================================
  // 2. LIVE INTERACTIVE AGILITY & SPLIT-STEP DRILL (BADMINTON & COMBAT)
  // ==========================================
  const [agilitySport, setAgilitySport] = useState<'badminton' | 'combat'>('badminton');
  const [agilityPace, setAgilityPace] = useState<'normal' | 'pro'>('normal'); // 3.0s vs 1.8s
  const [isAgilityRunning, setIsAgilityRunning] = useState(false);
  const [agilityTimeLeft, setAgilityTimeLeft] = useState(60); // 60s round
  const [activeCueIndex, setActiveCueIndex] = useState(0);

  const badmintonCues = [
    { title: 'SPLIT-STEP HOP!', subtitle: 'Hop on balls of both feet, knees springy', icon: '⚡', color: 'from-amber-500 to-yellow-400' },
    { title: 'FOREHAND NET KILL', subtitle: 'Lunge deep front-right, racquet high', icon: '🏸↗️', color: 'from-cyan-500 to-blue-500' },
    { title: 'BACKHAND NET TUMBLE', subtitle: 'Lunge front-left, delicate soft touch', icon: '🏸↖️', color: 'from-emerald-500 to-teal-500' },
    { title: 'SPLIT-STEP & RE-CENTER!', subtitle: 'Recover to central court instantly', icon: '⚡', color: 'from-amber-500 to-yellow-400' },
    { title: 'OVERHEAD JUMP SMASH', subtitle: 'Push off back-right foot, explosive strike', icon: '💥↘️', color: 'from-red-500 to-orange-500' },
    { title: 'BACKHAND DEEP CLEAR', subtitle: 'Pivot back-left, full forearm pronation', icon: '🏸↙️', color: 'from-purple-500 to-indigo-500' },
    { title: 'MIDCOURT FLAT DRIVE', subtitle: 'Crouch, fast wrist snap crosscourt', icon: '↔️', color: 'from-blue-500 to-cyan-400' },
    { title: 'DEFENSIVE DIVE / BLOCK', subtitle: 'Drop low, cushion opponent\'s smash', icon: '🛡️', color: 'from-pink-500 to-rose-500' },
  ];

  const combatCues = [
    { title: 'RHYTHM BOUNCE & GUARD', subtitle: 'Hands glued to chin, bounce on balls of feet', icon: '⚡', color: 'from-amber-500 to-yellow-400' },
    { title: 'SLIP LEFT + RIGHT CROSS', subtitle: 'Slip outside opponent\'s jab, fire right cross', icon: '🥊', color: 'from-red-500 to-orange-500' },
    { title: 'SLIP RIGHT + LEAD HOOK', subtitle: 'Dip right shoulder, whip lead left hook', icon: '🥊', color: 'from-cyan-500 to-blue-500' },
    { title: 'DUCK & ROLL UNDER', subtitle: 'U-shaped bob & weave under incoming hook', icon: '🔄', color: 'from-purple-500 to-indigo-500' },
    { title: 'PARRY JAB + COUNTER JAB', subtitle: 'Catch strike with right palm, fire stiff jab', icon: '✋', color: 'from-emerald-500 to-teal-500' },
    { title: 'PIVOT 90° & RE-SET', subtitle: 'Swing back foot around, angle change', icon: '↩️', color: 'from-pink-500 to-rose-500' },
  ];

  const currentCues = agilitySport === 'badminton' ? badmintonCues : combatCues;

  useEffect(() => {
    if (!isAgilityRunning) return;

    const delay = agilityPace === 'normal' ? 3000 : 1800;
    const cueInterval = setInterval(() => {
      setActiveCueIndex(prev => {
        let next;
        do {
          next = Math.floor(Math.random() * currentCues.length);
        } while (next === prev);
        sounds.playCueBeep(750);
        return next;
      });
    }, delay);

    const countdown = setInterval(() => {
      setAgilityTimeLeft(t => {
        if (t <= 1) {
          clearInterval(countdown);
          clearInterval(cueInterval);
          setIsAgilityRunning(false);
          sounds.playLevelUp();
          const xp = agilityPace === 'pro' ? 30 : 25;
          onAwardXP(xp, `${agilitySport.toUpperCase()} Shadow Agility Round (${agilityPace.toUpperCase()} Pace)`, 'reflex');
          return 60;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdown);
      clearInterval(cueInterval);
    };
  }, [isAgilityRunning, agilityPace, currentCues.length, agilitySport, onAwardXP]);

  const toggleAgility = () => {
    sounds.playClick();
    setIsAgilityRunning(!isAgilityRunning);
  };

  const resetAgility = () => {
    sounds.playClick();
    setIsAgilityRunning(false);
    setAgilityTimeLeft(60);
    setActiveCueIndex(0);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
        {[
          { id: 'reaction_test', label: '⚡ Millisecond Screen Tap Test', icon: Zap },
          { id: 'agility_trainer', label: '🏃 Live Agility & Split-Step Trainer', icon: Activity },
          { id: 'physical_drills', label: '🥊 Real-World Combat & Badminton Drills', icon: Swords }
        ].map(item => {
          const isSel = subTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                setSubTab(item.id as typeof subTab);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isSel
                  ? 'bg-yellow-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. MILLISECOND DIGITAL TAP TESTER */}
      {subTab === 'reaction_test' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 text-center">
            <div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-950 text-yellow-400 font-bold border border-yellow-500/30 uppercase tracking-wider">
                RAW NEURAL LATENCY
              </span>
              <h3 className="text-2xl font-black text-white mt-1">Reflex Reaction Test</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                When the target turns GREEN, tap or click instantly. Tests simple visual-motor reaction time.
              </p>
            </div>

            {/* Click Arena */}
            <div
              onClick={reflexState === 'ready' || reflexState === 'waiting' ? handleReflexClick : undefined}
              className={`w-full h-56 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-colors duration-100 select-none shadow-xl ${
                reflexState === 'idle'
                  ? 'bg-slate-950 border-slate-800 text-slate-400'
                  : reflexState === 'waiting'
                  ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse'
                  : reflexState === 'ready'
                  ? 'bg-emerald-500 border-white text-slate-950 font-black'
                  : 'bg-slate-950 border-cyan-500 text-cyan-300'
              }`}
            >
              {reflexState === 'idle' && (
                <div className="space-y-2">
                  <Zap className="w-12 h-12 mx-auto text-yellow-400" />
                  <p className="text-sm font-bold text-white">Click "START TEST" below to begin</p>
                </div>
              )}
              {reflexState === 'waiting' && (
                <div className="space-y-1">
                  <span className="text-2xl font-black tracking-wider uppercase text-red-300">WAIT FOR GREEN...</span>
                  <p className="text-xs text-red-400">Steady your finger, do not jump early</p>
                </div>
              )}
              {reflexState === 'ready' && (
                <div className="space-y-1">
                  <span className="text-4xl font-black tracking-widest uppercase text-slate-950">TAP NOW!</span>
                </div>
              )}
              {reflexState === 'result' && reflexReactionTime && (
                <div className="space-y-1 animate-in zoom-in-95 duration-150">
                  <span className="text-5xl font-black font-mono text-white">{reflexReactionTime} ms</span>
                  <p className="text-xs font-bold text-cyan-400">
                    {reflexReactionTime < 220 ? '🔥 Elite Athlete Speed!' : reflexReactionTime < 300 ? '⚡ Fast Reflexes!' : 'Solid Reaction Time'}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={startReflexTest}
              disabled={reflexState === 'waiting' || reflexState === 'ready'}
              className="px-6 py-2.5 rounded-xl font-black text-xs bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-slate-950 shadow-md flex items-center gap-2 mx-auto transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" /> {reflexState === 'result' ? 'TEST AGAIN' : 'START TEST'}
            </button>
          </div>

          {/* Leaderboard / History */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Recent Reflex Records
            </h4>
            {highScores.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No scores yet. Complete your first test!</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {highScores.slice(0, 7).map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 text-[11px]">#{idx + 1}</span>
                      <span className="font-black text-white">{s.reactionTimeMs} ms</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/20">
                      {s.rating}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-300 block">Benchmarks:</span>
              <p>&lt; 200ms: Elite (Badminton Pro / Combat)</p>
              <p>200-260ms: Above Average athlete</p>
              <p>260-350ms: Typical healthy human</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. LIVE INTERACTIVE AGILITY & SPLIT-STEP TRAINER */}
      {subTab === 'agility_trainer' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-yellow-950 text-yellow-400 border border-yellow-500/30">
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-white">Live Shadow Agility & Split-Step Trainer</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Stand up in your room or hostel. React physically to live audio-visual cues!
              </p>
            </div>

            {/* Sport & Pace Switchers */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { sounds.playClick(); setAgilitySport('badminton'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    agilitySport === 'badminton' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏸 Badminton
                </button>
                <button
                  type="button"
                  onClick={() => { sounds.playClick(); setAgilitySport('combat'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    agilitySport === 'combat' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🥊 Combat / Boxing
                </button>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { sounds.playClick(); setAgilityPace('normal'); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    agilityPace === 'normal' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3.0s
                </button>
                <button
                  type="button"
                  onClick={() => { sounds.playClick(); setAgilityPace('pro'); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    agilityPace === 'pro' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1.8s Pro
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Live Cue Display */}
          <div className="p-8 rounded-2xl bg-slate-950 border-2 border-slate-800 text-center min-h-[260px] flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            {isAgilityRunning ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-150">
                <span className="text-4xl select-none">{currentCues[activeCueIndex].icon}</span>
                <div>
                  <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r uppercase tracking-wider font-sans mb-1"
                      style={{
                        backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                      }}>
                    <span className="text-white">{currentCues[activeCueIndex].title}</span>
                  </h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    {currentCues[activeCueIndex].subtitle}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 text-2xl">
                  {agilitySport === 'badminton' ? '🏸' : '🥊'}
                </div>
                <h4 className="text-xl font-black text-white">
                  {agilitySport === 'badminton' ? 'Badminton 6-Corner Footwork' : 'Boxing Slipping & Head Movement'}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Clear a 2x2 meter space in your room or hostel corridor. On each flash and tone, execute the footwork or strike evasion instantly!
                </p>
              </div>
            )}
          </div>

          {/* Timer & Session Controls */}
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-slate-400">Round Time:</span>
              <span className="font-mono text-xl font-black text-white">{agilityTimeLeft}s</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleAgility}
                className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all ${
                  isAgilityRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                }`}
              >
                {isAgilityRunning ? 'PAUSE ROUND' : 'START 60s ROUND'}
              </button>
              <button
                onClick={resetAgility}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REAL-WORLD PHYSICAL DRILLS GUIDE */}
      {subTab === 'physical_drills' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              Real-World Physical Reflex Drills for Badminton & Combat
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Top drills practiced by badminton champions and martial artists to cut reaction latency under 200 milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drill 1: The Split-Step Science */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  🏸 Drill 1: The Split-Step Micro-Hop
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/20 font-bold">
                  Essential #1
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Why:</strong> If you stand flat-footed, your brain requires 400ms to overcome inertia. By performing a small hop right as the opponent strikes, your Achilles tendons store elastic energy (stretch-shortening cycle), cutting your explosion time by <strong>50%</strong>.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <strong>Execution:</strong> Hop 1-2 cm off the ground, land with wide base on the balls of your feet with knees slightly bent. Push off toward the shuttlecock immediately upon landing.
              </div>
            </div>

            {/* Drill 2: Tennis Ball Wall Rebounds */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                  🎾 Drill 2: Tennis Ball Wall Rebounds
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/20 font-bold">
                  Hand-Eye
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Why:</strong> Develops unpredictable trajectory tracking and fast grip clamping.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <strong>Execution:</strong> Stand 1.5 to 2 meters from a wall in athletic stance. Throw underhand with right hand, catch with left. Alternate for 3 minutes without letting the ball drop.
              </div>
            </div>

            {/* Drill 3: Drop-Catch Reaction Drill */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  ⚡ Drill 3: Shoulder Drop-Catch
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/20 font-bold">
                  Sub-200ms
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Why:</strong> Isolates pure visual-to-motor clamping speed.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <strong>Execution:</strong> Hold a tennis ball or small ball at shoulder level, palm facing down. Release the ball, pull your hand backward, and catch it with the <em>same hand</em> before it falls past your hip.
              </div>
            </div>

            {/* Drill 4: Hostel Slip-Line Shadow Boxing */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-400 uppercase tracking-wider">
                  🥊 Drill 4: The Slip-Line Head Movement
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/20 font-bold">
                  Combat Defense
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Why:</strong> Never move backwards in a straight line when struck. Slips keep your eyes locked on the opponent's chest while evading punches by mere inches.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <strong>Execution:</strong> Tie a jump rope or string at chin height across your hostel room. Shadow box under the rope, dipping hips and weaving your head from left to right as you advance.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
