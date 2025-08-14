// services/paints/index.js - Main export file for paint services
// This replaces the old paintService.js and organizes all paint-related functions

// Re-export all functions from individual service files
export * from './paintQueries.js';
export * from './paintMutations.js';
export * from './paintLevels.js';
export * from './paintSummary.js';
export * from './needToBuyService.js';

// Re-export from projectService for convenience
export { getAllProjects } from '../projects/index.js';