// hooks/usePaints.js - Complete Paint Data Management with Achievement Triggers and Project Support
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidatePaintQueries, handleQueryError } from '../lib/queryClient';
import { useGamificationOperations } from './useGamification';
import {
  // Data fetching
  getAllPaints,
  getCollectionPaints,
  getWishlistPaints,
  getAirbrushPaints,
  getPaintsByLevel,
  getInventorySummary,
  getAvailableColours,
  findPaintsByColour,
  getPaintsByColourAndStatus,

  // Paint operations
  newPaint,
  deletePaint,
  refillPaint,
  reducePaint,
  moveToCollection,
  moveToWishlist,
  moveToListed,

  // Paint updates
  updatePaintLevel,
  updatePaintBrand,
  updatePaintType,
  updatePaintName,
  updatePaintPhoto,
  updatePaintColour,
  updateSprayPaintStatus,

  // Project operations
  updatePaintProjects,
} from '../services/paints/index.js';

// =====================================
// PAINT LIST QUERIES
// =====================================

// Main paints query with filter support
export const usePaints = (filter = 'all') => {
  return useQuery({
    queryKey: queryKeys.paints.list(filter),
    queryFn: async () => {
      switch (filter) {
        case 'all':
          return await getAllPaints();
        case 'collection':
          return await getCollectionPaints();
        case 'wishlist':
          return await getWishlistPaints();
        case 'airbrush':
          return await getAirbrushPaints();
        case 'almostempty':
          // Get all collection paints and filter client-side to avoid index requirement
          const collectionPaints = await getCollectionPaints();
          return collectionPaints.filter(paint => paint.level <= 20);
        case 'usedinprojects':
          // Get all paints and filter for those with projects
          const allPaints = await getAllPaints();
          return allPaints.filter(paint => paint.projects && paint.projects.length > 0);
        default:
          return await getAllPaints();
      }
    },
    meta: {
      errorMessage: 'Failed to load paints'
    }
  });
};

// Colour-based queries
export const usePaintsByColour = (colour) => {
  return useQuery({
    queryKey: queryKeys.paints.byColour(colour),
    queryFn: () => findPaintsByColour(colour),
    enabled: !!colour,
    meta: {
      errorMessage: 'Failed to load paints by colour'
    }
  });
};

export const usePaintsByColourAndStatus = (colour, status) => {
  return useQuery({
    queryKey: queryKeys.paints.byColourAndStatus(colour, status),
    queryFn: () => getPaintsByColourAndStatus(colour, status),
    enabled: !!colour && !!status,
    meta: {
      errorMessage: 'Failed to load paints by colour and status'
    }
  });
};

export const useAvailableColours = () => {
  return useQuery({
    queryKey: queryKeys.paints.colours(),
    queryFn: getAvailableColours,
    meta: {
      errorMessage: 'Failed to load available colours'
    }
  });
};

// Inventory summary query
export const usePaintSummary = () => {
  return useQuery({
    queryKey: queryKeys.paints.summary(),
    queryFn: getInventorySummary,
    meta: {
      errorMessage: 'Failed to load paint summary'
    }
  });
};

// =====================================
// PAINT MUTATIONS WITH GAMIFICATION
// =====================================

// Add new paint mutation - WITH ACHIEVEMENT TRACKING
export const useAddPaint = () => {
  const queryClient = useQueryClient();
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async (paintData) => {
      console.log('usePaints - paintData received:', paintData);
      console.log('usePaints - calling newPaint with:', {
        brand: paintData.brand,
        airbrush: paintData.airbrush,
        type: paintData.type,
        name: paintData.name,
        status: paintData.status,
        level: paintData.level,
        photoURL: paintData.photoURL,
        sprayPaint: paintData.sprayPaint,
        colour: paintData.colour
      });

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

      // 🎨 TRIGGER PAINT COLLECTION ACHIEVEMENTS
      try {
        await triggerForAction('paint_added_to_collection', {
          paintName: paintData.name,
          brand: paintData.brand,
          type: paintData.type,
          colour: paintData.colour,
          status: paintData.status
        });
        console.log('🎨 Paint collection achievements triggered for:', paintData.name);
      } catch (error) {
        console.error('Error triggering paint collection achievements:', error);
        // Don't throw - paint addition should succeed even if achievements fail
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate all paint-related queries
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error adding paint:', error);
    },
    meta: {
      errorMessage: 'Failed to add paint'
    }
  });
};

// Delete paint mutation - WITH ACHIEVEMENT TRACKING
export const useDeletePaint = () => {
  const queryClient = useQueryClient();
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async (paintName) => {
      const result = await deletePaint(paintName);

      // 🎯 TRIGGER GENERAL CHECK AFTER PAINT DELETION (recalculate stats)
      try {
        await triggerForAction('paint_deleted', { paintName });
        console.log('🎯 Paint deletion achievement check triggered');
      } catch (error) {
        console.error('Error triggering paint deletion achievements:', error);
      }

      return result;
    },
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error deleting paint:', error);
    },
    meta: {
      errorMessage: 'Failed to delete paint'
    }
  });
};

// Refill paint mutation
export const useRefillPaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refillPaint,
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error refilling paint:', error);
    },
    meta: {
      errorMessage: 'Failed to refill paint'
    }
  });
};

// Reduce paint mutation
export const useReducePaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reducePaint,
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error reducing paint:', error);
    },
    meta: {
      errorMessage: 'Failed to reduce paint level'
    }
  });
};

// Move paint to collection mutation - WITH ACHIEVEMENT TRACKING
export const useMoveToCollection = () => {
  const queryClient = useQueryClient();
  const { triggerForAction } = useGamificationOperations();

  return useMutation({
    mutationFn: async (paintName) => {
      const result = await moveToCollection(paintName);

      // 🎨 TRIGGER PAINT COLLECTION ACHIEVEMENTS (new paint in collection)
      try {
        await triggerForAction('paint_moved_to_collection', { paintName });
        console.log('🎨 Paint moved to collection achievements triggered for:', paintName);
      } catch (error) {
        console.error('Error triggering paint collection achievements:', error);
      }

      return result;
    },
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error moving paint to collection:', error);
    },
    meta: {
      errorMessage: 'Failed to move paint to collection'
    }
  });
};

// Move paint to wishlist mutation
export const useMoveToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveToWishlist,
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error moving paint to wishlist:', error);
    },
    meta: {
      errorMessage: 'Failed to move paint to wishlist'
    }
  });
};

// Move paint to listed mutation
export const useMoveToListed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveToListed,
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error moving paint to listed:', error);
    },
    meta: {
      errorMessage: 'Failed to move paint to listed'
    }
  });
};

// Update paint projects mutation - NEW
export const useUpdatePaintProjects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paintName, projectIds }) => updatePaintProjects(paintName, projectIds),
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error updating paint projects:', error);
    },
    meta: {
      errorMessage: 'Failed to update paint projects'
    }
  });
};

// =====================================
// PAINT UPDATE MUTATIONS
// =====================================

// Update paint level mutation
export const useUpdatePaintLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paintName, newLevel }) => updatePaintLevel(paintName, newLevel),
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error updating paint level:', error);
    },
    meta: {
      errorMessage: 'Failed to update paint level'
    }
  });
};

// Update paint brand mutation
export const useUpdatePaintBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paintName, newBrand }) => updatePaintBrand(paintName, newBrand),
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error updating paint brand:', error);
    },
    meta: {
      errorMessage: 'Failed to update paint brand'
    }
  });
};

// Update paint type mutation
export const useUpdatePaintType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paintName, newType }) => updatePaintType(paintName, newType),
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error updating paint type:', error);
    },
    meta: {
      errorMessage: 'Failed to update paint type'
    }
  });
};

// Update paint name mutation
export const useUpdatePaintName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paintName, newName }) => updatePaintName(paintName, newName),
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error updating paint name:', error);
    },
    meta: {
      errorMessage: 'Failed to update paint name'
    }
  });
};

// Update paint colour mutation
export const useUpdatePaintColour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paintName, newColour }) => updatePaintColour(paintName, newColour),
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error updating paint colour:', error);
    },
    meta: {
      errorMessage: 'Failed to update paint colour'
    }
  });
};

// Update paint photo mutation
export const useUpdatePaintPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paintName, photoURL }) => updatePaintPhoto(paintName, photoURL),
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error updating paint photo:', error);
    },
    meta: {
      errorMessage: 'Failed to update paint photo'
    }
  });
};

// Update spray paint status mutation
export const useUpdateSprayPaintStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paintName, isSprayPaint }) => updateSprayPaintStatus(paintName, isSprayPaint),
    onSuccess: () => {
      invalidatePaintQueries();
    },
    onError: (error) => {
      console.error('Error updating spray paint status:', error);
    },
    meta: {
      errorMessage: 'Failed to update spray paint status'
    }
  });
};

// =====================================
// COMPOSITE HOOKS FOR COMMON PATTERNS
// =====================================

// Hook that provides paint data and loading states for a specific filter
export const usePaintListData = (filter = 'all') => {
  const paintsQuery = usePaints(filter);
  const summaryQuery = usePaintSummary();

  return {
    paints: paintsQuery.data || [],
    summary: summaryQuery.data,
    isLoading: paintsQuery.isLoading || summaryQuery.isLoading,
    isError: paintsQuery.isError || summaryQuery.isError,
    error: paintsQuery.error || summaryQuery.error,
    refetch: () => {
      paintsQuery.refetch();
      summaryQuery.refetch();
    }
  };
};

// Hook that provides paint data with colour filtering
export const usePaintListDataWithColour = (filter = 'all', colour = null) => {
  const paintsQuery = usePaints(filter);
  const colourPaintsQuery = usePaintsByColour(colour);
  const summaryQuery = usePaintSummary();

  // Use colour-filtered data if colour is specified, otherwise use regular filter
  const paints = colour ? (colourPaintsQuery.data || []) : (paintsQuery.data || []);
  const isLoading = colour
    ? (colourPaintsQuery.isLoading || summaryQuery.isLoading)
    : (paintsQuery.isLoading || summaryQuery.isLoading);
  const isError = colour
    ? (colourPaintsQuery.isError || summaryQuery.isError)
    : (paintsQuery.isError || summaryQuery.isError);

  return {
    paints,
    summary: summaryQuery.data,
    isLoading,
    isError,
    error: colour ? (colourPaintsQuery.error || summaryQuery.error) : (paintsQuery.error || summaryQuery.error),
    refetch: () => {
      if (colour) {
        colourPaintsQuery.refetch();
      } else {
        paintsQuery.refetch();
      }
      summaryQuery.refetch();
    }
  };
};

// Hook that provides all paint operations for a component
export const usePaintOperations = () => {
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