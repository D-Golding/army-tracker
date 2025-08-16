// hooks/gamification/useGamificationCore.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import {
  processUserAchievements,
  getUserGamificationData,
  getAllAchievementsWithProgress,
  initializeGamificationData,
  checkStreakMilestones
} from '../../services/achievementService';
import {
  batchAchievementEmail,
  queueStreakMilestoneEmail
} from '../../services/emailBatchManager';

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

  // Mutation to process achievements with email notifications
  const processAchievements = useMutation({
    mutationFn: async (triggerType = 'general') => {
      const result = await processUserAchievements(currentUser.uid, triggerType);

      // Send email notifications for new achievements
      if (result.newAchievements && result.newAchievements.length > 0) {
        try {
          await batchAchievementEmail(
            currentUser.uid,
            result.newAchievements,
            result.statistics || {}
          );
          console.log(`📧 Queued achievement email for ${result.newAchievements.length} achievements`);
        } catch (error) {
          console.error('📧 Failed to queue achievement email:', error);
        }
      }

      // Send email notifications for streak milestones
      if (result.streakMilestones && result.streakMilestones.length > 0) {
        for (const milestone of result.streakMilestones) {
          try {
            await queueStreakMilestoneEmail(
              currentUser.uid,
              milestone,
              result.streaks?.daily_activity || {}
            );
            console.log(`🔥 Queued streak milestone email for ${milestone.days} days`);
          } catch (error) {
            console.error('🔥 Failed to queue streak email:', error);
          }
        }
      }

      return result;
    },
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

// Achievement trigger hook with email support
export const useAchievementTrigger = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const trigger = useMutation({
    mutationFn: async (triggerType) => {
      const result = await processUserAchievements(currentUser.uid, triggerType);

      // Handle email notifications
      if (result.newAchievements && result.newAchievements.length > 0) {
        await batchAchievementEmail(
          currentUser.uid,
          result.newAchievements,
          result.statistics
        );

        // Show in-app notifications for new achievements
        result.newAchievements.forEach(achievement => {
          console.log('🎉 Achievement Unlocked:', achievement.name);
          window.dispatchEvent(new CustomEvent('achievementUnlocked', {
            detail: achievement
          }));
        });
      }

      // Handle streak milestone emails
      if (result.streakMilestones && result.streakMilestones.length > 0) {
        for (const milestone of result.streakMilestones) {
          await queueStreakMilestoneEmail(
            currentUser.uid,
            milestone,
            result.streaks?.daily_activity || {}
          );

          window.dispatchEvent(new CustomEvent('streakMilestone', {
            detail: milestone
          }));
        }
      }

      return result;
    },
    onSuccess: (data) => {
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
      queryClient.setQueryData(gamificationKeys.user(currentUser.uid), data);
    },
    onError: (error) => {
      console.error('Error initializing gamification:', error);
    }
  });
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

export default useGamification;