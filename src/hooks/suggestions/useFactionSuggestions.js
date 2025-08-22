// hooks/suggestions/useFactionSuggestions.js
// React hook for faction autocomplete functionality

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSuggestionsWithCache, recordSuggestionAndUpdateCache } from '../../services/suggestions/index.js';

export const useFactionSuggestions = (manufacturer, game, options = {}) => {
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
    // Skip if manufacturer or game not provided
    if (!manufacturer || !game) {
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
        'faction',
        manufacturer,
        game,
        null, // faction is null for faction suggestions
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
      console.error('Error fetching faction suggestions:', err);
      if (currentRequestRef.current === requestId) {
        setError(err.message || 'Failed to fetch suggestions');
        setSuggestions([]);
      }
    } finally {
      if (currentRequestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [manufacturer, game, minSearchLength, maxResults, useCache, clearSuggestions]);

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

  // Record faction selection
  const selectFaction = useCallback(async (faction, metadata = {}) => {
    setSelectedValue(faction);
    setSearchTerm(faction);
    clearSuggestions();

    // Record usage if enabled
    if (autoRecord && manufacturer && game) {
      try {
        await recordSuggestionAndUpdateCache(
          'faction',
          manufacturer,
          game,
          null,
          faction,
          {
            source: 'user_selection',
            context: 'autocomplete',
            ...metadata
          }
        );
      } catch (recordError) {
        console.error('Error recording faction selection:', recordError);
        // Don't fail the selection if recording fails
      }
    }

    return faction;
  }, [manufacturer, game, autoRecord, clearSuggestions]);

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
  const findSuggestion = useCallback((factionName) => {
    return suggestions.find(s =>
      s.name === factionName.toLowerCase() ||
      s.originalName.toLowerCase() === factionName.toLowerCase()
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

  return {
    // State
    searchTerm,
    suggestions,
    isLoading,
    error,
    selectedValue,

    // Actions
    handleSearchChange,
    selectFaction,
    clearSuggestions,
    reset,
    refresh,
    findSuggestion,

    // Utilities
    hasResults: suggestions.length > 0,
    isEmpty: !isLoading && suggestions.length === 0 && searchTerm.length >= minSearchLength,
    isSearching: isLoading && searchTerm.length >= minSearchLength,
    canShowSuggestions: !isLoading && suggestions.length > 0,

    // Config (for debugging)
    config: {
      manufacturer,
      game,
      minSearchLength,
      debounceMs,
      maxResults,
      autoRecord,
      useCache
    }
  };
};

// Hook variant with immediate suggestions (no search required)
export const useFactionSuggestionsImmediate = (manufacturer, game, options = {}) => {
  const hook = useFactionSuggestions(manufacturer, game, {
    ...options,
    minSearchLength: 0
  });

  // Fetch suggestions immediately when manufacturer/game available
  useEffect(() => {
    if (manufacturer && game && !hook.searchTerm) {
      hook.handleSearchChange('');
    }
  }, [manufacturer, game, hook]);

  return hook;
};