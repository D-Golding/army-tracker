// services/emailManager.js - Centralized Email Management System
import {
  sendAccountDeletionConfirmationEmail,
  sendAccountRecoveryConfirmationEmail,
  sendWelcomeEmail
} from './emailService.js';

import {
  sendAchievementDigestEmail,
  sendStreakMilestoneEmail,
  sendWeeklyProgressEmail,
  sendReEngagementEmail,
  checkGamificationEmailPermissions
} from './gamificationEmailService.js';

import {
  batchAchievementEmail,
  queueStreakMilestoneEmail,
  queueWeeklySummaryEmail,
  queueReEngagementEmail,
  processEmailQueue,
  getQueueStats,
  EMAIL_TYPES
} from './emailBatchManager.js';

import {
  processDailyEmails,
  processImmediateEmails,
  generateWeeklySummaries,
  processWeeklySummaries,
  checkInactiveUsers,
  processScheduledEmails
} from './emailScheduler.js';

/**
 * Centralized Email Manager
 * Single point of access for all email functionality
 */
class EmailManager {
  constructor() {
    this.isInitialized = false;
    this.config = {
      maxRetries: 3,
      retryDelay: 5000, // 5 seconds
      batchSize: 50,
      rateLimit: {
        maxPerDay: 2,
        maxPerHour: 1
      }
    };
  }

  /**
   * Initialize the email manager
   */
  async initialize() {
    try {
      console.log('📧 Initializing Email Manager...');

      // Check email service connectivity
      const queueStats = await getQueueStats();
      console.log('✅ Email queue accessible:', queueStats);

      this.isInitialized = true;
      console.log('✅ Email Manager initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Email Manager:', error);
      throw error;
    }
  }

  // =================
  // ACCOUNT EMAILS
  // =================

  /**
   * Send welcome email to new user
   */
  async sendWelcome(email, userName) {
    return await sendWelcomeEmail(email, userName);
  }

  /**
   * Send account deletion confirmation
   */
  async sendAccountDeletion(email, userName, deletionType, hasRecoveryOption, recoveryUrl) {
    return await sendAccountDeletionConfirmationEmail(
      email,
      userName,
      deletionType,
      hasRecoveryOption,
      recoveryUrl
    );
  }

  /**
   * Send account recovery confirmation
   */
  async sendAccountRecovery(email, userName) {
    return await sendAccountRecoveryConfirmationEmail(email, userName);
  }

  // =================
  // GAMIFICATION EMAILS
  // =================

  /**
   * Queue achievement digest email (batched)
   */
  async queueAchievementDigest(userId, achievements, stats = {}) {
    if (!this.isInitialized) await this.initialize();

    return await batchAchievementEmail(userId, achievements, stats);
  }

  /**
   * Queue immediate streak milestone email
   */
  async queueStreakMilestone(userId, milestone, streakData = {}) {
    if (!this.isInitialized) await this.initialize();

    return await queueStreakMilestoneEmail(userId, milestone, streakData);
  }

  /**
   * Queue weekly progress summary
   */
  async queueWeeklySummary(userId, weeklyData, communityStats = {}) {
    if (!this.isInitialized) await this.initialize();

    return await queueWeeklySummaryEmail(userId, weeklyData, communityStats);
  }

  /**
   * Queue re-engagement email
   */
  async queueReEngagement(userId, daysInactive, userData = {}) {
    if (!this.isInitialized) await this.initialize();

    return await queueReEngagementEmail(userId, daysInactive, userData);
  }

  /**
   * Send achievement email immediately (for testing)
   */
  async sendAchievementImmediate(email, userName, achievements, stats = {}) {
    if (!this.isInitialized) await this.initialize();

    return await sendAchievementDigestEmail(email, userName, achievements, stats);
  }

  /**
   * Send streak milestone email immediately (for testing)
   */
  async sendStreakImmediate(email, userName, milestone, streakData = {}) {
    if (!this.isInitialized) await this.initialize();

    return await sendStreakMilestoneEmail(email, userName, milestone, streakData);
  }

  // =================
  // SCHEDULING & PROCESSING
  // =================

  /**
   * Process all scheduled emails (main scheduler function)
   */
  async processScheduled() {
    if (!this.isInitialized) await this.initialize();

    return await processScheduledEmails();
  }

  /**
   * Process daily email batches
   */
  async processDailyBatch() {
    if (!this.isInitialized) await this.initialize();

    return await processDailyEmails();
  }

  /**
   * Process immediate emails
   */
  async processImmediate() {
    if (!this.isInitialized) await this.initialize();

    return await processImmediateEmails();
  }

  /**
   * Generate weekly summaries
   */
  async generateWeeklyReports() {
    if (!this.isInitialized) await this.initialize();

    return await generateWeeklySummaries();
  }

  /**
   * Process weekly summary emails
   */
  async processWeeklyReports() {
    if (!this.isInitialized) await this.initialize();

    return await processWeeklySummaries();
  }

  /**
   * Check for inactive users and queue re-engagement
   */
  async processInactiveUsers() {
    if (!this.isInitialized) await this.initialize();

    return await checkInactiveUsers();
  }

  // =================
  // MONITORING & ADMIN
  // =================

  /**
   * Get email queue statistics
   */
  async getQueueStatistics() {
    if (!this.isInitialized) await this.initialize();

    return await getQueueStats();
  }

  /**
   * Process specific email type queue
   */
  async processEmailType(emailType) {
    if (!this.isInitialized) await this.initialize();

    return await processEmailQueue(emailType);
  }

  /**
   * Check if user can receive specific email type
   */
  async checkEmailPermissions(userId, emailType) {
    if (!this.isInitialized) await this.initialize();

    return await checkGamificationEmailPermissions(userId, emailType);
  }

  /**
   * Get email configuration
   */
  getConfig() {
    return {
      ...this.config,
      isInitialized: this.isInitialized,
      emailTypes: EMAIL_TYPES
    };
  }

  // =================
  // TESTING & DEBUGGING
  // =================

  /**
   * Test email functionality
   */
  async testEmails(userId, testType = 'all') {
    if (!this.isInitialized) await this.initialize();

    const results = {};

    try {
      if (testType === 'all' || testType === 'achievement') {
        results.achievement = await this.queueAchievementDigest(userId, [
          {
            id: 'test',
            name: 'Test Achievement',
            description: 'Test achievement for email testing',
            icon: '🧪',
            points: 50
          }
        ], { totalPoints: 150 });
      }

      if (testType === 'all' || testType === 'streak') {
        results.streak = await this.queueStreakMilestone(userId, {
          days: 7,
          name: '7 Day Streak',
          description: 'Test streak milestone',
          icon: '🔥'
        }, { current: 7, longest: 12 });
      }

      if (testType === 'all' || testType === 'permissions') {
        results.permissions = {
          achievements: await this.checkEmailPermissions(userId, 'Achievements'),
          streaks: await this.checkEmailPermissions(userId, 'Streaks'),
          weeklySummary: await this.checkEmailPermissions(userId, 'WeeklySummary')
        };
      }

      return {
        success: true,
        results,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Email testing failed:', error);
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  /**
   * Get detailed system status
   */
  async getSystemStatus() {
    try {
      const queueStats = await this.getQueueStatistics();

      return {
        isInitialized: this.isInitialized,
        timestamp: new Date().toISOString(),
        queue: queueStats,
        config: this.config,
        uptime: process.uptime ? process.uptime() : 'unknown'
      };

    } catch (error) {
      return {
        isInitialized: this.isInitialized,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // =================
  // INTEGRATION HELPERS
  // =================

  /**
   * Helper for React components to trigger achievement emails
   */
  async triggerAchievementEmail(userId, newAchievements, userStats) {
    if (!newAchievements || newAchievements.length === 0) {
      return { success: false, message: 'No achievements to send' };
    }

    return await this.queueAchievementDigest(userId, newAchievements, userStats);
  }

  /**
   * Helper for React components to trigger streak emails
   */
  async triggerStreakEmail(userId, milestone, streakData) {
    if (!milestone) {
      return { success: false, message: 'No milestone to send' };
    }

    return await this.queueStreakMilestone(userId, milestone, streakData);
  }

  /**
   * Batch process multiple email actions
   */
  async batchProcess(actions) {
    const results = [];

    for (const action of actions) {
      try {
        let result;

        switch (action.type) {
          case 'achievement':
            result = await this.queueAchievementDigest(
              action.userId,
              action.achievements,
              action.stats
            );
            break;

          case 'streak':
            result = await this.queueStreakMilestone(
              action.userId,
              action.milestone,
              action.streakData
            );
            break;

          case 'weekly':
            result = await this.queueWeeklySummary(
              action.userId,
              action.weeklyData,
              action.communityStats
            );
            break;

          case 'reengagement':
            result = await this.queueReEngagement(
              action.userId,
              action.daysInactive,
              action.userData
            );
            break;

          default:
            result = { success: false, error: `Unknown action type: ${action.type}` };
        }

        results.push({
          action: action.type,
          userId: action.userId,
          ...result
        });

      } catch (error) {
        results.push({
          action: action.type,
          userId: action.userId,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

// Create singleton instance
const emailManager = new EmailManager();

// Export singleton instance and class
export default emailManager;
export { EmailManager, EMAIL_TYPES };

// Export individual functions for direct use if needed
export {
  // Account emails
  sendWelcomeEmail,
  sendAccountDeletionConfirmationEmail,
  sendAccountRecoveryConfirmationEmail,

  // Gamification emails
  sendAchievementDigestEmail,
  sendStreakMilestoneEmail,
  sendWeeklyProgressEmail,
  sendReEngagementEmail,

  // Queue management
  batchAchievementEmail,
  queueStreakMilestoneEmail,
  queueWeeklySummaryEmail,
  queueReEngagementEmail,

  // Processing
  processEmailQueue,
  processScheduledEmails,

  // Utilities
  checkGamificationEmailPermissions,
  getQueueStats
};