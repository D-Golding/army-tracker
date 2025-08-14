// services/projects/index.js
// Central barrel export maintaining the same public API

// Import from utils
export { getCurrentUserId, getUserProjectsCollection } from './utils/projectHelpers.js';

// Import from core
export {
  createProject,
  createProjectLegacy,
  getAllProjects,
  deleteProjectById
} from './core/projectCore.js';

export {
  findProjectByName,
  findProjectById,
  deleteProject, // This is now the complex delete function from queries
  checkProjectPaints,
  getProjectsByStatus,
  getActiveProjects,
  getCompletedProjects,
  getProjectStatusSummary
} from './core/projectQueries.js';

// Import from features
export {
  addProjectPhotos,
  addProjectPhotosById,
  removeProjectPhotoById,
  removeProjectPhoto,
  updateProjectCoverPhoto,
  updateProjectPhotoMetadata // NEW: Photo metadata updating
} from './features/projectPhotos.js';

export {
  updateProjectDifficulty,
  updateProjectStatus,
  updateProjectDescription
} from './features/projectStatus.js';

export {
  addPaintsToProject,
  removePaintFromProject
} from './features/projectPaints.js';

export {
  addProjectStep,
  updateProjectStep,
  deleteProjectStep,
  reorderProjectSteps
} from './features/projectSteps.js';

// Import from sync
export {
  syncExistingProjectPaintRelations,
  cleanupOrphanedPaintProjectRelations
} from './sync/projectSync.js';