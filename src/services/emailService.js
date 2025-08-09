// src/services/emailService.js - Email Service Integration
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import app from '../firebase.js';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Get function references
const sendAccountDeletionEmailFn = httpsCallable(functions, 'sendAccountDeletionEmail');
const sendWelcomeEmailFn = httpsCallable(functions, 'sendWelcomeEmail');
const sendWeeklySummaryEmailFn = httpsCallable(functions, 'sendWeeklySummaryEmail');

/**
 * Send account deletion verification email
 * @param {string} email - User's email address
 * @param {string} userName - User's display name
 * @param {string} verificationCode - 6-digit verification code
 * @param {string} deletionType - Type of deletion (immediate/scheduled)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendDeletionVerificationEmail = async (email, userName, verificationCode, deletionType) => {
  try {
    const result = await sendAccountDeletionEmailFn({
      email,
      userName,
      verificationCode,
      deletionType
    });

    return {
      success: true,
      messageId: result.data.messageId,
      message: result.data.message
    };

  } catch (error) {
    console.error('Error sending deletion verification email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send verification email'
    };
  }
};

/**
 * Send welcome email to new users
 * @param {string} email - User's email address
 * @param {string} userName - User's display name
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendWelcomeEmail = async (email, userName) => {
  try {
    const result = await sendWelcomeEmailFn({
      email,
      userName
    });

    return {
      success: true,
      messageId: result.data.messageId,
      message: result.data.message
    };

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send welcome email'
    };
  }
};

/**
 * Send weekly summary email
 * @param {string} email - User's email address
 * @param {string} userName - User's display name
 * @param {Object} weeklyStats - User's weekly statistics
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendWeeklySummaryEmail = async (email, userName, weeklyStats) => {
  try {
    const result = await sendWeeklySummaryEmailFn({
      email,
      userName,
      weeklyStats
    });

    return {
      success: true,
      messageId: result.data.messageId,
      message: result.data.message
    };

  } catch (error) {
    console.error('Error sending weekly summary email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send weekly summary email'
    };
  }
};

/**
 * Generate a secure verification code
 * @returns {string} 6-digit uppercase code
 */
export const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Test email connectivity (for debugging)
 * @returns {Promise<boolean>} Whether email service is accessible
 */
export const testEmailService = async () => {
  try {
    // Try calling a simple function to test connectivity
    await sendWelcomeEmailFn({
      email: 'test@example.com',
      userName: 'Test User'
    });
    return true;
  } catch (error) {
    console.error('Email service test failed:', error);
    return false;
  }
};

export default {
  sendDeletionVerificationEmail,
  sendWelcomeEmail,
  sendWeeklySummaryEmail,
  generateVerificationCode,
  testEmailService
};