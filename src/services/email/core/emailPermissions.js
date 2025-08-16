// services/email/core/emailPermissions.js - Email permission checking logic
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';

/**
 * Check if user can receive gamification emails
 * @param {string} userId - User's ID
 * @param {string} emailType - Type of email (Achievements, Streaks, WeeklySummary, ReEngagement)
 * @returns {Promise<{canSend: boolean, reason?: string, userProfile?: object}>}
 */
export const checkGamificationEmailPermissions = async (userId, emailType) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return { canSend: false, reason: 'User not found' };
    }

    const userProfile = userDoc.data();

    // Must be adult (minors can't access community features)
    if (userProfile.userCategory === 'minor') {
      return { canSend: false, reason: 'Minors cannot receive community emails', userProfile };
    }

    // Must have community consent
    if (!userProfile.privacyConsents?.community) {
      return { canSend: false, reason: 'Community consent not granted', userProfile };
    }

    // Must have community access enabled
    if (!userProfile.communityAccess) {
      return { canSend: false, reason: 'Community access not enabled', userProfile };
    }

    // Check specific email preference
    const emailPrefKey = `email${emailType}`;
    if (!userProfile.preferences?.[emailPrefKey] && !userProfile.gamification?.preferences?.[emailPrefKey]) {
      return { canSend: false, reason: `${emailType} emails disabled in preferences`, userProfile };
    }

    // Check email frequency preferences if applicable
    if (emailType === 'WeeklySummary') {
      const summaryFrequency = userProfile.preferences?.summaryFrequency || 'weekly';
      if (summaryFrequency === 'never') {
        return { canSend: false, reason: 'Weekly summary frequency set to never', userProfile };
      }
    }

    return { canSend: true, userProfile };

  } catch (error) {
    console.error('Error checking email permissions:', error);
    return { canSend: false, reason: 'Permission check failed' };
  }
};

/**
 * Check if user can receive account-related emails (always allowed for authenticated users)
 * @param {string} userId - User's ID
 * @returns {Promise<{canSend: boolean, reason?: string, userProfile?: object}>}
 */
export const checkAccountEmailPermissions = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return { canSend: false, reason: 'User not found' };
    }

    const userProfile = userDoc.data();
    return { canSend: true, userProfile };

  } catch (error) {
    console.error('Error checking account email permissions:', error);
    return { canSend: false, reason: 'Permission check failed' };
  }
};