// components/AccountRecovery.jsx - Standalone Account Recovery Component
import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  Clock,
  Shield,
  Mail,
  User
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { sendAccountRecoveryConfirmationEmail } from '../services/emailService';
import ConfirmationModal from './common/ConfirmationModal';

const AccountRecovery = () => {
  const [urlParams, setUrlParams] = useState({ userId: '', token: '' });
  const [recoveryData, setRecoveryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const [status, setStatus] = useState('validating'); // validating, valid, invalid, expired, recovered, error
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  // Parse URL parameters on mount
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const userId = urlSearchParams.get('userId');
    const token = urlSearchParams.get('token');

    setUrlParams({ userId, token });

    if (!userId || !token) {
      setStatus('invalid');
      setIsLoading(false);
      return;
    }

    validateRecoveryLink(userId, token);
  }, []);

  // Validate recovery link and fetch user data
  const validateRecoveryLink = async (userId, token) => {
    try {
      // Fetch user document
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (!userDoc.exists()) {
        setStatus('invalid');
        return;
      }

      const userData = userDoc.data();

      // Check if account is actually deactivated for deletion
      if (userData.accountStatus !== 'deactivated_for_deletion') {
        setStatus('invalid');
        setError('This account is not eligible for recovery.');
        return;
      }

      // Check if recovery token matches
      if (userData.recoveryToken !== token) {
        setStatus('invalid');
        setError('Invalid recovery link.');
        return;
      }

      // Check if recovery period has expired
      const deletionDate = userData.deletionScheduledFor?.toDate();
      if (deletionDate && deletionDate < new Date()) {
        setStatus('expired');
        setError('Recovery period has expired. Account data has been permanently deleted.');
        return;
      }

      // Recovery link is valid
      setRecoveryData({
        displayName: userData.displayName,
        email: userData.email,
        deactivatedAt: userData.deactivatedAt?.toDate(),
        deletionScheduledFor: deletionDate,
        daysRemaining: Math.ceil((deletionDate - new Date()) / (1000 * 60 * 60 * 24))
      });

      setStatus('valid');

    } catch (error) {
      console.error('Error validating recovery link:', error);
      setStatus('error');
      setError('Failed to validate recovery link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Recover the account
  const handleRecoverAccount = async () => {
    setIsRecovering(true);

    try {
      // Update user document to reactivate account
      await updateDoc(doc(db, 'users', urlParams.userId), {
        accountStatus: 'active',
        deactivatedAt: null,
        deletionScheduledFor: null,
        deletionType: null,
        recoveryToken: null,
        recoveredAt: new Date()
      });

      // Send recovery confirmation email
      await sendAccountRecoveryConfirmationEmail(
        recoveryData.email,
        recoveryData.displayName || 'User'
      );

      // Show success modal instead of setting status
      setModalConfig({
        title: 'Account Recovered Successfully!',
        message: (
          <div>
            <p className="mb-3">Your account has been reactivated and all your data has been restored.</p>
            <p className="mb-3"><strong>Confirmation email sent</strong> to {recoveryData.email}</p>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 mt-3">
              <div className="text-sm text-emerald-800 dark:text-emerald-200">
                <p className="font-medium mb-1">✓ What happens next:</p>
                <ul className="space-y-1 text-left">
                  <li>• Your account is now fully active</li>
                  <li>• All your data has been restored</li>
                  <li>• You can sign in with your usual credentials</li>
                </ul>
              </div>
            </div>
          </div>
        ),
        type: 'success',
        primaryAction: {
          label: 'Sign In to Your Account',
          onClick: () => {
            setShowModal(false);
            window.location.href = '/auth';
          }
        },
        secondaryAction: {
          label: 'Go to Homepage',
          onClick: () => {
            setShowModal(false);
            window.location.href = '/';
          }
        }
      });
      setShowModal(true);

    } catch (error) {
      console.error('Error recovering account:', error);
      setStatus('error');
      setError('Failed to recover account. Please contact support.');
    } finally {
      setIsRecovering(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="card-base card-padding-lg max-w-md w-full text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Validating Recovery Link
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we verify your account recovery request...
          </p>
        </div>
      </div>
    );
  }

  // Invalid or expired link
  if (status === 'invalid' || status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="card-base card-padding-lg max-w-md w-full text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {status === 'expired' ? 'Recovery Period Expired' : 'Invalid Recovery Link'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'This recovery link is not valid or has expired.'}
          </p>

          <div className="space-y-3">
            <a
              href="/"
              className="btn-primary btn-md w-full flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              Go to Homepage
            </a>

            <a
              href="/contact"
              className="btn-outline btn-md w-full flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="card-base card-padding-lg max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Recovery Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => validateRecoveryLink(urlParams.userId, urlParams.token)}
              className="btn-primary btn-md w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <a
              href="/contact"
              className="btn-outline btn-md w-full flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Successfully recovered
  if (status === 'recovered') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="card-base card-padding-lg max-w-md w-full text-center">
          <Check className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Account Recovered Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your account has been reactivated. You can now sign in normally.
          </p>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-6">
            <div className="text-sm text-emerald-800 dark:text-emerald-200">
              <p className="font-medium mb-1">✓ What happens next:</p>
              <ul className="space-y-1 text-left">
                <li>• Your account is now fully active</li>
                <li>• All your data has been restored</li>
                <li>• You'll receive a confirmation email</li>
                <li>• You can sign in with your usual credentials</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="/login"
              className="btn-primary btn-md w-full flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              Sign In to Your Account
            </a>

            <a
              href="/"
              className="btn-outline btn-md w-full"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Valid recovery link - show recovery confirmation
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="card-base card-padding-lg max-w-md w-full">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Recover Your Account
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your account was scheduled for deletion but can still be recovered.
          </p>
        </div>

        {/* Account Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Account Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="font-medium text-gray-900 dark:text-white">{recoveryData?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {recoveryData?.displayName || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Deactivated:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {recoveryData?.deactivatedAt?.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Time Remaining</p>
              <p>
                You have <strong>{recoveryData?.daysRemaining} days</strong> remaining to recover your account.
                After {recoveryData?.deletionScheduledFor?.toLocaleDateString()}, your data will be permanently deleted.
              </p>
            </div>
          </div>
        </div>

        {/* Recovery Action */}
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              <strong>What happens when you recover:</strong>
            </p>
            <ul className="space-y-1 ml-4">
              <li>• Your account will be fully reactivated</li>
              <li>• All your data will be restored</li>
              <li>• You can sign in normally</li>
              <li>• The deletion process will be cancelled</li>
            </ul>
          </div>

          <button
            onClick={handleRecoverAccount}
            disabled={isRecovering}
            className="btn-primary btn-md w-full flex items-center justify-center gap-2"
          >
            {isRecovering ? (
              <div className="loading-spinner"></div>
            ) : (
              <Check className="w-5 h-5" />
            )}
            {isRecovering ? 'Recovering Account...' : 'Recover My Account'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Don't want to recover your account?
            </p>
            <a
              href="/"
              className="btn-outline btn-sm"
            >
              Leave Account Deleted
            </a>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        {...modalConfig}
      />
    </div>
  );
};

export default AccountRecovery;