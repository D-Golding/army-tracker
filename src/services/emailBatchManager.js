// services/emailBatchManager.js - Barrel export (maintains backward compatibility)

// Re-export all queue management functions
export {
  queueEmail,
  processEmailQueue,
  batchAchievementEmail,
  queueStreakMilestoneEmail,
  queueWeeklySummaryEmail,
  queueReEngagementEmail,
  getQueueStats,
  cleanupOldQueueEntries,
  RATE_LIMITS
} from './email/emailQueue.js';

// Re-export email types from constants
export { EMAIL_TYPES } from './shared/constants.js';

// Default export for backward compatibility
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

// Import functions for default export
import {
  queueEmail,
  processEmailQueue,
  batchAchievementEmail,
  queueStreakMilestoneEmail,
  queueWeeklySummaryEmail,
  queueReEngagementEmail,
  getQueueStats,
  cleanupOldQueueEntries,
  RATE_LIMITS
} from './email/emailQueue.js';

import { EMAIL_TYPES } from './shared/constants.js';