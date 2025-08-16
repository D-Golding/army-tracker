// hooks/useProjects.js (compatibility barrel export)
// Re-exports from split project hooks for backward compatibility

// All project queries
export {
  useProjectsPaginated,
  useFlattenedProjectsPaginated,
  useProjects,
  useProject,
  useProjectSummary,
  useProjectPaintCheck,
  useProjectListData,
  useProjectListDataPaginated
} from './projects/useProjectQueries';

// All project mutations and operations
export {
  useCreateProject,
  useDeleteProject,
  useUpdateProjectStatus,
  useUpdateProjectDescription,
  useUpdateProjectDifficulty,
  useAddProjectPhotos,
  useRemoveProjectPhoto,
  useAddPaintsToProject,
  useRemovePaintFromProject,
  useAddProjectStep,
  useUpdateProjectStep,
  useDeleteProjectStep,
  useReorderProjectSteps,
  useProjectOperations
} from './projects/useProjectMutations';

// Default export for backward compatibility
export { useProjects as default } from './projects/useProjectQueries';