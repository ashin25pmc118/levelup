import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  Flame,
  Check,
  Trash2,
  Layers,
  Volume2,
  VolumeX,
  History,
  CheckSquare,
  Square,
  Award
} from 'lucide-react';
import { Skill, SkillSession, StatType } from '../../../types';
import { storage, SKILL_BLUEPRINTS, SkillBlueprint } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';
import { getRequiredSkillXP } from '../../../services/rpgEngine';

interface SkillsModuleProps {
  skills: Skill[];
  onSaveSkills: (skills: Skill[]) => void;
  onAwardXP: (amount: number, description: string, stat: StatType | StatType[]) => void;
}

const STAT_CHOICES: { key: StatType; label: string; icon: string; color: string }[] = [
  { key: 'knowledge', label: 'Knowledge', icon: '📚', color: 'text-blue-400 border-blue-500/30 bg-blue-950/40' },
  { key: 'focus', label: 'Focus', icon: '🧠', color: 'text-purple-400 border-purple-500/30 bg-purple-950/40' },
  { key: 'confidence', label: 'Confidence', icon: '🗣️', color: 'text-pink-400 border-pink-500/30 bg-pink-950/40' },
  { key: 'strength', label: 'Strength', icon: '💪', color: 'text-red-400 border-red-500/30 bg-red-950/40' },
  { key: 'stamina', label: 'Stamina', icon: '🫀', color: 'text-orange-400 border-orange-500/30 bg-orange-950/40' },
  { key: 'reflex', label: 'Reflex', icon: '⚡', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/40' },
  { key: 'recovery', label: 'Recovery', icon: '🧘', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40' },
  { key: 'awareness', label: 'Awareness', icon: '👁️', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40' },
  { key: 'discipline', label: 'Discipline', icon: '🎯', color: 'text-violet-400 border-violet-500/30 bg-violet-950/40' }
];

export const SkillsModule: React.FC<SkillsModuleProps> = ({
  skills,
  onSaveSkills,
  onAwardXP
}) => {
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [historySkill, setHistorySkill] = useState<Skill | null>(null);

  // New skill form
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Tech');
  const [skillGoals, setSkillGoals] = useState('');
  const [selectedSynergies, setSelectedSynergies] = useState<StatType[]>(['knowledge']);

  // Live Timer & Practice state
  const [activeTimerSkill, setActiveTimerSkill] = useState<Skill | null>(null);
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [countdownMinutes, setCountdownMinutes] = useState(25);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [ambientAudio, setAmbientAudio] = useState<'off' | 'brown' | 'rain' | 'binaural'>('off');

  // Finish Reflection Modal
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionTakeaway, setReflectionTakeaway] = useState('');
  const [completedSeconds, setCompletedSeconds] = useState(0);

  // Active Timer Interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(sec => {
          if (timerMode === 'countdown' && sec >= countdownMinutes * 60) {
            sounds.playLevelUp();
            setIsTimerRunning(false);
            sounds.stopAmbient();
            setCompletedSeconds(countdownMinutes * 60);
            setShowReflectionModal(true);
            return countdownMinutes * 60;
          }
          return sec + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerMode, countdownMinutes]);

  // Clean ambient audio on unmount or timer close
  useEffect(() => {
    return () => {
      sounds.stopAmbient();
    };
  }, []);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Toggle stat synergy in new skill form
  const toggleSynergy = (stat: StatType) => {
    if (selectedSynergies.includes(stat)) {
      if (selectedSynergies.length > 1) {
        setSelectedSynergies(selectedSynergies.filter(s => s !== stat));
      }
    } else {
      if (selectedSynergies.length < 3) {
        setSelectedSynergies([...selectedSynergies, stat]);
      }
    }
  };

  // Import Blueprint
  const handleImportBlueprint = (bp: SkillBlueprint) => {
    sounds.playQuestComplete();
    const newSkill: Skill = {
      id: `sk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: bp.name,
      category: bp.category,
      level: 1,
      currentXP: 0,
      totalPracticeMinutes: 0,
      sessionsCount: 0,
      streak: 1,
      statsSynergy: bp.statsSynergy,
      milestones: bp.milestones,
      goals: bp.goals,
      createdAt: new Date().toISOString()
    };
    onSaveSkills([newSkill, ...skills]);
    setIsBlueprintModalOpen(false);
  };

  // Add Custom Skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    const newSkill: Skill = {
      id: `sk_${Date.now()}`,
      name: skillName.trim(),
      category: skillCategory.trim(),
      level: 1,
      currentXP: 0,
      totalPracticeMinutes: 0,
      sessionsCount: 0,
      streak: 1,
      statsSynergy: selectedSynergies,
      goals: skillGoals.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    sounds.playClick();
    onSaveSkills([newSkill, ...skills]);
    setIsAddModalOpen(false);
    setSkillName('');
    setSkillGoals('');
    setSelectedSynergies(['knowledge']);
  };

  // Delete Skill
  const handleDeleteSkill = (id: string) => {
    sounds.playClick();
    onSaveSkills(skills.filter(s => s.id !== id));
  };

  // Toggle Sub-Skill Milestone
  const handleToggleMilestone = (skillId: string, milestoneId: string) => {
    sounds.playClick();
    const updated = skills.map(s => {
      if (s.id === skillId && s.milestones) {
        const nextMilestones = s.milestones.map(m =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        return { ...s, milestones: nextMilestones };
      }
      return s;
    });
    onSaveSkills(updated);
  };

  // Start Live Timer on a Skill
  const handleOpenLiveTimer = (skill: Skill) => {
    sounds.playClick();
    setActiveTimerSkill(skill);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
    if (ambientAudio !== 'off') {
      sounds.startAmbient(ambientAudio, 0.25);
    }
  };

  // Toggle Timer Play / Pause
  const handleToggleTimerPlay = () => {
    sounds.playClick();
    const nextRunning = !isTimerRunning;
    setIsTimerRunning(nextRunning);
    if (nextRunning && ambientAudio !== 'off') {
      sounds.startAmbient(ambientAudio, 0.25);
    } else {
      sounds.stopAmbient();
    }
  };

  // Ambient Audio Selector
  const handleAmbientChange = (type: 'off' | 'brown' | 'rain' | 'binaural') => {
    sounds.playClick();
    setAmbientAudio(type);
    if (type === 'off' || !isTimerRunning) {
      sounds.stopAmbient();
    } else {
      sounds.startAmbient(type, 0.25);
    }
  };

  // Stop Timer & Open Reflection
  const handleFinishTimerSession = () => {
    sounds.playQuestComplete();
    setIsTimerRunning(false);
    sounds.stopAmbient();
    setCompletedSeconds(secondsElapsed);
    setShowReflectionModal(true);
  };

  // Finalize Practice & Award XP with Bound Stats Synergy
  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTimerSkill) return;

    const practicedMins = Math.max(1, Math.round(completedSeconds / 60));
    const xp = Math.min(75, Math.max(10, Math.round(practicedMins * 1.5)));
    const today = new Date().toISOString().split('T')[0];

    // Infinite scaling calculation
    let nextLevel = activeTimerSkill.level;
    let nextXP = activeTimerSkill.currentXP + xp;
    let reqXP = getRequiredSkillXP(nextLevel);

    while (nextXP >= reqXP) {
      nextXP -= reqXP;
      nextLevel += 1;
      reqXP = getRequiredSkillXP(nextLevel);
    }

    const updatedSkill: Skill = {
      ...activeTimerSkill,
      level: nextLevel,
      currentXP: nextXP,
      totalPracticeMinutes: activeTimerSkill.totalPracticeMinutes + practicedMins,
      sessionsCount: activeTimerSkill.sessionsCount + 1,
      lastPracticedDate: today,
      streak: activeTimerSkill.streak + 1
    };

    const updated = skills.map(s => (s.id === activeTimerSkill.id ? updatedSkill : s));
    onSaveSkills(updated);

    // Save session
    const session: SkillSession = {
      id: `sks_${Date.now()}`,
      skillId: activeTimerSkill.id,
      date: today,
      durationMinutes: practicedMins,
      notes: reflectionTakeaway.trim() || undefined,
      xpEarned: xp
    };
    storage.addSkillSession(session);

    // Award XP to linked character RPG stats
    const statsToBoost = activeTimerSkill.statsSynergy && activeTimerSkill.statsSynergy.length > 0
      ? activeTimerSkill.statsSynergy
      : ['knowledge' as StatType];

    onAwardXP(
      xp,
      `Practiced ${activeTimerSkill.name} (${practicedMins}m): "${reflectionTakeaway.trim() || 'Solid practice session'}"`,
      statsToBoost
    );

    // Reset modals
    setShowReflectionModal(false);
    setActiveTimerSkill(null);
    setReflectionTakeaway('');
    setSecondsElapsed(0);
    sounds.playLevelUp();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Header with Blueprint Import & Add Skill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">Skill Mastery Tree</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Infinite deliberate practice. Level up real-life crafts with live timers, milestones, and direct RPG stat synergy.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBlueprintModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 border border-cyan-500/30 transition-all shadow-sm"
          >
            <Layers className="w-4 h-4" /> Starter Blueprints
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Custom Skill
          </button>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map(skill => {
          const reqXP = getRequiredSkillXP(skill.level);
          const xpPercent = Math.min(100, Math.round((skill.currentXP / reqXP) * 100));

          return (
            <div
              key={skill.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                {/* Category & Level Header */}
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/20 uppercase tracking-wider">
                    {skill.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-emerald-400 px-2 py-0.5 rounded-md bg-slate-950 border border-emerald-500/30">
                      LVL {skill.level}
                    </span>
                    <button
                      onClick={() => setHistorySkill(skill)}
                      className="p-1 rounded text-slate-500 hover:text-cyan-400 transition-colors"
                      title="View Practice History"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-extrabold text-white mb-1">{skill.name}</h4>
                {skill.goals && (
                  <p className="text-xs text-slate-400 italic mb-2 line-clamp-2">"{skill.goals}"</p>
                )}

                {/* RPG Stat Synergy Chips */}
                {skill.statsSynergy && skill.statsSynergy.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap my-2.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Boosts:
                    </span>
                    {skill.statsSynergy.map(st => {
                      const info = STAT_CHOICES.find(c => c.key === st);
                      return (
                        <span
                          key={st}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-950 border border-slate-700 text-slate-300 flex items-center gap-1"
                        >
                          <span>{info?.icon || '⚡'}</span>
                          <span className="capitalize">{st}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Infinite Level Progress Bar */}
                <div className="my-3">
                  <div className="flex justify-between text-[11px] mb-1 font-semibold text-slate-400">
                    <span>Infinite XP</span>
                    <span>{skill.currentXP} / {reqXP} XP</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                </div>

                {/* Practice Stats */}
                <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{skill.totalPracticeMinutes}m total</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span>{skill.streak}d streak</span>
                  </div>
                </div>

                {/* Sub-Skills Milestones Checklist */}
                {skill.milestones && skill.milestones.length > 0 && (
                  <div className="space-y-1 mb-4 pt-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                      Sub-Skill Milestones ({skill.milestones.filter(m => m.completed).length}/{skill.milestones.length})
                    </span>
                    {skill.milestones.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMilestone(skill.id, m.id)}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800/60 cursor-pointer text-xs transition-colors"
                      >
                        {m.completed ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className={`text-[11px] ${m.completed ? 'line-through text-slate-500' : 'text-slate-300 font-medium'}`}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 1-Click Practice Launcher */}
              <button
                onClick={() => handleOpenLiveTimer(skill)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30 transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-300" /> Start Practice Timer
              </button>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* STARTER BLUEPRINTS MODAL */}
      {/* ========================================================= */}
      {isBlueprintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-5 sm:p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" /> Starter Skill Blueprints
                </h3>
                <p className="text-xs text-slate-400">
                  Pre-configured mastery blueprints with built-in sub-skills and stat synergies.
                </p>
              </div>
              <button
                onClick={() => setIsBlueprintModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {SKILL_BLUEPRINTS.map(bp => (
                <div
                  key={bp.name}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/20 uppercase">
                        {bp.category}
                      </span>
                      <div className="flex gap-1">
                        {bp.statsSynergy.map(s => (
                          <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                            +{s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h4 className="text-sm font-black text-white mb-1">{bp.name}</h4>
                    <p className="text-[11px] text-slate-400 mb-3">{bp.goals}</p>

                    <div className="space-y-1 mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Milestones ({bp.milestones.length})
                      </span>
                      {bp.milestones.slice(0, 3).map(m => (
                        <div key={m.id} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span className="text-cyan-400 font-bold">✓</span>
                          <span className="line-clamp-1">{m.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleImportBlueprint(bp)}
                    className="w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors shadow-sm"
                  >
                    Import Blueprint
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD CUSTOM SKILL MODAL */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-1">Add Custom Skill</h3>
            <p className="text-xs text-slate-400 mb-3">
              Craft a unique discipline and link it to your character's RPG stats.
            </p>

            <form onSubmit={handleAddSkill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Public Speaking, Boxing, German, Blender..."
                  value={skillName}
                  onChange={e => setSkillName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Social, Tech, Creative, Athletics, Mindset..."
                  value={skillCategory}
                  onChange={e => setSkillCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  RPG Stat Synergy (Select 1 to 3 stats to boost)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STAT_CHOICES.map(c => {
                    const isSelected = selectedSynergies.includes(c.key);
                    return (
                      <button
                        type="button"
                        key={c.key}
                        onClick={() => toggleSynergy(c.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                          isSelected
                            ? `${c.color} border-current ring-1 ring-current`
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{c.icon}</span>
                        <span className="capitalize">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Mastery Goal</label>
                <input
                  type="text"
                  placeholder="e.g. 15-minute debate, build 3 web applications..."
                  value={skillGoals}
                  onChange={e => setSkillGoals(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                >
                  Create Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIVE PRACTICE TIMER MODAL (STOPWATCH & AMBIENT AUDIO) */}
      {/* ========================================================= */}
      {activeTimerSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-slate-100 flex flex-col items-center text-center">
            {/* Header info */}
            <div className="mb-4">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/20 uppercase tracking-widest">
                DELIBERATE PRACTICE IN PROGRESS
              </span>
              <h3 className="text-xl font-black text-white mt-1">{activeTimerSkill.name}</h3>
              <p className="text-xs text-slate-400">
                Level {activeTimerSkill.level} • Boosts {activeTimerSkill.statsSynergy?.join(' & ') || 'knowledge'}
              </p>
            </div>

            {/* Mode selection (Stopwatch vs Countdown) */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
              <button
                onClick={() => {
                  setTimerMode('stopwatch');
                  setSecondsElapsed(0);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  timerMode === 'stopwatch'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Stopwatch
              </button>
              <button
                onClick={() => {
                  setTimerMode('countdown');
                  setSecondsElapsed(0);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  timerMode === 'countdown'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Countdown
              </button>
              {timerMode === 'countdown' && (
                <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                  {[15, 25, 45].map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        setCountdownMinutes(m);
                        setSecondsElapsed(0);
                      }}
                      className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                        countdownMinutes === m
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Big Timer Clock Display */}
            <div className="relative flex items-center justify-center w-52 h-52 my-2">
              <div className="w-48 h-48 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center bg-slate-950/80 shadow-inner">
                <span className="text-4xl font-black text-white font-mono tracking-tight">
                  {timerMode === 'countdown'
                    ? formatTime(Math.max(0, countdownMinutes * 60 - secondsElapsed))
                    : formatTime(secondsElapsed)}
                </span>
                <span className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider mt-1">
                  {isTimerRunning ? 'Active Focus' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Ambient Audio Controls */}
            <div className="my-4 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                {ambientAudio !== 'off' ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                Ambient:
              </span>
              {(['off', 'brown', 'rain', 'binaural'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => handleAmbientChange(type)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize border transition-all ${
                    ambientAudio === type
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Timer Actions */}
            <div className="flex items-center gap-3 mt-2 w-full max-w-xs">
              <button
                onClick={handleToggleTimerPlay}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                {isTimerRunning ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={handleFinishTimerSession}
                disabled={secondsElapsed < 10}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                title="Finish and log practice session"
              >
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Finish
              </button>
              <button
                onClick={() => {
                  sounds.stopAmbient();
                  setActiveTimerSkill(null);
                  setIsTimerRunning(false);
                }}
                className="py-3 px-3 rounded-2xl text-slate-500 hover:text-white hover:bg-slate-800 text-xs transition-colors"
                title="Cancel timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POST-PRACTICE REFLECTION MODAL ("What did you learn today?") */}
      {/* ========================================================= */}
      {showReflectionModal && activeTimerSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-black text-white">Practice Complete!</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              You practiced <strong className="text-white">{activeTimerSkill.name}</strong> for{' '}
              <strong className="text-emerald-400">{Math.max(1, Math.round(completedSeconds / 60))} minutes</strong>.
            </p>

            <form onSubmit={handleSaveReflection} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  1-Sentence Takeaway / Reflection
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What clicked? What concept or technique did you sharpen today?"
                  value={reflectionTakeaway}
                  onChange={e => setReflectionTakeaway(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>XP Reward:</span>
                <span className="font-black text-emerald-400 text-sm">
                  +{Math.min(75, Math.max(10, Math.round(Math.max(1, Math.round(completedSeconds / 60)) * 1.5)))} XP
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" /> Log Session & Level Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRACTICE HISTORY LOG DRAWER */}
      {/* ========================================================= */}
      {historySkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" /> {historySkill.name} History
                </h3>
                <p className="text-xs text-slate-400">
                  {historySkill.totalPracticeMinutes} minutes total • {historySkill.sessionsCount} sessions
                </p>
              </div>
              <button
                onClick={() => setHistorySkill(null)}
                className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {(() => {
                const sessions = storage
                  .getSkillSessions()
                  .filter(s => s.skillId === historySkill.id);

                if (sessions.length === 0) {
                  return (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No sessions logged yet for this skill. Start a practice timer to log your first reflection!
                    </div>
                  );
                }

                return sessions.map(sess => (
                  <div
                    key={sess.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{sess.date}</span>
                      <span className="font-bold text-emerald-400">+{sess.xpEarned} XP • {sess.durationMinutes}m</span>
                    </div>
                    {sess.notes && (
                      <p className="text-slate-200 text-xs italic">"{sess.notes}"</p>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
