// config/subscription/tiers.js - Complete tier configurations
import { Check, Crown, Zap, Trophy } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from './constants.js';
import { DEFAULT_LIMITS } from './limits.js';
import { TIER_PERMISSIONS } from './permissions.js';
import { formatPrice } from './currency.js';

export const TIER_CONFIG = {
  [SUBSCRIPTION_TIERS.FREE]: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: formatPrice(0),
    period: 'forever',
    icon: Check,
    color: 'tier-free',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
    popular: false,
    limits: DEFAULT_LIMITS[SUBSCRIPTION_TIERS.FREE],
    features: TIER_PERMISSIONS[SUBSCRIPTION_TIERS.FREE],
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
    priceDisplay: formatPrice(4.99),
    period: 'per year',
    icon: Zap,
    color: 'tier-casual',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    popular: true,
    limits: DEFAULT_LIMITS[SUBSCRIPTION_TIERS.CASUAL],
    features: TIER_PERMISSIONS[SUBSCRIPTION_TIERS.CASUAL],
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
    priceDisplay: formatPrice(9.99),
    period: 'per year',
    icon: Crown,
    color: 'tier-pro',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-900',
    popular: false,
    limits: DEFAULT_LIMITS[SUBSCRIPTION_TIERS.PRO],
    features: TIER_PERMISSIONS[SUBSCRIPTION_TIERS.PRO],
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
    priceDisplay: formatPrice(14.99),
    period: 'per year',
    icon: Trophy,
    color: 'tier-battle',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-900',
    popular: false,
    limits: DEFAULT_LIMITS[SUBSCRIPTION_TIERS.BATTLE],
    features: TIER_PERMISSIONS[SUBSCRIPTION_TIERS.BATTLE],
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

/**
 * Get tier configuration
 * @param {string} tier - Subscription tier
 * @returns {Object} Tier configuration
 */
export const getTierConfig = (tier) => {
  return TIER_CONFIG[tier] || TIER_CONFIG[SUBSCRIPTION_TIERS.FREE];
};

// Compatibility export for existing usage
export const tiers = Object.values(TIER_CONFIG);