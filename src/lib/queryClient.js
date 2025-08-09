// lib/queryClient.js - Professional React Query Configuration
import { QueryClient } from '@tanstack/react-query';

// Query key factory for consistent cache keys
export const queryKeys = {
  // Paint keys
  paints: {
    all: ['paints'],
    lists: () => [...queryKeys.paints.all, 'list'],
    list: (filter) => [...queryKeys.paints.lists(), filter],
    summary: () => [...queryKeys.paints.all, 'summary'],
    detail: (paintName) => [...queryKeys.paints.all, 'detail', paintName],
  },

  // Project keys
  projects: {
    all: ['projects'],
    lists: () => [...queryKeys.projects.all, 'list'],
    list: (filter) => [...queryKeys.projects.lists(), filter],
    summary: () => [...queryKeys.projects.all, 'summary'],
    detail: (projectId) => [...queryKeys.projects.all, 'detail', projectId],
    detailByName: (projectName) => [...queryKeys.projects.all, 'detailByName', projectName],
    paintCheck: (projectName) => [...queryKeys.projects.all, 'paintCheck', projectName],
  },

  // Usage keys
  usage: {
    all: ['usage'],
    stats: () => [...queryKeys.usage.all, 'stats'],
  },
};

// Create the QueryClient with professional configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: Data is considered fresh for 30 seconds
      staleTime: 30 * 1000,

      // Cache time: Data stays in cache for 5 minutes after becoming unused
      gcTime: 5 * 60 * 1000,

      // Retry failed queries up to 3 times with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('User not authenticated')) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus for real-time feel
      refetchOnWindowFocus: true,

      // Refetch on mount if data is stale
      refetchOnMount: 'always',

      // Don't refetch on reconnect unless data is stale
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations once on network errors
      retry: (failureCount, error) => {
        if (error?.message?.includes('User not authenticated')) {
          return false;
        }
        return failureCount < 1;
      },

      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Helper function for error handling
export const handleQueryError = (error) => {
  console.error('Query error:', error);

  // You can add global error reporting here
  // e.g., send to error tracking service

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('User not authenticated')) {
      // Handle auth errors - could redirect to login
      return 'Please sign in to continue';
    }

    if (error.message.includes('Permission denied')) {
      return 'You don\'t have permission to access this data';
    }

    if (error.message.includes('offline')) {
      return 'You appear to be offline. Please check your connection.';
    }

    // Generic error message
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

// Cache invalidation helpers
export const invalidatePaintQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.paints.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.usage.all });
};

export const invalidateProjectQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.usage.all });
};

export const invalidateUsageQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.usage.all });
};