// services/suggestions/utils/thresholdCalculator.js
// Dynamic threshold calculations for suggestion quality control

export const MINIMUM_THRESHOLD = 5;
export const PROMOTED_THRESHOLD = 0; // Promoted suggestions always show

// Calculate dynamic threshold based on total suggestions available
export const calculateDynamicThreshold = (totalSuggestions) => {
  if (totalSuggestions < 10) return 1;        // Very lenient for new categories
  if (totalSuggestions < 50) return 2;        // Slightly lenient
  if (totalSuggestions < 200) return 3;       // Standard
  if (totalSuggestions < 500) return 5;       // More strict
  return 8;                                   // Very strict for popular categories
};

// Determine if a suggestion should be shown based on its count and promotion status
export const shouldShowSuggestion = (suggestion, totalSuggestions = 0) => {
  // Always show promoted suggestions
  if (suggestion.isPromoted) {
    return true;
  }

  // Never show blocked suggestions
  if (suggestion.isBlocked) {
    return false;
  }

  // Check against dynamic threshold
  const threshold = calculateDynamicThreshold(totalSuggestions);
  return suggestion.count >= threshold;
};

// Calculate suggestion quality score (0-100)
export const calculateQualityScore = (suggestion) => {
  let score = 0;

  // Base score from usage count (0-60 points)
  score += Math.min(60, suggestion.count * 2);

  // Bonus for being promoted (20 points)
  if (suggestion.isPromoted) {
    score += 20;
  }

  // Penalty for reports (-5 points per report, max -20)
  score -= Math.min(20, suggestion.reportCount * 5);

  // Bonus for recent usage (0-10 points)
  if (suggestion.lastUsed) {
    const daysSinceLastUse = (Date.now() - new Date(suggestion.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastUse < 7) {
      score += 10;
    } else if (daysSinceLastUse < 30) {
      score += 5;
    }
  }

  // Bonus for having variants (shows it's been used in different ways) (0-10 points)
  if (suggestion.variants && suggestion.variants.length > 1) {
    score += Math.min(10, suggestion.variants.length - 1);
  }

  return Math.max(0, Math.min(100, score));
};

// Sort suggestions by relevance (for display order)
export const sortSuggestionsByRelevance = (suggestions, searchTerm = '') => {
  return suggestions.sort((a, b) => {
    // Exact matches first
    if (searchTerm) {
      const aExact = a.name === searchTerm.toLowerCase();
      const bExact = b.name === searchTerm.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Starts with search term
      const aStarts = a.name.startsWith(searchTerm.toLowerCase());
      const bStarts = b.name.startsWith(searchTerm.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
    }

    // Promoted suggestions next
    if (a.isPromoted && !b.isPromoted) return -1;
    if (!a.isPromoted && b.isPromoted) return 1;

    // Then by usage count
    if (a.count !== b.count) return b.count - a.count;

    // Finally by alphabetical order
    return a.originalName.localeCompare(b.originalName);
  });
};