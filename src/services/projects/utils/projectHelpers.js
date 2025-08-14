// services/projects/utils/projectHelpers.js
import { collection } from 'firebase/firestore';
import { db, auth } from '../../../firebase.js';

// Helper function to get current user ID
export const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
};

// Helper function to get user's projects collection reference
export const getUserProjectsCollection = () => {
  const userId = getCurrentUserId();
  return collection(db, 'users', userId, 'projects');
};