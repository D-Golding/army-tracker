// services/achievements/achievementCore.js - Main achievement processing and initialization
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { calculateUserStatistics, checkForNewAchievements } from './achievementCalculation.js';
import { updateUserStreaks, checkStreakMilestones } from './achievementStreaks.js';

// Gamification schema (this would normally come from your config file)
const GAMIFICATION_SCHEMA = {
  achievements: {
    unlockedBadges: [],
    progress: {},
    totalPoints: 0,
    lastChecked: null
  },
  statistics: {
    projectsCreated: 0,
    projectsCompleted: 0,
    totalSteps: 0,
    totalPhotos: 0,
    uniquePaintsUsed: 0,
    uniqueBrandsUsed: 0,
    uniqueTechniquesUsed: 0,
    lastCalculated: null
  },
  streaks: {},
  preferences: {
    emailAchievements: true,
    emailStreaks: true,
    emailWeeklySummary: true
  }
};

/**
 * Initialize gamification data for new users
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Initialized gamification data
 */
export const initializeGamificationData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updates = {
      gamification: {
        ...GAMIFICATION_SCHEMA,
        achievements: {
          ...GAMIFICATION_SCHEMA.achievements,
          lastChecked: serverTimestamp()
        },
        statistics: {
          ...GAMIFICATION_SCHEMA.statistics,
          lastCalculated: serverTimestamp()
        }
      }
    };

    await setDoc(userRef, updates, { merge: true });
    return updates.gamification;
  } catch (error) {
    console.error('Error initializing gamification data:', error);
    throw error;
  }
};

/**
 * Get user's current gamification data
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Gamification data or null if not found
 */
export const getUserGamificationData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return null;

    const userData = userDoc.data();
    return userData.gamification || null;
  } catch (error) {
    console.error('Error getting user gamification data:', error);
    throw error;
  }
};

/**
 * Main function to check and update all achievements
 * @param {string} userId - User ID
 * @param {string} triggerType - Type of trigger ('general', 'completion', 'step_completion')
 * @returns {Promise<Object>} Processing result
 */
export const processUserAchievements = async (userId, triggerType = 'general') => {
  try {
    console.log('🎮 Processing achievements for user:', userId, 'trigger:', triggerType);

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log('👤 User not found, initializing gamification data...');
      return await initializeGamificationData(userId);
    }

    const userData = userDoc.data();
    const gamificationData = userData.gamification || {};

    // Calculate current statistics from real user data
    const currentStats = await calculateUserStatistics(userId);

    // Check for new achievements
    const existingBadges = gamificationData.achievements?.unlockedBadges || [];
    const { newAchievements, progressUpdates } = checkForNewAchievements(currentStats, existingBadges);

    // Calculate total points
    const allUnlockedBadges = [...existingBadges, ...newAchievements.map(a => a.id)];
    const totalPoints = calculateTotalPoints(allUnlockedBadges);

    // Update streaks
    const streaks = await updateUserStreaks(userId, triggerType);

    // Check for streak milestones
    const streakMilestones = streaks ? checkStreakMilestones(streaks) : [];

    // Prepare updates
    const updates = {
      'gamification.achievements': {
        unlockedBadges: allUnlockedBadges,
        progress: progressUpdates,
        totalPoints,
        lastChecked: serverTimestamp()
      },
      'gamification.statistics': {
        ...currentStats,
        lastCalculated: serverTimestamp()
      }
    };

    if (streaks) {
      updates['gamification.streaks'] = streaks;
    }

    // Update database
    await updateDoc(userRef, updates);

    console.log('✅ Achievement processing complete:', {
      newAchievements: newAchievements.length,
      streakMilestones: streakMilestones.length,
      totalPoints,
      totalBadges: allUnlockedBadges.length
    });

    // Trigger notifications for new achievements
    newAchievements.forEach(achievement => {
      window.dispatchEvent(new CustomEvent('achievementUnlocked', {
        detail: achievement
      }));
    });

    // Trigger notifications for streak milestones
    streakMilestones.forEach(milestone => {
      window.dispatchEvent(new CustomEvent('streakMilestone', {
        detail: milestone
      }));
    });

    return {
      newAchievements,
      streakMilestones,
      totalPoints,
      progressUpdates,
      streaks,
      statistics: currentStats,
      achievements: {
        unlockedBadges: allUnlockedBadges,
        progress: progressUpdates,
        totalPoints,
        lastChecked: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error processing user achievements:', error);
    throw error;
  }
};

/**
 * Calculate total points from achievement IDs
 * @param {Array} achievementIds - Array of achievement IDs
 * @returns {number} Total points
 */
const calculateTotalPoints = (achievementIds) => {
  // This would import from your achievement config file
  const ACHIEVEMENT_DEFINITIONS = {}; // Replace with actual import

  return achievementIds.reduce((total, achievementId) => {
    // Find the achievement to get its points
    for (const achievements of Object.values(ACHIEVEMENT_DEFINITIONS)) {
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) return total + achievement.points;
    }
    return total;
  }, 0);
};

/**
 * Update gamification preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - New preferences
 * @returns {Promise<boolean>} Success status
 */
export const updateGamificationPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);

    const allowedPreferences = [
      'emailAchievements',
      'emailStreaks',
      'emailWeeklySummary',
      'emailReEngagement'
    ];

    const filteredPreferences = {};
    Object.keys(preferences).forEach(key => {
      if (allowedPreferences.includes(key)) {
        filteredPreferences[key] = Boolean(preferences[key]);
      }
    });

    if (Object.keys(filteredPreferences).length === 0) {
      return false;
    }

    await updateDoc(userRef, {
      'gamification.preferences': filteredPreferences
    });

    return true;
  } catch (error) {
    console.error('Error updating gamification preferences:', error);
    return false;
  }
};

/**
 * Reset user's gamification data
 * @param {string} userId - User ID
 * @param {boolean} keepPreferences - Whether to keep user preferences
 * @returns {Promise<boolean>} Success status
 */
export const resetGamificationData = async (userId, keepPreferences = true) => {
  try {
    const userRef = doc(db, 'users', userId);

    let resetData = {
      ...GAMIFICATION_SCHEMA,
      achievements: {
        ...GAMIFICATION_SCHEMA.achievements,
        lastChecked: serverTimestamp()
      },
      statistics: {
        ...GAMIFICATION_SCHEMA.statistics,
        lastCalculated: serverTimestamp()
      }
    };

    if (keepPreferences) {
      const currentData = await getUserGamificationData(userId);
      if (currentData?.preferences) {
        resetData.preferences = currentData.preferences;
      }
    }

    await updateDoc(userRef, {
      gamification: resetData
    });

    return true;
  } catch (error) {
    console.error('Error resetting gamification data:', error);
    return false;
  }
};

/**
 * Get achievement summary for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Achievement summary
 */
export const getAchievementSummary = async (userId) => {
  try {
    const gamificationData = await getUserGamificationData(userId);

    if (!gamificationData) {
      return {
        totalAchievements: 0,
        unlockedAchievements: 0,
        totalPoints: 0,
        completionPercentage: 0,
        recentAchievements: []
      };
    }

    const ACHIEVEMENT_DEFINITIONS = {}; // Replace with actual import
    const totalAchievements = Object.values(ACHIEVEMENT_DEFINITIONS)
      .reduce((total, achievements) => total + achievements.length, 0);

    const unlockedBadges = gamificationData.achievements?.unlockedBadges || [];
    const totalPoints = gamificationData.achievements?.totalPoints || 0;
    const completionPercentage = totalAchievements > 0 ?
      Math.round((unlockedBadges.length / totalAchievements) * 100) : 0;

    return {
      totalAchievements,
      unlockedAchievements: unlockedBadges.length,
      totalPoints,
      completionPercentage,
      recentAchievements: unlockedBadges.slice(-5), // Last 5 achievements
      lastUpdated: gamificationData.achievements?.lastChecked
    };
  } catch (error) {
    console.error('Error getting achievement summary:', error);
    return {
      totalAchievements: 0,
      unlockedAchievements: 0,
      totalPoints: 0,
      completionPercentage: 0,
      recentAchievements: [],
      error: error.message
    };
  }
};