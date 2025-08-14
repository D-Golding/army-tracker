// components/dashboard/Gamification/StatCard.jsx
import React from 'react';

const StatCard = ({ label, value, icon, color, description, className = '' }) => {
  const colorClasses = {
    blue: {
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      value: 'text-blue-600 dark:text-blue-400'
    },
    emerald: {
      border: 'border-emerald-200 dark:border-emerald-800',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      value: 'text-emerald-600 dark:text-emerald-400'
    },
    purple: {
      border: 'border-purple-200 dark:border-purple-800',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      value: 'text-purple-600 dark:text-purple-400'
    },
    amber: {
      border: 'border-amber-200 dark:border-amber-800',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      value: 'text-amber-600 dark:text-amber-400'
    },
    pink: {
      border: 'border-pink-200 dark:border-pink-800',
      bg: 'bg-pink-50 dark:bg-pink-900/20',
      value: 'text-pink-600 dark:text-pink-400'
    },
    indigo: {
      border: 'border-indigo-200 dark:border-indigo-800',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      value: 'text-indigo-600 dark:text-indigo-400'
    },
    gray: {
      border: 'border-gray-200 dark:border-gray-700',
      bg: 'bg-gray-50 dark:bg-gray-800',
      value: 'text-gray-600 dark:text-gray-400'
    }
  };

  const classes = colorClasses[color] || colorClasses.gray;

  return (
    <div className={`border-2 rounded-xl p-4 ${classes.border} ${classes.bg} ${className}`}>

      {/* Icon and Value */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl">{icon}</div>
        <div className={`text-2xl font-bold ${classes.value}`}>
          {value?.toLocaleString() || 0}
        </div>
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
        {label}
      </div>

      {/* Description */}
      <div className="text-xs text-gray-600 dark:text-gray-400">
        {description}
      </div>
    </div>
  );
};

export default StatCard;