// src/services/emailService.js - Firebase Extension Email Service
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * Send account deletion confirmation email
 * @param {string} email - User's email address
 * @param {string} userName - User's display name
 * @param {string} deletionType - Type of deletion (permanent/30-day grace period/scheduled for date)
 * @param {boolean} hasRecoveryOption - Whether account can be recovered
 * @param {string} recoveryUrl - Recovery URL if applicable
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendAccountDeletionConfirmationEmail = async (email, userName, deletionType, hasRecoveryOption, recoveryUrl) => {
  try {
    const emailData = {
      to: [email],
      message: {
        subject: 'Account Deletion Confirmation - Tabletop Tactica',
        html: generateDeletionConfirmationHTML(userName, deletionType, hasRecoveryOption, recoveryUrl)
      }
    };

    const docRef = await addDoc(collection(db, 'mail'), emailData);

    return {
      success: true,
      messageId: docRef.id,
      message: 'Email queued for sending'
    };

  } catch (error) {
    console.error('Error sending deletion confirmation email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send deletion confirmation email'
    };
  }
};

/**
 * Send account recovery confirmation email
 * @param {string} email - User's email address
 * @param {string} userName - User's display name
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendAccountRecoveryConfirmationEmail = async (email, userName) => {
  try {
    const emailData = {
      to: [email],
      message: {
        subject: 'Account Recovered Successfully - Tabletop Tactica',
        html: generateRecoveryConfirmationHTML(userName)
      }
    };

    const docRef = await addDoc(collection(db, 'mail'), emailData);

    return {
      success: true,
      messageId: docRef.id,
      message: 'Email queued for sending'
    };

  } catch (error) {
    console.error('Error sending recovery confirmation email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send recovery confirmation email'
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
    const emailData = {
      to: [email],
      message: {
        subject: 'Welcome to Tabletop Tactica!',
        html: generateWelcomeHTML(userName)
      }
    };

    const docRef = await addDoc(collection(db, 'mail'), emailData);

    return {
      success: true,
      messageId: docRef.id,
      message: 'Email queued for sending'
    };

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send welcome email'
    };
  }
};

// HTML email templates
const generateDeletionConfirmationHTML = (userName, deletionType, hasRecoveryOption, recoveryUrl) => {
  const baseHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Account Deletion Confirmation</h2>
      <p>Hello ${userName},</p>
      <p>This email confirms that your Tabletop Tactica account has been ${deletionType}.</p>
  `;

  if (hasRecoveryOption && recoveryUrl) {
    return baseHTML + `
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #d97706; margin-top: 0;">Recovery Available</h3>
        <p>Your account can be recovered within the next 30 days by clicking the link below:</p>
        <a href="${recoveryUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
          Recover My Account
        </a>
        <p style="font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this URL: ${recoveryUrl}</p>
      </div>
      <p>If you don't want to recover your account, no action is needed. Your data will be permanently deleted after 30 days.</p>
      <p>Best regards,<br>The Tabletop Tactica Team</p>
    </div>
  `;
  } else {
    return baseHTML + `
      <p><strong>This deletion is permanent and cannot be undone.</strong></p>
      <p>Thank you for using Tabletop Tactica. We're sorry to see you go!</p>
      <p>Best regards,<br>The Tabletop Tactica Team</p>
    </div>
  `;
  }
};

const generateRecoveryConfirmationHTML = (userName) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #059669;">Account Recovered Successfully!</h2>
      <p>Hello ${userName},</p>
      <p>Great news! Your Tabletop Tactica account has been successfully recovered and reactivated.</p>
      
      <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #059669; margin-top: 0;">What's been restored:</h3>
        <ul style="color: #065f46;">
          <li>All your projects and paint collections</li>
          <li>Your account preferences and settings</li>
          <li>All uploaded photos and progress data</li>
          <li>Your achievement points and badges</li>
        </ul>
      </div>
      
      <p>You can now sign in to your account using your usual credentials.</p>
      
      <a href="${window.location.origin}/auth" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
        Sign In to Your Account
      </a>
      
      <p>Welcome back!</p>
      <p>Best regards,<br>The Tabletop Tactica Team</p>
    </div>
  `;
};

const generateWelcomeHTML = (userName) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #3b82f6;">Welcome to Tabletop Tactica!</h2>
      <p>Hello ${userName},</p>
      <p>Welcome to Tabletop Tactica! We're excited to have you join our community of miniature painting enthusiasts.</p>
      
      <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1d4ed8; margin-top: 0;">Get started:</h3>
        <ul style="color: #1e40af;">
          <li>Create your first painting project</li>
          <li>Add paints to your collection</li>
          <li>Track your progress with photos</li>
          <li>Earn achievements as you paint</li>
        </ul>
      </div>
      
      <p>Happy painting!</p>
      <p>Best regards,<br>The Tabletop Tactica Team</p>
    </div>
  `;
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
    await sendWelcomeEmail('test@example.com', 'Test User');
    return true;
  } catch (error) {
    console.error('Email service test failed:', error);
    return false;
  }
};

export default {
  sendAccountDeletionConfirmationEmail,
  sendAccountRecoveryConfirmationEmail,
  sendWelcomeEmail,
  generateVerificationCode,
  testEmailService
};