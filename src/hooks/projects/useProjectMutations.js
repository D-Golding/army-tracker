// hooks/projects/useProjectMutations.js
import { useMutation } from '@tanstack/react-query';
import { invalidateProjectQueries } from '../../lib/queryClient';
import { useGamificationOperations } from '../gamification/useGamificationOperations';
import {
  // Project operations
  createProject,
  deleteProject,
  updateProjectStatus,
  updateProjectDescription,
  updateProjectDifficulty,
  addProjectPhotos,
  removeProjectPhoto,

  // Paint management
  addPaintsToProject,
  removePaintFromProject,

  // Step management
  addProjectStep,
  updateProjectStep,
  deleteProjectStep,
  reorderProjectSteps,
} from '../../services/projects/index.js';

// =====================================
// PROJECT MUTATIONS WITH GAMIFICATION
// =====================================

// Create project mutation
export const useCreateProject = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async (projectData) => {
      const result = await createProject(projectData);

      // Trigger achievement check for project creation
      try {
        await triggerForAction('project_created', {
          projectName: projectData.name,
          difficulty: projectData.difficulty || 'beginner',
          manufacturer: projectData.manufacturer,
          game: projectData.game
        });
        console.log('🎯 Achievement check triggered for project creation');
      } catch (error) {
        console.error('Error triggering project creation achievements:', error);
      }

      return result;
    },
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to create project' }
  });
};

// Delete project mutation
export const useDeleteProject = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async (projectName) => {
      const result = await deleteProject(projectName);

      try {
        await triggerForAction('project_deleted', { projectName });
        console.log('🎯 Achievement check triggered for project deletion');
      } catch (error) {
        console.error('Error triggering project deletion achievements:', error);
      }

      return result;
    },
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to delete project' }
  });
};

// Update project status mutation - WITH COMPLETION TRACKING
export const useUpdateProjectStatus = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectName, newStatus }) => {
      const result = await updateProjectStatus(projectName, newStatus);

      // Trigger completion achievements when project is completed
      if (newStatus === 'completed') {
        try {
          await triggerForAction('project_completed', {
            projectName,
            completedAt: new Date().toISOString()
          });
          console.log('🏆 Completion achievements triggered for:', projectName);
        } catch (error) {
          console.error('Error triggering completion achievements:', error);
        }
      } else {
        try {
          await triggerForAction('project_status_updated', {
            projectName,
            newStatus
          });
        } catch (error) {
          console.error('Error triggering status update achievements:', error);
        }
      }

      return result;
    },
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to update project status' }
  });
};

// Add project photos mutation
export const useAddProjectPhotos = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectName, photoURLs }) => {
      const result = await addProjectPhotos(projectName, photoURLs);

      try {
        await triggerForAction('photo_added', {
          projectName,
          photoCount: Array.isArray(photoURLs) ? photoURLs.length : 1
        });
        console.log('📸 Photo achievements triggered for:', projectName);
      } catch (error) {
        console.error('Error triggering photo achievements:', error);
      }

      return result;
    },
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to add project photos' }
  });
};

// =====================================
// BASIC PROJECT MUTATIONS
// =====================================

// Update project description mutation
export const useUpdateProjectDescription = () => {
  return useMutation({
    mutationFn: ({ projectName, newDescription }) => updateProjectDescription(projectName, newDescription),
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to update project description' }
  });
};

// Update project difficulty mutation
export const useUpdateProjectDifficulty = () => {
  return useMutation({
    mutationFn: ({ projectName, newDifficulty }) => updateProjectDifficulty(projectName, newDifficulty),
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to update project difficulty' }
  });
};

// Remove project photo mutation
export const useRemoveProjectPhoto = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectName, photoURL }) => {
      const result = await removeProjectPhoto(projectName, photoURL);

      try {
        await triggerForAction('photo_removed', { projectName });
      } catch (error) {
        console.error('Error triggering photo removal achievements:', error);
      }

      return result;
    },
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to remove project photo' }
  });
};

// =====================================
// PAINT MANAGEMENT MUTATIONS
// =====================================

// Add paints to project mutation
export const useAddPaintsToProject = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectId, paints }) => {
      const result = await addPaintsToProject(projectId, paints);

      try {
        await triggerForAction('paint_added', {
          projectId,
          paintCount: Array.isArray(paints) ? paints.length : 1,
          paints: paints
        });
        console.log('🎨 Paint achievements triggered for project:', projectId);
      } catch (error) {
        console.error('Error triggering paint achievements:', error);
      }

      return result;
    },
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to add paints to project' }
  });
};

// Remove paint from project mutation
export const useRemovePaintFromProject = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectId, paintId }) => {
      const result = await removePaintFromProject(projectId, paintId);

      try {
        await triggerForAction('paint_removed', { projectId, paintId });
      } catch (error) {
        console.error('Error triggering paint removal achievements:', error);
      }

      return result;
    },
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to remove paint from project' }
  });
};

// =====================================
// STEP MANAGEMENT MUTATIONS
// =====================================

// Add project step mutation
export const useAddProjectStep = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectId, step }) => {
      const result = await addProjectStep(projectId, step);

      try {
        await triggerForAction('step_created', {
          projectId,
          stepTitle: step.title
        });
        console.log('📝 Step achievements triggered for project:', projectId);
      } catch (error) {
        console.error('Error triggering step achievements:', error);
      }

      return result;
    },
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to add project step' }
  });
};

// Update project step mutation
export const useUpdateProjectStep = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectId, stepId, updates }) => {
      const result = await updateProjectStep(projectId, stepId, updates);

      // Trigger step completion achievements if step was completed
      if (updates.completed === true && updates.completedAt) {
        try {
          await triggerForAction('step_completed', {
            projectId,
            stepId,
            completedAt: updates.completedAt
          });
          console.log('✅ Step completion achievements triggered');
        } catch (error) {
          console.error('Error triggering step completion achievements:', error);
        }
      } else {
        try {
          await triggerForAction('step_updated', { projectId, stepId });
        } catch (error) {
          console.error('Error triggering step update achievements:', error);
        }
      }

      return result;
    },
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to update project step' }
  });
};

// Delete project step mutation
export const useDeleteProjectStep = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectId, stepId }) => {
      const result = await deleteProjectStep(projectId, stepId);

      try {
        await triggerForAction('step_deleted', { projectId, stepId });
      } catch (error) {
        console.error('Error triggering step deletion achievements:', error);
      }

      return result;
    },
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to delete project step' }
  });
};

// Reorder project steps mutation
export const useReorderProjectSteps = () => {
  return useMutation({
    mutationFn: ({ projectId, steps }) => reorderProjectSteps(projectId, steps),
    onSuccess: () => invalidateProjectQueries(),
    meta: { errorMessage: 'Failed to reorder project steps' }
  });
};

// =====================================
// COMPOSITE OPERATIONS HOOK
// =====================================

// Hook that provides all project operations for a component
export const useProjectOperations = () => {
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const updateStatus = useUpdateProjectStatus();
  const updateDescription = useUpdateProjectDescription();
  const updateDifficulty = useUpdateProjectDifficulty();
  const addPhotos = useAddProjectPhotos();
  const removePhoto = useRemoveProjectPhoto();
  const addPaints = useAddPaintsToProject();
  const removePaint = useRemovePaintFromProject();
  const addStep = useAddProjectStep();
  const updateStep = useUpdateProjectStep();
  const deleteStep = useDeleteProjectStep();
  const reorderSteps = useReorderProjectSteps();

  return {
    createProject: createProject.mutateAsync,
    deleteProject: deleteProject.mutateAsync,
    updateStatus: updateStatus.mutateAsync,
    updateDescription: updateDescription.mutateAsync,
    updateDifficulty: updateDifficulty.mutateAsync,
    addPhotos: addPhotos.mutateAsync,
    removePhoto: removePhoto.mutateAsync,
    addPaints: addPaints.mutateAsync,
    removePaint: removePaint.mutateAsync,
    addStep: addStep.mutateAsync,
    updateStep: updateStep.mutateAsync,
    deleteStep: deleteStep.mutateAsync,
    reorderSteps: reorderSteps.mutateAsync,

    // Loading states
    isCreating: createProject.isPending,
    isDeleting: deleteProject.isPending,
    isUpdating: updateStatus.isPending || updateDescription.isPending || updateDifficulty.isPending,
    isManagingPhotos: addPhotos.isPending || removePhoto.isPending,
    isManagingPaints: addPaints.isPending || removePaint.isPending,
    isManagingSteps: addStep.isPending || updateStep.isPending || deleteStep.isPending || reorderSteps.isPending,

    // Combined loading state
    isLoading: createProject.isPending || deleteProject.isPending ||
               updateStatus.isPending || updateDescription.isPending || updateDifficulty.isPending ||
               addPhotos.isPending || removePhoto.isPending ||
               addPaints.isPending || removePaint.isPending ||
               addStep.isPending || updateStep.isPending ||
               deleteStep.isPending || reorderSteps.isPending,
  };
};