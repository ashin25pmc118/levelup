export type CharacterTitle = 
  | 'Apprentice'
  | 'Mind Seeker'
  | 'Iron Striker'
  | 'Shadow Scholar'
  | 'Calm Sovereign'
  | 'Disciplined Adept'
  | 'Rising Vanguard';

export type StatType = 
  | 'strength'
  | 'stamina'
  | 'focus'
  | 'reflex'
  | 'awareness'
  | 'knowledge'
  | 'recovery'
  | 'confidence'
  | 'discipline';

export interface UserProfile {
  id: string;
  name: string;
  title: CharacterTitle;
  avatarIcon: string; // e.g. 'sword', 'shield', 'brain', 'zap', 'crown'
  level: number;
  currentXP: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  todayXP: number;
  todayDate: string; // YYYY-MM-DD
  stats: Record<StatType, number>; // 1-100 scale
  goals: string[];
  wakeTime: string;
  sleepTime: string;
  workoutTier: 'beginner' | 'intermediate' | 'advanced';
  confidenceTier: 'low-confidence' | 'comfortable' | 'capable' | 'confident';
  streakShields?: number; // 0 to 2 shields for anti-burnout streak protection
  lastShieldUsedDate?: string; // YYYY-MM-DD
  createdAt: string;
}

export type TimetableCategory = 
  | 'college'
  | 'exam'
  | 'work'
  | 'holiday'
  | 'personal'
  | 'custom';

export interface TimetableTemplate {
  id: string;
  name: string;
  category: TimetableCategory;
  icon: string;
  color: string;
  description: string;
  isDefault?: boolean;
}

export interface TimetableEvent {
  id: string;
  templateId: string;
  dayOfWeek?: number; // 0 (Sun) - 6 (Sat) for recurring
  date?: string; // YYYY-MM-DD for single date override
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  title: string;
  category: TimetableCategory;
  color: string;
  icon: string;
  notes?: string;
  reminderMinutes?: number;
  isCompleted?: boolean;
  isSkipped?: boolean;
  xpAwarded?: number;
}

export interface DateModeMapping {
  date: string; // YYYY-MM-DD
  templateId: string;
}

export type MuscleGroup = 
  | 'chest'
  | 'legs'
  | 'core'
  | 'back'
  | 'arms'
  | 'cardio'
  | 'full-body'
  | 'mobility';

export type ExerciseEnvironment = 'home' | 'hostel' | 'both';

export interface ExerciseFormGuide {
  summary: string;
  setup: string[];
  execution: string[];
  commonMistakes: string[];
  breathing: string;
  illustrationType?:
    | 'lateral_raise'
    | 'shoulder_press'
    | 'pushup'
    | 'squat'
    | 'plank'
    | 'row'
    | 'curl'
    | 'dip'
    | 'lunge'
    | 'wall_sit'
    | 'glute_bridge'
    | 'pullup'
    | 'core_hollow'
    | 'core_leg_raise'
    | 'core_bicycle'
    | 'core_twist'
    | 'core_climber'
    | 'lsit';
  beginnerTip?: string;
  primaryMuscles?: string[];
  progressionTip?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'stamina' | 'mobility';
  muscleGroup: MuscleGroup;
  defaultSets: number;
  defaultReps: number;
  defaultDurationSeconds?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  environment?: ExerciseEnvironment; // 'home' (dumbbells), 'hostel' (zero equipment), or 'both'
  formGuide?: ExerciseFormGuide;
  isCustom?: boolean;
  personalRecord?: {
    reps?: number;
    weightKg?: number;
    durationSeconds?: number;
    date: string;
  };
  notes?: string;
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weightKg?: number;
  durationSeconds?: number;
  completed: boolean;
}

export interface WorkoutLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: string; // YYYY-MM-DD
  sets: WorkoutSet[];
  notes?: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  xpEarned: number;
  completedAt: string;
}

export interface CardioSession {
  id: string;
  activityType: 'walking' | 'running' | 'cycling' | 'other';
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  distanceKm?: number;
  averagePace?: string;
  notes?: string;
  xpEarned: number;
  completedAt: string;
}

export interface FocusSession {
  id: string;
  type: 'pomodoro' | 'deep_work' | 'custom';
  durationMinutes: number;
  completedAt: string;
  date: string; // YYYY-MM-DD
  distractionsCount: number;
  notes?: string;
  xpEarned: number;
}

export interface ReflexScore {
  id: string;
  timestamp: string;
  reactionTimeMs: number;
  rating: 'Godlike' | 'Master' | 'Fast' | 'Average' | 'Slow';
  xpEarned: number;
}

export interface ConfidenceQuest {
  id: string;
  title: string;
  description: string;
  tier: 'beginner' | 'intermediate' | 'advanced';
  xpValue: number;
  exampleContext: string;
  isCompleted?: boolean;
  completedAt?: string;
  reflectionNote?: string;
}

export interface DailyQuest {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'train' | 'study' | 'focus' | 'confidence' | 'recovery' | 'routine';
  targetXp: number;
  statTarget?: StatType;
  description?: string;
  isCustom?: boolean;
  orderIndex?: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface SkillMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  currentXP: number;
  totalPracticeMinutes: number;
  sessionsCount: number;
  streak: number;
  statsSynergy?: StatType[]; // RPG stats boosted by deliberate practice
  milestones?: SkillMilestone[]; // Sub-skills or milestones
  lastPracticedDate?: string;
  notes?: string;
  goals?: string;
  createdAt: string;
}

export interface SkillSession {
  id: string;
  skillId: string;
  date: string;
  durationMinutes: number;
  notes?: string;
  xpEarned: number;
}

export type NoteCategory = 
  | 'Quick Notes'
  | 'Don\'t Forget'
  | 'Study'
  | 'Ideas'
  | 'Personal'
  | 'Projects'
  | 'Goals';

export interface NoteChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  checklist?: NoteChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  recurringType: 'none' | 'daily' | 'weekly';
  timetableEventId?: string;
  isCompleted: boolean;
  isSnoozed?: boolean;
  snoozeUntil?: string;
  notes?: string;
  createdAt: string;
}

export interface XPTransaction {
  id: string;
  timestamp: string;
  amount: number;
  source: 'workout' | 'focus' | 'study' | 'confidence' | 'quest' | 'timetable' | 'skill' | 'reflex' | 'bonus' | 'routine';
  description: string;
  statTarget: StatType;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  stat: StatType;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string; // YYYY-MM-DD
  xpEarned: number;
  questsCompleted: number;
  workoutMinutes: number;
  focusMinutes: number;
  improvedNote: string;
  improveNextWeekNote: string;
  skippedNote: string;
  proudOfNote: string;
  completedAt: string;
}

export interface AppSettings {
  theme: 'cyber-slate' | 'midnight-abyss' | 'clean-light' | 'monochrome-pattern';
  soundEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  notificationsEnabled: boolean;
  dailyXpTarget: number;
  dailyXpSoftCap: number; // e.g. 350 XP
  onboardingCompleted: boolean;
}

export interface FullBackupData {
  version: string;
  exportedAt: string;
  profile: UserProfile;
  timetableTemplates: TimetableTemplate[];
  timetableEvents: TimetableEvent[];
  dateModeMappings: DateModeMapping[];
  exercises: Exercise[];
  workoutLogs: WorkoutLog[];
  cardioSessions: CardioSession[];
  focusSessions: FocusSession[];
  reflexScores: ReflexScore[];
  confidenceQuests: ConfidenceQuest[];
  dailyQuests: DailyQuest[];
  skills: Skill[];
  skillSessions: SkillSession[];
  notes: Note[];
  reminders: Reminder[];
  xpTransactions: XPTransaction[];
  achievements: Achievement[];
  weeklyReviews: WeeklyReview[];
  settings: AppSettings;
  fitnessProfile?: import('../services/fitness/fitnessTypes').UserFitnessProfile;
  progressionStates?: Record<string, import('../services/fitness/fitnessTypes').ExerciseProgressionState>;
  benchmarkRecords?: import('../services/fitness/fitnessTypes').BenchmarkRecord[];
  fitnessSessions?: import('../services/fitness/fitnessTypes').CompletedWorkoutSession[];
}
