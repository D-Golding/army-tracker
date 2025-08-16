// services/voucherService.js - Barrel export (maintains backward compatibility)

// Re-export validation functions
export {
  validateVoucher,
  checkVoucherUsage,
  checkTierConflict,
  validateVoucherEligibility
} from './vouchers/voucherValidation.js';

// Re-export redemption functions
export {
  redeemVoucher,
  previewVoucherRedemption,
  calculateSubscriptionUpdate,
  applyVoucherToUser,
  updateVoucherUsage
} from './vouchers/voucherRedemption.js';

// Re-export admin functions
export {
  createVoucher,
  listVouchers,
  deactivateVoucher,
  reactivateVoucher,
  updateVoucher,
  getVoucherStats,
  getVoucherRedemptions
} from './vouchers/voucherAdmin.js';

// Re-export helpers and constants
export {
  VOUCHER_TYPES,
  VOUCHER_STATUS,
  getRedemptionMessage,
  validateVoucherData,
  formatVoucherResponse,
  cleanVoucherCode
} from './vouchers/voucherHelpers.js';

// Default export for backward compatibility
export default {
  // Validation
  validateVoucher,
  checkVoucherUsage,
  checkTierConflict,
  validateVoucherEligibility,

  // Redemption
  redeemVoucher,
  previewVoucherRedemption,
  calculateSubscriptionUpdate,
  applyVoucherToUser,

  // Admin
  createVoucher,
  listVouchers,
  deactivateVoucher,
  reactivateVoucher,
  updateVoucher,
  getVoucherStats,
  getVoucherRedemptions,

  // Constants
  VOUCHER_TYPES,
  VOUCHER_STATUS
};

// Import the functions for the default export
import { validateVoucher, checkVoucherUsage, checkTierConflict, validateVoucherEligibility } from './vouchers/voucherValidation.js';
import { redeemVoucher, previewVoucherRedemption, calculateSubscriptionUpdate, applyVoucherToUser } from './vouchers/voucherRedemption.js';
import { createVoucher, listVouchers, deactivateVoucher, reactivateVoucher, updateVoucher, getVoucherStats, getVoucherRedemptions } from './vouchers/voucherAdmin.js';
import { VOUCHER_TYPES, VOUCHER_STATUS, getRedemptionMessage } from './vouchers/voucherHelpers.js';