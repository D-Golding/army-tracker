// services/shared/tierHelpers.js - Tier limit checking and capabilities
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { getCurrentUserId } from './userHelpers.js';

// Define tier limits (centralized from multiple files)
export const TIER_LIMITS = {
  free: {
    paints: 25,
    projects: 5,
    photosPerProject: 10,
    stepsPerProject: 15
  },
  casual: {
    paints: 150,
    projects: 25,
    photosPerProject: 50,
    stepsPerProject: 50
  },
  pro: {
    paints: 300,
    projects: 100,
    photosPerProject: 100,
    stepsPerProject: 100
  },
  battle: {
    paints: 1000,
    projects: 500,
    photosPerProject: 200,
    stepsPerProject: 200
  }
};

// Tier priority for comparisons
export const TIER_PRIORITY = {
  free: 0,
  casual: 1,
  pro: 2,
  battle: 3
};

/**
 * Get user's current tier
 * @param {string} userId - Optional user ID, uses current user if not provided
 * @returns {Promise<string>} User's tier (free, casual, pro, battle)
 */
export const getUserTier = async (userId = null) => {
  try {
    const uid = userId || getCurrentUserId();
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      return 'free'; // Default tier
    }

    const userProfile = userDoc.data();
    return userProfile.subscription?.tier || 'free';
  } catch (error) {
    console.error('Error getting user tier:', error);
    return 'free'; // Default on error
  }
};

/**
 * Get tier capabilities/limits
 * @param {string} tier - Tier name (free, casual, pro, battle)
 * @returns {Object} Tier limits and capabilities
 */
export const getTierCapabilities = (tier) => {
  return TIER_LIMITS[tier] || TIER_LIMITS.free;
};

/**
 * Check if user can perform action based on tier limits
 * @param {string} limitType - Type of limit to check (paints, projects, etc.)
 * @param {number} currentCount - Current count of items
 * @param {string} userId - Optional user ID, uses current user if not provided
 * @returns {Promise<Object>} Check result with limit info
 */
export const checkTierLimit = async (limitType, currentCount, userId = null) => {
  try {
    const userTier = await getUserTier(userId);
    const capabilities = getTierCapabilities(userTier);
    const limit = capabilities[limitType];

    if (!limit) {
      return {
        canPerform: true,
        currentCount,
        limit: null,
        remaining: null,
        tier: userTier,
        error: null
      };
    }

    const canPerform = currentCount < limit;
    const remaining = limit - currentCount;

    return {
      canPerform,
      currentCount,
      limit,
      remaining: Math.max(0, remaining),
      tier: userTier,
      error: canPerform ? null : `${limitType} limit reached! You can have up to ${limit} ${limitType} on the ${userTier} tier. Upgrade your subscription to add more.`
    };

  } catch (error) {
    console.error('Error checking tier limit:', error);
    return {
      canPerform: false,
      currentCount,
      limit: null,
      remaining: null,
      tier: 'free',
      error: 'Error checking tier limits'
    };
  }
};

/**
 * Validate tier access (throw error if limit exceeded)
 * @param {string} limitType - Type of limit to check
 * @param {number} currentCount - Current count of items
 * @param {string} userId - Optional user ID, uses current user if not provided
 * @throws {Error} If limit would be exceeded
 */
export const validateTierAccess = async (limitType, currentCount, userId = null) => {
  const limitCheck = await checkTierLimit(limitType, currentCount, userId);

  if (!limitCheck.canPerform && limitCheck.error) {
    throw new Error(limitCheck.error);
  }

  return limitCheck;
};

/**
 * Compare two tiers
 * @param {string} tier1 - First tier
 * @param {string} tier2 - Second tier
 * @returns {number} -1 if tier1 < tier2, 0 if equal, 1 if tier1 > tier2
 */
export const compareTiers = (tier1, tier2) => {
  const priority1 = TIER_PRIORITY[tier1] || 0;
  const priority2 = TIER_PRIORITY[tier2] || 0;

  if (priority1 < priority2) return -1;
  if (priority1 > priority2) return 1;
  return 0;
};

/**
 * Check if tier1 is higher than or equal to tier2
 * @param {string} tier1 - First tier
 * @param {string} tier2 - Second tier
 * @returns {boolean} Whether tier1 >= tier2
 */
export const isTierSufficient = (tier1, tier2) => {
  return compareTiers(tier1, tier2) >= 0;
};

/**
 * Get upgrade suggestions based on current usage
 * @param {Object} currentUsage - Object with usage counts {paints: 20, projects: 3, etc.}
 * @param {string} userId - Optional user ID, uses current user if not provided
 * @returns {Promise<Object>} Upgrade suggestions
 */
export const getUpgradeSuggestions = async (currentUsage, userId = null) => {
  try {
    const userTier = await getUserTier(userId);
    const currentCapabilities = getTierCapabilities(userTier);

    const suggestions = {
      currentTier: userTier,
      needsUpgrade: false,
      blockedLimits: [],
      recommendedTier: userTier,
      nextTierBenefits: {}
    };

    // Check which limits are being hit
    Object.keys(currentUsage).forEach(limitType => {
      const usage = currentUsage[limitType];
      const limit = currentCapabilities[limitType];

      if (limit && usage >= limit) {
        suggestions.needsUpgrade = true;
        suggestions.blockedLimits.push(limitType);
      }
    });

    // Find minimum tier that would accommodate usage
    if (suggestions.needsUpgrade) {
      const tiers = ['casual', 'pro', 'battle'];
      for (const tier of tiers) {
        const tierCapabilities = getTierCapabilities(tier);
        const wouldFit = Object.keys(currentUsage).every(limitType => {
          const usage = currentUsage[limitType];
          const limit = tierCapabilities[limitType];
          return !limit || usage < limit;
        });

        if (wouldFit && compareTiers(tier, userTier) > 0) {
          suggestions.recommendedTier = tier;
          suggestions.nextTierBenefits = tierCapabilities;
          break;
        }
      }
    }

    return suggestions;

  } catch (error) {
    console.error('Error getting upgrade suggestions:', error);
    return {
      currentTier: 'free',
      needsUpgrade: false,
      blockedLimits: [],
      recommendedTier: 'free',
      nextTierBenefits: {},
      error: error.message
    };
  }
};