import React, { useState, useEffect } from 'react';
import { storage } from './services/storageService';
import { sounds } from './services/soundEffects';
import { processXPGain, checkAchievements } from './services/rpgEngine';
import {
  UserProfile,
  TimetableTemplate,
  TimetableEvent,
  DateModeMapping,
  Exercise,
  DailyQuest,
  ConfidenceQuest,
  Skill,
  Note,
  Reminder,
  Achievement,
  WeeklyReview,
  XPTransaction,
  AppSettings,
  StatType
} from './types';

// Layout
import { HeaderHUD } from './components/layout/HeaderHUD';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MoreMenuModal } from './components/layout/MoreMenuModal';

// Modals & Boundaries
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LevelUpModal } from './components/common/LevelUpModal';
import { QuickNoteModal } from './components/common/QuickNoteModal';
import { PlayerStatusCardModal } from './components/common/PlayerStatusCardModal';
import { SmartwatchSyncModal } from './components/common/SmartwatchSyncModal';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import { OnboardingWizard } from './components/modules/onboarding/OnboardingWizard';

// Modules
import { DashboardView } from './components/modules/dashboard/DashboardView';
import { TimetableModule } from './components/modules/timetable/TimetableModule';
import { TrainModule } from './components/modules/train/TrainModule';
import { FocusModule } from './components/modules/focus/FocusModule';
import { QuestsModule } from './components/modules/quests/QuestsModule';
import { ConfidenceModule } from './components/modules/confidence/ConfidenceModule';
import { SkillsModule } from './components/modules/skills/SkillsModule';
import { NotesModule } from './components/modules/notes/NotesModule';
import { RemindersModule } from './components/modules/reminders/RemindersModule';
import { ProgressView } from './components/modules/progress/ProgressView';
import { CalendarView } from './components/modules/calendar/CalendarView';
import { SettingsView } from './components/modules/settings/SettingsView';

interface SystemToast {
  id: string;
  type: 'xp' | 'achievement' | 'stat';
  title: string;
  description: string;
  amount?: number;
  stat?: string;
}

export function App() {
  // App state
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [templates, setTemplates] = useState<TimetableTemplate[]>(() => storage.getTemplates());
  const [events, setEvents] = useState<TimetableEvent[]>(() => storage.getEvents());
  const [dateModes, setDateModes] = useState<DateModeMapping[]>(() => storage.getDateModes());
  const [exercises, setExercises] = useState<Exercise[]>(() => storage.getExercises());
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(() => storage.getDailyQuests());
  const [confidenceQuests, setConfidenceQuests] = useState<ConfidenceQuest[]>(() => storage.getConfidenceQuests());
  const [skills, setSkills] = useState<Skill[]>(() => storage.getSkills());
  const [notes, setNotes] = useState<Note[]>(() => storage.getNotes());
  const [reminders, setReminders] = useState<Reminder[]>(() => storage.getReminders());
  const [achievements, setAchievements] = useState<Achievement[]>(() => storage.getAchievements());
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>(() => storage.getWeeklyReviews());
  const [xpTransactions, setXpTransactions] = useState<XPTransaction[]>(() => storage.getXPTransactions());
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());

  // UI state
  const [currentTab, setCurrentTab] = useState<string>('today');
  const [trainSubTab, setTrainSubTab] = useState<'today' | 'skills' | 'library' | 'roadmap' | 'benchmarks' | 'classic' | 'eyecare' | 'reflex'>('today');

  const handleNavigate = (tab: string, subTab?: string) => {
    setCurrentTab(tab);
    if (tab === 'train' && subTab) {
      setTrainSubTab(subTab as any);
    }
  };

  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false);
  const [isSmartwatchOpen, setIsSmartwatchOpen] = useState(false);
  const [toasts, setToasts] = useState<SystemToast[]>([]);
  const [levelUpProfile, setLevelUpProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !settings.onboardingCompleted);

  const addToast = (toast: Omit<SystemToast, 'id'>) => {
    const newToast: SystemToast = { ...toast, id: `toast_${Date.now()}_${Math.random()}` };
    setToasts(prev => [newToast, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 3800);
  };

  // Initialize sound settings
  useEffect(() => {
    sounds.setSettings(settings.soundEnabled, settings.soundVolume);
  }, [settings]);

  // Reload all data from storage (called after JSON upload/editor apply/restore)
  const reloadAllData = () => {
    setProfile(storage.getProfile());
    setTemplates(storage.getTemplates());
    setEvents(storage.getEvents());
    setDateModes(storage.getDateModes());
    setExercises(storage.getExercises());
    setDailyQuests(storage.getDailyQuests());
    setConfidenceQuests(storage.getConfidenceQuests());
    setSkills(storage.getSkills());
    setNotes(storage.getNotes());
    setReminders(storage.getReminders());
    setAchievements(storage.getAchievements());
    setWeeklyReviews(storage.getWeeklyReviews());
    setXpTransactions(storage.getXPTransactions());
    const s = storage.getSettings();
    setSettings(s);
    sounds.setSettings(s.soundEnabled, s.soundVolume);
  };

  // Central RPG XP Awarding & Achievement check
  const handleAwardXP = (amount: number, description: string, stat: StatType | StatType[]) => {
    const result = processXPGain(profile, amount, stat, settings.dailyXpSoftCap);
    const primaryStat = Array.isArray(stat) ? stat[0] : stat;

    // Save transaction
    const tx: XPTransaction = {
      id: `tx_${Date.now()}`,
      timestamp: new Date().toISOString(),
      amount: result.actualXpAdded,
      source: 'quest',
      description,
      statTarget: primaryStat
    };
    storage.addXPTransaction(tx);
    const updatedTxs = [tx, ...xpTransactions];
    setXpTransactions(updatedTxs);

    // Check achievements
    const achResult = checkAchievements(result.updatedProfile, achievements, updatedTxs);
    if (achResult.newlyUnlocked.length > 0) {
      storage.saveAchievements(achResult.updatedAchievements);
      setAchievements(achResult.updatedAchievements);
      achResult.newlyUnlocked.forEach(ach => {
        addToast({
          type: 'achievement',
          title: 'ACHIEVEMENT UNLOCKED',
          description: `${ach.icon} ${ach.name}: ${ach.description}`
        });
      });
    }

    // Save profile
    storage.saveProfile(result.updatedProfile);
    setProfile(result.updatedProfile);

    // Alert if Streak Shield was consumed
    if (result.shieldUsed) {
      addToast({
        type: 'stat',
        title: '🛡️ STREAK SHIELD USED',
        description: 'Yesterday was missed, but your streak was protected!',
        stat: 'discipline'
      });
    }

    // Floating System Toast
    addToast({
      type: 'xp',
      title: result.leveledUp ? 'LEVEL UP!' : `+${result.actualXpAdded} XP`,
      description,
      amount: result.actualXpAdded,
      stat: Array.isArray(stat) ? stat.join(' + ') : stat
    });

    // Level up trigger with haptic feedback
    if (result.leveledUp) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([40, 60, 40, 60, 100]); } catch {}
      }
      setLevelUpProfile(result.updatedProfile);
    } else {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(25); } catch {}
      }
      sounds.playQuestComplete();
    }
  };

  // Toggle Daily Quest
  const handleToggleDailyQuest = (questId: string) => {
    const updated = dailyQuests.map(q => {
      if (q.id === questId) {
        const nextState = !q.isCompleted;
        if (nextState) {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try { navigator.vibrate([15, 25, 15]); } catch {}
          }
          handleAwardXP(q.targetXp, `Completed Quest: ${q.title}`, q.statTarget || 'discipline');
          return { ...q, isCompleted: true, completedAt: new Date().toISOString() };
        } else {
          sounds.playClick();
          return { ...q, isCompleted: false, completedAt: undefined };
        }
      }
      return q;
    });

    storage.saveDailyQuests(updated);
    setDailyQuests(updated);
  };

  // Active timetable calculations for Dashboard
  const todayStr = React.useMemo(() => new Date().toISOString().split('T')[0], []);
  const dateMapping = dateModes.find(m => m.date === todayStr);
  const defaultTemplate = templates.find(t => t.isDefault) || templates[0];
  const activeTemplate = templates.find(t => t.id === (dateMapping?.templateId || defaultTemplate?.id)) || defaultTemplate;
  const todayEvents = events.filter(e => e.templateId === activeTemplate?.id);
  const todayConfidenceQuest = confidenceQuests.find(q => !q.isCompleted) || confidenceQuests[0] || null;

  const themeClass = settings.theme === 'midnight-abyss'
    ? 'theme-midnight-abyss'
    : settings.theme === 'clean-light'
    ? 'theme-clean-light'
    : settings.theme === 'monochrome-pattern'
    ? 'theme-monochrome-pattern'
    : settings.theme === 'alpha-wolf'
    ? 'theme-alpha-wolf'
    : 'theme-cyber-slate';

  useEffect(() => {
    document.documentElement.className = settings.theme === 'clean-light' ? 'light' : 'dark';
  }, [settings.theme]);

  return (
    <div className={`min-h-screen ${themeClass} bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-200`}>
      {/* Top RPG Header HUD */}
      <HeaderHUD
        profile={profile}
        settings={settings}
        onUpdateSettings={s => {
          setSettings(s);
          storage.saveSettings(s);
        }}
        onOpenQuickNote={() => setIsQuickNoteOpen(true)}
        onNavigate={setCurrentTab}
        onOpenPlayerCard={() => setIsPlayerCardOpen(true)}
        onOpenSmartwatch={() => setIsSmartwatchOpen(true)}
      />

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <DesktopSidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 md:pb-12 max-w-full overflow-y-auto">
          <ErrorBoundary>
            {currentTab === 'today' && (
              <DashboardView
                profile={profile}
                dailyQuests={dailyQuests}
                onToggleQuest={handleToggleDailyQuest}
                todayEvents={todayEvents}
                activeTemplateName={activeTemplate ? activeTemplate.name : 'College'}
                confidenceQuest={todayConfidenceQuest}
                exercises={exercises}
                onNavigate={handleNavigate}
                settings={settings}
                onOpenSmartwatch={() => setIsSmartwatchOpen(true)}
              />
            )}

            {currentTab === 'timetable' && (
              <TimetableModule
                templates={templates}
                events={events}
                dateModes={dateModes}
                onSaveTemplates={t => {
                  setTemplates(t);
                  storage.saveTemplates(t);
                }}
                onSaveEvents={e => {
                  setEvents(e);
                  storage.saveEvents(e);
                }}
                onSaveDateModes={m => {
                  setDateModes(m);
                  storage.saveDateModes(m);
                }}
                onAwardXP={(amount, desc, stat) => handleAwardXP(amount, desc, stat)}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'train' && (
              <TrainModule
                exercises={exercises}
                onSaveExercises={ex => {
                  setExercises(ex);
                  storage.saveExercises(ex);
                }}
                onAwardXP={(amount, desc, stat) => handleAwardXP(amount, desc, stat)}
                initialTab={trainSubTab}
                onTabChange={t => setTrainSubTab(t as any)}
              />
            )}

          {currentTab === 'focus' && (
            <FocusModule
              onAwardXP={(amount, desc, stat) => handleAwardXP(amount, desc, stat)}
            />
          )}

          {currentTab === 'quests' && (
            <QuestsModule
              dailyQuests={dailyQuests}
              onToggleQuest={handleToggleDailyQuest}
              onSaveDailyQuests={q => {
                setDailyQuests(q);
                storage.saveDailyQuests(q);
              }}
              xpTransactions={xpTransactions}
            />
          )}

          {currentTab === 'confidence' && (
            <ConfidenceModule
              quests={confidenceQuests}
              onSaveQuests={q => {
                setConfidenceQuests(q);
                storage.saveConfidenceQuests(q);
              }}
              onAwardXP={(amount, desc, stat) => handleAwardXP(amount, desc, stat)}
            />
          )}

          {currentTab === 'skills' && (
            <SkillsModule
              skills={skills}
              onSaveSkills={s => {
                setSkills(s);
                storage.saveSkills(s);
              }}
              onAwardXP={(amount, desc, stat) => handleAwardXP(amount, desc, stat)}
            />
          )}

          {currentTab === 'notes' && (
            <NotesModule
              notes={notes}
              onSaveNotes={n => {
                setNotes(n);
                storage.saveNotes(n);
              }}
              onOpenQuickNote={() => setIsQuickNoteOpen(true)}
            />
          )}

          {currentTab === 'reminders' && (
            <RemindersModule
              reminders={reminders}
              onSaveReminders={r => {
                setReminders(r);
                storage.saveReminders(r);
              }}
              onAwardXP={(amount, desc, stat) => handleAwardXP(amount, desc, stat)}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressView
              profile={profile}
              achievements={achievements}
              weeklyReviews={weeklyReviews}
              onSaveWeeklyReviews={w => {
                setWeeklyReviews(w);
                storage.saveWeeklyReviews(w);
              }}
              onAwardXP={(amount, desc, stat) => handleAwardXP(amount, desc, stat)}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              events={events}
              workoutLogs={storage.getWorkoutLogs()}
              focusSessions={storage.getFocusSessions()}
              confidenceQuests={confidenceQuests}
              notes={notes}
              reminders={reminders}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              profile={profile}
              settings={settings}
              exercises={exercises}
              onUpdateProfile={setProfile}
              onUpdateSettings={setSettings}
              onReloadAllData={reloadAllData}
            />
          )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenMore={() => setIsMoreMenuOpen(true)}
      />

      {/* Mobile "More" Drawer Modal */}
      <MoreMenuModal
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        onSelectTab={handleNavigate}
        currentTab={currentTab}
        onOpenSmartwatch={() => setIsSmartwatchOpen(true)}
      />

      {/* Noise Smartwatch & Health Sync Modal */}
      <SmartwatchSyncModal
        isOpen={isSmartwatchOpen}
        onClose={() => setIsSmartwatchOpen(false)}
        onAwardXP={(amount, desc, stat) => handleAwardXP(amount, desc, stat)}
      />

      {/* Global Quick Note Modal */}
      <QuickNoteModal
        isOpen={isQuickNoteOpen}
        onClose={() => setIsQuickNoteOpen(false)}
        onSaved={reloadAllData}
      />

      {/* Celebratory Level Up Modal */}
      {levelUpProfile && (
        <LevelUpModal
          profile={levelUpProfile}
          onClose={() => setLevelUpProfile(null)}
        />
      )}

      {/* Hunter / Player Status Identity Modal */}
      <PlayerStatusCardModal
        profile={profile}
        isOpen={isPlayerCardOpen}
        onClose={() => setIsPlayerCardOpen(false)}
      />

      {/* PWA Mobile App Installation Prompt */}
      <PWAInstallPrompt />

      {/* FLOATING RPG SYSTEM TOAST NOTIFICATIONS */}
      <div className="fixed top-14 right-3 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto p-3 rounded-2xl bg-slate-950/95 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/25 backdrop-blur-md animate-in slide-in-from-top-3 fade-in duration-200 flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow-md">
                {toast.type === 'achievement' ? '🏆' : 'XP'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    [ SYSTEM ALERT ]
                  </span>
                  {toast.stat && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                      {toast.stat}
                    </span>
                  )}
                </div>
                <h5 className="text-xs font-black text-white">{toast.title}</h5>
                <p className="text-[11px] text-slate-300 line-clamp-1">{toast.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* First Launch Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={(p, s) => {
            setProfile(p);
            setSettings(s);
            setShowOnboarding(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
