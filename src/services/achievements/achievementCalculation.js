// services/achievements/achievementCalculation.js - User statistics and achievement checking
import { getAllPaints } from '../paints/index.js';
import { getAllProjects } from '../projects/index.js';
import { ACHIEVEMENT_CATEGORIES } from '../shared/constants.js';

/**
 * Calculate user statistics from their REAL data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Calculated statistics
 */
export const calculateUserStatistics = async (userId) => {
  try {
    console.log('📊 Calculating user statistics for:', userId);

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

/**
 * Check for new achievements based on current statistics
 * @param {Object} currentStats - Current user statistics
 * @param {Array} existingBadges - Array of already unlocked badge IDs
 * @returns {Object} New achievements and progress updates
 */
export const checkForNewAchievements = (currentStats, existingBadges = []) => {
  // This would import from your achievement config file
  const ACHIEVEMENT_DEFINITIONS = {}; // Replace with actual import

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

/**
 * Calculate progress for a specific achievement category
 * @param {Object} currentStats - Current user statistics
 * @param {string} category - Achievement category
 * @returns {number} Current progress for that category
 */
export const calculateCategoryProgress = (currentStats, category) => {
  switch (category) {
    case ACHIEVEMENT_CATEGORIES.CREATE_PROJECT:
      return currentStats.projectsCreated || 0;
    case ACHIEVEMENT_CATEGORIES.COMPLETIONIST:
      return currentStats.projectsCompleted || 0;
    case ACHIEVEMENT_CATEGORIES.PAINT_MASTER:
      return currentStats.uniquePaintsUsed || 0;
    case ACHIEVEMENT_CATEGORIES.BRAND_EXPLORER:
      return currentStats.uniqueBrandsUsed || 0;
    case ACHIEVEMENT_CATEGORIES.TECHNIQUE_SPECIALIST:
      return currentStats.uniqueTechniquesUsed || 0;
    case ACHIEVEMENT_CATEGORIES.STEP_MASTER:
      return currentStats.totalSteps || 0;
    case ACHIEVEMENT_CATEGORIES.PHOTO_DOCUMENTARIAN:
      return currentStats.totalPhotos || 0;
    default:
      return 0;
  }
};

/**
 * Calculate percentage progress for an achievement
 * @param {number} current - Current progress
 * @param {number} required - Required progress for achievement
 * @returns {number} Percentage (0-100)
 */
export const calculateProgressPercentage = (current, required) => {
  if (required <= 0) return 100;
  return Math.min(100, Math.round((current / required) * 100));
};

/**
 * Get achievements close to completion
 * @param {Object} progressUpdates - All achievement progress
 * @param {number} threshold - Minimum percentage to be considered "close"
 * @returns {Array} Achievements close to completion
 */
export const getAchievementsNearCompletion = (progressUpdates, threshold = 80) => {
  const nearCompletion = [];

  Object.entries(progressUpdates).forEach(([achievementId, progress]) => {
    if (progress.percentage >= threshold && progress.percentage < 100) {
      nearCompletion.push({
        achievementId,
        ...progress
      });
    }
  });

  return nearCompletion.sort((a, b) => b.percentage - a.percentage);
};