// hooks/suggestions/index.js
// Central barrel export for all suggestion hooks

// Core suggestion hooks
export {
  useFactionSuggestions,
  useFactionSuggestionsImmediate
} from './useFactionSuggestions.js';

export {
  useUnitSuggestions,
  useUnitSuggestionsImmediate,
  useAllUnitsInFaction
} from './useUnitSuggestions.js';

// Cache management hooks
export {
  useSuggestionCache,
  useSpecificCacheMonitor
} from './useSuggestionCache.js';

// Recording hooks
export {
  useSuggestionRecording,
  useProjectSuggestionRecording
} from './useSuggestionRecording.js';

// Convenience hook that combines faction and unit suggestions
export const useCombinedSuggestions = (manufacturer, game, faction = null, options = {}) => {
  const factionHook = useFactionSuggestions(manufacturer, game, options);
  const unitHook = useUnitSuggestions(manufacturer, game, faction, options);

  return {
    // Faction suggestions
    faction: {
      searchTerm: factionHook.searchTerm,
      suggestions: factionHook.suggestions,
      isLoading: factionHook.isLoading,
      error: factionHook.error,
      selectedValue: factionHook.selectedValue,
      handleSearchChange: factionHook.handleSearchChange,
      selectFaction: factionHook.selectFaction,
      clear: factionHook.clearSuggestions,
      reset: factionHook.reset,
      hasResults: factionHook.hasResults,
      canShowSuggestions: factionHook.canShowSuggestions
    },

    // Unit suggestions
    unit: {
      searchTerm: unitHook.searchTerm,
      suggestions: unitHook.suggestions,
      isLoading: unitHook.isLoading,
      error: unitHook.error,
      selectedValue: unitHook.selectedValue,
      handleSearchChange: unitHook.handleSearchChange,
      selectUnit: unitHook.selectUnit,
      clear: unitHook.clearSuggestions,
      reset: unitHook.reset,
      hasResults: unitHook.hasResults,
      canShowSuggestions: unitHook.canShowSuggestions,
      isDisabled: unitHook.isDisabled,
      needsFaction: unitHook.needsFaction,
      getStatusMessage: unitHook.getStatusMessage
    },

    // Combined utilities
    resetAll: () => {
      factionHook.reset();
      unitHook.reset();
    },

    isAnyLoading: factionHook.isLoading || unitHook.isLoading,
    hasAnyError: Boolean(factionHook.error || unitHook.error),

    // Config
    config: {
      manufacturer,
      game,
      faction,
      ...options
    }
  };
};

// Hook for managing all suggestion types (manufacturer, game, faction, unit)
export const useFullSuggestionStack = (initialData = {}, options = {}) => {
  const {
    manufacturer: initialManufacturer = '',
    game: initialGame = '',
    faction: initialFaction = '',
    unitName: initialUnitName = ''
  } = initialData;

  const [manufacturer, setManufacturer] = React.useState(initialManufacturer);
  const [game, setGame] = React.useState(initialGame);
  const [faction, setFaction] = React.useState(initialFaction);
  const [unitName, setUnitName] = React.useState(initialUnitName);

  // Get suggestion hooks
  const factionHook = useFactionSuggestions(manufacturer, game, options);
  const unitHook = useUnitSuggestions(manufacturer, game, faction, options);
  const recording = useSuggestionRecording(options);

  // Handle faction selection (clears unit when faction changes)
  const handleFactionSelect = React.useCallback(async (selectedFaction) => {
    const result = await factionHook.selectFaction(selectedFaction);
    setFaction(selectedFaction);
    setUnitName(''); // Clear unit when faction changes
    unitHook.reset(); // Reset unit suggestions
    return result;
  }, [factionHook, unitHook]);

  // Handle unit selection
  const handleUnitSelect = React.useCallback(async (selectedUnit) => {
    const result = await unitHook.selectUnit(selectedUnit);
    setUnitName(selectedUnit);
    return result;
  }, [unitHook]);

  // Reset all selections
  const resetAll = React.useCallback(() => {
    setManufacturer('');
    setGame('');
    setFaction('');
    setUnitName('');
    factionHook.reset();
    unitHook.reset();
  }, [factionHook, unitHook]);

  // Get current form data
  const getFormData = React.useCallback(() => {
    return {
      manufacturer,
      game,
      faction,
      unitName
    };
  }, [manufacturer, game, faction, unitName]);

  // Validate current selections
  const validate = React.useCallback(() => {
    const errors = [];

    if (!manufacturer) errors.push('Manufacturer is required');
    if (!game) errors.push('Game is required');
    // faction and unitName are optional

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [manufacturer, game]);

  return {
    // Current values
    manufacturer,
    game,
    faction,
    unitName,

    // Setters for external control
    setManufacturer,
    setGame,
    setFaction: handleFactionSelect,
    setUnitName: handleUnitSelect,

    // Suggestion hooks
    factionSuggestions: factionHook,
    unitSuggestions: unitHook,
    recording,

    // Utilities
    resetAll,
    getFormData,
    validate,

    // Status
    isAnyLoading: factionHook.isLoading || unitHook.isLoading,
    hasAnyError: Boolean(factionHook.error || unitHook.error),
    canSelectUnit: Boolean(manufacturer && game && faction),

    // Progress tracking
    completionStatus: {
      hasManufacturer: Boolean(manufacturer),
      hasGame: Boolean(game),
      hasFaction: Boolean(faction),
      hasUnit: Boolean(unitName),
      percentComplete: [manufacturer, game, faction, unitName].filter(Boolean).length * 25
    }
  };
};

// Hook for admin/debug purposes
export const useSuggestionDebug = () => {
  const cache = useSuggestionCache();
  const recording = useSuggestionRecording({ autoRecord: false });

  return {
    cache,
    recording,

    // Debug utilities
    logCacheStats: () => {
      console.table(cache.cacheStats);
    },

    logRecordingStats: () => {
      console.table(recording.recordingStats);
    },

    // Health check
    healthCheck: () => {
      const cacheHealth = cache.getCacheHealth();
      const recordingHealth = {
        successRate: recording.getSuccessRate(),
        hasErrors: recording.hasErrors,
        pendingCount: recording.pendingCount
      };

      return {
        cache: cacheHealth,
        recording: recordingHealth,
        overall: cacheHealth?.status === 'good' && recordingHealth.successRate > 80 ? 'healthy' : 'needs_attention'
      };
    }
  };
};