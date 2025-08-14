// hooks/steps/useStepOperations.js
import { useState } from 'react';
import { useGamificationOperations } from '../useGamification';

export const useStepOperations = ({
  projectData,
  onStepUpdated,
  onStepDeleted,
  onStepsReordered,
  onPaintAssigned,
  onPaintRemoved,
  onPaintAssignmentUpdated,
  onPhotosAssigned,
  onCoverPhotoSet,
  onNotesUpdated
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { triggerForAction } = useGamificationOperations();

  // Handle step completion toggle
  const toggleStepCompletion = async (step, stepNumber, totalSteps) => {
    setIsUpdating(true);
    try {
      const wasCompleted = step.completed;
      const updatedStep = {
        ...step,
        completed: !step.completed,
        completedAt: !step.completed ? new Date().toISOString() : null
      };

      await onStepUpdated(step.id, updatedStep);

      // Trigger achievement check for step completion
      if (!wasCompleted && updatedStep.completed) {
        try {
          await triggerForAction('step_completed', {
            stepData: updatedStep,
            projectData,
            stepNumber,
            totalSteps
          });
        } catch (achievementError) {
          console.error('Achievement trigger failed (non-blocking):', achievementError);
        }
      }

    } catch (error) {
      console.error('Error updating step completion:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle step update
  const updateStep = async (stepId, updates) => {
    setIsUpdating(true);
    try {
      await onStepUpdated(stepId, updates);
    } catch (error) {
      console.error('Error updating step:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle step deletion
  const deleteStep = async (stepId) => {
    try {
      await onStepDeleted(stepId);
    } catch (error) {
      console.error('Error deleting step:', error);
      throw error;
    }
  };

  // Handle paint assignment
  const assignPaint = async (stepId, assignment) => {
    try {
      await onPaintAssigned(stepId, assignment);

      // Trigger achievement check
      try {
        await triggerForAction('paint_added', {
          assignmentData: assignment,
          stepData: projectData?.steps?.find(s => s.id === stepId),
          projectData
        });
      } catch (achievementError) {
        console.error('Achievement trigger failed (non-blocking):', achievementError);
      }
    } catch (error) {
      console.error('Error assigning paint to step:', error);
      throw error;
    }
  };

  // Handle paint removal
  const removePaint = async (stepId, paintId) => {
    try {
      await onPaintRemoved(stepId, paintId);
    } catch (error) {
      console.error('Error removing paint from step:', error);
      throw error;
    }
  };

  // Handle paint assignment update
  const updatePaintAssignment = async (stepId, paintId, updates) => {
    try {
      await onPaintAssignmentUpdated(stepId, paintId, updates);
    } catch (error) {
      console.error('Error updating paint assignment:', error);
      throw error;
    }
  };

  // Handle photo assignment
  const assignPhotos = async (stepId, photoUrls) => {
    try {
      await onPhotosAssigned(stepId, photoUrls);

      // Trigger achievement check for new photos
      const step = projectData?.steps?.find(s => s.id === stepId);
      const currentPhotos = step?.photos || [];
      if (photoUrls.length > currentPhotos.length) {
        try {
          await triggerForAction('photo_added', {
            photoUrls,
            stepData: step,
            projectData,
            newPhotoCount: photoUrls.length - currentPhotos.length
          });
        } catch (achievementError) {
          console.error('Achievement trigger failed (non-blocking):', achievementError);
        }
      }
    } catch (error) {
      console.error('Error assigning photos to step:', error);
      throw error;
    }
  };

  // Handle cover photo setting
  const setCoverPhoto = async (stepId, photoUrl) => {
    try {
      await onCoverPhotoSet(stepId, photoUrl);
    } catch (error) {
      console.error('Error setting cover photo:', error);
      throw error;
    }
  };

  // Handle notes update
  const updateNotes = async (stepId, updatedNotes) => {
    try {
      await onNotesUpdated(stepId, updatedNotes);
    } catch (error) {
      console.error('Error updating step notes:', error);
      throw error;
    }
  };

  return {
    isUpdating,
    toggleStepCompletion,
    updateStep,
    deleteStep,
    assignPaint,
    removePaint,
    updatePaintAssignment,
    assignPhotos,
    setCoverPhoto,
    updateNotes
  };
};