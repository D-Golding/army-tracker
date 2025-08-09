// services/voucherService.js - Complete Voucher Management System
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';

// Voucher types
export const VOUCHER_TYPES = {
  TRIAL: 'trial',           // Free trial period
  BETA: 'beta',             // Beta tester access
  DISCOUNT: 'discount',     // Percentage or fixed discount
  FREE: 'free',             // Completely free access
  UPGRADE: 'upgrade'        // Upgrade existing account
};

// Voucher status
export const VOUCHER_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  EXHAUSTED: 'exhausted',   // All uses consumed
  DISABLED: 'disabled'
};

/**
 * Validate and get voucher details
 * @param {string} code - Voucher code
 * @returns {Object} Validation result and voucher data
 */
export const validateVoucher = async (code) => {
  try {
    if (!code || typeof code !== 'string') {
      return {
        isValid: false,
        error: 'Please enter a voucher code',
        voucher: null
      };
    }

    // Clean and uppercase the code
    const cleanCode = code.trim().toUpperCase();

    // Get voucher document
    const voucherRef = doc(db, 'vouchers', cleanCode);
    const voucherSnap = await getDoc(voucherRef);

    if (!voucherSnap.exists()) {
      return {
        isValid: false,
        error: 'Voucher code not found',
        voucher: null
      };
    }

    const voucher = voucherSnap.data();
    const now = new Date();

    // Check if voucher is active
    if (!voucher.isActive) {
      return {
        isValid: false,
        error: 'This voucher is no longer active',
        voucher
      };
    }

    // Check expiry date
    if (voucher.expiresAt && voucher.expiresAt.toDate() < now) {
      return {
        isValid: false,
        error: 'This voucher has expired',
        voucher
      };
    }

    // Check usage limits
    if (voucher.maxUses && voucher.currentUses >= voucher.maxUses) {
      return {
        isValid: false,
        error: 'This voucher has been used the maximum number of times',
        voucher
      };
    }

    // Check start date if exists
    if (voucher.startsAt && voucher.startsAt.toDate() > now) {
      return {
        isValid: false,
        error: 'This voucher is not yet active',
        voucher
      };
    }

    return {
      isValid: true,
      error: null,
      voucher: { ...voucher, code: cleanCode }
    };

  } catch (error) {
    console.error('Error validating voucher:', error);
    return {
      isValid: false,
      error: 'Error validating voucher code. Please try again.',
      voucher: null
    };
  }
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
    // First validate the voucher
    const validation = await validateVoucher(code);
    if (!validation.isValid) {
      return validation;
    }

    const { voucher } = validation;
    const cleanCode = code.trim().toUpperCase();

    // Check if user has already used this voucher
    if (voucher.usedBy && voucher.usedBy.includes(userId)) {
      return {
        isValid: false,
        error: 'You have already used this voucher',
        voucher
      };
    }

    // Check if user already has a higher or equal tier
    const currentTier = userProfile?.subscription?.tier || 'free';
    const tierPriority = { free: 0, casual: 1, pro: 2, battle: 3 };

    if (voucher.tier && tierPriority[currentTier] >= tierPriority[voucher.tier]) {
      return {
        isValid: false,
        error: `You already have ${currentTier} tier or higher`,
        voucher
      };
    }

    // Calculate expiry date based on voucher duration
    let expiresAt = null;
    if (voucher.duration && voucher.duration > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + voucher.duration);
    }

    // Prepare subscription update
    const subscriptionUpdate = {
      tier: voucher.tier || currentTier,
      type: voucher.type || 'voucher',
      expiresAt: expiresAt ? expiresAt : null,
      voucherCode: cleanCode,
      redeemedAt: new Date(),
      autoRenew: false, // Voucher subscriptions don't auto-renew
      discountPercentage: voucher.discountPercentage || 0,
      discountAmount: voucher.discountAmount || 0
    };

    // Update voucher usage
    const voucherRef = doc(db, 'vouchers', cleanCode);
    const updateData = {
      currentUses: increment(1),
      lastUsedAt: serverTimestamp(),
      usedBy: voucher.usedBy ? [...voucher.usedBy, userId] : [userId]
    };

    // Add redemption record
    if (!voucher.redemptions) {
      updateData.redemptions = [];
    }

    const redemptionRecord = {
      userId,
      redeemedAt: serverTimestamp(),
      userEmail: userProfile?.email || null,
      userDisplayName: userProfile?.displayName || null
    };

    await updateDoc(voucherRef, {
      ...updateData,
      redemptions: [...(voucher.redemptions || []), redemptionRecord]
    });

    return {
      isValid: true,
      error: null,
      voucher,
      subscriptionUpdate,
      message: getRedemptionMessage(voucher)
    };

  } catch (error) {
    console.error('Error redeeming voucher:', error);
    return {
      isValid: false,
      error: 'Error redeeming voucher. Please try again.',
      voucher: null
    };
  }
};

/**
 * Get user-friendly redemption message
 * @param {Object} voucher - Voucher data
 * @returns {string} Success message
 */
const getRedemptionMessage = (voucher) => {
  switch (voucher.type) {
    case VOUCHER_TYPES.BETA:
      return `Welcome to the beta! You now have ${voucher.tier} access.`;
    case VOUCHER_TYPES.TRIAL:
      return `Trial activated! You have ${voucher.duration} days of ${voucher.tier} access.`;
    case VOUCHER_TYPES.FREE:
      return `Congratulations! You now have free ${voucher.tier} access.`;
    case VOUCHER_TYPES.DISCOUNT:
      if (voucher.discountPercentage) {
        return `${voucher.discountPercentage}% discount applied to your ${voucher.tier} subscription!`;
      } else if (voucher.discountAmount) {
        return `£${voucher.discountAmount} discount applied to your ${voucher.tier} subscription!`;
      }
      return `Discount applied to your ${voucher.tier} subscription!`;
    case VOUCHER_TYPES.UPGRADE:
      return `Account upgraded to ${voucher.tier}!`;
    default:
      return `Voucher redeemed successfully! You now have ${voucher.tier} access.`;
  }
};

/**
 * Create a new voucher (Admin function)
 * @param {Object} voucherData - Voucher configuration
 * @returns {Object} Created voucher
 */
export const createVoucher = async (voucherData) => {
  try {
    const {
      code,
      type = VOUCHER_TYPES.TRIAL,
      tier = 'casual',
      duration = null,
      maxUses = null,
      discountPercentage = 0,
      discountAmount = 0,
      description = '',
      createdBy,
      startsAt = null,
      expiresAt = null
    } = voucherData;

    if (!code || !createdBy) {
      throw new Error('Code and createdBy are required');
    }

    const cleanCode = code.trim().toUpperCase();
    const voucherRef = doc(db, 'vouchers', cleanCode);

    // Check if voucher already exists
    const existingVoucher = await getDoc(voucherRef);
    if (existingVoucher.exists()) {
      throw new Error('Voucher code already exists');
    }

    const newVoucher = {
      code: cleanCode,
      type,
      tier,
      duration,
      maxUses,
      currentUses: 0,
      discountPercentage,
      discountAmount,
      description,
      isActive: true,
      createdAt: serverTimestamp(),
      createdBy,
      startsAt: startsAt ? new Date(startsAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      usedBy: [],
      redemptions: []
    };

    await setDoc(voucherRef, newVoucher);

    return { success: true, voucher: newVoucher };

  } catch (error) {
    console.error('Error creating voucher:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all vouchers (Admin function)
 * @returns {Array} List of vouchers
 */
export const listVouchers = async () => {
  try {
    const vouchersQuery = query(collection(db, 'vouchers'));
    const querySnapshot = await getDocs(vouchersQuery);

    const vouchers = [];
    querySnapshot.forEach((doc) => {
      vouchers.push({ id: doc.id, ...doc.data() });
    });

    return vouchers.sort((a, b) => {
      const aTime = a.createdAt?.toDate() || new Date(0);
      const bTime = b.createdAt?.toDate() || new Date(0);
      return bTime - aTime; // Most recent first
    });

  } catch (error) {
    console.error('Error listing vouchers:', error);
    return [];
  }
};

/**
 * Deactivate a voucher (Admin function)
 * @param {string} code - Voucher code
 * @returns {boolean} Success status
 */
export const deactivateVoucher = async (code) => {
  try {
    const cleanCode = code.trim().toUpperCase();
    const voucherRef = doc(db, 'vouchers', cleanCode);

    await updateDoc(voucherRef, {
      isActive: false,
      deactivatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error deactivating voucher:', error);
    return false;
  }
};

/**
 * Get voucher usage statistics (Admin function)
 * @param {string} code - Voucher code
 * @returns {Object} Usage statistics
 */
export const getVoucherStats = async (code) => {
  try {
    const validation = await validateVoucher(code);
    if (!validation.voucher) {
      return null;
    }

    const { voucher } = validation;

    return {
      code: voucher.code,
      type: voucher.type,
      tier: voucher.tier,
      currentUses: voucher.currentUses || 0,
      maxUses: voucher.maxUses,
      usagePercentage: voucher.maxUses ?
        Math.round((voucher.currentUses / voucher.maxUses) * 100) : null,
      isActive: voucher.isActive,
      createdAt: voucher.createdAt?.toDate(),
      expiresAt: voucher.expiresAt?.toDate(),
      redemptions: voucher.redemptions || []
    };

  } catch (error) {
    console.error('Error getting voucher stats:', error);
    return null;
  }
};