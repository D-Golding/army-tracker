// services/vouchers/voucherHelpers.js - Voucher utilities, constants, and helpers

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
 * Get user-friendly redemption message
 * @param {Object} voucher - Voucher data
 * @returns {string} Success message
 */
export const getRedemptionMessage = (voucher) => {
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
 * Validate voucher creation data
 * @param {Object} voucherData - Voucher configuration
 * @returns {Object} Validation result
 */
export const validateVoucherData = (voucherData) => {
  const {
    code,
    type = VOUCHER_TYPES.TRIAL,
    tier = 'casual',
    createdBy
  } = voucherData;

  if (!code || !createdBy) {
    return {
      isValid: false,
      error: 'Code and createdBy are required'
    };
  }

  if (!Object.values(VOUCHER_TYPES).includes(type)) {
    return {
      isValid: false,
      error: 'Invalid voucher type'
    };
  }

  const validTiers = ['free', 'casual', 'pro', 'battle'];
  if (!validTiers.includes(tier)) {
    return {
      isValid: false,
      error: 'Invalid tier'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Format consistent voucher response
 * @param {boolean} success - Whether operation succeeded
 * @param {Object} data - Response data
 * @param {string} error - Error message if failed
 * @returns {Object} Formatted response
 */
export const formatVoucherResponse = (success, data = null, error = null) => {
  return {
    success,
    ...data,
    error
  };
};

/**
 * Clean and validate voucher code format
 * @param {string} code - Raw voucher code
 * @returns {Object} Validation result with clean code
 */
export const cleanVoucherCode = (code) => {
  if (!code || typeof code !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a voucher code',
      cleanCode: null
    };
  }

  const cleanCode = code.trim().toUpperCase();

  if (cleanCode.length < 3) {
    return {
      isValid: false,
      error: 'Voucher code too short',
      cleanCode: null
    };
  }

  return {
    isValid: true,
    error: null,
    cleanCode
  };
};