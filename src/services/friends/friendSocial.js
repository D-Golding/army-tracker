// services/friends/friendSocial.js - User social profile management and settings with MONTHLY limits
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { getCurrentUserId } from '../shared/userHelpers.js';

// =====================================
// SOCIAL PROFILE MANAGEMENT
// =====================================

/**
 * Initialize user social profile (called during onboarding)
 * @param {string} userId - User ID (optional, uses current user if not provided)
 * @returns {Promise<Object>} Result with success/error
 */
export const initializeUserSocialProfile = async (userId = null) => {
  try {
    const targetUserId = userId || getCurrentUserId();

    // Get user data for initialization
    const userDoc = await getDoc(doc(db, 'users', targetUserId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();

    const socialData = {
      userId: targetUserId,
      userCategory: userData.userCategory,

      // Privacy settings - default to private for safety
      profileVisibility: userData.userCategory === 'adult' ? 'private' : 'private',
      allowFriendRequests: userData.userCategory === 'adult' && userData.communityAccess,
      allowMessages: userData.userCategory === 'adult' && userData.communityAccess,
      showOnlineStatus: false, // Default to private

      // Friend counts
      friendCount: 0,
      pendingRequestsCount: 0,
      sentRequestsCount: 0,

      // Friend suggestions
      lastSuggestionUpdate: null,
      suggestionPreferences: {
        allowMutualFriends: userData.userCategory === 'adult',
        allowGameBasedSuggestions: userData.userCategory === 'adult'
      },

      // Rate limiting - MONTHLY tracking instead of daily
      lastRequestSent: null,
      requestsSentThisMonth: 0, // CHANGED: Monthly tracking

      // Profile stats
      profileViews: 0,
      profileViewsThisMonth: 0,

      // Metadata
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'userSocial', targetUserId), socialData);

    return {
      success: true,
      message: 'Social profile initialized',
      profile: socialData
    };

  } catch (error) {
    console.error('Error initializing social profile:', error);
    return {
      success: false,
      error: error.message || 'Failed to initialize social profile'
    };
  }
};

/**
 * Get user's social profile
 * @param {string} userId - User ID (optional, uses current user if not provided)
 * @returns {Promise<Object>} Social profile data
 */
export const getUserSocialProfile = async (userId = null) => {
  try {
    const targetUserId = userId || getCurrentUserId();

    const socialDoc = await getDoc(doc(db, 'userSocial', targetUserId));

    if (!socialDoc.exists()) {
      // If social profile doesn't exist, initialize it
      if (!userId || userId === getCurrentUserId()) {
        const initResult = await initializeUserSocialProfile(targetUserId);
        if (initResult.success) {
          return {
            success: true,
            profile: initResult.profile
          };
        } else {
          throw new Error('Failed to initialize social profile');
        }
      } else {
        throw new Error('Social profile not found');
      }
    }

    const profileData = {
      id: socialDoc.id,
      ...socialDoc.data()
    };

    // If viewing someone else's profile, increment view count
    if (userId && userId !== getCurrentUserId()) {
      // Increment view counters (fire and forget)
      updateProfileViewCount(userId).catch(console.error);
    }

    return {
      success: true,
      profile: profileData
    };

  } catch (error) {
    console.error('Error getting social profile:', error);
    return {
      success: false,
      error: error.message || 'Failed to load social profile',
      profile: null
    };
  }
};

/**
 * Update user's privacy settings
 * @param {Object} settings - Privacy settings to update
 * @returns {Promise<Object>} Result with success/error
 */
export const updatePrivacySettings = async (settings) => {
  try {
    const currentUserId = getCurrentUserId();

    // Get current user data to validate settings
    const userDoc = await getDoc(doc(db, 'users', currentUserId));
    const userData = userDoc.data();

    // Validate settings based on user category
    const validatedSettings = validatePrivacySettings(settings, userData);

    if (!validatedSettings.isValid) {
      throw new Error(validatedSettings.error);
    }

    // Update social profile
    const socialRef = doc(db, 'userSocial', currentUserId);
    await updateDoc(socialRef, {
      ...validatedSettings.settings,
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      message: 'Privacy settings updated',
      settings: validatedSettings.settings
    };

  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return {
      success: false,
      error: error.message || 'Failed to update privacy settings'
    };
  }
};

/**
 * Update friend suggestion preferences
 * @param {Object} preferences - Suggestion preferences
 * @returns {Promise<Object>} Result with success/error
 */
export const updateSuggestionPreferences = async (preferences) => {
  try {
    const currentUserId = getCurrentUserId();

    const updates = {
      suggestionPreferences: {
        allowMutualFriends: Boolean(preferences.allowMutualFriends),
        allowGameBasedSuggestions: Boolean(preferences.allowGameBasedSuggestions)
      },
      updatedAt: serverTimestamp()
    };

    const socialRef = doc(db, 'userSocial', currentUserId);
    await updateDoc(socialRef, updates);

    return {
      success: true,
      message: 'Suggestion preferences updated'
    };

  } catch (error) {
    console.error('Error updating suggestion preferences:', error);
    return {
      success: false,
      error: error.message || 'Failed to update suggestion preferences'
    };
  }
};

/**
 * Get social statistics for user with MONTHLY limits
 * @returns {Promise<Object>} Social statistics
 */
export const getSocialStatistics = async () => {
  try {
    const currentUserId = getCurrentUserId();

    const socialProfile = await getUserSocialProfile();
    if (!socialProfile.success) {
      throw new Error('Failed to load social profile');
    }

    const profile = socialProfile.profile;

    // Calculate monthly requests sent by counting actual requests from this month
    const requestsSentThisMonth = await getRequestsSentThisMonth(currentUserId);

    // Calculate additional stats
    const stats = {
      // Basic counts
      friendCount: profile.friendCount || 0,
      pendingRequestsCount: profile.pendingRequestsCount || 0,
      sentRequestsCount: profile.sentRequestsCount || 0,

      // Engagement stats
      profileViews: profile.profileViews || 0,
      profileViewsThisMonth: profile.profileViewsThisMonth || 0,

      // Activity stats
      lastActive: profile.updatedAt,
      memberSince: profile.createdAt,

      // Privacy status
      profileVisibility: profile.profileVisibility,
      allowsFriendRequests: profile.allowFriendRequests,

      // Rate limiting info - MONTHLY (300 per month)
      canSendRequests: await canSendFriendRequest(),
      requestsRemainingToday: Math.max(0, 300 - requestsSentThisMonth) // CHANGED: Monthly limit
    };

    return {
      success: true,
      stats
    };

  } catch (error) {
    console.error('Error getting social statistics:', error);
    return {
      success: false,
      error: error.message || 'Failed to load social statistics',
      stats: null
    };
  }
};

/**
 * Update friendship settings for a specific friend
 * @param {string} friendshipId - Friendship document ID
 * @param {Object} settings - Settings to update
 * @returns {Promise<Object>} Result with success/error
 */
export const updateFriendshipSettings = async (friendshipId, settings) => {
  try {
    const currentUserId = getCurrentUserId();

    // Get friendship document
    const friendshipDoc = await getDoc(doc(db, 'friendships', friendshipId));
    if (!friendshipDoc.exists()) {
      throw new Error('Friendship not found');
    }

    const friendshipData = friendshipDoc.data();

    // Determine which user settings to update
    const isUser1 = friendshipData.user1Id === currentUserId;
    const settingsKey = isUser1 ? 'user1Settings' : 'user2Settings';

    // Validate settings
    const validatedSettings = {
      allowMessages: Boolean(settings.allowMessages),
      allowProjectSharing: Boolean(settings.allowProjectSharing),
      showOnlineStatus: Boolean(settings.showOnlineStatus)
    };

    // Update friendship document
    const friendshipRef = doc(db, 'friendships', friendshipId);
    await updateDoc(friendshipRef, {
      [settingsKey]: validatedSettings,
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      message: 'Friendship settings updated',
      settings: validatedSettings
    };

  } catch (error) {
    console.error('Error updating friendship settings:', error);
    return {
      success: false,
      error: error.message || 'Failed to update friendship settings'
    };
  }
};

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Get actual number of requests sent this month by counting Firestore documents
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of requests sent this month
 */
const getRequestsSentThisMonth = async (userId) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const q = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', userId),
      where('createdAt', '>=', startOfMonth)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;

  } catch (error) {
    console.error('Error counting monthly requests:', error);
    return 0;
  }
};

/**
 * Validate privacy settings based on user category and permissions
 */
const validatePrivacySettings = (settings, userData) => {
  const isAdult = userData.userCategory === 'adult';
  const hasCommunityAccess = userData.communityAccess;

  // Minors have restricted settings
  if (!isAdult) {
    return {
      isValid: true,
      settings: {
        profileVisibility: 'private', // Always private for minors
        allowFriendRequests: false,   // No friend requests for minors
        allowMessages: false,         // No messaging for minors
        showOnlineStatus: false       // No online status for minors
      }
    };
  }

  // Adults without community access have limited settings
  if (!hasCommunityAccess) {
    return {
      isValid: true,
      settings: {
        profileVisibility: 'private',
        allowFriendRequests: false,
        allowMessages: false,
        showOnlineStatus: Boolean(settings.showOnlineStatus) // They can control this
      }
    };
  }

  // Adults with community access can control their settings
  const validSettings = {};

  // Profile visibility
  if (settings.profileVisibility) {
    const allowedVisibilities = ['private', 'friends', 'public'];
    if (allowedVisibilities.includes(settings.profileVisibility)) {
      validSettings.profileVisibility = settings.profileVisibility;
    }
  }

  // Friend requests
  if (settings.allowFriendRequests !== undefined) {
    validSettings.allowFriendRequests = Boolean(settings.allowFriendRequests);
  }

  // Messages
  if (settings.allowMessages !== undefined) {
    validSettings.allowMessages = Boolean(settings.allowMessages);
  }

  // Online status
  if (settings.showOnlineStatus !== undefined) {
    validSettings.showOnlineStatus = Boolean(settings.showOnlineStatus);
  }

  return {
    isValid: true,
    settings: validSettings
  };
};

/**
 * Check if user can send friend requests (monthly rate limiting)
 */
const canSendFriendRequest = async () => {
  try {
    const currentUserId = getCurrentUserId();
    const requestsSentThisMonth = await getRequestsSentThisMonth(currentUserId);

    // Check monthly limit (300 requests per month)
    return requestsSentThisMonth < 300;

  } catch (error) {
    console.error('Error checking friend request permission:', error);
    return false;
  }
};

/**
 * Increment profile view count
 */
const updateProfileViewCount = async (profileUserId) => {
  try {
    const socialRef = doc(db, 'userSocial', profileUserId);
    await updateDoc(socialRef, {
      profileViews: increment(1),
      profileViewsThisMonth: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    // Silent fail for view counting
    console.warn('Failed to update profile view count:', error);
  }
};

/**
 * Reset monthly counters (would be called by a scheduled function)
 */
export const resetMonthlyCounters = async (userId) => {
  try {
    const socialRef = doc(db, 'userSocial', userId);
    await updateDoc(socialRef, {
      requestsSentThisMonth: 0,
      profileViewsThisMonth: 0,
      lastRequestSent: null,
      updatedAt: serverTimestamp()
    });

    return { success: true };

  } catch (error) {
    console.error('Error resetting monthly counters:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update social counters (used by other friend functions)
 * @param {string} userId - User ID
 * @param {Object} updates - Counter updates (can include increment values)
 */
export const updateSocialCounters = async (userId, updates) => {
  try {
    const socialRef = doc(db, 'userSocial', userId);

    // Convert increment values to Firestore increment operations
    const firestoreUpdates = {};

    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'number') {
        firestoreUpdates[key] = increment(value);
      } else {
        firestoreUpdates[key] = value;
      }
    }

    firestoreUpdates.updatedAt = serverTimestamp();

    await updateDoc(socialRef, firestoreUpdates);

    return { success: true };

  } catch (error) {
    // If social profile doesn't exist, initialize it first
    if (error.code === 'not-found') {
      const initResult = await initializeUserSocialProfile(userId);
      if (initResult.success) {
        // Try the update again
        return await updateSocialCounters(userId, updates);
      }
    }

    console.error('Error updating social counters:', error);
    return { success: false, error: error.message };
  }
};

// Legacy function name for backward compatibility
export const resetDailyCounters = resetMonthlyCounters;