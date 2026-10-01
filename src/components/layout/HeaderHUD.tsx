import React from 'react';
import { Volume2, VolumeX, Flame, Plus, Shield, Sparkles, Sun, Moon, Palette } from 'lucide-react';
import { UserProfile, AppSettings } from '../../types';
import { getRequiredXPForLevel, getRankTier } from '../../services/rpgEngine';
import { sounds } from '../../services/soundEffects';

interface HeaderHUDProps {
  profile: UserProfile;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenQuickNote: () => void;
  onNavigate: (tab: string) => void;
  onOpenPlayerCard?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  profile,
  settings,
  onUpdateSettings,
  onOpenQuickNote,
  onNavigate,
  onOpenPlayerCard
}) => {
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
          {/* Today XP Badge */}
          <div className="hidden sm:flex items-center px-2 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
            +{profile.todayXP} XP today
          </div>

          {/* Streak Flame */}
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-950/40 border border-orange-500/30 text-orange-400 text-xs font-bold"
            title={`${profile.currentStreak} Day Streak`}
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-400 animate-pulse" />
            <span>{profile.currentStreak}</span>
          </div>

          {/* Streak Shield Anti-Burnout Protection */}
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs font-bold"
            title={`Streak Shields (${shieldsCount}/2): Automatically protects streak from resetting on a missed day`}
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
      </div>
    </header>
  );
};
