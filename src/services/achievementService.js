// services/achievementService.js - Barrel export (maintains backward compatibility)

// Re-export calculation functions
export {
  calculateUserStatistics,
  checkForNewAchievements,
  calculateCategoryProgress,
  calculateProgressPercentage,
  getAchievementsNearCompletion
} from './achievements/achievementCalculation.js';

// Re-export streak functions
export {
  updateUserStreaks,
  checkStreakMilestones,
  calculateStreakProgress,
  getStreakDefinitions,
  shouldResetStreak,
  resetStreak,
  getStreakSummary
} from './achievements/achievementStreaks.js';

// Re-export core functions
export {
  initializeGamificationData,
  getUserGamificationData,
  processUserAchievements,
  updateGamificationPreferences,
  resetGamificationData,
  getAchievementSummary
} from './achievements/achievementCore.js';

// Re-export helper functions
export {
  getAchievementById,
  getAllAchievementsWithProgress,
  validateAchievementData,
  calculateProjectDifficulty,
  calculateComplexityScore,
  formatAchievementNotification,
  shouldSendAchievementEmail,
  groupAchievementsByCategory
} from './achievements/achievementHelpers.js';

// Default export for backward compatibility
export default {
  // Core functions (most commonly used)
  initializeGamificationData,
  calculateUserStatistics,
  checkForNewAchievements,
  updateUserStreaks,
  processUserAchievements,
  getUserGamificationData,
  getAchievementById,
  getAllAchievementsWithProgress,
  checkStreakMilestones,

  // Helper functions
  calculateProjectDifficulty,
  calculateComplexityScore,
  formatAchievementNotification,
  groupAchievementsByCategory,

  // Preferences and management
  updateGamificationPreferences,
  resetGamificationData,
  getAchievementSummary
};

// Import the functions for the default export
import { calculateUserStatistics, checkForNewAchievements } from './achievements/achievementCalculation.js';
import { updateUserStreaks, checkStreakMilestones } from './achievements/achievementStreaks.js';
import { initializeGamificationData, getUserGamificationData, processUserAchievements, updateGamificationPreferences, resetGamificationData, getAchievementSummary } from './achievements/achievementCore.js';
import { getAchievementById, getAllAchievementsWithProgress, calculateProjectDifficulty, calculateComplexityScore, formatAchievementNotification, groupAchievementsByCategory } from './achievements/achievementHelpers.js';