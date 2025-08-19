// services/friends/friendCore.js - Core friendship management functions with FIXED transaction order
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
  writeBatch,
  setDoc,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { getCurrentUserId } from '../shared/userHelpers.js';

// =====================================
// FRIEND REQUEST FUNCTIONS
// =====================================

/**
 * Send a friend request to another user
 * @param {string} targetUserId - User to send request to
 * @param {string} message - Optional message (max 200 chars)
 * @returns {Promise<Object>} Result with success/error
 */
export const sendFriendRequest = async (targetUserId, message = '') => {
  try {
    const fromUserId = getCurrentUserId();

    // Validate inputs
    if (!targetUserId || targetUserId === fromUserId) {
      throw new Error('Invalid target user');
    }

    if (message && message.length > 200) {
      throw new Error('Message must be 200 characters or less');
    }

    // Check if users are already friends
    const existingFriendship = await checkExistingFriendship(fromUserId, targetUserId);
    if (existingFriendship) {
      throw new Error('You are already friends with this user');
    }

    // Check for existing pending request
    const existingRequest = await getExistingFriendRequest(fromUserId, targetUserId);
    if (existingRequest) {
      throw new Error('Friend request already sent');
    }

    // Get user data for denormalization
    const [fromUserDoc, toUserDoc] = await Promise.all([
      getDoc(doc(db, 'users', fromUserId)),
      getDoc(doc(db, 'users', targetUserId))
    ]);

    if (!fromUserDoc.exists() || !toUserDoc.exists()) {
      throw new Error('User not found');
    }

    const fromUserData = fromUserDoc.data();
    const toUserData = toUserDoc.data();

    // Check community access and age restrictions
    if (fromUserData.userCategory !== 'adult' || !fromUserData.communityAccess) {
      throw new Error('Community access required to send friend requests');
    }

    if (toUserData.userCategory !== 'adult' || !toUserData.communityAccess) {
      throw new Error('This user cannot receive friend requests');
    }

    // Check MONTHLY rate limiting (300 requests per month - equivalent to 10 per day)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyRequests = await getDocs(
      query(
        collection(db, 'friendRequests'),
        where('fromUserId', '==', fromUserId),
        where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
      )
    );

    if (monthlyRequests.size >= 300) {
      // Calculate first day of next month for European date format (dd.mm.yyyy)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const europeanDate = nextMonth.toLocaleDateString('de-DE'); // dd.mm.yyyy format

      throw new Error(`Monthly friend request limit reached (300). You can send requests again on ${europeanDate}`);
    }

    // Create expiration date (60 days from now) - FIXED: Use Firestore Timestamp
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 60);
    const expiresAt = Timestamp.fromDate(expirationDate);

    // Create friend request
    const requestData = {
      fromUserId,
      toUserId: targetUserId,
      status: 'pending',
      message: message.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expiresAt, // Now properly formatted as Firestore Timestamp

      // Denormalized user data
      fromUserData: {
        displayName: fromUserData.displayName,
        photoURL: fromUserData.photoURL || null,
        userCategory: fromUserData.userCategory
      },
      toUserData: {
        displayName: toUserData.displayName,
        photoURL: toUserData.photoURL || null,
        userCategory: toUserData.userCategory
      }
    };

    const docRef = await addDoc(collection(db, 'friendRequests'), requestData);

    // Update social profile counters
    await updateSocialCounters(fromUserId, { sentRequestsCount: 1 });
    await updateSocialCounters(targetUserId, { pendingRequestsCount: 1 });

    return {
      success: true,
      requestId: docRef.id,
      message: `Friend request sent to ${toUserData.displayName}`
    };

  } catch (error) {
    console.error('Error sending friend request:', error);
    return {
      success: false,
      error: error.message || 'Failed to send friend request'
    };
  }
};

/**
 * Accept a friend request - FIXED: All reads before writes
 * @param {string} requestId - Friend request document ID
 * @returns {Promise<Object>} Result with success/error
 */
export const acceptFriendRequest = async (requestId) => {
  try {
    const currentUserId = getCurrentUserId();

    return await runTransaction(db, async (transaction) => {
      // STEP 1: ALL READS FIRST
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestDoc = await transaction.get(requestRef);

      if (!requestDoc.exists()) {
        throw new Error('Friend request not found');
      }

      const requestData = requestDoc.data();

      // Verify user can accept this request
      if (requestData.toUserId !== currentUserId) {
        throw new Error('You can only accept requests sent to you');
      }

      if (requestData.status !== 'pending') {
        throw new Error('This request has already been processed');
      }

      // Check if request has expired
      const now = new Date();
      const expiresAt = requestData.expiresAt.toDate ? requestData.expiresAt.toDate() : new Date(requestData.expiresAt);
      if (expiresAt < now) {
        throw new Error('This friend request has expired');
      }

      // Read social profile documents BEFORE any writes
      const fromSocialRef = doc(db, 'userSocial', requestData.fromUserId);
      const toSocialRef = doc(db, 'userSocial', requestData.toUserId);

      const fromSocialDoc = await transaction.get(fromSocialRef);
      const toSocialDoc = await transaction.get(toSocialRef);

      const fromSocialData = fromSocialDoc.exists() ? fromSocialDoc.data() : {};
      const toSocialData = toSocialDoc.exists() ? toSocialDoc.data() : {};

      // STEP 2: ALL WRITES AFTER READS

      // Update request status
      transaction.update(requestRef, {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });

      // Create friendship document
      const friendshipData = createFriendshipData(
        requestData.fromUserId,
        requestData.toUserId,
        requestData.fromUserData,
        requestData.toUserData,
        requestData.fromUserId // who initiated
      );

      const friendshipRef = doc(collection(db, 'friendships'));
      transaction.set(friendshipRef, friendshipData);

      // Update social counters with calculated values
      transaction.update(fromSocialRef, {
        friendCount: (fromSocialData.friendCount || 0) + 1,
        sentRequestsCount: Math.max(0, (fromSocialData.sentRequestsCount || 0) - 1),
        updatedAt: serverTimestamp()
      });

      transaction.update(toSocialRef, {
        friendCount: (toSocialData.friendCount || 0) + 1,
        pendingRequestsCount: Math.max(0, (toSocialData.pendingRequestsCount || 0) - 1),
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        friendshipId: friendshipRef.id,
        message: `You are now friends with ${requestData.fromUserData.displayName}`
      };
    });

  } catch (error) {
    console.error('Error accepting friend request:', error);
    return {
      success: false,
      error: error.message || 'Failed to accept friend request'
    };
  }
};

/**
 * Decline a friend request - FIXED: All reads before writes
 * @param {string} requestId - Friend request document ID
 * @returns {Promise<Object>} Result with success/error
 */
export const declineFriendRequest = async (requestId) => {
  try {
    const currentUserId = getCurrentUserId();

    return await runTransaction(db, async (transaction) => {
      // STEP 1: ALL READS FIRST
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestDoc = await transaction.get(requestRef);

      if (!requestDoc.exists()) {
        throw new Error('Friend request not found');
      }

      const requestData = requestDoc.data();

      if (requestData.toUserId !== currentUserId) {
        throw new Error('You can only decline requests sent to you');
      }

      if (requestData.status !== 'pending') {
        throw new Error('This request has already been processed');
      }

      // Read social profile documents BEFORE any writes
      const fromSocialRef = doc(db, 'userSocial', requestData.fromUserId);
      const toSocialRef = doc(db, 'userSocial', requestData.toUserId);

      const fromSocialDoc = await transaction.get(fromSocialRef);
      const toSocialDoc = await transaction.get(toSocialRef);

      const fromSocialData = fromSocialDoc.exists() ? fromSocialDoc.data() : {};
      const toSocialData = toSocialDoc.exists() ? toSocialDoc.data() : {};

      // STEP 2: ALL WRITES AFTER READS

      // Update request status
      transaction.update(requestRef, {
        status: 'declined',
        updatedAt: serverTimestamp()
      });

      // Update social counters with calculated values
      transaction.update(fromSocialRef, {
        sentRequestsCount: Math.max(0, (fromSocialData.sentRequestsCount || 0) - 1),
        updatedAt: serverTimestamp()
      });

      transaction.update(toSocialRef, {
        pendingRequestsCount: Math.max(0, (toSocialData.pendingRequestsCount || 0) - 1),
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Friend request declined'
      };
    });

  } catch (error) {
    console.error('Error declining friend request:', error);
    return {
      success: false,
      error: error.message || 'Failed to decline friend request'
    };
  }
};

/**
 * Cancel a sent friend request
 * @param {string} requestId - Friend request document ID
 * @returns {Promise<Object>} Result with success/error
 */
export const cancelFriendRequest = async (requestId) => {
  try {
    const currentUserId = getCurrentUserId();

    const requestRef = doc(db, 'friendRequests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }

    const requestData = requestDoc.data();

    if (requestData.fromUserId !== currentUserId) {
      throw new Error('You can only cancel requests you sent');
    }

    if (requestData.status !== 'pending') {
      throw new Error('This request cannot be cancelled');
    }

    // Delete the request
    await deleteDoc(requestRef);

    // Update social counters
    await Promise.all([
      updateSocialCounters(requestData.fromUserId, { sentRequestsCount: -1 }),
      updateSocialCounters(requestData.toUserId, { pendingRequestsCount: -1 })
    ]);

    return {
      success: true,
      message: 'Friend request cancelled'
    };

  } catch (error) {
    console.error('Error cancelling friend request:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel friend request'
    };
  }
};

// =====================================
// FRIENDSHIP MANAGEMENT
// =====================================

/**
 * Remove a friend (unfriend)
 * @param {string} friendUserId - User to unfriend
 * @returns {Promise<Object>} Result with success/error
 */
export const removeFriend = async (friendUserId) => {
  try {
    const currentUserId = getCurrentUserId();

    // Find the friendship document
    const friendshipDoc = await findFriendshipDocument(currentUserId, friendUserId);

    if (!friendshipDoc) {
      throw new Error('Friendship not found');
    }

    // Delete the friendship
    await deleteDoc(doc(db, 'friendships', friendshipDoc.id));

    // Update social counters
    await Promise.all([
      updateSocialCounters(currentUserId, { friendCount: -1 }),
      updateSocialCounters(friendUserId, { friendCount: -1 })
    ]);

    return {
      success: true,
      message: 'Friend removed'
    };

  } catch (error) {
    console.error('Error removing friend:', error);
    return {
      success: false,
      error: error.message || 'Failed to remove friend'
    };
  }
};

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Check if two users are already friends
 */
const checkExistingFriendship = async (user1Id, user2Id) => {
  const friendshipDoc = await findFriendshipDocument(user1Id, user2Id);
  return friendshipDoc !== null;
};

/**
 * Find existing friend request between two users
 */
const getExistingFriendRequest = async (fromUserId, toUserId) => {
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
 * Find friendship document between two users
 */
const findFriendshipDocument = async (user1Id, user2Id) => {
  // Try both combinations since friendship documents store user IDs in lexicographical order
  const queries = [
    query(
      collection(db, 'friendships'),
      where('user1Id', '==', user1Id),
      where('user2Id', '==', user2Id)
    ),
    query(
      collection(db, 'friendships'),
      where('user1Id', '==', user2Id),
      where('user2Id', '==', user1Id)
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
 * Create friendship document data
 */
const createFriendshipData = (fromUserId, toUserId, fromUserData, toUserData, initiatedBy) => {
  // Sort user IDs lexicographically for consistent document structure
  const isUser1First = fromUserId < toUserId;

  return {
    user1Id: isUser1First ? fromUserId : toUserId,
    user2Id: isUser1First ? toUserId : fromUserId,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    initiatedBy,

    // Default friendship settings
    user1Settings: {
      allowMessages: true,
      allowProjectSharing: true,
      showOnlineStatus: true
    },
    user2Settings: {
      allowMessages: true,
      allowProjectSharing: true,
      showOnlineStatus: true
    },

    // Denormalized user data
    user1Data: {
      displayName: isUser1First ? fromUserData.displayName : toUserData.displayName,
      photoURL: isUser1First ? fromUserData.photoURL : toUserData.photoURL,
      lastActive: serverTimestamp()
    },
    user2Data: {
      displayName: isUser1First ? toUserData.displayName : fromUserData.displayName,
      photoURL: isUser1First ? toUserData.photoURL : fromUserData.photoURL,
      lastActive: serverTimestamp()
    }
  };
};

/**
 * Update social profile counters
 */
const updateSocialCounters = async (userId, updates) => {
  const socialRef = doc(db, 'userSocial', userId);

  try {
    // Convert increment values to proper Firestore operations for non-transaction updates
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
  } catch (error) {
    // If social profile doesn't exist, create it
    if (error.code === 'not-found') {
      await initializeUserSocialProfile(userId);
      // Try again with the same updates
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
    } else {
      throw error;
    }
  }
};

/**
 * Initialize user social profile if it doesn't exist
 */
const initializeUserSocialProfile = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();

  const socialData = {
    userId,
    userCategory: userData.userCategory,
    profileVisibility: 'private',
    allowFriendRequests: true,
    allowMessages: true,
    showOnlineStatus: true,
    friendCount: 0,
    pendingRequestsCount: 0,
    sentRequestsCount: 0,
    lastSuggestionUpdate: null,
    suggestionPreferences: {
      allowMutualFriends: true,
      allowGameBasedSuggestions: true
    },
    lastRequestSent: null,
    requestsSentThisMonth: 0, // Monthly tracking instead of daily
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, 'userSocial', userId), socialData);
};