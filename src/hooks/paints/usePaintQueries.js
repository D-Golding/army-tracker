// hooks/paints/usePaintQueries.js
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import {
  // Data fetching - NON-PAGINATED
  getAllPaints,
  getCollectionPaints,
  getWishlistPaints,
  getAirbrushPaints,
  getPaintsByLevel,
  getInventorySummary,
  getAvailableColours,
  findPaintsByColour,
  getPaintsByColourAndStatus,

  // Data fetching - PAGINATED
  getPaintsPaginated,
  getCollectionPaintsPaginated,
  getWishlistPaintsPaginated,
  getAirbrushPaintsPaginated,
} from '../../services/paints/index.js';

// =====================================
// PAGINATED PAINT QUERIES
// =====================================

// Main paginated paints hook using useInfiniteQuery
export const usePaintsPaginated = (filter = 'all', pageSize = 20) => {
  return useInfiniteQuery({
    queryKey: queryKeys.paints.paginatedList(filter, pageSize),
    queryFn: async ({ pageParam }) => {
      const lastDoc = pageParam || null;

      switch (filter) {
        case 'all':
          return await getPaintsPaginated(pageSize, lastDoc);
        case 'collection':
          return await getCollectionPaintsPaginated(pageSize, lastDoc);
        case 'wishlist':
          return await getWishlistPaintsPaginated(pageSize, lastDoc);
        case 'airbrush':
          return await getAirbrushPaintsPaginated(pageSize, lastDoc);
        case 'almostempty':
          const collectionData = await getCollectionPaintsPaginated(pageSize * 2, lastDoc);
          const filteredPaints = collectionData.paints.filter(paint => paint.level <= 20);
          return {
            paints: filteredPaints.slice(0, pageSize),
            lastDoc: collectionData.lastDoc,
            hasMore: collectionData.hasMore && filteredPaints.length >= pageSize
          };
        case 'usedinprojects':
          const allData = await getPaintsPaginated(pageSize * 2, lastDoc);
          const projectPaints = allData.paints.filter(paint => paint.projects && paint.projects.length > 0);
          return {
            paints: projectPaints.slice(0, pageSize),
            lastDoc: allData.lastDoc,
            hasMore: allData.hasMore && projectPaints.length >= pageSize
          };
        default:
          return await getPaintsPaginated(pageSize, lastDoc);
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDoc : undefined;
    },
    initialPageParam: null,
    meta: {
      errorMessage: 'Failed to load paints'
    }
  });
};

// Helper hook to get all paginated data as a flat array
export const useFlattenedPaintsPaginated = (filter = 'all', pageSize = 20) => {
  const query = usePaintsPaginated(filter, pageSize);

  // Flatten all pages into a single array
  const paints = query.data?.pages?.flatMap(page => page.paints) || [];

  return {
    paints,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch: query.refetch
  };
};

// =====================================
// NON-PAGINATED PAINT QUERIES
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
          const collectionPaints = await getCollectionPaints();
          return collectionPaints.filter(paint => paint.level <= 20);
        case 'usedinprojects':
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
// COMPOSITE HOOKS FOR COMMON PATTERNS
// =====================================

// Hook that provides paint data and loading states for a specific filter - NON-PAGINATED
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

// Hook that provides paginated paint data and loading states
export const usePaintListDataPaginated = (filter = 'all', pageSize = 20) => {
  const paintsQuery = useFlattenedPaintsPaginated(filter, pageSize);
  const summaryQuery = usePaintSummary();

  return {
    paints: paintsQuery.paints,
    summary: summaryQuery.data,
    isLoading: paintsQuery.isLoading || summaryQuery.isLoading,
    isError: paintsQuery.isError || summaryQuery.isError,
    error: paintsQuery.error || summaryQuery.error,
    hasNextPage: paintsQuery.hasNextPage,
    fetchNextPage: paintsQuery.fetchNextPage,
    isFetchingNextPage: paintsQuery.isFetchingNextPage,
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