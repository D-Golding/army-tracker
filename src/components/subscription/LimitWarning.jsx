// components/subscription/LimitWarning.jsx
import React from 'react';
import { AlertTriangle, Crown, X } from 'lucide-react';
import useSubscription from '../../hooks/useSubscription';

const LimitWarning = ({ type, onClose, onUpgrade }) => {
  const {
    hasReachedLimit,
    getUsagePercentage,
    getRemainingAllowance,
    getUpgradeMessage,
    currentTier,
    usage,
    limits
  } = useSubscription();

  const isAtLimit = hasReachedLimit(type);
  const usagePercent = getUsagePercentage(type);
  const remaining = getRemainingAllowance(type);
  const isNearLimit = usagePercent >= 80;

  // Don't show if user hasn't reached 80% of limit and isn't at limit
  if (!isNearLimit && !isAtLimit) {
    return null;
  }

  // Don't show for battle ready tier (unlimited-ish)
  if (currentTier === 'battle') {
    return null;
  }

  const getWarningContent = () => {
    if (isAtLimit) {
      return {
        title: `${type === 'paints' ? 'Paint' : 'Project'} Limit Reached`,
        message: getUpgradeMessage(type),
        color: 'red',
        icon: AlertTriangle
      };
    } else {
      return {
        title: `Approaching ${type === 'paints' ? 'Paint' : 'Project'} Limit`,
        message: `You have ${remaining} ${type === 'paints' ? 'paint slots' : 'project slots'} remaining.`,
        color: 'amber',
        icon: AlertTriangle
      };
    }
  };

  const { title, message, color, icon: Icon } = getWarningContent();

  const colorClasses = {
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-300',
      button: 'bg-red-600 hover:bg-red-700'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-800 dark:text-amber-300',
      button: 'bg-amber-600 hover:bg-amber-700'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`${colors.text} mt-0.5`} size={20} />

        <div className="flex-1">
          <h4 className={`font-semibold ${colors.text} mb-1`}>
            {title}
          </h4>

          <p className={`text-sm ${colors.text} mb-3`}>
            {message}
          </p>

          {/* Usage Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className={colors.text}>
                Usage: {usage[type]} / {limits[type]}
              </span>
              <span className={colors.text}>
                {Math.round(usagePercent)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isAtLimit ? 'bg-red-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, usagePercent)}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isAtLimit && (
              <button
                onClick={onUpgrade}
                className={`${colors.button} text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
              >
                <Crown size={14} />
                Upgrade Now
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={`${colors.text} hover:opacity-70 transition-opacity`}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LimitWarning;