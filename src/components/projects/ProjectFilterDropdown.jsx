// components/projects/ProjectFilterDropdown.jsx - Mobile-First Expandable Filter System
import React, { useState, useEffect } from 'react';
import { Search, X, ChevronDown, ChevronUp, Filter } from 'lucide-react';

const ProjectFilterDropdown = ({
  // Current filter props
  currentFilter,
  onFilterChange,
  currentDifficulty,
  onDifficultyChange,
  // New sorting/grouping props
  currentSort,
  onSortChange,
  currentGroup,
  onGroupChange,
  // Additional filters
  currentManufacturer,
  onManufacturerChange,
  currentGame,
  onGameChange,
  // Available options for dropdowns
  availableManufacturers = [],
  availableGames = [],
  // Reset function
  onResetFilters,
  // Search functionality
  searchTerm = '',
  onSearchChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusFilterOptions = [
    { key: 'all', label: 'All Projects' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'started', label: 'Started' },
    { key: 'completed', label: 'Completed' }
  ];

  const difficultyFilterOptions = [
    { key: 'all', label: 'All Levels' },
    { key: 'beginner', label: 'Beginner' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced', label: 'Advanced' },
    { key: 'expert', label: 'Expert' }
  ];

  const sortOptions = [
    { key: 'date_newest', label: 'Newest First' },
    { key: 'date_oldest', label: 'Oldest First' },
    { key: 'name_asc', label: 'Name A-Z' },
    { key: 'name_desc', label: 'Name Z-A' },
    { key: 'difficulty_asc', label: 'Easy to Expert' },
    { key: 'difficulty_desc', label: 'Expert to Easy' },
    { key: 'status_progress', label: 'Started to Finished' },
    { key: 'status_reverse', label: 'Finished to Started' },
    { key: 'steps_most', label: 'Most Steps' },
    { key: 'steps_least', label: 'Fewest Steps' },
    { key: 'photos_most', label: 'Most Photos' },
    { key: 'photos_least', label: 'Fewest Photos' }
  ];

  const groupOptions = [
    { key: 'none', label: 'No Grouping' },
    { key: 'manufacturer', label: 'By Manufacturer' },
    { key: 'game', label: 'By Game' },
    { key: 'difficulty', label: 'By Difficulty' },
    { key: 'status', label: 'By Status' }
  ];

  // Check if any filters are active
  const hasActiveFilters = currentFilter !== 'all' ||
                          currentDifficulty !== 'all' ||
                          currentSort !== 'date_newest' ||
                          currentGroup !== 'none' ||
                          currentManufacturer !== 'all' ||
                          currentGame !== 'all' ||
                          (searchTerm && searchTerm.trim());

  // Handle clear all filters
  const handleClearAll = () => {
    onResetFilters();
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4 space-y-4">

      {/* Search Bar and Toggle - Always Visible */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search projects by name, manufacturer, game..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
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
            onClick={handleClearAll}
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

          {/* Status Filter Chips */}
          <div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {statusFilterOptions.map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => onFilterChange(filterOption.key)}
                  className={`filter-chip ${
                    currentFilter === filterOption.key ? 'filter-chip-active' : 'filter-chip-inactive'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter Chips */}
          <div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {difficultyFilterOptions.map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => onDifficultyChange(filterOption.key)}
                  className={`filter-chip ${
                    currentDifficulty === filterOption.key ? 'filter-chip-active' : 'filter-chip-inactive'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => onSortChange(option.key)}
                  className={`filter-chip ${
                    currentSort === option.key ? 'filter-chip-active' : 'filter-chip-inactive'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group Options */}
          <div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {groupOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => onGroupChange(option.key)}
                  className={`filter-chip ${
                    currentGroup === option.key ? 'filter-chip-active' : 'filter-chip-inactive'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Manufacturer Filter Chips */}
          {availableManufacturers.length > 0 && (
            <div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => onManufacturerChange('all')}
                  className={`filter-chip ${
                    currentManufacturer === 'all' ? 'filter-chip-active' : 'filter-chip-inactive'
                  }`}
                >
                  All Manufacturers
                </button>
                {availableManufacturers.map((manufacturer) => (
                  <button
                    key={manufacturer}
                    onClick={() => onManufacturerChange(manufacturer)}
                    className={`filter-chip ${
                      currentManufacturer === manufacturer ? 'filter-chip-active' : 'filter-chip-inactive'
                    }`}
                  >
                    {manufacturer}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Game Filter Chips */}
          {availableGames.length > 0 && (
            <div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => onGameChange('all')}
                  className={`filter-chip ${
                    currentGame === 'all' ? 'filter-chip-active' : 'filter-chip-inactive'
                  }`}
                >
                  All Games
                </button>
                {availableGames.map((game) => (
                  <button
                    key={game}
                    onClick={() => onGameChange(game)}
                    className={`filter-chip ${
                      currentGame === game ? 'filter-chip-active' : 'filter-chip-inactive'
                    }`}
                  >
                    {game}
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
            {currentFilter !== 'all' && (
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-lg text-sm">
                Status: {currentFilter}
              </span>
            )}
            {currentDifficulty !== 'all' && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg text-sm">
                Difficulty: {currentDifficulty}
              </span>
            )}
            {currentSort !== 'date_newest' && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm">
                Sort: {sortOptions.find(opt => opt.key === currentSort)?.label}
              </span>
            )}
            {currentGroup !== 'none' && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm">
                Group: {groupOptions.find(opt => opt.key === currentGroup)?.label}
              </span>
            )}
            {currentManufacturer !== 'all' && (
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-lg text-sm">
                Manufacturer: {currentManufacturer}
              </span>
            )}
            {currentGame !== 'all' && (
              <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 rounded-lg text-sm">
                Game: {currentGame}
              </span>
            )}
            {searchTerm && searchTerm.trim() && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg text-sm">
                Search: "{searchTerm.trim()}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFilterDropdown;