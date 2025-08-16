// services/email/scheduling/dailyEmails.js - Daily and immediate email processing
import { processEmailQueue } from '../emailQueue.js';
import { EMAIL_TYPES } from '../../shared/constants.js';

/**
 * Process daily email queue (call this at 8 PM daily)
 * Sends achievement digests and any other queued emails
 */
export const processDailyEmails = async () => {
  console.log('🕗 Processing daily emails...');

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