// services/suggestions/core/suggestionValidation.js
// Input validation and sanitization for suggestions

import { normalizeText, shouldRecordSuggestion } from '../utils/textNormalization.js';

// Validate suggestion input before recording
export const validateSuggestionInput = (text, type = 'general') => {
  const errors = [];

  if (!text || typeof text !== 'string') {
    errors.push('Input must be a non-empty string');
    return { isValid: false, errors, normalized: '' };
  }

  const normalized = normalizeText(text);

  // Length validation
  if (normalized.length < 2) {
    errors.push('Input must be at least 2 characters long');
  }

  if (normalized.length > 100) {
    errors.push('Input must be less than 100 characters');
  }

  // Content validation
  if (!shouldRecordSuggestion(text)) {
    errors.push('Input contains invalid content or patterns');
  }

  // Type-specific validation
  switch (type) {
    case 'faction':
      if (normalized.length > 50) {
        errors.push('Faction names should be less than 50 characters');
      }
      break;

    case 'unit':
      if (normalized.length > 60) {
        errors.push('Unit names should be less than 60 characters');
      }
      break;

    case 'manufacturer':
      if (normalized.length > 40) {
        errors.push('Manufacturer names should be less than 40 characters');
      }
      break;

    case 'game':
      if (normalized.length > 50) {
        errors.push('Game names should be less than 50 characters');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalized,
    original: text.trim()
  };
};

// Validate suggestion query parameters
export const validateSuggestionQuery = (manufacturer, game, searchTerm, type) => {
  const errors = [];

  // Manufacturer is required
  if (!manufacturer || typeof manufacturer !== 'string' || !manufacturer.trim()) {
    errors.push('Manufacturer is required');
  }

  // Game is required
  if (!game || typeof game !== 'string' || !game.trim()) {
    errors.push('Game is required');
  }

  // Search term validation
  if (searchTerm && typeof searchTerm !== 'string') {
    errors.push('Search term must be a string');
  }

  if (searchTerm && searchTerm.length > 100) {
    errors.push('Search term too long');
  }

  // Type validation
  const validTypes = ['faction', 'unit', 'manufacturer', 'game', 'general'];
  if (type && !validTypes.includes(type)) {
    errors.push(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedManufacturer: manufacturer ? normalizeText(manufacturer) : '',
    normalizedGame: game ? normalizeText(game) : '',
    normalizedSearchTerm: searchTerm ? normalizeText(searchTerm) : ''
  };
};

// Validate metadata for suggestion recording
export const validateSuggestionMetadata = (metadata = {}) => {
  const errors = [];
  const validatedMetadata = {};

  // Context validation (optional)
  if (metadata.context) {
    if (typeof metadata.context !== 'string') {
      errors.push('Context must be a string');
    } else if (metadata.context.length > 200) {
      errors.push('Context too long (max 200 characters)');
    } else {
      validatedMetadata.context = metadata.context.trim();
    }
  }

  // Source validation (optional)
  if (metadata.source) {
    const validSources = ['user_input', 'import', 'admin', 'api'];
    if (!validSources.includes(metadata.source)) {
      errors.push(`Invalid source. Must be one of: ${validSources.join(', ')}`);
    } else {
      validatedMetadata.source = metadata.source;
    }
  } else {
    validatedMetadata.source = 'user_input';
  }

  // User ID validation (optional but recommended)
  if (metadata.userId) {
    if (typeof metadata.userId !== 'string') {
      errors.push('User ID must be a string');
    } else {
      validatedMetadata.userId = metadata.userId;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    metadata: validatedMetadata
  };
};

// Validate admin moderation data
export const validateModerationData = (action, reason = '') => {
  const errors = [];

  const validActions = ['promote', 'block', 'unblock', 'delete'];
  if (!validActions.includes(action)) {
    errors.push(`Invalid action. Must be one of: ${validActions.join(', ')}`);
  }

  if ((action === 'block' || action === 'delete') && !reason.trim()) {
    errors.push('Reason is required for blocking or deleting suggestions');
  }

  if (reason && reason.length > 500) {
    errors.push('Reason too long (max 500 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    action,
    reason: reason.trim()
  };
};