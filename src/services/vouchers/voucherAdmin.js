// services/vouchers/voucherAdmin.js - Admin voucher management functions
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { VOUCHER_TYPES, validateVoucherData, formatVoucherResponse, cleanVoucherCode } from './voucherHelpers.js';

/**
 * Create a new voucher (Admin function)
 * @param {Object} voucherData - Voucher configuration
 * @returns {Object} Created voucher result
 */
export const createVoucher = async (voucherData) => {
  try {
    // Validate voucher data
    const validation = validateVoucherData(voucherData);
    if (!validation.isValid) {
      return formatVoucherResponse(false, null, validation.error);
    }

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

    const codeValidation = cleanVoucherCode(code);
    if (!codeValidation.isValid) {
      return formatVoucherResponse(false, null, codeValidation.error);
    }

    const cleanCode = codeValidation.cleanCode;
    const voucherRef = doc(db, 'vouchers', cleanCode);

    // Check if voucher already exists
    const existingVoucher = await getDoc(voucherRef);
    if (existingVoucher.exists()) {
      return formatVoucherResponse(false, null, 'Voucher code already exists');
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

    return formatVoucherResponse(true, { voucher: newVoucher }, null);

  } catch (error) {
    console.error('Error creating voucher:', error);
    return formatVoucherResponse(false, null, error.message);
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
    const codeValidation = cleanVoucherCode(code);
    if (!codeValidation.isValid) {
      return false;
    }

    const cleanCode = codeValidation.cleanCode;
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
 * Reactivate a voucher (Admin function)
 * @param {string} code - Voucher code
 * @returns {boolean} Success status
 */
export const reactivateVoucher = async (code) => {
  try {
    const codeValidation = cleanVoucherCode(code);
    if (!codeValidation.isValid) {
      return false;
    }

    const cleanCode = codeValidation.cleanCode;
    const voucherRef = doc(db, 'vouchers', cleanCode);

    await updateDoc(voucherRef, {
      isActive: true,
      reactivatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error reactivating voucher:', error);
    return false;
  }
};

/**
 * Update voucher details (Admin function)
 * @param {string} code - Voucher code
 * @param {Object} updates - Fields to update
 * @returns {Object} Update result
 */
export const updateVoucher = async (code, updates) => {
  try {
    const codeValidation = cleanVoucherCode(code);
    if (!codeValidation.isValid) {
      return formatVoucherResponse(false, null, codeValidation.error);
    }

    const cleanCode = codeValidation.cleanCode;
    const voucherRef = doc(db, 'vouchers', cleanCode);

    // Check if voucher exists
    const voucherSnap = await getDoc(voucherRef);
    if (!voucherSnap.exists()) {
      return formatVoucherResponse(false, null, 'Voucher not found');
    }

    const allowedUpdates = [
      'description',
      'maxUses',
      'expiresAt',
      'startsAt',
      'discountPercentage',
      'discountAmount'
    ];

    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return formatVoucherResponse(false, null, 'No valid updates provided');
    }

    filteredUpdates.updatedAt = serverTimestamp();

    await updateDoc(voucherRef, filteredUpdates);

    return formatVoucherResponse(true, { updatedFields: Object.keys(filteredUpdates) }, null);

  } catch (error) {
    console.error('Error updating voucher:', error);
    return formatVoucherResponse(false, null, error.message);
  }
};

/**
 * Get voucher usage statistics (Admin function)
 * @param {string} code - Voucher code
 * @returns {Object} Usage statistics
 */
export const getVoucherStats = async (code) => {
  try {
    const codeValidation = cleanVoucherCode(code);
    if (!codeValidation.isValid) {
      return null;
    }

    const cleanCode = codeValidation.cleanCode;
    const voucherRef = doc(db, 'vouchers', cleanCode);
    const voucherSnap = await getDoc(voucherRef);

    if (!voucherSnap.exists()) {
      return null;
    }

    const voucher = voucherSnap.data();

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

/**
 * Get voucher redemption history (Admin function)
 * @param {string} code - Voucher code
 * @returns {Array} List of redemptions
 */
export const getVoucherRedemptions = async (code) => {
  try {
    const stats = await getVoucherStats(code);
    return stats ? stats.redemptions : [];
  } catch (error) {
    console.error('Error getting voucher redemptions:', error);
    return [];
  }
};