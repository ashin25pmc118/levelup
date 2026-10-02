import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  Shield,
  UploadCloud,
  DownloadCloud,
  Key,
  Database,
  ExternalLink,
  LogOut,
  Mail,
  Lock,
  Sparkles
} from 'lucide-react';
import { cloudSync, CloudSyncState, SupabaseConfig } from '../../services/supabaseService';
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

const SQL_SETUP_SCRIPT = `-- 1. Create Cloud Sync Table for LevelUp (Supports Email & Passcode Sync)
create table if not exists public.user_cloud_sync (
  user_id text primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  data jsonb not null
);

-- 2. Enable Row Level Security (RLS) for Privacy
alter table public.user_cloud_sync enable row level security;

-- 3. Allow Access to Sync Row
create policy "Allow all users to manage sync row"
  on public.user_cloud_sync for all
  using (true)
  with check (true);
`;

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose, onReloadData }) => {
  // Provider Choice: GitHub Private Gist (Default) or Supabase Database
  const [provider, setProvider] = useState<'gist' | 'supabase'>(() => {
    return gistSync.getState().isConfigured ? 'gist' : 'gist';
  });

  // GitHub Gist State
  const [gistState, setGistState] = useState<GistSyncState>(gistSync.getState());
  const [gistTokenInput, setGistTokenInput] = useState(gistSync.getConfig().token);
  const [gistIdInput, setGistIdInput] = useState(gistSync.getConfig().gistId || '');
  const [gistLoading, setGistLoading] = useState(false);
  const [gistMessage, setGistMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Supabase State
  const [syncState, setSyncState] = useState<CloudSyncState>(cloudSync.getState());
  const [config, setConfig] = useState<SupabaseConfig>(cloudSync.getConfig());
  const [activeTab, setActiveTab] = useState<'sync' | 'auth' | 'setup'>('sync');

  // Supabase Auth Inputs
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'magic' | 'passcode'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState(cloudSync.getPasscode() || '');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Supabase Setup Inputs
  const [urlInput, setUrlInput] = useState(config.url);
  const [keyInput, setKeyInput] = useState(config.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const unsubGist = gistSync.subscribe(s => setGistState({ ...s }));
    const unsubCloud = cloudSync.subscribe(s => setSyncState({ ...s }));
    return () => {
      unsubGist();
      unsubCloud();
    };
  }, []);

  if (!isOpen) return null;

  // ==========================================
  // GITHUB GIST ACTIONS
  // ==========================================
  const handleConnectGist = async (e: React.FormEvent) => {
    e.preventDefault();
    setGistLoading(true);
    setGistMessage(null);
    sounds.playClick();

    const res = await gistSync.findOrCreateGist(gistTokenInput, gistIdInput);
    setGistLoading(false);

    if (res.success) {
      setGistMessage({ type: 'success', text: res.message });
      if (onReloadData) onReloadData();
    } else {
      setGistMessage({ type: 'error', text: res.message });
    }
  };

  const handleGistSync = async () => {
    sounds.playClick();
    const res = await gistSync.syncWithGist();
    if (res.success) {
      setGistMessage({ type: 'success', text: res.message });
      if (res.updatedLocal && onReloadData) {
        onReloadData();
      }
    } else {
      setGistMessage({ type: 'error', text: res.message });
    }
  };

  const handleGistPush = async () => {
    sounds.playClick();
    const res = await gistSync.pushToGist();
    if (res.success) {
      setGistMessage({ type: 'success', text: res.message });
    } else {
      setGistMessage({ type: 'error', text: res.message });
    }
  };

  const handleGistPull = async () => {
    sounds.playClick();
    const res = await gistSync.pullFromGist();
    if (res.success) {
      setGistMessage({ type: 'success', text: res.message });
      if (onReloadData) onReloadData();
    } else {
      setGistMessage({ type: 'error', text: res.message });
    }
  };

  const handleDisconnectGist = () => {
    sounds.playClick();
    gistSync.disconnect();
    setGistTokenInput('');
    setGistIdInput('');
    setGistMessage(null);
  };

  // ==========================================
  // SUPABASE ACTIONS
  // ==========================================
  const handleManualSync = async () => {
    sounds.playClick();
    const res = await cloudSync.syncWithCloud();
    if (res.success && res.updatedLocal && onReloadData) {
      onReloadData();
    }
  };

  const handlePush = async () => {
    sounds.playClick();
    await cloudSync.pushToCloud();
  };

  const handlePull = async () => {
    sounds.playClick();
    const res = await cloudSync.pullFromCloud();
    if (res.success && onReloadData) {
      onReloadData();
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);
    sounds.playClick();

    if (authMode === 'passcode') {
      const res = await cloudSync.connectWithPasscode(passcode);
      setAuthLoading(false);
      if (res.success) {
        setAuthMessage({ type: 'success', text: res.message });
        if (onReloadData) onReloadData();
        setTimeout(() => setActiveTab('sync'), 800);
      } else {
        setAuthMessage({ type: 'error', text: res.message });
      }
      return;
    }

    if (authMode === 'login') {
      const res = await cloudSync.signIn(email, password);
      setAuthLoading(false);
      if (res.success) {
        setAuthMessage({ type: 'success', text: res.message });
        if (onReloadData) onReloadData();
        setTimeout(() => setActiveTab('sync'), 800);
      } else {
        setAuthMessage({ type: 'error', text: res.message });
      }
    } else if (authMode === 'signup') {
      const res = await cloudSync.signUp(email, password);
      setAuthLoading(false);
      if (res.success) {
        setAuthMessage({ type: 'success', text: res.message });
        setTimeout(() => setActiveTab('sync'), 800);
      } else {
        setAuthMessage({ type: 'error', text: res.message });
      }
    } else {
      const res = await cloudSync.signInWithOtp(email);
      setAuthLoading(false);
      if (res.success) {
        setAuthMessage({ type: 'success', text: res.message });
      } else {
        setAuthMessage({ type: 'error', text: res.message });
      }
    }
  };

  const handleSaveSetup = () => {
    sounds.playClick();
    const newConfig = { ...config, url: urlInput.trim(), anonKey: keyInput.trim() };
    const success = cloudSync.saveConfig(newConfig);
    setConfig(newConfig);
    if (success) {
      setTestResult({ success: true, message: 'Configuration saved! Now log in to start syncing.' });
      setTimeout(() => setActiveTab('auth'), 1000);
    } else {
      setTestResult({ success: false, message: 'Invalid URL or Key format.' });
    }
  };

  const handleTestConnection = async () => {
    sounds.playClick();
    const res = await cloudSync.testConnection();
    setTestResult(res);
  };

  const handleCopySql = () => {
    sounds.playClick();
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isConnected = gistState.isConfigured || syncState.isAuthenticated;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl border ${
              isConnected
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Cloud Sync Hub</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  isConnected
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isConnected ? '🟢 Connected' : '⚪ Offline / Local'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Sync phone & PC with zero recurring costs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloud Provider Switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => { sounds.playClick(); setProvider('gist'); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              provider === 'gist'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub Private Gist</span>
            {gistState.isConfigured && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          </button>

          <button
            type="button"
            onClick={() => { sounds.playClick(); setProvider('supabase'); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              provider === 'supabase'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Cloud</span>
            {syncState.isAuthenticated && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          </button>
        </div>

        {/* ======================================================== */}
        {/* PROVIDER A: GITHUB PRIVATE GIST (RECOMMENDED) */}
        {/* ======================================================== */}
        {provider === 'gist' && (
          <div className="space-y-4">
            {!gistState.isConfigured ? (
              <form onSubmit={handleConnectGist} className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-purple-300">
                    <GithubIcon className="w-4 h-4 text-purple-400" />
                    <span>Free GitHub Private Gist Sync</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Uses your own GitHub account to store a private, encrypted save file. 
                    No database setup, no SQL queries, and full Git revision history forever!
                  </p>
                </div>

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
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Token only needs the <strong>gist</strong> permission checkbox. Never touches code or repositories.
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
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                    />
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
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {gistLoading ? 'Connecting to GitHub...' : 'Connect GitHub Private Gist'}
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
                        <span>Open on GitHub</span>
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

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
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
                    className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95"
                  >
                    <UploadCloud className="w-4 h-4 text-purple-400" />
                    <span>Push to Gist</span>
                  </button>

                  <button
                    onClick={handleGistPull}
                    disabled={gistState.status === 'syncing'}
                    className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95"
                  >
                    <DownloadCloud className="w-4 h-4 text-emerald-400" />
                    <span>Pull from Gist</span>
                  </button>
                </div>

                {/* Disconnect Gist */}
                <button
                  onClick={handleDisconnectGist}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-800"
                >
                  <LogOut className="w-4 h-4" /> Disconnect GitHub Gist
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PROVIDER B: SUPABASE POSTGRESQL CLOUD */}
        {/* ======================================================== */}
        {provider === 'supabase' && (
          <div className="space-y-4">
            {/* Supabase Sub-Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => { sounds.playClick(); setActiveTab('sync'); }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'sync' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Hub</span>
              </button>

              <button
                onClick={() => { sounds.playClick(); setActiveTab('auth'); }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'auth' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>{syncState.isAuthenticated ? 'Account' : 'Login / Passcode'}</span>
              </button>

              <button
                onClick={() => { sounds.playClick(); setActiveTab('setup'); }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'setup' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Setup & Keys</span>
              </button>
            </div>

            {/* Supabase Tab 1: Sync Hub */}
            {activeTab === 'sync' && (
              <div className="space-y-4">
                {!syncState.isConfigured ? (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Supabase Not Configured Yet</span>
                    </div>
                    <p>
                      Click <strong>Setup & Keys</strong> above to link your free Supabase instance.
                    </p>
                    <button
                      onClick={() => setActiveTab('setup')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors"
                    >
                      Configure Keys →
                    </button>
                  </div>
                ) : !syncState.isAuthenticated ? (
                  <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-cyan-300">
                      <Cloud className="w-4 h-4 text-cyan-400" />
                      <span>Database Ready • Sign In or Enter Passcode</span>
                    </div>
                    <p>
                      Your credentials are saved. Choose Login, Register, or Passcode to link this device.
                    </p>
                    <button
                      onClick={() => setActiveTab('auth')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors"
                    >
                      Sign In or Use Passcode →
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-semibold">Active Account</span>
                        <span className="font-mono text-xs font-bold text-cyan-300">{syncState.userEmail}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold">Last Cloud Sync</span>
                        <span className="font-mono text-xs text-slate-300">
                          {syncState.lastSyncedAt
                            ? new Date(syncState.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
                            : 'Never synced'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                        <span className="text-slate-400 font-semibold">Sync Status</span>
                        <span className={`flex items-center gap-1 font-bold ${
                          syncState.status === 'syncing' ? 'text-amber-400' : syncState.status === 'error' ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {syncState.status === 'syncing' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          {syncState.status === 'synced' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span className="capitalize">{syncState.status}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleManualSync}
                      disabled={syncState.status === 'syncing'}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncState.status === 'syncing' ? 'animate-spin' : ''}`} />
                      <span>{syncState.status === 'syncing' ? 'Synchronizing...' : 'Sync Now (Bi-Directional)'}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={handlePush}
                        disabled={syncState.status === 'syncing'}
                        className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95"
                      >
                        <UploadCloud className="w-4 h-4 text-cyan-400" />
                        <span>Push to Cloud</span>
                      </button>

                      <button
                        onClick={handlePull}
                        disabled={syncState.status === 'syncing'}
                        className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95"
                      >
                        <DownloadCloud className="w-4 h-4 text-emerald-400" />
                        <span>Pull from Cloud</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Supabase Tab 2: Account Login / Register / Passcode */}
            {activeTab === 'auth' && (
              <div className="space-y-4">
                {syncState.isAuthenticated ? (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Connected as {syncState.userEmail}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Your device automatically syncs timetable, habits, and workouts with Supabase.
                    </p>
                    <button
                      onClick={() => cloudSync.signOut()}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Disconnect / Sign Out
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => { sounds.playClick(); setAuthMode('login'); }}
                        className={`py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                          authMode === 'login' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        Log In
                      </button>
                      <button
                        type="button"
                        onClick={() => { sounds.playClick(); setAuthMode('signup'); }}
                        className={`py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                          authMode === 'signup' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        Register
                      </button>
                      <button
                        type="button"
                        onClick={() => { sounds.playClick(); setAuthMode('magic'); }}
                        className={`py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                          authMode === 'magic' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        Magic Link
                      </button>
                      <button
                        type="button"
                        onClick={() => { sounds.playClick(); setAuthMode('passcode'); }}
                        className={`py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                          authMode === 'passcode' ? 'bg-purple-950 text-purple-300 border-purple-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        Passcode
                      </button>
                    </div>

                    {authMode === 'passcode' ? (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-purple-400" /> Secret Sync Passcode / Key
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ashin-secret-sync"
                          value={passcode}
                          onChange={e => setPasscode(e.target.value)}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                        />
                        <p className="text-[11px] text-slate-400 leading-snug">
                          No email or password needed! Enter the <strong>exact same passcode</strong> on your phone and PC to sync your data.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        {authMode !== 'magic' && (
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="••••••••••••"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {authMessage && (
                      <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                        authMessage.type === 'success' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                      }`}>
                        {authMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                        <span>{authMessage.text}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {authLoading
                        ? 'Processing...'
                        : authMode === 'passcode'
                        ? 'Connect with Passcode'
                        : authMode === 'login'
                        ? 'Log In to Sync'
                        : authMode === 'signup'
                        ? 'Create Account & Push Data'
                        : 'Send Magic Link'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Supabase Tab 3: Setup & Keys */}
            {activeTab === 'setup' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> How to get your 100% Free Supabase Database:
                  </span>
                  <ol className="list-decimal list-inside text-slate-300 space-y-1 text-[11px]">
                    <li>Sign up free at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">supabase.com</a> (No credit card).</li>
                    <li>Create a new project (Takes 60 seconds).</li>
                    <li>Go to <strong>SQL Editor</strong> $\to$ Paste the table script below $\to$ Click Run.</li>
                    <li>Go to <strong>Project Settings $\to$ API</strong> and copy your URL & Anon Key.</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Project URL</label>
                    <input
                      type="text"
                      placeholder="https://xyzprojectid.supabase.co"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Anon Public Key</label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={keyInput}
                      onChange={e => setKeyInput(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleTestConnection}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
                  >
                    Test Connection
                  </button>
                  <button
                    onClick={handleSaveSetup}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                  >
                    Save Configuration
                  </button>
                </div>

                {testResult && (
                  <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                    testResult.success ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {/* SQL Script Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-cyan-400" /> PostgreSQL SQL Script
                    </span>
                    <button
                      onClick={handleCopySql}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy SQL'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto">
                    {SQL_SETUP_SCRIPT}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
