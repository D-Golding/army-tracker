// services/achievements/achievementStreaks.js - Streak calculation and milestone checking
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { STREAK_TYPES } from '../shared/constants.js';

// Streak definitions (this would normally come from your config file)
const STREAK_DEFINITIONS = {
  [STREAK_TYPES.DAILY_ACTIVITY]: {
    name: 'Daily Activity',
    description: 'Days with any activity',
    icon: '🔥',
    milestones: [3, 7, 14, 30, 60, 100, 365]
  },
  [STREAK_TYPES.WEEKLY_COMPLETION]: {
    name: 'Weekly Completion',
    description: 'Weeks with completed tasks',
    icon: '⚡',
    milestones: [2, 4, 8, 12, 26, 52]
  }
};

/**
 * Update user streaks based on activity
 * @param {string} userId - User ID
 * @param {string} activityType - Type of activity ('general', 'completion', 'step_completion')
 * @returns {Promise<Object|null>} Updated streaks data
 */
export const updateUserStreaks = async (userId, activityType = 'general') => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return null;

    const userData = userDoc.data();
    const currentStreaks = userData.gamification?.streaks || {};
    const now = new Date();
    const today = now.toDateString();

    const streakUpdates = { ...currentStreaks };

    // Update daily activity streak
    if (activityType !== 'completion_only') {
      const dailyStreak = streakUpdates[STREAK_TYPES.DAILY_ACTIVITY] || {
        current: 0,
        longest: 0,
        lastActivity: null
      };
      const lastActivity = dailyStreak.lastActivity ? new Date(dailyStreak.lastActivity).toDateString() : null;

      if (lastActivity !== today) {
        // Check if it's consecutive
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActivity === yesterday.toDateString()) {
          // Consecutive day
          dailyStreak.current += 1;
        } else if (lastActivity !== today) {
          // Reset streak if gap
          dailyStreak.current = 1;
        }

        dailyStreak.longest = Math.max(dailyStreak.longest, dailyStreak.current);
        dailyStreak.lastActivity = now.toISOString();

        streakUpdates[STREAK_TYPES.DAILY_ACTIVITY] = dailyStreak;
      }
    }

    // Update weekly completion streak (when completing steps/projects)
    if (activityType === 'completion' || activityType === 'step_completion') {
      const weeklyStreak = streakUpdates[STREAK_TYPES.WEEKLY_COMPLETION] || {
        current: 0,
        longest: 0,
        lastCompletion: null
      };

      // Get start of current week
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);

      const lastCompletion = weeklyStreak.lastCompletion ? new Date(weeklyStreak.lastCompletion) : null;
      const lastCompletionWeekStart = lastCompletion ? new Date(lastCompletion) : null;

      if (lastCompletionWeekStart) {
        lastCompletionWeekStart.setDate(lastCompletionWeekStart.getDate() - lastCompletionWeekStart.getDay());
        lastCompletionWeekStart.setHours(0, 0, 0, 0);
      }

      // If this is the first completion this week
      if (!lastCompletionWeekStart || lastCompletionWeekStart.getTime() !== currentWeekStart.getTime()) {
        // Check if it's consecutive week
        const lastWeek = new Date(currentWeekStart);
        lastWeek.setDate(lastWeek.getDate() - 7);

        if (lastCompletionWeekStart && lastCompletionWeekStart.getTime() === lastWeek.getTime()) {
          // Consecutive week
          weeklyStreak.current += 1;
        } else {
          // New streak or reset
          weeklyStreak.current = 1;
        }

        weeklyStreak.longest = Math.max(weeklyStreak.longest, weeklyStreak.current);
        weeklyStreak.lastCompletion = now.toISOString();

        streakUpdates[STREAK_TYPES.WEEKLY_COMPLETION] = weeklyStreak;
      }
    }

    // Update in database
    await updateDoc(userRef, {
      'gamification.streaks': streakUpdates
    });

    return streakUpdates;
  } catch (error) {
    console.error('Error updating user streaks:', error);
    throw error;
  }
};

/**
 * Check for streak milestones
 * @param {Object} streaks - Current streak data
 * @returns {Array} Array of milestone achievements
 */
export const checkStreakMilestones = (streaks) => {
  const milestones = [];

  Object.entries(STREAK_DEFINITIONS).forEach(([streakType, definition]) => {
    const streak = streaks[streakType];
    if (!streak) return;

    definition.milestones.forEach(milestone => {
      if (streak.current === milestone && streak.current > 0) {
        milestones.push({
          type: streakType,
          milestone,
          name: definition.name,
          description: `${milestone} ${streakType === STREAK_TYPES.DAILY_ACTIVITY ? 'day' : 'week'} streak!`,
          icon: definition.icon,
          streakData: {
            current: streak.current,
            longest: streak.longest,
            type: streakType
          }
        });
      }
    });
  });

  return milestones;
};

/**
 * Calculate streak progress towards next milestone
 * @param {Object} streak - Individual streak data
 * @param {string} streakType - Type of streak
 * @returns {Object} Progress information
 */
export const calculateStreakProgress = (streak, streakType) => {
  const definition = STREAK_DEFINITIONS[streakType];
  if (!definition || !streak) {
    return {
      current: 0,
      nextMilestone: null,
      progress: 0,
      remaining: 0
    };
  }

  const current = streak.current || 0;
  const nextMilestone = definition.milestones.find(milestone => milestone > current);

  if (!nextMilestone) {
    return {
      current,
      nextMilestone: null,
      progress: 100,
      remaining: 0,
      maxMilestone: true
    };
  }

  const previousMilestone = definition.milestones
    .filter(milestone => milestone <= current)
    .pop() || 0;

  const progress = previousMilestone === nextMilestone ? 0 :
    Math.round(((current - previousMilestone) / (nextMilestone - previousMilestone)) * 100);

  return {
    current,
    nextMilestone,
    progress,
    remaining: nextMilestone - current,
    previousMilestone
  };
};

/**
 * Get all streak definitions
 * @returns {Object} Streak definitions
 */
export const getStreakDefinitions = () => {
  return STREAK_DEFINITIONS;
};

/**
 * Check if streak should be reset due to inactivity
 * @param {Object} streak - Streak data
 * @param {string} streakType - Type of streak
 * @returns {boolean} Whether streak should be reset
 */
export const shouldResetStreak = (streak, streakType) => {
  if (!streak || !streak.lastActivity) return false;

  const now = new Date();
  const lastActivity = new Date(streak.lastActivity);

  switch (streakType) {
    case STREAK_TYPES.DAILY_ACTIVITY:
      // Reset if more than 1 day gap
      const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
      return daysDiff > 1;

    case STREAK_TYPES.WEEKLY_COMPLETION:
      // Reset if more than 2 weeks gap
      const weeksDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24 * 7));
      return weeksDiff > 2;

    default:
      return false;
  }
};

/**
 * Reset a specific streak
 * @param {string} userId - User ID
 * @param {string} streakType - Type of streak to reset
 * @returns {Promise<boolean>} Success status
 */
export const resetStreak = async (userId, streakType) => {
  try {
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      [`gamification.streaks.${streakType}.current`]: 0,
      [`gamification.streaks.${streakType}.lastActivity`]: null
    });

    return true;
  } catch (error) {
    console.error('Error resetting streak:', error);
    return false;
  }
};

/**
 * Get streak summary for user
 * @param {Object} streaks - User's streak data
 * @returns {Object} Streak summary
 */
export const getStreakSummary = (streaks = {}) => {
  const summary = {
    totalStreaks: 0,
    longestStreak: 0,
    currentStreaks: 0,
    streakDetails: []
  };

  Object.entries(STREAK_DEFINITIONS).forEach(([streakType, definition]) => {
    const streak = streaks[streakType] || { current: 0, longest: 0 };

    summary.totalStreaks++;
    summary.longestStreak = Math.max(summary.longestStreak, streak.longest || 0);

    if (streak.current > 0) {
      summary.currentStreaks++;
    }

    const progress = calculateStreakProgress(streak, streakType);

    summary.streakDetails.push({
      type: streakType,
      name: definition.name,
      icon: definition.icon,
      current: streak.current || 0,
      longest: streak.longest || 0,
      progress,
      isActive: (streak.current || 0) > 0
    });
  });

  return summary;
};