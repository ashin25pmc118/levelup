import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  FileCode,
  Save,
  Volume2,
  VolumeX,
  RefreshCw,
  Check,
  AlertTriangle,
  Sparkles,
  Shield,
  Dumbbell,
  Palette
} from 'lucide-react';
import { UserProfile, AppSettings, Exercise } from '../../../types';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';
import { THEME_OPTIONS, AppThemeType } from '../../common/ThemePickerModal';

interface SettingsViewProps {
  profile: UserProfile;
  settings: AppSettings;
  exercises: Exercise[];
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onReloadAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  settings,
  exercises,
  onUpdateProfile,
  onUpdateSettings,
  onReloadAllData
}) => {
  // Profile state
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [wakeTime, setWakeTime] = useState(profile.wakeTime);
  const [sleepTime, setSleepTime] = useState(profile.sleepTime);

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [volume, setVolume] = useState(settings.soundVolume);

  // JSON Management State (USER REQUIREMENT)
  const [jsonText, setJsonText] = useState('');
  const [jsonStatus, setJsonStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Handle Export Full Backup
  const handleExportFullBackup = () => {
    sounds.playClick();
    const jsonStr = storage.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `levelup_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setJsonStatus({ type: 'success', message: 'Full RPG JSON Backup exported successfully!' });
  };

  // Handle Upload JSON File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playClick();
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (!content) return;

      const result = storage.importFullBackup(content);
      if (result.success) {
        setJsonStatus({ type: 'success', message: result.message });
        onReloadAllData();
      } else {
        setJsonStatus({ type: 'error', message: result.message });
      }
    };
    reader.readAsText(file);
  };

  // Handle Live JSON Editor
  const handleOpenLiveEditor = () => {
    sounds.playClick();
    const currentJson = storage.exportFullBackup();
    setJsonText(currentJson);
    setIsEditorOpen(true);
    setJsonStatus({ type: 'idle', message: '' });
  };

  const handleApplyJsonEditor = () => {
    sounds.playClick();
    const result = storage.importFullBackup(jsonText);
    if (result.success) {
      setJsonStatus({ type: 'success', message: 'Changes applied directly to database!' });
      onReloadAllData();
      setIsEditorOpen(false);
    } else {
      setJsonStatus({ type: 'error', message: result.message });
    }
  };

  // Handle Exercise Presets Export
  const handleExportExercises = () => {
    sounds.playClick();
    const jsonStr = storage.exportExercisesJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `levelup_exercises_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setJsonStatus({ type: 'success', message: 'Exercises JSON exported!' });
  };

  // Handle Exercise Presets Upload
  const handleUploadExercises = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playClick();
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (!content) return;

      const result = storage.importExercisesJson(content);
      if (result.success) {
        setJsonStatus({ type: 'success', message: result.message });
        onReloadAllData();
      } else {
        setJsonStatus({ type: 'error', message: result.message });
      }
    };
    reader.readAsText(file);
  };

  // Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    const updated: UserProfile = {
      ...profile,
      name: name.trim(),
      title,
      wakeTime,
      sleepTime
    };
    storage.saveProfile(updated);
    onUpdateProfile(updated);
    setJsonStatus({ type: 'success', message: 'Profile updated successfully!' });
  };

  // Save Audio & System Settings
  const handleSaveSettings = () => {
    sounds.playClick();
    const updated: AppSettings = {
      ...settings,
      soundEnabled,
      soundVolume: volume
    };
    sounds.setSettings(soundEnabled, volume);
    storage.saveSettings(updated);
    onUpdateSettings(updated);
    if (soundEnabled) sounds.playQuestComplete();
  };

  const handleSelectTheme = (newTheme: AppThemeType) => {
    sounds.playClick();
    const updated: AppSettings = {
      ...settings,
      theme: newTheme
    };
    storage.saveSettings(updated);
    onUpdateSettings(updated);
    setJsonStatus({ type: 'success', message: `Theme switched to ${newTheme.replace('-', ' ').toUpperCase()}!` });
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all progress and restore default initial starter data?')) {
      sounds.playClick();
      storage.resetToDefaults();
      onReloadAllData();
      setJsonStatus({ type: 'success', message: 'Data reset to defaults.' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700">
              <Settings className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">System Config & Settings</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Customize themes & appearance, export/upload JSON backups, modify exercises, or calibrate audio.
          </p>
        </div>
      </div>

      {/* Status Alert Banner */}
      {jsonStatus.message && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            jsonStatus.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/60 border-red-500/40 text-red-300'
          }`}
        >
          {jsonStatus.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{jsonStatus.message}</span>
        </div>
      )}

      {/* THEME & VISUAL APPEARANCE HUB (CRITICAL USER ACCESSIBILITY) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Palette className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Theme & Visual Appearance</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20 capitalize">
                  {settings.theme.replace('-', ' ')} Active
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Choose your preferred interface theme and day/night contrast mode.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = settings.theme === theme.id;
            const Icon = theme.icon;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(theme.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] relative flex flex-col justify-between min-h-[110px] cursor-pointer group ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-purple-950/30 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
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

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 leading-snug mb-2 line-clamp-2">
                  {theme.description}
                </p>

                <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800/60">
                  <span className="text-[9px] text-slate-500 font-mono">Palette:</span>
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: theme.swatches.bg }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: theme.swatches.border }} />
                    <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: theme.swatches.accent }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: theme.swatches.text }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* JSON DATA MANAGEMENT & EXERCISE MODIFIER (CRITICAL USER REQUIREMENT) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileCode className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold text-white">JSON Data & Exercise Hub</h3>
            <p className="text-xs text-slate-400">
              Download your full game state, upload modified JSON files, or live-edit stats and exercises.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action 1: Export Full Backup */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                <Download className="w-3.5 h-3.5 text-cyan-400" /> Export Full Game JSON
              </h4>
              <p className="text-[11px] text-slate-400">
                Downloads a clean, structured JSON file containing your profile, timetable, quests, exercises, and logs.
              </p>
            </div>
            <button
              onClick={handleExportFullBackup}
              className="mt-3 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 stroke-[3]" /> Download Full Backup (.json)
            </button>
          </div>

          {/* Action 2: Upload Full Backup */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                <Upload className="w-3.5 h-3.5 text-purple-400" /> Upload JSON Game File
              </h4>
              <p className="text-[11px] text-slate-400">
                Upload a previously saved or modified JSON file to update your stats, timetable, or quests instantly.
              </p>
            </div>
            <label className="mt-3 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center shadow-sm">
              <Upload className="w-3.5 h-3.5 stroke-[3]" /> Select JSON File to Upload
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Action 3: Live In-Browser JSON Editor */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                <FileCode className="w-3.5 h-3.5 text-amber-400" /> Live JSON Code Editor
              </h4>
              <p className="text-[11px] text-slate-400">
                Directly inspect and modify raw JSON in browser with instant syntax validation.
              </p>
            </div>
            <button
              onClick={handleOpenLiveEditor}
              className="mt-3 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <FileCode className="w-3.5 h-3.5 stroke-[3]" /> Open Live JSON Editor
            </button>
          </div>

          {/* Action 4: Exercise Presets Export & Upload */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                <Dumbbell className="w-3.5 h-3.5 text-orange-400" /> Exercise Presets JSON
              </h4>
              <p className="text-[11px] text-slate-400">
                Export or upload customized exercise lists ({exercises.length} current exercises).
              </p>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleExportExercises}
                className="flex-1 py-2 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-300 font-bold text-xs border border-slate-700"
              >
                Export Exercises
              </button>
              <label className="flex-1 py-2 px-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs text-center cursor-pointer">
                Upload Exercises
                <input
                  type="file"
                  accept=".json"
                  onChange={handleUploadExercises}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Live Code Editor Modal */}
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="w-full max-w-3xl p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" /> Live JSON Database Editor
                </h3>
                <span className="text-[10px] text-slate-400">
                  Carefully edit keys and click "Apply Changes"
                </span>
              </div>

              <textarea
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                rows={18}
                className="w-full my-3 p-3 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 focus:border-cyan-500 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyJsonEditor}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Apply JSON Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audio & Sound FX Settings */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">
          Audio & Haptics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Synthesized RPG Audio</h4>
              <p className="text-[11px] text-slate-400">
                Chimes for quest completions and level-up fanfare.
              </p>
            </div>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                sounds.setSettings(!soundEnabled, volume);
              }}
              className={`p-2.5 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Volume Level</span>
              <span className="text-cyan-400">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                sounds.setSettings(soundEnabled, val);
              }}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700"
        >
          Save Audio Calibration
        </button>
      </div>

      {/* Profile & Identity Settings */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">
          Character Identity & Routine
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Character Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Class Title</label>
              <select
                value={title}
                onChange={e => setTitle(e.target.value as typeof title)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white"
              >
                <option value="Apprentice">Apprentice</option>
                <option value="Mind Seeker">Mind Seeker</option>
                <option value="Iron Striker">Iron Striker</option>
                <option value="Shadow Scholar">Shadow Scholar</option>
                <option value="Calm Sovereign">Calm Sovereign</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Target Wake Up</label>
              <input
                type="time"
                value={wakeTime}
                onChange={e => setWakeTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Target Sleep</label>
              <input
                type="time"
                value={sleepTime}
                onChange={e => setSleepTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
          >
            Save Character Profile
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-red-300">Reset to Defaults</h4>
          <p className="text-[11px] text-slate-400">
            Resets all local records and restores starter quests and templates.
          </p>
        </div>
        <button
          onClick={handleResetDefaults}
          className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-bold border border-red-700 transition-colors"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
};
