// services/emailScheduler.js - Scheduled Email Functions (for Firebase Functions or Cron Jobs)
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.js';
import {
  processEmailQueue,
  queueWeeklySummaryEmail,
  queueReEngagementEmail,
  EMAIL_TYPES
} from './emailBatchManager.js';

/**
 * Process daily email queue (call this at 8 PM daily)
 * Sends achievement digests and any other queued emails
 */
export const processDailyEmails = async () => {
  console.log('🕐 Processing daily emails...');

  try {
    const result = await processEmailQueue(EMAIL_TYPES.ACHIEVEMENT_DIGEST);

    console.log(`✅ Daily email processing complete:`, {
      processed: result.processed,
      failed: result.failed,
      timestamp: new Date().toISOString()
    });

    return result;

  } catch (error) {
    console.error('❌ Error processing daily emails:', error);
    return { processed: 0, failed: 0, error: error.message };
  }
};

/**
 * Process immediate emails (call this every 5 minutes)
 * Sends streak milestones and re-engagement emails
 */
export const processImmediateEmails = async () => {
  try {
    const streakResult = await processEmailQueue(EMAIL_TYPES.STREAK_MILESTONE);
    const reEngagementResult = await processEmailQueue(EMAIL_TYPES.RE_ENGAGEMENT);

    const totalProcessed = streakResult.processed + reEngagementResult.processed;
    const totalFailed = streakResult.failed + reEngagementResult.failed;

    if (totalProcessed > 0 || totalFailed > 0) {
      console.log(`📧 Immediate emails processed:`, {
        streaks: streakResult.processed,
        reEngagement: reEngagementResult.processed,
        failed: totalFailed,
        timestamp: new Date().toISOString()
      });
    }

    return {
      processed: totalProcessed,
      failed: totalFailed,
      results: [...streakResult.results, ...reEngagementResult.results]
    };

  } catch (error) {
    console.error('❌ Error processing immediate emails:', error);
    return { processed: 0, failed: 0, error: error.message };
  }
};

/**
 * Generate and queue weekly summary emails (call this on Sundays at 9 AM)
 * Prepares weekly summaries for sending at 10 AM
 */
export const generateWeeklySummaries = async () => {
  console.log('📊 Generating weekly summary emails...');

  try {
    // Get all users eligible for weekly summaries
    const eligibleUsers = await getWeeklySummaryEligibleUsers();

    let queued = 0;
    let skipped = 0;
    const results = [];

    for (const user of eligibleUsers) {
      try {
        // Generate weekly data for this user
        const weeklyData = await generateUserWeeklyData(user.id);
        const communityStats = await getCommunityStats();

        // Queue the email
        const result = await queueWeeklySummaryEmail(user.id, weeklyData, communityStats);

        if (result.success) {
          queued++;
          results.push({ userId: user.id, status: 'queued' });
        } else {
          skipped++;
          results.push({ userId: user.id, status: 'skipped', reason: result.message });
        }

      } catch (error) {
        console.error(`Error generating weekly summary for user ${user.id}:`, error);
        skipped++;
        results.push({ userId: user.id, status: 'error', error: error.message });
      }
    }

    console.log(`✅ Weekly summaries generated:`, {
      eligible: eligibleUsers.length,
      queued,
      skipped,
      timestamp: new Date().toISOString()
    });

    return { queued, skipped, results };

  } catch (error) {
    console.error('❌ Error generating weekly summaries:', error);
    return { queued: 0, skipped: 0, error: error.message };
  }
};

/**
 * Process weekly summary queue (call this on Sundays at 10 AM)
 * Sends the queued weekly summary emails
 */
export const processWeeklySummaries = async () => {
  console.log('📮 Processing weekly summary emails...');

  try {
    const result = await processEmailQueue(EMAIL_TYPES.WEEKLY_SUMMARY);

    console.log(`✅ Weekly summaries sent:`, {
      processed: result.processed,
      failed: result.failed,
      timestamp: new Date().toISOString()
    });

    return result;

  } catch (error) {
    console.error('❌ Error processing weekly summaries:', error);
    return { processed: 0, failed: 0, error: error.message };
  }
};

/**
 * Check for inactive users and queue re-engagement emails (call daily)
 */
export const checkInactiveUsers = async () => {
  console.log('👋 Checking for inactive users...');

  try {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Get users who were last active 14 or 30 days ago
    const inactiveUsers = await getInactiveUsers([fourteenDaysAgo, thirtyDaysAgo]);

    let queued = 0;
    let skipped = 0;
    const results = [];

    for (const user of inactiveUsers) {
      try {
        const daysInactive = Math.floor((now - user.lastActive) / (1000 * 60 * 60 * 24));

        // Only send on exact days (14 or 30) to avoid spam
        if (daysInactive !== 14 && daysInactive !== 30) {
          continue;
        }

        // Get user data for re-engagement email
        const userData = await getUserDataForReEngagement(user.id);

        // Queue re-engagement email
        const result = await queueReEngagementEmail(user.id, daysInactive, userData);

        if (result.success) {
          queued++;
          results.push({ userId: user.id, daysInactive, status: 'queued' });
        } else {
          skipped++;
          results.push({ userId: user.id, daysInactive, status: 'skipped', reason: result.message });
        }

      } catch (error) {
        console.error(`Error queueing re-engagement for user ${user.id}:`, error);
        skipped++;
        results.push({ userId: user.id, status: 'error', error: error.message });
      }
    }

    console.log(`✅ Inactive user check complete:`, {
      checked: inactiveUsers.length,
      queued,
      skipped,
      timestamp: new Date().toISOString()
    });

    return { queued, skipped, results };

  } catch (error) {
    console.error('❌ Error checking inactive users:', error);
    return { queued: 0, skipped: 0, error: error.message };
  }
};

/**
 * Main scheduler function - call this every 5 minutes
 * Handles all email processing based on time
 */
export const processScheduledEmails = async () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const dayOfWeek = now.getDay(); // 0 = Sunday

  let results = {
    immediate: null,
    daily: null,
    weekly: null,
    summaryGeneration: null,
    inactiveCheck: null
  };

  try {
    // Always process immediate emails (every 5 minutes)
    results.immediate = await processImmediateEmails();

    // Process daily emails at 8 PM (20:00)
    if (hour === 20 && minute >= 0 && minute < 5) {
      results.daily = await processDailyEmails();
    }

    // Sunday scheduling
    if (dayOfWeek === 0) { // Sunday
      // Generate weekly summaries at 9 AM
      if (hour === 9 && minute >= 0 && minute < 5) {
        results.summaryGeneration = await generateWeeklySummaries();
      }

      // Send weekly summaries at 10 AM
      if (hour === 10 && minute >= 0 && minute < 5) {
        results.weekly = await processWeeklySummaries();
      }
    }

    // Check inactive users daily at 9 AM (not on Sunday, to avoid conflict)
    if (dayOfWeek !== 0 && hour === 9 && minute >= 0 && minute < 5) {
      results.inactiveCheck = await checkInactiveUsers();
    }

    return results;

  } catch (error) {
    console.error('❌ Error in scheduled email processing:', error);
    return { ...results, error: error.message };
  }
};

// Helper Functions

/**
 * Get users eligible for weekly summary emails
 */
const getWeeklySummaryEligibleUsers = async () => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('userCategory', '!=', 'minor'), // Adults only
      where('privacyConsents.community', '==', true), // Community consent
      where('communityAccess', '==', true) // Community access enabled
    );

    const usersSnapshot = await getDocs(usersQuery);
    const eligibleUsers = [];

    usersSnapshot.forEach(doc => {
      const userData = doc.data();

      // Check email preferences
      const emailWeeklySummary = userData.preferences?.emailWeeklySummary ||
                                userData.gamification?.preferences?.emailWeeklySummary;

      const summaryFrequency = userData.preferences?.summaryFrequency || 'weekly';

      if (emailWeeklySummary && summaryFrequency === 'weekly') {
        eligibleUsers.push({
          id: doc.id,
          ...userData
        });
      }
    });

    return eligibleUsers;

  } catch (error) {
    console.error('Error getting weekly summary eligible users:', error);
    return [];
  }
};

/**
 * Generate weekly data for a specific user
 */
const generateUserWeeklyData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const gamification = userData.gamification || {};
    const stats = gamification.statistics || {};

    // Calculate week range
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    // This is a simplified version - you might want to track more detailed weekly stats
    const weeklyData = {
      weekStart: weekStart.toLocaleDateString(),
      weekEnd: now.toLocaleDateString(),
      stepsCompleted: Math.floor(Math.random() * 10), // Replace with actual weekly calculation
      photosAdded: Math.floor(Math.random() * 15), // Replace with actual weekly calculation
      achievementsUnlocked: 0, // Replace with actual weekly calculation
      pointsEarned: Math.floor(Math.random() * 100), // Replace with actual weekly calculation
      projectsWorkedOn: Math.floor(Math.random() * 3), // Replace with actual weekly calculation
      streakDays: gamification.streaks?.daily_activity?.current || 0
    };

    return weeklyData;

  } catch (error) {
    console.error('Error generating user weekly data:', error);
    return {
      weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      weekEnd: new Date().toLocaleDateString(),
      stepsCompleted: 0,
      photosAdded: 0,
      achievementsUnlocked: 0,
      pointsEarned: 0,
      projectsWorkedOn: 0,
      streakDays: 0
    };
  }
};

/**
 * Get community statistics for benchmarking
 */
const getCommunityStats = async () => {
  try {
    // This is a simplified version - implement actual community stats aggregation
    return {
      averageSteps: 8,
      averagePoints: 125,
      activeUsers: 450,
      totalProjects: 1240
    };

  } catch (error) {
    console.error('Error getting community stats:', error);
    return {};
  }
};

/**
 * Get inactive users for re-engagement
 */
const getInactiveUsers = async (targetDates) => {
  try {
    // This is simplified - you'll need to implement proper last activity tracking
    const usersQuery = query(
      collection(db, 'users'),
      where('userCategory', '!=', 'minor'),
      where('privacyConsents.community', '==', true),
      where('communityAccess', '==', true)
    );

    const usersSnapshot = await getDocs(usersQuery);
    const inactiveUsers = [];

    usersSnapshot.forEach(doc => {
      const userData = doc.data();

      // Check if user has re-engagement emails enabled
      // This would typically be a marketing email, so check marketing consent
      if (!userData.privacyConsents?.marketing) {
        return;
      }

      // Simplified - replace with actual last activity logic
      const lastActive = userData.lastActive || userData.updatedAt?.toDate() || new Date(0);

      inactiveUsers.push({
        id: doc.id,
        lastActive: lastActive,
        ...userData
      });
    });

    return inactiveUsers;

  } catch (error) {
    console.error('Error getting inactive users:', error);
    return [];
  }
};

/**
 * Get user data for re-engagement email
 */
const getUserDataForReEngagement = async (userId) => {
  try {
    // Get user's recent projects
    const projectsQuery = query(
      collection(db, 'users', userId, 'projects'),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );

    const projectsSnapshot = await getDocs(projectsQuery);
    const recentProjects = [];

    projectsSnapshot.forEach(doc => {
      const projectData = doc.data();
      recentProjects.push({
        id: doc.id,
        name: projectData.name,
        status: projectData.status,
        steps: projectData.steps || [],
        lastUpdated: projectData.updatedAt ?
          new Date(projectData.updatedAt.seconds * 1000).toLocaleDateString() :
          'Unknown'
      });
    });

    // Get user's streak data
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() : {};
    const streakData = userData.gamification?.streaks?.daily_activity || {};

    return {
      recentProjects,
      streakData: {
        current: streakData.current || 0,
        longest: streakData.longest || 0,
        lastActivity: streakData.lastActivity
      }
    };

  } catch (error) {
    console.error('Error getting user data for re-engagement:', error);
    return {
      recentProjects: [],
      streakData: { current: 0, longest: 0 }
    };
  }
};

export default {
  processDailyEmails,
  processImmediateEmails,
  generateWeeklySummaries,
  processWeeklySummaries,
  checkInactiveUsers,
  processScheduledEmails
};