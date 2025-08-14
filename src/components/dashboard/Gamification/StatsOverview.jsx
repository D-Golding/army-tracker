// components/dashboard/Gamification/StatsOverview.jsx
import React from 'react';
import { useUserStatistics } from '../../../hooks/useGamification';
import StatCard from './StatCard';

const StatsOverview = ({ className = '' }) => {
  const { statistics, isLoading, error } = useUserStatistics();

  if (isLoading) {
    return (
      <div className={`card-base card-padding ${className}`}>
        <div className="text-center py-8">
          <div className="loading-spinner-primary mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">Loading statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card-base card-padding ${className}`}>
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          Failed to load statistics
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Projects Created',
      value: statistics.projectsCreated,
      icon: '🎯',
      color: 'blue',
      description: 'Total projects started'
    },
    {
      label: 'Projects Completed',
      value: statistics.projectsCompleted,
      icon: '✅',
      color: 'emerald',
      description: 'Finished projects'
    },
    {
      label: 'Steps Created',
      value: statistics.totalSteps,
      icon: '📝',
      color: 'purple',
      description: 'Total painting steps'
    },
    {
      label: 'Photos Taken',
      value: statistics.totalPhotos,
      icon: '📸',
      color: 'amber',
      description: 'Progress photos captured'
    },
    {
      label: 'Unique Paints Used',
      value: statistics.uniquePaintsUsed,
      icon: '🎨',
      color: 'pink',
      description: 'Different paints in projects'
    },
    {
      label: 'Brands Explored',
      value: statistics.uniqueBrandsUsed,
      icon: '🏷️',
      color: 'indigo',
      description: 'Paint brands tried'
    }
  ];

  // Calculate completion rate
  const completionRate = statistics.projectsCreated > 0
    ? Math.round((statistics.projectsCompleted / statistics.projectsCreated) * 100)
    : 0;

  return (
    <div className={`card-base card-padding ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Lifetime Statistics
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your painting journey so far
          </p>
        </div>

        {/* Completion Rate Badge */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            completionRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
            completionRate >= 50 ? 'text-amber-600 dark:text-amber-400' :
            'text-gray-600 dark:text-gray-400'
          }`}>
            {completionRate}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Completion Rate
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            description={stat.description}
          />
        ))}
      </div>

      {/* Visual Progress Indicators */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Progress Breakdown
        </h3>

        <div className="space-y-3">

          {/* Project Completion */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Project Completion</span>
              <span className="text-gray-800 dark:text-gray-200">
                {statistics.projectsCompleted} of {statistics.projectsCreated}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>

          {/* Paint Diversity */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Paint Diversity</span>
              <span className="text-gray-800 dark:text-gray-200">
                {statistics.uniquePaintsUsed} paints, {statistics.uniqueBrandsUsed} brands
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (statistics.uniquePaintsUsed / 50) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Documentation Level */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Documentation</span>
              <span className="text-gray-800 dark:text-gray-200">
                {statistics.totalPhotos} photos, {statistics.totalSteps} steps
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (statistics.totalPhotos / 20) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {statistics.lastCalculated && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date(statistics.lastCalculated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default StatsOverview;