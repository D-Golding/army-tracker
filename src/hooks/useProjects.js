// hooks/useProjects.js - Updated with Achievement Triggers
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys, invalidateProjectQueries } from '../lib/queryClient';
import { useGamificationOperations } from './useGamification';
import {
  // Data fetching
  getAllProjects,
  getProjectsByStatus,
  getProjectStatusSummary,
  checkProjectPaints,
  findProjectById,

  // Project operations
  createProject,
  deleteProject,
  updateProjectStatus,
  updateProjectDescription,
  updateProjectDifficulty, // New function
  addProjectPhotos,
  removeProjectPhoto,
  addProjectPhotosById,

  // Paint management
  addPaintsToProject,
  removePaintFromProject,

  // Step management
  addProjectStep,
  updateProjectStep,
  deleteProjectStep,
  reorderProjectSteps,
} from '../services/projectService';

// =====================================
// PROJECT LIST QUERIES
// =====================================

// Main projects query with filter support
export const useProjects = (filter = 'all') => {
  return useQuery({
    queryKey: queryKeys.projects.list(filter),
    queryFn: async () => {
      switch (filter) {
        case 'all':
          return await getAllProjects();
        case 'upcoming':
        case 'started':
        case 'completed':
          return await getProjectsByStatus(filter);
        default:
          return await getAllProjects();
      }
    },
    meta: {
      errorMessage: 'Failed to load projects'
    }
  });
};

// Single project query by ID
export const useProject = (projectId) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => findProjectById(projectId),
    enabled: !!projectId, // Only run if projectId is provided
    meta: {
      errorMessage: 'Failed to load project'
    }
  });
};

// Project summary query
export const useProjectSummary = () => {
  return useQuery({
    queryKey: queryKeys.projects.summary(),
    queryFn: getProjectStatusSummary,
    meta: {
      errorMessage: 'Failed to load project summary'
    }
  });
};

// Project paint check query
export const useProjectPaintCheck = (projectName) => {
  return useQuery({
    queryKey: queryKeys.projects.paintCheck(projectName),
    queryFn: () => checkProjectPaints(projectName),
    enabled: !!projectName, // Only run if projectName is provided
    meta: {
      errorMessage: 'Failed to check project paints'
    }
  });
};

// =====================================
// PROJECT MUTATIONS WITH GAMIFICATION
// =====================================

// Create project mutation - Updated with achievement triggers
export const useCreateProject = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async (projectData) => {
      // Handle legacy format for backwards compatibility
      let requiredPaints = [];
      if (projectData.requiredPaints) {
        if (typeof projectData.requiredPaints === 'string') {
          requiredPaints = projectData.requiredPaints
            .split(',')
            .map(paint => paint.trim())
            .filter(paint => paint.length > 0);
        } else if (Array.isArray(projectData.requiredPaints)) {
          requiredPaints = projectData.requiredPaints;
        }
      }

      let photoURLs = [];
      if (projectData.photoURLs) {
        if (typeof projectData.photoURLs === 'string') {
          photoURLs = projectData.photoURLs
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0);
        } else if (Array.isArray(projectData.photoURLs)) {
          photoURLs = projectData.photoURLs;
        }
      }

      const result = await createProject(
        projectData.name,
        requiredPaints,
        projectData.description || '',
        photoURLs,
        projectData.status || 'upcoming',
        projectData.difficulty || 'beginner' // Include difficulty
      );

      // 🎉 TRIGGER ACHIEVEMENT CHECK FOR PROJECT CREATION
      try {
        await triggerForAction('project_created', {
          projectName: projectData.name,
          difficulty: projectData.difficulty || 'beginner'
        });
        console.log('🎯 Achievement check triggered for project creation');
      } catch (error) {
        console.error('Error triggering project creation achievements:', error);
        // Don't throw - project creation should succeed even if achievements fail
      }

      return result;
    },
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error creating project:', error);
    },
    meta: {
      errorMessage: 'Failed to create project'
    }
  });
};

// Delete project mutation
export const useDeleteProject = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async (projectName) => {
      const result = await deleteProject(projectName);

      // 🎯 TRIGGER ACHIEVEMENT CHECK AFTER DELETION (recalculate stats)
      try {
        await triggerForAction('project_deleted', { projectName });
        console.log('🎯 Achievement check triggered for project deletion');
      } catch (error) {
        console.error('Error triggering project deletion achievements:', error);
      }

      return result;
    },
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
    },
    meta: {
      errorMessage: 'Failed to delete project'
    }
  });
};

// Update project status mutation - WITH COMPLETION TRACKING
export const useUpdateProjectStatus = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectName, newStatus }) => {
      const result = await updateProjectStatus(projectName, newStatus);

      // 🏆 TRIGGER COMPLETION ACHIEVEMENTS when project is completed
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
        // For other status changes, trigger general check
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
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error updating project status:', error);
    },
    meta: {
      errorMessage: 'Failed to update project status'
    }
  });
};

// Update project description mutation
export const useUpdateProjectDescription = () => {
  return useMutation({
    mutationFn: ({ projectName, newDescription }) => updateProjectDescription(projectName, newDescription),
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error updating project description:', error);
    },
    meta: {
      errorMessage: 'Failed to update project description'
    }
  });
};

// Update project difficulty mutation
export const useUpdateProjectDifficulty = () => {
  return useMutation({
    mutationFn: ({ projectName, newDifficulty }) => updateProjectDifficulty(projectName, newDifficulty),
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error updating project difficulty:', error);
    },
    meta: {
      errorMessage: 'Failed to update project difficulty'
    }
  });
};

// Add project photos mutation - WITH PHOTO ACHIEVEMENT TRACKING
export const useAddProjectPhotos = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectName, photoURLs }) => {
      const result = await addProjectPhotos(projectName, photoURLs);

      // 📸 TRIGGER PHOTO ACHIEVEMENTS
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
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error adding project photos:', error);
    },
    meta: {
      errorMessage: 'Failed to add project photos'
    }
  });
};

// Remove project photo mutation
export const useRemoveProjectPhoto = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectName, photoURL }) => {
      const result = await removeProjectPhoto(projectName, photoURL);

      // 🎯 TRIGGER GENERAL CHECK AFTER PHOTO REMOVAL (recalculate stats)
      try {
        await triggerForAction('photo_removed', { projectName });
      } catch (error) {
        console.error('Error triggering photo removal achievements:', error);
      }

      return result;
    },
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error removing project photo:', error);
    },
    meta: {
      errorMessage: 'Failed to remove project photo'
    }
  });
};

// =====================================
// PAINT MANAGEMENT MUTATIONS WITH GAMIFICATION
// =====================================

// Add paints to project mutation - WITH PAINT ACHIEVEMENT TRACKING
export const useAddPaintsToProject = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectId, paints }) => {
      const result = await addPaintsToProject(projectId, paints);

      // 🎨 TRIGGER PAINT ACHIEVEMENTS
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
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error adding paints to project:', error);
    },
    meta: {
      errorMessage: 'Failed to add paints to project'
    }
  });
};

// Remove paint from project mutation
export const useRemovePaintFromProject = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectId, paintId }) => {
      const result = await removePaintFromProject(projectId, paintId);

      // 🎯 TRIGGER GENERAL CHECK AFTER PAINT REMOVAL (recalculate stats)
      try {
        await triggerForAction('paint_removed', { projectId, paintId });
      } catch (error) {
        console.error('Error triggering paint removal achievements:', error);
      }

      return result;
    },
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error removing paint from project:', error);
    },
    meta: {
      errorMessage: 'Failed to remove paint from project'
    }
  });
};

// =====================================
// STEP MANAGEMENT MUTATIONS WITH GAMIFICATION
// =====================================

// Add project step mutation - WITH STEP ACHIEVEMENT TRACKING
export const useAddProjectStep = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectId, step }) => {
      const result = await addProjectStep(projectId, step);

      // 📝 TRIGGER STEP ACHIEVEMENTS
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
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error adding project step:', error);
    },
    meta: {
      errorMessage: 'Failed to add project step'
    }
  });
};

// Update project step mutation - WITH STEP COMPLETION TRACKING
export const useUpdateProjectStep = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectId, stepId, updates }) => {
      const result = await updateProjectStep(projectId, stepId, updates);

      // ✅ TRIGGER STEP COMPLETION ACHIEVEMENTS if step was completed
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
        // For other updates, trigger general check
        try {
          await triggerForAction('step_updated', { projectId, stepId });
        } catch (error) {
          console.error('Error triggering step update achievements:', error);
        }
      }

      return result;
    },
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error updating project step:', error);
    },
    meta: {
      errorMessage: 'Failed to update project step'
    }
  });
};

// Delete project step mutation
export const useDeleteProjectStep = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async ({ projectId, stepId }) => {
      const result = await deleteProjectStep(projectId, stepId);

      // 🎯 TRIGGER GENERAL CHECK AFTER STEP DELETION (recalculate stats)
      try {
        await triggerForAction('step_deleted', { projectId, stepId });
      } catch (error) {
        console.error('Error triggering step deletion achievements:', error);
      }

      return result;
    },
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error deleting project step:', error);
    },
    meta: {
      errorMessage: 'Failed to delete project step'
    }
  });
};

// Reorder project steps mutation
export const useReorderProjectSteps = () => {
  return useMutation({
    mutationFn: ({ projectId, steps }) => reorderProjectSteps(projectId, steps),
    onSuccess: () => {
      invalidateProjectQueries();
    },
    onError: (error) => {
      console.error('Error reordering project steps:', error);
    },
    meta: {
      errorMessage: 'Failed to reorder project steps'
    }
  });
};

// =====================================
// COMPOSITE HOOKS FOR COMMON PATTERNS
// =====================================

// Hook that provides project data and loading states for a specific filter
export const useProjectListData = (filter = 'all') => {
  const projectsQuery = useProjects(filter);
  const summaryQuery = useProjectSummary();

  return {
    projects: projectsQuery.data || [],
    summary: summaryQuery.data,
    isLoading: projectsQuery.isLoading || summaryQuery.isLoading,
    isError: projectsQuery.isError || summaryQuery.isError,
    error: projectsQuery.error || summaryQuery.error,
    refetch: () => {
      projectsQuery.refetch();
      summaryQuery.refetch();
    }
  };
};

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