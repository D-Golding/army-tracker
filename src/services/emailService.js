// services/emailService.js - Barrel export (maintains backward compatibility)

// Re-export account email functions
export {
  sendWelcomeEmail,
  sendAccountDeletionConfirmationEmail,
  sendAccountRecoveryConfirmationEmail,
  generateVerificationCode,
  testEmailService
} from './email/core/accountEmails.js';

// Re-export gamification email functions
export {
  sendAchievementDigestEmail,
  sendStreakMilestoneEmail,
  sendWeeklyProgressEmail,
  sendReEngagementEmail,
  testGamificationEmailService
} from './email/core/gamificationEmails.js';

// Re-export permission checking
export {
  checkGamificationEmailPermissions,
  checkAccountEmailPermissions
} from './email/core/emailPermissions.js';

// Re-export detailed templates (if needed)
export {
  generateDetailedAchievementDigestHTML,
  generateDetailedStreakMilestoneHTML,
  generateDetailedWeeklyProgressHTML,
  generateDetailedReEngagementHTML
} from './email/core/emailTemplates.js';

// Default export for backward compatibility
export default {
  // Account emails
  sendWelcomeEmail,
  sendAccountDeletionConfirmationEmail,
  sendAccountRecoveryConfirmationEmail,
  generateVerificationCode,
  testEmailService,

  // Gamification emails
  sendAchievementDigestEmail,
  sendStreakMilestoneEmail,
  sendWeeklyProgressEmail,
  sendReEngagementEmail,
  testGamificationEmailService,

  // Permissions
  checkGamificationEmailPermissions,
  checkAccountEmailPermissions
};

// Import functions for default export
import {
  sendWelcomeEmail,
  sendAccountDeletionConfirmationEmail,
  sendAccountRecoveryConfirmationEmail,
  generateVerificationCode,
  testEmailService
} from './email/core/accountEmails.js';

import {
  sendAchievementDigestEmail,
  sendStreakMilestoneEmail,
  sendWeeklyProgressEmail,
  sendReEngagementEmail,
  testGamificationEmailService
} from './email/core/gamificationEmails.js';

import {
  checkGamificationEmailPermissions,
  checkAccountEmailPermissions
} from './email/core/emailPermissions.js';