// components/dashboard/Gamification/StreakManager.jsx
import React from 'react';
import { useStreaks } from '../../../hooks/useGamification';
import { STREAK_DEFINITIONS } from '../../../config/achievementConfig';

const StreakManager = ({ className = '' }) => {
  const { streaks, milestones, isLoading, error } = useStreaks();

  if (isLoading) {
    return (
      <div className={`card-base card-padding ${className}`}>
        <div className="text-center py-8">
          <div className="loading-spinner-primary mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">Loading streaks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card-base card-padding ${className}`}>
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          Failed to load streaks
        </div>
      </div>
    );
  }

  const dailyStreak = streaks.daily_activity || { current: 0, longest: 0 };
  const weeklyStreak = streaks.weekly_completion || { current: 0, longest: 0 };

  return (
    <div className={`card-base card-padding ${className}`}>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          🔥 Streak Manager
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Keep your momentum going!
        </p>
      </div>

      {/* Streak Cards */}
      <div className="space-y-4">

        {/* Daily Activity Streak */}
        <StreakCard
          title="Daily Activity"
          description="Work on any project daily"
          icon="🔥"
          current={dailyStreak.current}
          longest={dailyStreak.longest}
          lastActivity={dailyStreak.lastActivity}
          type="daily"
          color="orange"
        />

        {/* Weekly Completion Streak */}
        <StreakCard
          title="Weekly Completion"
          description="Complete at least 1 step per week"
          icon="⚡"
          current={weeklyStreak.current}
          longest={weeklyStreak.longest}
          lastActivity={weeklyStreak.lastCompletion}
          type="weekly"
          color="purple"
        />
      </div>

      {/* Milestone History */}
      {milestones && milestones.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Milestones
          </h3>
          <div className="space-y-2">
            {milestones.slice(0, 3).map((milestone, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl"
              >
                <div className="text-xl">{milestone.icon}</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {milestone.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {milestone.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivation Section */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          {dailyStreak.current > 0 || weeklyStreak.current > 0 ? (
            <div>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                🎉 Great momentum! Keep it up!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consistency is key to improving your painting skills
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                Ready to start a streak?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Work on a project today to begin your daily streak!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Individual Streak Card Component
const StreakCard = ({
  title,
  description,
  icon,
  current,
  longest,
  lastActivity,
  type,
  color
}) => {
  const isActive = current > 0;
  const timeSinceLastActivity = lastActivity
    ? Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24))
    : null;

  const getNextMilestone = () => {
    const milestones = type === 'daily' ? [7, 14, 30, 60, 100, 365] : [4, 8, 12, 26, 52];
    return milestones.find(milestone => milestone > current) || null;
  };

  const nextMilestone = getNextMilestone();
  const progressToNextMilestone = nextMilestone
    ? Math.round((current / nextMilestone) * 100)
    : 100;

  const colorClasses = {
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-600 dark:text-orange-400',
      progress: 'bg-orange-500'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400',
      progress: 'bg-purple-500'
    }
  };

  const classes = colorClasses[color] || colorClasses.orange;

  return (
    <div className={`border-2 rounded-xl p-4 ${classes.bg} ${classes.border}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
          isActive 
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${classes.text}`}>
            {current}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Current Streak
          </div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${classes.text}`}>
            {longest}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Longest Streak
          </div>
        </div>
      </div>

      {/* Progress to Next Milestone */}
      {nextMilestone && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Next milestone: {nextMilestone} {type === 'daily' ? 'days' : 'weeks'}</span>
            <span>{current}/{nextMilestone}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${classes.progress}`}
              style={{ width: `${progressToNextMilestone}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Last Activity */}
      {lastActivity && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last activity: {timeSinceLastActivity === 0 ? 'Today' :
                          timeSinceLastActivity === 1 ? 'Yesterday' :
                          `${timeSinceLastActivity} days ago`}
        </div>
      )}

      {/* Motivation Message */}
      {!isActive && (
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">
          {type === 'daily'
            ? 'Work on any project to start your streak!'
            : 'Complete a step this week to start your streak!'
          }
        </div>
      )}
    </div>
  );
};

export default StreakManager;