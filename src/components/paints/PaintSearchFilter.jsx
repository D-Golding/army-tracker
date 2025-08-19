// components/paints/PaintSearchFilter.jsx
import React, { useState, useEffect } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllPaints, getAvailableColours } from '../../services/paints/index.js';

const PaintSearchFilter = ({ onFiltersChange, initialFilters = {} }) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Basic filter states
  const [basicFilter, setBasicFilter] = useState(initialFilters.basicFilter || 'all');
  const [colourFilter, setColourFilter] = useState(initialFilters.colourFilter || '');
  const [typeFilter, setTypeFilter] = useState(initialFilters.typeFilter || '');
  const [brandFilter, setBrandFilter] = useState(initialFilters.brandFilter || '');

  const [availableColours, setAvailableColours] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  // Load available colours, types, and brands
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [colours, allPaints] = await Promise.all([
        getAvailableColours(),
        getAllPaints()
      ]);

      // Extract unique types from paints
      const types = [...new Set(allPaints.map(paint => paint.type).filter(Boolean))].sort();

      // Extract unique brands from paints
      const brands = [...new Set(allPaints.map(paint => paint.brand).filter(Boolean))].sort();

      // Add airbrush and spray paint as special types if they exist
      const hasAirbrush = allPaints.some(paint => paint.airbrush);
      const hasSprayPaint = allPaints.some(paint => paint.sprayPaint);

      const specialTypes = [];
      if (hasAirbrush) specialTypes.push('Airbrush');
      if (hasSprayPaint) specialTypes.push('Spray Paint');

      setAvailableColours(colours);
      setAvailableTypes([...types, ...specialTypes]);
      setAvailableBrands(brands);
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build filters object and notify parent
  useEffect(() => {
    const filters = {
      basicFilter,
      colourFilter,
      typeFilter,
      brandFilter,
      search: searchTerm.trim()
    };

    // Only send non-empty filters
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== 'all') {
        acc[key] = value;
      }
      return acc;
    }, {});

    onFiltersChange(activeFilters);
  }, [basicFilter, colourFilter, typeFilter, brandFilter, searchTerm]);

  // Clear all filters
  const clearAllFilters = () => {
    setBasicFilter('all');
    setColourFilter('');
    setTypeFilter('');
    setBrandFilter('');
    setSearchTerm('');
  };

  // Check if any filters are active
  const hasActiveFilters = basicFilter !== 'all' || colourFilter || typeFilter || brandFilter || searchTerm;

  if (loading) {
    return (
      <div className="paint-search-container">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="flex space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="paint-search-container">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4 space-y-4">

        {/* Search Bar and Toggle - Always Visible */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search paints by name, brand, type, or colour..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Toggle Filters Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
          >
            Filters
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center gap-2"
            >
              <X size={16} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Collapsible Filter Sections */}
        {isExpanded && (
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-600 pt-4">

            {/* Primary Filter Chips */}
            <div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { key: 'all', label: 'All Groups' },
                  { key: 'collection', label: 'Collection' },
                  { key: 'wishlist', label: 'Wishlist' },
                  { key: 'almostempty', label: 'Almost Empty' },
                  { key: 'usedinprojects', label: 'Used in Projects' }
                ].map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => setBasicFilter(filterOption.key)}
                    className={`filter-chip ${
                      basicFilter === filterOption.key ? 'filter-chip-active' : 'filter-chip-inactive'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter Chips */}
            {availableBrands.length > 0 && (
              <div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setBrandFilter('')}
                    className={`filter-chip ${
                      brandFilter === '' ? 'filter-chip-active' : 'filter-chip-inactive'
                    }`}
                  >
                    All Brands
                  </button>
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setBrandFilter(brand)}
                      className={`filter-chip ${
                        brandFilter === brand ? 'filter-chip-active' : 'filter-chip-inactive'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colour Filter Chips */}
            {availableColours.length > 0 && (
              <div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setColourFilter('')}
                    className={`filter-chip ${
                      colourFilter === '' ? 'filter-chip-active' : 'filter-chip-inactive'
                    }`}
                  >
                    All Colours
                  </button>
                  {availableColours.map((colour) => (
                    <button
                      key={colour}
                      onClick={() => setColourFilter(colour)}
                      className={`filter-chip ${
                        colourFilter === colour ? 'filter-chip-active' : 'filter-chip-inactive'
                      }`}
                    >
                      {colour}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type Filter Chips */}
            {availableTypes.length > 0 && (
              <div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setTypeFilter('')}
                    className={`filter-chip ${
                      typeFilter === '' ? 'filter-chip-active' : 'filter-chip-inactive'
                    }`}
                  >
                    All Types
                  </button>
                  {availableTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`filter-chip ${
                        typeFilter === type ? 'filter-chip-active' : 'filter-chip-inactive'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Summary - Always visible when filters are active */}
        {hasActiveFilters && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {basicFilter !== 'all' && (
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-lg text-sm">
                  {basicFilter === 'usedinprojects' ? 'Used in Projects' : basicFilter}
                </span>
              )}
              {brandFilter && (
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-lg text-sm">
                  Brand: {brandFilter}
                </span>
              )}
              {colourFilter && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg text-sm">
                  Colour: {colourFilter}
                </span>
              )}
              {typeFilter && (
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg text-sm">
                  Type: {typeFilter}
                </span>
              )}
              {searchTerm && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm">
                  Search: "{searchTerm}"
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaintSearchFilter;