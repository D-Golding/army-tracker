// hooks/suggestions/useSuggestionCache.js
// React hook for suggestion cache management and monitoring

import { useState, useEffect, useCallback } from 'react';
import {
  getCachedSuggestions,
  setCachedSuggestions,
  clearCache,
  clearAllSuggestionCaches,
  cleanupOldCaches,
  clearOldestCaches,
  getCacheStats,
  updateCacheHitCount,
  CACHE_CONFIG
} from '../../services/suggestions/index.js';

export const useSuggestionCache = () => {
  const [cacheStats, setCacheStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh cache statistics
  const refreshStats = useCallback(() => {
    try {
      const stats = getCacheStats();
      setCacheStats(stats);
      return stats;
    } catch (error) {
      console.error('Error refreshing cache stats:', error);
      return null;
    }
  }, []);

  // Load initial stats
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Clear specific cache
  const clearSpecificCache = useCallback((manufacturer, game, faction = null, type = 'faction') => {
    try {
      const result = clearCache(manufacturer, game, faction, type);
      refreshStats();
      return result;
    } catch (error) {
      console.error('Error clearing specific cache:', error);
      return false;
    }
  }, [refreshStats]);

  // Clear all caches
  const clearAllCaches = useCallback(() => {
    try {
      const clearedCount = clearAllSuggestionCaches();
      refreshStats();
      return clearedCount;
    } catch (error) {
      console.error('Error clearing all caches:', error);
      return 0;
    }
  }, [refreshStats]);

  // Cleanup old/expired caches
  const cleanupExpired = useCallback(() => {
    try {
      setIsRefreshing(true);
      const cleanedCount = cleanupOldCaches();
      refreshStats();
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up caches:', error);
      return 0;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshStats]);

  // Free up space by removing oldest caches
  const freeSpace = useCallback((count = 5) => {
    try {
      setIsRefreshing(true);
      const removedCount = clearOldestCaches(count);
      refreshStats();
      return removedCount;
    } catch (error) {
      console.error('Error freeing cache space:', error);
      return 0;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshStats]);

  // Check if a specific cache exists
  const hasCachedData = useCallback((manufacturer, game, faction = null, type = 'faction') => {
    try {
      const cached = getCachedSuggestions(manufacturer, game, faction, type);
      return Boolean(cached && cached.data && cached.data.length > 0);
    } catch (error) {
      console.error('Error checking cache:', error);
      return false;
    }
  }, []);

  // Get cache info for specific context
  const getCacheInfo = useCallback((manufacturer, game, faction = null, type = 'faction') => {
    try {
      const cached = getCachedSuggestions(manufacturer, game, faction, type);
      if (!cached) return null;

      return {
        itemCount: cached.data ? cached.data.length : 0,
        cachedAt: cached.cachedAt,
        expiresAt: cached.expiresAt,
        hitCount: cached.hitCount || 0,
        isExpired: new Date() > new Date(cached.expiresAt),
        ageHours: Math.round((Date.now() - new Date(cached.cachedAt).getTime()) / (1000 * 60 * 60))
      };
    } catch (error) {
      console.error('Error getting cache info:', error);
      return null;
    }
  }, []);

  // Manual cache warming (preload common suggestions)
  const warmCache = useCallback(async (contexts = []) => {
    setIsRefreshing(true);
    let warmedCount = 0;

    try {
      // Import here to avoid circular dependency
      const { getSuggestionsWithCache } = await import('../../services/suggestions/index.js');

      for (const context of contexts) {
        const { manufacturer, game, faction, type } = context;

        try {
          await getSuggestionsWithCache(
            type || 'faction',
            manufacturer,
            game,
            faction,
            '', // empty search for general suggestions
            {
              maxResults: 50,
              useCache: true,
              context: 'warming'
            }
          );
          warmedCount++;
        } catch (error) {
          console.error(`Error warming cache for ${manufacturer}/${game}:`, error);
        }
      }

      refreshStats();
      return warmedCount;
    } catch (error) {
      console.error('Error warming caches:', error);
      return 0;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshStats]);

  // Get cache health status
  const getCacheHealth = useCallback(() => {
    if (!cacheStats) return null;

    const health = {
      status: 'good',
      issues: [],
      recommendations: []
    };

    // Check total cache size
    if (cacheStats.totalSizeKB > 5000) { // 5MB
      health.status = 'warning';
      health.issues.push('Large cache size');
      health.recommendations.push('Consider clearing old caches');
    }

    // Check number of caches
    if (cacheStats.totalCaches > 50) {
      health.status = 'warning';
      health.issues.push('Many cached contexts');
      health.recommendations.push('Clean up unused caches');
    }

    // Check hit rates (if we tracked them)
    if (cacheStats.avgHitCount < 2) {
      health.issues.push('Low cache utilization');
      health.recommendations.push('Review caching strategy');
    }

    // Check for corrupted caches (would show in errors)
    if (cacheStats.totalCaches > 0 && cacheStats.totalItems === 0) {
      health.status = 'error';
      health.issues.push('Corrupted cache data');
      health.recommendations.push('Clear all caches');
    }

    return health;
  }, [cacheStats]);

  // Auto-cleanup effect (run periodically)
  useEffect(() => {
    // Clean up expired caches on mount
    cleanupExpired();

    // Set up periodic cleanup (every 30 minutes)
    const cleanupInterval = setInterval(() => {
      cleanupExpired();
    }, 30 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, [cleanupExpired]);

  return {
    // State
    cacheStats,
    isRefreshing,

    // Actions
    refreshStats,
    clearSpecificCache,
    clearAllCaches,
    cleanupExpired,
    freeSpace,
    warmCache,

    // Queries
    hasCachedData,
    getCacheInfo,
    getCacheHealth,

    // Utilities
    formatCacheSize: (sizeKB) => {
      if (sizeKB < 1024) return `${sizeKB} KB`;
      return `${(sizeKB / 1024).toFixed(1)} MB`;
    },

    formatCacheAge: (cachedAt) => {
      const hours = Math.round((Date.now() - new Date(cachedAt).getTime()) / (1000 * 60 * 60));
      if (hours < 24) return `${hours}h ago`;
      const days = Math.round(hours / 24);
      return `${days}d ago`;
    },

    // Cache config for display
    config: CACHE_CONFIG,

    // Quick stats for display
    summary: cacheStats ? {
      totalCaches: cacheStats.totalCaches,
      totalItems: cacheStats.totalItems,
      totalSize: cacheStats.totalSizeKB,
      avgItems: cacheStats.avgItemsPerCache,
      avgHits: cacheStats.avgHitCount
    } : null
  };
};

// Hook for monitoring specific cache
export const useSpecificCacheMonitor = (manufacturer, game, faction = null, type = 'faction') => {
  const [cacheInfo, setCacheInfo] = useState(null);
  const { getCacheInfo, refreshStats } = useSuggestionCache();

  const refresh = useCallback(() => {
    const info = getCacheInfo(manufacturer, game, faction, type);
    setCacheInfo(info);
    return info;
  }, [getCacheInfo, manufacturer, game, faction, type]);

  // Refresh when dependencies change
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Record cache hit manually
  const recordHit = useCallback(() => {
    try {
      updateCacheHitCount(manufacturer, game, faction, type);
      refresh();
    } catch (error) {
      console.error('Error recording cache hit:', error);
    }
  }, [manufacturer, game, faction, type, refresh]);

  return {
    cacheInfo,
    refresh,
    recordHit,
    isCached: Boolean(cacheInfo),
    isExpired: cacheInfo ? cacheInfo.isExpired : false,
    itemCount: cacheInfo ? cacheInfo.itemCount : 0,
    ageHours: cacheInfo ? cacheInfo.ageHours : 0,
    hitCount: cacheInfo ? cacheInfo.hitCount : 0
  };
};