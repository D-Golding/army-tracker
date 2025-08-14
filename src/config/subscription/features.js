// config/subscription/features.js - Feature definitions and metadata
import { FEATURE_CATEGORIES } from './constants.js';

export const FEATURES = {
  // Core app features
  PAINTS: 'paints',
  PROJECTS: 'projects',
  PHOTOS: 'photos',

  // Community features
  COMMUNITY_READ: 'communityRead',
  COMMUNITY_POST: 'communityPost',
  COMMUNITY_COMMENT: 'communityComment',
  COMMUNITY_LIKE: 'communityLike',
  COMMUNITY_MESSAGE: 'communityMessage',
  COMMUNITY_CREATE_GROUPS: 'communityCreateGroups',

  // Advanced features
  ADVANCED_ANALYTICS: 'advancedAnalytics',
  EXPORT_DATA: 'exportData',
  PRIORITY_SUPPORT: 'prioritySupport'
};

// Feature definitions with metadata
export const FEATURE_DEFINITIONS = {
  [FEATURES.PAINTS]: {
    name: 'Paint Inventory',
    category: FEATURE_CATEGORIES.CORE,
    description: 'Track your paint collection'
  },
  [FEATURES.PROJECTS]: {
    name: 'Project Tracking',
    category: FEATURE_CATEGORIES.CORE,
    description: 'Manage your painting projects'
  },
  [FEATURES.PHOTOS]: {
    name: 'Photo Storage',
    category: FEATURE_CATEGORIES.CORE,
    description: 'Upload and store project photos'
  },
  [FEATURES.COMMUNITY_READ]: {
    name: 'Community Access',
    category: FEATURE_CATEGORIES.COMMUNITY,
    description: 'View community posts and projects'
  },
  [FEATURES.COMMUNITY_POST]: {
    name: 'Share Projects',
    category: FEATURE_CATEGORIES.COMMUNITY,
    description: 'Share your own projects with the community'
  },
  [FEATURES.COMMUNITY_COMMENT]: {
    name: 'Comments',
    category: FEATURE_CATEGORIES.COMMUNITY,
    description: 'Comment on community posts'
  },
  [FEATURES.COMMUNITY_LIKE]: {
    name: 'Reactions',
    category: FEATURE_CATEGORIES.COMMUNITY,
    description: 'Like and react to posts'
  },
  [FEATURES.COMMUNITY_MESSAGE]: {
    name: 'Direct Messaging',
    category: FEATURE_CATEGORIES.COMMUNITY,
    description: 'Send direct messages to other users'
  },
  [FEATURES.COMMUNITY_CREATE_GROUPS]: {
    name: 'Create Groups',
    category: FEATURE_CATEGORIES.COMMUNITY,
    description: 'Create and manage hobby groups'
  },
  [FEATURES.ADVANCED_ANALYTICS]: {
    name: 'Advanced Analytics',
    category: FEATURE_CATEGORIES.ADVANCED,
    description: 'Detailed progress tracking and insights'
  },
  [FEATURES.EXPORT_DATA]: {
    name: 'Data Export',
    category: FEATURE_CATEGORIES.ADVANCED,
    description: 'Export your data in various formats'
  },
  [FEATURES.PRIORITY_SUPPORT]: {
    name: 'Priority Support',
    category: FEATURE_CATEGORIES.ADVANCED,
    description: 'Fast-track customer support'
  }
};