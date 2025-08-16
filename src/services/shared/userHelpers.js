// services/shared/userHelpers.js - Common user authentication and collection helpers
import { collection } from 'firebase/firestore';
import { db, auth } from '../../firebase.js';

/**
 * Get current authenticated user ID
 * @returns {string} User ID
 * @throws {Error} If user not authenticated
 */
export const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
};

/**
 * Get user's paints collection reference
 * @param {string} userId - Optional user ID, uses current user if not provided
 * @returns {CollectionReference} Paints collection reference
 */
export const getUserPaintsCollection = (userId = null) => {
  const uid = userId || getCurrentUserId();
  return collection(db, 'users', uid, 'paints');
};

/**
 * Get user's projects collection reference
 * @param {string} userId - Optional user ID, uses current user if not provided
 * @returns {CollectionReference} Projects collection reference
 */
export const getUserProjectsCollection = (userId = null) => {
  const uid = userId || getCurrentUserId();
  return collection(db, 'users', uid, 'projects');
};

/**
 * Get user's wishlist collection reference
 * @param {string} userId - Optional user ID, uses current user if not provided
 * @returns {CollectionReference} Wishlist collection reference
 */
export const getUserWishlistCollection = (userId = null) => {
  const uid = userId || getCurrentUserId();
  return collection(db, 'users', uid, 'wishlist');
};

/**
 * Get user's needToBuy collection reference
 * @param {string} userId - Optional user ID, uses current user if not provided
 * @returns {CollectionReference} NeedToBuy collection reference
 */
export const getUserNeedToBuyCollection = (userId = null) => {
  const uid = userId || getCurrentUserId();
  return collection(db, 'users', uid, 'needToBuy');
};

/**
 * Get user's document reference
 * @param {string} userId - Optional user ID, uses current user if not provided
 * @returns {DocumentReference} User document reference
 */
export const getUserDocumentRef = (userId = null) => {
  const uid = userId || getCurrentUserId();
  return doc(db, 'users', uid);
};

/**
 * Get user's profile data
 * @param {string} userId - Optional user ID, uses current user if not provided
 * @returns {Promise<Object|null>} User profile data or null if not found
 */
export const getUserProfile = async (userId = null) => {
  try {
    const uid = userId || getCurrentUserId();
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Check if current user is authenticated
 * @returns {boolean} Whether user is authenticated
 */
export const isUserAuthenticated = () => {
  return !!auth.currentUser;
};

/**
 * Get current user's email
 * @returns {string|null} User email or null if not authenticated
 */
export const getCurrentUserEmail = () => {
  const user = auth.currentUser;
  return user?.email || null;
};

/**
 * Get current user's display name
 * @returns {string|null} User display name or null if not authenticated
 */
export const getCurrentUserDisplayName = () => {
  const user = auth.currentUser;
  return user?.displayName || null;
};