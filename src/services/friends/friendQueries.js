// services/friends/friendQueries.js - Friend lists, user search, and relationship queries (fixed friend suggestions)
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { getCurrentUserId } from '../shared/userHelpers.js';

// =====================================
// FRIEND LISTS
// =====================================

/**
 * Get user's friend list with pagination
 * @param {number} pageSize - Number of friends per page (default 20)
 * @param {Object} lastDoc - Last document for pagination
 * @returns {Promise<Object>} Friends list with pagination info
 */
export const getFriendsList = async (pageSize = 20, lastDoc = null) => {
  try {
    const currentUserId = getCurrentUserId();

    // Query friendships where current user is involved
    let q1 = query(
      collection(db, 'friendships'),
      where('user1Id', '==', currentUserId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    let q2 = query(
      collection(db, 'friendships'),
      where('user2Id', '==', currentUserId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q1 = query(q1, startAfter(lastDoc));
      q2 = query(q2, startAfter(lastDoc));
    }

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);

    // Combine and process results
    const allDocs = [...snapshot1.docs, ...snapshot2.docs];

    // Sort by creation date and limit to pageSize
    allDocs.sort((a, b) => b.data().createdAt.seconds - a.data().createdAt.seconds);
    const limitedDocs = allDocs.slice(0, pageSize);

    const friends = limitedDocs.map(docSnap => {
      const friendship = docSnap.data();
      const isUser1 = friendship.user1Id === currentUserId;

      return {
        friendshipId: docSnap.id,
        userId: isUser1 ? friendship.user2Id : friendship.user1Id,
        displayName: isUser1 ? friendship.user2Data.displayName : friendship.user1Data.displayName,
        photoURL: isUser1 ? friendship.user2Data.photoURL : friendship.user1Data.photoURL,
        lastActive: isUser1 ? friendship.user2Data.lastActive : friendship.user1Data.lastActive,
        friendSince: friendship.createdAt,
        settings: isUser1 ? friendship.user2Settings : friendship.user1Settings,
        canMessage: isUser1 ? friendship.user1Settings.allowMessages : friendship.user2Settings.allowMessages,
        showOnlineStatus: isUser1 ? friendship.user2Settings.showOnlineStatus : friendship.user1Settings.showOnlineStatus
      };
    });

    return {
      success: true,
      friends,
      hasMore: limitedDocs.length === pageSize,
      lastDoc: limitedDocs.length > 0 ? limitedDocs[limitedDocs.length - 1] : null
    };

  } catch (error) {
    console.error('Error getting friends list:', error);
    return {
      success: false,
      error: error.message || 'Failed to load friends list',
      friends: [],
      hasMore: false
    };
  }
};

/**
 * Get pending friend requests (received)
 * @returns {Promise<Object>} Pending requests
 */
export const getPendingFriendRequests = async () => {
  try {
    const currentUserId = getCurrentUserId();

    const q = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', currentUserId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    const requests = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      // Add helper properties
      isExpired: docSnap.data().expiresAt.toDate() < new Date(),
      timeRemaining: Math.max(0, docSnap.data().expiresAt.toDate() - new Date())
    }));

    return {
      success: true,
      requests
    };

  } catch (error) {
    console.error('Error getting pending requests:', error);
    return {
      success: false,
      error: error.message || 'Failed to load friend requests',
      requests: []
    };
  }
};

/**
 * Get sent friend requests (that are still pending)
 * @returns {Promise<Object>} Sent requests
 */
export const getSentFriendRequests = async () => {
  try {
    const currentUserId = getCurrentUserId();

    const q = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', currentUserId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    const requests = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      isExpired: docSnap.data().expiresAt.toDate() < new Date(),
      timeRemaining: Math.max(0, docSnap.data().expiresAt.toDate() - new Date())
    }));

    return {
      success: true,
      requests
    };

  } catch (error) {
    console.error('Error getting sent requests:', error);
    return {
      success: false,
      error: error.message || 'Failed to load sent requests',
      requests: []
    };
  }
};

// =====================================
// USER SEARCH & DISCOVERY
// =====================================

/**
 * Search for users by display name (case-insensitive)
 * @param {string} searchTerm - Search query (min 2 chars)
 * @param {number} limitCount - Max results (default 10)
 * @returns {Promise<Object>} Search results
 */
export const searchUsers = async (searchTerm, limitCount = 10) => {
  try {
    const currentUserId = getCurrentUserId();

    if (!searchTerm || searchTerm.length < 2) {
      return {
        success: true,
        users: [],
        message: 'Enter at least 2 characters to search'
      };
    }

    // Get current user's info for filtering
    const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
    const currentUserData = currentUserDoc.data();

    // Only adults with community access can search
    if (currentUserData.userCategory !== 'adult' || !currentUserData.communityAccess) {
      throw new Error('Community access required for user search');
    }

    // Get all adult users with community access (we'll filter by name in JS)
    const q = query(
      collection(db, 'users'),
      where('userCategory', '==', 'adult'),
      where('communityAccess', '==', true),
      limit(100) // Get more users to search through
    );

    const snapshot = await getDocs(q);

    // Get current user's friends and pending requests to filter them out
    const [friendsList, pendingRequests, sentRequests] = await Promise.all([
      getCurrentUserFriendIds(),
      getPendingFriendRequestUserIds(),
      getSentFriendRequestUserIds()
    ]);

    const excludeUserIds = new Set([
      currentUserId,
      ...friendsList,
      ...pendingRequests,
      ...sentRequests
    ]);

    // Filter by search term (case-insensitive) and process results
    const searchLower = searchTerm.toLowerCase();
    const users = snapshot.docs
      .filter(docSnap => {
        if (excludeUserIds.has(docSnap.id)) return false;
        const userData = docSnap.data();
        return userData.displayName && userData.displayName.toLowerCase().includes(searchLower);
      })
      .slice(0, limitCount)
      .map(docSnap => {
        const userData = docSnap.data();
        return {
          userId: docSnap.id,
          displayName: userData.displayName,
          photoURL: userData.photoURL || null,
          userCategory: userData.userCategory,
          // Only show basic info for privacy
          canReceiveFriendRequests: userData.communityAccess && userData.userCategory === 'adult'
        };
      });

    return {
      success: true,
      users,
      searchTerm
    };

  } catch (error) {
    console.error('Error searching users:', error);
    return {
      success: false,
      error: error.message || 'Failed to search users',
      users: []
    };
  }
};

/**
 * Get friend suggestions for current user
 * @param {number} limitCount - Max suggestions (default 5)
 * @returns {Promise<Object>} Friend suggestions
 */
export const getFriendSuggestions = async (limitCount = 5) => {
  try {
    const currentUserId = getCurrentUserId();

    // Get current user's info
    const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
    const currentUserData = currentUserDoc.data();

    if (currentUserData.userCategory !== 'adult' || !currentUserData.communityAccess) {
      return {
        success: true,
        suggestions: [],
        message: 'Friend suggestions not available'
      };
    }

    // Get users to exclude (current user, existing friends, pending requests)
    const [friendsList, pendingRequests, sentRequests] = await Promise.all([
      getCurrentUserFriendIds(),
      getPendingFriendRequestUserIds(),
      getSentFriendRequestUserIds()
    ]);

    const excludeUserIds = new Set([
      currentUserId,
      ...friendsList,
      ...pendingRequests,
      ...sentRequests
    ]);

    // Simple suggestion algorithm: users with similar games/manufacturers
    // In a real app, you'd have more sophisticated algorithms
    const suggestions = [];

    // Get users with same manufacturer preference (from projects)
    if (currentUserData.preferredManufacturers && currentUserData.preferredManufacturers.length > 0) {
      // This would require indexing user preferences
      // For now, we'll get random eligible users
    }

    // Fallback: get some random eligible users
    const q = query(
      collection(db, 'users'),
      where('userCategory', '==', 'adult'),
      where('communityAccess', '==', true),
      limit(limitCount * 3) // Get more to filter
    );

    const snapshot = await getDocs(q);

    const eligibleUsers = snapshot.docs
      .filter(docSnap => !excludeUserIds.has(docSnap.id))
      .slice(0, limitCount)
      .map(docSnap => {
        const userData = docSnap.data();
        return {
          userId: docSnap.id,
          displayName: userData.displayName,
          photoURL: userData.photoURL || null,
          userCategory: userData.userCategory, // FIXED: Added missing userCategory field
          canReceiveFriendRequests: userData.communityAccess && userData.userCategory === 'adult', // FIXED: Added this field
          reason: 'New to the community', // Could be more sophisticated
          mutualFriends: 0 // Could calculate actual mutual friends
        };
      });

    return {
      success: true,
      suggestions: eligibleUsers
    };

  } catch (error) {
    console.error('Error getting friend suggestions:', error);
    return {
      success: false,
      error: error.message || 'Failed to load suggestions',
      suggestions: []
    };
  }
};

// =====================================
// RELATIONSHIP STATUS CHECKS
// =====================================

/**
 * Check relationship status with another user
 * @param {string} userId - User to check relationship with
 * @returns {Promise<Object>} Relationship status
 */
export const getRelationshipStatus = async (userId) => {
  try {
    const currentUserId = getCurrentUserId();

    if (userId === currentUserId) {
      return { status: 'self' };
    }

    // Check if they are friends
    const friendshipDoc = await findFriendshipDocument(currentUserId, userId);
    if (friendshipDoc) {
      return {
        status: 'friends',
        friendshipId: friendshipDoc.id,
        friendSince: friendshipDoc.data().createdAt
      };
    }

    // Check for pending friend request (either direction)
    const [sentRequest, receivedRequest] = await Promise.all([
      getSentRequestToUser(currentUserId, userId),
      getReceivedRequestFromUser(currentUserId, userId)
    ]);

    if (sentRequest) {
      return {
        status: 'request_sent',
        requestId: sentRequest.id,
        sentAt: sentRequest.data().createdAt
      };
    }

    if (receivedRequest) {
      return {
        status: 'request_received',
        requestId: receivedRequest.id,
        receivedAt: receivedRequest.data().createdAt
      };
    }

    return { status: 'none' };

  } catch (error) {
    console.error('Error checking relationship status:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
};

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Get list of current user's friend IDs
 */
const getCurrentUserFriendIds = async () => {
  const currentUserId = getCurrentUserId();

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(query(
      collection(db, 'friendships'),
      where('user1Id', '==', currentUserId),
      where('status', '==', 'active')
    )),
    getDocs(query(
      collection(db, 'friendships'),
      where('user2Id', '==', currentUserId),
      where('status', '==', 'active')
    ))
  ]);

  const friendIds = [];

  snapshot1.docs.forEach(doc => {
    friendIds.push(doc.data().user2Id);
  });

  snapshot2.docs.forEach(doc => {
    friendIds.push(doc.data().user1Id);
  });

  return friendIds;
};

/**
 * Get user IDs from pending friend requests (received)
 */
const getPendingFriendRequestUserIds = async () => {
  const currentUserId = getCurrentUserId();

  const q = query(
    collection(db, 'friendRequests'),
    where('toUserId', '==', currentUserId),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().fromUserId);
};

/**
 * Get user IDs from sent friend requests
 */
const getSentFriendRequestUserIds = async () => {
  const currentUserId = getCurrentUserId();

  const q = query(
    collection(db, 'friendRequests'),
    where('fromUserId', '==', currentUserId),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().toUserId);
};

/**
 * Find friendship document between two users
 */
const findFriendshipDocument = async (user1Id, user2Id) => {
  const queries = [
    query(
      collection(db, 'friendships'),
      where('user1Id', '==', user1Id),
      where('user2Id', '==', user2Id),
      where('status', '==', 'active')
    ),
    query(
      collection(db, 'friendships'),
      where('user1Id', '==', user2Id),
      where('user2Id', '==', user1Id),
      where('status', '==', 'active')
    )
  ];

  for (const q of queries) {
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0];
    }
  }

  return null;
};

/**
 * Get sent friend request to specific user
 */
const getSentRequestToUser = async (fromUserId, toUserId) => {
  const q = query(
    collection(db, 'friendRequests'),
    where('fromUserId', '==', fromUserId),
    where('toUserId', '==', toUserId),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);
  return snapshot.empty ? null : snapshot.docs[0];
};

/**
 * Get received friend request from specific user
 */
const getReceivedRequestFromUser = async (toUserId, fromUserId) => {
  const q = query(
    collection(db, 'friendRequests'),
    where('fromUserId', '==', fromUserId),
    where('toUserId', '==', toUserId),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);
  return snapshot.empty ? null : snapshot.docs[0];
};