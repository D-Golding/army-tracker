// hooks/useGamification.js - Gamification React Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  processUserAchievements,
  getUserGamificationData,
  getAllAchievementsWithProgress,
  initializeGamificationData,
  checkStreakMilestones
} from '../services/achievementService';

// Query keys for React Query
const gamificationKeys = {
  all: ['gamification'],
  user: (userId) => [...gamificationKeys.all, 'user', userId],
  achievements: (userId) => [...gamificationKeys.all, 'achievements', userId],
  streaks: (userId) => [...gamificationKeys.all, 'streaks', userId],
  progress: (userId) => [...gamificationKeys.all, 'progress', userId]
};

// Main gamification hook - gets all user gamification data
export const useGamification = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: gamificationKeys.user(currentUser?.uid),
    queryFn: () => getUserGamificationData(currentUser.uid),
    enabled: !!currentUser?.uid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      errorMessage: 'Failed to load gamification data'
    }
  });

  // Mutation to process achievements (call this after user actions)
  const processAchievements = useMutation({
    mutationFn: (triggerType = 'general') => processUserAchievements(currentUser.uid, triggerType),
    onSuccess: (data) => {
      // Update cache with new data
      queryClient.setQueryData(gamificationKeys.user(currentUser.uid), (oldData) => ({
        ...oldData,
        achievements: data.achievements,
        statistics: data.statistics,
        streaks: data.streaks
      }));

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: gamificationKeys.achievements(currentUser.uid) });
    },
    onError: (error) => {
      console.error('Error processing achievements:', error);
    }
  });

  return {
    ...query,
    gamificationData: query.data,
    processAchievements: processAchievements.mutateAsync,
    isProcessing: processAchievements.isPending
  };
};

// Hook to get all achievements with progress
export const useAchievements = () => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: gamificationKeys.achievements(currentUser?.uid),
    queryFn: () => getAllAchievementsWithProgress(currentUser.uid),
    enabled: !!currentUser?.uid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      errorMessage: 'Failed to load achievements'
    }
  });
};

// Hook to get user streaks
export const useStreaks = () => {
  const { currentUser } = useAuth();
  const gamificationQuery = useGamification();

  const streaks = gamificationQuery.gamificationData?.streaks || {};
  const milestones = checkStreakMilestones(streaks);

  return {
    streaks,
    milestones,
    isLoading: gamificationQuery.isLoading,
    error: gamificationQuery.error
  };
};

// Hook to get user statistics
export const useUserStatistics = () => {
  const { currentUser } = useAuth();
  const gamificationQuery = useGamification();

  const statistics = gamificationQuery.gamificationData?.statistics || {
    projectsCreated: 0,
    projectsCompleted: 0,
    totalSteps: 0,
    totalPhotos: 0,
    uniquePaintsUsed: 0,
    uniqueBrandsUsed: 0,
    uniqueTechniquesUsed: 0
  };

  return {
    statistics,
    isLoading: gamificationQuery.isLoading,
    error: gamificationQuery.error
  };
};

// Hook to trigger achievement checks
export const useAchievementTrigger = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const trigger = useMutation({
    mutationFn: async (triggerType) => {
      const result = await processUserAchievements(currentUser.uid, triggerType);
      return result;
    },
    onSuccess: (data) => {
      // Show notifications for new achievements
      if (data.newAchievements && data.newAchievements.length > 0) {
        // This will be handled by the notification system
        data.newAchievements.forEach(achievement => {
          console.log('🎉 Achievement Unlocked:', achievement.name);
          // You can dispatch custom events here for notifications
          window.dispatchEvent(new CustomEvent('achievementUnlocked', {
            detail: achievement
          }));
        });
      }

      // Update gamification cache
      queryClient.invalidateQueries({ queryKey: gamificationKeys.user(currentUser.uid) });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.achievements(currentUser.uid) });
    },
    onError: (error) => {
      console.error('Error triggering achievement check:', error);
    }
  });

  return {
    triggerAchievementCheck: trigger.mutateAsync,
    isTriggering: trigger.isPending
  };
};

// Hook to initialize gamification for new users
export const useInitializeGamification = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => initializeGamificationData(currentUser.uid),
    onSuccess: (data) => {
      // Update cache with initialized data
      queryClient.setQueryData(gamificationKeys.user(currentUser.uid), data);
    },
    onError: (error) => {
      console.error('Error initializing gamification:', error);
    }
  });
};

// Composite hook for common gamification operations
export const useGamificationOperations = () => {
  const gamification = useGamification();
  const achievementTrigger = useAchievementTrigger();
  const initialize = useInitializeGamification();

  // Convenience function to trigger achievements after specific actions
  const triggerForAction = async (actionType, actionData = {}) => {
    const triggerMap = {
      'project_created': 'general',
      'project_completed': 'completion',
      'step_created': 'general',
      'step_completed': 'step_completion',
      'paint_added': 'general',
      'photo_added': 'general'
    };

    const triggerType = triggerMap[actionType] || 'general';

    try {
      await achievementTrigger.triggerAchievementCheck(triggerType);
    } catch (error) {
      console.error(`Error triggering achievements for ${actionType}:`, error);
    }
  };

  return {
    // Data
    gamificationData: gamification.gamificationData,
    isLoading: gamification.isLoading,
    error: gamification.error,

    // Operations
    triggerForAction,
    initializeGamification: initialize.mutateAsync,

    // Loading states
    isProcessing: gamification.isProcessing || achievementTrigger.isTriggering,
    isInitializing: initialize.isPending
  };
};

export default useGamification;