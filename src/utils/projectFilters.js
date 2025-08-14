// utils/projectFilters.js - Sorting, Grouping, and Filtering Utilities

/**
 * Sort projects based on the selected sort option
 */
export const sortProjects = (projects, sortKey) => {
  if (!projects || projects.length === 0) return [];

  const sorted = [...projects].sort((a, b) => {
    switch (sortKey) {
      case 'name_asc':
        return (a.name || '').localeCompare(b.name || '');

      case 'name_desc':
        return (b.name || '').localeCompare(a.name || '');

      case 'difficulty_asc': {
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
        const aLevel = difficultyOrder[a.difficulty?.toLowerCase()] || 0;
        const bLevel = difficultyOrder[b.difficulty?.toLowerCase()] || 0;
        return aLevel - bLevel;
      }

      case 'difficulty_desc': {
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
        const aLevel = difficultyOrder[a.difficulty?.toLowerCase()] || 0;
        const bLevel = difficultyOrder[b.difficulty?.toLowerCase()] || 0;
        return bLevel - aLevel;
      }

      case 'status_progress': {
        const statusOrder = { 'upcoming': 1, 'started': 2, 'completed': 3 };
        const aStatus = statusOrder[a.status] || 0;
        const bStatus = statusOrder[b.status] || 0;
        return aStatus - bStatus;
      }

      case 'status_reverse': {
        const statusOrder = { 'upcoming': 1, 'started': 2, 'completed': 3 };
        const aStatus = statusOrder[a.status] || 0;
        const bStatus = statusOrder[b.status] || 0;
        return bStatus - aStatus;
      }

      case 'date_newest': {
        const aDate = getProjectDate(a.created);
        const bDate = getProjectDate(b.created);
        return bDate - aDate; // Newest first
      }

      case 'date_oldest': {
        const aDate = getProjectDate(a.created);
        const bDate = getProjectDate(b.created);
        return aDate - bDate; // Oldest first
      }

      case 'steps_most': {
        const aSteps = a.steps?.length || 0;
        const bSteps = b.steps?.length || 0;
        return bSteps - aSteps;
      }

      case 'steps_least': {
        const aSteps = a.steps?.length || 0;
        const bSteps = b.steps?.length || 0;
        return aSteps - bSteps;
      }

      case 'photos_most': {
        const aPhotos = a.photoURLs?.length || 0;
        const bPhotos = b.photoURLs?.length || 0;
        return bPhotos - aPhotos;
      }

      case 'photos_least': {
        const aPhotos = a.photoURLs?.length || 0;
        const bPhotos = b.photoURLs?.length || 0;
        return aPhotos - bPhotos;
      }

      default:
        return 0;
    }
  });

  return sorted;
};

/**
 * Group projects based on the selected grouping option
 */
export const groupProjects = (projects, groupKey) => {
  if (!projects || projects.length === 0) return { 'All Projects': [] };
  if (groupKey === 'none') return { 'All Projects': projects };

  const groups = {};

  projects.forEach(project => {
    let groupName;

    switch (groupKey) {
      case 'manufacturer':
        groupName = project.manufacturer || 'Unknown Manufacturer';
        break;

      case 'game':
        groupName = project.game || 'Unknown Game';
        break;

      case 'difficulty':
        groupName = project.difficulty
          ? project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)
          : 'Unknown Difficulty';
        break;

      case 'status':
        groupName = project.status
          ? project.status.charAt(0).toUpperCase() + project.status.slice(1)
          : 'Unknown Status';
        break;

      default:
        groupName = 'All Projects';
    }

    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(project);
  });

  // Sort groups by name, but put "Unknown" categories at the end
  const sortedGroups = {};
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    // Put "Unknown" categories last
    if (a.startsWith('Unknown') && !b.startsWith('Unknown')) return 1;
    if (!a.startsWith('Unknown') && b.startsWith('Unknown')) return -1;
    return a.localeCompare(b);
  });

  sortedKeys.forEach(key => {
    sortedGroups[key] = groups[key];
  });

  return sortedGroups;
};

/**
 * Apply all filters to a project list
 */
export const filterProjects = (projects, filters) => {
  if (!projects || projects.length === 0) return [];

  let filtered = projects.filter(project => {
    // Status filter
    const matchesStatus = filters.status === 'all' || project.status === filters.status;

    // Difficulty filter
    const matchesDifficulty = filters.difficulty === 'all' || project.difficulty === filters.difficulty;

    // Manufacturer filter
    const matchesManufacturer = filters.manufacturer === 'all' || project.manufacturer === filters.manufacturer;

    // Game filter
    const matchesGame = filters.game === 'all' || project.game === filters.game;

    return matchesStatus && matchesDifficulty && matchesManufacturer && matchesGame;
  });

  // Apply sorting
  filtered = sortProjects(filtered, filters.sort);

  return filtered;
};

/**
 * Get unique manufacturers from project list
 */
export const getUniqueManufacturers = (projects) => {
  if (!projects || projects.length === 0) return [];

  const manufacturers = new Set();
  projects.forEach(project => {
    if (project.manufacturer && project.manufacturer.trim()) {
      manufacturers.add(project.manufacturer);
    }
  });

  return Array.from(manufacturers).sort();
};

/**
 * Get unique games from project list
 */
export const getUniqueGames = (projects) => {
  if (!projects || projects.length === 0) return [];

  const games = new Set();
  projects.forEach(project => {
    if (project.game && project.game.trim()) {
      games.add(project.game);
    }
  });

  return Array.from(games).sort();
};

/**
 * Get the group display configuration
 */
export const getGroupDisplayConfig = (groupKey) => {
  const configs = {
    manufacturer: {
      icon: '🏭',
      emptyMessage: 'No manufacturer specified'
    },
    game: {
      icon: '🎮',
      emptyMessage: 'No game specified'
    },
    difficulty: {
      icon: '⭐',
      emptyMessage: 'No difficulty specified'
    },
    status: {
      icon: '📊',
      emptyMessage: 'No status specified'
    },
    none: {
      icon: '📁',
      emptyMessage: 'No projects found'
    }
  };

  return configs[groupKey] || configs.none;
};

/**
 * Utility function to safely parse project dates
 */
const getProjectDate = (dateInput) => {
  try {
    if (!dateInput) return new Date(0);

    if (dateInput instanceof Date) {
      return dateInput;
    } else if (typeof dateInput === 'string') {
      return new Date(dateInput);
    } else if (typeof dateInput === 'number') {
      return new Date(dateInput);
    } else if (dateInput && dateInput.toDate && typeof dateInput.toDate === 'function') {
      return dateInput.toDate();
    } else if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
      return new Date(dateInput.seconds * 1000 + (dateInput.nanoseconds || 0) / 1000000);
    }

    return new Date(0);
  } catch (error) {
    console.warn('Date parsing error:', error, 'Input:', dateInput);
    return new Date(0);
  }
};

/**
 * Create default filter state
 */
export const createDefaultFilters = () => ({
  status: 'all',
  difficulty: 'all',
  manufacturer: 'all',
  game: 'all',
  sort: 'date_newest',
  group: 'none'
});

/**
 * Check if filters are at default values
 */
export const areFiltersDefault = (filters) => {
  const defaults = createDefaultFilters();
  return Object.keys(defaults).every(key => filters[key] === defaults[key]);
};