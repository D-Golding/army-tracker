// hooks/gamification/useEmailManagement.js
import { useAuth } from '../../contexts/AuthContext';
import {
  getQueueStats,
  processEmailQueue,
  cleanupOldQueueEntries
} from '../../services/emailBatchManager';
import {
  checkGamificationEmailPermissions
} from '../../services/email/core/emailPermissions';
import {
  processImmediateEmails,
  processScheduledEmails
} from '../../services/emailScheduler';

// Hook for email management and monitoring
export const useEmailManagement = () => {
  const { currentUser } = useAuth();

  const getQueueStatistics = async () => {
    try {
      return await getQueueStats();
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return { error: error.message };
    }
  };

  const getSystemStatus = async () => {
    try {
      // Basic system status without the wrapper
      const queueStats = await getQueueStats();
      return {
        timestamp: new Date().toISOString(),
        queue: queueStats,
        isActive: true
      };
    } catch (error) {
      console.error('Error getting system status:', error);
      return { error: error.message };
    }
  };

  const processEmails = async (emailType = null) => {
    try {
      if (emailType) {
        return await processEmailQueue(emailType);
      } else {
        return await processImmediateEmails();
      }
    } catch (error) {
      console.error('Error processing emails:', error);
      return { processed: 0, failed: 0, error: error.message };
    }
  };

  // Check email settings for current user
  const checkEmailSettings = async () => {
    try {
      const permissions = await checkGamificationEmailPermissions(currentUser.uid, 'Achievements');
      return permissions;
    } catch (error) {
      console.error('Error checking email permissions:', error);
      return { canSend: false, reason: 'Permission check failed' };
    }
  };

  // Test email functionality (simplified)
  const testEmails = async (testType = 'achievement') => {
    try {
      // Basic test - check if we can get queue stats and permissions
      const [queueStats, permissions] = await Promise.all([
        getQueueStats(),
        checkGamificationEmailPermissions(currentUser.uid, 'Achievements')
      ]);

      return {
        success: true,
        results: {
          queueStats,
          permissions
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error testing emails:', error);
      return { success: false, error: error.message };
    }
  };

  // Process all scheduled emails
  const processAllScheduled = async () => {
    try {
      return await processScheduledEmails();
    } catch (error) {
      console.error('Error processing scheduled emails:', error);
      return { error: error.message };
    }
  };

  // Clean up old queue entries
  const cleanupQueue = async (daysOld = 30) => {
    try {
      const deletedCount = await cleanupOldQueueEntries(daysOld);
      return { success: true, deletedCount };
    } catch (error) {
      console.error('Error cleaning up queue:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    getQueueStats: getQueueStatistics,
    getSystemStatus,
    processEmails,
    checkEmailSettings,
    testEmails,
    processAllScheduled,
    cleanupQueue
  };
};

export default useEmailManagement;