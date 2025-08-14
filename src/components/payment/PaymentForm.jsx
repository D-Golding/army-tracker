// components/payment/PaymentForm.jsx - Complete Payment Form with Voucher Integration
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Gift,
  Mail
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import VoucherInput from '../VoucherInput';
import LaunchNotificationSignup from '../common/LaunchNotificationSignup';
import { tiers } from '../../config/subscription/index.js';

const PaymentForm = () => {
  const { userProfile, completeTierSelection, currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get tier and plan from URL params
  const tierParam = searchParams.get('tier') || 'casual';
  const planParam = searchParams.get('plan') || 'monthly';

  // Find the selected tier data
  const selectedTier = tiers.find(tier => tier.id === tierParam) || tiers[1];

  // Form state
  const [formData, setFormData] = useState({
    // Terms
    agreeToTerms: false
  });

  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate pricing
  const basePrice = planParam === 'annual' ?
    Math.round(selectedTier.monthlyPrice * 12 * 0.83) : // 17% discount for annual
    selectedTier.monthlyPrice;

  let finalPrice = basePrice;
  let discount = 0;

  if (appliedVoucher?.voucher) {
    const voucher = appliedVoucher.voucher;
    if (voucher.type === 'free') {
      finalPrice = 0;
      discount = basePrice;
    } else if (voucher.discountPercentage) {
      discount = Math.round(basePrice * (voucher.discountPercentage / 100));
      finalPrice = basePrice - discount;
    } else if (voucher.discountAmount) {
      discount = Math.min(voucher.discountAmount, basePrice);
      finalPrice = basePrice - discount;
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVoucherApplied = (voucherResult) => {
    setAppliedVoucher(voucherResult);
    setError('');
  };

  const handleVoucherError = (errorMessage) => {
    setError(errorMessage);
  };

  const validateForm = () => {
    return formData.agreeToTerms;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Please accept the terms of service.');
      return;
    }

    setLoading(true);

    try {
      // If voucher gives free access, complete tier selection directly
      if (appliedVoucher?.voucher && finalPrice === 0) {
        await completeTierSelection(tierParam);
        navigate('/app', { replace: true });
        return;
      }

      // If no voucher applied, show error
      setError('Please enter a valid invitation code to access this feature, or sign up below for updates.');

    } catch (error) {
      console.error('Payment error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/auth');
  };

  const handleContinueWithFree = async () => {
    setLoading(true);
    try {
      await completeTierSelection('free');
      navigate('/app', { replace: true });
    } catch (error) {
      console.error('Error completing free tier selection:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Complete Your Purchase
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedTier.name} Plan - {planParam === 'annual' ? 'Annual' : 'Monthly'} Billing
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Payment Form */}
          <div className="space-y-6">
            {/* Voucher Input */}
            <VoucherInput
              onVoucherApplied={handleVoucherApplied}
              onError={handleVoucherError}
              userProfile={userProfile}
              userId={currentUser?.uid}
              disabled={loading}
            />

            {/* Feature Availability Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Gift className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Premium Features Coming Soon
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    This feature isn't available to purchase yet. If you have an invitation code for beta testing,
                    enter it above to get immediate access. Otherwise, sign up below for updates on when this feature becomes available.
                  </p>

                  <div className="flex items-center gap-4 text-sm text-blue-600 dark:text-blue-400">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      <span>Beta invitation code</span>
                    </div>
                    <div className="text-blue-400 dark:text-blue-500">or</div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>Email updates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Signup for Updates */}
            {!appliedVoucher && (
              <LaunchNotificationSignup
                title="Get Notified When Available"
                description="Be the first to know when our premium features launch. We'll send you an email as soon as they're ready."
                tier={tierParam}
              />
            )}

            {/* Form for voucher submission */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Terms and Conditions */}
              <div className="card-base card-padding-lg">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      I agree to the{' '}
                      <a href="/terms-of-service" target="_blank" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Terms of Service
                      </a>
                      {' '}and{' '}
                      <a href="/privacy-policy" target="_blank" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Privacy Policy
                      </a>
                      . I understand that my subscription will renew automatically unless cancelled.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleContinueWithFree}
                  disabled={loading}
                  className="btn-secondary flex-1"
                >
                  Continue with Free Tier
                </button>

                {appliedVoucher && (
                  <button
                    type="submit"
                    disabled={loading || !formData.agreeToTerms}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Activate Beta Access
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;