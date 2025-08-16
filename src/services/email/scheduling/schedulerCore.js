// services/email/scheduling/schedulerCore.js - Main scheduler coordinator
import { processDailyEmails, processImmediateEmails } from './dailyEmails.js';
import { generateWeeklySummaries, processWeeklySummaries } from './weeklyEmails.js';
import { checkInactiveUsers } from './reengagementEmails.js';

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

/**
 * Get scheduler status and next run times
 * @returns {Object} Scheduler status information
 */
export const getSchedulerStatus = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const dayOfWeek = now.getDay();

  // Calculate next run times
  const nextRuns = {
    immediate: 'Every 5 minutes',
    daily: getNextRunTime(20, 0), // 8 PM daily
    weeklyGeneration: getNextSundayTime(9, 0), // 9 AM Sunday
    weeklySend: getNextSundayTime(10, 0), // 10 AM Sunday
    inactiveCheck: getNextWeekdayTime(9, 0) // 9 AM weekdays
  };

  return {
    currentTime: now.toISOString(),
    dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
    currentHour: currentHour,
    currentMinute: currentMinute,
    nextRuns,
    isActive: true
  };
};

/**
 * Calculate next run time for daily tasks
 * @param {number} targetHour - Target hour (24-hour format)
 * @param {number} targetMinute - Target minute
 * @returns {string} Next run time
 */
const getNextRunTime = (targetHour, targetMinute) => {
  const now = new Date();
  const target = new Date(now);
  target.setHours(targetHour, targetMinute, 0, 0);

  // If target time has passed today, schedule for tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target.toLocaleString();
};

/**
 * Calculate next Sunday run time
 * @param {number} targetHour - Target hour
 * @param {number} targetMinute - Target minute
 * @returns {string} Next Sunday run time
 */
const getNextSundayTime = (targetHour, targetMinute) => {
  const now = new Date();
  const target = new Date(now);

  // Calculate days until next Sunday
  const daysUntilSunday = (7 - now.getDay()) % 7;
  const targetDate = daysUntilSunday === 0 ? now.getDate() + 7 : now.getDate() + daysUntilSunday;

  target.setDate(targetDate);
  target.setHours(targetHour, targetMinute, 0, 0);

  // If it's Sunday and the time hasn't passed yet
  if (now.getDay() === 0 && now.getHours() < targetHour) {
    target.setDate(now.getDate());
  }

  return target.toLocaleString();
};

/**
 * Calculate next weekday run time (Monday-Friday)
 * @param {number} targetHour - Target hour
 * @param {number} targetMinute - Target minute
 * @returns {string} Next weekday run time
 */
const getNextWeekdayTime = (targetHour, targetMinute) => {
  const now = new Date();
  const target = new Date(now);
  target.setHours(targetHour, targetMinute, 0, 0);

  // If it's a weekday and time hasn't passed
  if (now.getDay() >= 1 && now.getDay() <= 5 && target > now) {
    return target.toLocaleString();
  }

  // Find next weekday
  let daysToAdd = 1;
  let nextDay = new Date(now);
  nextDay.setDate(now.getDate() + daysToAdd);

  while (nextDay.getDay() === 0 || nextDay.getDay() === 6) { // Skip weekends
    daysToAdd++;
    nextDay.setDate(now.getDate() + daysToAdd);
  }

  target.setDate(now.getDate() + daysToAdd);
  return target.toLocaleString();
};

/**
 * Manual trigger for specific email types (for testing/admin)
 * @param {string} emailType - Type of email to process
 * @returns {Promise<Object>} Processing result
 */
export const manualTrigger = async (emailType) => {
  try {
    switch (emailType) {
      case 'immediate':
        return await processImmediateEmails();

      case 'daily':
        return await processDailyEmails();

      case 'weekly_generation':
        return await generateWeeklySummaries();

      case 'weekly_send':
        return await processWeeklySummaries();

      case 'inactive_check':
        return await checkInactiveUsers();

      default:
        throw new Error(`Unknown email type: ${emailType}`);
    }
  } catch (error) {
    console.error(`Error in manual trigger for ${emailType}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get processing statistics
 * @returns {Promise<Object>} Processing statistics
 */
export const getProcessingStats = async () => {
  try {
    // This would aggregate stats from your email queue/logs
    return {
      last24Hours: {
        immediate: 0,
        daily: 0,
        weekly: 0,
        inactive: 0
      },
      lastWeek: {
        totalEmails: 0,
        successRate: 0,
        avgProcessingTime: 0
      },
      uptime: process.uptime ? process.uptime() : 'unknown'
    };
  } catch (error) {
    console.error('Error getting processing stats:', error);
    return { error: error.message };
  }
};