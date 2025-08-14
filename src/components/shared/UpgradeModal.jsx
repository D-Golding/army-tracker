// components/shared/UpgradeModal.jsx
import React from 'react';
import { X, Zap, ArrowRight, CheckCircle, Crown, Trophy, Star } from 'lucide-react';
import {
  SUBSCRIPTION_TIERS,
  getTierLimits,
  getTierConfig,
  getCurrencyInfo,
  formatPrice
} from '../../config/subscription';

const UpgradeModal = ({
  isOpen,
  onClose,
  currentTier,
  limitType,
  customTitle,
  customMessage,
  upgradeUrl = '/upgrade'
}) => {
  if (!isOpen) return null;

  // Get next tier in the progression
  const getNextTier = (tier) => {
    const tierOrder = [
      SUBSCRIPTION_TIERS.FREE,
      SUBSCRIPTION_TIERS.CASUAL,
      SUBSCRIPTION_TIERS.PRO,
      SUBSCRIPTION_TIERS.BATTLE
    ];

    const currentIndex = tierOrder.indexOf(tier);
    if (currentIndex < tierOrder.length - 1) {
      return tierOrder[currentIndex + 1];
    }
    return null; // Already at highest tier
  };

  const nextTier = getNextTier(currentTier);
  const currentLimits = getTierLimits(currentTier);
  const nextLimits = nextTier ? getTierLimits(nextTier) : null;
  const currentTierConfig = getTierConfig(currentTier);
  const nextTierConfig = nextTier ? getTierConfig(nextTier) : null;
  const { symbol: currencySymbol } = getCurrencyInfo();

  // Get the appropriate icon for the next tier
  const getTierIcon = (tier) => {
    const config = getTierConfig(tier);
    const IconComponent = config.icon;
    const colorMap = {
      'casual': 'text-blue-500',
      'pro': 'text-purple-500',
      'battle': 'text-amber-500',
      'free': 'text-gray-500'
    };

    return <IconComponent size={20} className={colorMap[tier] || 'text-gray-500'} />;
  };

  // Generate comparison data based on limit type
  const getComparisonData = () => {
    const comparisons = {
      paints: {
        title: 'Paint Tracking Limit Reached',
        description: 'You\'ve reached your paint collection limit. Upgrade to track more paints and unlock additional features.',
        currentValue: currentLimits.paints,
        nextValue: nextLimits?.paints,
        unit: 'paints'
      },
      projects: {
        title: 'Project Limit Reached',
        description: 'You\'ve reached your project limit. Upgrade to manage more projects simultaneously.',
        currentValue: currentLimits.projects,
        nextValue: nextLimits?.projects,
        unit: 'projects'
      },
      photosPerProject: {
        title: 'Photo Limit Reached',
        description: 'You\'ve reached the photo limit for this project. Upgrade to add more photos per project.',
        currentValue: currentLimits.photosPerProject,
        nextValue: nextLimits?.photosPerProject,
        unit: 'photos per project'
      },
      achievementHistory: {
        title: 'Achievement History Limit Reached',
        description: 'You\'ve reached your achievement history limit. Upgrade to keep more achievement data.',
        currentValue: currentLimits.achievementHistory === -1 ? 'Unlimited' : `${currentLimits.achievementHistory} days`,
        nextValue: nextLimits?.achievementHistory === -1 ? 'Unlimited' : `${nextLimits?.achievementHistory} days`,
        unit: ''
      }
    };

    return comparisons[limitType] || {
      title: 'Upgrade Required',
      description: 'You\'ve reached a limit on your current plan. Upgrade to unlock more features.',
      currentValue: null,
      nextValue: null,
      unit: ''
    };
  };

  // Get comprehensive feature comparison based on actual tier configs
  const getFeatureComparison = () => {
    const features = [
      {
        category: 'Core Features',
        items: [
          { name: 'Paint inventory slots', current: currentLimits.paints, next: nextLimits?.paints },
          { name: 'Project tracking', current: currentLimits.projects, next: nextLimits?.projects },
          { name: 'Photos per project', current: currentLimits.photosPerProject, next: nextLimits?.photosPerProject },
          { name: 'Achievement history', current: currentLimits.achievementHistory === -1 ? 'Unlimited' : `${currentLimits.achievementHistory} days`, next: nextLimits?.achievementHistory === -1 ? 'Unlimited' : `${nextLimits?.achievementHistory} days` }
        ]
      }
    ];

    // Add community features if they differ
    if (nextTierConfig) {
      const communityFeatures = [];

      // Check community feature differences
      if (!currentTierConfig.features.communityPost && nextTierConfig.features.communityPost) {
        communityFeatures.push({ name: 'Share your projects', current: '✗', next: '✓' });
      }
      if (!currentTierConfig.features.communityComment && nextTierConfig.features.communityComment) {
        communityFeatures.push({ name: 'Comment on posts', current: '✗', next: '✓' });
      }
      if (!currentTierConfig.features.communityLike && nextTierConfig.features.communityLike) {
        communityFeatures.push({ name: 'Like community posts', current: '✗', next: '✓' });
      }
      if (!currentTierConfig.features.communityMessage && nextTierConfig.features.communityMessage) {
        communityFeatures.push({ name: 'Direct messaging', current: '✗', next: '✓' });
      }
      if (!currentTierConfig.features.communityCreateGroups && nextTierConfig.features.communityCreateGroups) {
        communityFeatures.push({ name: 'Create hobby groups', current: '✗', next: '✓' });
      }

      if (communityFeatures.length > 0) {
        features.push({
          category: 'Community Features',
          items: communityFeatures
        });
      }
    }

    // Add advanced features for higher tiers
    if (nextTier === 'pro' || nextTier === 'battle') {
      const advancedFeatures = [];

      if (!currentTierConfig.features.advancedAnalytics && nextTierConfig?.features.advancedAnalytics) {
        advancedFeatures.push({ name: 'Advanced analytics', current: '✗', next: '✓' });
      }
      if (!currentTierConfig.features.exportData && nextTierConfig?.features.exportData) {
        advancedFeatures.push({ name: 'Data export', current: '✗', next: '✓' });
      }
      if (!currentTierConfig.features.prioritySupport && nextTierConfig?.features.prioritySupport) {
        advancedFeatures.push({ name: 'Priority support', current: '✗', next: '✓' });
      }

      if (advancedFeatures.length > 0) {
        features.push({
          category: 'Advanced Features',
          items: advancedFeatures
        });
      }
    }

    return features;
  };

  const comparison = getComparisonData();
  const title = customTitle || comparison.title;
  const message = customMessage || comparison.description;
  const featureComparison = getFeatureComparison();

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle upgrade button click
  const handleUpgrade = () => {
    window.location.href = upgradeUrl;
  };

  if (!nextTier) {
    // User is already on the highest tier
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Maximum Tier Reached
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
            >
              <X size={20} />
            </button>
          </div>

          <div className="text-center py-8">
            <Trophy className="mx-auto mb-4 text-amber-500" size={48} />
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You're already on our highest tier! If you need additional capacity, please contact support.
            </p>
            <button
              onClick={onClose}
              className="btn-primary btn-md"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {getTierIcon(nextTier)}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upgrade to {nextTierConfig.name} for {nextTierConfig.priceDisplay}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* Quick Tier Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Current Tier */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {currentTierConfig.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Current Plan
              </div>
              {comparison.currentValue && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {comparison.currentValue}
                </div>
              )}
              {comparison.unit && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {comparison.unit}
                </div>
              )}
            </div>
          </div>

          {/* Upgrade Tier */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white mb-1 flex items-center justify-center">
                <Star size={16} className="text-indigo-500 mr-1" />
                {nextTierConfig.name}
              </div>
              <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                {nextTierConfig.priceDisplay}
              </div>
              {comparison.nextValue && (
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {comparison.nextValue}
                </div>
              )}
              {comparison.unit && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {comparison.unit}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Feature Comparison */}
        <div className="space-y-6 mb-8">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Everything you'll get with {nextTierConfig.name}:
          </h4>

          {featureComparison.map((category, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                {category.category}
              </h5>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        {typeof item.current === 'boolean' ? (item.current ? '✓' : '✗') : item.current}
                      </span>
                      <ArrowRight size={12} className="text-gray-400" />
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {typeof item.next === 'boolean' ? (item.next ? '✓' : '✗') : item.next}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Benefits */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
          <h4 className="font-medium text-green-800 dark:text-green-300 mb-3 flex items-center">
            <CheckCircle size={16} className="mr-2" />
            Plus these exclusive benefits:
          </h4>
          <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
            <li>• Priority customer support</li>
            <li>• Access to new features first</li>
            <li>• Enhanced community features</li>
            <li>• No ads across the platform</li>
            {nextTier === 'battle' && (
              <>
                <li>• Exclusive army tracking tools</li>
                <li>• Advanced battle report system</li>
                <li>• Premium community badge</li>
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="btn-tertiary btn-lg flex-1"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgrade}
            className="btn-primary btn-lg flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Zap size={16} />
            Upgrade to {nextTierConfig.name}
          </button>
        </div>

        {/* Small print */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Cancel anytime • Instant access • 30-day money-back guarantee
        </p>
      </div>
    </div>
  );
};

export default UpgradeModal;