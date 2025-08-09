// components/projects/ProjectFilters.jsx - Filter Chips
import React from 'react';

const ProjectFilters = ({ currentFilter, onFilterChange }) => {
  const filterOptions = [
    { key: 'all', label: 'All Projects' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'started', label: 'Started' },
    { key: 'completed', label: 'Completed' }
  ];

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
      {filterOptions.map((filterOption) => (
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
  );
};

export default ProjectFilters;