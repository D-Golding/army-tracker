// hooks/useProjectDetail.js - Updated with title, difficulty, and status editing
import { useState, useEffect } from 'react';
import { useProjectOperations } from './useProjects';
import { useGamificationOperations } from './useGamification';
import {
  addProjectPhotosById,
  removeProjectPhotoById,
  updateProjectCoverPhoto,
  updateProjectPhotoMetadata,
  updateProjectDescription,
  updateProjectTitle,
  updateProjectDifficulty
} from '../services/projects/index.js';

export const useProjectDetail = (project, projectId, refetch) => {
  const [projectPhotos, setProjectPhotos] = useState([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { addPaints, removePaint, addStep, updateStep, deleteStep, reorderSteps, updateStatus } = useProjectOperations();
  const { triggerForAction } = useGamificationOperations();

  // Initialize project photos when project data loads - HANDLE BOTH OLD AND NEW FORMATS
  useEffect(() => {
    if (project) {
      console.log('📸 useProjectDetail: Processing project photos:', {
        hasPhotos: !!project.photos,
        hasPhotoURLs: !!project.photoURLs,
        photos: project.photos,
        photoURLs: project.photoURLs
      });

      // Use new photos array if available, fall back to photoURLs for backwards compatibility
      if (project.photos && Array.isArray(project.photos)) {
        console.log('📸 Using new photos array format');
        setProjectPhotos(project.photos);
      } else if (project.photoURLs && Array.isArray(project.photoURLs)) {
        console.log('📸 Converting old photoURLs format to photo objects');
        // Convert old URL format to new photo object format
        const photoObjects = project.photoURLs.map(url => ({
          url: url,
          title: '',
          description: '',
          originalFileName: '',
          uploadedAt: '',
          wasEdited: false
        }));
        setProjectPhotos(photoObjects);
      } else {
        console.log('📸 No photos found in project');
        setProjectPhotos([]);
      }
    } else {
      console.log('📸 No project data available');
      setProjectPhotos([]);
    }
  }, [project?.photos, project?.photoURLs]); // Watch both new and old formats

  // Initialize edit form when entering edit mode
  useEffect(() => {
    if (isEditingDescription) {
      setEditDescription(project?.description || '');
    }
  }, [isEditingDescription, project?.description]);

  // NEW: Title update handler
  const handleTitleUpdate = async (newTitle) => {
    setIsUpdating(true);
    try {
      await updateProjectTitle(project.name, newTitle);
      await refetch();
    } catch (error) {
      console.error('Error updating project title:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // NEW: Difficulty update handler
  const handleDifficultyUpdate = async (newDifficulty) => {
    setIsUpdating(true);
    try {
      await updateProjectDifficulty(project.name, newDifficulty);
      await refetch();
    } catch (error) {
      console.error('Error updating project difficulty:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // NEW: Status update handler
  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      const oldStatus = project?.status;
      await updateStatus({ projectName: project.name, newStatus });

      // Trigger achievement check for project completion
      if (newStatus === 'completed' && oldStatus !== 'completed') {
        try {
          await triggerForAction('project_completed', {
            projectName: project.name,
            projectData: project,
            previousStatus: oldStatus,
            newStatus
          });
          console.log('🎯 Achievement check triggered for project completion');
        } catch (achievementError) {
          console.error('Achievement trigger failed (non-blocking):', achievementError);
          // Don't fail the status update if achievements fail
        }
      }

      await refetch();
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Description handlers
  const handleSaveDescription = async () => {
    setIsUpdatingDescription(true);
    try {
      await updateProjectDescription(project.name, editDescription);
      setIsEditingDescription(false);
      await refetch();
    } catch (error) {
      console.error('Error updating description:', error);
      alert('Failed to update description. Please try again.');
    } finally {
      setIsUpdatingDescription(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDescription(project?.description || '');
    setIsEditingDescription(false);
  };

  // Photo handlers - UPDATED FOR NEW PHOTO STRUCTURE
  const handlePhotosUploaded = async (uploadResults) => {
    console.log('📸 handlePhotosUploaded called with:', uploadResults);

    // Photos are already uploaded and saved to project document by PhotoUploadWizard
    // Just need to refetch to get updated project data
    try {
      await refetch();
      console.log('📸 Project refetched after photo upload');
    } catch (error) {
      console.error('Error refetching project after photo upload:', error);
    }
  };

  const handlePhotoDeleted = async (deletedPhotoUrl) => {
    console.log('🗑️ handlePhotoDeleted called with:', deletedPhotoUrl);

    try {
      await removeProjectPhotoById(projectId, deletedPhotoUrl);
      console.log('🗑️ Photo removed from project document');

      // Update local state immediately for better UX - HANDLE NEW FORMAT
      setProjectPhotos(prev => prev.filter(photo => {
        // Handle both old format (strings) and new format (objects)
        const photoUrl = typeof photo === 'string' ? photo : photo.url;
        return photoUrl !== deletedPhotoUrl;
      }));

      // Refetch to ensure consistency
      await refetch();
    } catch (error) {
      console.error('Error removing photo from project:', error);
      alert('Failed to remove photo. Please try again.');
    }
  };

  // NEW HANDLER: Update photo metadata
  const handlePhotoMetadataUpdated = async (photoUrl, metadataUpdates) => {
    console.log('📝 handlePhotoMetadataUpdated called with:', photoUrl, metadataUpdates);

    try {
      await updateProjectPhotoMetadata(projectId, photoUrl, metadataUpdates);
      console.log('📝 Photo metadata updated in project document');

      // Update local state immediately for better UX
      setProjectPhotos(prev => prev.map(photo => {
        const currentPhotoUrl = typeof photo === 'string' ? photo : photo.url;
        if (currentPhotoUrl === photoUrl) {
          // Convert string to object if needed, then update metadata
          const photoObj = typeof photo === 'string' ? {
            url: photo,
            title: '',
            description: '',
            originalFileName: '',
            uploadedAt: '',
            wasEdited: false
          } : photo;

          return {
            ...photoObj,
            ...metadataUpdates,
            updatedAt: new Date().toISOString()
          };
        }
        return photo;
      }));

      // Refetch to ensure consistency
      await refetch();
    } catch (error) {
      console.error('Error updating photo metadata:', error);
      throw error; // Re-throw so the component can handle the error
    }
  };

  // PROJECT cover photo handler - for main project cover
  const handleCoverPhotoSet = async (photoUrl) => {
    console.log('🌟 handleCoverPhotoSet called with:', photoUrl);

    try {
      await updateProjectCoverPhoto(projectId, photoUrl);
      console.log('🌟 Cover photo updated in project document');
      await refetch();
    } catch (error) {
      console.error('Error setting project cover photo:', error);
      throw error;
    }
  };

  // Paint handlers
  const handlePaintsAdded = async (paintsToAdd) => {
    try {
      await addPaints({ projectId, paints: paintsToAdd });

      try {
        await triggerForAction('paint_added', {
          paintsAdded: paintsToAdd,
          projectData: project,
          totalPaints: (project?.paintOverview?.length || 0) + paintsToAdd.length
        });
      } catch (achievementError) {
        console.error('Achievement trigger failed (non-blocking):', achievementError);
      }

      refetch();
    } catch (error) {
      console.error('Error adding paints to project:', error);
      throw error;
    }
  };

  const handlePaintRemoved = async (paintId) => {
    try {
      await removePaint({ projectId, paintId });
      refetch();
    } catch (error) {
      console.error('Error removing paint from project:', error);
      throw error;
    }
  };

  // Step handlers
  const handleStepAdded = async (stepData) => {
    try {
      await addStep({ projectId, step: stepData });
      refetch();
    } catch (error) {
      console.error('Error adding step to project:', error);
      throw error;
    }
  };

  const handleStepUpdated = async (stepId, stepUpdates) => {
    try {
      await updateStep({ projectId, stepId, updates: stepUpdates });
      refetch();
    } catch (error) {
      console.error('Error updating step:', error);
      throw error;
    }
  };

  const handleStepDeleted = async (stepId) => {
    try {
      await deleteStep({ projectId, stepId });
      refetch();
    } catch (error) {
      console.error('Error deleting step:', error);
      throw error;
    }
  };

  const handleStepsReordered = async (reorderedSteps) => {
    try {
      await reorderSteps({ projectId, steps: reorderedSteps });
      refetch();
    } catch (error) {
      console.error('Error reordering steps:', error);
      throw error;
    }
  };

  // Paint-Step assignment handlers
  const handlePaintAssigned = async (stepId, assignment) => {
    try {
      const currentStep = project?.steps?.find(s => s.id === stepId);
      if (!currentStep) throw new Error('Step not found');

      const currentPaints = currentStep.paints || [];
      const updatedPaints = [...currentPaints, assignment];

      await updateStep({ projectId, stepId, updates: { paints: updatedPaints } });
      refetch();
    } catch (error) {
      console.error('Error assigning paint to step:', error);
      throw error;
    }
  };

  const handlePaintRemovedFromStep = async (stepId, paintId) => {
    try {
      const currentStep = project?.steps?.find(s => s.id === stepId);
      if (!currentStep) throw new Error('Step not found');

      const updatedPaints = (currentStep.paints || []).filter(p => p.paintId !== paintId);
      await updateStep({ projectId, stepId, updates: { paints: updatedPaints } });
      refetch();
    } catch (error) {
      console.error('Error removing paint from step:', error);
      throw error;
    }
  };

  const handlePaintAssignmentUpdated = async (stepId, paintId, updates) => {
    try {
      const currentStep = project?.steps?.find(s => s.id === stepId);
      if (!currentStep) throw new Error('Step not found');

      const updatedPaints = (currentStep.paints || []).map(paint =>
        paint.paintId === paintId ? { ...paint, ...updates } : paint
      );

      await updateStep({ projectId, stepId, updates: { paints: updatedPaints } });
      refetch();
    } catch (error) {
      console.error('Error updating paint assignment:', error);
      throw error;
    }
  };

  const handlePhotosAssigned = async (stepId, photoUrls) => {
    try {
      await updateStep({ projectId, stepId, updates: { photos: photoUrls } });
      refetch();
    } catch (error) {
      console.error('Error assigning photos to step:', error);
      throw error;
    }
  };

  // STEP cover photo handler - for individual step cover photos
  const handleStepCoverPhotoSet = async (stepId, photoUrl) => {
    try {
      await updateStep({ projectId, stepId, updates: { coverPhoto: photoUrl } });
      refetch();
    } catch (error) {
      console.error('Error setting step cover photo:', error);
      throw error;
    }
  };

  const handleNotesUpdated = async (stepId, updatedNotes) => {
    try {
      await updateStep({ projectId, stepId, updates: { notes: updatedNotes } });
      refetch();
    } catch (error) {
      console.error('Error updating step notes:', error);
      throw error;
    }
  };

  // Debug logging
  console.log('📸 useProjectDetail state:', {
    projectId,
    projectPhotosArray: project?.photos,
    projectPhotoURLs: project?.photoURLs,
    localProjectPhotos: projectPhotos,
    photosCount: projectPhotos.length
  });

  return {
    // State
    projectPhotos,
    isEditingDescription,
    setIsEditingDescription,
    editDescription,
    setEditDescription,
    isUpdatingDescription,
    isUpdating,

    // NEW: Title, difficulty, and status handlers
    handleTitleUpdate,
    handleDifficultyUpdate,
    handleStatusUpdate,

    // Description handlers
    handleSaveDescription,
    handleCancelEdit,

    // Photo handlers
    handlePhotosUploaded,
    handlePhotoDeleted,
    handleCoverPhotoSet, // For PROJECT cover photos
    handlePhotoMetadataUpdated, // NEW: For updating photo metadata

    // Paint handlers
    handlePaintsAdded,
    handlePaintRemoved,

    // Step handlers
    handleStepAdded,
    handleStepUpdated,
    handleStepDeleted,
    handleStepsReordered,

    // Paint-Step assignment handlers
    handlePaintAssigned,
    handlePaintRemovedFromStep,
    handlePaintAssignmentUpdated,
    handlePhotosAssigned,
    onCoverPhotoSet: handleStepCoverPhotoSet, // For STEP cover photos
    handleNotesUpdated,
  };
};