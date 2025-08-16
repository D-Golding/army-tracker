// services/email/scheduling/reengagementEmails.js - Re-engagement email processing for inactive users
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { queueReEngagementEmail } from '../emailQueue.js';

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
 * Get inactive users for re-engagement
 */
export const getInactiveUsers = async (targetDates) => {
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
export const getUserDataForReEngagement = async (userId) => {
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

/**
 * Calculate days since last activity
 * @param {Date|string} lastActivity - Last activity date
 * @returns {number} Days inactive
 */
export const calculateDaysInactive = (lastActivity) => {
  if (!lastActivity) return Infinity;

  const now = new Date();
  const lastDate = new Date(lastActivity);
  return Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
};

/**
 * Check if user should receive re-engagement email
 * @param {Object} user - User data
 * @param {number} daysInactive - Days since last activity
 * @returns {boolean} Whether to send re-engagement email
 */
export const shouldSendReEngagementEmail = (user, daysInactive) => {
  // Must have marketing consent for re-engagement emails
  if (!user.privacyConsents?.marketing) {
    return false;
  }

  // Must be community-enabled adult
  if (user.userCategory === 'minor' || !user.communityAccess) {
    return false;
  }

  // Only send on specific milestone days to avoid spam
  const milestones = [14, 30];
  return milestones.includes(daysInactive);
};

/**
 * Get re-engagement email statistics
 * @returns {Promise<Object>} Statistics about re-engagement emails
 */
export const getReEngagementStats = async () => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // This would need to be implemented based on your email tracking
    return {
      totalInactiveUsers: 0, // Count of users inactive 14+ days
      emailsSentLast30Days: 0, // Re-engagement emails sent
      reactivationRate: 0, // Percentage who became active after email
      averageDaysToReactivation: 0
    };
  } catch (error) {
    console.error('Error getting re-engagement stats:', error);
    return {
      totalInactiveUsers: 0,
      emailsSentLast30Days: 0,
      reactivationRate: 0,
      averageDaysToReactivation: 0,
      error: error.message
    };
  }
};