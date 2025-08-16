// services/paints/shared/paintHelpers.js - Paint-specific utilities and helpers
import { getUserPaintsCollection, getUserNeedToBuyCollection, getCurrentUserId } from '../../shared/userHelpers.js';
import { validateTierAccess } from '../../shared/tierHelpers.js';
import { PAINT_STATUS, VALIDATION, ERROR_MESSAGES } from '../../shared/constants.js';

/**
 * Check paint tier limits before adding new paint
 * @param {string} userId - Optional user ID, uses current user if not provided
 * @returns {Promise<Object>} Tier check result
 */
export const checkPaintTierLimit = async (userId = null) => {
  try {
    const uid = userId || getCurrentUserId();
    const paintsCollection = getUserPaintsCollection(uid);

    // Count current paints
    const { getDocs } = await import('firebase/firestore');
    const paintsSnapshot = await getDocs(paintsCollection);
    const currentPaintCount = paintsSnapshot.size;

    // Check tier limits
    return await validateTierAccess('paints', currentPaintCount, uid);
  } catch (error) {
    console.error('Error checking paint tier limit:', error);
    throw new Error('Unable to verify paint limits');
  }
};

/**
 * Validate paint data before creation/update
 * @param {Object} paintData - Paint data to validate
 * @returns {Object} Validation result
 */
export const validatePaintData = (paintData) => {
  const { name, brand, type, status, level } = paintData;

  // Check required fields
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: 'Paint name is required'
    };
  }

  if (!brand || brand.trim().length === 0) {
    return {
      isValid: false,
      error: 'Paint brand is required'
    };
  }

  if (!type || type.trim().length === 0) {
    return {
      isValid: false,
      error: 'Paint type is required'
    };
  }

  // Validate name length
  if (name.length < VALIDATION.MIN_PAINT_NAME_LENGTH ||
      name.length > VALIDATION.MAX_PAINT_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Paint name must be between ${VALIDATION.MIN_PAINT_NAME_LENGTH} and ${VALIDATION.MAX_PAINT_NAME_LENGTH} characters`
    };
  }

  // Validate status
  if (status && !Object.values(PAINT_STATUS).includes(status)) {
    return {
      isValid: false,
      error: 'Invalid paint status'
    };
  }

  // Validate level if provided
  if (level !== undefined && level !== null) {
    if (typeof level !== 'number' || level < 0 || level > 100) {
      return {
        isValid: false,
        error: 'Paint level must be a number between 0 and 100'
      };
    }
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Prepare paint data for database storage
 * @param {Object} paintData - Raw paint data
 * @returns {Object} Prepared paint data with defaults
 */
export const preparePaintData = (paintData) => {
  const {
    brand,
    airbrush = false,
    type,
    name,
    status = PAINT_STATUS.LISTED,
    level = 100,
    photoURL = null,
    sprayPaint = false,
    colour = null,
    projects = []
  } = paintData;

  return {
    brand: brand.trim(),
    airbrush: Boolean(airbrush),
    type: type.trim(),
    name: name.trim(),
    status,
    level: Number(level),
    photoURL,
    sprayPaint: Boolean(sprayPaint),
    colour: colour ? colour.trim() : null,
    projects: Array.isArray(projects) ? projects : [],
    createdAt: new Date().toISOString()
  };
};

/**
 * Check if paint should be added to needToBuy list
 * @param {number} level - Paint level
 * @param {string} status - Paint status
 * @returns {boolean} Whether paint should be in needToBuy
 */
export const shouldAddToNeedToBuy = (level, status) => {
  return status === PAINT_STATUS.COLLECTION && level <= 20;
};

/**
 * Normalize paint data for consistency (handle legacy formats)
 * @param {Object} paintData - Paint data from database
 * @returns {Object} Normalized paint data
 */
export const normalizePaintData = (paintData) => {
  return {
    ...paintData,
    projects: paintData.projects || [],
    level: paintData.level || 0,
    airbrush: Boolean(paintData.airbrush),
    sprayPaint: Boolean(paintData.sprayPaint),
    status: paintData.status || PAINT_STATUS.LISTED,
    colour: paintData.colour || null,
    photoURL: paintData.photoURL || null
  };
};

/**
 * Create needToBuy item from paint data
 * @param {Object} paintData - Paint data
 * @returns {Object} NeedToBuy item data
 */
export const createNeedToBuyItem = (paintData) => {
  return {
    brand: paintData.brand,
    type: paintData.type,
    name: paintData.name,
    colour: paintData.colour,
    createdAt: new Date().toISOString()
  };
};

/**
 * Search paints by various criteria
 * @param {Array} paints - Array of paint objects
 * @param {Object} searchCriteria - Search criteria
 * @returns {Array} Filtered paints
 */
export const searchPaints = (paints, searchCriteria) => {
  const {
    name,
    brand,
    type,
    status,
    colour,
    airbrush,
    sprayPaint,
    minLevel,
    maxLevel,
    hasProjects
  } = searchCriteria;

  return paints.filter(paint => {
    // Name search (case insensitive, partial match)
    if (name && !paint.name.toLowerCase().includes(name.toLowerCase())) {
      return false;
    }

    // Brand filter
    if (brand && paint.brand !== brand) {
      return false;
    }

    // Type filter
    if (type && paint.type !== type) {
      return false;
    }

    // Status filter
    if (status && paint.status !== status) {
      return false;
    }

    // Colour filter
    if (colour && paint.colour !== colour) {
      return false;
    }

    // Airbrush filter
    if (airbrush !== undefined && paint.airbrush !== airbrush) {
      return false;
    }

    // Spray paint filter
    if (sprayPaint !== undefined && paint.sprayPaint !== sprayPaint) {
      return false;
    }

    // Level range filter
    if (minLevel !== undefined && paint.level < minLevel) {
      return false;
    }

    if (maxLevel !== undefined && paint.level > maxLevel) {
      return false;
    }

    // Projects filter
    if (hasProjects !== undefined) {
      const paintHasProjects = paint.projects && paint.projects.length > 0;
      if (hasProjects !== paintHasProjects) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Sort paints by various criteria
 * @param {Array} paints - Array of paint objects
 * @param {string} sortBy - Sort criteria
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {Array} Sorted paints
 */
export const sortPaints = (paints, sortBy = 'name', sortOrder = 'asc') => {
  const sortedPaints = [...paints];

  sortedPaints.sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'brand':
        aValue = a.brand.toLowerCase();
        bValue = b.brand.toLowerCase();
        break;
      case 'type':
        aValue = a.type.toLowerCase();
        bValue = b.type.toLowerCase();
        break;
      case 'level':
        aValue = a.level;
        bValue = b.level;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return sortedPaints;
};

/**
 * Get paint statistics for summary
 * @param {Array} paints - Array of paint objects
 * @returns {Object} Paint statistics
 */
export const calculatePaintStatistics = (paints) => {
  const stats = {
    total: paints.length,
    collection: 0,
    wishlist: 0,
    listed: 0,
    lowStock: 0,
    empty: 0,
    airbrush: 0,
    sprayPaint: 0,
    usedInProjects: 0,
    brands: new Set(),
    types: new Set(),
    colours: new Set()
  };

  paints.forEach(paint => {
    // Count by status
    stats[paint.status] = (stats[paint.status] || 0) + 1;

    // Level-based counts (only for collection paints)
    if (paint.status === PAINT_STATUS.COLLECTION) {
      if (paint.level <= 20) stats.lowStock++;
      if (paint.level === 0) stats.empty++;
    }

    // Special type counts
    if (paint.airbrush) stats.airbrush++;
    if (paint.sprayPaint) stats.sprayPaint++;

    // Project usage
    if (paint.projects && paint.projects.length > 0) {
      stats.usedInProjects++;
    }

    // Collect unique values
    stats.brands.add(paint.brand);
    stats.types.add(paint.type);
    if (paint.colour) stats.colours.add(paint.colour);
  });

  // Convert Sets to arrays and counts
  return {
    ...stats,
    brands: Array.from(stats.brands),
    types: Array.from(stats.types),
    colours: Array.from(stats.colours),
    uniqueBrands: stats.brands.size,
    uniqueTypes: stats.types.size,
    uniqueColours: stats.colours.size
  };
};