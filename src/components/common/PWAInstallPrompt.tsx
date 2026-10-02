import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { haptics } from '../../services/hapticFeedback';
import { BrandLogo } from './BrandLogo';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('pwa_prompt_dismissed') === 'true';
  });

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!deferredPrompt || isDismissed) return null;

  const handleInstall = async () => {
    sounds.playLevelUp();
    haptics.success();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    sounds.playClick();
    setIsDismissed(true);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-sm p-3.5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-slate-100 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-2.5">
        <BrandLogo size="sm" glow />
        <div>
          <h4 className="text-xs font-bold text-white">Install Level Up App</h4>
          <p className="text-[10px] text-slate-400">Offline mode, fast launch & fullscreen</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
