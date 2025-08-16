// hooks/projects/useProjectQueries.js
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import {
  // Data fetching - NON-PAGINATED
  getAllProjects,
  getProjectsByStatus,
  getProjectStatusSummary,
  checkProjectPaints,
  findProjectById,

  // Data fetching - PAGINATED
  getProjectsPaginated,
  getProjectsByStatusPaginated,
} from '../../services/projects/index.js';

// =====================================
// PAGINATED PROJECT QUERIES
// =====================================

// Main paginated projects hook using useInfiniteQuery
export const useProjectsPaginated = (filter = 'all', pageSize = 5) => {
  return useInfiniteQuery({
    queryKey: queryKeys.projects.paginatedList(filter, pageSize),
    queryFn: async ({ pageParam }) => {
      const lastDoc = pageParam || null;

      switch (filter) {
        case 'all':
          return await getProjectsPaginated(pageSize, lastDoc);
        case 'upcoming':
        case 'started':
        case 'completed':
          return await getProjectsByStatusPaginated(filter, pageSize, lastDoc);
        default:
          return await getProjectsPaginated(pageSize, lastDoc);
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDoc : undefined;
    },
    initialPageParam: null,
    meta: {
      errorMessage: 'Failed to load projects'
    }
  });
};

// Helper hook to get all paginated data as a flat array
export const useFlattenedProjectsPaginated = (filter = 'all', pageSize = 5) => {
  const query = useProjectsPaginated(filter, pageSize);

  // Flatten all pages into a single array
  const projects = query.data?.pages?.flatMap(page => page.projects) || [];

  return {
    projects,
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
// NON-PAGINATED PROJECT QUERIES
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
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
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
    enabled: !!projectName,
    meta: {
      errorMessage: 'Failed to check project paints'
    }
  });
};

// =====================================
// COMPOSITE HOOKS FOR COMMON PATTERNS
// =====================================

// Hook that provides project data and loading states for a specific filter - NON-PAGINATED
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

// Hook that provides paginated project data and loading states
export const useProjectListDataPaginated = (filter = 'all', pageSize = 5) => {
  const projectsQuery = useFlattenedProjectsPaginated(filter, pageSize);
  const summaryQuery = useProjectSummary();

  return {
    projects: projectsQuery.projects,
    summary: summaryQuery.data,
    isLoading: projectsQuery.isLoading || summaryQuery.isLoading,
    isError: projectsQuery.isError || summaryQuery.isError,
    error: projectsQuery.error || summaryQuery.error,
    hasNextPage: projectsQuery.hasNextPage,
    fetchNextPage: projectsQuery.fetchNextPage,
    isFetchingNextPage: projectsQuery.isFetchingNextPage,
    refetch: () => {
      projectsQuery.refetch();
      summaryQuery.refetch();
    }
  };
};