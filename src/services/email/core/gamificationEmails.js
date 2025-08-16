// services/email/core/gamificationEmails.js - Gamification-related email functions
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { checkGamificationEmailPermissions } from './emailPermissions.js';

/**
 * Send achievement digest email (daily batch)
 * @param {string} email - User's email address
 * @param {string} userName - User's display name
 * @param {Array} achievements - Array of achievements unlocked today
 * @param {object} stats - User statistics
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendAchievementDigestEmail = async (email, userName, achievements, stats = {}) => {
  try {
    const isMultiple = achievements.length > 1;
    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

    const emailData = {
      to: [email],
      message: {
        subject: isMultiple
          ? `🏆 ${achievements.length} New Achievements Unlocked - Tabletop Tactica`
          : `🏆 Achievement Unlocked: ${achievements[0].name} - Tabletop Tactica`,
        html: generateAchievementDigestHTML(userName, achievements, totalPoints, stats)
      }
    };

    const docRef = await addDoc(collection(db, 'mail'), emailData);

    return {
      success: true,
      messageId: docRef.id,
      message: 'Achievement digest email queued for sending'
    };

  } catch (error) {
    console.error('Error sending achievement digest email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send achievement digest email'
    };
  }
};

/**
 * Send streak milestone email (immediate)
 * @param {string} email - User's email address
 * @param {string} userName - User's display name
 * @param {object} milestone - Streak milestone details
 * @param {object} streakData - Current streak information
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendStreakMilestoneEmail = async (email, userName, milestone, streakData = {}) => {
  try {
    const emailData = {
      to: [email],
      message: {
        subject: `🔥 ${milestone.days} Day Streak Milestone! - Tabletop Tactica`,
        html: generateStreakMilestoneHTML(userName, milestone, streakData)
      }
    };

    const docRef = await addDoc(collection(db, 'mail'), emailData);

    return {
      success: true,
      messageId: docRef.id,
      message: 'Streak milestone email queued for sending'
    };

  } catch (error) {
    console.error('Error sending streak milestone email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send streak milestone email'
    };
  }
};

/**
 * Send weekly progress summary email (Sundays)
 * @param {string} email - User's email address
 * @param {string} userName - User's display name
 * @param {object} weeklyData - Week's progress data
 * @param {object} communityStats - Community benchmarking data
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendWeeklyProgressEmail = async (email, userName, weeklyData, communityStats = {}) => {
  try {
    const emailData = {
      to: [email],
      message: {
        subject: `📊 Your Weekly Progress Report - Tabletop Tactica`,
        html: generateWeeklyProgressHTML(userName, weeklyData, communityStats)
      }
    };

    const docRef = await addDoc(collection(db, 'mail'), emailData);

    return {
      success: true,
      messageId: docRef.id,
      message: 'Weekly progress email queued for sending'
    };

  } catch (error) {
    console.error('Error sending weekly progress email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send weekly progress email'
    };
  }
};

/**
 * Send re-engagement email (14 or 30 days inactive)
 * @param {string} email - User's email address
 * @param {string} userName - User's display name
 * @param {number} daysInactive - Number of days since last activity
 * @param {object} userData - User's projects and progress
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendReEngagementEmail = async (email, userName, daysInactive, userData = {}) => {
  try {
    const emailData = {
      to: [email],
      message: {
        subject: daysInactive >= 30
          ? `We miss you! Your painting projects are waiting - Tabletop Tactica`
          : `Keep your streak alive! - Tabletop Tactica`,
        html: generateReEngagementHTML(userName, daysInactive, userData)
      }
    };

    const docRef = await addDoc(collection(db, 'mail'), emailData);

    return {
      success: true,
      messageId: docRef.id,
      message: 'Re-engagement email queued for sending'
    };

  } catch (error) {
    console.error('Error sending re-engagement email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send re-engagement email'
    };
  }
};

/**
 * Test gamification email connectivity (for debugging)
 * @returns {Promise<boolean>} Whether email service is accessible
 */
export const testGamificationEmailService = async () => {
  try {
    // Test with a dummy achievement email
    await sendAchievementDigestEmail('test@example.com', 'Test User', [
      {
        id: 'test',
        name: 'Test Achievement',
        description: 'Test achievement for connectivity testing',
        icon: '🧪',
        points: 50
      }
    ], { totalPoints: 150 });
    return true;
  } catch (error) {
    console.error('Gamification email service test failed:', error);
    return false;
  }
};

// =================
// BASIC GAMIFICATION HTML TEMPLATES (Import detailed ones from emailTemplates.js)
// =================

// These are simplified versions - the full templates are in emailTemplates.js
const generateAchievementDigestHTML = (userName, achievements, totalPoints, stats) => {
  // Import from emailTemplates.js for the full version
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1>🏆 Achievement${achievements.length > 1 ? 's' : ''} Unlocked!</h1>
    <p>Hello ${userName}!</p>
    <p>You earned ${totalPoints} points with ${achievements.length} achievement${achievements.length > 1 ? 's' : ''}!</p>
    <p>Keep up the amazing work!</p>
  </div>`;
};

const generateStreakMilestoneHTML = (userName, milestone, streakData) => {
  // Import from emailTemplates.js for the full version
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1>🔥 ${milestone.days} Day Streak!</h1>
    <p>Hello ${userName}!</p>
    <p>Incredible consistency! You've maintained a ${milestone.days} day streak.</p>
    <p>Keep the fire burning!</p>
  </div>`;
};

const generateWeeklyProgressHTML = (userName, weeklyData, communityStats) => {
  // Import from emailTemplates.js for the full version
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1>📊 Your Weekly Progress Report</h1>
    <p>Hello ${userName}!</p>
    <p>This week you completed ${weeklyData.stepsCompleted || 0} steps and added ${weeklyData.photosAdded || 0} photos.</p>
    <p>Keep creating amazing miniatures!</p>
  </div>`;
};

const generateReEngagementHTML = (userName, daysInactive, userData) => {
  // Import from emailTemplates.js for the full version
  const is30Days = daysInactive >= 30;
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1>${is30Days ? '😔 We Miss You!' : '⏰ Keep Your Momentum!'}</h1>
    <p>Hello ${userName}!</p>
    <p>It's been ${daysInactive} days since your last activity. Your painting projects are waiting for you!</p>
    <p>${is30Days ? 'Time to bring them back to life!' : 'Jump back in before you lose your creative flow!'}</p>
  </div>`;
};