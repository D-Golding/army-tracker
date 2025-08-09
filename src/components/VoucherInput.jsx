// components/VoucherInput.jsx - Voucher Code Input Component
import React, { useState } from 'react';
import { Tag, Check, X, Gift, Loader } from 'lucide-react';
import { validateVoucher, redeemVoucher } from '../services/voucherService';

const VoucherInput = ({
  onVoucherApplied,
  onError,
  userProfile,
  userId,
  disabled = false,
  className = ""
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationState, setValidationState] = useState(null); // null, 'valid', 'invalid'
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCodeChange = (e) => {
    const newCode = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(newCode);

    // Reset validation state when code changes
    if (validationState) {
      setValidationState(null);
    }
  };

  const handleValidateCode = async () => {
    if (!code.trim()) {
      setValidationState('invalid');
      onError?.('Please enter a voucher code');
      return;
    }

    setLoading(true);

    try {
      const result = await validateVoucher(code);

      if (result.isValid) {
        setValidationState('valid');

        // Show voucher details but don't apply yet
        const { voucher } = result;
        console.log('Valid voucher:', voucher);
      } else {
        setValidationState('invalid');
        onError?.(result.error);
      }
    } catch (error) {
      setValidationState('invalid');
      onError?.('Error validating voucher code');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVoucher = async () => {
    if (!code.trim() || !userId) return;

    setLoading(true);

    try {
      const result = await redeemVoucher(code, userId, userProfile);

      if (result.isValid) {
        setAppliedVoucher(result);
        onVoucherApplied?.(result);
        setValidationState('valid');
      } else {
        setValidationState('invalid');
        onError?.(result.error);
      }
    } catch (error) {
      setValidationState('invalid');
      onError?.('Error applying voucher code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setCode('');
    setValidationState(null);
    setAppliedVoucher(null);
    onVoucherApplied?.(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (validationState === 'valid' && !appliedVoucher) {
        handleApplyVoucher();
      } else if (!validationState) {
        handleValidateCode();
      }
    }
  };

  // If voucher is applied, show success state
  if (appliedVoucher) {
    return (
      <div className={`border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-green-800 dark:text-green-200">
              Voucher Applied Successfully!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {appliedVoucher.message}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="text-green-600 dark:text-green-400 font-mono">
                {appliedVoucher.voucher.code}
              </span>
              <button
                onClick={handleRemoveVoucher}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 underline"
              >
                Remove voucher
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Collapsed state - show expand button
  if (!isExpanded) {
    return (
      <div className={className}>
        <button
          onClick={() => setIsExpanded(true)}
          disabled={disabled}
          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <Gift className="w-4 h-4" />
            <span className="text-sm">Have a voucher code?</span>
          </div>
        </button>
      </div>
    );
  }

  // Expanded state - show input form
  return (
    <div className={`border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Gift className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <h3 className="font-medium text-gray-900 dark:text-white">
          Apply Voucher Code
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="ml-auto p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={code}
            onChange={handleCodeChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter voucher code"
            disabled={disabled || loading}
            maxLength={20}
            className={`form-input pl-10 pr-10 ${
              validationState === 'valid' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
              validationState === 'invalid' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
              ''
            }`}
          />

          {/* Loading/Status Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <Loader className="w-4 h-4 text-gray-400 animate-spin" />
            ) : validationState === 'valid' ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : validationState === 'invalid' ? (
              <X className="w-4 h-4 text-red-500" />
            ) : null}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!validationState ? (
            <button
              onClick={handleValidateCode}
              disabled={!code.trim() || loading || disabled}
              className="btn-secondary flex-1 text-sm"
            >
              {loading ? 'Checking...' : 'Check Code'}
            </button>
          ) : validationState === 'valid' ? (
            <button
              onClick={handleApplyVoucher}
              disabled={loading || disabled}
              className="btn-primary flex-1 text-sm"
            >
              {loading ? 'Applying...' : 'Apply Voucher'}
            </button>
          ) : (
            <button
              onClick={() => {
                setValidationState(null);
                handleValidateCode();
              }}
              disabled={loading || disabled}
              className="btn-secondary flex-1 text-sm"
            >
              Try Again
            </button>
          )}

          <button
            onClick={() => {
              setCode('');
              setValidationState(null);
            }}
            disabled={loading || disabled}
            className="btn-secondary px-3 text-sm"
          >
            Clear
          </button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Enter your voucher code to receive discounts or special access.</p>
          {validationState === 'invalid' && (
            <p className="text-red-600 dark:text-red-400 mt-1">
              Please check your code and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherInput;