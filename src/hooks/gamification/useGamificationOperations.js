// hooks/gamification/useGamificationOperations.js
import { useGamification, useAchievementTrigger, useInitializeGamification } from './useGamificationCore';

// Main operations hook that ties everything together
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

// Example integration with project actions
export const useProjectActions = () => {
  const { triggerForAction } = useGamificationOperations();

  const handleProjectCreated = async (projectData) => {
    console.log('📝 Project created:', projectData.name);
    await triggerForAction('project_created', { projectData });
  };

  const handleProjectCompleted = async (projectData) => {
    console.log('✅ Project completed:', projectData.name);
    await triggerForAction('project_completed', { projectData });
  };

  const handleStepCompleted = async (stepData) => {
    console.log('🎯 Step completed:', stepData.name);
    await triggerForAction('step_completed', { stepData });
  };

  const handlePhotoAdded = async (photoData) => {
    console.log('📸 Photo added to project');
    await triggerForAction('photo_added', { photoData });
  };

  return {
    handleProjectCreated,
    handleProjectCompleted,
    handleStepCompleted,
    handlePhotoAdded
  };
};

export default useGamificationOperations;