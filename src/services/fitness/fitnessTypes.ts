// Centralized TypeScript Models for the 12-Month Fitness & Calisthenics System

export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'full-body'
  | 'cardio'
  | 'mobility'
  | 'calisthenics-skills';

export type TrainingEnvironment = 'home' | 'hostel';

export type EquipmentType =
  | 'none'
  | 'floor'
  | 'wall'
  | 'bed'
  | 'chair'
  | 'table'
  | 'doorframe'
  | 'backpack'
  | 'pullup_bar';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseMuscleTarget {
  primary: string[];
  secondary: string[];
}

export interface CentralExercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: ExerciseMuscleTarget;
  equipment: EquipmentType[];
  modes: TrainingEnvironment[];
  difficulty: ExerciseDifficulty;
  progressionChainId?: string;
  progressionLevel?: number; // 1 to 9 within the chain
  previousExerciseId?: string | null;
  nextExerciseId?: string | null;
  prerequisites: string[]; // Exercise IDs that should be unlocked/comfortable first
  defaultSets: number;
  defaultReps: number;
  defaultDurationSeconds?: number;
  restSeconds: number;
  tempo: string; // e.g. "3-1-1", "2-1-2", "Isometric Hold"
  breathing: string;
  setupSteps: string[];
  movementSteps: string[];
  commonMistakes: string[];
  safetyNotes: string[];
  beginnerVariation: string;
  progressionTarget: string; // e.g. "3 sets x 12 reps with good form"
  visualGuideId: string; // Matches SVG illustration type
  isQuietForHostel: boolean;
}

// 12-Month Program Phases
export type WorkoutPhase = 1 | 2 | 3 | 4 | 5 | 6;

export interface PhaseInfo {
  phase: WorkoutPhase;
  months: string;
  title: string;
  primaryFocus: string;
  targetStaminaMinutes: number;
  keyMilestones: string[];
}

export type WorkoutBlockType = 'warmup' | 'strength' | 'core' | 'cardio' | 'cooldown';

export interface WorkoutBlockExercise {
  exerciseId: string;
  name: string;
  sets: number;
  targetReps: number;
  targetDurationSeconds?: number;
  restSeconds: number;
  tempo: string;
  coachingCue: string;
}

export interface WorkoutBlock {
  type: WorkoutBlockType;
  title: string;
  estimatedMinutes: number;
  exercises: WorkoutBlockExercise[];
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  focusTheme: string;
  phase: WorkoutPhase;
  environment: TrainingEnvironment;
  durationTier: 'express' | 'standard' | 'full'; // 15-20m, 30-40m, 45-55m (<= 60m always)
  totalEstimatedMinutes: number;
  blocks: WorkoutBlock[];
}

// Active Workout Session & Evaluation
export type PerceivedDifficulty = 'easy' | 'moderate' | 'hard' | 'very_hard';
export type FormRating = 'good' | 'minor_mistakes' | 'poor';

export interface CompletedSetData {
  setNumber: number;
  targetReps: number;
  actualReps: number;
  targetDurationSeconds?: number;
  actualDurationSeconds?: number;
  completed: boolean;
}

export interface ExerciseSessionResult {
  exerciseId: string;
  exerciseName: string;
  sets: CompletedSetData[];
  perceivedDifficulty: PerceivedDifficulty;
  formRating: FormRating;
  notes?: string;
}

export interface CompletedWorkoutSession {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  totalDurationMinutes: number;
  environment: TrainingEnvironment;
  exercises: ExerciseSessionResult[];
  overallRpe: PerceivedDifficulty;
  totalXpEarned: number;
  progressiveOverloadUnlocked: string[]; // Names of exercises that progressed
  avgHeartRate?: number | null;
  peakHeartRate?: number | null;
  recoveryRateBpm?: number | null;
}

// User Fitness State & Progression
export interface ExerciseProgressionState {
  exerciseId: string;
  currentSets: number;
  currentReps: number;
  currentDurationSeconds?: number;
  consecutiveCleanSessions: number;
  consecutiveFailures: number;
  highestCompletedReps: number;
  highestCompletedDuration?: number;
  isUnlocked: boolean;
  isMastered: boolean;
  lastTrainedDate?: string;
}

export interface UserFitnessProfile {
  environment: TrainingEnvironment;
  currentPhase: WorkoutPhase;
  currentWeek: number; // 1 to 52 (across 12 months)
  baselinePushups: number; // approx 10 for beginner
  currentStaminaMinutes: number; // 5 -> 30 mins
  recoveryStatus: 'fresh' | 'recovered' | 'fatigued';
  preferredDurationTier: 'express' | 'standard' | 'full';
  totalWorkoutsCompleted: number;
  currentWorkoutStreak: number;
  longestWorkoutStreak: number;
  lastWorkoutDate?: string;
  masteredSkillIds: string[];
}

// Calisthenics Skill Tree
export type SkillTreeBranch = 'push' | 'pull' | 'core' | 'shoulders' | 'legs' | 'balance';

export interface CalisthenicsSkillNode {
  id: string;
  name: string;
  branch: SkillTreeBranch;
  tier: 1 | 2 | 3 | 4 | 5;
  exerciseId: string;
  prerequisiteNodeIds: string[];
  description: string;
  unlockRequirement: string;
  masteryTarget: string;
  xpReward: number;
  status: 'locked' | 'unlocked' | 'mastered';
}

// Benchmark Fitness Tests
export type FitnessBenchmarkType =
  | 'max_pushups'
  | 'plank_hold'
  | 'squats_2min'
  | 'dead_hang'
  | 'pullups_max'
  | 'hollow_hold'
  | 'cardio_test';

export interface BenchmarkRecord {
  id: string;
  testType: FitnessBenchmarkType;
  title: string;
  unit: 'reps' | 'seconds' | 'minutes';
  bestScore: number;
  lastTestDate: string;
  history: Array<{
    date: string;
    score: number;
    notes?: string;
  }>;
}
