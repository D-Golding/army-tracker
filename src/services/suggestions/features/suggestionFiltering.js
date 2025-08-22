// services/suggestions/features/suggestionFiltering.js
// Quality control and filtering for suggestions

import { shouldRecordSuggestion } from '../utils/textNormalization.js';

// Minimum count threshold for suggestions to be shown
export const QUALITY_THRESHOLDS = {
  faction: 5,    // Show factions used at least 5 times
  unit: 5,       // Show units used at least 5 times
  general: 5     // General threshold
};

// Filter suggestions by usage count threshold
export const filterSuggestionsByThreshold = (suggestions, threshold = 5) => {
  console.log('🔍 FILTER DEBUG: filterSuggestionsByThreshold called with threshold:', threshold);
  const filtered = suggestions.filter(suggestion => {
    const count = suggestion.count || 0;
    const passes = count >= threshold;
    if (!passes) {
      console.log('🔍 FILTER DEBUG: Rejected by threshold:', suggestion.originalName, 'count:', count, 'threshold:', threshold);
    }
    return passes;
  });
  console.log('🔍 FILTER DEBUG: Threshold filter:', suggestions.length, '→', filtered.length);
  return filtered;
};

// Filter suggestions by quality score
export const filterSuggestionsByQuality = (suggestions, minScore = 0) => {
  console.log('🔍 FILTER DEBUG: filterSuggestionsByQuality called with minScore:', minScore);
  const filtered = suggestions.filter(suggestion => {
    // Calculate a simple quality score based on usage and flags
    let score = suggestion.count || 0;

    // Penalize blocked or reported content
    if (suggestion.isBlocked) score = 0;
    if (suggestion.reportCount > 0) score -= suggestion.reportCount * 5;

    // Bonus for promoted content
    if (suggestion.isPromoted) score += 10;

    const passes = score >= minScore;
    if (!passes) {
      console.log('🔍 FILTER DEBUG: Rejected by quality:', suggestion.originalName, 'score:', score, 'minScore:', minScore);
    }
    return passes;
  });
  console.log('🔍 FILTER DEBUG: Quality filter:', suggestions.length, '→', filtered.length);
  return filtered;
};

// Filter inappropriate content
export const filterInappropriateContent = (suggestions) => {
  console.log('🔍 FILTER DEBUG: filterInappropriateContent called');
  const filtered = suggestions.filter(suggestion => {
    // Check if blocked
    if (suggestion.isBlocked) {
      console.log('🔍 FILTER DEBUG: Rejected inappropriate (blocked):', suggestion.originalName);
      return false;
    }

    // Check if content should be recorded (basic spam filter)
    const text = suggestion.originalName || suggestion.name || '';
    const isAppropriate = shouldRecordSuggestion(text);
    if (!isAppropriate) {
      console.log('🔍 FILTER DEBUG: Rejected inappropriate (spam filter):', suggestion.originalName);
    }
    return isAppropriate;
  });
  console.log('🔍 FILTER DEBUG: Inappropriate content filter:', suggestions.length, '→', filtered.length);
  return filtered;
};

// Filter by recency (age of suggestion)
export const filterByRecency = (suggestions, maxAgeDays = 365) => {
  console.log('🔍 FILTER DEBUG: filterByRecency called with maxAgeDays:', maxAgeDays);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

  const filtered = suggestions.filter(suggestion => {
    // If no date, assume it's recent
    if (!suggestion.firstSeen && !suggestion.lastUsed) {
      return true;
    }

    // Check last used date
    const lastUsed = suggestion.lastUsed?.toDate ? suggestion.lastUsed.toDate() :
                    suggestion.lastUsed ? new Date(suggestion.lastUsed) : null;

    const firstSeen = suggestion.firstSeen?.toDate ? suggestion.firstSeen.toDate() :
                     suggestion.firstSeen ? new Date(suggestion.firstSeen) : null;

    const mostRecentDate = lastUsed || firstSeen;

    if (mostRecentDate && mostRecentDate < cutoffDate) {
      console.log('🔍 FILTER DEBUG: Rejected by age:', suggestion.originalName, 'lastUsed:', lastUsed);
      return false;
    }

    return true;
  });
  console.log('🔍 FILTER DEBUG: Recency filter:', suggestions.length, '→', filtered.length);
  return filtered;
};

// Main quality filter function
export const applyQualityFilters = (suggestions, options = {}) => {
  const {
    minThreshold = true,
    minQuality = 0,
    filterInappropriate = true,
    maxAge = 365,
    maxResults = 10
  } = options;

  console.log('🔍 FILTER DEBUG: applyQualityFilters called with:', {
    suggestionsCount: suggestions.length,
    minThreshold,
    minQuality,
    filterInappropriate,
    maxAge,
    maxResults
  });

  let filtered = [...suggestions];

  // Apply threshold filter
  if (minThreshold) {
    const threshold = typeof minThreshold === 'number' ? minThreshold : 5; // Changed to 5
    filtered = filterSuggestionsByThreshold(filtered, threshold);
  }

  // Apply quality filter
  if (minQuality > 0) {
    filtered = filterSuggestionsByQuality(filtered, minQuality);
  }

  // Apply inappropriate content filter
  if (filterInappropriate) {
    filtered = filterInappropriateContent(filtered);
  }

  // Apply recency filter
  if (maxAge) {
    filtered = filterByRecency(filtered, maxAge);
  }

  // Limit results
  if (maxResults && filtered.length > maxResults) {
    filtered = filtered.slice(0, maxResults);
  }

  console.log('🔍 FILTER DEBUG: Final filtered results:', filtered.length);
  return filtered;
};

// Auto-promotion logic
export const shouldAutoPromote = (suggestion) => {
  const count = suggestion.count || 0;
  const reportCount = suggestion.reportCount || 0;

  // Auto-promote if widely used and not reported
  return count >= 25 && reportCount === 0;
};

// Auto-blocking logic
export const shouldAutoBlock = (suggestion) => {
  const reportCount = suggestion.reportCount || 0;

  // Auto-block if heavily reported
  return reportCount >= 5;
};

// Get suggestions needing manual review
export const getSuggestionsNeedingReview = (suggestions) => {
  return suggestions.filter(suggestion => {
    const reportCount = suggestion.reportCount || 0;
    return reportCount > 0 && reportCount < 5; // Between 1-4 reports
  });
};

// Get contextual filter options based on usage context
export const getContextualFilters = (context = 'autocomplete') => {
  console.log('🔍 FILTER DEBUG: getContextualFilters called with context:', context);

  switch (context) {
    case 'autocomplete':
      return {
        minThreshold: 5,      // Show suggestions used at least 5 times
        minQuality: 0,        // No quality minimum for autocomplete
        filterInappropriate: true,
        maxAge: 365,
        maxResults: 10
      };

    case 'admin':
      return {
        minThreshold: false,  // Show all suggestions for admin
        minQuality: 0,
        filterInappropriate: false,
        maxAge: null,
        maxResults: 100
      };

    case 'public':
      return {
        minThreshold: 10,     // Higher threshold for public display
        minQuality: 10,
        filterInappropriate: true,
        maxAge: 180,
        maxResults: 20
      };

    default:
      console.log('🔍 FILTER DEBUG: Using default filter options for context:', context);
      return {
        minThreshold: 5,      // Changed to 5
        minQuality: 0,
        filterInappropriate: true,
        maxAge: 365,
        maxResults: 10
      };
  }
};