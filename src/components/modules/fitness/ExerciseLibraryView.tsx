import React, { useState } from 'react';
import {
  Search,
  Filter,
  Dumbbell,
  Shield,
  AlertTriangle,
  Info,
  Home,
  Building2,
  ChevronRight,
  Sparkles,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import {
  CentralExercise,
  ExerciseCategory,
  TrainingEnvironment,
  ExerciseDifficulty
} from '../../../services/fitness/fitnessTypes';
import {
  CENTRAL_EXERCISE_REGISTRY,
  getAllExercises
} from '../../../services/fitness/exerciseRegistry';
import { sounds } from '../../../services/soundEffects';
import { ExerciseVisualGuide } from '../../common/ExerciseVisualGuide';

const CATEGORIES: Array<{ id: ExerciseCategory | 'all'; label: string; icon: string }> = [
  { id: 'all', label: 'All Categories', icon: '⚡' },
  { id: 'chest', label: 'Chest (Push-ups)', icon: '💥' },
  { id: 'back', label: 'Back (Pull & Rows)', icon: '🧗' },
  { id: 'shoulders', label: 'Shoulders & Pike', icon: '🛡️' },
  { id: 'biceps', label: 'Biceps', icon: '💪' },
  { id: 'triceps', label: 'Triceps', icon: '⚡' },
  { id: 'forearms', label: 'Forearms & Grip', icon: '✊' },
  { id: 'core', label: 'Core & Abs', icon: '🧘' },
  { id: 'glutes', label: 'Glutes', icon: '🍑' },
  { id: 'quadriceps', label: 'Quadriceps (Squats)', icon: '🦵' },
  { id: 'hamstrings', label: 'Hamstrings', icon: '🏃' },
  { id: 'calves', label: 'Calves', icon: '👟' },
  { id: 'full-body', label: 'Full Body', icon: '🔥' },
  { id: 'cardio', label: 'Cardio & Stamina', icon: '❤️' },
  { id: 'mobility', label: 'Mobility & Joint Care', icon: '🌊' },
  { id: 'calisthenics-skills', label: 'Calisthenics Skills', icon: '👑' }
];

export const ExerciseLibraryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [selectedEnv, setSelectedEnv] = useState<TrainingEnvironment | 'all'>('all');
  const [selectedDiff, setSelectedDiff] = useState<ExerciseDifficulty | 'all'>('all');
  const [inspectedExercise, setInspectedExercise] = useState<CentralExercise | null>(null);

  const allExercises = getAllExercises();

  const filteredExercises = allExercises.filter(ex => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ex.name.toLowerCase().includes(q);
      const matchCat = ex.category.toLowerCase().includes(q);
      const matchMuscles = ex.muscleGroups.primary.some(m => m.toLowerCase().includes(q));
      const matchEquip = ex.equipment.some(eq => eq.toLowerCase().includes(q));
      if (!matchName && !matchCat && !matchMuscles && !matchEquip) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && ex.category !== selectedCategory) {
      return false;
    }

    // Environment filter
    if (selectedEnv !== 'all' && !ex.modes.includes(selectedEnv)) {
      return false;
    }

    // Difficulty filter
    if (selectedDiff !== 'all' && ex.difficulty !== selectedDiff) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Visual Guide Modal */}
      {inspectedExercise && (
        <ExerciseVisualGuide
          exercise={inspectedExercise}
          onClose={() => setInspectedExercise(null)}
        />
      )}

      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Exercise Encyclopedia</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              15 Muscle & Skill Categories
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">Central Exercise Registry</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Strictly bodyweight and everyday furniture. Zero gym equipment required. Every movement features safety notes, proper breathing cadence, and progressive variations.
          </p>
        </div>

        {/* Count Badge */}
        <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-right shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Available Movements</span>
          <span className="text-xl font-extrabold text-cyan-400">{filteredExercises.length} / {allExercises.length}</span>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search exercise by name, muscle, or equipment (e.g. wall, doorframe, chest)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'All Modes' },
              { id: 'home', label: '🏠 Home' },
              { id: 'hostel', label: '🏢 Hostel' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedEnv(m.id as any);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedEnv === m.id
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Difficulty Selector */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'All Tiers' },
              { id: 'beginner', label: 'Beg' },
              { id: 'intermediate', label: 'Int' },
              { id: 'advanced', label: 'Adv' }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedDiff(d.id as any);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDiff === d.id
                    ? 'bg-purple-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 15 CATEGORY PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* EXERCISES GRID */}
      {filteredExercises.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <p className="text-base font-bold text-slate-300">No exercises found</p>
          <p className="text-xs text-slate-500">Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map(ex => {
            const isQuiet = ex.isQuietForHostel;
            const hasSafety = ex.safetyNotes && ex.safetyNotes.length > 0;

            return (
              <div
                key={ex.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {ex.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isQuiet && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          🤫 Quiet
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 uppercase">
                        {ex.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Title & Muscle Groups */}
                  <h3 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    {ex.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    <strong className="text-slate-300">Primary:</strong> {ex.muscleGroups.primary.join(', ')}
                  </p>

                  {/* Equipment Needed */}
                  <div className="mt-2.5 flex items-center flex-wrap gap-1">
                    {ex.equipment.map((eq, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        {eq === 'none' ? 'No Equipment' : eq}
                      </span>
                    ))}
                  </div>

                  {/* Safety Warning Preview */}
                  {hasSafety && (
                    <div className="mt-3 p-2 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{ex.safetyNotes[0]}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Default Target & View Form Button */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Standard Target</span>
                    <span className="font-extrabold text-cyan-300">
                      {ex.defaultSets} sets × {ex.defaultDurationSeconds ? `${ex.defaultDurationSeconds}s` : `${ex.defaultReps} reps`}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      setInspectedExercise(ex);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Form Guide</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
