import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Circle,
  Shield,
  ArrowRight,
  HeartHandshake,
  Check
} from 'lucide-react';
import { ConfidenceQuest } from '../../../types';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';

interface ConfidenceModuleProps {
  quests: ConfidenceQuest[];
  onSaveQuests: (quests: ConfidenceQuest[]) => void;
  onAwardXP: (amount: number, description: string, stat: 'confidence') => void;
}

export const ConfidenceModule: React.FC<ConfidenceModuleProps> = ({
  quests,
  onSaveQuests,
  onAwardXP
}) => {
  const [selectedTier, setSelectedTier] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [activeQuest, setActiveQuest] = useState<ConfidenceQuest | null>(
    quests.find(q => q.tier === 'beginner' && !q.isCompleted) || quests[0] || null
  );
  const [reflectionText, setReflectionText] = useState('');

  const filteredQuests = quests.filter(q => q.tier === selectedTier);

  const handleSelectTier = (tier: 'beginner' | 'intermediate' | 'advanced') => {
    sounds.playClick();
    setSelectedTier(tier);
    const firstInTier = quests.find(q => q.tier === tier && !q.isCompleted) || quests.find(q => q.tier === tier);
    if (firstInTier) setActiveQuest(firstInTier);
  };

  const handleCompleteQuest = () => {
    if (!activeQuest) return;
    sounds.playQuestComplete();

    const updated = quests.map(q => {
      if (q.id === activeQuest.id) {
        return {
          ...q,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          reflectionNote: reflectionText.trim() || undefined
        };
      }
      return q;
    });

    onSaveQuests(updated);
    onAwardXP(
      activeQuest.xpValue,
      `Completed Confidence Quest: ${activeQuest.title}`,
      'confidence'
    );

    setReflectionText('');
    const nextQuest = updated.find(q => q.tier === selectedTier && !q.isCompleted);
    setActiveQuest(nextQuest || null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-pink-950 text-pink-400 border border-pink-500/30">
              <MessageSquare className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">Confidence & Social Growth</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Real growth isn't pretending to be an extrovert. It is gradual exposure to calm, grounded social comfort.
          </p>
        </div>

        {/* Tier Selector */}
        <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['beginner', 'intermediate', 'advanced'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => handleSelectTier(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                selectedTier === tier
                  ? 'bg-pink-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (1 span): Tier Quest List */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            {selectedTier} Challenges ({filteredQuests.length})
          </h3>

          <div className="space-y-2">
            {filteredQuests.map(quest => {
              const isSelected = activeQuest?.id === quest.id;
              return (
                <div
                  key={quest.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveQuest(quest);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-pink-500 bg-pink-950/30 text-pink-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{quest.title}</h4>
                    {quest.isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="capitalize">{quest.tier}</span>
                    <span className="font-bold text-pink-400">+{quest.xpValue} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 spans): Active Quest Card with Reflection */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          {activeQuest ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-950 text-pink-400 border border-pink-500/30">
                    {activeQuest.tier} QUEST
                  </span>
                  <span className="text-xs font-black text-pink-400">
                    +{activeQuest.xpValue} Confidence XP
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-white">{activeQuest.title}</h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {activeQuest.description}
                </p>
              </div>

              {/* Context suggestion box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                <span className="font-bold text-white block mb-1">Example Situations:</span>
                {activeQuest.exampleContext}
              </div>

              {/* Reflection Box */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  How did it feel? (Optional Reflection)
                </label>
                <textarea
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                  placeholder="e.g. My heart beat fast at first, but they smiled back and it was completely fine..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-pink-500 focus:outline-none text-slate-200 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCompleteQuest}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-slate-950 shadow-md shadow-pink-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> MARK QUEST COMPLETED & GAIN +{activeQuest.xpValue} XP
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Select a quest from the list to begin.</p>
          )}

          {/* Compassionate philosophy reminder */}
          <div className="mt-6 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-pink-400 shrink-0" />
            <span>
              Zero shame for hesitation. Small steps like making eye contact or smiling build genuine inner strength.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
