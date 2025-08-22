// hooks/suggestions/useUnitSuggestions.js
// React hook for unit autocomplete functionality

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSuggestionsWithCache, recordSuggestionAndUpdateCache } from '../../services/suggestions/index.js';

export const useUnitSuggestions = (manufacturer, game, faction, options = {}) => {
  const {
    minSearchLength = 2,
    debounceMs = 300,
    maxResults = 10,
    autoRecord = true,
    useCache = true
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedValue, setSelectedValue] = useState('');

  // Refs for cleanup and debouncing
  const debounceTimeoutRef = useRef(null);
  const currentRequestRef = useRef(null);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  // Fetch suggestions with debouncing
  const fetchSuggestions = useCallback(async (term) => {
    // Skip if required params not provided
    if (!manufacturer || !game || !faction) {
      clearSuggestions();
      return;
    }

    // Skip if search term too short
    if (term && term.length < minSearchLength) {
      clearSuggestions();
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create request ID to handle race conditions
    const requestId = Date.now();
    currentRequestRef.current = requestId;

    try {
      const results = await getSuggestionsWithCache(
        'unit',
        manufacturer,
        game,
        faction,
        term,
        {
          maxResults,
          useCache,
          context: 'autocomplete'
        }
      );

      // Only update if this is still the current request
      if (currentRequestRef.current === requestId) {
        setSuggestions(results || []);
      }
    } catch (err) {
      console.error('Error fetching unit suggestions:', err);
      if (currentRequestRef.current === requestId) {
        setError(err.message || 'Failed to fetch suggestions');
        setSuggestions([]);
      }
    } finally {
      if (currentRequestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [manufacturer, game, faction, minSearchLength, maxResults, useCache, clearSuggestions]);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, debounceMs);

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchSuggestions, debounceMs]);

  // Clear suggestions when faction changes
  useEffect(() => {
    clearSuggestions();
    setSearchTerm('');
    setSelectedValue('');

    // Cancel any pending requests
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    currentRequestRef.current = null;
  }, [faction, clearSuggestions]);

  // Record unit selection
  const selectUnit = useCallback(async (unitName, metadata = {}) => {
    setSelectedValue(unitName);
    setSearchTerm(unitName);
    clearSuggestions();

    // Record usage if enabled
    if (autoRecord && manufacturer && game && faction) {
      try {
        await recordSuggestionAndUpdateCache(
          'unit',
          manufacturer,
          game,
          faction,
          unitName,
          {
            source: 'user_selection',
            context: 'autocomplete',
            ...metadata
          }
        );
      } catch (recordError) {
        console.error('Error recording unit selection:', recordError);
        // Don't fail the selection if recording fails
      }
    }

    return unitName;
  }, [manufacturer, game, faction, autoRecord, clearSuggestions]);

  // Handle search term changes
  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    if (selectedValue && newSearchTerm !== selectedValue) {
      setSelectedValue('');
    }
  }, [selectedValue]);

  // Clear all state
  const reset = useCallback(() => {
    setSearchTerm('');
    setSelectedValue('');
    clearSuggestions();
    setError(null);

    // Cancel pending requests
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    currentRequestRef.current = null;
  }, [clearSuggestions]);

  // Force refresh suggestions (bypass cache)
  const refresh = useCallback(() => {
    if (searchTerm) {
      fetchSuggestions(searchTerm);
    }
  }, [searchTerm, fetchSuggestions]);

  // Get suggestion by exact name (useful for validation)
  const findSuggestion = useCallback((unitName) => {
    return suggestions.find(s =>
      s.name === unitName.toLowerCase() ||
      s.originalName.toLowerCase() === unitName.toLowerCase()
    );
  }, [suggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Check if we have valid context for unit suggestions
  const hasValidContext = Boolean(manufacturer && game && faction);
  const needsFaction = Boolean(manufacturer && game && !faction);

  // Calculate isEmpty here to avoid reference errors
  const isEmpty = !isLoading && suggestions.length === 0 && searchTerm.length >= minSearchLength && hasValidContext;

  return {
    // State
    searchTerm,
    suggestions,
    isLoading,
    error,
    selectedValue,

    // Actions
    handleSearchChange,
    selectUnit,
    clearSuggestions,
    reset,
    refresh,
    findSuggestion,

    // Utilities
    hasResults: suggestions.length > 0,
    isEmpty,
    isSearching: isLoading && searchTerm.length >= minSearchLength,
    canShowSuggestions: !isLoading && suggestions.length > 0 && hasValidContext,
    hasValidContext,
    needsFaction,
    isDisabled: !hasValidContext,

    // Status messages
    getStatusMessage: () => {
      if (!manufacturer || !game) return 'Select manufacturer and game first';
      if (!faction) return 'Select faction first';
      if (isLoading) return 'Loading units...';
      if (error) return error;
      if (searchTerm.length > 0 && searchTerm.length < minSearchLength) {
        return `Type at least ${minSearchLength} characters`;
      }
      if (isEmpty) return 'No units found';
      return '';
    },

    // Config (for debugging)
    config: {
      manufacturer,
      game,
      faction,
      minSearchLength,
      debounceMs,
      maxResults,
      autoRecord,
      useCache
    }
  };
};

// Hook variant with immediate suggestions (no search required)
export const useUnitSuggestionsImmediate = (manufacturer, game, faction, options = {}) => {
  const hook = useUnitSuggestions(manufacturer, game, faction, {
    ...options,
    minSearchLength: 0
  });

  // Fetch suggestions immediately when context is available
  useEffect(() => {
    if (manufacturer && game && faction && !hook.searchTerm) {
      hook.handleSearchChange('');
    }
  }, [manufacturer, game, faction, hook]);

  return hook;
};

// Hook for browsing all units in a faction (admin/browse mode)
export const useAllUnitsInFaction = (manufacturer, game, faction, options = {}) => {
  const hook = useUnitSuggestions(manufacturer, game, faction, {
    ...options,
    minSearchLength: 0,
    maxResults: 100,
    useCache: false // Always fresh data for admin views
  });

  // Load all units immediately
  useEffect(() => {
    if (manufacturer && game && faction) {
      hook.handleSearchChange('');
    }
  }, [manufacturer, game, faction, hook]);

  return {
    ...hook,
    allUnits: hook.suggestions,
    isLoadingAll: hook.isLoading,
    unitCount: hook.suggestions.length
  };
};