// config/subscriptionConfig.js - Complete subscription tier configuration with dynamic pricing
// This centralizes all subscription limits and features across the app

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  CASUAL: 'casual',
  PRO: 'pro',
  BATTLE: 'battle'
};

export const TIER_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    // Core limits
    paints: 25,
    projects: 3,

    // Project-specific limits
    photosPerProject: 3,
    stepsPerProject: 5,
    paintAssignmentsPerProject: 10,
    notesPerProject: 5,

    // Features
    communityAccess: true,
    paintCatalog: 'basic',

    // Exclusive features
    armyTracker: false,
    battleReports: false,
    projectSharing: false,
    projectLikes: false,
    projectComments: false
  },

  [SUBSCRIPTION_TIERS.CASUAL]: {
    // Core limits
    paints: 150,
    projects: 10,

    // Project-specific limits
    photosPerProject: 10,
    stepsPerProject: 15,
    paintAssignmentsPerProject: 30,
    notesPerProject: 15,

    // Features
    communityAccess: true,
    paintCatalog: 'full',
    projectSharing: true,
    projectLikes: true,
    projectComments: true,

    // Exclusive features
    armyTracker: false,
    battleReports: false
  },

  [SUBSCRIPTION_TIERS.PRO]: {
    // Core limits
    paints: 300,
    projects: 25,

    // Project-specific limits
    photosPerProject: 30,
    stepsPerProject: 50,
    paintAssignmentsPerProject: 100,
    notesPerProject: 50,

    // Features
    communityAccess: true,
    paintCatalog: 'full',
    projectSharing: true,
    projectLikes: true,
    projectComments: true,

    // Exclusive features
    armyTracker: false,
    battleReports: false
  },

  [SUBSCRIPTION_TIERS.BATTLE]: {
    // Core limits
    paints: 1000,
    projects: 50,

    // Project-specific limits
    photosPerProject: 50,
    stepsPerProject: 100,
    paintAssignmentsPerProject: 250,
    notesPerProject: 100,

    // Features
    communityAccess: true,
    paintCatalog: 'full',
    projectSharing: true,
    projectLikes: true,
    projectComments: true,

    // Exclusive features - Battle Ready only
    armyTracker: true,
    battleReports: true
  }
};

// Base pricing in EUR
const BASE_PRICING_EUR = {
  [SUBSCRIPTION_TIERS.FREE]: 0,
  [SUBSCRIPTION_TIERS.CASUAL]: 4.99,
  [SUBSCRIPTION_TIERS.PRO]: 9.99,
  [SUBSCRIPTION_TIERS.BATTLE]: 14.99
};

// Currency conversion rates and symbols
const CURRENCY_CONFIG = {
  EUR: {
    symbol: '€',
    multiplier: 1.0, // Base currency
    countries: ['AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES'],
    timezones: ['Europe/Berlin', 'Europe/Paris', 'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna', 'Europe/Zurich']
  },
  GBP: {
    symbol: '£',
    multiplier: 1.0, // Same as EUR
    countries: ['GB'],
    timezones: ['Europe/London']
  },
  USD: {
    symbol: '$',
    multiplier: 1.0, // Will be calculated to rounded .99 endings
    isDefault: true // Default currency for rest of world
  }
};

// Currency detection function
const detectUserCurrency = () => {
  try {
    const userLocale = navigator.language || 'en-US';
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Extract country code from locale (e.g., 'en-GB' -> 'GB')
    const countryCode = userLocale.includes('-') ? userLocale.split('-')[1] : null;

    // Check for EUR
    if (countryCode && CURRENCY_CONFIG.EUR.countries.includes(countryCode)) {
      return 'EUR';
    }

    if (CURRENCY_CONFIG.EUR.timezones.some(tz => userTimezone.includes(tz.split('/')[1]))) {
      return 'EUR';
    }

    // Check for GBP
    if (countryCode === 'GB' || userTimezone.includes('London')) {
      return 'GBP';
    }

    // Default to USD for everyone else
    return 'USD';
  } catch (error) {
    console.error('Error detecting currency:', error);
    return 'USD'; // Default fallback
  }
};

// Calculate pricing for different currencies
const calculateTierPricing = (currency) => {
  const pricing = {};

  Object.keys(BASE_PRICING_EUR).forEach(tier => {
    const basePrice = BASE_PRICING_EUR[tier];

    if (basePrice === 0) {
      pricing[tier] = {
        price: 0,
        period: 'forever',
        displayPrice: 'Free',
        symbol: CURRENCY_CONFIG[currency].symbol
      };
    } else {
      let finalPrice;

      if (currency === 'EUR' || currency === 'GBP') {
        finalPrice = basePrice; // Same price for EUR and GBP
      } else {
        // USD - convert and round to .99 endings
        const convertedPrice = basePrice * 1.1; // Approximate conversion rate
        if (convertedPrice <= 5.5) finalPrice = 5.99;
        else if (convertedPrice <= 11) finalPrice = 10.99;
        else finalPrice = 16.99;
      }

      pricing[tier] = {
        price: finalPrice,
        period: 'year',
        displayPrice: `${CURRENCY_CONFIG[currency].symbol}${finalPrice.toFixed(2)}/year`,
        symbol: CURRENCY_CONFIG[currency].symbol
      };
    }
  });

  return pricing;
};

// Dynamic pricing getter
export const getTierPricing = (tier, currency = null) => {
  const detectedCurrency = currency || detectUserCurrency();
  const pricing = calculateTierPricing(detectedCurrency);
  return pricing[tier] || pricing[SUBSCRIPTION_TIERS.FREE];
};

// Get all tier pricing for a currency
export const getAllTierPricing = (currency = null) => {
  const detectedCurrency = currency || detectUserCurrency();
  return calculateTierPricing(detectedCurrency);
};

// Get currency info
export const getCurrencyInfo = (currency = null) => {
  const detectedCurrency = currency || detectUserCurrency();
  return {
    currency: detectedCurrency,
    symbol: CURRENCY_CONFIG[detectedCurrency].symbol
  };
};

export const TIER_DISPLAY_NAMES = {
  [SUBSCRIPTION_TIERS.FREE]: 'Free',
  [SUBSCRIPTION_TIERS.CASUAL]: 'Casual Hobbyist',
  [SUBSCRIPTION_TIERS.PRO]: 'Pro',
  [SUBSCRIPTION_TIERS.BATTLE]: 'Battle Ready'
};

export const TIER_DESCRIPTIONS = {
  [SUBSCRIPTION_TIERS.FREE]: 'Perfect for getting started with miniature painting',
  [SUBSCRIPTION_TIERS.CASUAL]: 'Great for hobbyists with multiple projects',
  [SUBSCRIPTION_TIERS.PRO]: 'Professional features for serious painters',
  [SUBSCRIPTION_TIERS.BATTLE]: 'Complete toolkit with army tracking and battle reports'
};

export const TIER_ICONS = {
  [SUBSCRIPTION_TIERS.FREE]: 'check-circle',
  [SUBSCRIPTION_TIERS.CASUAL]: 'zap',
  [SUBSCRIPTION_TIERS.PRO]: 'crown',
  [SUBSCRIPTION_TIERS.BATTLE]: 'trophy'
};

export const TIER_COLORS = {
  [SUBSCRIPTION_TIERS.FREE]: 'gray',
  [SUBSCRIPTION_TIERS.CASUAL]: 'blue',
  [SUBSCRIPTION_TIERS.PRO]: 'purple',
  [SUBSCRIPTION_TIERS.BATTLE]: 'amber'
};

// Helper functions
export const getTierLimits = (tier) => {
  return TIER_LIMITS[tier] || TIER_LIMITS[SUBSCRIPTION_TIERS.FREE];
};

export const getTierDisplayName = (tier) => {
  return TIER_DISPLAY_NAMES[tier] || 'Unknown';
};

export const getNextTier = (currentTier) => {
  const tiers = Object.values(SUBSCRIPTION_TIERS);
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
};

export const canAccessFeature = (tier, feature) => {
  const limits = getTierLimits(tier);
  return limits[feature] === true;
};

export const isWithinLimit = (tier, limitType, currentUsage, projectData = null) => {
  const limits = getTierLimits(tier);

  switch (limitType) {
    case 'paints':
      return currentUsage < limits.paints;
    case 'projects':
      return currentUsage < limits.projects;
    case 'photosPerProject':
      if (projectData) {
        const projectPhotos = (projectData.photoURLs?.length || 0) +
                             (projectData.photos?.gallery?.length || 0);
        return projectPhotos < limits.photosPerProject;
      }
      return true;
    case 'stepsPerProject':
      if (projectData) {
        const projectSteps = projectData.steps?.length || 0;
        return projectSteps < limits.stepsPerProject;
      }
      return true;
    case 'paintAssignmentsPerProject':
      if (projectData) {
        let projectAssignments = 0;
        if (projectData.steps) {
          projectData.steps.forEach(step => {
            projectAssignments += step.paints?.length || 0;
          });
        }
        return projectAssignments < limits.paintAssignmentsPerProject;
      }
      return true;
    case 'notesPerProject':
      if (projectData) {
        const projectNotes = projectData.projectNotes?.length || 0;
        return projectNotes < limits.notesPerProject;
      }
      return true;
    default:
      return true;
  }
};

export default {
  SUBSCRIPTION_TIERS,
  TIER_LIMITS,
  TIER_DISPLAY_NAMES,
  TIER_DESCRIPTIONS,
  TIER_ICONS,
  TIER_COLORS,
  getTierLimits,
  getTierDisplayName,
  getTierPricing,
  getAllTierPricing,
  getCurrencyInfo,
  getNextTier,
  canAccessFeature,
  isWithinLimit,
  detectUserCurrency
};