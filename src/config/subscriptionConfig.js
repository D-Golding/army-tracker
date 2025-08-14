// config/subscriptionConfig.js - Subscription Tiers and Feature Access Control
import { Check, Crown, Zap, Trophy } from 'lucide-react';

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  CASUAL: 'casual',
  PRO: 'pro',
  BATTLE: 'battle'
};

// Feature definitions
export const FEATURES = {
  // Core app features
  PAINTS: 'paints',
  PROJECTS: 'projects',
  PHOTOS: 'photos',

  // Community features
  COMMUNITY_READ: 'communityRead',
  COMMUNITY_POST: 'communityPost',
  COMMUNITY_COMMENT: 'communityComment',
  COMMUNITY_LIKE: 'communityLike',
  COMMUNITY_MESSAGE: 'communityMessage',
  COMMUNITY_CREATE_GROUPS: 'communityCreateGroups',

  // Advanced features
  ADVANCED_ANALYTICS: 'advancedAnalytics',
  EXPORT_DATA: 'exportData',
  PRIORITY_SUPPORT: 'prioritySupport'
};

// Currency information
export const getCurrencyInfo = () => {
  return {
    symbol: '£',
    code: 'GBP',
    position: 'before' // symbol position relative to amount
  };
};

// Tier configurations with limits and permissions
export const TIER_CONFIG = {
  [SUBSCRIPTION_TIERS.FREE]: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: '£0',
    period: 'forever',
    icon: Check,
    color: 'tier-free',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
    popular: false,
    limits: {
      paints: 25,
      projects: 2,
      photosPerProject: 3,
      achievementHistory: 30 // days
    },
    features: {
      // Core features - limited
      [FEATURES.PAINTS]: true,
      [FEATURES.PROJECTS]: true,
      [FEATURES.PHOTOS]: true,

      // Community features - read only
      [FEATURES.COMMUNITY_READ]: true,
      [FEATURES.COMMUNITY_POST]: false,
      [FEATURES.COMMUNITY_COMMENT]: false,
      [FEATURES.COMMUNITY_LIKE]: false,
      [FEATURES.COMMUNITY_MESSAGE]: false,
      [FEATURES.COMMUNITY_CREATE_GROUPS]: false,

      // Advanced features - none
      [FEATURES.ADVANCED_ANALYTICS]: false,
      [FEATURES.EXPORT_DATA]: false,
      [FEATURES.PRIORITY_SUPPORT]: false
    },
    featureList: [
      '25 paint inventory slots',
      '2 project tracking',
      '3 photos per project',
      'View community projects',
      'Basic paint catalogue'
    ]
  },

  [SUBSCRIPTION_TIERS.CASUAL]: {
    id: 'casual',
    name: 'Casual Hobbyist',
    price: 4.99,
    priceDisplay: '£4.99',
    period: 'per year',
    icon: Zap,
    color: 'tier-casual',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    popular: true,
    limits: {
      paints: 150,
      projects: 10,
      photosPerProject: 10,
      achievementHistory: 90 // days
    },
    features: {
      // Core features - expanded
      [FEATURES.PAINTS]: true,
      [FEATURES.PROJECTS]: true,
      [FEATURES.PHOTOS]: true,

      // Community features - basic interaction
      [FEATURES.COMMUNITY_READ]: true,
      [FEATURES.COMMUNITY_POST]: true,
      [FEATURES.COMMUNITY_COMMENT]: true,
      [FEATURES.COMMUNITY_LIKE]: true,
      [FEATURES.COMMUNITY_MESSAGE]: false, // No messaging in casual
      [FEATURES.COMMUNITY_CREATE_GROUPS]: false,

      // Advanced features - basic
      [FEATURES.ADVANCED_ANALYTICS]: false,
      [FEATURES.EXPORT_DATA]: true,
      [FEATURES.PRIORITY_SUPPORT]: false
    },
    featureList: [
      '150 paint inventory slots',
      '10 project tracking',
      '10 photos per project',
      'Full community access',
      'Share your projects',
      'Like and comment on projects'
    ]
  },

  [SUBSCRIPTION_TIERS.PRO]: {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    priceDisplay: '£9.99',
    period: 'per year',
    icon: Crown,
    color: 'tier-pro',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-900',
    popular: false,
    limits: {
      paints: 300,
      projects: 25,
      photosPerProject: 30,
      achievementHistory: 365 // days
    },
    features: {
      // Core features - full access
      [FEATURES.PAINTS]: true,
      [FEATURES.PROJECTS]: true,
      [FEATURES.PHOTOS]: true,

      // Community features - full social
      [FEATURES.COMMUNITY_READ]: true,
      [FEATURES.COMMUNITY_POST]: true,
      [FEATURES.COMMUNITY_COMMENT]: true,
      [FEATURES.COMMUNITY_LIKE]: true,
      [FEATURES.COMMUNITY_MESSAGE]: true,
      [FEATURES.COMMUNITY_CREATE_GROUPS]: true,

      // Advanced features - analytics
      [FEATURES.ADVANCED_ANALYTICS]: true,
      [FEATURES.EXPORT_DATA]: true,
      [FEATURES.PRIORITY_SUPPORT]: false
    },
    featureList: [
      '300 paint inventory slots',
      '25 project tracking',
      '30 photos per project',
      'Full community access',
      'Direct messaging',
      'Create groups',
      'Advanced analytics'
    ]
  },

  [SUBSCRIPTION_TIERS.BATTLE]: {
    id: 'battle',
    name: 'Battle Ready',
    price: 14.99,
    priceDisplay: '£14.99',
    period: 'per year',
    icon: Trophy,
    color: 'tier-battle',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-900',
    popular: false,
    limits: {
      paints: 1000,
      projects: 50,
      photosPerProject: 50,
      achievementHistory: -1 // Unlimited
    },
    features: {
      // Core features - unlimited
      [FEATURES.PAINTS]: true,
      [FEATURES.PROJECTS]: true,
      [FEATURES.PHOTOS]: true,

      // Community features - everything
      [FEATURES.COMMUNITY_READ]: true,
      [FEATURES.COMMUNITY_POST]: true,
      [FEATURES.COMMUNITY_COMMENT]: true,
      [FEATURES.COMMUNITY_LIKE]: true,
      [FEATURES.COMMUNITY_MESSAGE]: true,
      [FEATURES.COMMUNITY_CREATE_GROUPS]: true,

      // Advanced features - everything
      [FEATURES.ADVANCED_ANALYTICS]: true,
      [FEATURES.EXPORT_DATA]: true,
      [FEATURES.PRIORITY_SUPPORT]: true
    },
    featureList: [
      '1000 paint inventory slots',
      '50 project tracking',
      '50 photos per project',
      'Full community access',
      'Direct messaging',
      'Create groups',
      'Army tracker & battle reports',
      'Priority support'
    ]
  }
};

// Compatibility export for existing tierData.js usage
export const tiers = Object.values(TIER_CONFIG);

/**
 * Get tier configuration
 * @param {string} tier - Subscription tier
 * @returns {Object} Tier configuration
 */
export const getTierConfig = (tier) => {
  return TIER_CONFIG[tier] || TIER_CONFIG[SUBSCRIPTION_TIERS.FREE];
};

/**
 * Get tier limits
 * @param {string} tier - Subscription tier
 * @returns {Object} Tier limits
 */
export const getTierLimits = (tier) => {
  const config = getTierConfig(tier);
  return config.limits;
};

/**
 * Check if user has access to a feature
 * @param {string} tier - User's subscription tier
 * @param {string} feature - Feature to check
 * @returns {boolean} Whether user has access
 */
export const hasFeatureAccess = (tier, feature) => {
  const config = getTierConfig(tier);
  return config.features[feature] === true;
};

/**
 * Check if user can access community features
 * @param {string} tier - User's subscription tier
 * @param {string} feature - Community feature to check
 * @returns {boolean} Whether user has access
 */
export const canAccessCommunityFeature = (tier, feature) => {
  // Map short feature names to full feature constants
  const featureMap = {
    read: FEATURES.COMMUNITY_READ,
    post: FEATURES.COMMUNITY_POST,
    comment: FEATURES.COMMUNITY_COMMENT,
    like: FEATURES.COMMUNITY_LIKE,
    message: FEATURES.COMMUNITY_MESSAGE,
    createGroups: FEATURES.COMMUNITY_CREATE_GROUPS
  };

  const fullFeatureName = featureMap[feature] || feature;
  return hasFeatureAccess(tier, fullFeatureName);
};

/**
 * Get all features available to a tier
 * @param {string} tier - Subscription tier
 * @returns {Array} Array of available features
 */
export const getAvailableFeatures = (tier) => {
  const config = getTierConfig(tier);
  return Object.keys(config.features).filter(feature => config.features[feature]);
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
  const currentConfig = getTierConfig(currentTier);
  const recommendations = [];

  // Check each limit type
  Object.keys(currentConfig.limits).forEach(limitType => {
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
      const nextConfig = getTierConfig(nextTier);

      recommendations.push({
        type: 'upgrade_suggestion',
        suggestedTier: nextTier,
        tierName: nextConfig.name,
        price: nextConfig.price,
        message: `Upgrade to ${nextConfig.name} for increased limits and more features`
      });
    }
  }

  return {
    hasRecommendations: recommendations.length > 0,
    recommendations,
    currentTier,
    currentTierName: currentConfig.name
  };
};

export default {
  SUBSCRIPTION_TIERS,
  FEATURES,
  TIER_CONFIG,
  getTierConfig,
  getTierLimits,
  hasFeatureAccess,
  canAccessCommunityFeature,
  getAvailableFeatures,
  checkLimit,
  getUpgradeRecommendations
};