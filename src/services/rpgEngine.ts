import { UserProfile, StatType, Achievement, XPTransaction } from '../types';

export const LEVEL_TITLES = [
  'Awakened Initiate',
  'Novice Striver',
  'Iron Disciple',
  'Focused Seeker',
  'Mind Adept',
  'Resilient Walker',
  'Steadfast Achiever',
  'Sovereign Trainee',
  'Ascendant Scholar',
  'Master of Habit'
];

/**
 * Total XP required to advance from (level) to (level + 1)
 */
export function getRequiredXPForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.35));
}

/**
 * Infinite scaling for skills: Level 1 requires 100 XP, scaling smoothly without upper cap.
 */
export function getRequiredSkillXP(level: number): number {
  return Math.round(100 * Math.pow(Math.max(1, level), 1.25));
}

export function getRankTier(level: number): { rank: string; badgeColor: string } {
  if (level >= 30) return { rank: 'S-Rank Sovereign', badgeColor: 'from-amber-400 to-yellow-500 text-slate-950' };
  if (level >= 20) return { rank: 'A-Rank Vanguard', badgeColor: 'from-purple-500 to-indigo-600 text-white' };
  if (level >= 15) return { rank: 'B-Rank Adept', badgeColor: 'from-cyan-400 to-blue-600 text-slate-950' };
  if (level >= 10) return { rank: 'C-Rank Pathfinder', badgeColor: 'from-emerald-400 to-teal-600 text-slate-950' };
  if (level >= 5) return { rank: 'D-Rank Striver', badgeColor: 'from-blue-400 to-cyan-500 text-white' };
  return { rank: 'E-Rank Novice', badgeColor: 'from-slate-600 to-slate-700 text-slate-200' };
}

export interface XPAddResult {
  updatedProfile: UserProfile;
  leveledUp: boolean;
  levelsGained: number;
  actualXpAdded: number;
  softCapped: boolean;
  shieldUsed?: boolean;
}

export function processXPGain(
  profile: UserProfile,
  rawAmount: number,
  statTarget: StatType | StatType[],
  dailySoftCap: number = 350
): XPAddResult {
  const today = new Date().toISOString().split('T')[0];
  let todayXP = profile.todayDate === today ? profile.todayXP : 0;
  let actualXp = rawAmount;
  let softCapped = false;

  // Anti-burnout gentle diminishing returns if exceeding daily soft cap
  if (todayXP >= dailySoftCap) {
    actualXp = Math.max(1, Math.round(rawAmount * 0.4)); // 40% value beyond daily target
    softCapped = true;
  } else if (todayXP + rawAmount > dailySoftCap) {
    const normalPortion = dailySoftCap - todayXP;
    const overPortion = (todayXP + rawAmount) - dailySoftCap;
    actualXp = Math.round(normalPortion + (overPortion * 0.4));
    softCapped = true;
  }

  let newCurrentXP = profile.currentXP + actualXp;
  let newTotalXP = profile.totalXP + actualXp;
  let newLevel = profile.level;
  let levelsGained = 0;

  // Check level ups (infinite progression)
  let reqXP = getRequiredXPForLevel(newLevel);
  while (newCurrentXP >= reqXP) {
    newCurrentXP -= reqXP;
    newLevel += 1;
    levelsGained += 1;
    reqXP = getRequiredXPForLevel(newLevel);
  }

  // Check streak & anti-burnout Streak Shields
  let currentStreak = profile.currentStreak;
  let longestStreak = profile.longestStreak;
  let streakShields = profile.streakShields ?? 1;
  let lastShieldUsedDate = profile.lastShieldUsedDate;
  let shieldUsed = false;

  if (profile.lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (profile.lastActiveDate === yesterdayStr) {
      currentStreak += 1;
      // Award a bonus shield for 7-day consistency (max 2)
      if (currentStreak % 7 === 0 && streakShields < 2) {
        streakShields = Math.min(2, streakShields + 1);
      }
    } else if (!profile.lastActiveDate) {
      currentStreak = 1;
    } else {
      // Missed yesterday! Check if user has an active streak shield
      if (streakShields > 0) {
        streakShields -= 1;
        shieldUsed = true;
        lastShieldUsedDate = yesterdayStr;
        currentStreak += 1; // Protected!
      } else {
        // Reset without shame
        currentStreak = 1;
      }
    }
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }

  // Update target stats (1-100 scale), with diminishing returns as stats increase
  const targets: StatType[] = Array.isArray(statTarget) ? statTarget : [statTarget];
  const newStats = { ...profile.stats };

  targets.forEach(target => {
    const currentVal = profile.stats[target] ?? 10;
    // Diminishing returns: stat progression naturally slows down as mastery approaches 100
    const statGain = Math.max(0.05, (actualXp / (currentVal + 25)) / targets.length);
    const nextVal = Math.min(100, currentVal + statGain);
    newStats[target] = Math.round(nextVal * 10) / 10;
  });

  const updatedProfile: UserProfile = {
    ...profile,
    level: newLevel,
    currentXP: newCurrentXP,
    totalXP: newTotalXP,
    currentStreak,
    longestStreak,
    streakShields,
    lastShieldUsedDate,
    todayXP: todayXP + actualXp,
    todayDate: today,
    lastActiveDate: today,
    stats: newStats
  };

  return {
    updatedProfile,
    leveledUp: levelsGained > 0,
    levelsGained,
    actualXpAdded: actualXp,
    softCapped,
    shieldUsed
  };
}

export function checkAchievements(
  profile: UserProfile,
  achievements: Achievement[],
  transactions: XPTransaction[]
): { updatedAchievements: Achievement[]; newlyUnlocked: Achievement[] } {
  const newlyUnlocked: Achievement[] = [];
  const updatedAchievements = achievements.map(ach => {
    if (ach.isUnlocked) return ach;

    let progress = ach.progress;
    let unlocked = false;

    switch (ach.code) {
      case 'FIRST_STEP':
        progress = profile.totalXP > 0 ? 1 : 0;
        unlocked = progress >= 1;
        break;
      case 'CENTURY_XP':
        progress = Math.min(100, profile.totalXP);
        unlocked = profile.totalXP >= 100;
        break;
      case 'LEVEL_5':
        progress = Math.min(5, profile.level);
        unlocked = profile.level >= 5;
        break;
      case 'LEVEL_10':
        progress = Math.min(10, profile.level);
        unlocked = profile.level >= 10;
        break;
      case 'STREAK_3':
        progress = Math.min(3, profile.currentStreak);
        unlocked = profile.currentStreak >= 3;
        break;
      case 'STREAK_7':
        progress = Math.min(7, profile.currentStreak);
        unlocked = profile.currentStreak >= 7;
        break;
      case 'IRON_DISCIPLE':
        const workoutCount = transactions.filter(t => t.source === 'workout').length;
        progress = Math.min(5, workoutCount);
        unlocked = workoutCount >= 5;
        break;
      case 'DEEP_DIVER':
        const focusCount = transactions.filter(t => t.source === 'focus').length;
        progress = Math.min(5, focusCount);
        unlocked = focusCount >= 5;
        break;
      case 'BRAVE_SPEAKER':
        const confCount = transactions.filter(t => t.source === 'confidence').length;
        progress = Math.min(3, confCount);
        unlocked = confCount >= 3;
        break;
      case 'LIGHTNING_REFLEX':
        const reflexCount = transactions.filter(t => t.source === 'reflex').length;
        progress = Math.min(5, reflexCount);
        unlocked = reflexCount >= 5;
        break;
      default:
        break;
    }

    if (unlocked && !ach.isUnlocked) {
      const unlockedAch: Achievement = {
        ...ach,
        progress: ach.maxProgress,
        isUnlocked: true,
        unlockedAt: new Date().toISOString()
      };
      newlyUnlocked.push(unlockedAch);
      return unlockedAch;
    }

    return { ...ach, progress };
  });

  return { updatedAchievements, newlyUnlocked };
}
