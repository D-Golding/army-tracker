// hooks/useUsageStats.js - Usage Statistics Hook
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { getInventorySummary } from '../services/paints/index.js';
import { getProjectStatusSummary } from '../services/projects/index.js';

// Combined usage statistics query
export const useUsageStats = () => {
  return useQuery({
    queryKey: queryKeys.usage.stats(),
    queryFn: async () => {
      const [paintSummary, projectSummary] = await Promise.all([
        getInventorySummary(),
        getProjectStatusSummary()
      ]);

      return {
        paints: paintSummary.collection, // Number of paints in collection
        projects: projectSummary.total,  // Total number of projects
        paintSummary,
        projectSummary
      };
    },
    meta: {
      errorMessage: 'Failed to load usage statistics'
    }
  });
};