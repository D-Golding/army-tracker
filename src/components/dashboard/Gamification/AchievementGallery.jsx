// components/dashboard/Gamification/AchievementGallery.jsx
import React, { useState } from 'react';
import { Trophy, Calendar, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useAchievements } from '../../../hooks/useGamification';
import { ACHIEVEMENT_DEFINITIONS, ACHIEVEMENT_CATEGORIES } from '../../../config/achievementConfig';
import AchievementCard from './AchievementCard';

const AchievementGallery = ({ className = '' }) => {
  const { data: achievements = [], isLoading, error } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'points', 'alphabetical'
  const [showUnlocked, setShowUnlocked] = useState(true);

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false;
    }
    if (showUnlocked && !achievement.isUnlocked) {
      return false;
    }
    return true;
  });

  // Sort achievements
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        if (a.isUnlocked && b.isUnlocked) {
          return new Date(b.unlockedAt || 0) - new Date(a.unlockedAt || 0);
        }
        return a.isUnlocked ? -1 : b.isUnlocked ? 1 : 0;
      case 'points':
        return b.points - a.points;
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Get category counts
  const categoryCounts = Object.values(ACHIEVEMENT_CATEGORIES).reduce((acc, category) => {
    const categoryAchievements = achievements.filter(a => a.category === category);
    acc[category] = {
      total: categoryAchievements.length,
      unlocked: categoryAchievements.filter(a => a.isUnlocked).length
    };
    return acc;
  }, {});

  const totalUnlocked = achievements.filter(a => a.isUnlocked).length;

  if (isLoading) {
    return (
      <div className={`card-base card-padding ${className}`}>
        <div className="text-center py-8">
          <div className="loading-spinner-primary mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">Loading achievements...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card-base card-padding ${className}`}>
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          Failed to load achievements
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
            <Trophy className="mr-2 text-yellow-500" size={24} />
            Achievement Gallery
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalUnlocked} of {achievements.length} achievements unlocked
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUnlocked(!showUnlocked)}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              showUnlocked 
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {showUnlocked ? 'Unlocked Only' : 'Show All'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`filter-chip ${
              selectedCategory === 'all' ? 'filter-chip-active' : 'filter-chip-inactive'
            }`}
          >
            All Categories
          </button>
          {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => {
            const count = categoryCounts[category];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`filter-chip ${
                  selectedCategory === category ? 'filter-chip-active' : 'filter-chip-inactive'
                }`}
              >
                {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {count && (
                  <span className="ml-1 text-xs opacity-75">
                    {count.unlocked}/{count.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Sort by:</span>
          <div className="flex gap-2">
            {[
              { key: 'recent', label: 'Recent' },
              { key: 'points', label: 'Points' },
              { key: 'alphabetical', label: 'A-Z' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  sortBy === option.key
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Grid */}
      {sortedAchievements.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Trophy className="mx-auto mb-3 text-gray-400" size={48} />
          <p className="text-lg font-medium mb-2">
            {showUnlocked ? 'No achievements unlocked yet' : 'No achievements found'}
          </p>
          <p className="text-sm">
            {showUnlocked
              ? 'Start creating projects and using paints to earn your first achievements!'
              : 'Try adjusting your filters.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAchievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementGallery;