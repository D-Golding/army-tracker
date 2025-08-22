// services/suggestions/features/suggestionCaching.js
// Client-side cache management for suggestion performance

import { normalizeText, createCacheKey } from '../utils/textNormalization.js';

// Cache configuration
export const CACHE_CONFIG = {
  MAX_ITEMS_PER_CACHE: 100,        // Increased to 100 items
  TTL_DAYS: 14,                    // 2 weeks
  VERSION: '1.0',                  // For cache invalidation
  MAX_TOTAL_CACHES: 50            // Prevent unlimited cache growth
};

// Get cached suggestions
export const getCachedSuggestions = (manufacturer, game, faction = null, type = 'faction') => {
  try {
    const cacheKey = createCacheKey(manufacturer, game, faction);
    const fullKey = `${cacheKey}_${type}`;

    const cached = localStorage.getItem(fullKey);
    if (!cached) return null;

    const parsed = JSON.parse(cached);

    // Check version compatibility
    if (parsed.version !== CACHE_CONFIG.VERSION) {
      localStorage.removeItem(fullKey);
      return null;
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(parsed.expiresAt);

    if (now > expiresAt) {
      localStorage.removeItem(fullKey);
      return null;
    }

    // Return cached data
    return {
      data: parsed.data || [],
      cachedAt: parsed.cachedAt,
      expiresAt: parsed.expiresAt,
      hitCount: (parsed.hitCount || 0) + 1
    };

  } catch (error) {
    console.error('Error reading suggestion cache:', error);
    return null;
  }
};

// Set cached suggestions
export const setCachedSuggestions = (manufacturer, game, faction = null, type = 'faction', data = []) => {
  try {
    const cacheKey = createCacheKey(manufacturer, game, faction);
    const fullKey = `${cacheKey}_${type}`;

    // Limit data to max items and ensure it's an array
    const limitedData = Array.isArray(data) ? data.slice(0, CACHE_CONFIG.MAX_ITEMS_PER_CACHE) : [];

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (CACHE_CONFIG.TTL_DAYS * 24 * 60 * 60 * 1000));

    const cacheData = {
      data: limitedData,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      version: CACHE_CONFIG.VERSION,
      manufacturer: normalizeText(manufacturer),
      game: normalizeText(game),
      faction: faction ? normalizeText(faction) : null,
      type: type,
      itemCount: limitedData.length,
      hitCount: 0
    };

    // Check if we're approaching localStorage limits
    const dataSize = JSON.stringify(cacheData).length;
    if (dataSize > 1024 * 1024) { // 1MB limit per cache entry
      console.warn('Cache data too large, skipping cache set');
      return false;
    }

    // Clean up old caches before adding new one
    cleanupOldCaches();

    localStorage.setItem(fullKey, JSON.stringify(cacheData));

    console.log(`✅ Cached ${limitedData.length} suggestions for ${manufacturer}/${game}${faction ? `/${faction}` : ''} (${type})`);
    return true;

  } catch (error) {
    console.error('Error setting suggestion cache:', error);

    // If quota exceeded, try clearing some old caches and retry once
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old caches');
      clearOldestCaches(5);

      try {
        localStorage.setItem(fullKey, JSON.stringify(cacheData));
        return true;
      } catch (retryError) {
        console.error('Failed to cache even after cleanup:', retryError);
        return false;
      }
    }

    return false;
  }
};

// Update cache hit count (for analytics)
export const updateCacheHitCount = (manufacturer, game, faction = null, type = 'faction') => {
  try {
    const cacheKey = createCacheKey(manufacturer, game, faction);
    const fullKey = `${cacheKey}_${type}`;

    const cached = localStorage.getItem(fullKey);
    if (!cached) return;

    const parsed = JSON.parse(cached);
    parsed.hitCount = (parsed.hitCount || 0) + 1;
    parsed.lastHit = new Date().toISOString();

    localStorage.setItem(fullKey, JSON.stringify(parsed));

  } catch (error) {
    console.error('Error updating cache hit count:', error);
  }
};

// Clear specific cache
export const clearCache = (manufacturer, game, faction = null, type = 'faction') => {
  try {
    const cacheKey = createCacheKey(manufacturer, game, faction);
    const fullKey = `${cacheKey}_${type}`;

    localStorage.removeItem(fullKey);
    console.log(`🗑️ Cleared cache for ${manufacturer}/${game}${faction ? `/${faction}` : ''} (${type})`);
    return true;

  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// Clear all suggestion caches
export const clearAllSuggestionCaches = () => {
  try {
    const keysToRemove = [];

    // Find all suggestion cache keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('suggestions_cache_')) {
        keysToRemove.push(key);
      }
    }

    // Remove them
    keysToRemove.forEach(key => localStorage.removeItem(key));

    console.log(`🗑️ Cleared ${keysToRemove.length} suggestion caches`);
    return keysToRemove.length;

  } catch (error) {
    console.error('Error clearing all caches:', error);
    return 0;
  }
};

// Clean up expired caches
export const cleanupOldCaches = () => {
  try {
    const now = new Date();
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('suggestions_cache_')) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed = JSON.parse(cached);
            const expiresAt = new Date(parsed.expiresAt);

            // Remove if expired or wrong version
            if (now > expiresAt || parsed.version !== CACHE_CONFIG.VERSION) {
              keysToRemove.push(key);
            }
          }
        } catch (parseError) {
          // Remove corrupted cache entries
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    if (keysToRemove.length > 0) {
      console.log(`🧹 Cleaned up ${keysToRemove.length} expired/invalid caches`);
    }

    return keysToRemove.length;

  } catch (error) {
    console.error('Error cleaning up caches:', error);
    return 0;
  }
};

// Clear oldest caches (when quota exceeded)
export const clearOldestCaches = (count = 5) => {
  try {
    const cacheEntries = [];

    // Collect all cache entries with timestamps
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('suggestions_cache_')) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed = JSON.parse(cached);
            cacheEntries.push({
              key,
              cachedAt: new Date(parsed.cachedAt),
              hitCount: parsed.hitCount || 0
            });
          }
        } catch (parseError) {
          // Add corrupted entries for removal
          cacheEntries.push({
            key,
            cachedAt: new Date(0),
            hitCount: 0
          });
        }
      }
    }

    // Sort by oldest first, then by lowest hit count
    cacheEntries.sort((a, b) => {
      if (a.cachedAt.getTime() !== b.cachedAt.getTime()) {
        return a.cachedAt.getTime() - b.cachedAt.getTime();
      }
      return a.hitCount - b.hitCount;
    });

    // Remove the oldest/least used caches
    const toRemove = cacheEntries.slice(0, count);
    toRemove.forEach(entry => localStorage.removeItem(entry.key));

    console.log(`🗑️ Removed ${toRemove.length} oldest caches to free space`);
    return toRemove.length;

  } catch (error) {
    console.error('Error clearing oldest caches:', error);
    return 0;
  }
};

// Get cache statistics (for debugging/admin)
export const getCacheStats = () => {
  try {
    const stats = {
      totalCaches: 0,
      totalItems: 0,
      totalSize: 0,
      oldestCache: null,
      newestCache: null,
      mostUsedCache: null,
      cachesByType: {},
      avgHitCount: 0
    };

    let totalHits = 0;
    let oldestDate = new Date();
    let newestDate = new Date(0);
    let maxHits = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('suggestions_cache_')) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed = JSON.parse(cached);
            const cacheDate = new Date(parsed.cachedAt);
            const hitCount = parsed.hitCount || 0;

            stats.totalCaches++;
            stats.totalItems += parsed.itemCount || 0;
            stats.totalSize += cached.length;

            // Track by type
            const type = parsed.type || 'unknown';
            stats.cachesByType[type] = (stats.cachesByType[type] || 0) + 1;

            // Track dates and hits
            totalHits += hitCount;

            if (cacheDate < oldestDate) {
              oldestDate = cacheDate;
              stats.oldestCache = key;
            }

            if (cacheDate > newestDate) {
              newestDate = cacheDate;
              stats.newestCache = key;
            }

            if (hitCount > maxHits) {
              maxHits = hitCount;
              stats.mostUsedCache = key;
            }
          }
        } catch (parseError) {
          // Count corrupted caches
          stats.totalCaches++;
        }
      }
    }

    stats.avgHitCount = stats.totalCaches > 0 ? Math.round(totalHits / stats.totalCaches) : 0;
    stats.avgItemsPerCache = stats.totalCaches > 0 ? Math.round(stats.totalItems / stats.totalCaches) : 0;
    stats.totalSizeKB = Math.round(stats.totalSize / 1024);

    return stats;

  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
};