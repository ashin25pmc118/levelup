import {
  UserProfile,
  TimetableTemplate,
  TimetableEvent,
  DateModeMapping,
  Exercise,
  WorkoutLog,
  CardioSession,
  FocusSession,
  ReflexScore,
  ConfidenceQuest,
  DailyQuest,
  Skill,
  SkillSession,
  Note,
  Reminder,
  XPTransaction,
  Achievement,
  WeeklyReview,
  AppSettings,
  FullBackupData
} from '../types';
import {
  UserFitnessProfile,
  ExerciseProgressionState,
  BenchmarkRecord,
  FitnessBenchmarkType,
  CompletedWorkoutSession
} from './fitness/fitnessTypes';

const STORAGE_KEYS = {
  PROFILE: 'levelup_profile',
  TEMPLATES: 'levelup_templates',
  EVENTS: 'levelup_events',
  DATE_MODES: 'levelup_date_modes',
  EXERCISES: 'levelup_exercises',
  WORKOUT_LOGS: 'levelup_workout_logs',
  CARDIO_SESSIONS: 'levelup_cardio_sessions',
  FOCUS_SESSIONS: 'levelup_focus_sessions',
  REFLEX_SCORES: 'levelup_reflex_scores',
  CONFIDENCE_QUESTS: 'levelup_confidence_quests',
  DAILY_QUESTS: 'levelup_daily_quests',
  SKILLS: 'levelup_skills',
  SKILL_SESSIONS: 'levelup_skill_sessions',
  NOTES: 'levelup_notes',
  REMINDERS: 'levelup_reminders',
  XP_TRANSACTIONS: 'levelup_xp_transactions',
  ACHIEVEMENTS: 'levelup_achievements',
  WEEKLY_REVIEWS: 'levelup_weekly_reviews',
  SETTINGS: 'levelup_settings',
  FITNESS_PROFILE: 'levelup_fitness_profile',
  PROGRESSION_STATES: 'levelup_progression_states',
  BENCHMARK_RECORDS: 'levelup_benchmark_records',
  FITNESS_SESSIONS: 'levelup_fitness_sessions'
};

const DEFAULT_FITNESS_PROFILE: UserFitnessProfile = {
  environment: 'home',
  currentPhase: 1,
  currentWeek: 1,
  baselinePushups: 10,
  currentStaminaMinutes: 10,
  recoveryStatus: 'fresh',
  preferredDurationTier: 'standard',
  totalWorkoutsCompleted: 0,
  currentWorkoutStreak: 0,
  longestWorkoutStreak: 0,
  masteredSkillIds: []
};

const DEFAULT_BENCHMARK_RECORDS: BenchmarkRecord[] = [
  {
    id: 'bench_pushups',
    testType: 'max_pushups',
    title: 'Max Push-ups in Single Set',
    unit: 'reps',
    bestScore: 10,
    lastTestDate: new Date().toISOString().split('T')[0],
    history: [{ date: new Date().toISOString().split('T')[0], score: 10, notes: 'Baseline evaluation' }]
  },
  {
    id: 'bench_plank',
    testType: 'plank_hold',
    title: 'Max Forearm Plank Hold',
    unit: 'seconds',
    bestScore: 40,
    lastTestDate: new Date().toISOString().split('T')[0],
    history: [{ date: new Date().toISOString().split('T')[0], score: 40, notes: 'Baseline evaluation' }]
  },
  {
    id: 'bench_squats',
    testType: 'squats_2min',
    title: '2-Minute Bodyweight Squats',
    unit: 'reps',
    bestScore: 25,
    lastTestDate: new Date().toISOString().split('T')[0],
    history: [{ date: new Date().toISOString().split('T')[0], score: 25, notes: 'Baseline evaluation' }]
  },
  {
    id: 'bench_deadhang',
    testType: 'dead_hang',
    title: 'Bar / Ledge Dead Hang',
    unit: 'seconds',
    bestScore: 25,
    lastTestDate: new Date().toISOString().split('T')[0],
    history: [{ date: new Date().toISOString().split('T')[0], score: 25, notes: 'Baseline evaluation' }]
  },
  {
    id: 'bench_hollow',
    testType: 'hollow_hold',
    title: 'Hollow Body Hold',
    unit: 'seconds',
    bestScore: 20,
    lastTestDate: new Date().toISOString().split('T')[0],
    history: [{ date: new Date().toISOString().split('T')[0], score: 20, notes: 'Baseline evaluation' }]
  },
  {
    id: 'bench_cardio',
    testType: 'cardio_test',
    title: 'Continuous Aerobic Stamina',
    unit: 'minutes',
    bestScore: 10,
    lastTestDate: new Date().toISOString().split('T')[0],
    history: [{ date: new Date().toISOString().split('T')[0], score: 10, notes: 'Baseline evaluation' }]
  }
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'user_main',
  name: 'Hunter',
  title: 'Apprentice',
  avatarIcon: 'sword',
  level: 1,
  currentXP: 35,
  totalXP: 35,
  currentStreak: 1,
  longestStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  todayXP: 35,
  todayDate: new Date().toISOString().split('T')[0],
  stats: {
    strength: 15,
    stamina: 12,
    focus: 18,
    reflex: 10,
    awareness: 14,
    knowledge: 20,
    recovery: 16,
    confidence: 12,
    discipline: 15
  },
  goals: ['Consistency over perfection', 'Gain physical & mental resilience', 'Social confidence'],
  wakeTime: '07:00',
  sleepTime: '23:00',
  workoutTier: 'beginner',
  confidenceTier: 'comfortable',
  streakShields: 1,
  createdAt: new Date().toISOString()
};

const DEFAULT_TEMPLATES: TimetableTemplate[] = [
  {
    id: 'tmpl_college',
    name: 'College',
    category: 'college',
    icon: 'GraduationCap',
    color: '#06b6d4', // cyan
    description: 'Weekday university and lecture schedule',
    isDefault: true
  },
  {
    id: 'tmpl_exam',
    name: 'Exam Mode',
    category: 'exam',
    icon: 'BookOpen',
    color: '#f59e0b', // amber
    description: 'High intensity revision and mock tests'
  },
  {
    id: 'tmpl_work',
    name: 'Work',
    category: 'work',
    icon: 'Briefcase',
    color: '#3b82f6', // blue
    description: 'Professional shift & deep sprints'
  },
  {
    id: 'tmpl_personal',
    name: 'Personal / Weekend',
    category: 'personal',
    icon: 'Home',
    color: '#10b981', // emerald
    description: 'Self-care, creative pursuits & hobbies'
  },
  {
    id: 'tmpl_holiday',
    name: 'Holiday',
    category: 'holiday',
    icon: 'Palmtree',
    color: '#ec4899', // pink
    description: 'Active rest, nature & recovery'
  }
];

const DEFAULT_EVENTS: TimetableEvent[] = [
  {
    id: 'evt_1',
    templateId: 'tmpl_college',
    startTime: '08:00',
    endTime: '09:00',
    title: 'Morning Routine & Healthy Breakfast',
    category: 'personal',
    color: '#10b981',
    icon: 'Coffee',
    isCompleted: true,
    xpAwarded: 15
  },
  {
    id: 'evt_2',
    templateId: 'tmpl_college',
    startTime: '09:15',
    endTime: '11:00',
    title: 'Core Lecture & Conceptual Study',
    category: 'college',
    color: '#06b6d4',
    icon: 'GraduationCap',
    isCompleted: false,
    xpAwarded: 30
  },
  {
    id: 'evt_3',
    templateId: 'tmpl_college',
    startTime: '11:30',
    endTime: '12:30',
    title: 'Deep Focus / Project Assignment',
    category: 'college',
    color: '#8b5cf6',
    icon: 'Brain',
    isCompleted: false,
    xpAwarded: 25
  },
  {
    id: 'evt_4',
    templateId: 'tmpl_college',
    startTime: '13:00',
    endTime: '14:00',
    title: 'Nutritious Lunch & Screen Break',
    category: 'personal',
    color: '#10b981',
    icon: 'Eye',
    isCompleted: false,
    xpAwarded: 10
  },
  {
    id: 'evt_5',
    templateId: 'tmpl_college',
    startTime: '16:00',
    endTime: '17:00',
    title: 'Bodyweight Workout & Calisthenics',
    category: 'personal',
    color: '#f97316',
    icon: 'Dumbbell',
    isCompleted: false,
    xpAwarded: 25
  },
  {
    id: 'evt_6',
    templateId: 'tmpl_college',
    startTime: '21:00',
    endTime: '21:45',
    title: 'Confidence Quest & Reflection Log',
    category: 'personal',
    color: '#a855f7',
    icon: 'MessageSquare',
    isCompleted: false,
    xpAwarded: 20
  },
  // EXAM MODE SCHEDULE (6:30 AM - 11:00 PM)
  {
    id: 'evt_ex_1',
    templateId: 'tmpl_exam',
    startTime: '06:30',
    endTime: '06:45',
    title: 'Wake up + Water + Freshen up',
    category: 'personal',
    color: '#06b6d4',
    icon: 'Sun',
    notes: 'Hydrate immediately to kickstart brain function',
    xpAwarded: 10
  },
  {
    id: 'evt_ex_2',
    templateId: 'tmpl_exam',
    startTime: '06:45',
    endTime: '07:15',
    title: '🧘 Light exercise / stretching + eye exercises',
    category: 'personal',
    color: '#10b981',
    icon: 'Activity',
    notes: 'Light dumbbell mobility & 20-20-20 eye care',
    xpAwarded: 15
  },
  {
    id: 'evt_ex_3',
    templateId: 'tmpl_exam',
    startTime: '07:15',
    endTime: '07:45',
    title: 'Bath + Get ready',
    category: 'personal',
    color: '#3b82f6',
    icon: 'Sparkles',
    notes: 'Cold/warm shower to feel energized',
    xpAwarded: 10
  },
  {
    id: 'evt_ex_4',
    templateId: 'tmpl_exam',
    startTime: '07:45',
    endTime: '08:15',
    title: '🍳 Breakfast',
    category: 'personal',
    color: '#f59e0b',
    icon: 'Coffee',
    notes: 'High protein & healthy brain fuel',
    xpAwarded: 10
  },
  {
    id: 'evt_ex_5',
    templateId: 'tmpl_exam',
    startTime: '08:15',
    endTime: '10:15',
    title: '🔥 Deep Study Session 1 — Difficult Subject',
    category: 'exam',
    color: '#ef4444',
    icon: 'BookOpen',
    notes: 'Peak morning mental clarity. Attack hardest concepts first!',
    xpAwarded: 35
  },
  {
    id: 'evt_ex_6',
    templateId: 'tmpl_exam',
    startTime: '10:15',
    endTime: '10:30',
    title: 'Break',
    category: 'personal',
    color: '#64748b',
    icon: 'Clock',
    notes: 'Step away from screen/desk, rest eyes',
    xpAwarded: 5
  },
  {
    id: 'evt_ex_7',
    templateId: 'tmpl_exam',
    startTime: '10:30',
    endTime: '12:00',
    title: '📚 Deep Study Session 2 — Second Topic',
    category: 'exam',
    color: '#f59e0b',
    icon: 'BookOpen',
    notes: 'Focused second topic study block',
    xpAwarded: 30
  },
  {
    id: 'evt_ex_8',
    templateId: 'tmpl_exam',
    startTime: '12:00',
    endTime: '12:30',
    title: 'Lunch / Rest',
    category: 'personal',
    color: '#10b981',
    icon: 'Coffee',
    notes: 'Light nutritious lunch without heavy food coma',
    xpAwarded: 10
  },
  {
    id: 'evt_ex_9',
    templateId: 'tmpl_exam',
    startTime: '12:30',
    endTime: '13:30',
    title: '📝 Revision + Active Recall',
    category: 'exam',
    color: '#8b5cf6',
    icon: 'CheckSquare',
    notes: 'Flashcards, formula tests, self-quizzing',
    xpAwarded: 25
  },
  {
    id: 'evt_ex_10',
    templateId: 'tmpl_exam',
    startTime: '13:30',
    endTime: '14:00',
    title: 'Break / Relax',
    category: 'personal',
    color: '#64748b',
    icon: 'Clock',
    notes: 'Power nap or light relaxation',
    xpAwarded: 5
  },
  {
    id: 'evt_ex_11',
    templateId: 'tmpl_exam',
    startTime: '14:00',
    endTime: '16:00',
    title: '🔥 Deep Study Session 3 — Important Questions/Problems',
    category: 'exam',
    color: '#ef4444',
    icon: 'Flame',
    notes: 'Solve high-weightage numericals and past paper questions',
    xpAwarded: 35
  },
  {
    id: 'evt_ex_12',
    templateId: 'tmpl_exam',
    startTime: '16:00',
    endTime: '16:30',
    title: 'Snack + Rest',
    category: 'personal',
    color: '#f59e0b',
    icon: 'Coffee',
    notes: 'Fruit, nuts, hydration',
    xpAwarded: 5
  },
  {
    id: 'evt_ex_13',
    templateId: 'tmpl_exam',
    startTime: '16:30',
    endTime: '17:30',
    title: '💻 Programming Practice / SQL / Practical Work',
    category: 'college',
    color: '#06b6d4',
    icon: 'Code',
    notes: 'Hands-on coding drills, queries, and lab exercises',
    xpAwarded: 25
  },
  {
    id: 'evt_ex_14',
    templateId: 'tmpl_exam',
    startTime: '17:30',
    endTime: '18:15',
    title: '🏃 Exercise / Walk / Play (Dumbbell Workout)',
    category: 'personal',
    color: '#f97316',
    icon: 'Dumbbell',
    notes: 'Use 2.5kg / 5kg dumbbells: shoulder press, curls, goblet squats, walk',
    xpAwarded: 25
  },
  {
    id: 'evt_ex_15',
    templateId: 'tmpl_exam',
    startTime: '18:15',
    endTime: '19:00',
    title: 'Shower + Relax',
    category: 'personal',
    color: '#3b82f6',
    icon: 'Sparkles',
    notes: 'Reset mind and unwind',
    xpAwarded: 10
  },
  {
    id: 'evt_ex_16',
    templateId: 'tmpl_exam',
    startTime: '19:00',
    endTime: '20:00',
    title: '📖 Light Revision',
    category: 'exam',
    color: '#a855f7',
    icon: 'BookOpen',
    notes: 'Skim summaries, definitions, cheat sheets',
    xpAwarded: 20
  },
  {
    id: 'evt_ex_17',
    templateId: 'tmpl_exam',
    startTime: '20:00',
    endTime: '20:30',
    title: '🍽️ Dinner',
    category: 'personal',
    color: '#10b981',
    icon: 'Coffee',
    notes: 'Healthy evening meal',
    xpAwarded: 10
  },
  {
    id: 'evt_ex_18',
    templateId: 'tmpl_exam',
    startTime: '20:30',
    endTime: '21:30',
    title: '🧠 Previous Questions + Recall Without Notes',
    category: 'exam',
    color: '#ec4899',
    icon: 'Brain',
    notes: 'Test recall from memory without looking at notes',
    xpAwarded: 25
  },
  {
    id: 'evt_ex_19',
    templateId: 'tmpl_exam',
    startTime: '21:30',
    endTime: '21:45',
    title: '📱 Friends / Family / Messages',
    category: 'personal',
    color: '#8b5cf6',
    icon: 'MessageSquare',
    notes: 'Short social check-in',
    xpAwarded: 5
  },
  {
    id: 'evt_ex_20',
    templateId: 'tmpl_exam',
    startTime: '21:45',
    endTime: '22:15',
    title: 'Plan Tomorrow + Prepare Study Materials',
    category: 'personal',
    color: '#06b6d4',
    icon: 'Calendar',
    notes: 'Set books and objectives ready on desk',
    xpAwarded: 15
  },
  {
    id: 'evt_ex_21',
    templateId: 'tmpl_exam',
    startTime: '22:15',
    endTime: '22:45',
    title: 'Relax, No Heavy Studying',
    category: 'personal',
    color: '#64748b',
    icon: 'Moon',
    notes: 'Dim lights, listen to calm music or meditate',
    xpAwarded: 10
  },
  {
    id: 'evt_ex_22',
    templateId: 'tmpl_exam',
    startTime: '22:45',
    endTime: '23:00',
    title: '😴 Sleep Preparation',
    category: 'personal',
    color: '#6366f1',
    icon: 'Moon',
    notes: 'Put phone away, brush teeth, wind down',
    xpAwarded: 10
  },
  {
    id: 'evt_ex_23',
    templateId: 'tmpl_exam',
    startTime: '23:00',
    endTime: '06:30',
    title: '🛌 Sleep & Recovery',
    category: 'personal',
    color: '#4338ca',
    icon: 'Moon',
    notes: '7.5 hours uninterrupted restorative sleep',
    xpAwarded: 20
  }
];

const DEFAULT_EXERCISES: Exercise[] = [
  // --- 🏠 HOME MODE: 2.5 KG & 5 KG DUMBBELL EXERCISES ---
  {
    id: 'ex_db_lateral_raise',
    name: 'Dumbbell Lateral Raises (Side Delts)',
    category: 'strength',
    muscleGroup: 'arms',
    defaultSets: 4,
    defaultReps: 20,
    difficulty: 'beginner',
    environment: 'home',
    notes: 'PERFECT for 2.5kg! Keep elbows slightly bent, raise to shoulder height, hold 2s at top for boulder shoulders.',
    formGuide: {
      summary: 'The ultimate side-delt builder. 2.5kg is the ideal weight because heavy weights force neck traps to take over.',
      setup: [
        'Stand with feet shoulder-width apart, holding 2.5kg dumbbells at your sides.',
        'Brace your core and roll your shoulders slightly back and down.',
        'Keep a soft, 15-degree bend in your elbows throughout the entire set.'
      ],
      execution: [
        'Raise both arms out to the sides in a wide arc until dumbbells reach shoulder level (parallel to floor).',
        'Pause and squeeze your side deltoids for 2 full seconds at the peak.',
        'Lower slowly over 3 controlled seconds. Do not let weights drop or bounce off your thighs.'
      ],
      commonMistakes: [
        'Swinging your hips or arching your lower back to heave the weights.',
        'Lifting higher than shoulder height (engages traps and strains rotator cuff).',
        'Shrugging your neck up toward your ears.'
      ],
      breathing: 'Exhale forcefully as you lift outwards; inhale smoothly as you lower down.',
      illustrationType: 'lateral_raise'
    }
  },
  {
    id: 'ex_db_shoulder_press',
    name: 'Dumbbell Overhead Shoulder Press',
    category: 'strength',
    muscleGroup: 'arms',
    defaultSets: 3,
    defaultReps: 15,
    difficulty: 'beginner',
    environment: 'home',
    notes: 'Hold 2.5kg - 5kg at shoulders, press straight up, lower slowly in 3 seconds.',
    formGuide: {
      summary: 'Builds broad shoulders, front delts, and upper body pushing power.',
      setup: [
        'Stand tall or sit upright with dumbbells held at shoulder height.',
        'Palms facing forward or slightly angled inward at 45 degrees.',
        'Keep ribs tucked down and core engaged so lower back does not overarch.'
      ],
      execution: [
        'Press dumbbells straight overhead until arms are extended but not locked out.',
        'Hold for 1 second at top with bicep near ear.',
        'Lower under complete control over 3 seconds back to ear level.'
      ],
      commonMistakes: [
        'Overarching your lower back when pressing.',
        'Banging dumbbells together violently at the top.',
        'Dropping arms too low below chin level.'
      ],
      breathing: 'Exhale as you press upward; inhale as you lower the weights back to shoulders.',
      illustrationType: 'shoulder_press'
    }
  },
  {
    id: 'ex_db_bicep_curl',
    name: 'Dumbbell Bicep Curls (3-Sec Negative)',
    category: 'strength',
    muscleGroup: 'arms',
    defaultSets: 3,
    defaultReps: 15,
    difficulty: 'beginner',
    environment: 'home',
    notes: 'Curl up explosively, squeeze biceps at top, take 3 full seconds to lower down.',
    formGuide: {
      summary: 'Forces maximum bicep muscle fiber activation by using slow eccentric lowering.',
      setup: [
        'Hold dumbbells at arms length with palms facing forward.',
        'Pin your elbows tight against your ribcage (they should never drift backward).'
      ],
      execution: [
        'Curl weights upward while keeping upper arms completely stationary.',
        'Squeeze your biceps hard at the peak for 1 second.',
        'Take 3 slow seconds to lower the dumbbells back down until arms are straight.'
      ],
      commonMistakes: [
        'Swinging your elbows forward like a pendulum.',
        'Leaning back to cheat the weight up.'
      ],
      breathing: 'Exhale on the curl up; inhale on the 3-second descent.',
      illustrationType: 'curl'
    }
  },
  {
    id: 'ex_db_hammer_curl',
    name: 'Dumbbell Hammer Curls',
    category: 'strength',
    muscleGroup: 'arms',
    defaultSets: 3,
    defaultReps: 15,
    difficulty: 'beginner',
    environment: 'home',
    notes: 'Thumbs facing up. Builds forearm thickness and brachialis for bigger arms.',
    formGuide: {
      summary: 'Targets the brachialis muscle underneath the bicep, pushing the bicep up for a taller peak.',
      setup: [
        'Hold dumbbells with palms facing each other (neutral hammer grip).',
        'Stand upright with shoulders back.'
      ],
      execution: [
        'Curl the weights upward while maintaining neutral palms.',
        'Squeeze forearms and outer arms at the top.',
        'Lower smoothly in 3 seconds.'
      ],
      commonMistakes: [
        'Twisting wrists during the curl.',
        'Using momentum from the torso.'
      ],
      breathing: 'Exhale as you hammer curl up; inhale on release.',
      illustrationType: 'curl'
    }
  },
  {
    id: 'ex_db_bent_row',
    name: 'Bent-Over Dumbbell Rows (Back & Lats)',
    category: 'strength',
    muscleGroup: 'back',
    defaultSets: 3,
    defaultReps: 18,
    difficulty: 'beginner',
    environment: 'home',
    notes: 'Hinge forward 45 deg, pull elbows back towards hips and squeeze shoulder blades together.',
    formGuide: {
      summary: 'Counters long study desk slouching by strengthening mid-back, rhomboids, and lats.',
      setup: [
        'Hold dumbbells, hinge at hips 45 degrees, knees softly bent.',
        'Keep spine completely straight like a flat table.'
      ],
      execution: [
        'Drive your elbows up and back toward your pockets.',
        'Squeeze your shoulder blades together like you are pinching a pencil.',
        'Lower slowly to full arm stretch.'
      ],
      commonMistakes: [
        'Rounding your lower back like a scared cat.',
        'Pulling with your biceps instead of driving your elbows back.'
      ],
      breathing: 'Exhale as you row up; inhale as you lower.',
      illustrationType: 'row'
    }
  },
  {
    id: 'ex_db_floor_press',
    name: 'Dumbbell Floor Chest Press',
    category: 'strength',
    muscleGroup: 'chest',
    defaultSets: 4,
    defaultReps: 20,
    difficulty: 'beginner',
    environment: 'home',
    notes: 'Lie on floor/mat, press dumbbells upward over chest. Safer on shoulders than bench press.',
    formGuide: {
      summary: 'Chest builder that prevents rotator cuff impingement because the floor stops hyperextension.',
      setup: [
        'Lie flat on back on floor or yoga mat, knees bent, feet flat.',
        'Hold dumbbells over chest with elbows resting lightly on the ground at a 45-degree angle.'
      ],
      execution: [
        'Press dumbbells upward until arms are straight above chest.',
        'Squeeze chest muscles together at top.',
        'Lower slowly until triceps gently touch the floor, pause, and repeat.'
      ],
      commonMistakes: [
        'Flaring elbows straight out at 90 degrees to ears.',
        'Bouncing elbows off the floor hard.'
      ],
      breathing: 'Exhale as you press upward; inhale as you lower.',
      illustrationType: 'pushup'
    }
  },
  {
    id: 'ex_db_goblet_squat',
    name: 'Goblet Squats (with Dumbbell)',
    category: 'strength',
    muscleGroup: 'legs',
    defaultSets: 4,
    defaultReps: 20,
    difficulty: 'beginner',
    environment: 'home',
    notes: 'Hold 1 dumbbell (5kg) vertically at chest. Squat down to parallel, keeping chest high.',
    formGuide: {
      summary: 'The king of quad and glute developers. Holding weight at chest keeps the spine naturally upright.',
      setup: [
        'Stand with feet slightly wider than shoulder-width, toes turned out 15 degrees.',
        'Hold 1 dumbbell vertically with both hands under the top plate at your sternum.'
      ],
      execution: [
        'Push your hips back and bend knees, sitting down between your legs.',
        'Squat down until thighs are parallel to floor or elbows touch inside knees.',
        'Drive through your heels to stand back up, squeezing glutes at the top.'
      ],
      commonMistakes: [
        'Letting knees cave inwards.',
        'Rising onto toes (keep heels glued to floor).'
      ],
      breathing: 'Inhale on the way down; exhale forcefully as you drive out of the bottom.',
      illustrationType: 'squat'
    }
  },
  {
    id: 'ex_db_rdl',
    name: 'Dumbbell Romanian Deadlift (RDL)',
    category: 'strength',
    muscleGroup: 'legs',
    defaultSets: 3,
    defaultReps: 15,
    difficulty: 'beginner',
    environment: 'home',
    notes: 'Hold dumbbells in hands, push hips back, slight knee bend, feel hamstring stretch.',
    formGuide: {
      summary: 'Target hamstrings and posterior chain for bulletproof lower back posture.',
      setup: [
        'Stand tall with dumbbells in front of thighs.',
        'Slight 10-degree knee bend, chest up.'
      ],
      execution: [
        'Push your hips directly backward as if trying to touch the wall behind you.',
        'Slide dumbbells down close to shins until you feel a deep stretch in hamstrings.',
        'Drive hips forward to return to standing.'
      ],
      commonMistakes: [
        'Squatting down instead of hinging hips back.',
        'Rounding your back or letting dumbbells drift far from your legs.'
      ],
      breathing: 'Inhale going down into the stretch; exhale driving hips forward.',
      illustrationType: 'squat'
    }
  },

  // --- 🏢 HOSTEL MODE: 100% ZERO EQUIPMENT / QUIET ROOM EXERCISES ---
  {
    id: 'ex_hostel_wall_sit',
    name: 'Hostel Wall Sits (Zero Noise)',
    category: 'strength',
    muscleGroup: 'legs',
    defaultSets: 4,
    defaultReps: 1,
    defaultDurationSeconds: 45,
    difficulty: 'beginner',
    environment: 'hostel',
    notes: '100% silent hostel exercise! Press back flat against hostel wall, 90-degree thigh angle.',
    formGuide: {
      summary: 'The ultimate quiet hostel leg burner. Requires zero equipment and does not shake the room floor.',
      setup: [
        'Find any flat wall or door in your hostel room.',
        'Lean your back flat against the wall, slide down until thighs are parallel to floor (90° knee angle).',
        'Feet flat, knees directly above ankles.'
      ],
      execution: [
        'Hold this isometric position without moving for 45-60 seconds.',
        'Keep your entire back and shoulders pressed firmly against the wall.',
        'Do not rest your hands on your knees.'
      ],
      commonMistakes: [
        'Thighs not low enough (must be parallel at 90 degrees).',
        'Resting hands on knees to cheat weight off quads.'
      ],
      breathing: 'Steady, deep nasal breaths throughout the entire hold.',
      illustrationType: 'wall_sit'
    }
  },
  {
    id: 'ex_hostel_bed_dip',
    name: 'Hostel Bed / Chair Tricep Dips',
    category: 'strength',
    muscleGroup: 'arms',
    defaultSets: 3,
    defaultReps: 15,
    difficulty: 'beginner',
    environment: 'hostel',
    notes: 'Use the edge of your hostel bed or study desk chair for horseshoe triceps.',
    formGuide: {
      summary: 'Builds tricep tone and pushing strength using everyday hostel furniture.',
      setup: [
        'Sit on the edge of your bed or study chair, place hands beside hips with fingers pointing forward.',
        'Extend legs forward with heels on ground, slide hips forward just off the edge.'
      ],
      execution: [
        'Lower your body by bending elbows until upper arms reach 90 degrees.',
        'Keep your back close to the furniture edge.',
        'Press through palms to push back up, locking out triceps at top.'
      ],
      commonMistakes: [
        'Letting hips drift too far away from the chair (strains front shoulder capsule).',
        'Shrugging shoulders into ears.'
      ],
      breathing: 'Inhale on the way down; exhale as you press up.',
      illustrationType: 'dip'
    }
  },
  {
    id: 'ex_hostel_snow_angels',
    name: 'Reverse Snow Angels (Post-Study Posture)',
    category: 'strength',
    muscleGroup: 'back',
    defaultSets: 3,
    defaultReps: 15,
    difficulty: 'beginner',
    environment: 'hostel',
    notes: 'Lie face down on hostel floor/mat. Moves shoulder blades to fix student hunchback.',
    formGuide: {
      summary: 'Antidote to study fatigue. Activates rear deltoids, rhomboids, and lower traps without equipment.',
      setup: [
        'Lie face down on the floor with arms by your sides, palms facing the ceiling.',
        'Hover your chest and hands 2 inches off the ground.'
      ],
      execution: [
        'Slowly sweep your arms in a wide arc overhead like making a snow angel, keeping them off the floor.',
        'Squeeze your shoulder blades together throughout the entire circle.',
        'Return smoothly back to hips.'
      ],
      commonMistakes: [
        'Letting hands touch the ground.',
        'Craning your neck upward (keep chin tucked).'
      ],
      breathing: 'Inhale as arms arc overhead; exhale as they return to your sides.',
      illustrationType: 'row'
    }
  },
  {
    id: 'ex_hostel_door_row',
    name: 'Hostel Doorframe Bodyweight Rows',
    category: 'strength',
    muscleGroup: 'back',
    defaultSets: 3,
    defaultReps: 15,
    difficulty: 'beginner',
    environment: 'hostel',
    notes: 'Grip inside hostel doorframe, lean back, pull chest to frame. Pure bodyweight back workout.',
    formGuide: {
      summary: 'Solves the hardest problem in hostel fitness: training back/pull muscles without a pullup bar.',
      setup: [
        'Stand in front of an open hostel room doorway.',
        'Grip the doorframe with both hands at chest height, place toes near the base of the frame.',
        'Lean backward until arms are fully extended.'
      ],
      execution: [
        'Pull your chest forward until it touches the doorframe, squeezing your back muscles hard.',
        'Lower yourself back down with control.',
        'Change foot position to adjust difficulty (closer to frame = harder).'
      ],
      commonMistakes: [
        'Sagging hips (keep body rigid like a plank).',
        'Jerking with the neck.'
      ],
      breathing: 'Exhale as you pull chest to frame; inhale as you lower back.',
      illustrationType: 'row'
    }
  },
  {
    id: 'ex_hostel_glute_bridge',
    name: 'Floor Glute Bridges (Hip Opener)',
    category: 'strength',
    muscleGroup: 'legs',
    defaultSets: 3,
    defaultReps: 20,
    difficulty: 'beginner',
    environment: 'both',
    notes: 'Reverses tight hip flexors and wakes up glutes from long hours of sitting in lectures.',
    formGuide: {
      summary: 'Restores pelvic alignment and glute activation after hours sitting at a study desk.',
      setup: [
        'Lie flat on your back on the floor, knees bent, feet flat on ground hip-width apart.',
        'Arms resting by your sides.'
      ],
      execution: [
        'Drive through your heels to bridge your hips upward until your knees, hips, and shoulders form a straight line.',
        'Squeeze your glutes hard at the top for 2 seconds.',
        'Lower hips slowly without completely resting on the floor, then bridge again.'
      ],
      commonMistakes: [
        'Hyperextending the lower back at the top.',
        'Pushing through toes instead of heels.'
      ],
      breathing: 'Exhale as you bridge hips up; inhale as you lower down.',
      illustrationType: 'glute_bridge'
    }
  },

  // --- 🏠 & 🏢 SHARED BODYWEIGHT BASICS ---
  {
    id: 'ex_pushups',
    name: 'Standard Push-ups',
    category: 'strength',
    muscleGroup: 'chest',
    defaultSets: 3,
    defaultReps: 15,
    difficulty: 'beginner',
    environment: 'both',
    notes: 'Keep core tight, elbows tucked at 45 degrees. Safe for both Home and Hostel.',
    formGuide: {
      summary: 'The ultimate upper-body calisthenics foundation. Builds chest, shoulders, and triceps.',
      setup: [
        'Hands on floor slightly wider than shoulder width.',
        'Feet together, body forming a straight ruler from head to heels.'
      ],
      execution: [
        'Lower chest down until it is 2 inches above the ground.',
        'Keep elbows tucked at 45 degrees (do NOT flare out at 90 degrees).',
        'Push the floor away explosively back to starting plank.'
      ],
      commonMistakes: [
        'Sagging hips or piking butt in the air.',
        'Flaring elbows out wide into a T-shape (damages shoulders).'
      ],
      breathing: 'Inhale on the way down; exhale as you push up.',
      illustrationType: 'pushup'
    }
  },
  {
    id: 'ex_squats',
    name: 'Bodyweight Air Squats',
    category: 'strength',
    muscleGroup: 'legs',
    defaultSets: 3,
    defaultReps: 20,
    difficulty: 'beginner',
    environment: 'both',
    notes: 'Knees tracking over toes, full depth down to parallel.',
    formGuide: {
      summary: 'Essential leg builder for speed, mobility, and knee health.',
      setup: [
        'Feet shoulder-width apart, arms held out for counter-balance.',
        'Chest up, shoulders back.'
      ],
      execution: [
        'Sit back into your hips, sinking down until hip crease is parallel to knees.',
        'Drive back up through midfoot and heels, locking out hips.'
      ],
      commonMistakes: [
        'Knees collapsing inward.',
        'Lifting heels off the ground.'
      ],
      breathing: 'Inhale as you squat down; exhale standing up.',
      illustrationType: 'squat'
    }
  },
  {
    id: 'ex_plank',
    name: 'Forearm Plank',
    category: 'strength',
    muscleGroup: 'core',
    defaultSets: 3,
    defaultReps: 1,
    defaultDurationSeconds: 45,
    difficulty: 'beginner',
    environment: 'both',
    notes: 'Neutral spine, glutes squeezed. Quiet, effective core builder.',
    formGuide: {
      summary: 'Total core brace. Protects your lumbar spine from study-related back ache.',
      setup: [
        'Rest on forearms with elbows directly under shoulders.',
        'Legs straight back with toes on the floor.'
      ],
      execution: [
        'Contract your abs and squeeze glutes like someone is about to punch your stomach.',
        'Maintain a flat back and breathe steadily for the full duration.'
      ],
      commonMistakes: [
        'Holding your breath.',
        'Sagging belly toward the floor.'
      ],
      breathing: 'Slow, steady breathing; do not hold your breath.',
      illustrationType: 'plank'
    }
  },
  {
    id: 'ex_stretch',
    name: 'Full Body Mobility Routine',
    category: 'mobility',
    muscleGroup: 'mobility',
    defaultSets: 1,
    defaultReps: 1,
    defaultDurationSeconds: 300,
    difficulty: 'beginner',
    environment: 'both',
    notes: 'Hamstring stretch, chest opener, cat-cow, hip flexors'
  },

  // --- 🔥 ABS & CORE MASTER SESSION ---
  {
    id: 'ex_core_hollow_body',
    name: 'Hollow Body Hold (Deep Core & Abs)',
    category: 'strength',
    muscleGroup: 'core',
    defaultSets: 3,
    defaultReps: 1,
    defaultDurationSeconds: 40,
    difficulty: 'intermediate',
    environment: 'both',
    notes: 'The gold standard of gymnastic core strength. Lower back glued flat to floor, toes pointed, arms overhead.',
    formGuide: {
      summary: 'Activates the transverse abdominis and deep abdominal wall for an iron core.',
      primaryMuscles: ['Transverse Abdominis (Deep Core)', 'Rectus Abdominis (Six-Pack)', 'Hip Flexors'],
      beginnerTip: 'Beginner Secret: Your lower back MUST stay glued into the floor like superglue! If your lower back arches, bend one or both knees into your chest to shorten the lever.',
      progressionTip: 'Reach arms straight back past your ears with toes pointed as your core compression strengthens.',
      setup: [
        'Lie flat on your back, legs straight and together, arms reaching overhead.',
        'Tilt your pelvis backward until your lower back is pressed completely flat into the floor.'
      ],
      execution: [
        'Lift shoulders and legs 4-6 inches off the floor simultaneously, forming a shallow banana shape.',
        'Brace your abs like you are bracing for impact.',
        'Hold without letting lower back arch off the floor for the full duration.'
      ],
      commonMistakes: [
        'Allowing space between lower back and floor (arch).',
        'Craning neck too far forward.'
      ],
      breathing: 'Short, controlled shallow breaths while maintaining full core brace.',
      illustrationType: 'core_hollow'
    }
  },
  {
    id: 'ex_core_hanging_leg_raises',
    name: 'Lying Floor Leg Raises (Lower Abs)',
    category: 'strength',
    muscleGroup: 'core',
    defaultSets: 3,
    defaultReps: 15,
    difficulty: 'beginner',
    environment: 'both',
    notes: 'Control the descent over 3 seconds! Prevents lower belly pooch and builds lower abdominal fibers.',
    formGuide: {
      summary: 'Directly isolates the lower abdominal wall and hip flexors.',
      primaryMuscles: ['Lower Abdominals', 'Hip Flexors', 'Obliques'],
      beginnerTip: 'Place hands under your glutes for lower back support. Take 3 full seconds to lower your legs — never let your heels slam onto the ground.',
      progressionTip: 'Stop 2 inches above the ground and hold a 1-second pause before raising back up.',
      setup: [
        'Lie flat on back with legs extended straight, hands placed under glutes for lumbar support.'
      ],
      execution: [
        'Raise legs upward until perpendicular to the floor (90 degrees).',
        'Lower legs slowly toward the floor without touching heels to the ground.',
        'Stop 2 inches above the ground and immediately raise again.'
      ],
      commonMistakes: [
        'Using swinging momentum or arching lower back on descent.',
        'Bending knees excessively.'
      ],
      breathing: 'Exhale raising legs up; inhale lowering down slowly.',
      illustrationType: 'core_leg_raise'
    }
  },
  {
    id: 'ex_core_bicycle_crunches',
    name: 'Bicycle Crunches (Obliques & Six-Pack)',
    category: 'strength',
    muscleGroup: 'core',
    defaultSets: 3,
    defaultReps: 20,
    difficulty: 'beginner',
    environment: 'both',
    notes: 'Slow, rotational cadence. Touch opposite elbow to opposite knee, pause 1 second per side.',
    formGuide: {
      summary: 'Rated by biomechanical studies as one of the most effective six-pack and oblique exercises.',
      primaryMuscles: ['Internal & External Obliques', 'Rectus Abdominis'],
      beginnerTip: 'Never yank on your neck with your hands. Look across at the wall and rotate your shoulder/ribcage to your opposite knee.',
      progressionTip: 'Hold the elbow-to-knee contact for a full 2-second squeeze on every rep.',
      setup: [
        'Lie on back with fingertips behind ears, knees bent at 90 degrees hovering off ground.'
      ],
      execution: [
        'Rotate right elbow across to touch left knee while fully extending right leg out.',
        'Pause for 1 second, then rotate left elbow to right knee while extending left leg.',
        'Focus on rib-to-hip rotational squeeze rather than pulling your neck.'
      ],
      commonMistakes: [
        'Yanking neck with hands.',
        'Moving too fast without holding the rotational contraction.'
      ],
      breathing: 'Exhale with each diagonal knee drive; inhale during the center transition.',
      illustrationType: 'core_bicycle'
    }
  },
  {
    id: 'ex_core_russian_twists',
    name: 'Russian Twists (Rotational Core Power)',
    category: 'strength',
    muscleGroup: 'core',
    defaultSets: 3,
    defaultReps: 24,
    difficulty: 'beginner',
    environment: 'both',
    notes: 'Sit at 45-degree angle, hover feet for extra burn. Twist entire torso from side to side.',
    formGuide: {
      summary: 'Builds tapered waistline, rotational athletics, and strong obliques.',
      primaryMuscles: ['Rotational Obliques', 'Transverse Abdominis'],
      beginnerTip: 'Beginners can rest heels lightly on the floor. Rotate your whole ribcage from side to side, not just your hands.',
      progressionTip: 'Elevate your feet 3 inches off the ground to activate full isometric core stability.',
      setup: [
        'Sit on floor, bend knees, lean torso backward at a 45-degree angle.',
        'Lift feet 3 inches off the ground (or keep heels lightly on floor for beginners).'
      ],
      execution: [
        'Clasp hands in front of chest and rotate torso fully to the right side, touching floor beside hip.',
        'Rotate across to the left side in a steady, controlled rhythm.'
      ],
      commonMistakes: [
        'Rounding lower back into a slouch.',
        'Only moving arms instead of rotating the whole torso.'
      ],
      breathing: 'Rhythmic breathing with every twist.',
      illustrationType: 'core_twist'
    }
  },
  {
    id: 'ex_core_mountain_climbers',
    name: 'Mountain Climbers (Core Burn & Stamina)',
    category: 'stamina',
    muscleGroup: 'core',
    defaultSets: 3,
    defaultReps: 30,
    difficulty: 'beginner',
    environment: 'both',
    notes: 'Drive knees rhythmically into chest from push-up plank. Burns visceral belly fat and builds core endurance.',
    formGuide: {
      summary: 'Dynamic core conditioning that burns calories while testing shoulder and abdominal stability.',
      primaryMuscles: ['Cardio & Core Stamina', 'Shoulders', 'Lower Abs'],
      beginnerTip: 'Keep your hips down level with your shoulders. Start with slow, rhythmic knee drives before turning it into a sprint.',
      progressionTip: 'Sprint at full speed for 30 seconds with whisper-quiet, light toe taps.',
      setup: [
        'Start in a solid high push-up plank with hands under shoulders and flat back.'
      ],
      execution: [
        'Drive one knee straight forward toward chest, toes off floor.',
        'Quickly switch legs in a running motion while keeping hips completely level and shoulders steady.'
      ],
      commonMistakes: [
        'Bouncing hips high in the air.',
        'Letting hands drift forward.'
      ],
      breathing: 'Deep, steady rhythm in through nose, out through mouth.',
      illustrationType: 'core_climber'
    }
  },

  // --- 🥋 CALISTHENICS BODYWEIGHT MASTERY ---
  {
    id: 'ex_calisthenics_pullup',
    name: 'Calisthenics Strict Pull-ups',
    category: 'strength',
    muscleGroup: 'back',
    defaultSets: 3,
    defaultReps: 8,
    difficulty: 'intermediate',
    environment: 'both',
    notes: 'Full dead-hang to chin over bar. The undisputed king of upper-body calisthenics pulling power.',
    formGuide: {
      summary: 'Builds a wide V-taper back, massive lats, and iron grip strength using only bodyweight.',
      primaryMuscles: ['Latissimus Dorsi (Lats)', 'Biceps', 'Rhomboids', 'Grip'],
      beginnerTip: 'Beginner Secret: If you cannot pull yourself up yet, do Negative Pull-ups! Jump to the top of the bar and take 5 slow seconds to lower down to a dead-hang.',
      progressionTip: 'Pause for 2 seconds with chin cleared over the bar and chest touching the metal.',
      setup: [
        'Grip pull-up bar with overhand grip slightly wider than shoulder width.',
        'Hang freely with straight arms (dead-hang), engage core to eliminate swinging.'
      ],
      execution: [
        'Depress shoulder blades down, drive elbows down to floor, and pull chest up to bar.',
        'Clear chin over the bar, pause for 1 second.',
        'Lower under complete control back to full dead-hang.'
      ],
      commonMistakes: [
        'Kicking legs or kipping for momentum.',
        'Half-reps without full elbow extension at the bottom.'
      ],
      breathing: 'Exhale forcefully as you pull up; inhale smoothly lowering down.',
      illustrationType: 'pullup'
    }
  },
  {
    id: 'ex_calisthenics_dips',
    name: 'Parallel Bar / Bench Calisthenics Dips',
    category: 'strength',
    muscleGroup: 'arms',
    defaultSets: 3,
    defaultReps: 12,
    difficulty: 'intermediate',
    environment: 'both',
    notes: 'Lower until upper arms are parallel to floor, press up powerfully. Builds thick horseshoe triceps and chest.',
    formGuide: {
      summary: 'The upper-body squat of calisthenics. Loads entire bodyweight onto triceps, chest, and front delts.',
      primaryMuscles: ['Triceps', 'Lower Chest', 'Anterior Deltoids'],
      beginnerTip: 'Lower until upper arms are parallel to the bars (90°). Do NOT drop lower than 90° to protect your shoulder joints.',
      progressionTip: 'Add a 2-second pause at the bottom 90° mark before pressing to lockout.',
      setup: [
        'Mount parallel bars (or place hands on sturdy chairs/bench), lock out arms, torso upright or slightly angled forward.'
      ],
      execution: [
        'Lower body smoothly by bending elbows until upper arms reach 90 degrees parallel to bars.',
        'Press downward into bars to return to lockout, squeezing triceps at the top.'
      ],
      commonMistakes: [
        'Dipping too deep below 90 degrees (strains anterior shoulder capsule).',
        'Shrugging shoulders into ears.'
      ],
      breathing: 'Inhale on way down; exhale driving upward.',
      illustrationType: 'dip'
    }
  },
  {
    id: 'ex_calisthenics_diamond_pushups',
    name: 'Diamond Push-ups (Inner Chest & Triceps)',
    category: 'strength',
    muscleGroup: 'chest',
    defaultSets: 3,
    defaultReps: 12,
    difficulty: 'intermediate',
    environment: 'both',
    notes: 'Hands form a diamond under center of chest. High muscle fiber recruitment for triceps and chest cleavage.',
    formGuide: {
      summary: 'A calisthenics staple that shifts maximum load onto triceps and inner chest fibers.',
      primaryMuscles: ['Triceps (Inner & Lateral Heads)', 'Inner Chest'],
      beginnerTip: 'Beginner Secret: Drop to your knees or place hands on an elevated bed/desk first until your triceps build pressing power.',
      progressionTip: 'Touch your chest gently to the back of your thumbs on every single rep.',
      setup: [
        'Set up in a push-up plank, bring index fingers and thumbs together directly under chest forming a diamond.'
      ],
      execution: [
        'Lower chest slowly until it gently touches the back of your hands.',
        'Keep elbows tucked close to ribcage.',
        'Push the floor away to full arm extension.'
      ],
      commonMistakes: [
        'Elbows flaring excessively wide.',
        'Sagging hips.'
      ],
      breathing: 'Inhale descending; exhale driving up.',
      illustrationType: 'pushup'
    }
  },
  {
    id: 'ex_calisthenics_pike_pushups',
    name: 'Pike Push-ups (Shoulders & Handstand Prep)',
    category: 'strength',
    muscleGroup: 'arms',
    defaultSets: 3,
    defaultReps: 10,
    difficulty: 'intermediate',
    environment: 'both',
    notes: 'Hips held high in inverted V. Mimics vertical overhead dumbbell pressing without equipment.',
    formGuide: {
      summary: 'Builds boulder shoulders and vertical pressing power, serving as the gateway to handstand pushups.',
      primaryMuscles: ['Anterior & Lateral Deltoids', 'Triceps', 'Upper Chest'],
      beginnerTip: 'Hips high in an inverted V. Lower the crown of your head forward in front of your hands forming a tripod, then push back.',
      progressionTip: 'Elevate your feet on a chair to transfer more bodyweight onto your shoulders.',
      setup: [
        'Start in push-up position, walk feet forward while lifting hips high into an inverted V (downward dog).',
        'Hands shoulder-width apart, looking back toward feet.'
      ],
      execution: [
        'Lower the crown of your head forward in a tripod angle between hands.',
        'Push through shoulders and palms to press back up to inverted V.'
      ],
      commonMistakes: [
        'Letting hips drop into regular push-up.',
        'Flaring elbows out sideways.'
      ],
      breathing: 'Inhale lowering head toward floor; exhale pressing back up.',
      illustrationType: 'shoulder_press'
    }
  },
  {
    id: 'ex_calisthenics_bulgarian_squat',
    name: 'Bulgarian Split Squats (Single-Leg Mastery)',
    category: 'strength',
    muscleGroup: 'legs',
    defaultSets: 3,
    defaultReps: 12,
    difficulty: 'intermediate',
    environment: 'both',
    notes: 'Rear foot elevated on bed or chair. Isolates each quad and glute, fixing muscle imbalances and knee stability.',
    formGuide: {
      summary: 'Eliminates strength imbalances between left and right legs while building massive quad and glute strength.',
      primaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
      beginnerTip: 'Place rear foot on chair/bed. Lower straight down — your front knee should stay in line with your middle toes.',
      progressionTip: 'Hold a 2.5kg or 5kg dumbbell in each hand or pause 2 seconds at the bottom.',
      setup: [
        'Stand 2 feet in front of a bed, bench, or chair. Place top of one foot elevated behind you.',
        'Keep torso tall, core engaged.'
      ],
      execution: [
        'Lower hips straight down until front thigh is parallel to floor (front knee tracking over midfoot).',
        'Drive through front heel to return to top without locking knee.'
      ],
      commonMistakes: [
        'Front knee collapsing inward.',
        'Front foot placed too close to bench.'
      ],
      breathing: 'Inhale going down; exhale driving back up.',
      illustrationType: 'lunge'
    }
  },
  {
    id: 'ex_calisthenics_lsit',
    name: 'L-Sit / Chair Tuck Hold',
    category: 'strength',
    muscleGroup: 'core',
    defaultSets: 3,
    defaultReps: 1,
    defaultDurationSeconds: 25,
    difficulty: 'advanced',
    environment: 'both',
    notes: 'Hands on floor or two study chairs, push down to lift entire body with legs straight out. Supreme bodyweight control.',
    formGuide: {
      summary: 'Elite calisthenics skill combining scapular depression, tricep lockout, and hip flexor/core compression.',
      primaryMuscles: ['Deep Core & Abs', 'Hip Flexors', 'Triceps', 'Lats'],
      beginnerTip: 'Beginner Secret: Start with a Tucked L-Sit! Pull your knees tight to your chest while pressing down to lift your body.',
      progressionTip: 'Extend one leg straight out while keeping the other tucked, then alternate legs until you can hold both straight.',
      setup: [
        'Sit between two parallel chairs (or on floor with palms flat beside hips).'
      ],
      execution: [
        'Press hands down forcefully to depress shoulders and lift body off the ground.',
        'Extend legs straight out horizontally in an L-shape (or tuck knees if beginner).',
        'Hold without shaking for 20-30 seconds.'
      ],
      commonMistakes: [
        'Shrugging shoulders up toward ears.',
        'Letting feet drop to the floor.'
      ],
      breathing: 'Calm, steady breathing while holding isometric tension.',
      illustrationType: 'lsit'
    }
  }
];

const DEFAULT_CONFIDENCE_QUESTS: ConfidenceQuest[] = [
  // Beginner
  {
    id: 'cq_1',
    title: 'Warm Eye Contact & Nod',
    description: 'Make gentle 2-second eye contact with a cashier, barista, or classmate and give a polite nod.',
    tier: 'beginner',
    xpValue: 15,
    exampleContext: 'Grocery store checkout, entering a classroom, or elevator.'
  },
  {
    id: 'cq_2',
    title: 'Genuine "Good Morning / Thank You"',
    description: 'Say thank you or good morning clearly with warmth rather than mumbling under your breath.',
    tier: 'beginner',
    xpValue: 15,
    exampleContext: 'To a bus driver, security guard, or professor.'
  },
  {
    id: 'cq_3',
    title: 'Ask a Simple Practical Question',
    description: 'Ask someone for the time, where a room is, or what page the lecture is on.',
    tier: 'beginner',
    xpValue: 20,
    exampleContext: 'Campus library, gym, or hallway.'
  },
  // Intermediate
  {
    id: 'cq_4',
    title: 'Start a 30-Second Micro-Conversation',
    description: 'Comment on the weather, lecture, or coffee while waiting in line with a peer.',
    tier: 'intermediate',
    xpValue: 25,
    exampleContext: '"Is this the queue for room 204? That last class was intense."'
  },
  {
    id: 'cq_5',
    title: 'Share Your Authentic Opinion',
    description: 'Express what you think about a topic in a conversation instead of just saying "I don\'t mind".',
    tier: 'intermediate',
    xpValue: 25,
    exampleContext: 'Choosing a restaurant with peers, or discussing an assignment.'
  },
  {
    id: 'cq_6',
    title: 'Make That Phone Call',
    description: 'Call someone instead of postponing it with a text message (e.g. appointment or family check-in).',
    tier: 'intermediate',
    xpValue: 30,
    exampleContext: 'Doctor appointment, customer service, or checking in on a relative.'
  },
  // Advanced
  {
    id: 'cq_7',
    title: 'Ask a Question in Public / Class',
    description: 'Raise your hand and ask a clarifying question in front of a group.',
    tier: 'advanced',
    xpValue: 40,
    exampleContext: 'During a lecture, team standup, or workshop.'
  },
  {
    id: 'cq_8',
    title: 'Introduce Yourself to Someone New',
    description: 'Walk up to someone you haven\'t met yet, say "Hey, I\'m [Name], good to meet you".',
    tier: 'advanced',
    xpValue: 45,
    exampleContext: 'At a club meeting, social gathering, or study group.'
  }
];

const DEFAULT_DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'dq_1',
    date: new Date().toISOString().split('T')[0],
    title: 'Hydrate & Complete Morning Routine',
    category: 'routine',
    targetXp: 15,
    isCompleted: true,
    completedAt: new Date().toISOString()
  },
  {
    id: 'dq_2',
    date: new Date().toISOString().split('T')[0],
    title: 'Bodyweight Training (at least 2 exercises)',
    category: 'train',
    targetXp: 25,
    isCompleted: false
  },
  {
    id: 'dq_3',
    date: new Date().toISOString().split('T')[0],
    title: '25-Minute Focus Block (Distraction-Free)',
    category: 'focus',
    targetXp: 20,
    isCompleted: false
  },
  {
    id: 'dq_4',
    date: new Date().toISOString().split('T')[0],
    title: 'Complete 1 Confidence Quest',
    category: 'confidence',
    targetXp: 25,
    isCompleted: false
  },
  {
    id: 'dq_reading',
    date: new Date().toISOString().split('T')[0],
    title: 'Daily Reading: 15–20 Pages of a Book',
    category: 'study',
    targetXp: 25,
    description: 'Non-fiction, tech, psychology, or deep focus reading',
    statTarget: 'knowledge',
    isCompleted: false
  },
  {
    id: 'dq_5',
    date: new Date().toISOString().split('T')[0],
    title: 'Evening Log & Reflection',
    category: 'recovery',
    targetXp: 15,
    isCompleted: false
  }
];

export interface SkillBlueprint {
  name: string;
  category: string;
  statsSynergy: import('../types').StatType[];
  goals: string;
  milestones: { id: string; title: string; completed: boolean }[];
}

export const SKILL_BLUEPRINTS: SkillBlueprint[] = [
  {
    name: 'Daily Reading & Book Mastery',
    category: 'Mindset',
    statsSynergy: ['knowledge', 'focus'],
    goals: 'Read 20+ pages daily, highlight insights, and build a second brain of wisdom',
    milestones: [
      { id: 'm_read_1', title: 'Complete 1 whole book in 14 days', completed: false },
      { id: 'm_read_2', title: 'Take structured chapter reflection notes in Notes tab', completed: false },
      { id: 'm_read_3', title: '30-minute uninterrupted reading session without phone checks', completed: false },
      { id: 'm_read_4', title: 'Build a 30-day daily reading streak', completed: false }
    ]
  },
  {
    name: 'Software Engineering',
    category: 'Tech',
    statsSynergy: ['knowledge', 'focus'],
    goals: 'Build full-stack software, master DSA, and automate workflows',
    milestones: [
      { id: 'm_git', title: 'Git, branch strategies & clean code review', completed: false },
      { id: 'm_dsa', title: 'Data Structures, algorithms & problem solving', completed: false },
      { id: 'm_fe', title: 'Web Frameworks, UI design & state management', completed: false },
      { id: 'm_dep', title: 'Cloud Deployment, containerization & CI/CD', completed: false }
    ]
  },
  {
    name: 'Social Confidence & Charisma',
    category: 'Social',
    statsSynergy: ['confidence', 'knowledge'],
    goals: 'Express thoughts with warmth, poise, and magnetic clarity',
    milestones: [
      { id: 'm_listen', title: 'Active listening & genuine inquiry', completed: false },
      { id: 'm_eye', title: 'Steady eye contact & grounded posture', completed: false },
      { id: 'm_story', title: 'Engaging storytelling & dynamic vocal pacing', completed: false },
      { id: 'm_speak', title: 'Public speaking & spontaneous debate delivery', completed: false }
    ]
  },
  {
    name: 'Martial Arts / Calisthenics',
    category: 'Athletics',
    statsSynergy: ['stamina', 'strength', 'reflex'],
    goals: 'Master bodyweight control, reactive agility, and isometric endurance',
    milestones: [
      { id: 'm_push', title: '25 strict pushups & hollow body core hold', completed: false },
      { id: 'm_pull', title: '8 clean pullups / chin-ups with pause', completed: false },
      { id: 'm_reflex', title: 'Reactive agility drills & defensive footwork', completed: false },
      { id: 'm_flow', title: 'Continuous 3-minute movement flow', completed: false }
    ]
  },
  {
    name: 'Meditation & Breathwork',
    category: 'Mindset',
    statsSynergy: ['recovery', 'awareness'],
    goals: 'Cultivate unwavering stillness, stress regulation, and mental focus',
    milestones: [
      { id: 'm_box', title: '10-minute Box Breathing rhythm (4-4-4-4)', completed: false },
      { id: 'm_scan', title: 'Full somatic tension scan & muscular release', completed: false },
      { id: 'm_silent', title: '20-minute silent unguided breath awareness', completed: false }
    ]
  },
  {
    name: 'Music / Instrument',
    category: 'Creative',
    statsSynergy: ['focus', 'reflex'],
    goals: 'Express emotion freely through chords, rhythm, and melody',
    milestones: [
      { id: 'm_chord', title: 'Clean chord transitions & muscle memory', completed: false },
      { id: 'm_scale', title: 'Pentatonic & Major scales with metronome', completed: false },
      { id: 'm_rhythm', title: 'Rhythmic pocket & dynamic strumming groove', completed: false },
      { id: 'm_song', title: 'Full song performance from memory', completed: false }
    ]
  },
  {
    name: 'Foreign Language Fluency',
    category: 'Language',
    statsSynergy: ['knowledge', 'confidence'],
    goals: 'Achieve conversational ease and understand native media',
    milestones: [
      { id: 'm_vocab', title: '500 high-frequency core vocabulary items', completed: false },
      { id: 'm_gram', title: 'Conversational sentence structure & tenses', completed: false },
      { id: 'm_pron', title: 'Phonetic pronunciation & native listening', completed: false },
      { id: 'm_conv', title: '15-minute uninterrupted spoken dialogue', completed: false }
    ]
  }
];

const DEFAULT_SKILLS: Skill[] = [
  {
    id: 'sk_1',
    name: 'Software Engineering',
    category: 'Tech',
    level: 3,
    currentXP: 45,
    totalPracticeMinutes: 320,
    sessionsCount: 8,
    streak: 3,
    statsSynergy: ['knowledge', 'focus'],
    goals: 'Build personal tools and master full-stack concepts',
    milestones: [
      { id: 'm_git', title: 'Git & clean code review', completed: true },
      { id: 'm_dsa', title: 'Data Structures & algorithms', completed: true },
      { id: 'm_fe', title: 'Web Frameworks & UI design', completed: false },
      { id: 'm_dep', title: 'Cloud Deployment & CI/CD', completed: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'sk_2',
    name: 'Social Confidence & Charisma',
    category: 'Social',
    level: 2,
    currentXP: 20,
    totalPracticeMinutes: 140,
    sessionsCount: 5,
    streak: 2,
    statsSynergy: ['confidence', 'knowledge'],
    goals: 'Speak with steady pacing and active listening',
    milestones: [
      { id: 'm_listen', title: 'Active listening & genuine inquiry', completed: true },
      { id: 'm_eye', title: 'Steady eye contact & open posture', completed: true },
      { id: 'm_story', title: 'Engaging storytelling & vocal pacing', completed: false },
      { id: 'm_speak', title: 'Public speaking & debate delivery', completed: false }
    ],
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_NOTES: Note[] = [
  {
    id: 'nt_1',
    title: 'RPG Philosophy: 1% Better Every Day',
    content: 'Do not chase overnight transformations. Small daily quests compound into unstoppable character progression. If you miss a day, guilt helps nothing — just resume today.',
    category: 'Quick Notes',
    tags: ['mindset', 'core'],
    isPinned: true,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'nt_2',
    title: 'Exam Key Formulas & Concepts',
    content: 'Review chapter 4 & 5 summary notes. Practice question 12 from previous paper.',
    category: 'Study',
    tags: ['exam', 'college'],
    isPinned: false,
    isArchived: false,
    checklist: [
      { id: 'cl_1', text: 'Revise thermodynamic diagrams', done: true },
      { id: 'cl_2', text: 'Solve 3 calculus integration problems', done: false },
      { id: 'cl_3', text: 'Flashcard 20 key terms', done: false }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: 'rem_1',
    title: 'Drink 500ml water and stretch',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '15:00',
    recurringType: 'daily',
    isCompleted: false,
    notes: 'Keep energy and focus steady',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rem_2',
    title: 'Review tomorrow\'s timetable mode',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '22:00',
    recurringType: 'daily',
    isCompleted: false,
    notes: 'Switch schedule mode if exam or holiday tomorrow',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_1',
    code: 'FIRST_STEP',
    name: 'Awakening',
    description: 'Earn your first XP in Level Up',
    icon: 'Sparkles',
    stat: 'discipline',
    xpReward: 25,
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'ach_2',
    code: 'CENTURY_XP',
    name: 'Centurion',
    description: 'Accumulate 100 Total XP',
    icon: 'Shield',
    stat: 'discipline',
    xpReward: 50,
    isUnlocked: false,
    progress: 35,
    maxProgress: 100
  },
  {
    id: 'ach_3',
    code: 'LEVEL_5',
    name: 'Rising Vanguard',
    description: 'Reach Character Level 5',
    icon: 'Crown',
    stat: 'discipline',
    xpReward: 100,
    isUnlocked: false,
    progress: 1,
    maxProgress: 5
  },
  {
    id: 'ach_4',
    code: 'STREAK_3',
    name: 'Momentum',
    description: 'Maintain a 3-day active streak',
    icon: 'Flame',
    stat: 'discipline',
    xpReward: 40,
    isUnlocked: false,
    progress: 1,
    maxProgress: 3
  },
  {
    id: 'ach_5',
    code: 'IRON_DISCIPLE',
    name: 'Iron Frame',
    description: 'Complete 5 workout sessions',
    icon: 'Dumbbell',
    stat: 'strength',
    xpReward: 50,
    isUnlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'ach_6',
    code: 'DEEP_DIVER',
    name: 'Zen Mind',
    description: 'Complete 5 deep focus sessions',
    icon: 'Brain',
    stat: 'focus',
    xpReward: 50,
    isUnlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'ach_7',
    code: 'BRAVE_SPEAKER',
    name: 'Courageous Voice',
    description: 'Complete 3 confidence quests',
    icon: 'MessageSquare',
    stat: 'confidence',
    xpReward: 60,
    isUnlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'ach_8',
    code: 'LIGHTNING_REFLEX',
    name: 'Lightning Striker',
    description: 'Complete 5 reflex tests',
    icon: 'Zap',
    stat: 'reflex',
    xpReward: 30,
    isUnlocked: false,
    progress: 0,
    maxProgress: 5
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'cyber-slate',
  soundEnabled: true,
  soundVolume: 0.6,
  notificationsEnabled: true,
  dailyXpTarget: 150,
  dailyXpSoftCap: 350,
  onboardingCompleted: true
};

class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  }

  // Profile
  public getProfile(): UserProfile {
    const profile = this.getItem<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    if (profile.streakShields === undefined) {
      profile.streakShields = 1;
    }
    return profile;
  }
  public saveProfile(profile: UserProfile): void {
    this.setItem(STORAGE_KEYS.PROFILE, profile);
  }

  // Timetable Templates
  public getTemplates(): TimetableTemplate[] {
    return this.getItem<TimetableTemplate[]>(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
  }
  public saveTemplates(templates: TimetableTemplate[]): void {
    this.setItem(STORAGE_KEYS.TEMPLATES, templates);
  }

  // Timetable Events
  public getEvents(): TimetableEvent[] {
    const list = this.getItem<TimetableEvent[]>(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
    const existingIds = new Set(list.map(e => e.id));
    let hasNew = false;
    for (const def of DEFAULT_EVENTS) {
      if (!existingIds.has(def.id)) {
        list.push(def);
        hasNew = true;
      }
    }
    if (hasNew) {
      this.saveEvents(list);
    }
    return list;
  }
  public saveEvents(events: TimetableEvent[]): void {
    this.setItem(STORAGE_KEYS.EVENTS, events);
  }

  // Date Mode Mappings
  public getDateModes(): DateModeMapping[] {
    return this.getItem<DateModeMapping[]>(STORAGE_KEYS.DATE_MODES, []);
  }
  public saveDateModes(mappings: DateModeMapping[]): void {
    this.setItem(STORAGE_KEYS.DATE_MODES, mappings);
  }

  // Exercises (User requested custom exercise support)
  public getExercises(): Exercise[] {
    const list = this.getItem<Exercise[]>(STORAGE_KEYS.EXERCISES, DEFAULT_EXERCISES);
    const existingIds = new Set(list.map(e => e.id));
    const defMap = new Map(DEFAULT_EXERCISES.map(d => [d.id, d]));
    let hasChanges = false;

    // Merge latest formGuide and illustrationType for non-custom exercises
    const merged = list.map(item => {
      const def = defMap.get(item.id);
      if (def && !item.isCustom) {
        return {
          ...def,
          personalRecord: item.personalRecord || def.personalRecord,
          defaultSets: item.defaultSets || def.defaultSets,
          defaultReps: item.defaultReps || def.defaultReps,
          notes: item.notes || def.notes
        };
      }
      return item;
    });

    for (const def of DEFAULT_EXERCISES) {
      if (!existingIds.has(def.id)) {
        merged.push(def);
        hasChanges = true;
      }
    }
    if (hasChanges || JSON.stringify(merged) !== JSON.stringify(list)) {
      this.saveExercises(merged);
    }
    return merged;
  }
  public saveExercises(exercises: Exercise[]): void {
    this.setItem(STORAGE_KEYS.EXERCISES, exercises);
  }
  public addOrUpdateExercise(exercise: Exercise): Exercise[] {
    const list = this.getExercises();
    const idx = list.findIndex(e => e.id === exercise.id);
    if (idx >= 0) {
      list[idx] = exercise;
    } else {
      list.unshift(exercise);
    }
    this.saveExercises(list);
    return list;
  }
  public deleteExercise(exerciseId: string): Exercise[] {
    const list = this.getExercises().filter(e => e.id !== exerciseId);
    this.saveExercises(list);
    return list;
  }

  // Workout Logs
  public getWorkoutLogs(): WorkoutLog[] {
    return this.getItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
  }
  public saveWorkoutLogs(logs: WorkoutLog[]): void {
    this.setItem(STORAGE_KEYS.WORKOUT_LOGS, logs);
  }
  public addWorkoutLog(log: WorkoutLog): void {
    const logs = this.getWorkoutLogs();
    logs.unshift(log);
    this.saveWorkoutLogs(logs);
  }

  // Cardio Sessions
  public getCardioSessions(): CardioSession[] {
    return this.getItem<CardioSession[]>(STORAGE_KEYS.CARDIO_SESSIONS, []);
  }
  public saveCardioSessions(sessions: CardioSession[]): void {
    this.setItem(STORAGE_KEYS.CARDIO_SESSIONS, sessions);
  }

  // Focus Sessions
  public getFocusSessions(): FocusSession[] {
    return this.getItem<FocusSession[]>(STORAGE_KEYS.FOCUS_SESSIONS, []);
  }
  public saveFocusSessions(sessions: FocusSession[]): void {
    this.setItem(STORAGE_KEYS.FOCUS_SESSIONS, sessions);
  }

  // Reflex Scores
  public getReflexScores(): ReflexScore[] {
    return this.getItem<ReflexScore[]>(STORAGE_KEYS.REFLEX_SCORES, []);
  }
  public saveReflexScores(scores: ReflexScore[]): void {
    this.setItem(STORAGE_KEYS.REFLEX_SCORES, scores);
  }

  // Confidence Quests
  public getConfidenceQuests(): ConfidenceQuest[] {
    return this.getItem<ConfidenceQuest[]>(STORAGE_KEYS.CONFIDENCE_QUESTS, DEFAULT_CONFIDENCE_QUESTS);
  }
  public saveConfidenceQuests(quests: ConfidenceQuest[]): void {
    this.setItem(STORAGE_KEYS.CONFIDENCE_QUESTS, quests);
  }

  // Daily Quests
  public getDailyQuests(): DailyQuest[] {
    const today = new Date().toISOString().split('T')[0];
    let stored = this.getItem<DailyQuest[]>(STORAGE_KEYS.DAILY_QUESTS, DEFAULT_DAILY_QUESTS);
    let modified = false;

    // If stored quests are from an older date, refresh them for today while keeping consistency
    if (stored.length > 0 && stored[0].date !== today) {
      stored = stored.map(q => ({
        ...q,
        date: today,
        isCompleted: false,
        completedAt: undefined
      }));
      modified = true;
    }

    // Merge any missing default quests (like dq_reading)
    const existingIds = new Set(stored.map(q => q.id));
    for (const def of DEFAULT_DAILY_QUESTS) {
      if (!existingIds.has(def.id)) {
        stored.push({ ...def, date: today });
        modified = true;
      }
    }

    if (modified) {
      this.saveDailyQuests(stored);
    }
    return stored;
  }
  public saveDailyQuests(quests: DailyQuest[]): void {
    this.setItem(STORAGE_KEYS.DAILY_QUESTS, quests);
  }

  // Skills
  public getSkills(): Skill[] {
    return this.getItem<Skill[]>(STORAGE_KEYS.SKILLS, DEFAULT_SKILLS);
  }
  public saveSkills(skills: Skill[]): void {
    this.setItem(STORAGE_KEYS.SKILLS, skills);
  }

  // Skill Sessions
  public getSkillSessions(): SkillSession[] {
    return this.getItem<SkillSession[]>(STORAGE_KEYS.SKILL_SESSIONS, []);
  }
  public saveSkillSessions(sessions: SkillSession[]): void {
    this.setItem(STORAGE_KEYS.SKILL_SESSIONS, sessions);
  }
  public addSkillSession(session: SkillSession): void {
    const list = this.getSkillSessions();
    list.unshift(session);
    this.saveSkillSessions(list);
  }

  // Notes
  public getNotes(): Note[] {
    return this.getItem<Note[]>(STORAGE_KEYS.NOTES, DEFAULT_NOTES);
  }
  public saveNotes(notes: Note[]): void {
    this.setItem(STORAGE_KEYS.NOTES, notes);
  }

  // Reminders
  public getReminders(): Reminder[] {
    return this.getItem<Reminder[]>(STORAGE_KEYS.REMINDERS, DEFAULT_REMINDERS);
  }
  public saveReminders(reminders: Reminder[]): void {
    this.setItem(STORAGE_KEYS.REMINDERS, reminders);
  }

  // XP Transactions
  public getXPTransactions(): XPTransaction[] {
    return this.getItem<XPTransaction[]>(STORAGE_KEYS.XP_TRANSACTIONS, [
      {
        id: 'tx_init',
        timestamp: new Date().toISOString(),
        amount: 35,
        source: 'routine',
        description: 'First day morning routine completed',
        statTarget: 'discipline'
      }
    ]);
  }
  public addXPTransaction(tx: XPTransaction): void {
    const list = this.getXPTransactions();
    list.unshift(tx);
    this.setItem(STORAGE_KEYS.XP_TRANSACTIONS, list);
  }

  // Achievements
  public getAchievements(): Achievement[] {
    return this.getItem<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS);
  }
  public saveAchievements(achievements: Achievement[]): void {
    this.setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }

  // Weekly Reviews
  public getWeeklyReviews(): WeeklyReview[] {
    return this.getItem<WeeklyReview[]>(STORAGE_KEYS.WEEKLY_REVIEWS, []);
  }
  public saveWeeklyReviews(reviews: WeeklyReview[]): void {
    this.setItem(STORAGE_KEYS.WEEKLY_REVIEWS, reviews);
  }

  // Settings
  public getSettings(): AppSettings {
    return this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
  public saveSettings(settings: AppSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // ==========================================
  // FULL JSON EXPORT / UPLOAD / CHANGE MANAGER
  // ==========================================
  public exportFullBackup(): string {
    const fullData: FullBackupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      timetableTemplates: this.getTemplates(),
      timetableEvents: this.getEvents(),
      dateModeMappings: this.getDateModes(),
      exercises: this.getExercises(),
      workoutLogs: this.getWorkoutLogs(),
      cardioSessions: this.getCardioSessions(),
      focusSessions: this.getFocusSessions(),
      reflexScores: this.getReflexScores(),
      confidenceQuests: this.getConfidenceQuests(),
      dailyQuests: this.getDailyQuests(),
      skills: this.getSkills(),
      skillSessions: this.getItem<SkillSession[]>(STORAGE_KEYS.SKILL_SESSIONS, []),
      notes: this.getNotes(),
      reminders: this.getReminders(),
      xpTransactions: this.getXPTransactions(),
      achievements: this.getAchievements(),
      weeklyReviews: this.getWeeklyReviews(),
      settings: this.getSettings()
    };
    return JSON.stringify(fullData, null, 2);
  }

  public importFullBackup(jsonContent: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonContent) as Partial<FullBackupData>;
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid JSON format: Must be a JSON object.' };
      }

      if (data.profile) this.saveProfile(data.profile);
      if (Array.isArray(data.timetableTemplates)) this.saveTemplates(data.timetableTemplates);
      if (Array.isArray(data.timetableEvents)) this.saveEvents(data.timetableEvents);
      if (Array.isArray(data.dateModeMappings)) this.saveDateModes(data.dateModeMappings);
      if (Array.isArray(data.exercises)) this.saveExercises(data.exercises);
      if (Array.isArray(data.workoutLogs)) this.saveWorkoutLogs(data.workoutLogs);
      if (Array.isArray(data.cardioSessions)) this.saveCardioSessions(data.cardioSessions);
      if (Array.isArray(data.focusSessions)) this.saveFocusSessions(data.focusSessions);
      if (Array.isArray(data.reflexScores)) this.saveReflexScores(data.reflexScores);
      if (Array.isArray(data.confidenceQuests)) this.saveConfidenceQuests(data.confidenceQuests);
      if (Array.isArray(data.dailyQuests)) this.saveDailyQuests(data.dailyQuests);
      if (Array.isArray(data.skills)) this.saveSkills(data.skills);
      if (Array.isArray(data.notes)) this.saveNotes(data.notes);
      if (Array.isArray(data.reminders)) this.saveReminders(data.reminders);
      if (Array.isArray(data.xpTransactions)) this.setItem(STORAGE_KEYS.XP_TRANSACTIONS, data.xpTransactions);
      if (Array.isArray(data.achievements)) this.saveAchievements(data.achievements);
      if (Array.isArray(data.weeklyReviews)) this.saveWeeklyReviews(data.weeklyReviews);
      if (data.settings) this.saveSettings(data.settings);

      return { success: true, message: 'Data imported and restored successfully!' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Failed to import JSON: ${errorMsg}` };
    }
  }

  public exportExercisesJson(): string {
    return JSON.stringify(this.getExercises(), null, 2);
  }

  public importExercisesJson(jsonContent: string): { success: boolean; message: string; count?: number } {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!Array.isArray(parsed)) {
        return { success: false, message: 'JSON must contain an array of exercise objects.' };
      }
      this.saveExercises(parsed as Exercise[]);
      return { success: true, message: `Successfully loaded ${parsed.length} exercises!`, count: parsed.length };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Exercise import failed: ${errorMsg}` };
    }
  }

  // 12-Month Fitness & Calisthenics System
  public getFitnessProfile(): UserFitnessProfile {
    const profile = this.getItem<UserFitnessProfile>(STORAGE_KEYS.FITNESS_PROFILE, DEFAULT_FITNESS_PROFILE);
    if (!profile.masteredSkillIds) profile.masteredSkillIds = [];
    return profile;
  }

  public saveFitnessProfile(profile: UserFitnessProfile): void {
    this.setItem(STORAGE_KEYS.FITNESS_PROFILE, profile);
  }

  public getProgressionStates(): Record<string, ExerciseProgressionState> {
    return this.getItem<Record<string, ExerciseProgressionState>>(STORAGE_KEYS.PROGRESSION_STATES, {});
  }

  public saveProgressionStates(states: Record<string, ExerciseProgressionState>): void {
    this.setItem(STORAGE_KEYS.PROGRESSION_STATES, states);
  }

  public saveSingleProgressionState(state: ExerciseProgressionState): void {
    const states = this.getProgressionStates();
    states[state.exerciseId] = state;
    this.saveProgressionStates(states);
  }

  public getBenchmarkRecords(): BenchmarkRecord[] {
    const records = this.getItem<BenchmarkRecord[]>(STORAGE_KEYS.BENCHMARK_RECORDS, DEFAULT_BENCHMARK_RECORDS);
    const existingTypes = new Set(records.map(r => r.testType));
    let hasNew = false;
    for (const def of DEFAULT_BENCHMARK_RECORDS) {
      if (!existingTypes.has(def.testType)) {
        records.push(def);
        hasNew = true;
      }
    }
    if (hasNew) {
      this.setItem(STORAGE_KEYS.BENCHMARK_RECORDS, records);
    }
    return records;
  }

  public saveBenchmarkRecord(testType: FitnessBenchmarkType, score: number, notes?: string): BenchmarkRecord[] {
    const records = this.getBenchmarkRecords();
    const existing = records.find(r => r.testType === testType);
    const today = new Date().toISOString().split('T')[0];

    if (existing) {
      existing.history.unshift({ date: today, score, notes });
      if (score > existing.bestScore) {
        existing.bestScore = score;
      }
      existing.lastTestDate = today;
    } else {
      records.push({
        id: `bench_${testType}_${Date.now()}`,
        testType,
        title: testType.replace(/_/g, ' ').toUpperCase(),
        unit: testType === 'max_pushups' || testType === 'squats_2min' || testType === 'pullups_max' ? 'reps' : testType === 'cardio_test' ? 'minutes' : 'seconds',
        bestScore: score,
        lastTestDate: today,
        history: [{ date: today, score, notes }]
      });
    }

    this.setItem(STORAGE_KEYS.BENCHMARK_RECORDS, records);
    return records;
  }

  public getCompletedFitnessSessions(): CompletedWorkoutSession[] {
    return this.getItem<CompletedWorkoutSession[]>(STORAGE_KEYS.FITNESS_SESSIONS, []);
  }

  public saveCompletedFitnessSession(session: CompletedWorkoutSession): CompletedWorkoutSession[] {
    const list = this.getCompletedFitnessSessions();
    list.unshift(session);
    const trimmed = list.slice(0, 100);
    this.setItem(STORAGE_KEYS.FITNESS_SESSIONS, trimmed);

    const profile = this.getFitnessProfile();
    profile.totalWorkoutsCompleted += 1;
    profile.lastWorkoutDate = session.date;
    profile.currentWorkoutStreak += 1;
    if (profile.currentWorkoutStreak > profile.longestWorkoutStreak) {
      profile.longestWorkoutStreak = profile.currentWorkoutStreak;
    }
    this.saveFitnessProfile(profile);

    return trimmed;
  }

  public resetToDefaults(): void {
    localStorage.clear();
    this.saveProfile(DEFAULT_PROFILE);
    this.saveTemplates(DEFAULT_TEMPLATES);
    this.saveEvents(DEFAULT_EVENTS);
    this.saveExercises(DEFAULT_EXERCISES);
    this.saveConfidenceQuests(DEFAULT_CONFIDENCE_QUESTS);
    this.saveDailyQuests(DEFAULT_DAILY_QUESTS);
    this.saveSkills(DEFAULT_SKILLS);
    this.saveNotes(DEFAULT_NOTES);
    this.saveReminders(DEFAULT_REMINDERS);
    this.saveAchievements(DEFAULT_ACHIEVEMENTS);
    this.saveSettings(DEFAULT_SETTINGS);
    this.saveFitnessProfile(DEFAULT_FITNESS_PROFILE);
    this.setItem(STORAGE_KEYS.PROGRESSION_STATES, {});
    this.setItem(STORAGE_KEYS.BENCHMARK_RECORDS, DEFAULT_BENCHMARK_RECORDS);
    this.setItem(STORAGE_KEYS.FITNESS_SESSIONS, []);
  }
}

export const storage = new StorageService();
