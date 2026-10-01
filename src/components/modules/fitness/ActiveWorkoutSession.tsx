import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
  Zap,
  Info,
  Clock,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Volume2,
  ArrowRight,
  ShieldCheck,
  Dumbbell,
  Check,
  ChevronDown,
  ChevronUp,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  GeneratedWorkout,
  WorkoutBlock,
  WorkoutBlockExercise,
  ExerciseSessionResult,
  CompletedSetData,
  PerceivedDifficulty,
  FormRating,
  CompletedWorkoutSession
} from '../../../services/fitness/fitnessTypes';
import { getExerciseById } from '../../../services/fitness/exerciseRegistry';
import { evaluateExercisePerformance, EvaluationResult } from '../../../services/fitness/progressionEngine';
import { storage } from '../../../services/storageService';
import { sounds } from '../../../services/soundEffects';
import { smartwatch } from '../../../services/smartwatchService';
import { haptics } from '../../../services/hapticFeedback';
import { ExerciseVisualGuide } from '../../common/ExerciseVisualGuide';

interface ActiveWorkoutSessionProps {
  workout: GeneratedWorkout;
  onClose: () => void;
  onFinishWorkout: (summary: CompletedWorkoutSession) => void;
}

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
  workout,
  onClose,
  onFinishWorkout
}) => {
  // Flatten exercises across all blocks for sequential tracking
  const allExercises: Array<{ blockIndex: number; block: WorkoutBlock; exercise: WorkoutBlockExercise }> = [];
  workout.blocks.forEach((block, bIdx) => {
    block.exercises.forEach(ex => {
      allExercises.push({ blockIndex: bIdx, block, exercise: ex });
    });
  });

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [completedExercisesResults, setCompletedExercisesResults] = useState<ExerciseSessionResult[]>([]);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [currentSetsData, setCurrentSetsData] = useState<CompletedSetData[]>([]);

  // Current exercise active set inputs
  const currentItem = allExercises[currentExIndex];
  const centralEx = currentItem ? getExerciseById(currentItem.exercise.exerciseId) : undefined;
  const isTimed = (currentItem?.exercise.targetDurationSeconds || 0) > 0;

  const [actualReps, setActualReps] = useState<number>(currentItem?.exercise.targetReps || 10);
  const [actualSeconds, setActualSeconds] = useState<number>(currentItem?.exercise.targetDurationSeconds || 30);

  // Timers: Workout Elapsed & Rest Timer & Exercise Hold Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(60);
  const [holdTimerActive, setHoldTimerActive] = useState(false);
  const [holdSecondsLeft, setHoldSecondsLeft] = useState(actualSeconds);

  // Post-exercise questionnaire modal
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<PerceivedDifficulty>('moderate');
  const [selectedForm, setSelectedForm] = useState<FormRating>('good');
  const [lastEvalResult, setLastEvalResult] = useState<EvaluationResult | null>(null);
  const [showEvalBanner, setShowEvalBanner] = useState(false);

  // Visual Guide Modal
  const [showVisualGuide, setShowVisualGuide] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Workout Completed Screen
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);
  const [finalWorkoutSummary, setFinalWorkoutSummary] = useState<CompletedWorkoutSession | null>(null);

  // Smartwatch State
  const [swState, setSwState] = useState(smartwatch.state);
  useEffect(() => {
    smartwatch.setStatusListener(st => {
      setSwState({ ...st });
    });
  }, []);

  // Reset inputs when exercise changes
  useEffect(() => {
    if (currentItem) {
      setActualReps(currentItem.exercise.targetReps);
      const secs = currentItem.exercise.targetDurationSeconds || 30;
      setActualSeconds(secs);
      setHoldSecondsLeft(secs);
      setHoldTimerActive(false);
      setCurrentSetNumber(1);
      setCurrentSetsData([]);
      setIsResting(false);
    }
  }, [currentExIndex]);

  // Screen Wake Lock API (keeps mobile/tablet display awake during active sets & isometric holds)
  useEffect(() => {
    let wakeLockSentinel: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // Graceful fallback if unsupported
      }
    };
    requestWakeLock();

    return () => {
      if (wakeLockSentinel && typeof wakeLockSentinel.release === 'function') {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, []);

  // Timestamp refs for background tab compensation
  const workoutStartTimeRef = useRef<number>(Date.now());
  const restEndTimeRef = useRef<number | null>(null);
  const holdEndTimeRef = useRef<number | null>(null);

  // Sync timers on tab visibility change (solves browser background throttling)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Sync overall stopwatch
        if (!isWorkoutCompleted) {
          setElapsedSeconds(Math.floor((Date.now() - workoutStartTimeRef.current) / 1000));
        }
        // Sync rest timer
        if (isResting && restEndTimeRef.current) {
          const remaining = Math.max(0, Math.round((restEndTimeRef.current - Date.now()) / 1000));
          setRestSecondsLeft(remaining);
          if (remaining <= 0) {
            setIsResting(false);
            restEndTimeRef.current = null;
            sounds.playTimerDone();
          }
        }
        // Sync hold timer
        if (holdTimerActive && holdEndTimeRef.current) {
          const remaining = Math.max(0, Math.round((holdEndTimeRef.current - Date.now()) / 1000));
          setHoldSecondsLeft(remaining);
          if (remaining <= 0) {
            setHoldTimerActive(false);
            holdEndTimeRef.current = null;
            sounds.playTimerDone();
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isWorkoutCompleted, isResting, holdTimerActive]);

  // Overall workout elapsed stopwatch
  useEffect(() => {
    if (isWorkoutCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - workoutStartTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorkoutCompleted]);

  // Rest Timer countdown
  useEffect(() => {
    if (!isResting) return;
    if (!restEndTimeRef.current) {
      restEndTimeRef.current = Date.now() + restSecondsLeft * 1000;
    }
    const interval = setInterval(() => {
      if (restEndTimeRef.current) {
        const remaining = Math.max(0, Math.round((restEndTimeRef.current - Date.now()) / 1000));
        setRestSecondsLeft(remaining);
        if (remaining <= 0) {
          setIsResting(false);
          restEndTimeRef.current = null;
          sounds.playTimerDone();
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isResting]);

  // Hold Timer countdown for timed exercises (e.g. plank)
  useEffect(() => {
    if (!holdTimerActive) return;
    if (!holdEndTimeRef.current) {
      holdEndTimeRef.current = Date.now() + holdSecondsLeft * 1000;
    }
    const interval = setInterval(() => {
      if (holdEndTimeRef.current) {
        const remaining = Math.max(0, Math.round((holdEndTimeRef.current - Date.now()) / 1000));
        setHoldSecondsLeft(remaining);
        if (remaining <= 0) {
          setHoldTimerActive(false);
          holdEndTimeRef.current = null;
          sounds.playTimerDone();
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [holdTimerActive]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Log current set
  const handleCompleteCurrentSet = () => {
    sounds.playClick();
    haptics.medium();
    const setData: CompletedSetData = {
      setNumber: currentSetNumber,
      targetReps: currentItem.exercise.targetReps,
      actualReps: isTimed ? 1 : actualReps,
      targetDurationSeconds: currentItem.exercise.targetDurationSeconds,
      actualDurationSeconds: isTimed ? actualSeconds - holdSecondsLeft : undefined,
      completed: true
    };

    const newSetsData = [...currentSetsData, setData];
    setCurrentSetsData(newSetsData);

    const totalSetsPlanned = currentItem.exercise.sets;

    if (currentSetNumber >= totalSetsPlanned) {
      // Completed all sets for this exercise -> open questionnaire!
      setShowQuestionnaire(true);
    } else {
      // Advance to next set & start rest timer
      setCurrentSetNumber(s => s + 1);
      setRestSecondsLeft(currentItem.exercise.restSeconds || 60);
      setIsResting(true);
      // Reset hold timer for next set if timed
      if (isTimed) {
        setHoldSecondsLeft(currentItem.exercise.targetDurationSeconds || 30);
        setHoldTimerActive(false);
      }
    }
  };

  // Submit Post-Exercise Questionnaire & run Progression Engine
  const handleSubmitQuestionnaire = () => {
    sounds.playQuestComplete();
    const exResult: ExerciseSessionResult = {
      exerciseId: currentItem.exercise.exerciseId,
      exerciseName: currentItem.exercise.name,
      sets: currentSetsData,
      perceivedDifficulty: selectedDifficulty,
      formRating: selectedForm
    };

    const updatedResults = [...completedExercisesResults, exResult];
    setCompletedExercisesResults(updatedResults);

    // Retrieve current progression state from storage
    const allStates = storage.getProgressionStates();
    const curState = allStates[currentItem.exercise.exerciseId] || {
      exerciseId: currentItem.exercise.exerciseId,
      currentSets: currentItem.exercise.sets,
      currentReps: currentItem.exercise.targetReps,
      currentDurationSeconds: currentItem.exercise.targetDurationSeconds,
      consecutiveCleanSessions: 0,
      consecutiveFailures: 0,
      highestCompletedReps: 0,
      highestCompletedDuration: 0,
      isUnlocked: true,
      isMastered: false
    };

    // Evaluate progression
    const evalRes = evaluateExercisePerformance(
      currentItem.exercise.exerciseId,
      currentSetsData,
      selectedDifficulty,
      selectedForm,
      curState
    );

    // Save updated state back to storage
    storage.saveSingleProgressionState(evalRes.nextState);

    // If next exercise unlocked, ensure it is saved as unlocked
    if (evalRes.unlockedNextExerciseId) {
      const nextExState = allStates[evalRes.unlockedNextExerciseId] || {
        exerciseId: evalRes.unlockedNextExerciseId,
        currentSets: 3,
        currentReps: 8,
        consecutiveCleanSessions: 0,
        consecutiveFailures: 0,
        highestCompletedReps: 0,
        isUnlocked: true,
        isMastered: false
      };
      nextExState.isUnlocked = true;
      storage.saveSingleProgressionState(nextExState);
    }

    setLastEvalResult(evalRes);
    setShowQuestionnaire(false);
    setShowEvalBanner(true);

    if (evalRes.statusChanged === 'leveled_up') {
      sounds.playLevelUp();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  // Move to Next Exercise after seeing evaluation banner
  const handleProceedToNextExercise = () => {
    sounds.playClick();
    setShowEvalBanner(false);
    setLastEvalResult(null);

    if (currentExIndex + 1 < allExercises.length) {
      setCurrentExIndex(idx => idx + 1);
    } else {
      // Workout Finished!
      finishWorkoutFlow();
    }
  };

  // Final Workout Finish flow
  const finishWorkoutFlow = () => {
    sounds.playLevelUp();
    haptics.success();
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });

    const totalMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const totalXp = completedExercisesResults.reduce((acc, r) => acc + 30, 50);

    const completedSession: CompletedWorkoutSession = {
      id: `session_${Date.now()}`,
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date(Date.now() - elapsedSeconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalDurationMinutes: totalMinutes,
      environment: workout.environment,
      exercises: completedExercisesResults,
      overallRpe: selectedDifficulty,
      totalXpEarned: totalXp,
      progressiveOverloadUnlocked: []
    };

    // Save session in storage & award XP to user profile
    storage.saveCompletedFitnessSession(completedSession);

    const prof = storage.getProfile();
    prof.currentXP += totalXp;
    prof.totalXP += totalXp;
    prof.todayXP += totalXp;
    prof.stats.strength = (prof.stats.strength || 15) + 2;
    prof.stats.stamina = (prof.stats.stamina || 12) + 2;
    prof.stats.discipline = (prof.stats.discipline || 15) + 1;
    storage.saveProfile(prof);

    setFinalWorkoutSummary(completedSession);
    setIsWorkoutCompleted(true);
  };

  // Progress percentage
  const totalSteps = allExercises.length;
  const progressPercent = Math.round(((currentExIndex) / totalSteps) * 100);

  // If completed screen
  if (isWorkoutCompleted && finalWorkoutSummary) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in">
        <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-center text-slate-100 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
            <Award className="w-10 h-10 text-emerald-400" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Workout Complete!</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{workout.name}</h2>
            <p className="text-sm text-slate-400">Pristine consistency develops unbreakable discipline.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="p-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
              <span className="text-xl font-extrabold text-cyan-400">{finalWorkoutSummary.totalDurationMinutes}m</span>
            </div>
            <div className="p-2 border-x border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Exercises</span>
              <span className="text-xl font-extrabold text-emerald-400">{allExercises.length}</span>
            </div>
            <div className="p-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">XP Gained</span>
              <span className="text-xl font-extrabold text-amber-400">+{finalWorkoutSummary.totalXpEarned}</span>
            </div>
          </div>

          <button
            onClick={() => onFinishWorkout(finalWorkoutSummary)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Claim Rewards & Return</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Visual Guide Modal if opened */}
      {showVisualGuide && centralEx && (
        <ExerciseVisualGuide exercise={centralEx} onClose={() => setShowVisualGuide(false)} />
      )}

      {/* TOP HEADER */}
      <header className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Quit workout session? Progress on completed sets is saved.')) {
                onClose();
              }
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {workout.environment.toUpperCase()} MODE
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Ex {currentExIndex + 1} of {allExercises.length}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white line-clamp-1">{workout.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Smartwatch Pulse */}
          <button
            onClick={() => {
              sounds.playClick();
              if (!swState.connected) {
                smartwatch.connect();
              } else {
                smartwatch.disconnect();
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              swState.connected
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-cyan-300'
            }`}
            title={
              swState.connected
                ? `Noise Watch: ${swState.heartRate ? swState.heartRate + ' BPM' : 'Connected'} (Tap to disconnect)`
                : 'Pair Bluetooth Smartwatch for Live Heart Rate'
            }
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                swState.connected && swState.heartRate
                  ? 'fill-rose-500 text-rose-400 animate-pulse'
                  : 'text-slate-500'
              }`}
            />
            <span className="font-mono font-bold text-[11px]">
              {swState.connected
                ? swState.heartRate
                  ? `${swState.heartRate} BPM`
                  : 'SYNCED'
                : 'PAIR WATCH'}
            </span>
          </button>

          {/* Stopwatch timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-mono text-sm font-bold text-slate-200">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
      </header>

      {/* OVERALL WORKOUT PROGRESS BAR */}
      <div className="w-full bg-slate-900 h-1.5">
        <div
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* MAIN ACTIVE EXERCISE AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-8 max-w-3xl mx-auto w-full space-y-4">
        {/* Block Badge & Title */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-semibold uppercase tracking-wider border border-slate-700">
            {currentItem?.block.title}
          </span>
          <span className="font-medium text-slate-500">
            Estimated block: ~{currentItem?.block.estimatedMinutes}m
          </span>
        </div>

        {/* Active Exercise Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                  {centralEx?.category || 'Chest'}
                </span>
                {centralEx?.isQuietForHostel && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    🤫 Quiet / Hostel Friendly
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{currentItem?.exercise.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: <span className="text-cyan-300 font-semibold">{currentItem?.exercise.sets} sets</span> ×{' '}
                <span className="text-cyan-300 font-semibold">
                  {isTimed ? `${currentItem?.exercise.targetDurationSeconds}s hold` : `${currentItem?.exercise.targetReps} reps`}
                </span>{' '}
                · Tempo: <span className="text-slate-300 font-mono">{currentItem?.exercise.tempo}</span>
              </p>
            </div>

            {/* Visual Guide button */}
            <button
              onClick={() => {
                sounds.playClick();
                setShowVisualGuide(true);
              }}
              className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Form Guide</span>
            </button>
          </div>

          {/* Safety Warnings Banner if present */}
          {centralEx?.safetyNotes && centralEx.safetyNotes.length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-300 mb-0.5">Safety Precaution:</span>
                <span>{centralEx.safetyNotes[0]}</span>
              </div>
            </div>
          )}

          {/* Coaching Cue */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span><strong className="text-cyan-300">Cue:</strong> {currentItem?.exercise.coachingCue}</span>
          </div>

          {/* Collapsible Steps & Technique */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Setup & Technique Checklist
              </span>
              {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showInstructions && centralEx && (
              <div className="p-4 pt-1 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                <div>
                  <span className="font-semibold text-slate-300 block mb-1">Setup:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {centralEx.setupSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-slate-300 block mb-1">Movement Execution:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {centralEx.movementSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* SETS PROGRESSION TRACKER */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">
                Set {currentSetNumber} of {currentItem?.exercise.sets}
              </span>
              <span className="text-xs text-slate-500">
                Completed: {currentSetsData.length}/{currentItem?.exercise.sets}
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {Array.from({ length: currentItem?.exercise.sets || 3 }).map((_, idx) => {
                const sNum = idx + 1;
                const isDone = sNum < currentSetNumber;
                const isCurrent = sNum === currentSetNumber;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-center border transition-all ${
                      isDone
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : isCurrent
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/40 border-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block">Set {sNum}</span>
                    <span className="text-xs font-extrabold">
                      {isDone ? (
                        <Check className="w-4 h-4 mx-auto text-emerald-400" />
                      ) : (
                        `${isTimed ? `${currentItem?.exercise.targetDurationSeconds}s` : `${currentItem?.exercise.targetReps}r`}`
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE SET INTERACTION */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-cyan-500/20 space-y-4">
            {isTimed ? (
              // TIMED HOLD INTERACTION (e.g. Plank)
              <div className="space-y-4 text-center">
                <div className="text-3xl sm:text-4xl font-mono font-extrabold text-cyan-400">
                  {holdSecondsLeft}s
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setHoldTimerActive(!holdTimerActive);
                    }}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                      holdTimerActive
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                    }`}
                  >
                    {holdTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{holdTimerActive ? 'Pause Hold' : 'Start Hold Timer'}</span>
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setHoldTimerActive(false);
                      setHoldSecondsLeft(actualSeconds);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // REPETITION COUNTER INTERACTION
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 block">Actual Reps Completed</span>
                  <span className="text-xs text-slate-500">Target was {currentItem?.exercise.targetReps} reps</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActualReps(r => Math.max(1, r - 1));
                    }}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                    aria-label="Decrease reps"
                  >
                    -
                  </button>
                  <span className="font-mono text-2xl font-black text-cyan-300 w-12 text-center">{actualReps}</span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActualReps(r => r + 1);
                    }}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                    aria-label="Increase reps"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* COMPLETE SET BUTTON */}
            <button
              onClick={handleCompleteCurrentSet}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {currentSetNumber >= (currentItem?.exercise.sets || 3)
                  ? 'Complete Final Set & Rate Exercise'
                  : `Complete Set ${currentSetNumber} & Rest`}
              </span>
            </button>
          </div>
        </div>

        {/* REST TIMER CARD (Displays between sets) */}
        {isResting && (
          <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Recovery Rest Interval</span>
              </div>
              <span className="font-mono text-xl font-black text-amber-300">{restSecondsLeft}s</span>
            </div>

            <p className="text-xs text-slate-400">
              Coaching Tip: Take deep diaphragmatic breaths through your nose. Shake out tension in forearms and shoulders.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  sounds.playClick();
                  setRestSecondsLeft(s => s + 15);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                +15s
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setRestSecondsLeft(s => Math.max(0, s - 15));
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                -15s
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsResting(false);
                }}
                className="ml-auto px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Skip Rest & Start Next Set
              </button>
            </div>
          </div>
        )}
      </main>

      {/* POST-EXERCISE EVALUATION MODAL (RPE & Form Questionnaire) */}
      {showQuestionnaire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-slate-100 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Progression Check</span>
              <h3 className="text-xl font-black text-white">{currentItem?.exercise.name} Performance</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your answers inform the progression engine so it adjusts reps safely without causing burnout.
              </p>
            </div>

            {/* Question 1: Perceived Difficulty (RPE) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">How hard did this exercise feel?</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'easy', label: 'Easy (RPE 4-5)', desc: 'Smooth, 3+ reps left' },
                  { id: 'moderate', label: 'Moderate (RPE 6-7)', desc: 'Clean, challenging' },
                  { id: 'hard', label: 'Hard (RPE 8)', desc: 'Tough, 1 rep left' },
                  { id: 'very_hard', label: 'Limit (RPE 9-10)', desc: 'Max effort to finish' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedDifficulty(opt.id as PerceivedDifficulty);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedDifficulty === opt.id
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block text-white">{opt.label}</span>
                    <span className="text-[10px] text-slate-400">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Form Quality */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">How was your technique & form?</label>
              <div className="space-y-2">
                {[
                  { id: 'good', label: 'Pristine Form', desc: 'Full range of motion, stable core, no arching' },
                  { id: 'minor_mistakes', label: 'Minor Mistakes', desc: 'Tempo sped up or slight tremor on final reps' },
                  { id: 'poor', label: 'Form Breakdown', desc: 'Cheated reps, back arched, or felt joint discomfort' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedForm(opt.id as FormRating);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      selectedForm === opt.id
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block text-white">{opt.label}</span>
                      <span className="text-[10px] text-slate-400">{opt.desc}</span>
                    </div>
                    {selectedForm === opt.id && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmitQuestionnaire}
              className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Analyze & Save Progression
            </button>
          </div>
        </div>
      )}

      {/* EVALUATION FEEDBACK BANNER MODAL */}
      {showEvalBanner && lastEvalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in zoom-in-95">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-slate-100 space-y-4 text-center">
            <div
              className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
                lastEvalResult.statusChanged === 'leveled_up'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : lastEvalResult.statusChanged === 'reps_increased'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              }`}
            >
              {lastEvalResult.statusChanged === 'leveled_up' ? (
                <Sparkles className="w-7 h-7" />
              ) : lastEvalResult.statusChanged === 'reps_increased' ? (
                <TrendingUp className="w-7 h-7" />
              ) : (
                <ShieldCheck className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Progression Engine Feedback</span>
              <p className="text-sm text-slate-200 font-medium px-2">{lastEvalResult.progressionMessage}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-around text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Next Target</span>
                <span className="font-extrabold text-cyan-300">
                  {lastEvalResult.nextState.currentSets} sets × {lastEvalResult.nextState.currentReps} reps
                </span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-[10px] text-slate-500 block uppercase">XP Rewarded</span>
                <span className="font-extrabold text-amber-400">+{lastEvalResult.xpAwarded} XP</span>
              </div>
            </div>

            <button
              onClick={handleProceedToNextExercise}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              {currentExIndex + 1 < allExercises.length ? 'Continue to Next Exercise' : 'Finish Workout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
