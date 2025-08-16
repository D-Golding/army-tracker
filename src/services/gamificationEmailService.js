// services/gamificationEmailService.js - Barrel export (maintains backward compatibility)

// Re-export all gamification email functions
export {
  sendAchievementDigestEmail,
  sendStreakMilestoneEmail,
  sendWeeklyProgressEmail,
  sendReEngagementEmail,
  testGamificationEmailService
} from './email/core/gamificationEmails.js';

// Re-export permission checking
export {
  checkGamificationEmailPermissions
} from './email/core/emailPermissions.js';

// Re-export detailed templates
export {
  generateDetailedAchievementDigestHTML,
  generateDetailedStreakMilestoneHTML,
  generateDetailedWeeklyProgressHTML,
  generateDetailedReEngagementHTML
} from './email/core/emailTemplates.js';

// Default export for backward compatibility
export default {
  checkGamificationEmailPermissions,
  sendAchievementDigestEmail,
  sendStreakMilestoneEmail,
  sendWeeklyProgressEmail,
  sendReEngagementEmail,
  testGamificationEmailService
};

// Import functions for default export
import {
  sendAchievementDigestEmail,
  sendStreakMilestoneEmail,
  sendWeeklyProgressEmail,
  sendReEngagementEmail,
  testGamificationEmailService
} from './email/core/gamificationEmails.js';

import { checkGamificationEmailPermissions } from './email/core/emailPermissions.js';