// hooks/paints/usePaintMutations.js
import { useMutation } from '@tanstack/react-query';
import { invalidatePaintQueries } from '../../lib/queryClient';
import { useGamificationOperations } from '../gamification/useGamificationOperations';
import {
  newPaint,
  deletePaint,
  refillPaint,
  reducePaint,
  moveToCollection,
  moveToWishlist,
  moveToListed,
} from '../../services/paints/index.js';

// Add new paint mutation - WITH ACHIEVEMENT TRACKING
export const useAddPaint = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async (paintData) => {
      const result = await newPaint(
        paintData.brand,
        paintData.airbrush,
        paintData.type,
        paintData.name,
        paintData.status,
        paintData.level,
        paintData.photoURL,
        paintData.sprayPaint,
        paintData.colour
      );

      // Trigger achievements
      try {
        await triggerForAction('paint_added_to_collection', {
          paintName: paintData.name,
          brand: paintData.brand,
          type: paintData.type,
          colour: paintData.colour,
          status: paintData.status
        });
      } catch (error) {
        console.error('Error triggering paint collection achievements:', error);
      }

      return result;
    },
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to add paint' }
  });
};

// Delete paint mutation
export const useDeletePaint = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async (paintName) => {
      const result = await deletePaint(paintName);

      try {
        await triggerForAction('paint_deleted', { paintName });
      } catch (error) {
        console.error('Error triggering paint deletion achievements:', error);
      }

      return result;
    },
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to delete paint' }
  });
};

// Move to collection mutation
export const useMoveToCollection = () => {
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async (paintName) => {
      const result = await moveToCollection(paintName);

      try {
        await triggerForAction('paint_moved_to_collection', { paintName });
      } catch (error) {
        console.error('Error triggering paint collection achievements:', error);
      }

      return result;
    },
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to move paint to collection' }
  });
};

// Basic mutations without gamification
export const useRefillPaint = () => {
  return useMutation({
    mutationFn: refillPaint,
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to refill paint' }
  });
};

export const useReducePaint = () => {
  return useMutation({
    mutationFn: reducePaint,
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to reduce paint level' }
  });
};

export const useMoveToWishlist = () => {
  return useMutation({
    mutationFn: moveToWishlist,
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to move paint to wishlist' }
  });
};

export const useMoveToListed = () => {
  return useMutation({
    mutationFn: moveToListed,
    onSuccess: () => invalidatePaintQueries(),
    meta: { errorMessage: 'Failed to move paint to listed' }
  });
};