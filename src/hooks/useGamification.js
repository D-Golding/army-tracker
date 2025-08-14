// hooks/useGamification.js - ENHANCED VERSION with Email Integration
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  processUserAchievements,
  getUserGamificationData,
  getAllAchievementsWithProgress,
  initializeGamificationData,
  checkStreakMilestones
} from '../services/achievementService';

// Import the new email manager
import emailManager from '../services/emailManager';

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

  // ENHANCED: Mutation to process achievements with email notifications
  const processAchievements = useMutation({
    mutationFn: async (triggerType = 'general') => {
      const result = await processUserAchievements(currentUser.uid, triggerType);

      // 🆕 NEW: Send email notifications for new achievements
      if (result.newAchievements && result.newAchievements.length > 0) {
        try {
          await emailManager.triggerAchievementEmail(
            currentUser.uid,
            result.newAchievements,
            result.statistics || {}
          );
          console.log(`📧 Queued achievement email for ${result.newAchievements.length} achievements`);
        } catch (error) {
          console.error('📧 Failed to queue achievement email:', error);
          // Don't fail the achievement processing if email fails
        }
      }

      // 🆕 NEW: Send email notifications for streak milestones
      if (result.streakMilestones && result.streakMilestones.length > 0) {
        for (const milestone of result.streakMilestones) {
          try {
            await emailManager.triggerStreakEmail(
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

// 🆕 NEW: Enhanced achievement trigger hook with email support
export const useAchievementTrigger = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const trigger = useMutation({
    mutationFn: async (triggerType) => {
      const result = await processUserAchievements(currentUser.uid, triggerType);

      // Handle email notifications
      if (result.newAchievements && result.newAchievements.length > 0) {
        // Queue achievement emails (batched for daily digest)
        await emailManager.triggerAchievementEmail(
          currentUser.uid,
          result.newAchievements,
          result.statistics
        );

        // Show in-app notifications for new achievements
        result.newAchievements.forEach(achievement => {
          console.log('🎉 Achievement Unlocked:', achievement.name);
          // Dispatch custom events for in-app notifications
          window.dispatchEvent(new CustomEvent('achievementUnlocked', {
            detail: achievement
          }));
        });
      }

      // Handle streak milestone emails
      if (result.streakMilestones && result.streakMilestones.length > 0) {
        for (const milestone of result.streakMilestones) {
          // Queue immediate streak emails
          await emailManager.triggerStreakEmail(
            currentUser.uid,
            milestone,
            result.streaks?.daily_activity || {}
          );

          // Show in-app notifications for streak milestones
          window.dispatchEvent(new CustomEvent('streakMilestone', {
            detail: milestone
          }));
        }
      }

      return result;
    },
    onSuccess: (data) => {
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

// 🆕 NEW: Email-aware gamification operations hook
export const useGamificationOperations = () => {
  const gamification = useGamification();
  const achievementTrigger = useAchievementTrigger();
  const initialize = useInitializeGamification();

  // Enhanced function to trigger achievements after specific actions
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
      console.log(`🎯 Triggering achievements for action: ${actionType}`);
      const result = await achievementTrigger.triggerAchievementCheck(triggerType);

      // Log results for debugging
      if (result.newAchievements?.length > 0) {
        console.log(`✨ ${result.newAchievements.length} new achievements unlocked!`);
      }

      if (result.streakMilestones?.length > 0) {
        console.log(`🔥 ${result.streakMilestones.length} streak milestones reached!`);
      }

      return result;
    } catch (error) {
      console.error(`❌ Error triggering achievements for ${actionType}:`, error);
      return { newAchievements: [], error: error.message };
    }
  };

  // 🆕 NEW: Check email settings for current user
  const checkEmailSettings = async () => {
    try {
      const permissions = await emailManager.checkEmailPermissions(currentUser.uid, 'Achievements');
      return permissions;
    } catch (error) {
      console.error('Error checking email permissions:', error);
      return { canSend: false, reason: 'Permission check failed' };
    }
  };

  // 🆕 NEW: Test email functionality
  const testEmails = async (testType = 'achievement') => {
    try {
      return await emailManager.testEmails(currentUser.uid, testType);
    } catch (error) {
      console.error('Error testing emails:', error);
      return { success: false, error: error.message };
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

    // 🆕 NEW: Email functions
    checkEmailSettings,
    testEmails,

    // Loading states
    isProcessing: gamification.isProcessing || achievementTrigger.isTriggering,
    isInitializing: initialize.isPending
  };
};

// 🆕 NEW: Hook for email management and monitoring
export const useEmailManagement = () => {
  const { currentUser } = useAuth();

  const getQueueStats = async () => {
    try {
      return await emailManager.getQueueStatistics();
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return { error: error.message };
    }
  };

  const getSystemStatus = async () => {
    try {
      return await emailManager.getSystemStatus();
    } catch (error) {
      console.error('Error getting system status:', error);
      return { error: error.message };
    }
  };

  const processEmails = async (emailType = null) => {
    try {
      if (emailType) {
        return await emailManager.processEmailType(emailType);
      } else {
        return await emailManager.processImmediate();
      }
    } catch (error) {
      console.error('Error processing emails:', error);
      return { processed: 0, failed: 0, error: error.message };
    }
  };

  return {
    getQueueStats,
    getSystemStatus,
    processEmails,
    emailManager // Direct access if needed
  };
};

// 🆕 NEW: Example integration with your project actions
export const useProjectActions = () => {
  const { triggerForAction } = useGamificationOperations();

  const handleProjectCreated = async (projectData) => {
    // Your existing project creation logic here
    console.log('📝 Project created:', projectData.name);

    // Trigger achievement check with email notifications
    await triggerForAction('project_created', { projectData });
  };

  const handleProjectCompleted = async (projectData) => {
    // Your existing project completion logic here
    console.log('✅ Project completed:', projectData.name);

    // Trigger achievement check with email notifications
    await triggerForAction('project_completed', { projectData });
  };

  const handleStepCompleted = async (stepData) => {
    // Your existing step completion logic here
    console.log('🎯 Step completed:', stepData.name);

    // Trigger achievement check with email notifications
    await triggerForAction('step_completed', { stepData });
  };

  const handlePhotoAdded = async (photoData) => {
    // Your existing photo upload logic here
    console.log('📸 Photo added to project');

    // Trigger achievement check with email notifications
    await triggerForAction('photo_added', { photoData });
  };

  return {
    handleProjectCreated,
    handleProjectCompleted,
    handleStepCompleted,
    handlePhotoAdded
  };
};

// 🆕 NEW: Hook to initialize gamification for new users
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

// Export new email-integrated hooks
export default useGamification;