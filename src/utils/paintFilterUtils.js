// utils/paintFilterUtils.js
// Utility functions for filtering paints based on search criteria

/**
 * Filter paints based on search and filter criteria
 * @param {Array} paints - Array of paint objects to filter
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered array of paints
 */
export const filterPaints = (paints, filters) => {
  if (!paints || paints.length === 0) return [];
  if (!filters || Object.keys(filters).length === 0) return paints;

  return paints.filter(paint => {
    // Basic filter (collection, wishlist, almostempty, usedinprojects)
    if (filters.basicFilter) {
      switch (filters.basicFilter) {
        case 'collection':
          if (paint.status !== 'collection') return false;
          break;
        case 'wishlist':
          if (paint.status !== 'wishlist') return false;
          break;
        case 'almostempty':
          if (paint.status !== 'collection' || paint.level > 20) return false;
          break;
        case 'usedinprojects':
          if (!paint.projects || paint.projects.length === 0) return false;
          break;
      }
    }

    // Brand filter
    if (filters.brandFilter && paint.brand !== filters.brandFilter) {
      return false;
    }

    // Colour filter
    if (filters.colourFilter && paint.colour !== filters.colourFilter) {
      return false;
    }

    // Type filter (handles both regular types and special types like Airbrush/Spray Paint)
    if (filters.typeFilter) {
      if (filters.typeFilter === 'Airbrush') {
        if (!paint.airbrush) return false;
      } else if (filters.typeFilter === 'Spray Paint') {
        if (!paint.sprayPaint) return false;
      } else {
        if (paint.type !== filters.typeFilter) return false;
      }
    }

    // Search term filter (searches across multiple fields)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        paint.name?.toLowerCase() || '',
        paint.brand?.toLowerCase() || '',
        paint.type?.toLowerCase() || '',
        paint.colour?.toLowerCase() || ''
      ];

      const matchesSearch = searchableFields.some(field =>
        field.includes(searchTerm)
      );

      if (!matchesSearch) return false;
    }

    return true;
  });
};

/**
 * Get filter summary text for display
 * @param {Object} filters - Active filters
 * @param {Number} totalResults - Number of results after filtering
 * @param {Number} totalPaints - Total number of paints before filtering
 * @returns {String} Summary text
 */
export const getFilterSummary = (filters, totalResults, totalPaints) => {
  if (!filters || Object.keys(filters).length === 0) {
    return `Showing all ${totalPaints} paints`;
  }

  const activeFilterCount = Object.keys(filters).length;

  if (totalResults === totalPaints) {
    return `${totalResults} paints (no filters applied)`;
  }

  return `Showing ${totalResults} of ${totalPaints} paints (${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied)`;
};

/**
 * Check if any filters are currently active
 * @param {Object} filters - Filter object to check
 * @returns {Boolean} True if any filters are active
 */
export const hasActiveFilters = (filters) => {
  if (!filters) return false;

  return Object.values(filters).some(value => {
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'boolean') return value === true;
    return false;
  });
};

/**
 * Reset all filters to default state
 * @returns {Object} Empty filters object
 */
export const getDefaultFilters = () => ({
  basicFilter: 'all',
  colourFilter: '',
  typeFilter: '',
  brandFilter: '',
  search: ''
});

/**
 * Merge new filters with existing ones
 * @param {Object} currentFilters - Current filter state
 * @param {Object} newFilters - New filters to apply
 * @returns {Object} Merged filters object
 */
export const mergeFilters = (currentFilters, newFilters) => {
  return {
    ...getDefaultFilters(),
    ...currentFilters,
    ...newFilters
  };
};