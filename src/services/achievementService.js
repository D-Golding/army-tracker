// services/achievementService.js - Achievement Calculation Engine with Real Data
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { getAllPaints } from './paintService.js';
import { getAllProjects } from './projectService.js';
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_DEFINITIONS,
  STREAK_TYPES,
  STREAK_DEFINITIONS,
  GAMIFICATION_SCHEMA,
  calculateProjectDifficulty,
  calculateComplexityScore
} from '../config/achievementConfig.js';

// Initialize gamification data for new users
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

// Calculate user statistics from their REAL data
export const calculateUserStatistics = async (userId) => {
  try {
    console.log('🔢 Calculating user statistics for:', userId);

    // Get user's actual projects and paints from Firestore
    const [projects, paints] = await Promise.all([
      getAllProjects(),
      getAllPaints()
    ]);

    console.log('📊 Raw data loaded:', {
      projectCount: projects.length,
      paintCount: paints.length
    });

    // Initialize statistics
    const statistics = {
      projectsCreated: projects.length,
      projectsCompleted: 0,
      totalSteps: 0,
      totalPhotos: 0,
      uniquePaintsUsed: 0,
      uniqueBrandsUsed: 0,
      uniqueTechniquesUsed: 0,
      lastCalculated: new Date().toISOString()
    };

    // Track unique values
    const uniquePaints = new Set();
    const uniqueBrands = new Set();
    const uniqueTechniques = new Set();
    let totalSteps = 0;
    let totalPhotos = 0;
    let completedProjects = 0;

    // Process each project
    projects.forEach(project => {
      // Count completed projects
      if (project.status === 'completed') {
        completedProjects++;
      }

      // Count steps
      const projectSteps = project.steps?.length || 0;
      totalSteps += projectSteps;

      // Count photos (both project-level and step-level)
      const projectPhotos = project.photoURLs?.length || 0;
      totalPhotos += projectPhotos;

      // Count step-level photos
      if (project.steps) {
        project.steps.forEach(step => {
          totalPhotos += step.photos?.length || 0;

          // Count paint assignments and track unique values
          if (step.paints) {
            step.paints.forEach(paint => {
              uniquePaints.add(paint.paintId || paint.paintName);
              if (paint.brand) uniqueBrands.add(paint.brand);
              if (paint.technique) uniqueTechniques.add(paint.technique);
            });
          }
        });
      }

      // Count paints from paint overview (for older projects)
      if (project.paintOverview) {
        project.paintOverview.forEach(paint => {
          uniquePaints.add(paint.paintId || paint.paintName);
          if (paint.brand) uniqueBrands.add(paint.brand);
        });
      }

      // Count paints from required paints (legacy)
      if (project.requiredPaints && Array.isArray(project.requiredPaints)) {
        project.requiredPaints.forEach(paintName => {
          if (paintName && paintName.trim()) {
            uniquePaints.add(paintName.trim());
          }
        });
      }
    });

    // Also count unique brands from paint collection
    paints.forEach(paint => {
      if (paint.brand) uniqueBrands.add(paint.brand);
    });

    // Update statistics with calculated values
    statistics.projectsCompleted = completedProjects;
    statistics.totalSteps = totalSteps;
    statistics.totalPhotos = totalPhotos;
    statistics.uniquePaintsUsed = uniquePaints.size;
    statistics.uniqueBrandsUsed = uniqueBrands.size;
    statistics.uniqueTechniquesUsed = uniqueTechniques.size;

    console.log('📈 Calculated statistics:', statistics);

    return statistics;
  } catch (error) {
    console.error('Error calculating user statistics:', error);
    // Return default statistics if calculation fails
    return {
      projectsCreated: 0,
      projectsCompleted: 0,
      totalSteps: 0,
      totalPhotos: 0,
      uniquePaintsUsed: 0,
      uniqueBrandsUsed: 0,
      uniqueTechniquesUsed: 0,
      lastCalculated: new Date().toISOString()
    };
  }
};

// Check for new achievements based on current statistics
export const checkForNewAchievements = (currentStats, existingBadges = []) => {
  const newAchievements = [];
  const progressUpdates = {};

  console.log('🏆 Checking achievements with stats:', currentStats);
  console.log('🎯 Existing badges:', existingBadges);

  // Check each achievement category
  Object.entries(ACHIEVEMENT_DEFINITIONS).forEach(([category, achievements]) => {
    achievements.forEach(achievement => {
      // Skip if already unlocked
      if (existingBadges.includes(achievement.id)) return;

      let currentProgress = 0;

      // Calculate progress based on category
      switch (category) {
        case ACHIEVEMENT_CATEGORIES.CREATE_PROJECT:
          currentProgress = currentStats.projectsCreated;
          break;
        case ACHIEVEMENT_CATEGORIES.COMPLETIONIST:
          currentProgress = currentStats.projectsCompleted;
          break;
        case ACHIEVEMENT_CATEGORIES.PAINT_MASTER:
          currentProgress = currentStats.uniquePaintsUsed;
          break;
        case ACHIEVEMENT_CATEGORIES.BRAND_EXPLORER:
          currentProgress = currentStats.uniqueBrandsUsed;
          break;
        case ACHIEVEMENT_CATEGORIES.TECHNIQUE_SPECIALIST:
          currentProgress = currentStats.uniqueTechniquesUsed;
          break;
        case ACHIEVEMENT_CATEGORIES.STEP_MASTER:
          currentProgress = currentStats.totalSteps;
          break;
        case ACHIEVEMENT_CATEGORIES.PHOTO_DOCUMENTARIAN:
          currentProgress = currentStats.totalPhotos;
          break;
      }

      // Update progress
      progressUpdates[achievement.id] = {
        current: currentProgress,
        required: achievement.threshold,
        percentage: Math.min(100, Math.round((currentProgress / achievement.threshold) * 100))
      };

      // Check if achievement is unlocked
      if (currentProgress >= achievement.threshold) {
        console.log(`🎉 Achievement unlocked: ${achievement.name} (${currentProgress}/${achievement.threshold})`);
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date().toISOString(),
          category
        });
      } else {
        console.log(`📊 Progress: ${achievement.name} (${currentProgress}/${achievement.threshold})`);
      }
    });
  });

  console.log('🆕 New achievements:', newAchievements.map(a => a.name));

  return { newAchievements, progressUpdates };
};

// Update user streaks
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
      const dailyStreak = streakUpdates[STREAK_TYPES.DAILY_ACTIVITY] || { current: 0, longest: 0, lastActivity: null };
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
      const weeklyStreak = streakUpdates[STREAK_TYPES.WEEKLY_COMPLETION] || { current: 0, longest: 0, lastCompletion: null };

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

// Main function to check and update all achievements
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
    const totalPoints = allUnlockedBadges.reduce((total, achievementId) => {
      // Find the achievement to get its points
      for (const achievements of Object.values(ACHIEVEMENT_DEFINITIONS)) {
        const achievement = achievements.find(a => a.id === achievementId);
        if (achievement) return total + achievement.points;
      }
      return total;
    }, 0);

    // Update streaks
    const streaks = await updateUserStreaks(userId, triggerType);

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
      totalPoints,
      totalBadges: allUnlockedBadges.length
    });

    // Trigger notifications for new achievements
    newAchievements.forEach(achievement => {
      window.dispatchEvent(new CustomEvent('achievementUnlocked', {
        detail: achievement
      }));
    });

    return {
      newAchievements,
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

// Get user's current gamification data
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

// Get achievement by ID
export const getAchievementById = (achievementId) => {
  for (const achievements of Object.values(ACHIEVEMENT_DEFINITIONS)) {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) return achievement;
  }
  return null;
};

// Get all achievements with progress
export const getAllAchievementsWithProgress = async (userId) => {
  try {
    const gamificationData = await getUserGamificationData(userId);
    const unlockedBadges = gamificationData?.achievements?.unlockedBadges || [];
    const progress = gamificationData?.achievements?.progress || {};

    const achievementsWithProgress = [];

    Object.entries(ACHIEVEMENT_DEFINITIONS).forEach(([category, achievements]) => {
      achievements.forEach(achievement => {
        const isUnlocked = unlockedBadges.includes(achievement.id);
        const achievementProgress = progress[achievement.id] || { current: 0, required: achievement.threshold, percentage: 0 };

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

// Check for streak milestones
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
          icon: definition.icon
        });
      }
    });
  });

  return milestones;
};

export default {
  initializeGamificationData,
  calculateUserStatistics,
  checkForNewAchievements,
  updateUserStreaks,
  processUserAchievements,
  getUserGamificationData,
  getAchievementById,
  getAllAchievementsWithProgress,
  checkStreakMilestones
};