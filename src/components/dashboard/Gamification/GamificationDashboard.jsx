// components/dashboard/Gamification/GamificationDashboard.jsx
import React from 'react';
import { Trophy } from 'lucide-react';
import { useGamification } from '../../../hooks/useGamification';
import AchievementGallery from './AchievementGallery';
import ProgressBars from './ProgressBars';
import StatsOverview from './StatsOverview';
import StreakManager from './StreakManager';

const GamificationDashboard = () => {
  const { gamificationData, isLoading, error } = useGamification();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card-base card-padding">
          <div className="text-center py-8">
            <div className="loading-spinner-primary mx-auto mb-4"></div>
            <div className="text-gray-600 dark:text-gray-400">Loading gamification data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="card-base card-padding">
          <div className="text-center py-8 text-red-600 dark:text-red-400">
            <Trophy className="mx-auto mb-4" size={48} />
            <p className="text-lg font-medium mb-2">Failed to load gamification data</p>
            <p className="text-sm opacity-75">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  // Get quick stats for header
  const totalPoints = gamificationData?.achievements?.totalPoints || 0;
  const totalBadges = gamificationData?.achievements?.unlockedBadges?.length || 0;
  const dailyStreak = gamificationData?.streaks?.daily_activity?.current || 0;

  return (
    <div className="space-y-6">

      {/* Quick Stats Header */}
      <div className="grid grid-cols-3 gap-4">
        <div className="summary-card-amber">
          <div className="summary-value-amber">{totalPoints.toLocaleString()}</div>
          <div className="summary-label">Total Points</div>
        </div>

        <div className="summary-card-purple">
          <div className="summary-value-purple">{totalBadges}</div>
          <div className="summary-label">Achievements</div>
        </div>

        <div className="summary-card-blue">
          <div className="summary-value-blue">{dailyStreak}</div>
          <div className="summary-label">Day Streak</div>
        </div>
      </div>

      {/* Statistics Overview */}
      <StatsOverview />

      {/* Current Streaks */}
      <StreakManager />

      {/* Progress Toward Next Achievements */}
      <ProgressBars />

      {/* Achievement Gallery */}
      <AchievementGallery />
    </div>
  );
};

export default GamificationDashboard;