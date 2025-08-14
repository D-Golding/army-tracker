// components/dashboard/Gamification/ProgressBars.jsx
import React, { useState } from 'react';
import { Target, TrendingUp, Filter } from 'lucide-react';
import { useAchievements } from '../../../hooks/useGamification';
import { ACHIEVEMENT_CATEGORIES } from '../../../config/achievementConfig';

const ProgressBars = ({ className = '' }) => {
  const { data: achievements = [], isLoading, error } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);

  // Filter achievements to show progress
  const filteredAchievements = achievements.filter(achievement => {
    // Category filter
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false;
    }

    // Show/hide completed filter
    if (!showCompleted && achievement.isUnlocked) {
      return false;
    }

    return true;
  });

  // Sort by progress percentage (closest to completion first)
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return showCompleted ? -1 : 1;
    if (!a.isUnlocked && b.isUnlocked) return showCompleted ? 1 : -1;

    const aProgress = a.progress?.percentage || 0;
    const bProgress = b.progress?.percentage || 0;
    return bProgress - aProgress; // Higher progress first
  });

  // Get next unlockable achievements (close to completion)
  const nextAchievements = achievements
    .filter(a => !a.isUnlocked && a.progress?.percentage > 0)
    .sort((a, b) => (b.progress?.percentage || 0) - (a.progress?.percentage || 0))
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className={`card-base card-padding ${className}`}>
        <div className="text-center py-8">
          <div className="loading-spinner-primary mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">Loading progress...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card-base card-padding ${className}`}>
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          Failed to load progress
        </div>
      </div>
    );
  }

  return (
    <div className={`card-base card-padding ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Target className="mr-2 text-indigo-500" size={24} />
            Achievement Progress
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your progress toward new achievements
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              showCompleted 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Filter size={12} className="inline mr-1" />
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
        </div>
      </div>

      {/* Quick Next Achievements */}
      {nextAchievements.length > 0 && !showCompleted && (
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <TrendingUp size={16} className="mr-2 text-indigo-500" />
            Almost There!
          </h3>
          <div className="space-y-3">
            {nextAchievements.map(achievement => (
              <QuickProgressCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`filter-chip ${
            selectedCategory === 'all' ? 'filter-chip-active' : 'filter-chip-inactive'
          }`}
        >
          All Categories
        </button>
        {Object.values(ACHIEVEMENT_CATEGORIES).map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`filter-chip ${
              selectedCategory === category ? 'filter-chip-active' : 'filter-chip-inactive'
            }`}
          >
            {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Achievement Progress List */}
      {sortedAchievements.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Target className="mx-auto mb-3 text-gray-400" size={48} />
          <p className="text-lg font-medium mb-2">No achievements to track</p>
          <p className="text-sm">
            {showCompleted
              ? 'Try changing your filters or start working on new goals!'
              : 'All visible achievements are completed! Toggle "Show Completed" to see them.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAchievements.map(achievement => (
            <ProgressCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </div>
  );
};

// Quick Progress Card (for "Almost There" section)
const QuickProgressCard = ({ achievement }) => {
  const progress = achievement.progress || { current: 0, required: 1, percentage: 0 };

  return (
    <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="text-lg">{achievement.icon}</div>
        <div>
          <div className="font-medium text-sm text-gray-900 dark:text-white">
            {achievement.name}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {progress.current}/{progress.required}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
        <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          {progress.percentage}%
        </div>
      </div>
    </div>
  );
};

// Full Progress Card
const ProgressCard = ({ achievement }) => {
  const progress = achievement.progress || { current: 0, required: 1, percentage: 0 };
  const remaining = progress.required - progress.current;

  return (
    <div className={`border rounded-xl p-4 transition-all ${
      achievement.isUnlocked
        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}>

      {/* Achievement Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`text-2xl ${achievement.isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
            {achievement.icon}
          </div>
          <div>
            <h3 className={`font-bold text-sm ${
              achievement.isUnlocked 
                ? 'text-emerald-800 dark:text-emerald-200' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {achievement.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {achievement.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 capitalize">
              {achievement.category?.replace(/_/g, ' ')} • {achievement.points} points
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {achievement.isUnlocked ? (
          <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium">
            ✅ Completed
          </div>
        ) : (
          <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium">
            {remaining} to go
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            {progress.current}/{progress.required} ({progress.percentage}%)
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              achievement.isUnlocked 
                ? 'bg-emerald-500' 
                : progress.percentage >= 75 
                  ? 'bg-amber-500' 
                  : 'bg-indigo-500'
            }`}
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>

        {/* Encouragement Text */}
        {!achievement.isUnlocked && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {progress.percentage >= 75 ? '🔥 Almost there! Keep going!' :
             progress.percentage >= 50 ? '💪 Great progress, you\'re halfway!' :
             progress.percentage > 0 ? '✨ Good start, keep it up!' :
             '🎯 Ready to begin this achievement?'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBars;