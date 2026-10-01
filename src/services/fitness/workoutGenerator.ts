import {
  GeneratedWorkout,
  TrainingEnvironment,
  UserFitnessProfile,
  WorkoutBlock,
  WorkoutBlockExercise,
  ExerciseProgressionState,
  WorkoutPhase
} from './fitnessTypes';
import { getExerciseById, CENTRAL_EXERCISE_REGISTRY } from './exerciseRegistry';

interface WorkoutTemplateDay {
  dayName: string;
  focusTheme: string;
  primaryCategories: string[];
  isRestDay: boolean;
}

const WEEKLY_SPLIT: Record<string, WorkoutTemplateDay> = {
  Monday: {
    dayName: 'Monday',
    focusTheme: 'Push Strength & Core Stability',
    primaryCategories: ['chest', 'shoulders', 'triceps', 'core'],
    isRestDay: false
  },
  Tuesday: {
    dayName: 'Tuesday',
    focusTheme: 'Leg Power & Stamina Conditioning',
    primaryCategories: ['quadriceps', 'glutes', 'hamstrings', 'calves', 'cardio'],
    isRestDay: false
  },
  Wednesday: {
    dayName: 'Wednesday',
    focusTheme: 'Active Recovery, Hip & Spinal Decompression',
    primaryCategories: ['mobility'],
    isRestDay: false
  },
  Thursday: {
    dayName: 'Thursday',
    focusTheme: 'Pull Strength & Core Compression',
    primaryCategories: ['back', 'biceps', 'forearms', 'core'],
    isRestDay: false
  },
  Friday: {
    dayName: 'Friday',
    focusTheme: 'Full Body Integration & Stamina Flow',
    primaryCategories: ['full-body', 'chest', 'back', 'quadriceps', 'cardio'],
    isRestDay: false
  },
  Saturday: {
    dayName: 'Saturday',
    focusTheme: 'Calisthenics Skills & Balance Play',
    primaryCategories: ['calisthenics-skills', 'shoulders', 'core', 'mobility'],
    isRestDay: false
  },
  Sunday: {
    dayName: 'Sunday',
    focusTheme: 'Full Rest & Parasympathetic Recovery',
    primaryCategories: ['mobility'],
    isRestDay: true
  }
};

/**
 * Builds a block exercise entry referencing user progression state if available.
 */
function createBlockExercise(
  exerciseId: string,
  progressionStates: Record<string, ExerciseProgressionState>,
  coachingOverride?: string
): WorkoutBlockExercise {
  const ex = getExerciseById(exerciseId);
  const userState = progressionStates[exerciseId];

  const sets = userState?.currentSets || ex?.defaultSets || 3;
  const targetReps = userState?.currentReps || ex?.defaultReps || 10;
  const targetDurationSeconds = userState?.currentDurationSeconds || ex?.defaultDurationSeconds;

  const defaultCue = ex?.movementSteps?.[0] || 'Focus on controlled breathing and clean form.';

  return {
    exerciseId,
    name: ex?.name || exerciseId,
    sets,
    targetReps,
    targetDurationSeconds,
    restSeconds: ex?.restSeconds || 60,
    tempo: ex?.tempo || '2-1-2',
    coachingCue: coachingOverride || defaultCue
  };
}

/**
 * Generates an individualized daily workout strictly capped at <= 60 minutes.
 * Adapts dynamically to HOME vs HOSTEL equipment and quietness rules.
 */
export function generateWorkoutForDay(
  dayOfWeek: string,
  environment: TrainingEnvironment,
  durationTier: 'express' | 'standard' | 'full',
  profile: UserFitnessProfile,
  progressionStates: Record<string, ExerciseProgressionState>
): GeneratedWorkout {
  const dayConfig = WEEKLY_SPLIT[dayOfWeek] || WEEKLY_SPLIT['Monday'];

  // Sunday or Rest Day
  if (dayConfig.isRestDay) {
    return {
      id: `wo_${dayOfWeek.toLowerCase()}_${Date.now()}`,
      name: `Sunday Rest & Mobility Decompression`,
      dayOfWeek,
      focusTheme: 'Deep Recovery & Joint Care',
      phase: profile.currentPhase,
      environment,
      durationTier,
      totalEstimatedMinutes: 15,
      blocks: [
        {
          type: 'warmup',
          title: 'Gentle Awakening',
          estimatedMinutes: 5,
          exercises: [
            createBlockExercise('ex_mob_cat_cow', progressionStates, 'Deep breaths opening up thoracic spine.'),
            createBlockExercise('ex_mob_wrist_prep', progressionStates, 'Warm up wrist capsules gently.')
          ]
        },
        {
          type: 'cooldown',
          title: 'Total Body Stretch & Relaxation',
          estimatedMinutes: 10,
          exercises: [
            createBlockExercise('ex_mob_90_90_hips', progressionStates, 'Ease tight hip flexors from study/desk hours.'),
            createBlockExercise('ex_mob_childs_pose', progressionStates, 'Decompress lower back and breathe deeply.')
          ]
        }
      ]
    };
  }

  // Active training day
  const blocks: WorkoutBlock[] = [];

  // ==========================================
  // 1. WARM-UP BLOCK (3 to 7 mins)
  // ==========================================
  const warmupMins = durationTier === 'express' ? 3 : durationTier === 'standard' ? 5 : 7;
  const warmupExercises: WorkoutBlockExercise[] = [
    createBlockExercise('ex_mob_wrist_prep', progressionStates, 'Prepare wrists for bodyweight load.'),
    createBlockExercise('ex_mob_cat_cow', progressionStates, 'Flow between flexion and extension with your breath.')
  ];

  if (durationTier !== 'express') {
    warmupExercises.push(
      createBlockExercise('ex_shldr_wall_angels', progressionStates, 'Retract scapulae against wall to open chest.')
    );
  }

  blocks.push({
    type: 'warmup',
    title: 'Joint Prep & Movement Activation',
    estimatedMinutes: warmupMins,
    exercises: warmupExercises
  });

  // ==========================================
  // 2. MAIN STRENGTH BLOCK (10 to 28 mins)
  // Tailored to day theme & environment
  // ==========================================
  const strengthMins = durationTier === 'express' ? 10 : durationTier === 'standard' ? 20 : 28;
  const strengthExercises: WorkoutBlockExercise[] = [];

  // Select suitable exercises based on day & environment
  if (dayOfWeek === 'Monday') {
    // PUSH DAY: Chest, Triceps, Shoulders
    // Check push progression
    const pushExId = determineUserCurrentProgression('push_chain', progressionStates, environment);
    strengthExercises.push(createBlockExercise(pushExId, progressionStates));

    if (environment === 'home' || durationTier !== 'express') {
      strengthExercises.push(
        createBlockExercise('ex_shldr_pike_pushup', progressionStates, 'Pike hips high, lower forehead in triangle.')
      );
    }
    if (durationTier === 'full') {
      strengthExercises.push(
        createBlockExercise('ex_tricep_bench_dips', progressionStates, 'Use sturdy chair or bed edge. Keep back close.')
      );
    }
  } else if (dayOfWeek === 'Tuesday') {
    // LEGS DAY: Quads, Glutes, Calves
    const legExId = determineUserCurrentProgression('leg_quad_chain', progressionStates, environment);
    strengthExercises.push(createBlockExercise(legExId, progressionStates));
    strengthExercises.push(createBlockExercise('ex_glute_bridge', progressionStates, 'Drive through heels, squeeze glutes at top.'));

    if (durationTier !== 'express') {
      strengthExercises.push(createBlockExercise('ex_calf_wall_raises', progressionStates, 'Pause 2s on high toes at top.'));
    }
  } else if (dayOfWeek === 'Wednesday') {
    // ACTIVE RECOVERY / MOBILITY
    strengthExercises.push(createBlockExercise('ex_mob_90_90_hips', progressionStates));
    strengthExercises.push(createBlockExercise('ex_mob_childs_pose', progressionStates));
  } else if (dayOfWeek === 'Thursday') {
    // PULL DAY: Back, Biceps
    const pullExId = determineUserCurrentProgression('pull_chain', progressionStates, environment);
    strengthExercises.push(createBlockExercise(pullExId, progressionStates));

    if (environment === 'home') {
      strengthExercises.push(createBlockExercise('ex_back_backpack_rows', progressionStates, 'Hinge at hips, pull elbows to ribcage.'));
    } else {
      strengthExercises.push(createBlockExercise('ex_back_doorframe_rows', progressionStates, 'Lean back, pinch shoulder blades.'));
    }
    if (durationTier === 'full') {
      strengthExercises.push(createBlockExercise('ex_bicep_doorframe_curl', progressionStates, 'Isolated bodyweight bicep squeeze.'));
    }
  } else if (dayOfWeek === 'Friday') {
    // FULL BODY DAY
    const pushEx = determineUserCurrentProgression('push_chain', progressionStates, environment);
    const legEx = determineUserCurrentProgression('leg_quad_chain', progressionStates, environment);
    strengthExercises.push(createBlockExercise(pushEx, progressionStates));
    strengthExercises.push(createBlockExercise(legEx, progressionStates));

    if (durationTier !== 'express') {
      const pullEx = determineUserCurrentProgression('pull_chain', progressionStates, environment);
      strengthExercises.push(createBlockExercise(pullEx, progressionStates));
    }
  } else if (dayOfWeek === 'Saturday') {
    // SKILLS & BALANCE DAY
    strengthExercises.push(createBlockExercise('ex_skill_crow_pose', progressionStates, 'Place knees on triceps, look ahead.'));
    strengthExercises.push(createBlockExercise('ex_core_lsit_tuck', progressionStates, 'Depress shoulders down, lift knees to chest.'));

    if (durationTier !== 'express') {
      strengthExercises.push(createBlockExercise('ex_shldr_wall_handstand', progressionStates, 'Walk feet up wall, engage hollow core.'));
    }
  }

  blocks.push({
    type: 'strength',
    title: 'Progressive Strength & Calisthenics',
    estimatedMinutes: strengthMins,
    exercises: strengthExercises
  });

  // ==========================================
  // 3. CORE BLOCK (4 to 8 mins)
  // ==========================================
  const coreMins = durationTier === 'express' ? 4 : durationTier === 'standard' ? 5 : 8;
  const coreExId = determineUserCurrentProgression('core_chain', progressionStates, environment);
  const coreExercises: WorkoutBlockExercise[] = [createBlockExercise(coreExId, progressionStates)];

  if (durationTier === 'full') {
    coreExercises.push(createBlockExercise('ex_core_russian_twists', progressionStates, 'Controlled oblique rotation.'));
  }

  blocks.push({
    type: 'core',
    title: 'Core Density & Anti-Extension',
    estimatedMinutes: coreMins,
    exercises: coreExercises
  });

  // ==========================================
  // 4. CARDIO & STAMINA FINISHER (3 to 8 mins)
  // Low-impact & quiet for hostel environment
  // ==========================================
  const cardioMins = durationTier === 'express' ? 3 : durationTier === 'standard' ? 5 : 8;
  const cardioExId = environment === 'hostel' ? 'ex_cardio_hostel_steps' : 'ex_cardio_shadow_box';

  blocks.push({
    type: 'cardio',
    title: 'Cardiovascular Stamina Builder',
    estimatedMinutes: cardioMins,
    exercises: [
      createBlockExercise(
        cardioExId,
        progressionStates,
        environment === 'hostel'
          ? 'Quiet rhythmic movement. Zero floor thumping.'
          : 'Stay light on the balls of your feet; continuous rhythm.'
      )
    ]
  });

  // ==========================================
  // 5. COOL-DOWN BLOCK (2 to 4 mins)
  // ==========================================
  const cooldownMins = durationTier === 'express' ? 2 : durationTier === 'standard' ? 3 : 4;
  blocks.push({
    type: 'cooldown',
    title: 'Decompression & Heart Rate Normalization',
    estimatedMinutes: cooldownMins,
    exercises: [
      createBlockExercise('ex_mob_childs_pose', progressionStates, 'Calm nasal breathing. 4s inhale, 6s exhale.')
    ]
  });

  // Calculate total duration strictly <= 60 minutes
  const totalMins = Math.min(60, blocks.reduce((acc, b) => acc + b.estimatedMinutes, 0));

  return {
    id: `wo_${dayOfWeek.toLowerCase()}_${Date.now()}`,
    name: `${dayOfWeek} - ${dayConfig.focusTheme}`,
    dayOfWeek,
    focusTheme: dayConfig.focusTheme,
    phase: profile.currentPhase,
    environment,
    durationTier,
    totalEstimatedMinutes: totalMins,
    blocks
  };
}

/**
 * Traverses a progression chain to find the user's current highest unlocked exercise.
 * Guarantees hostel equipment compatibility.
 */
function determineUserCurrentProgression(
  chainId: string,
  progressionStates: Record<string, ExerciseProgressionState>,
  environment: TrainingEnvironment
): string {
  const chainExercises = CENTRAL_EXERCISE_REGISTRY
    .filter(e => e.progressionChainId === chainId)
    .sort((a, b) => (a.progressionLevel || 0) - (b.progressionLevel || 0));

  if (chainExercises.length === 0) return 'ex_push_standard';

  // Find highest unlocked that matches environment
  let selected = chainExercises[0];

  for (const ex of chainExercises) {
    // If user has unlocked this or it's level 1
    const state = progressionStates[ex.id];
    const isUnlocked = state?.isUnlocked || ex.progressionLevel === 1;

    // Must be compatible with hostel if environment is hostel
    const isEnvironmentCompatible = ex.modes.includes(environment);

    if (isUnlocked && isEnvironmentCompatible) {
      selected = ex;
    }
  }

  return selected.id;
}
