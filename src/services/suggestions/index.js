// services/suggestions/index.js
// Central barrel export for all suggestion functionality

// Core operations
export {
  createSuggestion,
  recordSuggestionUsage,
  getSuggestion,
  updateSuggestion,
  deleteSuggestion
} from './core/suggestionCore.js';

// Query operations
export {
  getFactionSuggestions,
  getUnitSuggestions,
  getAllFactions,
  getAllUnits,
  searchAllSuggestions,
  getSuggestionStats
} from './core/suggestionQueries.js';

// Validation utilities
export {
  validateSuggestionInput,
  validateSuggestionQuery,
  validateSuggestionMetadata,
  validateModerationData
} from './core/suggestionValidation.js';

// Recording operations
export {
  recordFactionUsage,
  recordUnitUsage,
  recordManufacturerUsage,
  recordGameUsage,
  recordBatchUsage,
  recordProjectCreationSuggestions,
  getRecordingStats
} from './features/suggestionRecording.js';

// Filtering and quality control
export {
  filterSuggestionsByThreshold,
  filterSuggestionsByQuality,
  filterInappropriateContent,
  filterByRecency,
  applyQualityFilters,
  shouldAutoPromote,
  shouldAutoBlock,
  getSuggestionsNeedingReview,
  getContextualFilters
} from './features/suggestionFiltering.js';

// Caching operations
export {
  getCachedSuggestions,
  setCachedSuggestions,
  updateCacheHitCount,
  clearCache,
  clearAllSuggestionCaches,
  cleanupOldCaches,
  clearOldestCaches,
  getCacheStats,
  CACHE_CONFIG
} from './features/suggestionCaching.js';

// Text utilities
export {
  normalizeText,
  createSearchKey,
  createSuggestionId,
  shouldRecordSuggestion,
  createCacheKey
} from './utils/textNormalization.js';

// Threshold and scoring utilities
export {
  MINIMUM_THRESHOLD,
  calculateDynamicThreshold,
  shouldShowSuggestion,
  calculateQualityScore,
  sortSuggestionsByRelevance
} from './utils/thresholdCalculator.js';

// High-level convenience functions for common use cases

// Get suggestions with caching and filtering - FIXED cache filtering
export const getSuggestionsWithCache = async (type, manufacturer, game, faction = null, searchTerm = '', options = {}) => {
  const {
    maxResults = 10,
    useCache = true,
    context = 'autocomplete'
  } = options;

  console.log('🔍 CACHE DEBUG: getSuggestionsWithCache called with:', {
    type, manufacturer, game, faction, searchTerm, maxResults, useCache, context
  });

  try {
    // Import the cache functions here to avoid circular dependency
    const {
      getCachedSuggestions,
      setCachedSuggestions,
      updateCacheHitCount
    } = await import('./features/suggestionCaching.js');

    const {
      applyQualityFilters,
      getContextualFilters
    } = await import('./features/suggestionFiltering.js');

    const { normalizeText } = await import('./utils/textNormalization.js');

    // DISABLE CACHE FOR NOW - it's causing search filtering issues
    // We'll always fetch fresh from database until we fix cache search filtering
    console.log('🔍 CACHE DEBUG: Skipping cache, fetching fresh from database...');

    // Fetch from database
    let suggestions = [];

    if (type === 'faction') {
      console.log('🔍 CACHE DEBUG: Calling getFactionSuggestions...');
      const { getFactionSuggestions } = await import('./core/suggestionQueries.js');
      suggestions = await getFactionSuggestions(manufacturer, game, searchTerm, maxResults * 2);
      console.log('🔍 CACHE DEBUG: getFactionSuggestions returned:', suggestions.length, 'results');
    } else if (type === 'unit') {
      console.log('🔍 CACHE DEBUG: Calling getUnitSuggestions...');
      const { getUnitSuggestions } = await import('./core/suggestionQueries.js');
      suggestions = await getUnitSuggestions(manufacturer, game, faction, searchTerm, maxResults * 2);
      console.log('🔍 CACHE DEBUG: getUnitSuggestions returned:', suggestions.length, 'results');
    }

    console.log('🔍 CACHE DEBUG: Raw suggestions from DB:', suggestions);

    // Apply contextual filters
    const { getContextualFilters: getFilters } = await import('./features/suggestionFiltering.js');
    const { applyQualityFilters: applyFilters } = await import('./features/suggestionFiltering.js');
    const filterOptions = getFilters(context);
    console.log('🔍 CACHE DEBUG: Applying filters...', filterOptions);
    suggestions = applyFilters(suggestions, filterOptions);
    console.log('🔍 CACHE DEBUG: After filters:', suggestions.length, 'results');

    const finalResults = suggestions.slice(0, maxResults);
    console.log(`📡 Database fetch for ${type} suggestions: ${manufacturer}/${game}${faction ? `/${faction}` : ''} (${finalResults.length} results)`);
    return finalResults;

  } catch (error) {
    console.error(`🔍 CACHE DEBUG: Error getting ${type} suggestions:`, error);
    return [];
  }
};

// Record suggestion and update cache
export const recordSuggestionAndUpdateCache = async (type, manufacturer, game, faction, value, metadata = {}) => {
  let recordResult;

  try {
    // Record the usage
    if (type === 'faction') {
      recordResult = await recordFactionUsage(manufacturer, game, value, metadata);
    } else if (type === 'unit') {
      recordResult = await recordUnitUsage(manufacturer, game, faction, value, metadata);
    } else {
      return { recorded: false, reason: 'Invalid type' };
    }

    // Clear relevant caches to force refresh
    if (recordResult.recorded) {
      clearCache(manufacturer, game, null, 'faction'); // Clear faction cache
      if (type === 'unit' && faction) {
        clearCache(manufacturer, game, faction, 'unit'); // Clear unit cache
      }
    }

    return recordResult;

  } catch (error) {
    console.error(`Error recording ${type} suggestion:`, error);
    return { recorded: false, reason: 'Recording failed', error: error.message };
  }
};

// Initialize suggestion system (call once on app start)
export const initializeSuggestionSystem = () => {
  try {
    // Clean up expired caches
    const cleanedCount = cleanupOldCaches();

    // Log cache statistics
    const stats = getCacheStats();
    if (stats) {
      console.log('📊 Suggestion system initialized:', {
        cleanedCaches: cleanedCount,
        totalCaches: stats.totalCaches,
        totalItems: stats.totalItems,
        totalSizeKB: stats.totalSizeKB
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing suggestion system:', error);
    return false;
  }
};

// Admin functions (for moderation interface)
export const adminPromoteSuggestion = async (manufacturer, game, faction, suggestionId, type = 'faction') => {
  try {
    await updateSuggestion(manufacturer, game, faction, suggestionId, {
      isPromoted: true,
      promotedAt: new Date().toISOString()
    }, type);

    // Clear caches to refresh
    clearCache(manufacturer, game, null, 'faction');
    if (type === 'unit' && faction) {
      clearCache(manufacturer, game, faction, 'unit');
    }

    return { success: true };
  } catch (error) {
    console.error('Error promoting suggestion:', error);
    return { success: false, error: error.message };
  }
};

export const adminBlockSuggestion = async (manufacturer, game, faction, suggestionId, reason, type = 'faction') => {
  try {
    await updateSuggestion(manufacturer, game, faction, suggestionId, {
      isBlocked: true,
      blockedAt: new Date().toISOString(),
      blockReason: reason
    }, type);

    // Clear caches to refresh
    clearCache(manufacturer, game, null, 'faction');
    if (type === 'unit' && faction) {
      clearCache(manufacturer, game, faction, 'unit');
    }

    return { success: true };
  } catch (error) {
    console.error('Error blocking suggestion:', error);
    return { success: false, error: error.message };
  }
};