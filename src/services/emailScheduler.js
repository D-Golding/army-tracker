// services/emailScheduler.js - Barrel export (maintains backward compatibility)

// Re-export daily email functions
export {
  processDailyEmails,
  processImmediateEmails
} from './email/scheduling/dailyEmails.js';

// Re-export weekly email functions
export {
  generateWeeklySummaries,
  processWeeklySummaries,
  generateUserWeeklyData,
  getCommunityStats
} from './email/scheduling/weeklyEmails.js';

// Re-export re-engagement functions
export {
  checkInactiveUsers,
  getInactiveUsers,
  getUserDataForReEngagement,
  calculateDaysInactive,
  shouldSendReEngagementEmail,
  getReEngagementStats
} from './email/scheduling/reengagementEmails.js';

// Re-export core scheduler functions
export {
  processScheduledEmails,
  getSchedulerStatus,
  manualTrigger,
  getProcessingStats
} from './email/scheduling/schedulerCore.js';

// Default export for backward compatibility
export default {
  // Most commonly used functions
  processScheduledEmails,
  processDailyEmails,
  processImmediateEmails,
  generateWeeklySummaries,
  processWeeklySummaries,
  checkInactiveUsers,

  // Admin/utility functions
  getSchedulerStatus,
  manualTrigger,
  getProcessingStats,
  getUserDataForReEngagement,
  getReEngagementStats
};

// Import the functions for the default export
import { processDailyEmails, processImmediateEmails } from './email/scheduling/dailyEmails.js';
import { generateWeeklySummaries, processWeeklySummaries, generateUserWeeklyData, getCommunityStats } from './email/scheduling/weeklyEmails.js';
import { checkInactiveUsers, getUserDataForReEngagement, getReEngagementStats } from './email/scheduling/reengagementEmails.js';
import { processScheduledEmails, getSchedulerStatus, manualTrigger, getProcessingStats } from './email/scheduling/schedulerCore.js';