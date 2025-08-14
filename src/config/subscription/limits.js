// config/subscription/limits.js - Usage limits and checking
import { SUBSCRIPTION_TIERS } from './constants.js';

export const DEFAULT_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    paints: 25,
    projects: 2,
    photosPerProject: 3,
    achievementHistory: 30 // days
  },
  [SUBSCRIPTION_TIERS.CASUAL]: {
    paints: 150,
    projects: 10,
    photosPerProject: 10,
    achievementHistory: 90
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    paints: 300,
    projects: 25,
    photosPerProject: 30,
    achievementHistory: 365
  },
  [SUBSCRIPTION_TIERS.BATTLE]: {
    paints: 1000,
    projects: 50,
    photosPerProject: 50,
    achievementHistory: -1 // Unlimited
  }
};

/**
 * Get tier limits
 * @param {string} tier - Subscription tier
 * @returns {Object} Tier limits
 */
export const getTierLimits = (tier) => {
  return DEFAULT_LIMITS[tier] || DEFAULT_LIMITS[SUBSCRIPTION_TIERS.FREE];
};

/**
 * Check if user has reached a limit
 * @param {string} tier - User's subscription tier
 * @param {string} limitType - Type of limit to check
 * @param {number} currentUsage - Current usage count
 * @returns {Object} Limit status
 */
export const checkLimit = (tier, limitType, currentUsage) => {
  const limits = getTierLimits(tier);
  const limit = limits[limitType];

  if (limit === -1) {
    return {
      hasReachedLimit: false,
      isUnlimited: true,
      remaining: -1,
      total: -1
    };
  }

  const hasReachedLimit = currentUsage >= limit;
  const remaining = Math.max(0, limit - currentUsage);

  return {
    hasReachedLimit,
    isUnlimited: false,
    remaining,
    total: limit,
    usage: currentUsage,
    percentUsed: (currentUsage / limit) * 100
  };
};

/**
 * Get upgrade recommendations based on usage
 * @param {string} currentTier - Current subscription tier
 * @param {Object} usage - Current usage statistics
 * @returns {Object} Upgrade recommendations
 */
export const getUpgradeRecommendations = (currentTier, usage = {}) => {
  const currentLimits = getTierLimits(currentTier);
  const recommendations = [];

  // Check each limit type
  Object.keys(currentLimits).forEach(limitType => {
    const currentUsage = usage[limitType] || 0;
    const limitStatus = checkLimit(currentTier, limitType, currentUsage);

    if (limitStatus.percentUsed > 80) {
      recommendations.push({
        type: 'limit_warning',
        limitType,
        percentUsed: limitStatus.percentUsed,
        message: `You're using ${Math.round(limitStatus.percentUsed)}% of your ${limitType} limit`
      });
    }

    if (limitStatus.hasReachedLimit) {
      recommendations.push({
        type: 'limit_reached',
        limitType,
        message: `You've reached your ${limitType} limit`
      });
    }
  });

  // Suggest next tier if they have warnings
  if (recommendations.length > 0 && currentTier !== SUBSCRIPTION_TIERS.BATTLE) {
    const tierOrder = [
      SUBSCRIPTION_TIERS.FREE,
      SUBSCRIPTION_TIERS.CASUAL,
      SUBSCRIPTION_TIERS.PRO,
      SUBSCRIPTION_TIERS.BATTLE
    ];

    const currentIndex = tierOrder.indexOf(currentTier);
    if (currentIndex < tierOrder.length - 1) {
      const nextTier = tierOrder[currentIndex + 1];
      const nextLimits = getTierLimits(nextTier);

      recommendations.push({
        type: 'upgrade_suggestion',
        suggestedTier: nextTier,
        message: `Upgrade to get higher limits`,
        newLimits: nextLimits
      });
    }
  }

  return {
    hasRecommendations: recommendations.length > 0,
    recommendations,
    currentTier,
    currentLimits
  };
};