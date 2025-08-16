// services/achievements/achievementHelpers.js - Achievement utilities and helpers (Updated)
import { ACHIEVEMENT_CATEGORIES, STREAK_TYPES } from '../shared/constants.js';

/**
 * Get achievement by ID from definitions
 * @param {string} achievementId - Achievement ID to find
 * @returns {Object|null} Achievement definition or null if not found
 */
export const getAchievementById = (achievementId) => {
  // Import achievement definitions (this would come from your config file)
  // For now, using a placeholder - you'll need to import your actual ACHIEVEMENT_DEFINITIONS
  const ACHIEVEMENT_DEFINITIONS = {}; // Replace with actual import

  for (const achievements of Object.values(ACHIEVEMENT_DEFINITIONS)) {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) return achievement;
  }
  return null;
};

/**
 * Get all achievements with progress for a user
 * @param {string} userId - User ID
 * @param {Object} gamificationData - User's gamification data
 * @returns {Promise<Array>} Achievements with progress information
 */
export const getAllAchievementsWithProgress = async (userId) => {
  try {
    const { getUserGamificationData } = await import('./achievementCore.js');
    const gamificationData = await getUserGamificationData(userId);

    const ACHIEVEMENT_DEFINITIONS = {}; // Replace with actual import
    const unlockedBadges = gamificationData?.achievements?.unlockedBadges || [];
    const progress = gamificationData?.achievements?.progress || {};

    const achievementsWithProgress = [];

    Object.entries(ACHIEVEMENT_DEFINITIONS).forEach(([category, achievements]) => {
      achievements.forEach(achievement => {
        const isUnlocked = unlockedBadges.includes(achievement.id);
        const achievementProgress = progress[achievement.id] || {
          current: 0,
          required: achievement.threshold,
          percentage: 0
        };

        achievementsWithProgress.push({
          ...achievement,
          category,
          isUnlocked,
          progress: achievementProgress
        });
      });
    });

    return achievementsWithProgress;
  } catch (error) {
    console.error('Error getting achievements with progress:', error);
    throw error;
  }
};

/**
 * Validate achievement data structure
 * @param {Object} achievementData - Achievement data to validate
 * @returns {Object} Validation result
 */
export const validateAchievementData = (achievementData) => {
  const required = ['id', 'name', 'description', 'threshold', 'points'];
  const missing = required.filter(field => !achievementData[field]);

  if (missing.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missing.join(', ')}`
    };
  }

  if (typeof achievementData.threshold !== 'number' || achievementData.threshold <= 0) {
    return {
      isValid: false,
      error: 'Threshold must be a positive number'
    };
  }

  if (typeof achievementData.points !== 'number' || achievementData.points <= 0) {
    return {
      isValid: false,
      error: 'Points must be a positive number'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Calculate project difficulty score
 * @param {Object} project - Project data
 * @returns {number} Difficulty score
 */
export const calculateProjectDifficulty = (project) => {
  const baseScores = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4
  };

  let score = baseScores[project.difficulty] || 1;

  // Add complexity based on steps
  const stepCount = project.steps?.length || 0;
  score += Math.floor(stepCount / 5); // +1 for every 5 steps

  // Add complexity based on paint count
  const paintCount = project.paintOverview?.length || 0;
  score += Math.floor(paintCount / 10); // +1 for every 10 paints

  return Math.min(score, 10); // Cap at 10
};

/**
 * Calculate complexity score for achievements
 * @param {Object} project - Project data
 * @returns {number} Complexity score
 */
export const calculateComplexityScore = (project) => {
  let complexity = 0;

  // Base complexity from difficulty
  const difficultyScores = {
    beginner: 1,
    intermediate: 3,
    advanced: 6,
    expert: 10
  };
  complexity += difficultyScores[project.difficulty] || 1;

  // Add complexity from steps
  const stepCount = project.steps?.length || 0;
  complexity += stepCount * 0.5;

  // Add complexity from techniques used
  const techniques = new Set();
  project.steps?.forEach(step => {
    step.paints?.forEach(paint => {
      if (paint.technique) techniques.add(paint.technique);
    });
  });
  complexity += techniques.size * 2;

  // Add complexity from unique paints
  const uniquePaints = new Set();
  project.paintOverview?.forEach(paint => {
    uniquePaints.add(paint.paintId);
  });
  complexity += uniquePaints.size * 0.2;

  return Math.round(complexity * 10) / 10; // Round to 1 decimal
};

/**
 * Format achievement notification data
 * @param {Object} achievement - Achievement data
 * @param {string} category - Achievement category
 * @returns {Object} Formatted notification data
 */
export const formatAchievementNotification = (achievement, category) => {
  return {
    ...achievement,
    unlockedAt: new Date().toISOString(),
    category,
    type: 'achievement',
    title: `Achievement Unlocked: ${achievement.name}`,
    message: achievement.description,
    icon: achievement.icon || '🏆',
    points: achievement.points
  };
};

/**
 * Check if achievement should trigger email notification
 * @param {Object} achievement - Achievement data
 * @param {Object} userPreferences - User's notification preferences
 * @returns {boolean} Whether to send email
 */
export const shouldSendAchievementEmail = (achievement, userPreferences) => {
  // Check if user has achievement emails enabled
  if (!userPreferences?.emailAchievements) {
    return false;
  }

  // Only send for significant achievements (high point values)
  const significantThreshold = 50;
  return achievement.points >= significantThreshold;
};

/**
 * Group achievements by category for display
 * @param {Array} achievements - Array of achievements
 * @returns {Object} Achievements grouped by category
 */
export const groupAchievementsByCategory = (achievements) => {
  const grouped = {};

  achievements.forEach(achievement => {
    const category = achievement.category || 'uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(achievement);
  });

  return grouped;
};