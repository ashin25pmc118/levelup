import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Flame,
  Plus,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Palette,
  Watch,
  SlidersHorizontal,
  X,
  Heart,
  ChevronRight,
  FileText
} from 'lucide-react';
import { UserProfile, AppSettings } from '../../types';
import { getRequiredXPForLevel, getRankTier } from '../../services/rpgEngine';
import { sounds } from '../../services/soundEffects';
import { smartwatch } from '../../services/smartwatchService';

interface HeaderHUDProps {
  profile: UserProfile;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenQuickNote: () => void;
  onNavigate: (tab: string) => void;
  onOpenPlayerCard?: () => void;
  onOpenSmartwatch?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  profile,
  settings,
  onUpdateSettings,
  onOpenQuickNote,
  onNavigate,
  onOpenPlayerCard,
  onOpenSmartwatch
}) => {
  const [swState, setSwState] = useState(smartwatch.state);
  const [isMobileUtilityOpen, setIsMobileUtilityOpen] = useState(false);

  useEffect(() => {
    smartwatch.setStatusListener(state => {
      setSwState({ ...state });
    });
  }, []);
  const reqXP = getRequiredXPForLevel(profile.level);
  const xpPercent = Math.min(100, Math.round((profile.currentXP / reqXP) * 100));
  const { rank } = getRankTier(profile.level);
  const shieldsCount = profile.streakShields ?? 1;

  const toggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    onUpdateSettings(updated);
    sounds.setSettings(updated.soundEnabled, updated.soundVolume);
    if (updated.soundEnabled) {
      sounds.playClick();
    }
  };

  const handleCycleTheme = () => {
    sounds.playClick();
    const themes: AppSettings['theme'][] = ['cyber-slate', 'midnight-abyss', 'clean-light'];
    const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    const updated = { ...settings, theme: nextTheme };
    onUpdateSettings(updated);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b backdrop-blur-md bg-slate-950/85 border-slate-800/80 px-3 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Level & Character Info */}
        <div 
          onClick={() => {
            if (onOpenPlayerCard) {
              sounds.playClick();
              onOpenPlayerCard();
            } else {
              onNavigate('progress');
            }
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Open Player Status Card"
        >
          {/* Level Circle */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 shadow-sm group-hover:border-cyan-400 transition-colors">
            <span className="text-xs font-black tracking-tight text-cyan-300">
              LVL <span className="text-sm text-white font-extrabold">{profile.level}</span>
            </span>
          </div>

          <div className="hidden xs:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                {profile.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 font-semibold border border-slate-700">
                {profile.title}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {rank}
            </div>
          </div>
        </div>

        {/* Center: XP Progress Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-6">
          <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
            <span className="text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{profile.currentXP}</span> / <span>{reqXP} XP</span>
            </span>
            <span className="text-slate-400">{xpPercent}%</span>
          </div>
          {/* Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-sm shadow-cyan-500/50 transition-all duration-500 ease-out"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Daily XP, Streak, Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Today XP Badge (Tablet/Desktop) */}
          <div className="hidden sm:flex items-center px-2 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
            +{profile.todayXP} XP today
          </div>

          {/* Streak Flame (Both Desktop & Mobile) */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-950/50 border border-orange-500/40 text-orange-400 text-xs font-black shrink-0"
            title={`${profile.currentStreak} Day Streak`}
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-400 animate-pulse" />
            <span>{profile.currentStreak}</span>
          </div>

          {/* ======================================================== */}
          {/* DESKTOP/TABLET DIRECT CONTROLS (sm: and up) */}
          {/* ======================================================== */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            {/* Streak Shield Anti-Burnout Protection */}
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs font-bold"
              title={`Streak Shields (${shieldsCount}/2): Protects streak from resetting on a missed day`}
            >
              <Shield className={`w-3.5 h-3.5 ${shieldsCount > 0 ? 'fill-blue-400 text-blue-300' : 'text-slate-600'}`} />
              <span>{shieldsCount}</span>
            </div>

            {/* Quick Note Button */}
            <button
              onClick={onOpenQuickNote}
              className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors shadow-sm flex items-center gap-1 text-xs"
              title="Quick Note"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden md:inline">Note</span>
            </button>

            {/* Theme Switcher Toggle */}
            <button
              onClick={handleCycleTheme}
              className="p-2 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              title={`Current Theme: ${settings.theme} (Click to switch)`}
            >
              {settings.theme === 'clean-light' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : settings.theme === 'midnight-abyss' ? (
                <Moon className="w-4 h-4 text-purple-400" />
              ) : (
                <Palette className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            {/* Smartwatch / Health Sync Button */}
            {onOpenSmartwatch && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenSmartwatch();
                }}
                className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                  swState.connected
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-cyan-300 hover:border-cyan-500/40'
                }`}
                title={
                  swState.connected
                    ? `Noise Watch: ${swState.heartRate ? swState.heartRate + ' BPM' : 'Connected'}`
                    : 'Noise Smartwatch & Step Sync'
                }
              >
                <Watch className="w-4 h-4" />
                {swState.connected && swState.heartRate && (
                  <span className="text-[11px] font-mono font-black text-rose-300 hidden md:inline">
                    {swState.heartRate}
                  </span>
                )}
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition-colors ${
                settings.soundEnabled
                  ? 'bg-slate-800/80 text-cyan-400 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
              title={settings.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* ======================================================== */}
          {/* MOBILE QUICK UTILITY BUTTON (< 640px) */}
          {/* ======================================================== */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={() => {
                sounds.playClick();
                setIsMobileUtilityOpen(true);
              }}
              className={`p-2 min-h-[40px] min-w-[40px] rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
                swState.connected
                  ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-sm shadow-rose-500/20'
                  : 'bg-slate-900 border-slate-700/80 text-slate-200 hover:text-cyan-300'
              }`}
              aria-label="Open Mobile Quick Utilities"
              title="Quick Settings & Utilities"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {swState.connected && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE UTILITY DRAWER / POPOVER (< sm) */}
      {/* ======================================================== */}
      {isMobileUtilityOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-slate-950/85 backdrop-blur-md animate-in fade-in sm:hidden">
          <div className="w-full bg-slate-900 border-t border-cyan-500/30 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  <SlidersHorizontal className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">System Utilities</h3>
                  <p className="text-[11px] text-slate-400">Quick controls & device status</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileUtilityOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Quick Scratch Note */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsMobileUtilityOpen(false);
                  onOpenQuickNote();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 text-left active:scale-[0.98] transition-all min-h-[56px]"
              >
                <div className="p-2 rounded-xl bg-cyan-500 text-slate-950 font-bold shrink-0">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Quick Note</span>
                  <span className="text-[10px] text-slate-400">Fast scratchpad</span>
                </div>
              </button>

              {/* Smartwatch Sync */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsMobileUtilityOpen(false);
                  if (onOpenSmartwatch) onOpenSmartwatch();
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left active:scale-[0.98] transition-all min-h-[56px] ${
                  swState.connected
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  swState.connected ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Watch className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Noise Watch</span>
                  <span className="text-[10px] text-slate-400">
                    {swState.connected ? (swState.heartRate ? `${swState.heartRate} BPM` : 'Connected') : 'Pair watch'}
                  </span>
                </div>
              </button>

              {/* Theme Cycler */}
              <button
                onClick={handleCycleTheme}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left active:scale-[0.98] transition-all min-h-[56px]"
              >
                <div className="p-2 rounded-xl bg-purple-950 border border-purple-500/30 text-purple-400 shrink-0">
                  {settings.theme === 'clean-light' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : settings.theme === 'midnight-abyss' ? (
                    <Moon className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Palette className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Theme</span>
                  <span className="text-[10px] text-slate-400 capitalize">{settings.theme.replace('-', ' ')}</span>
                </div>
              </button>

              {/* Sound FX Toggle */}
              <button
                onClick={toggleSound}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left active:scale-[0.98] transition-all min-h-[56px]"
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  settings.soundEnabled ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'
                }`}>
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Sound FX</span>
                  <span className="text-[10px] text-slate-400">{settings.soundEnabled ? 'Enabled (Web Audio)' : 'Muted'}</span>
                </div>
              </button>
            </div>

            {/* Status Summary & Shields */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" /> Streak Shields:
                </span>
                <span className="font-mono font-bold text-blue-300">{shieldsCount}/2 available</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> XP Earned Today:
                </span>
                <span className="font-mono font-bold text-cyan-300">+{profile.todayXP} XP</span>
              </div>
            </div>

            {/* Player Profile Card Button */}
            {onOpenPlayerCard && (
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsMobileUtilityOpen(false);
                  onOpenPlayerCard();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
              >
                <span>View Full Hunter Identity Card</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
