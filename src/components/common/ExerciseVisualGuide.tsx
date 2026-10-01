import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  AlertOctagon,
  Wind,
  Sparkles,
  Shield,
  Dumbbell,
  Building2,
  Home,
  Play,
  Pause,
  RotateCcw,
  Target,
  Flame,
  Zap,
  Check,
  Lightbulb,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Exercise } from '../../types';
import { CentralExercise } from '../../services/fitness/fitnessTypes';
import { sounds } from '../../services/soundEffects';

interface ExerciseVisualGuideProps {
  exercise: Exercise | CentralExercise | null;
  onClose: () => void;
}

export const ExerciseVisualGuide: React.FC<ExerciseVisualGuideProps> = ({ exercise, onClose }) => {
  if (!exercise) return null;

  const isCentral = 'setupSteps' in exercise;
  const guide = isCentral
    ? {
        summary: (exercise as CentralExercise).progressionTarget,
        setup: (exercise as CentralExercise).setupSteps,
        execution: (exercise as CentralExercise).movementSteps,
        commonMistakes: (exercise as CentralExercise).commonMistakes,
        breathing: (exercise as CentralExercise).breathing,
        illustrationType: (exercise as CentralExercise).visualGuideId,
        primaryMuscles: (exercise as CentralExercise).muscleGroups.primary,
        beginnerTip: (exercise as CentralExercise).beginnerVariation,
        progressionTip: (exercise as CentralExercise).progressionTarget
      }
    : (exercise as Exercise).formGuide;

  const env = isCentral
    ? (exercise as CentralExercise).modes.length > 1
      ? 'both'
      : (exercise as CentralExercise).modes[0]
    : ((exercise as Exercise).environment || 'both');

  const muscleLabel = isCentral
    ? (exercise as CentralExercise).muscleGroups.primary.join(', ')
    : (exercise as Exercise).muscleGroup;

  // ===============================
  // LIVE TEMPO METRONOME DEMONSTRATION
  // ===============================
  // Phases: 1s Lift/Push -> 1s Peak Squeeze -> 3s Lowering
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [tempoPhase, setTempoPhase] = useState<'lift' | 'squeeze' | 'lower'>('lift');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState<number>(1);
  const [demoRep, setDemoRep] = useState<number>(1);

  useEffect(() => {
    if (!isMetronomeActive) {
      setTempoPhase('lift');
      setPhaseTimeLeft(1);
      return;
    }

    const timer = setInterval(() => {
      setPhaseTimeLeft(prev => {
        if (prev <= 1) {
          // Transition to next phase
          if (tempoPhase === 'lift') {
            setTempoPhase('squeeze');
            return 1; // 1 second peak hold
          } else if (tempoPhase === 'squeeze') {
            setTempoPhase('lower');
            return 3; // 3 seconds controlled lowering
          } else {
            setTempoPhase('lift');
            setDemoRep(r => r + 1);
            return 1; // 1 second lift
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMetronomeActive, tempoPhase]);

  // ===============================
  // 18 ANATOMICALLY ACCURATE SVG VISUAL ILLUSTRATIONS
  // ===============================
  const renderVisualIllustration = () => {
    const type = guide?.illustrationType || 'pushup';

    switch (type) {
      // 1. LATERAL RAISES
      case 'lateral_raise':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <line x1="150" y1="20" x2="150" y2="180" stroke="#1e293b" strokeDasharray="3 3" />
            {/* Body */}
            <circle cx="150" cy="50" r="14" fill="#38bdf8" />
            <line x1="150" y1="64" x2="150" y2="135" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            <line x1="150" y1="135" x2="135" y2="185" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            <line x1="150" y1="135" x2="165" y2="185" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Motion Arc Lines */}
            <path d="M 130 110 Q 95 100 80 80" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 170 110 Q 205 100 220 80" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 4" />
            {/* Arms raised to parallel */}
            <line x1="150" y1="75" x2="80" y2="80" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
            <line x1="150" y1="75" x2="220" y2="80" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
            {/* Dumbbells */}
            <rect x="70" y="74" width="10" height="12" rx="2" fill="#06b6d4" />
            <rect x="220" y="74" width="10" height="12" rx="2" fill="#06b6d4" />
            {/* Glowing Deltoid indicators */}
            <circle cx="140" cy="74" r="7" fill="#f97316" opacity="0.8" />
            <circle cx="160" cy="74" r="7" fill="#f97316" opacity="0.8" />
            {/* Annotations */}
            <text x="150" y="25" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">
              ✓ Parallel to Floor (Shoulder Height)
            </text>
            <text x="150" y="195" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Soft elbow bend · 2s peak squeeze · 3s slow drop
            </text>
          </svg>
        );

      // 2. OVERHEAD SHOULDER PRESS & PIKE PUSHUP
      case 'shoulder_press':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            {/* Vertical Press Guidelines */}
            <line x1="110" y1="20" x2="110" y2="80" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="190" y1="20" x2="190" y2="80" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Head & Torso */}
            <circle cx="150" cy="70" r="14" fill="#38bdf8" />
            <line x1="150" y1="84" x2="150" y2="145" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            <line x1="150" y1="145" x2="135" y2="185" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            <line x1="150" y1="145" x2="165" y2="185" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Arms overhead */}
            <line x1="150" y1="88" x2="110" y2="35" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
            <line x1="150" y1="88" x2="190" y2="35" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
            {/* Dumbbells */}
            <rect x="100" y="25" width="20" height="10" rx="2" fill="#06b6d4" />
            <rect x="180" y="25" width="20" height="10" rx="2" fill="#06b6d4" />
            {/* Glowing Shoulders */}
            <circle cx="138" cy="88" r="7" fill="#f97316" opacity="0.85" />
            <circle cx="162" cy="88" r="7" fill="#f97316" opacity="0.85" />
            <text x="150" y="18" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
              ✓ Press Straight Overhead (Biceps by Ears)
            </text>
            <text x="150" y="195" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Ribs tucked down · Do not arch lower back backward
            </text>
          </svg>
        );

      // 3. PUSHUPS & DIAMOND PUSHUPS
      case 'pushup':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            {/* Floor line */}
            <line x1="20" y1="160" x2="280" y2="160" stroke="#334155" strokeWidth="2" />
            {/* Straight Ruler Body Plank Line */}
            <line x1="70" y1="155" x2="240" y2="105" stroke="#10b981" strokeWidth="3" strokeDasharray="3 3" />
            {/* Feet, Legs, Torso, Head */}
            <circle cx="70" cy="155" r="4" fill="#64748b" />
            <line x1="70" y1="155" x2="160" y2="130" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            <line x1="160" y1="130" x2="225" y2="110" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
            <circle cx="240" cy="105" r="12" fill="#38bdf8" />
            {/* Arm at 45 degree angle */}
            <line x1="200" y1="118" x2="200" y2="160" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            {/* Hand on floor */}
            <rect x="195" y="157" width="12" height="4" rx="1" fill="#06b6d4" />
            {/* Cues */}
            <text x="150" y="35" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">
              ✓ Straight Line: Head to Heels (No Sagging Hips)
            </text>
            <text x="150" y="55" textAnchor="middle" fill="#f97316" fontSize="11">
              Elbows at 45° angle (Arrow shape, not a T)
            </text>
            <text x="150" y="185" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Lower until chest is 2 inches off floor · Push floor away
            </text>
          </svg>
        );

      // 4. SQUATS & GOBLET SQUATS
      case 'squat':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <line x1="30" y1="180" x2="270" y2="180" stroke="#334155" strokeWidth="2" />
            {/* Parallel depth indicator line */}
            <line x1="60" y1="135" x2="240" y2="135" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="210" y="130" fill="#06b6d4" fontSize="9" fontWeight="bold">Parallel Crease</text>
            {/* Squat Pose */}
            <circle cx="120" cy="65" r="12" fill="#38bdf8" />
            <line x1="120" y1="77" x2="110" y2="125" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            <line x1="110" y1="125" x2="165" y2="135" stroke="#f97316" strokeWidth="7" strokeLinecap="round" />
            <line x1="165" y1="135" x2="155" y2="180" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            <line x1="145" y1="180" x2="165" y2="180" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            {/* Dumbbell held at chest */}
            <rect x="125" y="85" width="12" height="18" rx="3" fill="#06b6d4" />
            <text x="150" y="30" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="bold">
              ✓ Keep Chest Proud & Upright
            </text>
            <text x="150" y="48" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Weight through heels · Knees track in line with toes
            </text>
          </svg>
        );

      // 5. BICEP & HAMMER CURLS
      case 'curl':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            {/* Body */}
            <circle cx="130" cy="55" r="13" fill="#38bdf8" />
            <line x1="130" y1="68" x2="130" y2="135" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            <line x1="130" y1="135" x2="120" y2="185" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            <line x1="130" y1="135" x2="140" y2="185" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Pinned Elbow Indicator */}
            <circle cx="135" cy="100" r="5" fill="#06b6d4" />
            <text x="145" y="103" fill="#06b6d4" fontSize="9" fontWeight="bold">Elbow Pinned</text>
            {/* Curled Forearm */}
            <line x1="135" y1="100" x2="165" y2="75" stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
            <rect x="160" y="65" width="12" height="15" rx="3" fill="#06b6d4" />
            {/* Glowing Bicep */}
            <circle cx="145" cy="85" r="7" fill="#f97316" opacity="0.9" />
            {/* Motion Arc */}
            <path d="M 135 125 Q 165 115 165 75" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" />
            <text x="150" y="25" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">
              ✓ Elbows Glued to Ribcage (No Swinging)
            </text>
            <text x="150" y="195" textAnchor="middle" fill="#94a3b8" fontSize="10">
              1s Explosive curl up · 1s squeeze peak · 3s slow lowering
            </text>
          </svg>
        );

      // 6. BENT-OVER ROWS & DOORFRAME ROWS
      case 'row':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            {/* Flat Tabletop Hinge Line */}
            <line x1="90" y1="95" x2="200" y2="95" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
            {/* Person Hinged at 45 deg */}
            <circle cx="85" cy="90" r="12" fill="#38bdf8" />
            <line x1="95" y1="95" x2="160" y2="105" stroke="#f97316" strokeWidth="7" strokeLinecap="round" />
            <line x1="160" y1="105" x2="175" y2="175" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Elbow Driven High to Pockets */}
            <line x1="120" y1="98" x2="135" y2="70" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            <rect x="130" y="65" width="10" height="15" rx="2" fill="#06b6d4" />
            {/* Glowing Lats */}
            <circle cx="130" cy="98" r="8" fill="#f97316" opacity="0.9" />
            <text x="150" y="30" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
              ✓ 45° Flat Spine Hinge (Never Round Lower Back)
            </text>
            <text x="150" y="48" textAnchor="middle" fill="#f97316" fontSize="10">
              Drive elbows back toward pockets · Pinch shoulder blades
            </text>
          </svg>
        );

      // 7. TRICEP DIPS (BED / CHAIR / BARS)
      case 'dip':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            {/* Chair / Bench Surface */}
            <rect x="70" y="110" width="40" height="70" fill="#1e293b" stroke="#334155" strokeWidth="2" rx="4" />
            <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" />
            {/* Person Dipping */}
            <circle cx="135" cy="70" r="12" fill="#38bdf8" />
            <line x1="135" y1="82" x2="135" y2="135" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            <line x1="135" y1="135" x2="190" y2="178" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Arm at 90 deg */}
            <line x1="130" y1="88" x2="100" y2="108" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
            <line x1="100" y1="108" x2="100" y2="110" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" />
            {/* Glowing Triceps */}
            <circle cx="115" cy="98" r="7" fill="#f97316" opacity="0.9" />
            {/* 90 deg Indicator */}
            <rect x="95" y="103" width="8" height="8" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
            <text x="150" y="30" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">
              ✓ 90° Parallel Depth (Do Not Dip Lower)
            </text>
            <text x="150" y="48" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Keep back close to chair edge · Lock out triceps at top
            </text>
          </svg>
        );

      // 8. GLUTE BRIDGES
      case 'glute_bridge':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <line x1="30" y1="170" x2="270" y2="170" stroke="#334155" strokeWidth="2" />
            {/* Straight Diagonal Bridge Line */}
            <line x1="75" y1="165" x2="215" y2="115" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
            {/* Shoulders on floor, hips elevated */}
            <circle cx="70" cy="160" r="10" fill="#38bdf8" />
            <line x1="75" y1="165" x2="150" y2="135" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            <line x1="150" y1="135" x2="215" y2="115" stroke="#f97316" strokeWidth="7" strokeLinecap="round" />
            <line x1="215" y1="115" x2="215" y2="170" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Glowing Glutes */}
            <circle cx="155" cy="135" r="9" fill="#f97316" opacity="0.9" />
            <text x="150" y="35" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
              ✓ Drive Through Heels (Knees, Hips & Shoulders in Line)
            </text>
            <text x="150" y="55" textAnchor="middle" fill="#94a3b8" fontSize="10">
              2-second hard glute squeeze at top · Avoid over-arching lower back
            </text>
          </svg>
        );

      // 9. STRICT PULL-UPS
      case 'pullup':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            {/* Pull-Up Bar */}
            <line x1="50" y1="38" x2="250" y2="38" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            <line x1="50" y1="20" x2="50" y2="60" stroke="#475569" strokeWidth="4" />
            <line x1="250" y1="20" x2="250" y2="60" stroke="#475569" strokeWidth="4" />
            {/* Chin Over Bar Indicator */}
            <line x1="110" y1="34" x2="190" y2="34" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
            {/* Hanging Figure */}
            <circle cx="150" cy="24" r="12" fill="#38bdf8" />
            {/* Broad V-Taper Lats */}
            <polygon points="120,50 180,50 155,100 145,100" fill="#f97316" opacity="0.85" />
            <line x1="150" y1="36" x2="150" y2="105" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            <line x1="150" y1="105" x2="145" y2="175" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            <line x1="150" y1="105" x2="155" y2="175" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Arms Gripping Bar */}
            <line x1="135" y1="50" x2="120" y2="38" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" />
            <line x1="165" y1="50" x2="180" y2="38" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" />
            <text x="150" y="15" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
              ✓ Clear Chin Over Bar (No Kipping)
            </text>
            <text x="150" y="195" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Drive elbows to floor · Lower under control to dead-hang
            </text>
          </svg>
        );

      // 10. HOLLOW BODY HOLD
      case 'core_hollow':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <line x1="20" y1="165" x2="280" y2="165" stroke="#334155" strokeWidth="2" />
            {/* Ground Contact Indicator: Lower Back Glued */}
            <rect x="110" y="161" width="50" height="4" fill="#10b981" rx="2" />
            <text x="135" y="182" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">
              Lower Back Glued Flat
            </text>
            {/* Shallow Banana Shape Body */}
            <circle cx="80" cy="140" r="10" fill="#38bdf8" />
            {/* Arms extended overhead */}
            <line x1="80" y1="145" x2="50" y2="135" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            {/* Torso curve */}
            <path d="M 88 148 Q 135 163 190 148" fill="none" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            {/* Legs Hovered */}
            <line x1="190" y1="148" x2="245" y2="140" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Glowing 6-Pack Core */}
            <circle cx="135" cy="155" r="9" fill="#a855f7" opacity="0.9" />
            <text x="150" y="35" textAnchor="middle" fill="#a855f7" fontSize="12" fontWeight="bold">
              ✓ Shallow Banana Shape · Abs Braced for Impact
            </text>
            <text x="150" y="55" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Beginner: Bend one knee to chest to keep lower back pressed down
            </text>
          </svg>
        );

      // 11. LYING LEG RAISES
      case 'core_leg_raise':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <line x1="30" y1="170" x2="270" y2="170" stroke="#334155" strokeWidth="2" />
            {/* Person on back, hands under glutes */}
            <circle cx="75" cy="162" r="10" fill="#38bdf8" />
            <line x1="85" y1="165" x2="160" y2="165" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            {/* Legs raised to 90 degrees */}
            <line x1="160" y1="165" x2="160" y2="75" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            {/* 3s Descent Path Arc */}
            <path d="M 160 85 Q 230 110 240 160" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="3 3" />
            {/* Glowing Lower Abs */}
            <circle cx="150" cy="160" r="8" fill="#a855f7" opacity="0.9" />
            <text x="150" y="30" textAnchor="middle" fill="#a855f7" fontSize="11" fontWeight="bold">
              ✓ Control Lowering Over 3 Full Seconds
            </text>
            <text x="150" y="48" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Stop 2 inches above floor · Never let heels slam down
            </text>
          </svg>
        );

      // 12. BICYCLE CRUNCHES
      case 'core_bicycle':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <line x1="30" y1="170" x2="270" y2="170" stroke="#334155" strokeWidth="2" />
            {/* Torso rotated */}
            <circle cx="95" cy="135" r="10" fill="#38bdf8" />
            <line x1="95" y1="145" x2="145" y2="160" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            {/* Right Elbow touches Left Knee */}
            <line x1="100" y1="140" x2="135" y2="125" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
            <line x1="145" y1="160" x2="135" y2="125" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" />
            {/* Impact burst indicator */}
            <circle cx="135" cy="125" r="5" fill="#f97316" />
            {/* Extended Right Leg */}
            <line x1="145" y1="160" x2="225" y2="155" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Glowing Obliques */}
            <circle cx="120" cy="150" r="8" fill="#a855f7" opacity="0.9" />
            <text x="150" y="30" textAnchor="middle" fill="#a855f7" fontSize="11" fontWeight="bold">
              ✓ Rotate Ribcage to Knee (Not Just Elbows)
            </text>
            <text x="150" y="48" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Do not pull on neck · 1-second pause on each side
            </text>
          </svg>
        );

      // 13. RUSSIAN TWISTS
      case 'core_twist':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <line x1="30" y1="175" x2="270" y2="175" stroke="#334155" strokeWidth="2" />
            {/* 45 degree V-Sit */}
            <circle cx="115" cy="95" r="11" fill="#38bdf8" />
            <line x1="115" y1="106" x2="145" y2="165" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            {/* Knees bent, feet hovering */}
            <line x1="145" y1="165" x2="190" y2="135" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            <line x1="190" y1="135" x2="215" y2="155" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Rotational Arms touching floor */}
            <line x1="125" y1="120" x2="95" y2="155" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
            {/* Rotational arrows */}
            <path d="M 110 135 Q 135 110 160 135" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" />
            <text x="150" y="30" textAnchor="middle" fill="#a855f7" fontSize="11" fontWeight="bold">
              ✓ 45° Torso V-Angle · Twist from Waist
            </text>
            <text x="150" y="48" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Beginners: Keep heels lightly resting on floor for stability
            </text>
          </svg>
        );

      // 14. MOUNTAIN CLIMBERS
      case 'core_climber':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <line x1="20" y1="170" x2="280" y2="170" stroke="#334155" strokeWidth="2" />
            {/* Flat Plank Spine Guide */}
            <line x1="75" y1="160" x2="225" y2="110" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
            {/* Hands under shoulders */}
            <circle cx="225" cy="100" r="10" fill="#38bdf8" />
            <line x1="210" y1="110" x2="210" y2="170" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            {/* Body */}
            <line x1="140" y1="130" x2="210" y2="110" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            {/* Straight Back Leg */}
            <line x1="75" y1="165" x2="140" y2="130" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Driven Forward Knee */}
            <line x1="140" y1="130" x2="165" y2="145" stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
            {/* Glowing Core */}
            <circle cx="160" cy="125" r="8" fill="#a855f7" opacity="0.9" />
            <text x="150" y="30" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
              ✓ Keep Hips Down & Level with Shoulders
            </text>
            <text x="150" y="48" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Drive knees forward smoothly · Don't bounce hips up in the air
            </text>
          </svg>
        );

      // 15. BULGARIAN SPLIT SQUATS & LUNGES
      case 'lunge':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" />
            {/* Rear Bench / Bed */}
            <rect x="50" y="130" width="35" height="50" fill="#1e293b" stroke="#334155" strokeWidth="2" rx="3" />
            {/* Rear Foot on Bench */}
            <line x1="70" y1="130" x2="110" y2="145" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
            <line x1="110" y1="145" x2="130" y2="120" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Upright Torso */}
            <circle cx="135" cy="65" r="11" fill="#38bdf8" />
            <line x1="135" y1="76" x2="135" y2="125" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            {/* Front Leg at 90 deg */}
            <line x1="135" y1="125" x2="185" y2="130" stroke="#f97316" strokeWidth="7" strokeLinecap="round" />
            <line x1="185" y1="130" x2="185" y2="180" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            {/* Glowing Quad */}
            <circle cx="160" cy="128" r="8" fill="#f97316" opacity="0.9" />
            <text x="150" y="30" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="bold">
              ✓ Front Knee at 90° (Tracking Over Midfoot)
            </text>
            <text x="150" y="48" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Keep torso upright · Lower hips straight down like an elevator
            </text>
          </svg>
        );

      // 16. L-SIT / CHAIR TUCK HOLD
      case 'lsit':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <line x1="20" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" />
            {/* Support Chair Block */}
            <rect x="80" y="110" width="30" height="70" fill="#1e293b" stroke="#334155" strokeWidth="2" rx="3" />
            {/* Hands pushing down */}
            <line x1="95" y1="108" x2="95" y2="85" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" />
            {/* Upright Torso hovering */}
            <circle cx="120" cy="55" r="11" fill="#38bdf8" />
            <line x1="120" y1="66" x2="120" y2="115" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            {/* Legs Horizontal in L-shape */}
            <line x1="120" y1="115" x2="210" y2="115" stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
            {/* 90 deg L-Shape Indicator */}
            <rect x="122" y="103" width="10" height="10" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
            {/* Glowing Core & Triceps */}
            <circle cx="125" cy="110" r="7" fill="#a855f7" opacity="0.9" />
            <text x="150" y="25" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">
              ✓ Depress Shoulders · Push Down Forcefully
            </text>
            <text x="150" y="195" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Hold legs horizontal · Beginners: Tuck knees to chest
            </text>
          </svg>
        );

      // 17. FOREARM PLANK
      case 'plank':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <line x1="20" y1="160" x2="280" y2="160" stroke="#334155" strokeWidth="2" />
            {/* Straight spine line */}
            <line x1="60" y1="135" x2="245" y2="120" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
            {/* Body */}
            <circle cx="245" cy="115" r="11" fill="#38bdf8" />
            <line x1="65" y1="150" x2="145" y2="135" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <line x1="145" y1="135" x2="225" y2="125" stroke="#a855f7" strokeWidth="8" strokeLinecap="round" />
            {/* Forearm on ground */}
            <line x1="210" y1="128" x2="210" y2="160" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            <line x1="210" y1="160" x2="235" y2="160" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            <text x="150" y="45" textAnchor="middle" fill="#a855f7" fontSize="12" fontWeight="bold">
              ✓ Squeeze Glutes & Pull Navel Toward Spine
            </text>
            <text x="150" y="65" textAnchor="middle" fill="#94a3b8" fontSize="10">
              100% Silent hostel-friendly exercise · Elbows directly under shoulders
            </text>
          </svg>
        );

      // 18. HOSTEL WALL SIT
      case 'wall_sit':
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <line x1="90" y1="20" x2="90" y2="175" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <line x1="87" y1="175" x2="280" y2="175" stroke="#334155" strokeWidth="3" />
            {/* Body pressed against wall */}
            <circle cx="108" cy="55" r="11" fill="#38bdf8" />
            <line x1="95" y1="68" x2="95" y2="120" stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />
            <line x1="95" y1="120" x2="155" y2="120" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
            <line x1="155" y1="120" x2="155" y2="175" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            {/* 90 deg box */}
            <rect x="145" y="125" width="10" height="10" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
            <text x="175" y="115" fill="#06b6d4" fontSize="10" fontWeight="bold">90° Angle</text>
            <text x="180" y="45" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="bold">
              ✓ Flat Back Against Wall
            </text>
            <text x="180" y="65" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Zero noise · High quad burn · Hands off knees
            </text>
          </svg>
        );

      // DEFAULT FALLBACK
      default:
        return (
          <svg viewBox="0 0 300 200" className="w-full h-48 select-none">
            <rect width="300" height="200" fill="#090d16" rx="12" />
            <circle cx="150" cy="50" r="14" fill="#38bdf8" />
            <line x1="150" y1="64" x2="150" y2="130" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            <line x1="150" y1="130" x2="130" y2="175" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            <line x1="150" y1="130" x2="170" y2="175" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            <line x1="150" y1="75" x2="120" y2="105" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
            <line x1="150" y1="75" x2="180" y2="105" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
            <text x="150" y="30" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">
              Controlled Muscle-Mind Connection
            </text>
            <text x="150" y="190" textAnchor="middle" fill="#94a3b8" fontSize="10">
              1-Sec Peak Squeeze · 3-Sec Negative Descent
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-5 sm:p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center flex-wrap gap-1.5 mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {muscleLabel} · {exercise.difficulty}
              </span>

              {/* Environment Indicator */}
              {env === 'home' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 bg-amber-950 text-amber-300 border border-amber-500/30">
                  <Home className="w-3 h-3" /> Home (Dumbbells)
                </span>
              )}
              {env === 'hostel' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  <Building2 className="w-3 h-3" /> Hostel (Zero Equipment / Quiet)
                </span>
              )}
              {env === 'both' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 bg-purple-950 text-purple-300 border border-purple-500/30">
                  🏠 & 🏢 Home + Hostel
                </span>
              )}
            </div>

            <h3 className="text-xl font-extrabold text-white">{exercise.name}</h3>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Pose & Motion Diagram */}
        <div className="mb-3 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
          {renderVisualIllustration()}
        </div>

        {/* ===============================
            INTERACTIVE TEMPO METRONOME FOR BEGINNERS
            =============================== */}
        <div className="p-3 mb-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Live Rep Cadence Guide
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsMetronomeActive(!isMetronomeActive);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                isMetronomeActive
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              {isMetronomeActive ? (
                <>
                  <Pause className="w-3 h-3" /> Pause Cadence
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" /> ▶ Practice Cadence
                </>
              )}
            </button>
          </div>

          {/* Dynamic Cadence Bar */}
          {isMetronomeActive ? (
            <div className="space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-black">
                <span
                  className={
                    tempoPhase === 'lift'
                      ? 'text-orange-400'
                      : tempoPhase === 'squeeze'
                      ? 'text-purple-400'
                      : 'text-emerald-400'
                  }
                >
                  {tempoPhase === 'lift' && `🚀 1. LIFT / PUSH (${phaseTimeLeft}s) — Exhale!`}
                  {tempoPhase === 'squeeze' && `⚡ 2. PEAK SQUEEZE (${phaseTimeLeft}s) — Squeeze Tight!`}
                  {tempoPhase === 'lower' && `🛡️ 3. LOWERING (${phaseTimeLeft}s) — Inhale & Resist!`}
                </span>
                <span className="text-[10px] text-slate-400">Demo Rep #{demoRep}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    tempoPhase === 'lift'
                      ? 'w-1/3 bg-orange-400'
                      : tempoPhase === 'squeeze'
                      ? 'w-2/3 bg-purple-400'
                      : 'w-full bg-emerald-400'
                  }`}
                />
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-400">
              💡 Tap <strong>Practice Cadence</strong> to see the exact 1-1-3 rhythm (1s push, 1s peak squeeze, 3s controlled lowering).
            </p>
          )}
        </div>

        {/* Target Muscles Badge List */}
        {guide?.primaryMuscles && guide.primaryMuscles.length > 0 && (
          <div className="p-2.5 mb-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center flex-wrap gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
              <Target className="w-3 h-3 text-orange-400" /> Target Muscles:
            </span>
            {guide.primaryMuscles.map((muscle, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-900 text-orange-300 border border-orange-500/20"
              >
                {muscle}
              </span>
            ))}
          </div>
        )}

        {/* Form Guide Details */}
        <div className="space-y-3 text-xs">
          {/* Summary / Core Philosophy */}
          {guide?.summary && (
            <p className="text-slate-300 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px]">
              "{guide.summary}"
            </p>
          )}

          {/* 💡 BEGINNER PRO TIP & EASIER VARIATION */}
          {guide?.beginnerTip && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-black text-amber-300 uppercase tracking-wide text-[10px]">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Beginner Pro Tip & Easier Variation
              </div>
              <p className="leading-relaxed text-amber-200/90">{guide.beginnerTip}</p>
            </div>
          )}

          {/* Setup & Execution Step-by-Step */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Setup */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-cyan-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5" /> 1. Stance & Setup
              </h4>
              <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                {guide?.setup ? (
                  guide.setup.map((s, idx) => <li key={idx}>{s}</li>)
                ) : (
                  <>
                    <li>Stand tall, feet shoulder-width apart</li>
                    <li>Brace your core muscles tight</li>
                    <li>Keep neck neutral, eyes looking forward</li>
                  </>
                )}
              </ul>
            </div>

            {/* Execution */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-orange-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> 2. Movement & Tempo
              </h4>
              <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                {guide?.execution ? (
                  guide.execution.map((ex, idx) => <li key={idx}>{ex}</li>)
                ) : (
                  <>
                    <li>1 second explosive lift/push</li>
                    <li>1 second hard squeeze at top</li>
                    <li>3 full seconds controlled lowering</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Breathing Technique */}
          <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20 flex items-center gap-2.5 text-[11px] text-cyan-300">
            <Wind className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Breathing Rule: </span>
              {guide?.breathing || 'Exhale forcefully as you lift/push against gravity; Inhale deeply as you lower.'}
            </div>
          </div>

          {/* Common Mistakes To Avoid */}
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-1.5">
            <h4 className="font-bold text-red-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <AlertOctagon className="w-3.5 h-3.5" /> ⚠️ Common Mistakes to Avoid
            </h4>
            <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
              {guide?.commonMistakes ? (
                guide.commonMistakes.map((m, idx) => <li key={idx}>{m}</li>)
              ) : (
                <>
                  <li>Swinging weights or using torso momentum</li>
                  <li>Shrugging shoulders into the neck</li>
                  <li>Rushing reps without feeling the target muscle</li>
                </>
              )}
            </ul>
          </div>

          {/* 📈 Progression Tip */}
          {guide?.progressionTip && (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-emerald-300">Next Progression Goal:</strong> {guide.progressionTip}
              </span>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md transition-colors"
          >
            GOT IT — READY TO TRAIN
          </button>
        </div>
      </div>
    </div>
  );
};
