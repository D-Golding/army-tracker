// services/friends/index.js - Main export file for friend services (barrel export pattern)

// Re-export core friendship functions
export {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend
} from './friendCore.js';

// Re-export friend query and search functions
export {
  getFriendsList,
  getPendingFriendRequests,
  getSentFriendRequests,
  searchUsers,
  getFriendSuggestions,
  getRelationshipStatus
} from './friendQueries.js';

// Re-export social profile management functions
export {
  initializeUserSocialProfile,
  getUserSocialProfile,
  updatePrivacySettings,
  updateSuggestionPreferences,
  getSocialStatistics,
  updateFriendshipSettings,
  updateSocialCounters,
  resetDailyCounters
} from './friendSocial.js';

// Default export for backward compatibility and convenience
export default {
  // Core friendship actions (most commonly used)
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,

  // Friend lists and discovery
  getFriendsList,
  getPendingFriendRequests,
  getSentFriendRequests,
  searchUsers,
  getFriendSuggestions,
  getRelationshipStatus,

  // Social profile management
  initializeUserSocialProfile,
  getUserSocialProfile,
  updatePrivacySettings,
  updateFriendshipSettings,
  getSocialStatistics,

  // Utility functions
  updateSocialCounters,
  updateSuggestionPreferences,
  resetDailyCounters
};

// Import the functions for the default export
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend
} from './friendCore.js';

import {
  getFriendsList,
  getPendingFriendRequests,
  getSentFriendRequests,
  searchUsers,
  getFriendSuggestions,
  getRelationshipStatus
} from './friendQueries.js';

import {
  initializeUserSocialProfile,
  getUserSocialProfile,
  updatePrivacySettings,
  updateSuggestionPreferences,
  getSocialStatistics,
  updateFriendshipSettings,
  updateSocialCounters,
  resetDailyCounters
} from './friendSocial.js';