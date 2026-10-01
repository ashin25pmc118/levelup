import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle,
  Sparkles,
  Info,
  ChevronRight,
  Shield,
  Zap,
  Target,
  Award,
  ArrowRight,
  Flame,
  Dumbbell,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CalisthenicsSkillNode,
  SkillTreeBranch,
  UserFitnessProfile,
  ExerciseProgressionState
} from '../../../services/fitness/fitnessTypes';
import {
  CALISTHENICS_SKILL_NODES,
  getUpdatedSkillNodes
} from '../../../services/fitness/progressionEngine';
import { getExerciseById } from '../../../services/fitness/exerciseRegistry';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';
import { ExerciseVisualGuide } from '../../common/ExerciseVisualGuide';

interface CalisthenicsSkillTreeProps {
  profile: UserFitnessProfile;
  progressionStates: Record<string, ExerciseProgressionState>;
  onUpdateProfile: (profile: UserFitnessProfile) => void;
}

export const CalisthenicsSkillTree: React.FC<CalisthenicsSkillTreeProps> = ({
  profile,
  progressionStates,
  onUpdateProfile
}) => {
  const [selectedBranch, setSelectedBranch] = useState<SkillTreeBranch | 'all'>('all');
  const [activeNode, setActiveNode] = useState<CalisthenicsSkillNode | null>(null);
  const [inspectExerciseId, setInspectExerciseId] = useState<string | null>(null);

  // Compute live node statuses
  const nodes = getUpdatedSkillNodes(profile.masteredSkillIds || [], progressionStates);

  const branches: Array<{ id: SkillTreeBranch | 'all'; label: string; icon: string; count: number }> = [
    { id: 'all', label: 'All Skills', icon: '🌟', count: nodes.length },
    { id: 'push', label: 'Push Mastery', icon: '💥', count: nodes.filter(n => n.branch === 'push').length },
    { id: 'pull', label: 'Pull Mastery', icon: '🧗', count: nodes.filter(n => n.branch === 'pull').length },
    { id: 'core', label: 'Gymnastic Core', icon: '⚡', count: nodes.filter(n => n.branch === 'core').length },
    { id: 'shoulders', label: 'Shoulders & HSPU', icon: '🛡️', count: nodes.filter(n => n.branch === 'shoulders').length },
    { id: 'legs', label: 'Legs & Pistols', icon: '🦵', count: nodes.filter(n => n.branch === 'legs').length },
    { id: 'balance', label: 'Arm Balance', icon: '⚖️', count: nodes.filter(n => n.branch === 'balance').length }
  ];

  const filteredNodes = selectedBranch === 'all'
    ? nodes
    : nodes.filter(n => n.branch === selectedBranch);

  const masteredCount = nodes.filter(n => n.status === 'mastered').length;
  const masteryPercentage = Math.round((masteredCount / nodes.length) * 100);

  // Rank determination
  const getRankTitle = (count: number) => {
    if (count >= 18) return 'Grandmaster of Bodyweight';
    if (count >= 12) return 'Elite Calisthenics Athlete';
    if (count >= 7) return 'Intermediate Gymnast';
    if (count >= 3) return 'Apprentice Calisthenic';
    return 'Novice Trainee';
  };

  const handleToggleMastery = (node: CalisthenicsSkillNode) => {
    sounds.playLevelUp();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    const currentMastered = [...(profile.masteredSkillIds || [])];
    const isAlreadyMastered = currentMastered.includes(node.id);

    let updatedMastered: string[];
    if (isAlreadyMastered) {
      updatedMastered = currentMastered.filter(id => id !== node.id);
    } else {
      updatedMastered = [...currentMastered, node.id];
      // Also reward XP to user profile
      const prof = storage.getProfile();
      prof.currentXP += node.xpReward;
      prof.totalXP += node.xpReward;
      prof.todayXP += node.xpReward;
      storage.saveProfile(prof);
    }

    const updatedProfile: UserFitnessProfile = {
      ...profile,
      masteredSkillIds: updatedMastered
    };

    storage.saveFitnessProfile(updatedProfile);
    onUpdateProfile(updatedProfile);

    // Update active node state
    setActiveNode({
      ...node,
      status: isAlreadyMastered ? 'unlocked' : 'mastered'
    });
  };

  const inspectingExercise = inspectExerciseId ? getExerciseById(inspectExerciseId) : null;

  return (
    <div className="space-y-6">
      {/* Visual Guide Modal if opened */}
      {inspectingExercise && (
        <ExerciseVisualGuide
          exercise={inspectingExercise}
          onClose={() => setInspectExerciseId(null)}
        />
      )}

      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">RPG Progression Tree</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
              {getRankTitle(masteredCount)}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">Calisthenics Skill Tree</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Each mastered movement unlocks advanced neurological leverage paths. Master foundational positions before attempting high-stress joint levers.
          </p>
        </div>

        {/* Mastered Counter */}
        <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Skills Mastered</span>
            <span className="text-lg font-black text-amber-400">{masteredCount} / {nodes.length}</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-amber-400 flex items-center justify-center font-bold text-xs text-slate-200">
            {masteryPercentage}%
          </div>
        </div>
      </div>

      {/* BRANCH TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {branches.map(b => (
          <button
            key={b.id}
            onClick={() => {
              sounds.playClick();
              setSelectedBranch(b.id);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              selectedBranch === b.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <span>{b.icon}</span>
            <span>{b.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedBranch === b.id ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {b.count}
            </span>
          </button>
        ))}
      </div>

      {/* SKILL NODES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map(node => {
          const isMastered = node.status === 'mastered';
          const isLocked = node.status === 'locked';
          const isUnlocked = node.status === 'unlocked';

          return (
            <div
              key={node.id}
              onClick={() => {
                sounds.playClick();
                setActiveNode(node);
              }}
              className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                isMastered
                  ? 'bg-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-500/5 hover:border-amber-400'
                  : isUnlocked
                  ? 'bg-slate-900 border-cyan-500/40 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-80'
              }`}
            >
              {/* Top Row: Tier & Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isMastered
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        : isUnlocked
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Tier {node.tier} · {node.branch}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {isMastered && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                      <CheckCircle className="w-3 h-3" /> Mastered
                    </span>
                  )}
                  {isUnlocked && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      <Unlock className="w-3 h-3" /> Unlocked
                    </span>
                  )}
                  {isLocked && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                {node.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {node.description}
              </p>

              {/* Mastery Target preview */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 truncate max-w-[70%]">
                  🎯 {node.masteryTarget}
                </span>
                <span className="text-amber-400 font-bold shrink-0">+{node.xpReward} XP</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SKILL DETAIL MODAL / DRAWER */}
      {activeNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-slate-100 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                    Tier {activeNode.tier} · {activeNode.branch.toUpperCase()} BRANCH
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-500/30">
                    +{activeNode.xpReward} XP Reward
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white">{activeNode.name}</h3>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveNode(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activeNode.description}</p>

            <div className="space-y-2.5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Unlock Requirement</span>
                <span className="text-slate-200 font-semibold">{activeNode.unlockRequirement}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Mastery Target Benchmark</span>
                <span className="text-cyan-300 font-bold">{activeNode.masteryTarget}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setInspectExerciseId(activeNode.exerciseId);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Info className="w-4 h-4" />
                <span>View Form Guide</span>
              </button>

              <button
                onClick={() => handleToggleMastery(activeNode)}
                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeNode.status === 'mastered'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:from-emerald-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/20'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{activeNode.status === 'mastered' ? 'Mastered (Tap to Undo)' : 'Mark as Mastered'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
