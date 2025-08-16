// services/vouchers/voucherValidation.js - Voucher validation logic
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { cleanVoucherCode, formatVoucherResponse } from './voucherHelpers.js';

/**
 * Validate and get voucher details
 * @param {string} code - Voucher code
 * @returns {Object} Validation result and voucher data
 */
export const validateVoucher = async (code) => {
  try {
    // Clean and validate code format
    const codeValidation = cleanVoucherCode(code);
    if (!codeValidation.isValid) {
      return formatVoucherResponse(false, { voucher: null }, codeValidation.error);
    }

    const { cleanCode } = codeValidation;

    // Get voucher document
    const voucherRef = doc(db, 'vouchers', cleanCode);
    const voucherSnap = await getDoc(voucherRef);

    if (!voucherSnap.exists()) {
      return formatVoucherResponse(false, { voucher: null }, 'Voucher code not found');
    }

    const voucher = voucherSnap.data();
    const now = new Date();

    // Check if voucher is active
    if (!voucher.isActive) {
      return formatVoucherResponse(false, { voucher }, 'This voucher is no longer active');
    }

    // Check expiry date
    if (voucher.expiresAt && voucher.expiresAt.toDate() < now) {
      return formatVoucherResponse(false, { voucher }, 'This voucher has expired');
    }

    // Check usage limits
    if (voucher.maxUses && voucher.currentUses >= voucher.maxUses) {
      return formatVoucherResponse(false, { voucher }, 'This voucher has been used the maximum number of times');
    }

    // Check start date if exists
    if (voucher.startsAt && voucher.startsAt.toDate() > now) {
      return formatVoucherResponse(false, { voucher }, 'This voucher is not yet active');
    }

    return formatVoucherResponse(true, { voucher: { ...voucher, code: cleanCode } }, null);

  } catch (error) {
    console.error('Error validating voucher:', error);
    return formatVoucherResponse(false, { voucher: null }, 'Error validating voucher code. Please try again.');
  }
};

/**
 * Check if user has already used this voucher
 * @param {Object} voucher - Voucher data
 * @param {string} userId - User ID
 * @returns {Object} Check result
 */
export const checkVoucherUsage = (voucher, userId) => {
  if (voucher.usedBy && voucher.usedBy.includes(userId)) {
    return formatVoucherResponse(false, null, 'You have already used this voucher');
  }

  return formatVoucherResponse(true, null, null);
};

/**
 * Check if user's current tier conflicts with voucher
 * @param {Object} voucher - Voucher data
 * @param {Object} userProfile - User's current profile
 * @returns {Object} Check result
 */
export const checkTierConflict = (voucher, userProfile) => {
  const currentTier = userProfile?.subscription?.tier || 'free';
  const tierPriority = { free: 0, casual: 1, pro: 2, battle: 3 };

  if (voucher.tier && tierPriority[currentTier] >= tierPriority[voucher.tier]) {
    return formatVoucherResponse(false, null, `You already have ${currentTier} tier or higher`);
  }

  return formatVoucherResponse(true, null, null);
};

/**
 * Comprehensive voucher eligibility check
 * @param {string} code - Voucher code
 * @param {string} userId - User ID
 * @param {Object} userProfile - User profile
 * @returns {Object} Complete validation result
 */
export const validateVoucherEligibility = async (code, userId, userProfile) => {
  try {
    // First validate the voucher itself
    const voucherValidation = await validateVoucher(code);
    if (!voucherValidation.success) {
      return voucherValidation;
    }

    const { voucher } = voucherValidation;

    // Check if user has already used this voucher
    const usageCheck = checkVoucherUsage(voucher, userId);
    if (!usageCheck.success) {
      return formatVoucherResponse(false, { voucher }, usageCheck.error);
    }

    // Check tier conflicts
    const tierCheck = checkTierConflict(voucher, userProfile);
    if (!tierCheck.success) {
      return formatVoucherResponse(false, { voucher }, tierCheck.error);
    }

    return formatVoucherResponse(true, { voucher }, null);

  } catch (error) {
    console.error('Error validating voucher eligibility:', error);
    return formatVoucherResponse(false, { voucher: null }, 'Error checking voucher eligibility. Please try again.');
  }
};