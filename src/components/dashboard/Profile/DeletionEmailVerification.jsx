// components/dashboard/Profile/DeletionEmailVerification.jsx - Updated with Real Email
import React, { useState, useEffect } from 'react';
import {
  Mail,
  ArrowLeft,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  Clock,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { deletePhotoByURL } from '../../../services/photoService';
import { generateVerificationCode } from '../../../services/emailService';

const DeletionEmailVerification = ({ onBack, deletionType, deletionData }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Store the verification code that was sent
  const [sentCode, setSentCode] = useState('');

  // Cooldown timer for resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Send verification email using real email service
  const sendVerificationEmail = async () => {
    setIsResending(true);
    setErrors({});

    try {
      // Generate a new verification code
      const newCode = generateVerificationCode();
      setSentCode(newCode);

      // Send email using the real email service
      const result = await sendDeletionVerificationEmail(
        currentUser.email,
        userProfile?.displayName || 'User',
        newCode,
        deletionType
      );

      if (result.success) {
        setEmailSent(true);
        setResendCooldown(60); // 60 second cooldown
        setSuccessMessage('Verification email sent successfully');
        console.log('✅ Verification email sent:', result.messageId);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Error sending verification email:', error);
      setErrors({ email: 'Failed to send verification email. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  // Verify code and process deletion
  const handleVerifyAndDelete = async () => {
    if (!verificationCode.trim()) {
      setErrors({ code: 'Please enter the verification code' });
      return;
    }

    if (verificationCode.toUpperCase() !== sentCode.toUpperCase()) {
      setErrors({ code: 'Invalid verification code. Please check your email and try again.' });
      return;
    }

    setIsProcessing(true);
    setErrors({});

    try {
      if (deletionType === 'immediate') {
        await processImmediateDeletion();
      } else if (deletionType === 'scheduled') {
        await processScheduledDeletion();
      }

    } catch (error) {
      console.error('Error processing account deletion:', error);
      setErrors({ general: 'Failed to process account deletion. Please contact support.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Process immediate deletion
  const processImmediateDeletion = async () => {
    try {
      // Re-authenticate user first (using password from deletionData)
      if (deletionData?.password) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          deletionData.password
        );
        await reauthenticateWithCredential(currentUser, credential);
      }

      // Delete user data from Firestore
      await deleteUserData();

      // Delete user photos from Storage
      await deleteUserPhotos();

      // Delete Firebase Auth account
      await deleteUser(currentUser);

      // Logout and redirect
      await logout();

      // In a real app, you'd redirect to a "account deleted" page
      alert('Account deleted successfully. You will be redirected.');
      window.location.href = '/';

    } catch (error) {
      console.error('Error with immediate deletion:', error);
      throw error;
    }
  };

  // Process scheduled deletion
  const processScheduledDeletion = async () => {
    try {
      const userId = currentUser.uid;
      const deletionDate = deletionData?.scheduledDate || userProfile?.subscription?.expiresAt;

      // Update user profile with deletion schedule
      await updateDoc(doc(db, 'users', userId), {
        scheduledForDeletion: true,
        deletionDate: deletionDate,
        deletionScheduledAt: new Date(),
        accountStatus: 'scheduled_for_deletion',
        deletionType: 'scheduled'
      });

      setSuccessMessage('Account successfully scheduled for deletion');

    } catch (error) {
      console.error('Error scheduling account deletion:', error);
      throw error;
    }
  };

  // Delete all user data from Firestore (updated for your structure)
  const deleteUserData = async () => {
    const userId = currentUser.uid;

    try {
      // Delete user's subcollections first
      const subcollections = ['projects', 'paints', 'wishlist', 'needToBuy'];

      for (const subcollection of subcollections) {
        const subCollectionRef = collection(db, 'users', userId, subcollection);
        const snapshot = await getDocs(subCollectionRef);

        for (const document of snapshot.docs) {
          await deleteDoc(document.ref);
        }
      }

      // Delete main user profile last
      await deleteDoc(doc(db, 'users', userId));

    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  };

  // Delete all user photos from Storage
  const deleteUserPhotos = async () => {
    try {
      // Delete profile photo
      if (userProfile?.photoURL) {
        await deletePhotoByURL(userProfile.photoURL);
      }

      // Note: In a full implementation, you'd also:
      // 1. Query all project photos
      // 2. Query all step photos
      // 3. Delete each photo from storage
      // This would require extending your photo service

    } catch (error) {
      console.error('Error deleting user photos:', error);
      // Don't throw here - photo deletion failures shouldn't stop account deletion
    }
  };

  // Send initial email on component mount
  useEffect(() => {
    sendVerificationEmail();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-base card-padding-lg">
        <div className="text-center">
          <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Email Verification Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We've sent a verification code to confirm your account deletion request
          </p>
        </div>
      </div>

      {/* Email Status */}
      <div className="card-base card-padding-lg">
        <div className="space-y-4">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm text-emerald-800 dark:text-emerald-200">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Email Sent Status */}
          {emailSent && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Verification Email Sent</p>
                  <p className="mb-2">
                    A verification code has been sent to <strong>{currentUser?.email}</strong>
                  </p>
                  <p>Please check your email (including spam folder) and enter the 6-digit code below.</p>
                </div>
              </div>
            </div>
          )}

          {/* Verification Code Input */}
          <div>
            <label className="form-label">Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.toUpperCase());
                setErrors({});
              }}
              className={`form-input font-mono text-center text-lg tracking-widest ${errors.code ? 'border-red-300 dark:border-red-600' : ''}`}
              placeholder="XXXXXX"
              maxLength={6}
            />
            {errors.code && (
              <p className="form-error">{errors.code}</p>
            )}
            <p className="form-help">
              Enter the 6-digit verification code from your email
            </p>
          </div>

          {/* Resend Email */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the email?
            </span>
            <button
              onClick={sendVerificationEmail}
              disabled={isResending || resendCooldown > 0}
              className="btn-outline btn-sm flex items-center gap-2"
            >
              {isResending ? (
                <div className="loading-spinner"></div>
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>

          {/* Error Messages */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
              </div>
            </div>
          )}

          {errors.email && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-800 dark:text-red-200">{errors.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Final Warning */}
      <div className="card-base border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <div className="card-padding-lg">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <div className="text-red-800 dark:text-red-200">
              <p className="font-semibold mb-2">Final Warning</p>
              <p className="text-sm mb-2">
                Once you verify this email, your account deletion will be processed and cannot be undone.
              </p>
              {deletionType === 'immediate' ? (
                <p className="text-sm">
                  Your account and all data will be <strong>permanently deleted immediately</strong>.
                </p>
              ) : (
                <p className="text-sm">
                  Your account will be <strong>scheduled for deletion</strong> when your subscription expires.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="btn-outline btn-md flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleVerifyAndDelete}
          disabled={isProcessing || !verificationCode.trim()}
          className="btn-danger btn-md flex items-center gap-2"
        >
          {isProcessing ? (
            <div className="loading-spinner"></div>
          ) : deletionType === 'immediate' ? (
            <Trash2 className="w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
          {isProcessing
            ? 'Processing...'
            : deletionType === 'immediate'
              ? 'Delete Account Now'
              : 'Schedule Deletion'
          }
        </button>
      </div>

      {/* Contact Support */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Having second thoughts or need help?
        </p>
        <button className="btn-outline btn-sm">
          Contact Support Instead
        </button>
      </div>
    </div>
  );
};

export default DeletionEmailVerification;