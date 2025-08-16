// services/shared/constants.js - Shared constants and configuration values
export const PROJECT_STATUS = {
  UPCOMING: 'upcoming',
  STARTED: 'started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

export const PROJECT_DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};

export const PAINT_STATUS = {
  COLLECTION: 'collection',
  WISHLIST: 'wishlist',
  LISTED: 'listed'
};

export const USER_CATEGORIES = {
  ADULT: 'adult',
  MINOR: 'minor'
};

export const SUBSCRIPTION_TYPES = {
  FREE: 'free',
  VOUCHER: 'voucher',
  STRIPE: 'stripe',
  TRIAL: 'trial'
};

// Email types for consistency across email services
export const EMAIL_TYPES = {
  WELCOME: 'welcome',
  ACCOUNT_DELETION: 'account_deletion',
  ACCOUNT_RECOVERY: 'account_recovery',
  ACHIEVEMENT_DIGEST: 'achievement_digest',
  STREAK_MILESTONE: 'streak_milestone',
  WEEKLY_SUMMARY: 'weekly_summary',
  RE_ENGAGEMENT: 're_engagement'
};

// Email scheduling configuration
export const EMAIL_SCHEDULE = {
  DAILY_BATCH_TIME: '20:00',     // 8 PM for daily digests
  WEEKLY_BATCH_TIME: '10:00',    // 10 AM on Sundays
  IMMEDIATE_INTERVAL: 5,         // Process immediate emails every 5 minutes
  MAX_EMAILS_PER_DAY: 2,
  MAX_EMAILS_PER_HOUR: 1
};

// Achievement categories
export const ACHIEVEMENT_CATEGORIES = {
  CREATE_PROJECT: 'create_project',
  COMPLETIONIST: 'completionist',
  PAINT_MASTER: 'paint_master',
  BRAND_EXPLORER: 'brand_explorer',
  TECHNIQUE_SPECIALIST: 'technique_specialist',
  STEP_MASTER: 'step_master',
  PHOTO_DOCUMENTARIAN: 'photo_documentarian'
};

// Streak types
export const STREAK_TYPES = {
  DAILY_ACTIVITY: 'daily_activity',
  WEEKLY_COMPLETION: 'weekly_completion'
};

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,    // 10MB
  MAX_FILES_PER_UPLOAD: 10,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_IMAGE_DIMENSION: 2048,           // Max width/height in pixels
  JPEG_QUALITY: 0.85,
  WEBP_QUALITY: 0.85
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PROJECTS_PAGE_SIZE: 5,
  PAINTS_PAGE_SIZE: 20
};

// Common validation patterns
export const VALIDATION = {
  MIN_PROJECT_NAME_LENGTH: 1,
  MAX_PROJECT_NAME_LENGTH: 100,
  MIN_PAINT_NAME_LENGTH: 1,
  MAX_PAINT_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 0,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_VOUCHER_CODE_LENGTH: 3,
  MAX_VOUCHER_CODE_LENGTH: 20
};

// Common error messages
export const ERROR_MESSAGES = {
  USER_NOT_AUTHENTICATED: 'User not authenticated',
  ITEM_NOT_FOUND: 'Item not found',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  INVALID_INPUT: 'Invalid input provided',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unknown error occurred'
};

// Success messages
export const SUCCESS_MESSAGES = {
  ITEM_CREATED: 'Item created successfully',
  ITEM_UPDATED: 'Item updated successfully',
  ITEM_DELETED: 'Item deleted successfully',
  EMAIL_SENT: 'Email sent successfully',
  OPERATION_COMPLETED: 'Operation completed successfully'
};

// Color palette for UI consistency
export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4'
};

// Common sort orders
export const SORT_ORDERS = {
  CREATED_DESC: 'created_desc',
  CREATED_ASC: 'created_asc',
  UPDATED_DESC: 'updated_desc',
  UPDATED_ASC: 'updated_asc',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc'
};

// Default values for various entities
export const DEFAULTS = {
  PROJECT_STATUS: PROJECT_STATUS.UPCOMING,
  PROJECT_DIFFICULTY: PROJECT_DIFFICULTY.BEGINNER,
  PAINT_STATUS: PAINT_STATUS.LISTED,
  PAINT_LEVEL: 100,
  USER_TIER: 'free',
  PROJECT_COVER_IMAGE: '/default-project-cover.jpg'
};

// Feature flags (for gradual rollouts)
export const FEATURE_FLAGS = {
  ENABLE_ACHIEVEMENTS: true,
  ENABLE_EMAIL_NOTIFICATIONS: true,
  ENABLE_COMMUNITY_FEATURES: true,
  ENABLE_ADVANCED_SEARCH: true,
  ENABLE_BULK_OPERATIONS: true
};

// Cache durations (in milliseconds)
export const CACHE_DURATION = {
  USER_PROFILE: 5 * 60 * 1000,      // 5 minutes
  PAINT_CATALOG: 60 * 60 * 1000,    // 1 hour
  TIER_LIMITS: 30 * 60 * 1000,      // 30 minutes
  ACHIEVEMENTS: 15 * 60 * 1000       // 15 minutes
};

// Rate limiting
export const RATE_LIMITS = {
  API_CALLS_PER_MINUTE: 60,
  FILE_UPLOADS_PER_HOUR: 50,
  EMAIL_SENDS_PER_DAY: 10
};

// Export grouped constants for easier importing
export const PROJECT_CONSTANTS = {
  STATUS: PROJECT_STATUS,
  DIFFICULTY: PROJECT_DIFFICULTY,
  DEFAULTS: {
    STATUS: DEFAULTS.PROJECT_STATUS,
    DIFFICULTY: DEFAULTS.PROJECT_DIFFICULTY,
    COVER_IMAGE: DEFAULTS.PROJECT_COVER_IMAGE
  }
};

export const PAINT_CONSTANTS = {
  STATUS: PAINT_STATUS,
  DEFAULTS: {
    STATUS: DEFAULTS.PAINT_STATUS,
    LEVEL: DEFAULTS.PAINT_LEVEL
  }
};

export const EMAIL_CONSTANTS = {
  TYPES: EMAIL_TYPES,
  SCHEDULE: EMAIL_SCHEDULE
};