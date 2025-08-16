// services/vouchers/voucherRedemption.js - Voucher redemption business logic
import {
  doc,
  updateDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../../firebase';
import { validateVoucherEligibility } from './voucherValidation.js';
import { getRedemptionMessage, formatVoucherResponse, cleanVoucherCode } from './voucherHelpers.js';

/**
 * Calculate subscription update data from voucher
 * @param {Object} voucher - Voucher data
 * @param {Object} userProfile - Current user profile
 * @returns {Object} Subscription update object
 */
export const calculateSubscriptionUpdate = (voucher, userProfile) => {
  const currentTier = userProfile?.subscription?.tier || 'free';

  // Calculate expiry date based on voucher duration
  let expiresAt = null;
  if (voucher.duration && voucher.duration > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + voucher.duration);
  }

  return {
    tier: voucher.tier || currentTier,
    type: voucher.type || 'voucher',
    expiresAt: expiresAt ? expiresAt : null,
    voucherCode: voucher.code,
    redeemedAt: new Date(),
    autoRenew: false, // Voucher subscriptions don't auto-renew
    discountPercentage: voucher.discountPercentage || 0,
    discountAmount: voucher.discountAmount || 0
  };
};

/**
 * Update voucher usage statistics
 * @param {string} cleanCode - Clean voucher code
 * @param {string} userId - User ID
 * @param {Object} userProfile - User profile data
 * @param {Object} voucher - Voucher data
 * @returns {Promise<void>}
 */
export const updateVoucherUsage = async (cleanCode, userId, userProfile, voucher) => {
  const voucherRef = doc(db, 'vouchers', cleanCode);

  const updateData = {
    currentUses: increment(1),
    lastUsedAt: serverTimestamp(),
    usedBy: voucher.usedBy ? [...voucher.usedBy, userId] : [userId]
  };

  // Add redemption record
  const redemptionRecord = {
    userId,
    redeemedAt: serverTimestamp(),
    userEmail: userProfile?.email || null,
    userDisplayName: userProfile?.displayName || null
  };

  updateData.redemptions = [...(voucher.redemptions || []), redemptionRecord];

  await updateDoc(voucherRef, updateData);
};

/**
 * Apply voucher benefits to user account
 * @param {string} userId - User ID
 * @param {Object} subscriptionUpdate - Subscription data to apply
 * @returns {Promise<void>}
 */
export const applyVoucherToUser = async (userId, subscriptionUpdate) => {
  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    'subscription.tier': subscriptionUpdate.tier,
    'subscription.type': subscriptionUpdate.type,
    'subscription.expiresAt': subscriptionUpdate.expiresAt,
    'subscription.voucherCode': subscriptionUpdate.voucherCode,
    'subscription.redeemedAt': subscriptionUpdate.redeemedAt,
    'subscription.autoRenew': subscriptionUpdate.autoRenew,
    'subscription.discountPercentage': subscriptionUpdate.discountPercentage,
    'subscription.discountAmount': subscriptionUpdate.discountAmount,
    updatedAt: serverTimestamp()
  });
};

/**
 * Redeem a voucher for a user
 * @param {string} code - Voucher code
 * @param {string} userId - User ID
 * @param {Object} userProfile - Current user profile
 * @returns {Object} Redemption result
 */
export const redeemVoucher = async (code, userId, userProfile) => {
  try {
    // Validate voucher eligibility
    const validation = await validateVoucherEligibility(code, userId, userProfile);
    if (!validation.success) {
      return validation;
    }

    const { voucher } = validation;
    const codeValidation = cleanVoucherCode(code);
    const cleanCode = codeValidation.cleanCode;

    // Calculate subscription update
    const subscriptionUpdate = calculateSubscriptionUpdate(voucher, userProfile);

    // Update voucher usage
    await updateVoucherUsage(cleanCode, userId, userProfile, voucher);

    // Apply voucher to user account
    await applyVoucherToUser(userId, subscriptionUpdate);

    return formatVoucherResponse(
      true,
      {
        voucher,
        subscriptionUpdate,
        message: getRedemptionMessage(voucher)
      },
      null
    );

  } catch (error) {
    console.error('Error redeeming voucher:', error);
    return formatVoucherResponse(false, { voucher: null }, 'Error redeeming voucher. Please try again.');
  }
};

/**
 * Preview voucher redemption without applying it
 * @param {string} code - Voucher code
 * @param {string} userId - User ID
 * @param {Object} userProfile - Current user profile
 * @returns {Object} Preview result
 */
export const previewVoucherRedemption = async (code, userId, userProfile) => {
  try {
    // Validate voucher eligibility
    const validation = await validateVoucherEligibility(code, userId, userProfile);
    if (!validation.success) {
      return validation;
    }

    const { voucher } = validation;

    // Calculate what the subscription update would be
    const subscriptionUpdate = calculateSubscriptionUpdate(voucher, userProfile);

    return formatVoucherResponse(
      true,
      {
        voucher,
        previewSubscription: subscriptionUpdate,
        message: getRedemptionMessage(voucher),
        preview: true
      },
      null
    );

  } catch (error) {
    console.error('Error previewing voucher redemption:', error);
    return formatVoucherResponse(false, { voucher: null }, 'Error previewing voucher. Please try again.');
  }
};