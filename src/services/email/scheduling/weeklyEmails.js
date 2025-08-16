// services/email/scheduling/weeklyEmails.js - Weekly summary email generation and processing
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { processEmailQueue, queueWeeklySummaryEmail } from '../emailQueue.js';
import { EMAIL_TYPES } from '../../shared/constants.js';

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
export const generateUserWeeklyData = async (userId) => {
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
export const getCommunityStats = async () => {
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