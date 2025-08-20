// hooks/paints/usePaintListFilters.js
import { useState, useMemo, useCallback } from 'react';
import { filterPaints } from '../../utils/paintFilterUtils';

export const usePaintListFilters = () => {
  const [activeFilters, setActiveFilters] = useState({});

  // Apply client-side filtering to paint results
  const getFilteredPaints = useCallback((paints) => {
    return filterPaints(paints, activeFilters);
  }, [activeFilters]);

  // Handle filter changes from the search component
  const handleFiltersChange = useCallback((filters) => {
    setActiveFilters(filters);
  }, []);

  // Handle filter clicks from summary cards
  const handleSummaryFilterClick = useCallback((filterType) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      newFilters.basicFilter = newFilters.basicFilter === filterType ? 'all' : filterType;
      return newFilters;
    });
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  return {
    activeFilters,
    setActiveFilters,
    getFilteredPaints,
    handleFiltersChange,
    handleSummaryFilterClick,
    clearAllFilters,
  };
};