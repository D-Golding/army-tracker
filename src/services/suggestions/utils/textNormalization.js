// services/suggestions/utils/textNormalization.js
// Text cleaning and normalization utilities

export const normalizeText = (input) => {
  if (!input || typeof input !== 'string') return '';

  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')           // Replace spaces with underscores
    .replace(/[^\w_'-]/g, '')       // Remove special chars except underscores, hyphens, apostrophes (hyphen at end)
    .replace(/_{2,}/g, '_')         // Multiple underscores to single
    .replace(/^_+|_+$/g, '')        // Remove leading/trailing underscores
    .substring(0, 100);             // Limit length
};

export const createSearchKey = (manufacturer, game, faction = null) => {
  const parts = [manufacturer, game, faction].filter(Boolean);
  return parts.map(normalizeText).join('/');
};

export const createSuggestionId = (text) => {
  return normalizeText(text);
};

// Check if text should be recorded (filter out test data and spam)
export const shouldRecordSuggestion = (text) => {
  if (!text || typeof text !== 'string') return false;

  const normalized = normalizeText(text);

  // Must have at least 2 characters
  if (normalized.length < 2) return false;

  // Filter out obvious test data and spam patterns
  const blockedPatterns = [
    /^test/i,                    // "test", "testing"
    /^asdf/i,                    // "asdf", "asdfgh"
    /^qwerty/i,                  // "qwerty"
    /^\d+$/,                     // Only numbers
    /^[a-z]{1,2}$/i,            // Single/double letters
    /(.)\1{4,}/,                // Repeated characters (aaaaa)
    /^spam/i,                    // "spam"
    /^delete/i,                  // "delete"
    /^admin/i,                   // "admin"
  ];

  return !blockedPatterns.some(pattern => pattern.test(normalized));
};

// Create cache key for localStorage
export const createCacheKey = (manufacturer, game, faction) => {
  const parts = [manufacturer, game, faction].filter(Boolean).map(normalizeText);
  return `suggestions_cache_${parts.join('_')}`;
};

// Validate that a normalized path segment is valid for Firestore
export const validateFirestoreSegment = (segment) => {
  if (!segment || typeof segment !== 'string') return false;

  // Firestore document/collection names cannot:
  // - Be empty
  // - Contain forward slashes
  // - Be longer than 1500 bytes
  // - Start or end with __.*__ (double underscores)

  if (segment.length === 0 || segment.length > 1500) return false;
  if (segment.includes('/')) return false;
  if (segment.startsWith('__') && segment.endsWith('__')) return false;

  return true;
};

// Create a safe Firestore path segment
export const createFirestoreSegment = (input) => {
  if (!input) return '';

  let normalized = normalizeText(input);

  // Ensure it doesn't start/end with double underscores
  if (normalized.startsWith('__')) {
    normalized = 'x' + normalized;
  }
  if (normalized.endsWith('__')) {
    normalized = normalized + 'x';
  }

  // Ensure it's not empty
  if (normalized.length === 0) {
    normalized = 'unnamed';
  }

  return normalized;
};