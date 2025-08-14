// config/subscription/permissions.js - Feature permissions by tier
import { SUBSCRIPTION_TIERS } from './constants.js';
import { FEATURES, FEATURE_DEFINITIONS } from './features.js';

export const TIER_PERMISSIONS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    [FEATURES.PAINTS]: true,
    [FEATURES.PROJECTS]: true,
    [FEATURES.PHOTOS]: true,
    [FEATURES.COMMUNITY_READ]: true,
    [FEATURES.COMMUNITY_POST]: false,
    [FEATURES.COMMUNITY_COMMENT]: false,
    [FEATURES.COMMUNITY_LIKE]: false,
    [FEATURES.COMMUNITY_MESSAGE]: false,
    [FEATURES.COMMUNITY_CREATE_GROUPS]: false,
    [FEATURES.ADVANCED_ANALYTICS]: false,
    [FEATURES.EXPORT_DATA]: false,
    [FEATURES.PRIORITY_SUPPORT]: false
  },
  [SUBSCRIPTION_TIERS.CASUAL]: {
    [FEATURES.PAINTS]: true,
    [FEATURES.PROJECTS]: true,
    [FEATURES.PHOTOS]: true,
    [FEATURES.COMMUNITY_READ]: true,
    [FEATURES.COMMUNITY_POST]: true,
    [FEATURES.COMMUNITY_COMMENT]: true,
    [FEATURES.COMMUNITY_LIKE]: true,
    [FEATURES.COMMUNITY_MESSAGE]: false,
    [FEATURES.COMMUNITY_CREATE_GROUPS]: false,
    [FEATURES.ADVANCED_ANALYTICS]: false,
    [FEATURES.EXPORT_DATA]: true,
    [FEATURES.PRIORITY_SUPPORT]: false
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    [FEATURES.PAINTS]: true,
    [FEATURES.PROJECTS]: true,
    [FEATURES.PHOTOS]: true,
    [FEATURES.COMMUNITY_READ]: true,
    [FEATURES.COMMUNITY_POST]: true,
    [FEATURES.COMMUNITY_COMMENT]: true,
    [FEATURES.COMMUNITY_LIKE]: true,
    [FEATURES.COMMUNITY_MESSAGE]: true,
    [FEATURES.COMMUNITY_CREATE_GROUPS]: true,
    [FEATURES.ADVANCED_ANALYTICS]: true,
    [FEATURES.EXPORT_DATA]: true,
    [FEATURES.PRIORITY_SUPPORT]: false
  },
  [SUBSCRIPTION_TIERS.BATTLE]: {
    [FEATURES.PAINTS]: true,
    [FEATURES.PROJECTS]: true,
    [FEATURES.PHOTOS]: true,
    [FEATURES.COMMUNITY_READ]: true,
    [FEATURES.COMMUNITY_POST]: true,
    [FEATURES.COMMUNITY_COMMENT]: true,
    [FEATURES.COMMUNITY_LIKE]: true,
    [FEATURES.COMMUNITY_MESSAGE]: true,
    [FEATURES.COMMUNITY_CREATE_GROUPS]: true,
    [FEATURES.ADVANCED_ANALYTICS]: true,
    [FEATURES.EXPORT_DATA]: true,
    [FEATURES.PRIORITY_SUPPORT]: true
  }
};

/**
 * Check if user has access to a feature
 * @param {string} tier - User's subscription tier
 * @param {string} feature - Feature to check
 * @returns {boolean} Whether user has access
 */
export const hasFeatureAccess = (tier, feature) => {
  const permissions = TIER_PERMISSIONS[tier] || TIER_PERMISSIONS[SUBSCRIPTION_TIERS.FREE];
  return permissions[feature] === true;
};

/**
 * Check if user can access community features
 * @param {string} tier - User's subscription tier
 * @param {string} feature - Community feature to check
 * @returns {boolean} Whether user has access
 */
export const canAccessCommunityFeature = (tier, feature) => {
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
  const permissions = TIER_PERMISSIONS[tier] || TIER_PERMISSIONS[SUBSCRIPTION_TIERS.FREE];
  return Object.keys(permissions).filter(feature => permissions[feature]);
};

/**
 * Get features by category for a tier
 * @param {string} tier - Subscription tier
 * @param {string} category - Feature category
 * @returns {Array} Array of available features in category
 */
export const getFeaturesByCategory = (tier, category) => {
  const availableFeatures = getAvailableFeatures(tier);

  return availableFeatures.filter(feature =>
    FEATURE_DEFINITIONS[feature]?.category === category
  );
};