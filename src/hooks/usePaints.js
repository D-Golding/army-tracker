// hooks/usePaints.js (compatibility barrel export)
// Re-exports from split paint hooks for backward compatibility

// All paint queries
export {
  usePaintsPaginated,
  useFlattenedPaintsPaginated,
  usePaints,
  usePaintsByColour,
  usePaintsByColourAndStatus,
  useAvailableColours,
  usePaintSummary,
  usePaintListData,
  usePaintListDataPaginated,
  usePaintListDataWithColour
} from './paints/usePaintQueries';

// Paint mutations and operations
export {
  useAddPaint,
  useDeletePaint,
  useMoveToCollection,
  useRefillPaint,
  useReducePaint,
  useMoveToWishlist,
  useMoveToListed
} from './paints/usePaintMutations';

// Paint updates and operations
export {
  useUpdatePaintLevel,
  useUpdatePaintBrand,
  useUpdatePaintType,
  useUpdatePaintName,
  useUpdatePaintPhoto,
  useUpdatePaintColour,
  useUpdateSprayPaintStatus,
  useUpdatePaintProjects,
  usePaintOperations
} from './paints/usePaintUpdates';

// Default export for backward compatibility
export { usePaints as default } from './paints/usePaintQueries';