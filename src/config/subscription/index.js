// config/subscription/index.js - Main export file for subscription system
// This provides a clean, organized API for all subscription features

// Export everything from all modules
export * from './constants.js';
export * from './features.js';
export * from './currency.js';
export * from './limits.js';
export * from './permissions.js';
export * from './tiers.js';

// Re-export commonly used items for convenience
export { tiers as default } from './tiers.js';

// Export grouped objects for easier imports
export {
  SUBSCRIPTION_TIERS,
  FEATURE_CATEGORIES
} from './constants.js';

export {
  FEATURES,
  FEATURE_DEFINITIONS
} from './features.js';

export {
  getCurrencyInfo,
  formatPrice
} from './currency.js';

export {
  DEFAULT_LIMITS,
  getTierLimits,
  checkLimit,
  getUpgradeRecommendations
} from './limits.js';

export {
  TIER_PERMISSIONS,
  hasFeatureAccess,
  canAccessCommunityFeature,
  getAvailableFeatures,
  getFeaturesByCategory
} from './permissions.js';

export {
  TIER_CONFIG,
  getTierConfig,
  tiers
} from './tiers.js';