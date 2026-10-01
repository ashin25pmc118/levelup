import {
  ExerciseCategory,
  ExerciseProgressionState,
  FormRating,
  PerceivedDifficulty,
  PhaseInfo,
  UserFitnessProfile,
  CalisthenicsSkillNode,
  CompletedSetData
} from './fitnessTypes';
import { getExerciseById, CENTRAL_EXERCISE_REGISTRY } from './exerciseRegistry';

// =========================================================================
// 12-MONTH 6-PHASE ROADMAP DEFINITION
// =========================================================================

export const PHASE_ROADMAP_DATA: PhaseInfo[] = [
  {
    phase: 1,
    months: 'Months 1–2 (Weeks 1–8)',
    title: 'Foundation, Joint Integrity & Baseline Awakening',
    primaryFocus: 'Master movement patterns, scapular stabilization, tendon adaptation, and base pushing strength for 10 clean push-ups.',
    targetStaminaMinutes: 10,
    keyMilestones: [
      'Perform 3 sets of 10 clean Standard Push-ups with chest to floor',
      'Hold a rock-solid 45-second Forearm Plank without hip dip',
      'Execute 15 deep, controlled Air Squats with upright chest',
      'Complete 10 minutes of continuous low-impact cardio without breathlessness'
    ]
  },
  {
    phase: 2,
    months: 'Months 3–4 (Weeks 9–16)',
    title: 'Hypertrophy, Core Density & Stamina Building',
    primaryFocus: 'Increase muscle time-under-tension, horizontal pulling volume with doorframes/tables, and core hollow-body compression.',
    targetStaminaMinutes: 15,
    keyMilestones: [
      'Achieve 3 sets of 12 clean Push-ups with 2-second eccentric lowering',
      'Hold a rigid Hollow Body Hold for 35 seconds',
      'Complete 3 sets of 10 Inverted Table Rows or Backpack Rows',
      'Sustain 15 minutes of uninterrupted stamina intervals'
    ]
  },
  {
    phase: 3,
    months: 'Months 5–6 (Weeks 17–24)',
    title: 'Relative Strength & Calisthenics Foundations',
    primaryFocus: 'Introduce high-leverage bodyweight variations: Diamond Push-ups, Pike holds, L-sit compression tucks, and single-leg stability.',
    targetStaminaMinutes: 20,
    keyMilestones: [
      'Complete 3 sets of 10 clean Diamond Push-ups',
      'Hold an L-Sit Tuck off chair or floor for 20 seconds',
      'Execute 3 sets of 10 Pike Push-ups targeting shoulders',
      'Perform 12 pristine Bulgarian Split Squats per leg'
    ]
  },
  {
    phase: 4,
    months: 'Months 7–8 (Weeks 25–32)',
    title: 'Intermediate Strength & Skill Mastery',
    primaryFocus: 'Vertical pulling introduction (dead hangs to pull-ups), Decline Push-ups, and Wall Handstand chest-facing holds.',
    targetStaminaMinutes: 25,
    keyMilestones: [
      'Complete 3 to 5 strict dead-hang Pull-ups (or 8 slow negative pull-ups)',
      'Hold a Chest-to-Wall Handstand for 40 seconds with pointed toes',
      'Complete 3 sets of 12 Decline Push-ups with feet elevated on chair',
      'Execute 25 minutes of steady aerobic/calisthenic conditioning'
    ]
  },
  {
    phase: 5,
    months: 'Months 9–10 (Weeks 33–40)',
    title: 'Advanced Skill Development & Power-Endurance',
    primaryFocus: 'Archer variations, Crow Pose balance mastery, Handstand push-up negatives, and deep hip mobility for pistol squats.',
    targetStaminaMinutes: 30,
    keyMilestones: [
      'Execute 3 sets of 8 Archer Push-ups per arm',
      'Achieve a stable 20-second Crow Pose / Frog Stand arm balance',
      'Perform 5 assisted Single-Leg Pistol Squats per leg',
      'Complete 30 minutes of continuous high-volume calisthenics work'
    ]
  },
  {
    phase: 6,
    months: 'Months 11–12 (Weeks 41–52)',
    title: 'Calisthenics Mastery & Autoregulated Peak',
    primaryFocus: 'Pseudo-Planche leans, freestanding handstand equilibrium, full L-sits, and unbroken 15+ pull-up capacity.',
    targetStaminaMinutes: 35,
    keyMilestones: [
      'Hold a 15-second freestanding Handstand balance',
      'Execute 3 sets of 8 clean Pseudo-Planche Push-ups',
      'Hold a crisp, horizontal Full L-Sit for 15 seconds',
      'Sustain complete physical autonomy with personalized autoregulation'
    ]
  }
];

// =========================================================================
// CALISTHENICS SKILL TREE NODES
// =========================================================================

export const CALISTHENICS_SKILL_NODES: CalisthenicsSkillNode[] = [
  // Push Branch
  {
    id: 'skill_push_1',
    name: 'Wall Push-up Mastery',
    branch: 'push',
    tier: 1,
    exerciseId: 'ex_push_wall',
    prerequisiteNodeIds: [],
    description: 'Foundational joint prep and scapular protraction mechanics.',
    unlockRequirement: 'Available by default',
    masteryTarget: '3 sets of 15 clean reps with strict 2-1-2 tempo',
    xpReward: 50,
    status: 'unlocked'
  },
  {
    id: 'skill_push_2',
    name: 'Incline & Knee Push-up',
    branch: 'push',
    tier: 1,
    exerciseId: 'ex_push_incline',
    prerequisiteNodeIds: ['skill_push_1'],
    description: 'Angled bodyweight leverage building chest and triceps endurance.',
    unlockRequirement: 'Master Wall Push-up (3x15)',
    masteryTarget: '3 sets of 12 reps on low bed/chair with solid core',
    xpReward: 75,
    status: 'unlocked'
  },
  {
    id: 'skill_push_3',
    name: 'Standard Push-up 10+ Reps',
    branch: 'push',
    tier: 2,
    exerciseId: 'ex_push_standard',
    prerequisiteNodeIds: ['skill_push_2'],
    description: 'The golden baseline of bodyweight pushing power.',
    unlockRequirement: 'Master Knee/Incline Push-ups (3x12)',
    masteryTarget: '3 sets of 12 controlled reps, chest touching floor',
    xpReward: 120,
    status: 'unlocked'
  },
  {
    id: 'skill_push_4',
    name: 'Close-Grip & Diamond Push-ups',
    branch: 'push',
    tier: 3,
    exerciseId: 'ex_push_diamond',
    prerequisiteNodeIds: ['skill_push_3'],
    description: 'Concentrated triceps loading and inner pectorals activation.',
    unlockRequirement: 'Master Standard Push-ups (3x12 with Good Form)',
    masteryTarget: '3 sets of 10 diamond pushups with full lockout',
    xpReward: 180,
    status: 'locked'
  },
  {
    id: 'skill_push_5',
    name: 'Decline Push-up Endurance',
    branch: 'push',
    tier: 3,
    exerciseId: 'ex_push_decline',
    prerequisiteNodeIds: ['skill_push_4'],
    description: 'Elevated feet placing 75% bodyweight onto upper clavicular chest.',
    unlockRequirement: 'Master Diamond Push-ups (3x10)',
    masteryTarget: '3 sets of 12 decline reps on 18-inch platform',
    xpReward: 220,
    status: 'locked'
  },
  {
    id: 'skill_push_6',
    name: 'Archer Push-up',
    branch: 'push',
    tier: 4,
    exerciseId: 'ex_push_archer',
    prerequisiteNodeIds: ['skill_push_5'],
    description: 'Asymmetric unilateral pushing bridging towards one-arm push-ups.',
    unlockRequirement: 'Master Decline Push-ups (3x12)',
    masteryTarget: '3 sets of 8 reps per arm with locked trailing arm',
    xpReward: 300,
    status: 'locked'
  },
  {
    id: 'skill_push_7',
    name: 'Pseudo-Planche Push-up',
    branch: 'push',
    tier: 5,
    exerciseId: 'ex_push_pseudo_planche',
    prerequisiteNodeIds: ['skill_push_6'],
    description: 'Forward body lean shifting intense leverage onto shoulders & biceps tendon.',
    unlockRequirement: 'Master Archer Push-ups (3x8/arm)',
    masteryTarget: '3 sets of 8 reps with hands at hip level',
    xpReward: 450,
    status: 'locked'
  },

  // Pull Branch
  {
    id: 'skill_pull_1',
    name: 'Doorframe Row Foundation',
    branch: 'pull',
    tier: 1,
    exerciseId: 'ex_back_doorframe_rows',
    prerequisiteNodeIds: [],
    description: 'Zero-equipment horizontal back retraction using room doorframe.',
    unlockRequirement: 'Available by default',
    masteryTarget: '3 sets of 15 slow reps with 1-sec squeeze',
    xpReward: 50,
    status: 'unlocked'
  },
  {
    id: 'skill_pull_2',
    name: 'Inverted Table / Sheet Rows',
    branch: 'pull',
    tier: 2,
    exerciseId: 'ex_back_table_inverted_rows',
    prerequisiteNodeIds: ['skill_pull_1'],
    description: 'Horizontal bodyweight pull building lats, rhomboids, and biceps.',
    unlockRequirement: 'Master Doorframe Rows (3x15)',
    masteryTarget: '3 sets of 10 clean horizontal rows',
    xpReward: 120,
    status: 'locked'
  },
  {
    id: 'skill_pull_3',
    name: 'Dead Hang Scapular Stability',
    branch: 'pull',
    tier: 2,
    exerciseId: 'ex_back_dead_hang',
    prerequisiteNodeIds: ['skill_pull_1'],
    description: 'Grip fortitude, forearm pump, and shoulder decompression.',
    unlockRequirement: 'Access to bar or secure ledge',
    masteryTarget: '60 seconds continuous dead hang',
    xpReward: 140,
    status: 'locked'
  },
  {
    id: 'skill_pull_4',
    name: 'Pull-up Negative Eccentrics',
    branch: 'pull',
    tier: 3,
    exerciseId: 'ex_back_pullup_negatives',
    prerequisiteNodeIds: ['skill_pull_2', 'skill_pull_3'],
    description: 'Building supreme eccentric back strength to achieve first strict pull-up.',
    unlockRequirement: '45s Dead Hang + 3x10 Table Rows',
    masteryTarget: '3 sets of 5 repetitions with 5-second slow lowering',
    xpReward: 200,
    status: 'locked'
  },
  {
    id: 'skill_pull_5',
    name: 'Strict Bodyweight Pull-up',
    branch: 'pull',
    tier: 4,
    exerciseId: 'ex_back_standard_pullup',
    prerequisiteNodeIds: ['skill_pull_4'],
    description: 'The premier benchmark of upper-body pulling strength.',
    unlockRequirement: 'Master Pull-up Negatives (3x5 with 5s eccentric)',
    masteryTarget: '3 sets of 8 strict dead-hang reps with chin over bar',
    xpReward: 350,
    status: 'locked'
  },

  // Core Branch
  {
    id: 'skill_core_1',
    name: 'Deadbug Motor Control',
    branch: 'core',
    tier: 1,
    exerciseId: 'ex_core_deadbug',
    prerequisiteNodeIds: [],
    description: 'Lumbar-pelvic awareness preventing lower back hyperextension.',
    unlockRequirement: 'Available by default',
    masteryTarget: '3 sets of 12 smooth reps per side',
    xpReward: 50,
    status: 'unlocked'
  },
  {
    id: 'skill_core_2',
    name: 'Rigid Forearm Plank',
    branch: 'core',
    tier: 1,
    exerciseId: 'ex_core_plank',
    prerequisiteNodeIds: ['skill_core_1'],
    description: 'Full-body tension with posterior pelvic tilt.',
    unlockRequirement: 'Master Deadbugs (3x12)',
    masteryTarget: 'Hold 60 seconds with glutes clamped tight',
    xpReward: 90,
    status: 'unlocked'
  },
  {
    id: 'skill_core_3',
    name: 'Hollow Body Hold',
    branch: 'core',
    tier: 2,
    exerciseId: 'ex_core_hollow_body',
    prerequisiteNodeIds: ['skill_core_2'],
    description: 'Gymnastic core cornerstone essential for planches and handstands.',
    unlockRequirement: '60s Forearm Plank',
    masteryTarget: 'Hold 45 seconds with flat lumbar spine against floor',
    xpReward: 160,
    status: 'locked'
  },
  {
    id: 'skill_core_4',
    name: 'L-Sit Tuck Compression',
    branch: 'core',
    tier: 3,
    exerciseId: 'ex_core_lsit_tuck',
    prerequisiteNodeIds: ['skill_core_3'],
    description: 'Depressed scapulae, hip flexor compression, and abdominal torque.',
    unlockRequirement: '45s Hollow Body Hold',
    masteryTarget: 'Hold 25 seconds knees tucked to chest on floor or chair',
    xpReward: 240,
    status: 'locked'
  },
  {
    id: 'skill_core_5',
    name: 'Full Gymnastic L-Sit',
    branch: 'core',
    tier: 5,
    exerciseId: 'ex_core_lsit_full',
    prerequisiteNodeIds: ['skill_core_4'],
    description: 'Straight legs parallel to ground, locked out triceps, supreme core strength.',
    unlockRequirement: 'Master L-Sit Tuck (30s hold)',
    masteryTarget: 'Hold 15 seconds full L-Sit on flat floor',
    xpReward: 450,
    status: 'locked'
  },

  // Shoulders Branch
  {
    id: 'skill_shldr_1',
    name: 'Scapular Wall Angels',
    branch: 'shoulders',
    tier: 1,
    exerciseId: 'ex_shldr_wall_angels',
    prerequisiteNodeIds: [],
    description: 'Restores thoracic spine mobility and shoulder external rotation.',
    unlockRequirement: 'Available by default',
    masteryTarget: '3 sets of 12 reps with forearms glued to wall',
    xpReward: 50,
    status: 'unlocked'
  },
  {
    id: 'skill_shldr_2',
    name: 'Pike Hold & Pike Push-up',
    branch: 'shoulders',
    tier: 2,
    exerciseId: 'ex_shldr_pike_pushup',
    prerequisiteNodeIds: ['skill_shldr_1', 'skill_push_3'],
    description: 'Angles push leverage directly into anterior and lateral deltoids.',
    unlockRequirement: 'Master Standard Push-ups + Scapular Wall Angels',
    masteryTarget: '3 sets of 10 reps with head traveling forward in tripod',
    xpReward: 150,
    status: 'locked'
  },
  {
    id: 'skill_shldr_3',
    name: 'Elevated Pike Push-up',
    branch: 'shoulders',
    tier: 3,
    exerciseId: 'ex_shldr_elevated_pike',
    prerequisiteNodeIds: ['skill_shldr_2'],
    description: 'Feet on chair/bed transferring 80% bodyweight directly overhead.',
    unlockRequirement: 'Master Pike Push-up (3x10)',
    masteryTarget: '3 sets of 8 deep reps with head touching floor',
    xpReward: 220,
    status: 'locked'
  },
  {
    id: 'skill_shldr_4',
    name: 'Chest-to-Wall Handstand Hold',
    branch: 'shoulders',
    tier: 4,
    exerciseId: 'ex_shldr_wall_handstand',
    prerequisiteNodeIds: ['skill_shldr_3'],
    description: 'True straight-line overhead pressing endurance and balance nerve training.',
    unlockRequirement: 'Master Elevated Pike Push-ups (3x8)',
    masteryTarget: 'Hold 60 seconds with active scapular elevation',
    xpReward: 320,
    status: 'locked'
  },
  {
    id: 'skill_shldr_5',
    name: 'Wall Handstand Push-up',
    branch: 'shoulders',
    tier: 5,
    exerciseId: 'ex_shldr_hspu',
    prerequisiteNodeIds: ['skill_shldr_4'],
    description: 'Overhead bodyweight press - ultimate shoulder power.',
    unlockRequirement: '60s Wall Handstand Hold',
    masteryTarget: '3 sets of 5 full-range handstand pushups',
    xpReward: 500,
    status: 'locked'
  },

  // Legs Branch
  {
    id: 'skill_leg_1',
    name: 'Air Squat Perfection',
    branch: 'legs',
    tier: 1,
    exerciseId: 'ex_quad_air_squat',
    prerequisiteNodeIds: [],
    description: 'Deep below-parallel hip hinge and knee tracking under control.',
    unlockRequirement: 'Available by default',
    masteryTarget: '3 sets of 20 clean reps with 3-sec pause at bottom',
    xpReward: 60,
    status: 'unlocked'
  },
  {
    id: 'skill_leg_2',
    name: 'Reverse Lunges & Step-ups',
    branch: 'legs',
    tier: 2,
    exerciseId: 'ex_quad_reverse_lunges',
    prerequisiteNodeIds: ['skill_leg_1'],
    description: 'Unilateral leg strength, knee joint stability, and hip flexor stretch.',
    unlockRequirement: 'Master Air Squat (3x20)',
    masteryTarget: '3 sets of 12 reps per leg without knee collapse',
    xpReward: 110,
    status: 'unlocked'
  },
  {
    id: 'skill_leg_3',
    name: 'Bulgarian Split Squats',
    branch: 'legs',
    tier: 3,
    exerciseId: 'ex_quad_bulgarian_split_squat',
    prerequisiteNodeIds: ['skill_leg_2'],
    description: 'Rear foot elevated on bed/chair - intense single leg quad development.',
    unlockRequirement: 'Master Reverse Lunges (3x12/leg)',
    masteryTarget: '3 sets of 10 deep reps per leg with tall torso',
    xpReward: 180,
    status: 'locked'
  },
  {
    id: 'skill_leg_4',
    name: 'Assisted Pistol Squat',
    branch: 'legs',
    tier: 4,
    exerciseId: 'ex_quad_assisted_pistol',
    prerequisiteNodeIds: ['skill_leg_3'],
    description: 'Single leg squat holding doorframe or bed for counter-balance.',
    unlockRequirement: 'Master Bulgarian Split Squats (3x10/leg)',
    masteryTarget: '3 sets of 6 reps per leg to full depth',
    xpReward: 280,
    status: 'locked'
  },
  {
    id: 'skill_leg_5',
    name: 'Freestanding Pistol Squat',
    branch: 'legs',
    tier: 5,
    exerciseId: 'ex_quad_pistol_squat',
    prerequisiteNodeIds: ['skill_leg_4'],
    description: 'Unassisted single-leg pistol squat with opposite leg extended forward.',
    unlockRequirement: 'Master Assisted Pistol Squat (3x6/leg)',
    masteryTarget: '3 sets of 5 strict reps per leg without wobble',
    xpReward: 450,
    status: 'locked'
  },

  // Balance Branch
  {
    id: 'skill_bal_1',
    name: 'Crow Pose / Frog Stand',
    branch: 'balance',
    tier: 2,
    exerciseId: 'ex_skill_crow_pose',
    prerequisiteNodeIds: ['skill_push_3', 'skill_core_2'],
    description: 'First calisthenics arm balance establishing forward wrist lean confidence.',
    unlockRequirement: 'Standard Push-ups + 45s Plank',
    masteryTarget: 'Hold 20 seconds balanced on palms without feet touching',
    xpReward: 150,
    status: 'unlocked'
  },
  {
    id: 'skill_bal_2',
    name: 'Freestanding Handstand Kick & Hold',
    branch: 'balance',
    tier: 4,
    exerciseId: 'ex_shldr_wall_handstand',
    prerequisiteNodeIds: ['skill_bal_1', 'skill_shldr_4'],
    description: 'Fingertip micro-adjustments and spatial body control.',
    unlockRequirement: '60s Wall Handstand + 20s Crow Pose',
    masteryTarget: 'Hold 15 seconds unsupported freestanding handstand',
    xpReward: 500,
    status: 'locked'
  }
];

// =========================================================================
// PROGRESSION ENGINE CORE ALGORITHMS
// =========================================================================

export interface EvaluationResult {
  nextState: ExerciseProgressionState;
  unlockedNextExerciseId?: string;
  unlockedSkillNodeId?: string;
  statusChanged: 'leveled_up' | 'reps_increased' | 'maintained' | 'form_refinement' | 'deload_recommended';
  progressionMessage: string;
  xpAwarded: number;
}

/**
 * Initializes default progression state for an exercise.
 */
export function getDefaultProgressionState(exerciseId: string, isUnlocked = false): ExerciseProgressionState {
  const ex = getExerciseById(exerciseId);
  return {
    exerciseId,
    currentSets: ex?.defaultSets || 3,
    currentReps: ex?.defaultReps || 10,
    currentDurationSeconds: ex?.defaultDurationSeconds,
    consecutiveCleanSessions: 0,
    consecutiveFailures: 0,
    highestCompletedReps: 0,
    highestCompletedDuration: 0,
    isUnlocked,
    isMastered: false
  };
}

/**
 * Evaluates performance after an active exercise block is completed.
 * Considers sets completed, reps achieved, form rating, and perceived difficulty (RPE).
 * NEVER blindly increases reps; protects joints and ensures technical mastery.
 */
export function evaluateExercisePerformance(
  exerciseId: string,
  sets: CompletedSetData[],
  perceivedDifficulty: PerceivedDifficulty,
  formRating: FormRating,
  currentState: ExerciseProgressionState
): EvaluationResult {
  const exercise = getExerciseById(exerciseId);
  const nextState: ExerciseProgressionState = { ...currentState };
  nextState.lastTrainedDate = new Date().toISOString().split('T')[0];

  const totalSetsCompleted = sets.filter(s => s.completed).length;
  const minRepsAchieved = Math.min(...sets.map(s => s.actualReps));
  const maxRepsAchieved = Math.max(...sets.map(s => s.actualReps));
  if (maxRepsAchieved > (nextState.highestCompletedReps || 0)) {
    nextState.highestCompletedReps = maxRepsAchieved;
  }

  // Base XP for completing the exercise sets
  let xpAwarded = 25;

  // -------------------------------------------------------------
  // CASE 1: Form Rating = 'poor' (Form breakdown / compensatory habits)
  // -------------------------------------------------------------
  if (formRating === 'poor') {
    nextState.consecutiveCleanSessions = 0;
    nextState.consecutiveFailures += 1;

    // If failing with poor form 2+ times, trigger deload/step-back recommendation
    if (nextState.consecutiveFailures >= 2) {
      // Reduce target reps by 2 to rebuild control without injury
      nextState.currentReps = Math.max(6, nextState.currentReps - 2);
      return {
        nextState,
        statusChanged: 'deload_recommended',
        progressionMessage: `Form breakdown detected on ${exercise?.name || 'exercise'}. We adjusted target reps down by 2 so you can rebuild clean joint mechanics without pain. Quality over quantity.`,
        xpAwarded: 10
      };
    }

    return {
      nextState,
      statusChanged: 'form_refinement',
      progressionMessage: `Form was compromised. Target reps held at ${nextState.currentReps}. Slow down the tempo (2s down, 1s pause) next session to solidify your technique.`,
      xpAwarded: 15
    };
  }

  // -------------------------------------------------------------
  // CASE 2: Form Rating = 'minor_mistakes' (Acceptable but unrefined)
  // -------------------------------------------------------------
  if (formRating === 'minor_mistakes') {
    nextState.consecutiveCleanSessions = 0;
    nextState.consecutiveFailures = 0;

    return {
      nextState,
      statusChanged: 'maintained',
      progressionMessage: `Good effort! A few minor form slips occurred. Target held at ${nextState.currentSets} sets × ${nextState.currentReps} reps to cement pristine form before increasing resistance.`,
      xpAwarded: 20
    };
  }

  // -------------------------------------------------------------
  // CASE 3: Form Rating = 'good' (Pristine execution)
  // -------------------------------------------------------------
  nextState.consecutiveCleanSessions += 1;
  nextState.consecutiveFailures = 0;
  xpAwarded += 15; // Bonus for clean form

  // Check if all planned sets were fully completed
  const allSetsComplete = totalSetsCompleted >= nextState.currentSets && minRepsAchieved >= nextState.currentReps;

  // Subcase 3A: Good form, but perceived difficulty was Very Hard (RPE 9-10)
  if (perceivedDifficulty === 'very_hard') {
    return {
      nextState,
      statusChanged: 'maintained',
      progressionMessage: `Completed at your maximum limit with good form! Holding targets at ${nextState.currentReps} reps for your central nervous system and tendons to adapt.`,
      xpAwarded
    };
  }

  // Subcase 3B: Good form, Hard (RPE 8)
  if (perceivedDifficulty === 'hard') {
    // Only increase if they have proven consistency across at least 2 clean sessions
    if (nextState.consecutiveCleanSessions >= 2 && allSetsComplete) {
      nextState.currentReps += 1;
      return {
        nextState,
        statusChanged: 'reps_increased',
        progressionMessage: `Solid consistency! Target bumped by +1 rep (now ${nextState.currentReps} reps). Keep your tempo controlled.`,
        xpAwarded: xpAwarded + 10
      };
    }

    return {
      nextState,
      statusChanged: 'maintained',
      progressionMessage: `Great job completing with clean form. Maintain this rep target one more session to lock in muscle memory.`,
      xpAwarded
    };
  }

  // Subcase 3C: Good form, Moderate or Easy (RPE 5-7) -> Progressive Overload Trigger
  const isModerateOrEasy = perceivedDifficulty === 'moderate' || perceivedDifficulty === 'easy';
  const repIncrement = perceivedDifficulty === 'easy' ? 2 : 1;

  // Check progression ceiling for this exercise (usually 12-15 reps or 60s hold)
  const isTimedExercise = (nextState.currentDurationSeconds || 0) > 0;
  const repCeiling = exercise?.difficulty === 'beginner' ? 15 : 12;
  const timeCeiling = 60; // seconds

  if (isTimedExercise) {
    const curSec = nextState.currentDurationSeconds || 30;
    if (curSec < timeCeiling && allSetsComplete) {
      const addedSec = perceivedDifficulty === 'easy' ? 10 : 5;
      nextState.currentDurationSeconds = Math.min(timeCeiling, curSec + addedSec);
      return {
        nextState,
        statusChanged: 'reps_increased',
        progressionMessage: `Hold duration increased to ${nextState.currentDurationSeconds}s! Excellent core endurance.`,
        xpAwarded: xpAwarded + 15
      };
    }
  } else {
    // Rep based
    if (nextState.currentReps < repCeiling && allSetsComplete) {
      nextState.currentReps += repIncrement;
      return {
        nextState,
        statusChanged: 'reps_increased',
        progressionMessage: `Target increased by +${repIncrement} reps! New target: ${nextState.currentSets} sets × ${nextState.currentReps} reps.`,
        xpAwarded: xpAwarded + 15
      };
    }
  }

  // -------------------------------------------------------------
  // CEILING REACHED & MASTERED -> UNLOCK NEXT EXERCISE IN CHAIN!
  // -------------------------------------------------------------
  if (allSetsComplete && isModerateOrEasy) {
    nextState.isMastered = true;
    let unlockedNextExerciseId: string | undefined;
    let unlockedSkillNodeId: string | undefined;

    if (exercise?.nextExerciseId) {
      unlockedNextExerciseId = exercise.nextExerciseId;
    }

    // Check if any skill node is associated and can be mastered
    const skillNode = CALISTHENICS_SKILL_NODES.find(n => n.exerciseId === exerciseId);
    if (skillNode) {
      unlockedSkillNodeId = skillNode.id;
    }

    const nextEx = unlockedNextExerciseId ? getExerciseById(unlockedNextExerciseId) : undefined;
    const unlockMsg = nextEx
      ? `🎉 MASTERY ACHIEVED! You unlocked the next progression: "${nextEx.name}"!`
      : `🌟 MAXIMUM MASTERY REACHED for ${exercise?.name || 'this exercise'}!`;

    return {
      nextState,
      unlockedNextExerciseId,
      unlockedSkillNodeId,
      statusChanged: 'leveled_up',
      progressionMessage: unlockMsg,
      xpAwarded: xpAwarded + 50
    };
  }

  return {
    nextState,
    statusChanged: 'maintained',
    progressionMessage: `Exercise completed cleanly. Targets held at current levels.`,
    xpAwarded
  };
}

/**
 * Stamina Ladder Progression:
 * Gradually builds user aerobic stamina from 5 min baseline up to 35+ continuous minutes.
 */
export function calculateStaminaProgression(
  currentStaminaMinutes: number,
  completedMinutes: number,
  perceivedDifficulty: PerceivedDifficulty
): { newStaminaMinutes: number; staminaMessage: string; leveledUp: boolean } {
  // If user completed at least 90% of target stamina with moderate or easy effort
  if (completedMinutes >= currentStaminaMinutes * 0.9) {
    if (perceivedDifficulty === 'easy' || perceivedDifficulty === 'moderate') {
      const newMinutes = Math.min(45, currentStaminaMinutes + 5);
      if (newMinutes > currentStaminaMinutes) {
        return {
          newStaminaMinutes: newMinutes,
          staminaMessage: `⚡ Cardiovascular stamina upgraded from ${currentStaminaMinutes} min to ${newMinutes} min!`,
          leveledUp: true
        };
      }
    }
  }

  return {
    newStaminaMinutes: currentStaminaMinutes,
    staminaMessage: `Cardio stamina maintained at ${currentStaminaMinutes} min. Consistency creates endurance!`,
    leveledUp: false
  };
}

/**
 * Checks which calisthenics skill nodes are currently unlocked for the user.
 */
export function getUpdatedSkillNodes(
  masteredSkillIds: string[],
  progressionStates: Record<string, ExerciseProgressionState>
): CalisthenicsSkillNode[] {
  return CALISTHENICS_SKILL_NODES.map(node => {
    // Check if already mastered
    const isMastered = masteredSkillIds.includes(node.id) || progressionStates[node.exerciseId]?.isMastered;
    if (isMastered) {
      return { ...node, status: 'mastered' as const };
    }

    // Check if prerequisites are satisfied
    if (node.prerequisiteNodeIds.length === 0) {
      return { ...node, status: 'unlocked' as const };
    }

    const prereqsSatisfied = node.prerequisiteNodeIds.every(prereqId => {
      const pNode = CALISTHENICS_SKILL_NODES.find(n => n.id === prereqId);
      if (!pNode) return true;
      return (
        masteredSkillIds.includes(prereqId) ||
        progressionStates[pNode.exerciseId]?.isMastered ||
        progressionStates[pNode.exerciseId]?.consecutiveCleanSessions >= 2
      );
    });

    return {
      ...node,
      status: (prereqsSatisfied ? 'unlocked' : 'locked') as 'locked' | 'unlocked' | 'mastered'
    };
  });
}
