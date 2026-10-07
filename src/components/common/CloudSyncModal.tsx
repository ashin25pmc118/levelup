import React, { useState, useEffect } from 'react';
import {
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  UploadCloud,
  DownloadCloud,
  Key,
  ExternalLink,
  LogOut,
  Sparkles
} from 'lucide-react';
import { gistSync, GistSyncState } from '../../services/githubGistSyncService';
import { sounds } from '../../services/soundEffects';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReloadData?: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose, onReloadData }) => {
  const [gistState, setGistState] = useState<GistSyncState>(gistSync.getState());
  const [gistTokenInput, setGistTokenInput] = useState(gistSync.getConfig().token);
  const [gistIdInput, setGistIdInput] = useState(gistSync.getConfig().gistId || '');
  const [autoSync, setAutoSync] = useState(gistSync.getConfig().autoSync);
  const [gistLoading, setGistLoading] = useState(false);
  const [gistMessage, setGistMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsub = gistSync.subscribe(s => setGistState({ ...s }));
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleConnectGist = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    if (!gistTokenInput.trim()) {
      setGistMessage({ type: 'error', text: 'GitHub Personal Access Token is required.' });
      return;
    }

    setGistLoading(true);
    setGistMessage(null);

    const user = await gistSync.verifyToken(gistTokenInput.trim());
    if (!user) {
      setGistLoading(false);
      setGistMessage({ type: 'error', text: 'Invalid GitHub Token. Please make sure the token has the "gist" scope permission.' });
      return;
    }

    const gistRes = await gistSync.findOrCreateGist(gistTokenInput.trim(), gistIdInput.trim() || undefined);
    setGistLoading(false);

    if (gistRes.success) {
      sounds.playLevelUp();
      setGistMessage({ type: 'success', text: `Connected as @${user.login}! Secret Gist ready.` });
      // Perform initial bi-directional sync
      setTimeout(async () => {
        const syncRes = await gistSync.syncWithGist();
        if (syncRes.updatedLocal && onReloadData) {
          onReloadData();
        }
      }, 300);
    } else {
      sounds.playQuestFail();
      setGistMessage({ type: 'error', text: gistRes.message });
    }
  };

  const handleGistSync = async () => {
    sounds.playClick();
    setGistMessage(null);
    const res = await gistSync.syncWithGist();
    if (res.success) {
      sounds.playLevelUp();
      setGistMessage({ type: 'success', text: res.message });
      if (res.updatedLocal && onReloadData) {
        onReloadData();
      }
    } else {
      sounds.playQuestFail();
      setGistMessage({ type: 'error', text: res.message });
    }
  };

  const handleGistPush = async () => {
    sounds.playClick();
    setGistMessage(null);
    const res = await gistSync.pushToGist();
    if (res.success) {
      sounds.playLevelUp();
      setGistMessage({ type: 'success', text: 'Saved to GitHub Private Gist successfully!' });
    } else {
      sounds.playQuestFail();
      setGistMessage({ type: 'error', text: res.message });
    }
  };

  const handleGistPull = async () => {
    sounds.playClick();
    setGistMessage(null);
    const res = await gistSync.pullFromGist();
    if (res.success) {
      sounds.playLevelUp();
      setGistMessage({ type: 'success', text: 'Latest progress pulled from GitHub Gist!' });
      if (onReloadData) onReloadData();
    } else {
      sounds.playQuestFail();
      setGistMessage({ type: 'error', text: res.message });
    }
  };

  const handleToggleAutoSync = () => {
    sounds.playClick();
    const newAuto = !autoSync;
    setAutoSync(newAuto);
    gistSync.saveConfig({
      ...gistSync.getConfig(),
      autoSync: newAuto
    });
  };

  const handleDisconnectGist = () => {
    sounds.playClick();
    gistSync.disconnect();
    setGistTokenInput('');
    setGistIdInput('');
    setGistMessage({ type: 'success', text: 'Disconnected from GitHub. Local progress remains safe on this device.' });
  };

  const isConnected = gistState.isConfigured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl border ${
              isConnected
                ? 'bg-purple-950/80 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}>
              <GithubIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">GitHub Private Gist Sync</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  isConnected
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isConnected ? '🟢 Connected' : '⚪ Offline / Local'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">100% Free, Private, Version-Controlled Cloud Save</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isConnected ? (
          <form onSubmit={handleConnectGist} className="space-y-4">
            {/* Feature Highlights Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 to-indigo-950/20 border border-purple-500/30 text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Zero Database Setup Needed</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                LevelUp connects directly to your GitHub account to store an encrypted, private save file in a <strong>Secret Gist</strong>.
                No third-party databases, zero hosting fees, and full revision history forever.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2 py-0.5 rounded-lg bg-purple-900/40 border border-purple-500/30 text-[10px] text-purple-200 font-semibold">
                  ✓ 100% Free Forever
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-purple-900/40 border border-purple-500/30 text-[10px] text-purple-200 font-semibold">
                  ✓ Private & Encrypted
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-purple-900/40 border border-purple-500/30 text-[10px] text-purple-200 font-semibold">
                  ✓ Git Revisions
                </span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-400" /> GitHub Personal Access Token
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=gist&description=LevelUp+RPG+Sync"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Create Token (1-Click)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  required
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_..."
                  value={gistTokenInput}
                  onChange={e => setGistTokenInput(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Only requires the <strong>gist</strong> permission checkbox. Never accesses code or repositories.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  Existing Gist ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank to auto-create or auto-find"
                  value={gistIdInput}
                  onChange={e => setGistIdInput(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Syncing a second device? Leave blank to find your existing save automatically, or paste your Gist ID.
                </span>
              </div>
            </div>

            {gistMessage && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                gistMessage.type === 'success' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}>
                {gistMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{gistMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={gistLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {gistLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{gistLoading ? 'Connecting to GitHub...' : 'Connect GitHub Private Gist'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Active Gist Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <GithubIcon className="w-3.5 h-3.5 text-purple-400" /> GitHub Account
                </span>
                <span className="font-mono text-xs font-bold text-purple-300">
                  @{gistState.username || 'Connected'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Private Gist URL</span>
                {gistState.gistUrl ? (
                  <a
                    href={gistState.gistUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>View on GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-500 font-mono">Linked</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Last Synced</span>
                <span className="font-mono text-xs text-slate-300">
                  {gistState.lastSyncedAt
                    ? new Date(gistState.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
                    : 'Never synced'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 font-semibold">Sync Status</span>
                <span className={`flex items-center gap-1 font-bold ${
                  gistState.status === 'syncing' ? 'text-amber-400' : gistState.status === 'error' ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {gistState.status === 'syncing' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {gistState.status === 'synced' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span className="capitalize">{gistState.status}</span>
                </span>
              </div>
            </div>

            {gistMessage && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                gistMessage.type === 'success' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}>
                {gistMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{gistMessage.text}</span>
              </div>
            )}

            {/* Gist Sync Button */}
            <button
              onClick={handleGistSync}
              disabled={gistState.status === 'syncing'}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${gistState.status === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{gistState.status === 'syncing' ? 'Synchronizing Gist...' : 'Sync Now (Bi-Directional)'}</span>
            </button>

            {/* Push / Pull Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleGistPush}
                disabled={gistState.status === 'syncing'}
                className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4 text-purple-400" />
                <span>Push to Gist</span>
              </button>

              <button
                onClick={handleGistPull}
                disabled={gistState.status === 'syncing'}
                className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <DownloadCloud className="w-4 h-4 text-emerald-400" />
                <span>Pull from Gist</span>
              </button>
            </div>

            {/* Auto-Sync Setting */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Auto-Sync on Launch</span>
                <span className="text-[10px] text-slate-400">Automatically sync progress whenever you open the app</span>
              </div>
              <button
                type="button"
                onClick={handleToggleAutoSync}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoSync ? 'bg-purple-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    autoSync ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Disconnect Gist */}
            <button
              onClick={handleDisconnectGist}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-800 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Disconnect GitHub Gist
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
