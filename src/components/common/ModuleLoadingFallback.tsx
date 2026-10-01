import React from 'react';
import { Loader2 } from 'lucide-react';

export const ModuleLoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading module...' }) => {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 animate-pulse">
      <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mb-3 shadow-lg shadow-cyan-950/40">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
      <p className="text-xs font-bold text-slate-300 tracking-wider uppercase">{message}</p>
      <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
        <div className="w-1/2 h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-[shimmer_1.5s_infinite]" />
      </div>
    </div>
  );
};
