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
import { sounds } from '../../services/soundEffects';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReloadData?: () => void;
}

const SQL_SETUP_SCRIPT = `-- 1. Create Cloud Sync Table for LevelUp
create table if not exists public.user_cloud_sync (
  user_id uuid references auth.users not null primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  data jsonb not null
);

-- 2. Enable Row Level Security (RLS) for Privacy
alter table public.user_cloud_sync enable row level security;

-- 3. Allow Authenticated Users to Access Only Their Own Data
create policy "Users can manage own sync data"
  on public.user_cloud_sync for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
`;

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose, onReloadData }) => {
  const [syncState, setSyncState] = useState<CloudSyncState>(cloudSync.getState());
  const [config, setConfig] = useState<SupabaseConfig>(cloudSync.getConfig());
  const [activeTab, setActiveTab] = useState<'sync' | 'auth' | 'setup'>('sync');

  // Auth Inputs
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'magic'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Setup Inputs
  const [urlInput, setUrlInput] = useState(config.url);
  const [keyInput, setKeyInput] = useState(config.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    return cloudSync.subscribe(s => {
      setSyncState({ ...s });
    });
  }, []);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg p-5 sm:p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Cloud className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Free Cloud Sync</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  syncState.isAuthenticated
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : syncState.isConfigured
                    ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {syncState.isAuthenticated ? 'Connected & Synced' : syncState.isConfigured ? 'Ready to Login' : 'Unconfigured'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Sync phone & PC seamlessly with 100% Free Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('sync'); }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'sync'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Hub</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('auth'); }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'auth'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{syncState.isAuthenticated ? 'Account' : 'Login / Register'}</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('setup'); }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'setup'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Setup & Keys</span>
          </button>
        </div>

        {/* Tab 1: Sync Hub */}
        {activeTab === 'sync' && (
          <div className="space-y-4">
            {!syncState.isConfigured ? (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Cloud Database Not Connected Yet</span>
                </div>
                <p>
                  To sync between your phone and laptop, click <strong>Setup & Keys</strong> above to link your free Supabase instance.
                </p>
                <button
                  onClick={() => setActiveTab('setup')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors"
                >
                  Configure Free Cloud Sync →
                </button>
              </div>
            ) : !syncState.isAuthenticated ? (
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-cyan-300">
                  <Cloud className="w-4 h-4 text-cyan-400" />
                  <span>Database Ready • Sign In to Sync</span>
                </div>
                <p>
                  Your Supabase credentials are configured. Sign in to your account to link this device.
                </p>
                <button
                  onClick={() => setActiveTab('auth')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors"
                >
                  Sign In to Cloud →
                </button>
              </div>
            ) : (
              <>
                {/* Active Sync Status Card */}
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

                {/* Primary Sync Now Button */}
                <button
                  onClick={handleManualSync}
                  disabled={syncState.status === 'syncing'}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncState.status === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>{syncState.status === 'syncing' ? 'Synchronizing...' : 'Sync Now (Bi-Directional)'}</span>
                </button>

                {/* Granular Push / Pull Buttons */}
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

        {/* Tab 2: Account Login / Register */}
        {activeTab === 'auth' && (
          <div className="space-y-4">
            {syncState.isAuthenticated ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Logged in as {syncState.userEmail}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Your device automatically pulls updates when opened and pushes your latest workouts, timetable, and streaks to Supabase.
                </p>
                <button
                  onClick={() => cloudSync.signOut()}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {/* Sub-tabs for Login vs Signup vs Magic Link */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { sounds.playClick(); setAuthMode('login'); }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                      authMode === 'login' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => { sounds.playClick(); setAuthMode('signup'); }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                      authMode === 'signup' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => { sounds.playClick(); setAuthMode('magic'); }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                      authMode === 'magic' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Magic Link
                  </button>
                </div>

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
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {authLoading ? 'Processing...' : authMode === 'login' ? 'Log In to Sync' : authMode === 'signup' ? 'Create Account & Push Data' : 'Send Magic Link'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 3: Setup & Keys */}
        {activeTab === 'setup' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> How to get your 100% Free Supabase Database:
              </span>
              <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                <li>Create a free account at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a>.</li>
                <li>Create a new project (e.g. <em>LevelUp-Sync</em>).</li>
                <li>Go to <strong>Project Settings $\rightarrow$ API</strong> to find your <strong>Project URL</strong> and <strong>Anon Public Key</strong>.</li>
                <li>Paste them below and copy-paste the SQL script into Supabase's SQL Editor.</li>
              </ol>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzabcdefg.supabase.co"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Supabase Anon Public Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveSetup}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md transition-all active:scale-95"
                >
                  Save Credentials
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                >
                  Test Connection
                </button>
              </div>

              {testResult && (
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  testResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            {/* SQL Table Creator Helper */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Supabase SQL Schema (Run Once):</span>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold transition-colors"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300/80 overflow-x-auto">
                {SQL_SETUP_SCRIPT}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
