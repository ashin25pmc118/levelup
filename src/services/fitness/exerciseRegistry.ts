// Central Exercise Registry - Single Source of Truth
// Comprehensive 15-category exercise database for Home and Hostel environments
import { CentralExercise, ExerciseCategory, TrainingEnvironment } from './fitnessTypes';

export const CENTRAL_EXERCISE_REGISTRY: CentralExercise[] = [
  // ==========================================
  // 1. CHEST (Push-Up Progression Chain)
  // ==========================================
  {
    id: 'ex_push_wall',
    name: 'Wall Push-ups',
    category: 'chest',
    muscleGroups: { primary: ['Pectorals (Chest)', 'Anterior Deltoids'], secondary: ['Triceps', 'Core'] },
    equipment: ['wall'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'push_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: 'ex_push_incline',
    prerequisites: [],
    defaultSets: 3,
    defaultReps: 15,
    restSeconds: 45,
    tempo: '2-1-2',
    breathing: 'Inhale bending elbows toward wall; exhale pressing away.',
    setupSteps: [
      'Stand facing a sturdy wall about an arm’s length away.',
      'Place palms flat on the wall at shoulder height and shoulder-width apart.',
      'Keep feet flat and body forming a straight line from heels to head.'
    ],
    movementSteps: [
      'Bend elbows to lower your chest smoothly toward the wall until forehead/nose nearly touches.',
      'Pause for 1 second with chest muscles engaged.',
      'Press firmly through palms to return to the starting position.'
    ],
    commonMistakes: [
      'Bending at the hips instead of keeping the body straight.',
      'Flaring elbows out to 90 degrees (keep at 45 degrees).'
    ],
    safetyNotes: [
      'Ensure floor is dry and footwear has adequate traction.',
      'Stop immediately if you experience wrist or shoulder pinch.'
    ],
    beginnerVariation: 'Step feet closer to the wall to reduce the angle of resistance.',
    progressionTarget: '3 sets of 15 clean reps with 45s rest to unlock Incline Push-ups.',
    visualGuideId: 'pushup',
    isQuietForHostel: true
  },
  {
    id: 'ex_push_incline',
    name: 'Incline Push-ups (Desk / Bed / Chair)',
    category: 'chest',
    muscleGroups: { primary: ['Lower Chest', 'Pectorals'], secondary: ['Triceps', 'Shoulders', 'Core'] },
    equipment: ['bed', 'chair', 'table'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'push_chain',
    progressionLevel: 2,
    previousExerciseId: 'ex_push_wall',
    nextExerciseId: 'ex_push_knee',
    prerequisites: ['ex_push_wall'],
    defaultSets: 3,
    defaultReps: 12,
    restSeconds: 60,
    tempo: '2-1-2',
    breathing: 'Inhale lowering chest to elevated surface; exhale pressing back to plank.',
    setupSteps: [
      'Place hands shoulder-width apart on the edge of a stable desk, bed, or sturdy chair.',
      'Step feet back until body forms an angled rigid plank.',
      'Brace core and squeeze glutes.'
    ],
    movementSteps: [
      'Lower chest under control until it gently touches the elevated surface.',
      'Keep elbows tucked at a 45-degree angle.',
      'Push through palms to lock out arms without shrugging shoulders.'
    ],
    commonMistakes: [
      'Using an unstable or rolling chair.',
      'Sagging hips or piking butt in the air.'
    ],
    safetyNotes: [
      'SAFETY FIRST: Never use rolling office chairs or flimsy light furniture. If using a chair, push it firmly against a wall so it cannot slide.'
    ],
    beginnerVariation: 'Use a higher elevation (countertop/tall desk) rather than a low bed.',
    progressionTarget: '3 sets of 12 clean reps with 60s rest to unlock Knee Push-ups.',
    visualGuideId: 'pushup',
    isQuietForHostel: true
  },
  {
    id: 'ex_push_knee',
    name: 'Knee Push-ups',
    category: 'chest',
    muscleGroups: { primary: ['Pectorals (Chest)'], secondary: ['Triceps', 'Anterior Deltoids'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'push_chain',
    progressionLevel: 3,
    previousExerciseId: 'ex_push_incline',
    nextExerciseId: 'ex_push_standard',
    prerequisites: ['ex_push_incline'],
    defaultSets: 3,
    defaultReps: 10,
    restSeconds: 60,
    tempo: '2-1-2',
    breathing: 'Inhale down; exhale pressing up.',
    setupSteps: [
      'Kneel on the floor or yoga mat, crossing or resting shins behind you.',
      'Walk hands forward slightly wider than shoulder width.',
      'Form a straight diagonal slope from knees to crown of head.'
    ],
    movementSteps: [
      'Lower chest until it is 2 inches off the floor.',
      'Keep elbows tracking backward at 45 degrees.',
      'Press through chest and palms back to top lockout.'
    ],
    commonMistakes: [
      'Leaving hips back over knees like a tabletop box.',
      'Leading with the stomach rather than the chest.'
    ],
    safetyNotes: [
      'Place a folded towel or pillow under knees if the hostel floor is hard tile.'
    ],
    beginnerVariation: 'Shift weight slightly backward to reduce resistance.',
    progressionTarget: '3 sets of 10 clean reps with 60s rest to unlock Standard Push-ups.',
    visualGuideId: 'pushup',
    isQuietForHostel: true
  },
  {
    id: 'ex_push_standard',
    name: 'Standard Floor Push-ups',
    category: 'chest',
    muscleGroups: { primary: ['Pectoralis Major', 'Triceps'], secondary: ['Anterior Deltoids', 'Core', 'Serratus'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'push_chain',
    progressionLevel: 4,
    previousExerciseId: 'ex_push_knee',
    nextExerciseId: 'ex_push_close',
    prerequisites: ['ex_push_knee'],
    defaultSets: 3,
    defaultReps: 8,
    restSeconds: 75,
    tempo: '3-1-1',
    breathing: 'Inhale on the 3-second descent; exhale driving forcefully upward.',
    setupSteps: [
      'Place hands on floor slightly outside shoulder-width.',
      'Step feet back, feet together or hip-width apart.',
      'Brace core and squeeze quads and glutes to make body a rigid board.'
    ],
    movementSteps: [
      'Lower down over 3 slow seconds until chest is 2 inches above the ground.',
      'Elbows tucked at 45 degrees (resembling an arrow from above, not a T).',
      'Explode upward, pushing floor away to full arm extension.'
    ],
    commonMistakes: [
      'Sagging lower back or looking up with neck.',
      'Flaring elbows out at 90 degrees.'
    ],
    safetyNotes: [
      'If wrist discomfort occurs, perform push-ups on closed fists or hold push-up bars.'
    ],
    beginnerVariation: 'Begin with 3 sets of 5 reps rather than forcing 8 with broken form.',
    progressionTarget: '3 sets of 12 clean reps with 60s rest to unlock Close-Grip & Diamond Push-ups.',
    visualGuideId: 'pushup',
    isQuietForHostel: true
  },
  {
    id: 'ex_push_close',
    name: 'Close-Grip Push-ups',
    category: 'chest',
    muscleGroups: { primary: ['Inner Pectorals', 'Triceps Lateral Head'], secondary: ['Anterior Deltoids', 'Core'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'push_chain',
    progressionLevel: 5,
    previousExerciseId: 'ex_push_standard',
    nextExerciseId: 'ex_push_diamond',
    prerequisites: ['ex_push_standard'],
    defaultSets: 3,
    defaultReps: 10,
    restSeconds: 75,
    tempo: '3-1-1',
    breathing: 'Inhale lowering; exhale pressing up.',
    setupSteps: [
      'Plank position with hands set directly under shoulders (narrower than standard).',
      'Elbows will skim the ribcage throughout the movement.'
    ],
    movementSteps: [
      'Lower chest down, keeping elbows pinned tight against sides.',
      'Pause 1 second at bottom, feeling triceps stretch.',
      'Press up to lockout, squeezing triceps.'
    ],
    commonMistakes: ['Flaring elbows outward.'],
    safetyNotes: ['Requires good elbow health; do not lock out hyperextended joints violently.'],
    beginnerVariation: 'Perform on an incline if full floor reps are too intense.',
    progressionTarget: '3 sets of 10 clean reps to unlock Diamond Push-ups.',
    visualGuideId: 'pushup',
    isQuietForHostel: true
  },
  {
    id: 'ex_push_diamond',
    name: 'Diamond Push-ups',
    category: 'chest',
    muscleGroups: { primary: ['Triceps (Horseshoe)', 'Inner Chest'], secondary: ['Front Deltoids', 'Core'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'push_chain',
    progressionLevel: 6,
    previousExerciseId: 'ex_push_close',
    nextExerciseId: 'ex_push_decline',
    prerequisites: ['ex_push_close'],
    defaultSets: 3,
    defaultReps: 8,
    restSeconds: 90,
    tempo: '3-1-1',
    breathing: 'Inhale descending; exhale pressing.',
    setupSteps: [
      'Form a diamond/triangle shape with index fingers and thumbs directly under center chest.',
      'Legs straight behind you, core braced tightly.'
    ],
    movementSteps: [
      'Lower chest until it gently touches the back of your hands.',
      'Push the floor away to full tricep contraction.'
    ],
    commonMistakes: ['Letting elbows flare excessively.'],
    safetyNotes: ['Ensure wrists are thoroughly warmed up before attempting diamond grip.'],
    beginnerVariation: 'Perform diamond push-ups on knees to build initial tricep pushing capacity.',
    progressionTarget: '3 sets of 10 clean reps to unlock Decline Push-ups.',
    visualGuideId: 'pushup',
    isQuietForHostel: true
  },
  {
    id: 'ex_push_decline',
    name: 'Decline Push-ups (Feet on Bed / Chair)',
    category: 'chest',
    muscleGroups: { primary: ['Upper Clavicular Chest', 'Front Deltoids'], secondary: ['Triceps', 'Core'] },
    equipment: ['bed', 'chair'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'push_chain',
    progressionLevel: 7,
    previousExerciseId: 'ex_push_diamond',
    nextExerciseId: 'ex_push_archer',
    prerequisites: ['ex_push_diamond'],
    defaultSets: 3,
    defaultReps: 8,
    restSeconds: 90,
    tempo: '3-1-1',
    breathing: 'Inhale down; exhale up.',
    setupSteps: [
      'Place hands on floor shoulder-width apart.',
      'Elevate toes onto your bed, study chair, or low bench.',
      'Brace core to prevent lumbar hyperextension.'
    ],
    movementSteps: [
      'Lower head and upper chest toward floor at a 45-degree angle.',
      'Press upward until arms are straight.'
    ],
    commonMistakes: ['Over-arching lower back due to elevated feet.'],
    safetyNotes: ['Make sure bed or chair is completely stationary.'],
    beginnerVariation: 'Use a lower elevation (e.g. 6-inch step) first.',
    progressionTarget: '3 sets of 10 clean reps to unlock Archer Push-ups.',
    visualGuideId: 'pushup',
    isQuietForHostel: true
  },
  {
    id: 'ex_push_archer',
    name: 'Archer Push-ups',
    category: 'chest',
    muscleGroups: { primary: ['Unilateral Pectorals', 'Triceps'], secondary: ['Deltoids', 'Core'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'advanced',
    progressionChainId: 'push_chain',
    progressionLevel: 8,
    previousExerciseId: 'ex_push_decline',
    nextExerciseId: 'ex_push_pseudo_planche',
    prerequisites: ['ex_push_decline'],
    defaultSets: 3,
    defaultReps: 6,
    restSeconds: 90,
    tempo: '3-1-1',
    breathing: 'Inhale sliding to side; exhale pressing back to center.',
    setupSteps: [
      'Assume a very wide push-up stance with fingers pointed slightly outward.'
    ],
    movementSteps: [
      'Lower body toward one arm while extending the other arm straight out to the side like an archer.',
      'Push back up to center and switch sides.'
    ],
    commonMistakes: ['Rotating the torso instead of lowering straight down over the working arm.'],
    safetyNotes: ['Demands high rotator cuff stability; warm up shoulders thoroughly.'],
    beginnerVariation: 'Perform archer push-ups from the knees.',
    progressionTarget: '3 sets of 6 reps per side to unlock Pseudo-Planche Push-ups.',
    visualGuideId: 'pushup',
    isQuietForHostel: true
  },
  {
    id: 'ex_push_pseudo_planche',
    name: 'Pseudo-Planche Push-ups',
    category: 'chest',
    muscleGroups: { primary: ['Anterior Deltoids', 'Upper Chest', 'Biceps Tendons'], secondary: ['Core', 'Triceps'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'advanced',
    progressionChainId: 'push_chain',
    progressionLevel: 9,
    previousExerciseId: 'ex_push_archer',
    nextExerciseId: null,
    prerequisites: ['ex_push_archer'],
    defaultSets: 3,
    defaultReps: 6,
    restSeconds: 120,
    tempo: '3-1-1',
    breathing: 'Inhale lowering with forward lean; exhale driving up and maintaining lean.',
    setupSteps: [
      'Hands placed by your lower ribs with fingers turned slightly outward (45 degrees).',
      'Lean your whole body forward so shoulders are significantly ahead of wrists.'
    ],
    movementSteps: [
      'Lower down maintaining the forward shoulder lean throughout the rep.',
      'Press upward and protract shoulder blades at the top.'
    ],
    commonMistakes: ['Losing the forward lean as fatigue sets in.'],
    safetyNotes: ['High strain on wrists and biceps tendons. Stop immediately if biceps tendon aches.'],
    beginnerVariation: 'Reduce the forward lean angle.',
    progressionTarget: 'Calisthenics Elite Push Mastery.',
    visualGuideId: 'pushup',
    isQuietForHostel: true
  },

  // ==========================================
  // 2. BACK (Pulling Progression Chain)
  // ==========================================
  {
    id: 'ex_pull_scapular',
    name: 'Scapular Wall / Floor Retractions',
    category: 'back',
    muscleGroups: { primary: ['Rhomboids', 'Lower Trapezius'], secondary: ['Rear Deltoids'] },
    equipment: ['wall', 'floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'pull_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: 'ex_pull_dead_hang',
    prerequisites: [],
    defaultSets: 3,
    defaultReps: 15,
    restSeconds: 45,
    tempo: '2-2-2',
    breathing: 'Exhale squeezing shoulder blades; inhale relaxing.',
    setupSteps: [
      'Stand against a wall or lie face down on floor with arms at 90-degree goalpost angles.'
    ],
    movementSteps: [
      'Squeeze shoulder blades backward and downward like pinching a pencil between your blades.',
      'Hold the peak contraction for 2 seconds without shrugging neck.',
      'Release smoothly.'
    ],
    commonMistakes: ['Shrugging shoulders into ears.'],
    safetyNotes: ['Keep neck relaxed and neutral.'],
    beginnerVariation: 'Do seated in a desk chair.',
    progressionTarget: '3 sets of 15 clean reps to unlock Dead Hangs & Doorway Rows.',
    visualGuideId: 'row',
    isQuietForHostel: true
  },
  {
    id: 'ex_pull_dead_hang',
    name: 'Active Dead Hang (Bar or Door Top)',
    category: 'back',
    muscleGroups: { primary: ['Latissimus Dorsi', 'Forearm Grip', 'Shoulder Girdle'], secondary: ['Core'] },
    equipment: ['pullup_bar', 'doorframe'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'pull_chain',
    progressionLevel: 2,
    previousExerciseId: 'ex_pull_scapular',
    nextExerciseId: 'ex_pull_door_row',
    prerequisites: ['ex_pull_scapular'],
    defaultSets: 3,
    defaultReps: 1,
    defaultDurationSeconds: 30,
    restSeconds: 60,
    tempo: 'Isometric Hold',
    breathing: 'Deep, steady diaphragmatic nasal breathing.',
    setupSteps: [
      'Grip a pull-up bar or secure doorframe with an overhand grip.',
      'Hang with feet off the floor or toes lightly resting for assistance.'
    ],
    movementSteps: [
      'Engage shoulders slightly downward (active hang, not limp passive hang).',
      'Hold position with firm grip for 20-30 seconds.'
    ],
    commonMistakes: ['Holding breath or swinging legs.'],
    safetyNotes: ['Check that pull-up bar or door frame is 100% secure before hanging full bodyweight.'],
    beginnerVariation: 'Keep toes resting lightly on the floor to reduce hanging load by 30%.',
    progressionTarget: 'Hold for 3 sets of 30 seconds unbroken to unlock Inverted Rows.',
    visualGuideId: 'pullup',
    isQuietForHostel: true
  },
  {
    id: 'ex_pull_door_row',
    name: 'Hostel Doorframe Bodyweight Rows',
    category: 'back',
    muscleGroups: { primary: ['Lats', 'Rhomboids', 'Mid-Back'], secondary: ['Biceps', 'Rear Deltoids'] },
    equipment: ['doorframe'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'pull_chain',
    progressionLevel: 3,
    previousExerciseId: 'ex_pull_dead_hang',
    nextExerciseId: 'ex_pull_table_row',
    prerequisites: ['ex_pull_dead_hang'],
    defaultSets: 3,
    defaultReps: 12,
    restSeconds: 60,
    tempo: '2-1-2',
    breathing: 'Exhale pulling chest to frame; inhale lowering back.',
    setupSteps: [
      'Stand facing an open doorframe, grip both sides with hands at chest height.',
      'Place toes near base of the frame and lean backward until arms are straight.'
    ],
    movementSteps: [
      'Drive elbows backward, pulling chest firmly into the frame.',
      'Pinch shoulder blades hard for 1 second.',
      'Lower yourself back down with full control.'
    ],
    commonMistakes: ['Sagging hips; body must stay straight as a plank.'],
    safetyNotes: ['Ensure doorway frame is solid and hands do not slip.'],
    beginnerVariation: 'Stand more upright to make the pull lighter.',
    progressionTarget: '3 sets of 12 clean reps to unlock Inverted Table Rows.',
    visualGuideId: 'row',
    isQuietForHostel: true
  },
  {
    id: 'ex_pull_table_row',
    name: 'Inverted Horizontal Rows (Under Sturdy Desk/Table)',
    category: 'back',
    muscleGroups: { primary: ['Latissimus Dorsi', 'Mid-Back', 'Biceps'], secondary: ['Core', 'Grip'] },
    equipment: ['table'],
    modes: ['home'],
    difficulty: 'intermediate',
    progressionChainId: 'pull_chain',
    progressionLevel: 4,
    previousExerciseId: 'ex_pull_door_row',
    nextExerciseId: 'ex_pull_negative',
    prerequisites: ['ex_pull_door_row'],
    defaultSets: 3,
    defaultReps: 10,
    restSeconds: 75,
    tempo: '2-1-3',
    breathing: 'Exhale rowing chest to table edge; inhale lowering down.',
    setupSteps: [
      'Lie underneath a heavy, sturdy table with edge above upper chest.',
      'Grip the table edge with palms facing towards you or overhand.',
      'Heels on ground, body straight.'
    ],
    movementSteps: [
      'Pull chest up to touch the underside of the table.',
      'Lower down under complete control in 3 seconds.'
    ],
    commonMistakes: ['Piking hips or pulling with neck.'],
    safetyNotes: [
      'CRITICAL SAFETY: Only use a heavy solid wood dining table or reinforced desk. Place heavy textbooks/weights on top if needed to ensure zero tipping hazard.'
    ],
    beginnerVariation: 'Bend knees at 90 degrees with feet flat on the floor to reduce lever weight.',
    progressionTarget: '3 sets of 10 clean reps to unlock Negative Pull-ups.',
    visualGuideId: 'row',
    isQuietForHostel: true
  },
  {
    id: 'ex_pull_negative',
    name: 'Negative Pull-ups (5-Sec Controlled Descent)',
    category: 'back',
    muscleGroups: { primary: ['Latissimus Dorsi', 'Biceps', 'Upper Back'], secondary: ['Core', 'Forearms'] },
    equipment: ['pullup_bar'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'pull_chain',
    progressionLevel: 5,
    previousExerciseId: 'ex_pull_table_row',
    nextExerciseId: 'ex_pull_strict',
    prerequisites: ['ex_pull_table_row'],
    defaultSets: 3,
    defaultReps: 5,
    restSeconds: 90,
    tempo: '1-0-5',
    breathing: 'Inhale deeply as you lower yourself over 5 slow seconds.',
    setupSteps: [
      'Stand on a chair under the pull-up bar.',
      'Grip the bar overhand shoulder-width apart.'
    ],
    movementSteps: [
      'Jump or step up until chin is cleared above the bar.',
      'Lower yourself down as slowly as humanly possible, counting: 5... 4... 3... 2... 1... until dead-hang.',
      'Step back onto chair and repeat.'
    ],
    commonMistakes: ['Dropping fast during the last 2 inches of the bottom.'],
    safetyNotes: ['Step down safely; do not drop onto hard floor.'],
    beginnerVariation: 'Count a 3-second descent instead of 5 seconds.',
    progressionTarget: '3 sets of 5 reps with true 5-second descent to unlock Full Strict Pull-ups.',
    visualGuideId: 'pullup',
    isQuietForHostel: true
  },
  {
    id: 'ex_pull_strict',
    name: 'Calisthenics Strict Pull-ups',
    category: 'back',
    muscleGroups: { primary: ['Latissimus Dorsi (Lats)', 'Biceps', 'Rhomboids'], secondary: ['Forearms', 'Core'] },
    equipment: ['pullup_bar'],
    modes: ['home', 'hostel'],
    difficulty: 'advanced',
    progressionChainId: 'pull_chain',
    progressionLevel: 6,
    previousExerciseId: 'ex_pull_negative',
    nextExerciseId: 'ex_pull_chinup',
    prerequisites: ['ex_pull_negative'],
    defaultSets: 3,
    defaultReps: 5,
    restSeconds: 120,
    tempo: '2-1-3',
    breathing: 'Exhale pulling chest to bar; inhale smoothly lowering.',
    setupSteps: [
      'Dead-hang from pull-up bar, overhand grip slightly wider than shoulders.',
      'Depress scapula, engage core.'
    ],
    movementSteps: [
      'Drive elbows down to the floor, pulling chest up to the bar until chin clears top.',
      'Hold 1 second at peak.',
      'Lower down in 3 controlled seconds to full dead-hang.'
    ],
    commonMistakes: ['Kipping or kicking legs for momentum.'],
    safetyNotes: ['Never drop quickly into a relaxed shoulder socket at the bottom.'],
    beginnerVariation: 'Use a resistance band or toe-assist on chair.',
    progressionTarget: '3 sets of 8 strict reps to unlock Advanced Pull Variations.',
    visualGuideId: 'pullup',
    isQuietForHostel: true
  },
  {
    id: 'ex_pull_chinup',
    name: 'Underhand Chin-ups (Biceps & Lats)',
    category: 'back',
    muscleGroups: { primary: ['Biceps Brachii', 'Lower Lats'], secondary: ['Rhomboids', 'Forearms'] },
    equipment: ['pullup_bar'],
    modes: ['home', 'hostel'],
    difficulty: 'advanced',
    progressionChainId: 'pull_chain',
    progressionLevel: 7,
    previousExerciseId: 'ex_pull_strict',
    nextExerciseId: null,
    prerequisites: ['ex_pull_strict'],
    defaultSets: 3,
    defaultReps: 6,
    restSeconds: 90,
    tempo: '2-1-3',
    breathing: 'Exhale pulling up; inhale lowering.',
    setupSteps: ['Underhand grip (palms facing you) shoulder-width apart.'],
    movementSteps: [
      'Pull chin over the bar with powerful bicep and lat flexion.',
      'Squeeze biceps at the top.',
      'Lower under control to full dead-hang.'
    ],
    commonMistakes: ['Swinging body back and forth.'],
    safetyNotes: ['Ensure bar is firmly fastened.'],
    beginnerVariation: 'Perform negative chin-ups first.',
    progressionTarget: 'Calisthenics Pull Mastery.',
    visualGuideId: 'pullup',
    isQuietForHostel: true
  },

  // ==========================================
  // 3. SHOULDERS (Overhead / Inversion Chain)
  // ==========================================
  {
    id: 'ex_sh_lateral_raise',
    name: 'Dumbbell / Backpack Lateral Raises',
    category: 'shoulders',
    muscleGroups: { primary: ['Lateral Deltoids (Side Caps)'], secondary: ['Traps', 'Core'] },
    equipment: ['backpack', 'none'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'shoulder_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: 'ex_sh_pike',
    prerequisites: [],
    defaultSets: 3,
    defaultReps: 15,
    restSeconds: 60,
    tempo: '2-2-3',
    breathing: 'Exhale lifting arms parallel; inhale lowering.',
    setupSteps: [
      'Stand tall, holding light water bottles, books, or a lightly loaded backpack in each hand.',
      'Soft 15-degree bend in elbows.'
    ],
    movementSteps: [
      'Raise arms out to sides in a wide arc until parallel to floor at shoulder height.',
      'Pause and squeeze side delts for 2 full seconds.',
      'Lower slowly over 3 seconds.'
    ],
    commonMistakes: ['Shrugging neck or swinging hips.'],
    safetyNotes: ['Never use excessive weight; side delts respond best to light weight and strict tempo.'],
    beginnerVariation: 'Perform without weights just against self-resisted arm tension.',
    progressionTarget: '3 sets of 15 clean reps with 2s pause to unlock Pike Push-ups.',
    visualGuideId: 'lateral_raise',
    isQuietForHostel: true
  },
  {
    id: 'ex_sh_pike',
    name: 'Pike Push-ups',
    category: 'shoulders',
    muscleGroups: { primary: ['Anterior & Lateral Deltoids', 'Upper Chest'], secondary: ['Triceps', 'Core'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'shoulder_chain',
    progressionLevel: 2,
    previousExerciseId: 'ex_sh_lateral_raise',
    nextExerciseId: 'ex_sh_elevated_pike',
    prerequisites: ['ex_sh_lateral_raise'],
    defaultSets: 3,
    defaultReps: 8,
    restSeconds: 75,
    tempo: '2-1-2',
    breathing: 'Inhale lowering head forward; exhale pressing back up.',
    setupSteps: [
      'Assume a push-up position, then walk feet forward while lifting hips high into an inverted V (downward dog).',
      'Look back toward your toes.'
    ],
    movementSteps: [
      'Lower crown of your head forward in front of hands, forming a tripod shape.',
      'Press through palms and shoulders to return up to inverted V.'
    ],
    commonMistakes: ['Flaring elbows out sideways; keep them tracking at 45 degrees.'],
    safetyNotes: ['Place a soft pillow under head when learning the movement path.'],
    beginnerVariation: 'Bend knees slightly to reduce hamstring tightness.',
    progressionTarget: '3 sets of 10 clean reps to unlock Elevated Pike Push-ups.',
    visualGuideId: 'shoulder_press',
    isQuietForHostel: true
  },
  {
    id: 'ex_sh_elevated_pike',
    name: 'Elevated Pike Push-ups (Feet on Bed/Chair)',
    category: 'shoulders',
    muscleGroups: { primary: ['Deltoids (Shoulders)', 'Upper Pectorals'], secondary: ['Triceps', 'Serratus'] },
    equipment: ['bed', 'chair'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'shoulder_chain',
    progressionLevel: 3,
    previousExerciseId: 'ex_sh_pike',
    nextExerciseId: 'ex_sh_wall_walk',
    prerequisites: ['ex_sh_pike'],
    defaultSets: 3,
    defaultReps: 8,
    restSeconds: 90,
    tempo: '2-1-2',
    breathing: 'Inhale down; exhale pressing up.',
    setupSteps: [
      'Elevate feet onto bed or chair with hands on floor.',
      'Walk hands backward until hips are stacked over shoulders at a 90-degree angle.'
    ],
    movementSteps: [
      'Lower crown of head forward between hands.',
      'Press vertically back up to lockout.'
    ],
    commonMistakes: ['Letting hips drift backward away from vertical alignment.'],
    safetyNotes: ['Check chair stability; do not let hands slip on floor.'],
    beginnerVariation: 'Start with feet on a lower step/pillow.',
    progressionTarget: '3 sets of 8 clean reps to unlock Wall Walk Holds.',
    visualGuideId: 'shoulder_press',
    isQuietForHostel: true
  },
  {
    id: 'ex_sh_wall_walk',
    name: 'Wall Walk to Handstand Hold',
    category: 'shoulders',
    muscleGroups: { primary: ['Deltoids', 'Trapezius', 'Core Stabilizers'], secondary: ['Triceps', 'Wrists'] },
    equipment: ['wall'],
    modes: ['home', 'hostel'],
    difficulty: 'advanced',
    progressionChainId: 'shoulder_chain',
    progressionLevel: 4,
    previousExerciseId: 'ex_sh_elevated_pike',
    nextExerciseId: 'ex_sh_hspu',
    prerequisites: ['ex_sh_elevated_pike'],
    defaultSets: 3,
    defaultReps: 1,
    defaultDurationSeconds: 25,
    restSeconds: 90,
    tempo: 'Isometric Hold',
    breathing: 'Steady, continuous breathing; never hold breath inverted.',
    setupSteps: [
      'Start in a push-up position with feet touching the base of a clear wall.',
      'Take socks off for grip or wear clean sneakers.'
    ],
    movementSteps: [
      'Walk feet up the wall while walking hands backward toward the wall.',
      'Stop at a comfortable angle (45 degrees for beginners, vertical for advanced).',
      'Hold position, pushing floor away actively through shoulders.',
      'Carefully walk hands and feet back down to floor.'
    ],
    commonMistakes: ['Bailing sideways or collapsing onto neck.'],
    safetyNotes: [
      'SAFETY FIRST: Never walk higher than you can safely walk back down. Keep a 3-foot buffer from the wall initially. Clear all furniture away from the wall area.'
    ],
    beginnerVariation: 'Hold at a 45-degree angle instead of walking all the way to vertical.',
    progressionTarget: '3 sets of 30-second chest-to-wall holds to unlock Handstand Push-up progressions.',
    visualGuideId: 'shoulder_press',
    isQuietForHostel: true
  },
  {
    id: 'ex_sh_hspu',
    name: 'Wall Handstand Push-ups (HSPU)',
    category: 'shoulders',
    muscleGroups: { primary: ['Shoulders', 'Triceps', 'Upper Chest'], secondary: ['Core', 'Traps'] },
    equipment: ['wall'],
    modes: ['home', 'hostel'],
    difficulty: 'advanced',
    progressionChainId: 'shoulder_chain',
    progressionLevel: 5,
    previousExerciseId: 'ex_sh_wall_walk',
    nextExerciseId: null,
    prerequisites: ['ex_sh_wall_walk'],
    defaultSets: 3,
    defaultReps: 5,
    restSeconds: 120,
    tempo: '2-1-2',
    breathing: 'Inhale lowering; exhale pressing up.',
    setupSteps: ['Kick up or walk up to a handstand against wall with hands 6-10 inches from wall.'],
    movementSteps: [
      'Lower head forward until crown gently touches floor/pillow.',
      'Press forcefully through shoulders and palms to lockout.'
    ],
    commonMistakes: ['Over-arching back like a scorpion.'],
    safetyNotes: ['Place a pillow under head; only attempt after mastering elevated pikes.'],
    beginnerVariation: 'Use elevated pike push-ups or negative handstand descents.',
    progressionTarget: 'Mastery of overhead calisthenics pressing.',
    visualGuideId: 'shoulder_press',
    isQuietForHostel: true
  },

  // ==========================================
  // 4. BICEPS
  // ==========================================
  {
    id: 'ex_bi_backpack_curl',
    name: 'Backpack / Water Bottle Bicep Curls',
    category: 'biceps',
    muscleGroups: { primary: ['Biceps Brachii'], secondary: ['Brachialis', 'Forearms'] },
    equipment: ['backpack'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'bicep_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: 'ex_bi_door_curl',
    prerequisites: [],
    defaultSets: 3,
    defaultReps: 12,
    restSeconds: 60,
    tempo: '2-1-3',
    breathing: 'Exhale curling up; inhale lowering in 3 seconds.',
    setupSteps: [
      'Fill a school backpack with textbooks or water bottles to a comfortable weight.',
      'Grip the top handle or side straps with elbows pinned to ribs.'
    ],
    movementSteps: [
      'Curl the bag upward while keeping elbows completely stationary at sides.',
      'Squeeze biceps hard for 1 second at top.',
      'Lower over 3 slow seconds.'
    ],
    commonMistakes: ['Swinging elbows forward or leaning backward.'],
    safetyNotes: ['Check that backpack straps and zippers are fully secured.'],
    beginnerVariation: 'Start with fewer textbooks in the backpack.',
    progressionTarget: '3 sets of 15 clean reps with 3s negative.',
    visualGuideId: 'curl',
    isQuietForHostel: true
  },
  {
    id: 'ex_bi_door_curl',
    name: 'Doorframe Underhand Bicep Curls',
    category: 'biceps',
    muscleGroups: { primary: ['Biceps Brachii', 'Brachialis'], secondary: ['Forearms'] },
    equipment: ['doorframe'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'bicep_chain',
    progressionLevel: 2,
    previousExerciseId: 'ex_bi_backpack_curl',
    nextExerciseId: null,
    prerequisites: ['ex_bi_backpack_curl'],
    defaultSets: 3,
    defaultReps: 10,
    restSeconds: 60,
    tempo: '2-2-3',
    breathing: 'Exhale pulling inward; inhale extending.',
    setupSteps: [
      'Stand inside doorway, grip doorframe with an underhand palm-facing-you grip.',
      'Lean back slightly.'
    ],
    movementSteps: [
      'Pull your chest toward the frame by curling your arms inward.',
      'Hold peak bicep contraction for 2 seconds.',
      'Lower back smoothly.'
    ],
    commonMistakes: ['Using shoulder momentum instead of arm flexion.'],
    safetyNotes: ['Ensure firm grip on doorway.'],
    beginnerVariation: 'Step closer to the doorway to lighten the bodyweight angle.',
    progressionTarget: 'Bicep bodyweight isolation mastery.',
    visualGuideId: 'curl',
    isQuietForHostel: true
  },

  // ==========================================
  // 5. TRICEPS
  // ==========================================
  {
    id: 'ex_tri_bench_dip',
    name: 'Bed / Chair Tricep Dips',
    category: 'triceps',
    muscleGroups: { primary: ['Triceps (All Heads)'], secondary: ['Anterior Deltoids', 'Lower Chest'] },
    equipment: ['bed', 'chair'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'tricep_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: 'ex_tri_parallel_dip',
    prerequisites: [],
    defaultSets: 3,
    defaultReps: 12,
    restSeconds: 60,
    tempo: '2-1-2',
    breathing: 'Inhale lowering; exhale pressing up.',
    setupSteps: [
      'Sit on edge of bed or stable chair, hands beside hips gripping edge.',
      'Extend legs forward, slide hips off edge.'
    ],
    movementSteps: [
      'Lower hips by bending elbows until upper arms reach 90 degrees.',
      'Keep back close to the bed/chair edge.',
      'Press through palms to lockout triceps.'
    ],
    commonMistakes: ['Hips drifting too far away from the chair (strains shoulders).'],
    safetyNotes: ['Ensure chair will not tip forward. Push chair against a wall.'],
    beginnerVariation: 'Keep knees bent at 90 degrees with feet flat on the floor.',
    progressionTarget: '3 sets of 15 clean reps with straight legs to unlock Parallel Bar Dips.',
    visualGuideId: 'dip',
    isQuietForHostel: true
  },
  {
    id: 'ex_tri_parallel_dip',
    name: 'Parallel Bar / Two-Chair Calisthenics Dips',
    category: 'triceps',
    muscleGroups: { primary: ['Triceps', 'Lower Chest'], secondary: ['Anterior Deltoids', 'Core'] },
    equipment: ['chair'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'tricep_chain',
    progressionLevel: 2,
    previousExerciseId: 'ex_tri_bench_dip',
    nextExerciseId: null,
    prerequisites: ['ex_tri_bench_dip'],
    defaultSets: 3,
    defaultReps: 8,
    restSeconds: 90,
    tempo: '2-1-3',
    breathing: 'Inhale lowering to 90 degrees; exhale pressing up.',
    setupSteps: [
      'Position two heavy, stable chairs back-to-back, or mount dip bars.',
      'Support full bodyweight with straight locked arms.'
    ],
    movementSteps: [
      'Lower body until elbows are at a 90-degree angle.',
      'Torso slightly angled forward for chest and tricep recruitment.',
      'Press through palms back to lockout.'
    ],
    commonMistakes: ['Dipping lower than 90 degrees (strains shoulder joints).'],
    safetyNotes: [
      'SAFETY FIRST: Test chairs with downward pressure first to verify they do not wobble or slide.'
    ],
    beginnerVariation: 'Rest toes lightly on floor to assist the ascent.',
    progressionTarget: '3 sets of 10 clean unassisted dips.',
    visualGuideId: 'dip',
    isQuietForHostel: true
  },

  // ==========================================
  // 6. FOREARMS & GRIP
  // ==========================================
  {
    id: 'ex_fore_wrist_curls',
    name: 'Towel / Backpack Wrist Curls',
    category: 'forearms',
    muscleGroups: { primary: ['Forearm Flexors & Extensors'], secondary: ['Grip Strength'] },
    equipment: ['backpack'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'forearm_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: null,
    prerequisites: [],
    defaultSets: 3,
    defaultReps: 15,
    restSeconds: 45,
    tempo: '2-1-2',
    breathing: 'Exhale curling wrists; inhale extending.',
    setupSteps: [
      'Rest forearms on thighs or desk edge, holding a light water bottle or bag handle with palms up.'
    ],
    movementSteps: [
      'Curl wrists upward, pause for 1 second, then lower down into full extension.',
      'Repeat with palms down for forearm extensors.'
    ],
    commonMistakes: ['Moving the entire forearm instead of isolating wrists.'],
    safetyNotes: ['Use light resistance; wrists are delicate joints.'],
    beginnerVariation: 'Perform with empty hands squeezing fists tightly.',
    progressionTarget: 'Solid forearm endurance and grip resilience.',
    visualGuideId: 'curl',
    isQuietForHostel: true
  },

  // ==========================================
  // 7. CORE / ABS (Core Progression Chain)
  // ==========================================
  {
    id: 'ex_core_dead_bug',
    name: 'Dead Bug (Core Neutralization)',
    category: 'core',
    muscleGroups: { primary: ['Transverse Abdominis (Deep Core)'], secondary: ['Hip Flexors', 'Pelvic Floor'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'core_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: 'ex_core_plank',
    prerequisites: [],
    defaultSets: 3,
    defaultReps: 12,
    restSeconds: 45,
    tempo: '2-1-2',
    breathing: 'Exhale extending opposite arm and leg; inhale returning to center.',
    setupSteps: [
      'Lie flat on back, arms pointing to ceiling, knees bent at 90 degrees above hips.',
      'Press lower back firmly into the floor (zero gap under lower spine).'
    ],
    movementSteps: [
      'Slowly extend right arm overhead and left leg straight toward floor without letting lower back lift.',
      'Return to center and switch to opposite limbs.'
    ],
    commonMistakes: ['Arching lower back off the floor.'],
    safetyNotes: ['Keep lower back pressed down at all times; stop if lower back aches.'],
    beginnerVariation: 'Keep knees bent when tapping heels to the floor.',
    progressionTarget: '3 sets of 12 clean reps to unlock Forearm Plank.',
    visualGuideId: 'plank',
    isQuietForHostel: true
  },
  {
    id: 'ex_core_plank',
    name: 'Forearm Plank',
    category: 'core',
    muscleGroups: { primary: ['Transverse Abdominis', 'Rectus Abdominis'], secondary: ['Glutes', 'Shoulders'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'core_chain',
    progressionLevel: 2,
    previousExerciseId: 'ex_core_dead_bug',
    nextExerciseId: 'ex_core_hollow_tuck',
    prerequisites: ['ex_core_dead_bug'],
    defaultSets: 3,
    defaultReps: 1,
    defaultDurationSeconds: 30,
    restSeconds: 60,
    tempo: 'Isometric Hold',
    breathing: 'Slow, steady breathing; do not hold breath.',
    setupSteps: [
      'Rest on forearms, elbows directly under shoulders.',
      'Legs extended behind, toes on ground, glutes squeezed tight.'
    ],
    movementSteps: [
      'Pull navel to spine, forming a flat ruler from head to heels.',
      'Hold position with steady breathing for the prescribed duration.'
    ],
    commonMistakes: ['Sagging hips or holding breath.'],
    safetyNotes: ['Stop if lower back sags or pinches.'],
    beginnerVariation: 'Plank on knees instead of toes.',
    progressionTarget: '3 sets of 45-second unbroken holds to unlock Hollow Tuck.',
    visualGuideId: 'plank',
    isQuietForHostel: true
  },
  {
    id: 'ex_core_hollow_tuck',
    name: 'Hollow Tuck Hold',
    category: 'core',
    muscleGroups: { primary: ['Rectus Abdominis (Six-Pack)', 'Transverse Core'], secondary: ['Hip Flexors'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'core_chain',
    progressionLevel: 3,
    previousExerciseId: 'ex_core_plank',
    nextExerciseId: 'ex_core_hollow_hold',
    prerequisites: ['ex_core_plank'],
    defaultSets: 3,
    defaultReps: 1,
    defaultDurationSeconds: 30,
    restSeconds: 60,
    tempo: 'Isometric Hold',
    breathing: 'Short controlled breaths while keeping core braced.',
    setupSteps: [
      'Lie flat on back, pull knees into chest, curl shoulders 3 inches off floor.',
      'Lower back glued to floor.'
    ],
    movementSteps: [
      'Reach arms forward beside hips, hold tucked position with abs contracted.',
      'Keep neck relaxed.'
    ],
    commonMistakes: ['Tension in neck instead of abs.'],
    safetyNotes: ['Ensure lower back remains 100% in contact with floor.'],
    beginnerVariation: 'Hold knees with hands lightly to help keep lower back flat.',
    progressionTarget: '3 sets of 30 seconds to unlock Full Hollow Body Hold.',
    visualGuideId: 'core_hollow',
    isQuietForHostel: true
  },
  {
    id: 'ex_core_hollow_hold',
    name: 'Hollow Body Hold (Gymnastic Foundation)',
    category: 'core',
    muscleGroups: { primary: ['Transverse Abdominis', 'Rectus Abdominis'], secondary: ['Hip Flexors', 'Quads'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'core_chain',
    progressionLevel: 4,
    previousExerciseId: 'ex_core_hollow_tuck',
    nextExerciseId: 'ex_core_leg_raise',
    prerequisites: ['ex_core_hollow_tuck'],
    defaultSets: 3,
    defaultReps: 1,
    defaultDurationSeconds: 30,
    restSeconds: 60,
    tempo: 'Isometric Hold',
    breathing: 'Rhythmic shallow breaths; brace abs for impact.',
    setupSteps: [
      'Lie on back, arms reaching overhead past ears, legs straight and together.',
      'Tilt pelvis backward until lower back is glued flat into floor.'
    ],
    movementSteps: [
      'Lift shoulders and legs 4-6 inches off floor forming a shallow banana shape.',
      'Hold position without letting lower back lift off the floor.'
    ],
    commonMistakes: ['Allowing lower back to arch off the floor.'],
    safetyNotes: ['If lower back arches, immediately bend knees back to tuck to protect lumbar spine.'],
    beginnerVariation: 'Keep arms by sides and bend one knee to chest.',
    progressionTarget: '3 sets of 35-40 seconds clean hold to unlock Lying Leg Raises.',
    visualGuideId: 'core_hollow',
    isQuietForHostel: true
  },
  {
    id: 'ex_core_leg_raise',
    name: 'Lying Floor Leg Raises',
    category: 'core',
    muscleGroups: { primary: ['Lower Abdominals', 'Hip Flexors'], secondary: ['Obliques'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'core_chain',
    progressionLevel: 5,
    previousExerciseId: 'ex_core_hollow_hold',
    nextExerciseId: 'ex_core_tuck_lsit',
    prerequisites: ['ex_core_hollow_hold'],
    defaultSets: 3,
    defaultReps: 12,
    restSeconds: 60,
    tempo: '2-1-3',
    breathing: 'Exhale raising legs; inhale on 3-second descent.',
    setupSteps: [
      'Lie flat on back, hands under glutes for support, legs straight.'
    ],
    movementSteps: [
      'Raise legs up to 90 degrees.',
      'Lower legs slowly over 3 seconds, stopping 2 inches off floor without touching heels.',
      'Raise immediately.'
    ],
    commonMistakes: ['Bouncing heels off the floor or arching back.'],
    safetyNotes: ['Keep lower back pressed down.'],
    beginnerVariation: 'Bend knees slightly.',
    progressionTarget: '3 sets of 12 clean reps with 3s negative to unlock Tuck L-Sit.',
    visualGuideId: 'core_leg_raise',
    isQuietForHostel: true
  },
  {
    id: 'ex_core_tuck_lsit',
    name: 'Tuck L-Sit (Between Two Chairs or Floor)',
    category: 'core',
    muscleGroups: { primary: ['Hip Flexors', 'Abdominals', 'Triceps'], secondary: ['Lats', 'Shoulders'] },
    equipment: ['chair', 'floor'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'core_chain',
    progressionLevel: 6,
    previousExerciseId: 'ex_core_leg_raise',
    nextExerciseId: 'ex_core_full_lsit',
    prerequisites: ['ex_core_leg_raise'],
    defaultSets: 3,
    defaultReps: 1,
    defaultDurationSeconds: 15,
    restSeconds: 75,
    tempo: 'Isometric Hold',
    breathing: 'Deep, steady breathing under compression.',
    setupSteps: [
      'Place hands on two stable chairs or push-up bars, lock out arms.',
      'Push down to depress shoulders.'
    ],
    movementSteps: [
      'Lift feet off floor and tuck knees into chest.',
      'Hold body suspended in the air with knees tucked for 15-20 seconds.'
    ],
    commonMistakes: ['Shrugging shoulders into ears.'],
    safetyNotes: ['Test chair stability before lifting full bodyweight.'],
    beginnerVariation: 'Keep one foot lightly on floor.',
    progressionTarget: '3 sets of 20 seconds to unlock Full L-Sit.',
    visualGuideId: 'lsit',
    isQuietForHostel: true
  },
  {
    id: 'ex_core_full_lsit',
    name: 'Full L-Sit Hold',
    category: 'core',
    muscleGroups: { primary: ['Rectus Abdominis', 'Hip Flexors', 'Triceps'], secondary: ['Quads', 'Lats'] },
    equipment: ['chair', 'floor'],
    modes: ['home', 'hostel'],
    difficulty: 'advanced',
    progressionChainId: 'core_chain',
    progressionLevel: 7,
    previousExerciseId: 'ex_core_tuck_lsit',
    nextExerciseId: null,
    prerequisites: ['ex_core_tuck_lsit'],
    defaultSets: 3,
    defaultReps: 1,
    defaultDurationSeconds: 15,
    restSeconds: 90,
    tempo: 'Isometric Hold',
    breathing: 'Steady breathing under intense abdominal compression.',
    setupSteps: ['Support body on two chairs or floor, arms locked.'],
    movementSteps: [
      'Extend legs straight out horizontally, forming a sharp 90-degree L with torso.',
      'Point toes and hold without trembling.'
    ],
    commonMistakes: ['Dropping legs below horizontal.'],
    safetyNotes: ['Ensure shoulders remain actively depressed away from ears.'],
    beginnerVariation: 'Extend one leg while keeping the other tucked.',
    progressionTarget: 'Elite Calisthenics Core Mastery.',
    visualGuideId: 'lsit',
    isQuietForHostel: true
  },

  // ==========================================
  // 8. GLUTES
  // ==========================================
  {
    id: 'ex_glute_bridge',
    name: 'Floor Glute Bridges',
    category: 'glutes',
    muscleGroups: { primary: ['Gluteus Maximus'], secondary: ['Hamstrings', 'Lower Back'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'glute_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: 'ex_glute_single_leg',
    prerequisites: [],
    defaultSets: 3,
    defaultReps: 15,
    restSeconds: 45,
    tempo: '2-2-2',
    breathing: 'Exhale driving hips up; inhale lowering down.',
    setupSteps: [
      'Lie flat on back, knees bent, feet flat on floor hip-width apart and close to glutes.'
    ],
    movementSteps: [
      'Drive through heels to bridge hips up until knees, hips, and shoulders form a straight slope.',
      'Squeeze glutes hard for 2 full seconds at the top.',
      'Lower hips slowly without completely resting on floor.'
    ],
    commonMistakes: ['Pushing through toes instead of heels or over-arching lower back.'],
    safetyNotes: ['Keep ribs down to prevent hyperextending the lumbar spine.'],
    beginnerVariation: 'Hold for 1 second instead of 2 seconds at peak.',
    progressionTarget: '3 sets of 20 clean reps to unlock Single-Leg Glute Bridges.',
    visualGuideId: 'glute_bridge',
    isQuietForHostel: true
  },
  {
    id: 'ex_glute_single_leg',
    name: 'Single-Leg Glute Bridges',
    category: 'glutes',
    muscleGroups: { primary: ['Gluteus Maximus (Unilateral)'], secondary: ['Hamstrings', 'Core'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'glute_chain',
    progressionLevel: 2,
    previousExerciseId: 'ex_glute_bridge',
    nextExerciseId: null,
    prerequisites: ['ex_glute_bridge'],
    defaultSets: 3,
    defaultReps: 10,
    restSeconds: 60,
    tempo: '2-1-2',
    breathing: 'Exhale driving up; inhale lowering.',
    setupSteps: [
      'Set up for glute bridge, then extend one leg straight out in line with thigh.'
    ],
    movementSteps: [
      'Drive through working heel to elevate hips.',
      'Squeeze glute at top, keep pelvis level (do not tilt).',
      'Lower under control.'
    ],
    commonMistakes: ['Letting hips dip on the unsupported side.'],
    safetyNotes: ['Stop if hamstring cramps; stretch and reset foot closer to glutes.'],
    beginnerVariation: 'Cross the non-working ankle over the working knee.',
    progressionTarget: 'Unilateral glute power and pelvic stability mastery.',
    visualGuideId: 'glute_bridge',
    isQuietForHostel: true
  },

  // ==========================================
  // 9. QUADRICEPS (Leg Progression Chain)
  // ==========================================
  {
    id: 'ex_leg_air_squat',
    name: 'Bodyweight Air Squats',
    category: 'quadriceps',
    muscleGroups: { primary: ['Quadriceps', 'Glutes'], secondary: ['Hamstrings', 'Calves', 'Core'] },
    equipment: ['none', 'floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'leg_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: 'ex_leg_tempo_squat',
    prerequisites: [],
    defaultSets: 3,
    defaultReps: 15,
    restSeconds: 60,
    tempo: '2-1-2',
    breathing: 'Inhale sitting down; exhale driving out of the hole.',
    setupSteps: [
      'Feet shoulder-width apart, toes turned outward 15 degrees.',
      'Chest up, shoulders back, arms out for counter-balance.'
    ],
    movementSteps: [
      'Push hips back and bend knees, sinking down until hip crease is parallel to knees.',
      'Knees track over middle toes; heels glued flat to floor.',
      'Drive through heels to stand tall, squeezing glutes at top.'
    ],
    commonMistakes: ['Knees collapsing inward (valgus collapse) or heels lifting off floor.'],
    safetyNotes: ['Stop if knee joint pinches; check stance width and toe angle.'],
    beginnerVariation: 'Box squat: sit down onto your bed or chair, pause, and stand up.',
    progressionTarget: '3 sets of 20 clean reps to unlock Tempo Squats.',
    visualGuideId: 'squat',
    isQuietForHostel: true
  },
  {
    id: 'ex_leg_tempo_squat',
    name: 'Tempo Squats (3-Sec Descent + 2-Sec Pause)',
    category: 'quadriceps',
    muscleGroups: { primary: ['Quadriceps', 'Gluteus Medius'], secondary: ['Core', 'Adductors'] },
    equipment: ['none'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'leg_chain',
    progressionLevel: 2,
    previousExerciseId: 'ex_leg_air_squat',
    nextExerciseId: 'ex_leg_reverse_lunge',
    prerequisites: ['ex_leg_air_squat'],
    defaultSets: 3,
    defaultReps: 12,
    restSeconds: 60,
    tempo: '3-2-1',
    breathing: 'Inhale on 3-second descent; hold breath in bottom pause; exhale standing.',
    setupSteps: ['Standard squat stance with upright posture.'],
    movementSteps: [
      'Take 3 full seconds to descend into parallel depth.',
      'Hold completely still at the bottom for 2 full seconds (no bouncing).',
      'Drive up explosively in 1 second.'
    ],
    commonMistakes: ['Rushing the 2-second bottom pause.'],
    safetyNotes: ['Maintain tension in glutes at bottom; do not collapse into joints.'],
    beginnerVariation: 'Reduce pause to 1 second.',
    progressionTarget: '3 sets of 12 clean reps to unlock Reverse Lunges.',
    visualGuideId: 'squat',
    isQuietForHostel: true
  },
  {
    id: 'ex_leg_reverse_lunge',
    name: 'Reverse Lunges',
    category: 'quadriceps',
    muscleGroups: { primary: ['Quadriceps', 'Glutes'], secondary: ['Hamstrings', 'Calves', 'Balance'] },
    equipment: ['none'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'leg_chain',
    progressionLevel: 3,
    previousExerciseId: 'ex_leg_tempo_squat',
    nextExerciseId: 'ex_leg_bulgarian_squat',
    prerequisites: ['ex_leg_tempo_squat'],
    defaultSets: 3,
    defaultReps: 10,
    restSeconds: 60,
    tempo: '2-1-2',
    breathing: 'Inhale stepping back; exhale driving forward to standing.',
    setupSteps: ['Stand tall with feet hip-width apart, hands on hips.'],
    movementSteps: [
      'Step one foot straight back, bending both knees to 90 degrees.',
      'Front knee tracks directly over front middle toes; back knee hovers 1 inch off floor.',
      'Drive through front heel to step back to starting position.'
    ],
    commonMistakes: ['Front knee shooting far past toes or wobbling inward.'],
    safetyNotes: ['Reverse lunges are much friendlier on knees than forward lunges.'],
    beginnerVariation: 'Hold onto a wall or desk with one hand for balance assistance.',
    progressionTarget: '3 sets of 10 reps per leg to unlock Bulgarian Split Squats.',
    visualGuideId: 'lunge',
    isQuietForHostel: true
  },
  {
    id: 'ex_leg_bulgarian_squat',
    name: 'Bulgarian Split Squats (Rear Foot on Bed/Chair)',
    category: 'quadriceps',
    muscleGroups: { primary: ['Quadriceps', 'Gluteus Medius & Maximus'], secondary: ['Hamstrings', 'Balance'] },
    equipment: ['bed', 'chair'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'leg_chain',
    progressionLevel: 4,
    previousExerciseId: 'ex_leg_reverse_lunge',
    nextExerciseId: 'ex_leg_pistol_progression',
    prerequisites: ['ex_leg_reverse_lunge'],
    defaultSets: 3,
    defaultReps: 10,
    restSeconds: 75,
    tempo: '3-1-1',
    breathing: 'Inhale lowering straight down; exhale driving through front heel.',
    setupSteps: [
      'Stand 2 feet in front of a bed, chair, or bench.',
      'Place top of rear foot flat on the elevated surface behind you.'
    ],
    movementSteps: [
      'Lower hips straight down like an elevator until front thigh is parallel to floor.',
      'Front knee stays in line with middle toes.',
      'Drive through front heel to return to standing.'
    ],
    commonMistakes: ['Front foot placed too close to the bench causing cramped knee.'],
    safetyNotes: ['Check chair stability; hold a wall with one hand if balance is unsteady.'],
    beginnerVariation: 'Start with rear foot on a low 6-inch book/step.',
    progressionTarget: '3 sets of 12 clean reps per leg to unlock Single-Leg Pistol Progressions.',
    visualGuideId: 'lunge',
    isQuietForHostel: true
  },
  {
    id: 'ex_leg_pistol_progression',
    name: 'Assisted Single-Leg Pistol Squats',
    category: 'quadriceps',
    muscleGroups: { primary: ['Quadriceps (Peak Isolation)', 'Glutes'], secondary: ['Ankle Mobility', 'Core'] },
    equipment: ['chair', 'doorframe'],
    modes: ['home', 'hostel'],
    difficulty: 'advanced',
    progressionChainId: 'leg_chain',
    progressionLevel: 5,
    previousExerciseId: 'ex_leg_bulgarian_squat',
    nextExerciseId: null,
    prerequisites: ['ex_leg_bulgarian_squat'],
    defaultSets: 3,
    defaultReps: 5,
    restSeconds: 90,
    tempo: '3-1-2',
    breathing: 'Inhale descending on one leg; exhale driving up.',
    setupSteps: [
      'Stand holding a doorframe or chair with one leg extended straight forward off floor.'
    ],
    movementSteps: [
      'Sit down on working leg, keeping elevated leg out in front.',
      'Use light hand assist on the doorframe to control the descent and press back up.'
    ],
    commonMistakes: ['Lifting the working heel off the floor.'],
    safetyNotes: ['High demand on knee tendons; do not bounce out of bottom.'],
    beginnerVariation: 'Perform pistol squats sitting down to a chair (box pistol squat).',
    progressionTarget: 'Single-leg strength mastery.',
    visualGuideId: 'squat',
    isQuietForHostel: true
  },

  // ==========================================
  // 10. HAMSTRINGS
  // ==========================================
  {
    id: 'ex_ham_walkout',
    name: 'Hamstring Bridge Walkouts',
    category: 'hamstrings',
    muscleGroups: { primary: ['Hamstrings (Biceps Femoris)'], secondary: ['Glutes', 'Calves'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'hamstring_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: null,
    prerequisites: [],
    defaultSets: 3,
    defaultReps: 10,
    restSeconds: 60,
    tempo: '2-1-2',
    breathing: 'Exhale walking out; inhale walking back.',
    setupSteps: [
      'Lie on back in a glute bridge position with hips elevated.'
    ],
    movementSteps: [
      'Take small steps forward with heels, walking feet away from hips until legs are nearly straight.',
      'Hold for 1 second feeling intense hamstring tension.',
      'Walk heels back to starting bridge.'
    ],
    commonMistakes: ['Dropping hips to the floor during the walkout.'],
    safetyNotes: ['Stop if hamstring cramps; stretch and re-hydrate.'],
    beginnerVariation: 'Take only 2 small steps out rather than walking to full extension.',
    progressionTarget: 'Hamstring resilience and injury prevention.',
    visualGuideId: 'glute_bridge',
    isQuietForHostel: true
  },

  // ==========================================
  // 11. CALVES
  // ==========================================
  {
    id: 'ex_calf_raise',
    name: 'Standing Double / Single-Leg Calf Raises',
    category: 'calves',
    muscleGroups: { primary: ['Gastrocnemius', 'Soleus'], secondary: ['Tibialis', 'Ankles'] },
    equipment: ['wall', 'floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'calf_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: null,
    prerequisites: [],
    defaultSets: 3,
    defaultReps: 20,
    restSeconds: 45,
    tempo: '2-2-2',
    breathing: 'Exhale rising onto balls of feet; inhale lowering.',
    setupSteps: [
      'Stand near a wall for balance, balls of feet on floor or edge of a thick book/stair.'
    ],
    movementSteps: [
      'Drive high onto balls of big toes, squeezing calf muscles at the very top.',
      'Hold 2 seconds at peak.',
      'Lower heels down below the step line for a full stretch.'
    ],
    commonMistakes: ['Bouncing fast without holding the peak squeeze.'],
    safetyNotes: ['Keep knees softly unlocked.'],
    beginnerVariation: 'Double leg flat on floor.',
    progressionTarget: '3 sets of 15 single-leg calf raises per leg.',
    visualGuideId: 'squat',
    isQuietForHostel: true
  },

  // ==========================================
  // 12. FULL BODY
  // ==========================================
  {
    id: 'ex_fb_bear_crawl',
    name: 'Bear Crawl Holds & Static Steps',
    category: 'full-body',
    muscleGroups: { primary: ['Core', 'Quads', 'Shoulders'], secondary: ['Serratus', 'Hip Flexors'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'fullbody_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: null,
    prerequisites: [],
    defaultSets: 3,
    defaultReps: 1,
    defaultDurationSeconds: 30,
    restSeconds: 60,
    tempo: 'Isometric / Controlled Steps',
    breathing: 'Calm, steady nasal breathing.',
    setupSteps: [
      'Get on all fours (tabletop) with hands under shoulders, knees under hips.',
      'Tuck toes and lift knees exactly 1 inch off the floor.'
    ],
    movementSteps: [
      'Hover knees 1 inch off floor with spine completely flat as a table.',
      'Hold stationary or take small 6-inch steps forward and backward without letting hips sway.'
    ],
    commonMistakes: ['Bum high in air; keep knees hovering just 1 inch off the floor.'],
    safetyNotes: ['100% silent and hostel-room safe; zero impact.'],
    beginnerVariation: 'Hold static bear plank for 20 seconds.',
    progressionTarget: 'Full body coordination and stability foundation.',
    visualGuideId: 'plank',
    isQuietForHostel: true
  },

  // ==========================================
  // 13. CARDIO / STAMINA (Stamina Ladder Chain)
  // ==========================================
  {
    id: 'ex_cardio_silent_step',
    name: 'Quiet Hostel March & Step-Jacks',
    category: 'cardio',
    muscleGroups: { primary: ['Cardiovascular System', 'Full Body Conditioning'], secondary: ['Calves', 'Core'] },
    equipment: ['none'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'stamina_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: 'ex_cardio_boxer_bounce',
    prerequisites: [],
    defaultSets: 1,
    defaultReps: 1,
    defaultDurationSeconds: 300, // 5 minutes
    restSeconds: 60,
    tempo: 'Steady Cadence (110-130 BPM)',
    breathing: 'Rhythmic nasal inhalation, steady mouth exhalation.',
    setupSteps: ['Clear a 4x4 ft space in your room.'],
    movementSteps: [
      'Alternate between 1 minute of quiet high-knee marching and 1 minute of low-impact step-jacks (stepping one foot out sideways while clapping arms overhead without jumping).',
      'Whisper-quiet: zero floor vibrations for roommates or floor below.'
    ],
    commonMistakes: ['Stomping heels loudly onto floor.'],
    safetyNotes: ['Stay on balls of feet for silent landings; stop if lightheaded.'],
    beginnerVariation: 'Start with 3 minutes and build to 5 minutes.',
    progressionTarget: '5 minutes unbroken stamina to advance to 8 minutes.',
    visualGuideId: 'core_climber',
    isQuietForHostel: true
  },
  {
    id: 'ex_cardio_boxer_bounce',
    name: 'Shadow Boxing & Light Footwork',
    category: 'cardio',
    muscleGroups: { primary: ['Cardiovascular Stamina', 'Shoulders', 'Rotational Core'], secondary: ['Calves'] },
    equipment: ['none'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'stamina_chain',
    progressionLevel: 2,
    previousExerciseId: 'ex_cardio_silent_step',
    nextExerciseId: 'ex_cardio_climber_intervals',
    prerequisites: ['ex_cardio_silent_step'],
    defaultSets: 1,
    defaultReps: 1,
    defaultDurationSeconds: 480, // 8 minutes
    restSeconds: 60,
    tempo: 'Rhythmic Combinations',
    breathing: 'Sharp exhale with each punch (tss-tss!).',
    setupSteps: ['Athletic stance, knees soft, hands guarding chin.'],
    movementSteps: [
      'Throw smooth 1-2 jab-cross combinations, slipping and pivoting lightly on balls of feet.',
      'Maintain continuous light movement for prescribed duration.'
    ],
    commonMistakes: ['Hyperextending elbows on punches.'],
    safetyNotes: ['Never lock elbows violently on punches.'],
    beginnerVariation: 'Throw punches at 50% speed focusing on fluid breathing.',
    progressionTarget: '8-10 minutes continuous stamina.',
    visualGuideId: 'core_climber',
    isQuietForHostel: true
  },
  {
    id: 'ex_cardio_climber_intervals',
    name: 'Mountain Climbers & Core Cardio Intervals',
    category: 'cardio',
    muscleGroups: { primary: ['Cardiovascular System', 'Core', 'Shoulders'], secondary: ['Hip Flexors'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'stamina_chain',
    progressionLevel: 3,
    previousExerciseId: 'ex_cardio_boxer_bounce',
    nextExerciseId: null,
    prerequisites: ['ex_cardio_boxer_bounce'],
    defaultSets: 3,
    defaultReps: 30,
    restSeconds: 45,
    tempo: 'High-Tempo Interval',
    breathing: 'Deep continuous rhythmic breathing.',
    setupSteps: ['Push-up plank position on floor.'],
    movementSteps: [
      'Drive knees forward in a smooth running cadence while keeping hips level.',
      'Light quiet toe touches.'
    ],
    commonMistakes: ['Bouncing hips in the air.'],
    safetyNotes: ['Keep wrists stacked under shoulders.'],
    beginnerVariation: 'Slow mountain climbers: 1 knee at a time without jumping.',
    progressionTarget: 'High-level cardiovascular stamina (15-20 minutes total workout capacity).',
    visualGuideId: 'core_climber',
    isQuietForHostel: true
  },

  // ==========================================
  // 14. MOBILITY & JOINT RECOVERY
  // ==========================================
  {
    id: 'ex_mob_worlds_greatest',
    name: "World's Greatest Stretch & Thoracic Rotation",
    category: 'mobility',
    muscleGroups: { primary: ['Thoracic Spine', 'Hip Flexors', 'Hamstrings'], secondary: ['Shoulders', 'Groin'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'mobility_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: null,
    prerequisites: [],
    defaultSets: 2,
    defaultReps: 5,
    restSeconds: 30,
    tempo: '3-Sec Hold per Position',
    breathing: 'Deep exhale opening chest toward ceiling.',
    setupSteps: ['Start in a deep runner’s lunge with left foot outside left hand.'],
    movementSteps: [
      'Reach left elbow down toward left instep.',
      'Rotate left arm up towards ceiling, following hand with eyes.',
      'Place hand down, push hips back to stretch front hamstring, then switch legs.'
    ],
    commonMistakes: ['Rushing through positions; sink into the stretch smoothly.'],
    safetyNotes: ['Gentle movement only; never bounce into pain.'],
    beginnerVariation: 'Keep rear knee on the floor.',
    progressionTarget: 'Full daily joint freedom and posture restoration.',
    visualGuideId: 'squat',
    isQuietForHostel: true
  },
  {
    id: 'ex_mob_hip_90_90',
    name: 'Hip 90/90 Internal & External Rotations',
    category: 'mobility',
    muscleGroups: { primary: ['Hip Capsule', 'Glutes', 'Piriformis'], secondary: ['Lower Back'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'beginner',
    progressionChainId: 'mobility_chain',
    progressionLevel: 2,
    previousExerciseId: null,
    nextExerciseId: null,
    prerequisites: [],
    defaultSets: 2,
    defaultReps: 8,
    restSeconds: 30,
    tempo: 'Smooth Controlled Transition',
    breathing: 'Exhale sinking into hip hinge.',
    setupSteps: ['Sit on floor with front leg bent at 90 degrees and rear leg bent at 90 degrees.'],
    movementSteps: [
      'Hinge forward over front shin keeping spine tall for 5 seconds.',
      'Rotate knees across to the opposite side without using hands if possible.'
    ],
    commonMistakes: ['Slouching spine.'],
    safetyNotes: ['Stop if knee joint pinches; keep ankles flexed to protect knees.'],
    beginnerVariation: 'Support torso with hands behind hips on floor.',
    progressionTarget: 'Restores hip mobility from prolonged sitting in lectures/desk work.',
    visualGuideId: 'squat',
    isQuietForHostel: true
  },

  // ==========================================
  // 15. CALISTHENICS SKILLS
  // ==========================================
  {
    id: 'ex_skill_crow_pose',
    name: 'Crow Pose / Frog Stand (Arm Balance)',
    category: 'calisthenics-skills',
    muscleGroups: { primary: ['Wrist Flexors', 'Anterior Deltoids', 'Core Compression'], secondary: ['Triceps'] },
    equipment: ['floor'],
    modes: ['home', 'hostel'],
    difficulty: 'intermediate',
    progressionChainId: 'skill_balance_chain',
    progressionLevel: 1,
    previousExerciseId: null,
    nextExerciseId: null,
    prerequisites: ['ex_push_standard', 'ex_core_plank'],
    defaultSets: 3,
    defaultReps: 1,
    defaultDurationSeconds: 15,
    restSeconds: 60,
    tempo: 'Balance Hold',
    breathing: 'Calm, steady breathing; focus gaze 1 foot ahead on floor.',
    setupSteps: [
      'Squat down, place hands flat on floor shoulder-width apart, fingers spread wide.',
      'Place knees against the outside of triceps or in armpits.'
    ],
    movementSteps: [
      'Shift weight forward onto hands, looking slightly ahead (not straight down).',
      'Slowly lift one toe, then the other, balancing all weight on hands.',
      'Hold balance for 10-15 seconds.'
    ],
    commonMistakes: ['Looking back between legs which causes forward roll.'],
    safetyNotes: ['Place a soft pillow in front of face to remove fear of tipping forward.'],
    beginnerVariation: 'Keep one big toe touching floor for balance support.',
    progressionTarget: 'Unlocks handstand balance awareness and wrist conditioning.',
    visualGuideId: 'lsit',
    isQuietForHostel: true
  }
];

// Helper Functions
export function getExerciseById(id: string): CentralExercise | undefined {
  return CENTRAL_EXERCISE_REGISTRY.find(e => e.id === id);
}

export function getAllExercises(): CentralExercise[] {
  return [...CENTRAL_EXERCISE_REGISTRY];
}

export function getExercisesByCategory(category: ExerciseCategory): CentralExercise[] {
  return CENTRAL_EXERCISE_REGISTRY.filter(e => e.category === category);
}

export function getExercisesByMode(mode: TrainingEnvironment): CentralExercise[] {
  return CENTRAL_EXERCISE_REGISTRY.filter(e => e.modes.includes(mode));
}

export function getProgressionChain(chainId: string): CentralExercise[] {
  return CENTRAL_EXERCISE_REGISTRY
    .filter(e => e.progressionChainId === chainId)
    .sort((a, b) => (a.progressionLevel || 0) - (b.progressionLevel || 0));
}
