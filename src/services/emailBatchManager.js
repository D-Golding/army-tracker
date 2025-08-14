// services/emailBatchManager.js - Email Batching and Rate Limiting
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import {
  sendAchievementDigestEmail,
  sendStreakMilestoneEmail,
  sendWeeklyProgressEmail,
  sendReEngagementEmail,
  checkGamificationEmailPermissions
} from './gamificationEmailService.js';

/**
 * Email batch queue management
 */
const EMAIL_TYPES = {
  ACHIEVEMENT_DIGEST: 'achievement_digest',
  STREAK_MILESTONE: 'streak_milestone',
  WEEKLY_SUMMARY: 'weekly_summary',
  RE_ENGAGEMENT: 're_engagement'
};

const RATE_LIMITS = {
  MAX_EMAILS_PER_DAY: 2,
  BATCH_TIME: '20:00', // 8 PM local time for daily batches
  WEEKLY_TIME: '10:00' // 10 AM on Sundays for weekly summaries
};

/**
 * Add email to batch queue
 * @param {string} userId - User ID
 * @param {string} emailType - Type of email to queue
 * @param {object} emailData - Email content data
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const queueEmail = async (userId, emailType, emailData) => {
  try {
    // Check if user can receive this email type
    const permission = await checkGamificationEmailPermissions(userId, getEmailTypeForPermission(emailType));
    if (!permission.canSend) {
      return {
        success: false,
        message: `Email not queued: ${permission.reason}`
      };
    }

    // Check daily rate limit
    const todayCount = await getDailyEmailCount(userId);
    if (todayCount >= RATE_LIMITS.MAX_EMAILS_PER_DAY) {
      return {
        success: false,
        message: `Daily rate limit reached (${RATE_LIMITS.MAX_EMAILS_PER_DAY} emails/day)`
      };
    }

    // Queue the email
    const queueData = {
      userId,
      email: permission.userProfile.email,
      userName: permission.userProfile.displayName || 'User',
      emailType,
      emailData,
      status: 'queued',
      queuedAt: serverTimestamp(),
      scheduledFor: getScheduledTime(emailType),
      attempts: 0,
      maxAttempts: 3
    };

    await addDoc(collection(db, 'emailQueue'), queueData);

    return {
      success: true,
      message: `Email queued for ${emailType}`
    };

  } catch (error) {
    console.error('Error queueing email:', error);
    return {
      success: false,
      error: error.message || 'Failed to queue email'
    };
  }
};

/**
 * Process queued emails (called by scheduled function)
 * @param {string} emailType - Type of emails to process
 * @returns {Promise<{processed: number, failed: number, results: Array}>}
 */
export const processEmailQueue = async (emailType = null) => {
  try {
    const now = new Date();
    let emailQuery;

    if (emailType) {
      // Process specific email type
      emailQuery = query(
        collection(db, 'emailQueue'),
        where('emailType', '==', emailType),
        where('status', '==', 'queued'),
        where('scheduledFor', '<=', now)
      );
    } else {
      // Process all due emails
      emailQuery = query(
        collection(db, 'emailQueue'),
        where('status', '==', 'queued'),
        where('scheduledFor', '<=', now)
      );
    }

    const queueSnapshot = await getDocs(emailQuery);
    const results = [];
    let processed = 0;
    let failed = 0;

    for (const queueDoc of queueSnapshot.docs) {
      const queueData = queueDoc.data();

      try {
        // Double-check rate limits before sending
        const todayCount = await getDailyEmailCount(queueData.userId);
        if (todayCount >= RATE_LIMITS.MAX_EMAILS_PER_DAY) {
          await updateDoc(queueDoc.ref, {
            status: 'rate_limited',
            lastAttempt: serverTimestamp(),
            error: 'Daily rate limit exceeded'
          });
          failed++;
          continue;
        }

        // Send the email
        const result = await sendQueuedEmail(queueData);

        if (result.success) {
          // Mark as sent and record in daily count
          await updateDoc(queueDoc.ref, {
            status: 'sent',
            sentAt: serverTimestamp(),
            messageId: result.messageId
          });

          await recordDailyEmailCount(queueData.userId);
          processed++;

          results.push({
            userId: queueData.userId,
            emailType: queueData.emailType,
            status: 'sent',
            messageId: result.messageId
          });

        } else {
          // Handle failure
          const attempts = (queueData.attempts || 0) + 1;

          if (attempts >= queueData.maxAttempts) {
            await updateDoc(queueDoc.ref, {
              status: 'failed',
              attempts,
              lastAttempt: serverTimestamp(),
              error: result.error
            });
          } else {
            // Retry later
            await updateDoc(queueDoc.ref, {
              attempts,
              lastAttempt: serverTimestamp(),
              scheduledFor: new Date(now.getTime() + (attempts * 60 * 60 * 1000)), // Retry in 1-3 hours
              error: result.error
            });
          }

          failed++;
          results.push({
            userId: queueData.userId,
            emailType: queueData.emailType,
            status: 'failed',
            error: result.error,
            attempts
          });
        }

      } catch (error) {
        console.error('Error processing queued email:', error);
        failed++;
      }
    }

    return { processed, failed, results };

  } catch (error) {
    console.error('Error processing email queue:', error);
    return { processed: 0, failed: 0, results: [], error: error.message };
  }
};

/**
 * Send individual queued email
 * @param {object} queueData - Queued email data
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendQueuedEmail = async (queueData) => {
  const { email, userName, emailType, emailData } = queueData;

  switch (emailType) {
    case EMAIL_TYPES.ACHIEVEMENT_DIGEST:
      return await sendAchievementDigestEmail(
        email,
        userName,
        emailData.achievements,
        emailData.stats
      );

    case EMAIL_TYPES.STREAK_MILESTONE:
      return await sendStreakMilestoneEmail(
        email,
        userName,
        emailData.milestone,
        emailData.streakData
      );

    case EMAIL_TYPES.WEEKLY_SUMMARY:
      return await sendWeeklyProgressEmail(
        email,
        userName,
        emailData.weeklyData,
        emailData.communityStats
      );

    case EMAIL_TYPES.RE_ENGAGEMENT:
      return await sendReEngagementEmail(
        email,
        userName,
        emailData.daysInactive,
        emailData.userData
      );

    default:
      return {
        success: false,
        error: `Unknown email type: ${emailType}`
      };
  }
};

/**
 * Get daily email count for user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of emails sent today
 */
const getDailyEmailCount = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const countQuery = query(
      collection(db, 'emailQueue'),
      where('userId', '==', userId),
      where('status', '==', 'sent'),
      where('sentAt', '>=', today),
      where('sentAt', '<', tomorrow)
    );

    const countSnapshot = await getDocs(countQuery);
    return countSnapshot.size;

  } catch (error) {
    console.error('Error getting daily email count:', error);
    return 0;
  }
};

/**
 * Record that an email was sent today (for rate limiting)
 * @param {string} userId - User ID
 */
const recordDailyEmailCount = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    await addDoc(collection(db, 'emailRateLimit'), {
      userId,
      date: today,
      timestamp: serverTimestamp()
    });

  } catch (error) {
    console.error('Error recording daily email count:', error);
  }
};

/**
 * Get scheduled time for email type
 * @param {string} emailType - Type of email
 * @returns {Date} Scheduled send time
 */
const getScheduledTime = (emailType) => {
  const now = new Date();

  switch (emailType) {
    case EMAIL_TYPES.ACHIEVEMENT_DIGEST:
      // Send at 8 PM same day
      const digestTime = new Date(now);
      digestTime.setHours(20, 0, 0, 0);

      // If it's already past 8 PM, schedule for tomorrow
      if (now > digestTime) {
        digestTime.setDate(digestTime.getDate() + 1);
      }

      return digestTime;

    case EMAIL_TYPES.STREAK_MILESTONE:
      // Send immediately (within 5 minutes)
      return new Date(now.getTime() + (5 * 60 * 1000));

    case EMAIL_TYPES.WEEKLY_SUMMARY:
      // Send on next Sunday at 10 AM
      const weeklyTime = new Date(now);
      const daysUntilSunday = (7 - now.getDay()) % 7;
      weeklyTime.setDate(now.getDate() + (daysUntilSunday || 7));
      weeklyTime.setHours(10, 0, 0, 0);

      return weeklyTime;

    case EMAIL_TYPES.RE_ENGAGEMENT:
      // Send immediately
      return new Date(now.getTime() + (2 * 60 * 1000));

    default:
      // Default to immediate
      return new Date(now.getTime() + (5 * 60 * 1000));
  }
};

/**
 * Map email type to permission check type
 * @param {string} emailType - Email type
 * @returns {string} Permission type
 */
const getEmailTypeForPermission = (emailType) => {
  const mapping = {
    [EMAIL_TYPES.ACHIEVEMENT_DIGEST]: 'Achievements',
    [EMAIL_TYPES.STREAK_MILESTONE]: 'Streaks',
    [EMAIL_TYPES.WEEKLY_SUMMARY]: 'WeeklySummary',
    [EMAIL_TYPES.RE_ENGAGEMENT]: 'ReEngagement'
  };

  return mapping[emailType] || 'Achievements';
};

/**
 * Batch achievements for daily digest
 * @param {string} userId - User ID
 * @param {Array} achievements - New achievements unlocked
 * @param {object} stats - User statistics
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const batchAchievementEmail = async (userId, achievements, stats = {}) => {
  return await queueEmail(userId, EMAIL_TYPES.ACHIEVEMENT_DIGEST, {
    achievements,
    stats
  });
};

/**
 * Queue immediate streak milestone email
 * @param {string} userId - User ID
 * @param {object} milestone - Streak milestone data
 * @param {object} streakData - Current streak information
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const queueStreakMilestoneEmail = async (userId, milestone, streakData = {}) => {
  return await queueEmail(userId, EMAIL_TYPES.STREAK_MILESTONE, {
    milestone,
    streakData
  });
};

/**
 * Queue weekly progress summary
 * @param {string} userId - User ID
 * @param {object} weeklyData - Week's progress data
 * @param {object} communityStats - Community benchmarking
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const queueWeeklySummaryEmail = async (userId, weeklyData, communityStats = {}) => {
  return await queueEmail(userId, EMAIL_TYPES.WEEKLY_SUMMARY, {
    weeklyData,
    communityStats
  });
};

/**
 * Queue re-engagement email
 * @param {string} userId - User ID
 * @param {number} daysInactive - Days since last activity
 * @param {object} userData - User's projects and data
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const queueReEngagementEmail = async (userId, daysInactive, userData = {}) => {
  return await queueEmail(userId, EMAIL_TYPES.RE_ENGAGEMENT, {
    daysInactive,
    userData
  });
};

/**
 * Get queue statistics for monitoring
 * @returns {Promise<object>} Queue statistics
 */
export const getQueueStats = async () => {
  try {
    const queueQuery = query(collection(db, 'emailQueue'));
    const queueSnapshot = await getDocs(queueQuery);

    const stats = {
      total: queueSnapshot.size,
      queued: 0,
      sent: 0,
      failed: 0,
      rate_limited: 0
    };

    queueSnapshot.forEach(doc => {
      const data = doc.data();
      stats[data.status] = (stats[data.status] || 0) + 1;
    });

    return stats;

  } catch (error) {
    console.error('Error getting queue stats:', error);
    return { error: error.message };
  }
};

/**
 * Clean up old queue entries (for maintenance)
 * @param {number} daysOld - Delete entries older than this many days
 * @returns {Promise<number>} Number of entries deleted
 */
export const cleanupOldQueueEntries = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldEntriesQuery = query(
      collection(db, 'emailQueue'),
      where('queuedAt', '<', cutoffDate)
    );

    const oldEntriesSnapshot = await getDocs(oldEntriesQuery);
    let deletedCount = 0;

    for (const doc of oldEntriesSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }

    return deletedCount;

  } catch (error) {
    console.error('Error cleaning up queue entries:', error);
    return 0;
  }
};

// Named exports
export { EMAIL_TYPES, RATE_LIMITS };

// Default export
export default {
  queueEmail,
  batchAchievementEmail,
  queueStreakMilestoneEmail,
  queueWeeklySummaryEmail,
  queueReEngagementEmail,
  processEmailQueue,
  getQueueStats,
  cleanupOldQueueEntries,
  EMAIL_TYPES,
  RATE_LIMITS
};