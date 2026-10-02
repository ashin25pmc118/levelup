import React from 'react';
import { X, Check, Palette, Sun, Moon, Contrast, Sparkles } from 'lucide-react';
import { AppSettings } from '../../types';
import { sounds } from '../../services/soundEffects';
import { haptics } from '../../services/hapticFeedback';

export type AppThemeType = 'cyber-slate' | 'midnight-abyss' | 'clean-light' | 'monochrome-pattern';

interface ThemeOption {
  id: AppThemeType;
  name: string;
  category: 'Dark' | 'Light' | 'OLED' | 'Monochrome';
  description: string;
  swatches: {
    bg: string;
    accent: string;
    border: string;
    text: string;
  };
  icon: React.ComponentType<{ className?: string }>;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'cyber-slate',
    name: 'Cyber Slate',
    category: 'Dark',
    description: 'Futuristic RPG atmosphere with cyan glow & deep navy slate',
    swatches: {
      bg: '#030712',
      accent: '#06b6d4',
      border: '#1e293b',
      text: '#f8fafc'
    },
    icon: Palette
  },
  {
    id: 'clean-light',
    name: 'Clean Light',
    category: 'Light',
    description: 'Ultra-crisp daytime paper mode with bold text & sapphire blue',
    swatches: {
      bg: '#f8fafc',
      accent: '#0284c7',
      border: '#cbd5e1',
      text: '#0f172a'
    },
    icon: Sun
  },
  {
    id: 'midnight-abyss',
    name: 'Midnight Abyss',
    category: 'OLED',
    description: 'Pure pitch black with glowing neon violet, saves battery on OLED',
    swatches: {
      bg: '#000000',
      accent: '#a855f7',
      border: '#27272a',
      text: '#faf5ff'
    },
    icon: Moon
  },
  {
    id: 'monochrome-pattern',
    name: 'Monochrome Pattern',
    category: 'Monochrome',
    description: 'Stark black & white geometric minimalism with tactical dot-grid',
    swatches: {
      bg: '#09090b',
      accent: '#ffffff',
      border: '#3f3f46',
      text: '#ffffff'
    },
    icon: Contrast
  }
];

interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppThemeType;
  onSelectTheme: (theme: AppThemeType) => void;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}) => {
  if (!isOpen) return null;

  const handleSelect = (themeId: AppThemeType) => {
    sounds.playClick();
    haptics.medium();
    onSelectTheme(themeId);
  };

  const isLight = currentTheme === 'clean-light';

  const toggleDayNight = () => {
    if (isLight) {
      handleSelect('cyber-slate');
    } else {
      handleSelect('clean-light');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border-t sm:border border-cyan-500/30 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-slate-700/80 mx-auto -mt-1 mb-2 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Theme & Appearance</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                  4 Themes
                </span>
              </h3>
              <p className="text-xs text-slate-400">Choose your visual aesthetic & day/night mode</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close theme picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Day / Night Switch Banner */}
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${isLight ? 'bg-amber-950/50 border-amber-500/40 text-amber-300' : 'bg-blue-950/50 border-blue-500/40 text-blue-300'}`}>
              {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Quick Mode: {isLight ? 'Day Mode (Light)' : 'Night Mode (Dark)'}
              </span>
              <span className="text-[10px] text-slate-400">
                1-tap switch between Day & Night
              </span>
            </div>
          </div>

          <button
            onClick={toggleDayNight}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 border shadow-sm ${
              isLight
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400'
            }`}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span>Switch to Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5" />
                <span>Switch to Light</span>
              </>
            )}
          </button>
        </div>

        {/* Theme Cards Grid */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> All Themes
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = currentTheme === theme.id;
              const Icon = theme.icon;

              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] relative flex flex-col justify-between min-h-[96px] cursor-pointer group ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-purple-950/30 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  {/* Top row: Name, Category & Check */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: theme.swatches.bg,
                          borderColor: theme.swatches.border,
                          color: theme.swatches.accent
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors">
                          {theme.name}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
                          {theme.category}
                        </span>
                      </div>
                    </div>

                    {/* Active check circle */}
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[10px] text-slate-400 leading-snug mb-2 line-clamp-2">
                    {theme.description}
                  </p>

                  {/* Swatches preview bar */}
                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800/60">
                    <span className="text-[9px] text-slate-500 font-mono">Palette:</span>
                    <div className="flex items-center gap-1">
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-inner"
                        style={{ backgroundColor: theme.swatches.bg }}
                        title="Background"
                      />
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-slate-700"
                        style={{ backgroundColor: theme.swatches.border }}
                        title="Card Border"
                      />
                      <span 
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: theme.swatches.accent }}
                        title="Accent Color"
                      />
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-slate-700"
                        style={{ backgroundColor: theme.swatches.text }}
                        title="Text Color"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Done / Confirm Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer min-h-[44px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
