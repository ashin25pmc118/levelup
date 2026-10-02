import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Shield, Flame, User, Clock, Dumbbell, MessageSquare } from 'lucide-react';
import { UserProfile, CharacterTitle, AppSettings } from '../../../types';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';
import { BrandLogo } from '../../common/BrandLogo';

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile, settings: AppSettings) => void;
}

const TITLES: { title: CharacterTitle; desc: string; icon: string }[] = [
  { title: 'Apprentice', desc: 'Starting from humble origins to build unstoppable habits', icon: '🌱' },
  { title: 'Mind Seeker', desc: 'Prioritizing sharp intellect, focus, and deep learning', icon: '🧠' },
  { title: 'Iron Striker', desc: 'Forging physical strength, discipline, and endurance', icon: '💪' },
  { title: 'Shadow Scholar', desc: 'Quiet, disciplined master of self-study and deep work', icon: '📚' },
  { title: 'Calm Sovereign', desc: 'Cultivating inner peace, social presence, and steady calm', icon: '👑' }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Hunter');
  const [title, setTitle] = useState<CharacterTitle>('Apprentice');
  const [goals, setGoals] = useState('Consistent study & physical strength');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [workoutTier, setWorkoutTier] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [confidenceTier, setConfidenceTier] = useState<'low-confidence' | 'comfortable' | 'capable' | 'confident'>('comfortable');

  const handleNext = () => {
    sounds.playClick();
    if (step < 3) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    sounds.playLevelUp();
    const existing = storage.getProfile();
    const updatedProfile: UserProfile = {
      ...existing,
      name: name.trim() || 'Hero',
      title,
      goals: goals.split(',').map(g => g.trim()),
      wakeTime,
      sleepTime,
      workoutTier,
      confidenceTier
    };

    const currentSettings = storage.getSettings();
    const updatedSettings: AppSettings = {
      ...currentSettings,
      onboardingCompleted: true
    };

    storage.saveProfile(updatedProfile);
    storage.saveSettings(updatedSettings);
    onComplete(updatedProfile, updatedSettings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 sm:p-8 border rounded-3xl bg-slate-900 border-cyan-500/30 shadow-2xl text-slate-100">
        {/* Glow ambient background */}
        <div className="absolute top-0 w-48 h-48 -translate-x-1/2 rounded-full -translate-y-1/2 left-1/2 bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BrandLogo size="xs" glow />
            <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
              CHARACTER AWAKENING · STEP {step} OF 3
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(s => (
              <span
                key={s}
                className={`w-5 h-1.5 rounded-full transition-all ${
                  step >= s ? 'bg-cyan-400' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Character Identity */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-black text-white">Create Your Character</h2>
              <p className="text-xs text-slate-400 mt-1">
                Real life is your RPG. Every daily action earns XP to level up your real-world stats.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Character Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name or moniker..."
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Select Your Class / Archetype
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {TITLES.map(t => (
                  <button
                    key={t.title}
                    type="button"
                    onClick={() => setTitle(t.title)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      title === t.title
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                    }`}
                  >
                    <span className="text-xl p-1 rounded-lg bg-slate-900 border border-slate-800">
                      {t.icon}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{t.title}</h4>
                      <p className="text-[11px] text-slate-400">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Routine & Sleep Schedule */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-black text-white">Daily Routine & Sleep</h2>
              <p className="text-xs text-slate-400 mt-1">
                Consistency is power. Healthy sleep restores your Recovery stat.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Wake Up
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)}
                    className="w-full pl-10 pr-2 py-2.5 text-sm font-semibold rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Sleep Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={e => setSleepTime(e.target.value)}
                    className="w-full pl-10 pr-2 py-2.5 text-sm font-semibold rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Main Quest Goal
              </label>
              <textarea
                value={goals}
                onChange={e => setGoals(e.target.value)}
                placeholder="What are your main ambitions this season?"
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 3: Training & Social Comfort Baseline */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-black text-white">Baseline Attributes</h2>
              <p className="text-xs text-slate-400 mt-1">
                Calibrate workout intensity and confidence challenges without pressure.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-orange-400" /> Preferred Workout Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'intermediate', 'advanced'] as const).map(tier => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setWorkoutTier(tier)}
                    className={`py-2 px-1 text-xs font-bold capitalize rounded-xl border text-center transition-all ${
                      workoutTier === tier
                        ? 'border-orange-500 bg-orange-950/40 text-orange-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-pink-400" /> Social Comfort Starting Point
              </label>
              <div className="grid grid-cols-2 gap-2 text-left">
                {[
                  { id: 'low-confidence', label: 'Clumsy / Shy', desc: 'Start with simple eye contact & nods' },
                  { id: 'comfortable', label: 'Comfortable', desc: 'Micro-conversations & short questions' },
                  { id: 'capable', label: 'Capable', desc: 'Opinions & speaking up in groups' },
                  { id: 'confident', label: 'Confident', desc: 'Presenting & leadership challenges' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConfidenceTier(item.id as typeof confidenceTier)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      confidenceTier === item.id
                        ? 'border-pink-500 bg-pink-950/40 text-pink-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <h5 className="text-xs font-bold text-white">{item.label}</h5>
                    <p className="text-[10px] text-slate-400">{item.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 italic mt-2">
                "The goal is progress, not pretending to be someone else. You can be calm, introverted, and still deeply confident."
              </p>
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-98"
          >
            {step === 3 ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" /> INITIALIZE SYSTEM
              </>
            ) : (
              <>
                CONTINUE <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
