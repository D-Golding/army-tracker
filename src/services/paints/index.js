// services/paints/index.js - Main export file for paint services with pagination support
// This replaces the old paintService.js and organizes all paint-related functions

// Re-export all functions from individual service files
export * from './paintQueries.js';
export * from './paintMutations.js';
export * from './paintLevels.js';
export * from './paintSummary.js';
export * from './needToBuyService.js';

// Re-export from projectService for convenience
export { getAllProjects } from '../projects/index.js';

// Explicitly re-export key functions for clarity (these are already exported by the * above, but listed for reference)

// From paintQueries.js - NON-PAGINATED (existing)
// export { getAllPaints, getCollectionPaints, getWishlistPaints, getListedPaints, getAirbrushPaints, getSprayPaints };
// export { findPaintBrand, findPaintType, findPaintName, findPaintByStatus, findPaintsByColour };
// export { getAvailableColours, getPaintsByColourAndStatus, getPaintsByLevel, showPaintLevel };

// From paintQueries.js - PAGINATED (new)
// export { getPaintsPaginated, getCollectionPaintsPaginated, getWishlistPaintsPaginated, getAirbrushPaintsPaginated };

// From paintMutations.js
// export { newPaint, deletePaint, moveToCollection, moveToWishlist, moveToListed };
// export { addPaintToProject, removePaintFromProject, updatePaintProjects };
// export { updatePaintBrand, updatePaintType, updatePaintName, updatePaintColour, updatePaintPhoto, updateSprayPaintStatus };
// export { addMultiplePaints, removeEmptyPaints };

// From paintLevels.js
// export { refillPaint, reducePaint, updatePaintLevel };

// From paintSummary.js
// export { getInventorySummary };

// From needToBuyService.js
// export { addToNeedToBuy, removeFromNeedToBuy, getNeedToBuyList };