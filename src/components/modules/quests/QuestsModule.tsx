import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  CheckCircle2,
  Circle,
  History,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  X
} from 'lucide-react';
import { DailyQuest, XPTransaction, StatType } from '../../../types';
import { sounds } from '../../../services/soundEffects';

interface QuestsModuleProps {
  dailyQuests: DailyQuest[];
  onToggleQuest: (questId: string) => void;
  onSaveDailyQuests: (quests: DailyQuest[]) => void;
  xpTransactions: XPTransaction[];
}

export const QuestsModule: React.FC<QuestsModuleProps> = ({
  dailyQuests,
  onToggleQuest,
  onSaveDailyQuests,
  xpTransactions
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<DailyQuest | null>(null);

  // Form state
  const [questTitle, setQuestTitle] = useState('');
  const [questCategory, setQuestCategory] = useState<DailyQuest['category']>('routine');
  const [questXp, setQuestXp] = useState(20);
  const [questDesc, setQuestDesc] = useState('');

  const completedCount = dailyQuests.filter(q => q.isCompleted).length;

  const handleOpenAddModal = () => {
    sounds.playClick();
    setEditingQuest(null);
    setQuestTitle('');
    setQuestCategory('routine');
    setQuestXp(20);
    setQuestDesc('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (quest: DailyQuest, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setEditingQuest(quest);
    setQuestTitle(quest.title);
    setQuestCategory(quest.category);
    setQuestXp(quest.targetXp);
    setQuestDesc(quest.description || '');
    setIsAddModalOpen(true);
  };

  const handleSaveQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questTitle.trim()) return;

    sounds.playQuestComplete();
    const todayStr = new Date().toISOString().split('T')[0];

    if (editingQuest) {
      const updated = dailyQuests.map(q =>
        q.id === editingQuest.id
          ? {
              ...q,
              title: questTitle.trim(),
              category: questCategory,
              targetXp: questXp,
              description: questDesc.trim() || undefined
            }
          : q
      );
      onSaveDailyQuests(updated);
    } else {
      const newQuest: DailyQuest = {
        id: `dq_${Date.now()}`,
        date: todayStr,
        title: questTitle.trim(),
        category: questCategory,
        targetXp: questXp,
        description: questDesc.trim() || undefined,
        isCustom: true,
        isCompleted: false
      };
      onSaveDailyQuests([...dailyQuests, newQuest]);
    }

    setIsAddModalOpen(false);
    setEditingQuest(null);
  };

  const handleDeleteQuest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    onSaveDailyQuests(dailyQuests.filter(q => q.id !== id));
  };

  const handleMoveQuest = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= dailyQuests.length) return;

    const reordered = [...dailyQuests];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    onSaveDailyQuests(reordered);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Header with Add Quest Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Target className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">Daily Quests & XP Ledger</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Custom recurring daily objectives. Organize priorities, earn discipline XP, and stay accountable.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs font-bold text-cyan-400">
            <Sparkles className="w-4 h-4" /> {completedCount} / {dailyQuests.length} Done Today
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Daily Quest
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 spans): Daily Quests Builder */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Active Quests for Today
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">
              Click quest to complete • Use arrows to order
            </span>
          </div>

          <div className="space-y-2.5">
            {dailyQuests.map((quest, idx) => (
              <div
                key={quest.id}
                onClick={() => onToggleQuest(quest.id)}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all group ${
                  quest.isCompleted
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                    : 'bg-slate-950 border-slate-800 hover:border-cyan-500/40 text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-slate-400 shrink-0">
                    {quest.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-cyan-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`text-xs sm:text-sm font-bold block truncate ${
                        quest.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {quest.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        {quest.category}
                      </span>
                      {quest.description && (
                        <span className="text-[11px] text-slate-400 truncate">
                          • {quest.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {/* Reordering and Edit buttons */}
                  <div className="opacity-80 sm:opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={e => handleMoveQuest(idx, 'up', e)}
                      disabled={idx === 0}
                      className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-slate-500 hover:text-white disabled:opacity-20"
                      title="Move Up"
                      aria-label="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => handleMoveQuest(idx, 'down', e)}
                      disabled={idx === dailyQuests.length - 1}
                      className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-slate-500 hover:text-white disabled:opacity-20"
                      title="Move Down"
                      aria-label="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => handleOpenEditModal(quest, e)}
                      className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-slate-500 hover:text-cyan-400"
                      title="Edit Quest"
                      aria-label="Edit Quest"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => handleDeleteQuest(quest.id, e)}
                      className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-slate-500 hover:text-red-400"
                      title="Delete Quest"
                      aria-label="Delete Quest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                      quest.isCompleted
                        ? 'bg-slate-900 text-slate-500'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    +{quest.targetXp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 span): XP Transaction Ledger */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              XP Transaction Ledger
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Real-time audit log of every XP reward and stat increase.
          </p>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {xpTransactions.slice(0, 20).map(tx => (
              <div
                key={tx.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-white block text-[11px] line-clamp-1">
                    {tx.description}
                  </span>
                  <span className="text-[9px] text-slate-500 capitalize">
                    {tx.source} · {tx.statTarget} · {tx.timestamp.split('T')[1]?.substring(0, 5) || ''}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-cyan-400 shrink-0">
                  +{tx.amount} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT QUEST MODAL */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white">
                {editingQuest ? 'Edit Daily Quest' : 'Add Custom Daily Quest'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuest} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Quest Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 20 pages of nonfiction, 30m Deep Work block..."
                  value={questTitle}
                  onChange={e => setQuestTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={questCategory}
                    onChange={e => setQuestCategory(e.target.value as DailyQuest['category'])}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-bold capitalize focus:outline-none"
                  >
                    <option value="routine">Routine</option>
                    <option value="study">Study</option>
                    <option value="focus">Focus</option>
                    <option value="train">Train</option>
                    <option value="confidence">Confidence</option>
                    <option value="recovery">Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Target XP</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    step={5}
                    value={questXp}
                    onChange={e => setQuestXp(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Context / Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Turn off phone notifications before starting"
                  value={questDesc}
                  onChange={e => setQuestDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-black rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20"
                >
                  {editingQuest ? 'Save Changes' : 'Create Quest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
