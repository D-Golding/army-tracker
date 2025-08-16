// hooks/paints/usePaintUpdates.js
import { useMutation } from '@tanstack/react-query';
import { invalidatePaintQueries } from '../../lib/queryClient';
import {
  updatePaintLevel,
  updatePaintBrand,
  updatePaintType,
  updatePaintName,
  updatePaintPhoto,
  updatePaintColour,
  updateSprayPaintStatus,
  updatePaintProjects,
} from '../../services/paints/index.js';

// Update paint level mutation
export const useUpdatePaintLevel = () => {
  return useMutation({
    mutationFn: ({ paintName, newLevel }) => updatePaintLevel(paintName, newLevel),
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to update paint level' }
  });
};

// Update paint brand mutation
export const useUpdatePaintBrand = () => {
  return useMutation({
    mutationFn: ({ paintName, newBrand }) => updatePaintBrand(paintName, newBrand),
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to update paint brand' }
  });
};

// Update paint type mutation
export const useUpdatePaintType = () => {
  return useMutation({
    mutationFn: ({ paintName, newType }) => updatePaintType(paintName, newType),
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to update paint type' }
  });
};

// Update paint name mutation
export const useUpdatePaintName = () => {
  return useMutation({
    mutationFn: ({ paintName, newName }) => updatePaintName(paintName, newName),
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to update paint name' }
  });
};

// Update paint colour mutation
export const useUpdatePaintColour = () => {
  return useMutation({
    mutationFn: ({ paintName, newColour }) => updatePaintColour(paintName, newColour),
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to update paint colour' }
  });
};

// Update paint photo mutation
export const useUpdatePaintPhoto = () => {
  return useMutation({
    mutationFn: ({ paintName, photoURL }) => updatePaintPhoto(paintName, photoURL),
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to update paint photo' }
  });
};

// Update spray paint status mutation
export const useUpdateSprayPaintStatus = () => {
  return useMutation({
    mutationFn: ({ paintName, isSprayPaint }) => updateSprayPaintStatus(paintName, isSprayPaint),
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to update spray paint status' }
  });
};

// Update paint projects mutation
export const useUpdatePaintProjects = () => {
  return useMutation({
    mutationFn: ({ paintName, projectIds }) => updatePaintProjects(paintName, projectIds),
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to update paint projects' }
  });
};

// Composite operations hook
export const usePaintOperations = () => {
  // Import the mutation hooks we need
  const addPaint = useAddPaint();
  const deletePaint = useDeletePaint();
  const refillPaint = useRefillPaint();
  const reducePaint = useReducePaint();
  const moveToCollection = useMoveToCollection();
  const moveToWishlist = useMoveToWishlist();
  const moveToListed = useMoveToListed();
  const updatePaintProjects = useUpdatePaintProjects();

  return {
    addPaint: addPaint.mutateAsync,
    deletePaint: deletePaint.mutateAsync,
    refillPaint: refillPaint.mutateAsync,
    reducePaint: reducePaint.mutateAsync,
    moveToCollection: moveToCollection.mutateAsync,
    moveToWishlist: moveToWishlist.mutateAsync,
    moveToListed: moveToListed.mutateAsync,
    updatePaintProjects: updatePaintProjects.mutateAsync,

    // Loading states
    isAdding: addPaint.isPending,
    isDeleting: deletePaint.isPending,
    isRefilling: refillPaint.isPending,
    isReducing: reducePaint.isPending,
    isMoving: moveToCollection.isPending || moveToWishlist.isPending || moveToListed.isPending,
    isUpdatingProjects: updatePaintProjects.isPending,

    // Combined loading state
    isLoading: addPaint.isPending || deletePaint.isPending || refillPaint.isPending ||
               reducePaint.isPending || moveToCollection.isPending ||
               moveToWishlist.isPending || moveToListed.isPending ||
               updatePaintProjects.isPending,
  };
};

// Note: Import statements for usePaintOperations
import {
  useAddPaint,
  useDeletePaint,
  useRefillPaint,
  useReducePaint,
  useMoveToCollection,
  useMoveToWishlist,
  useMoveToListed
} from './usePaintMutations';