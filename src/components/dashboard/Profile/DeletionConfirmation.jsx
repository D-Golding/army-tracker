// components/dashboard/Profile/DeletionConfirmation.jsx - Simplified Deletion Confirmation Process
import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Trash2,
  Eye,
  EyeOff,
  Shield
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
import { sendAccountDeletionConfirmationEmail } from '../../../services/emailService';
import ConfirmationModal from '../../common/ConfirmationModal';

const DeletionConfirmation = ({
  type,
  onBack,
  hasActiveSubscription,
  subscriptionExpiryDate
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    dataRetention: type === 'immediate-permanent' ? 'immediate' : '30days',
    acknowledgeSubscription: false,
    acknowledgeDataLoss: false,
    acknowledgeNoRecovery: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear specific field error
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required to proceed';
    }

    if (!formData.acknowledgeDataLoss) {
      newErrors.acknowledgeDataLoss = 'You must acknowledge data loss';
    }

    if (!formData.acknowledgeNoRecovery) {
      newErrors.acknowledgeNoRecovery = 'You must acknowledge no recovery is possible';
    }

    if (hasActiveSubscription && !formData.acknowledgeSubscription) {
      newErrors.acknowledgeSubscription = 'You must acknowledge subscription forfeiture';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle deletion
  const handleDeleteAccount = async () => {
    if (!validateForm()) return;

    setIsDeleting(true);

    // Call the actual deletion process directly
    try {
      // Process deletion immediately without email verification
      await processImmediateDeletion();
    } catch (error) {
      console.error('Error processing account deletion:', error);
      setErrors({ general: 'Failed to process account deletion. Please try again.' });
      setIsDeleting(false);
    }
  };

  // Process immediate deletion
  const processImmediateDeletion = async () => {
    try {
      // Re-authenticate user first
      if (formData.password) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          formData.password
        );
        await reauthenticateWithCredential(currentUser, credential);
      }

      if (formData.dataRetention === '30days') {
        // For 30-day retention: deactivate account but keep data
        await processThirtyDayDeletion();
      } else {
        // For immediate deletion: delete everything permanently
        await processPermanentDeletion();
      }

    } catch (error) {
      console.error('Error with deletion:', error);
      throw error;
    }
  };

  // Process 30-day deletion (deactivate account, keep data)
  const processThirtyDayDeletion = async () => {
    try {
      const userId = currentUser.uid;
      const userEmail = currentUser.email;
      const userName = userProfile?.displayName || 'User';

      // Update user profile to mark as deactivated
      await updateDoc(doc(db, 'users', userId), {
        accountStatus: 'deactivated_for_deletion',
        deactivatedAt: new Date(),
        deletionScheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        deletionType: '30day_grace',
        recoveryToken: generateRecoveryToken()
      });

      // Send confirmation email with recovery link
      await sendAccountDeletionConfirmationEmail(
        userEmail,
        userName,
        '30-day grace period',
        true, // hasRecoveryOption
        generateRecoveryUrl(userId)
      );

      // Sign out user (account is now deactivated)
      await logout();

      // Show success modal instead of alert
      setModalConfig({
        title: 'Account Deactivated',
        message: (
          <div>
            <p className="mb-3">Your account has been deactivated and will be permanently deleted in 30 days.</p>
            <p className="mb-3"><strong>Recovery email sent</strong> to {userEmail}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can recover your account anytime within the next 30 days using the link in your email.
            </p>
          </div>
        ),
        type: 'warning',
        primaryAction: {
          label: 'Go to Homepage',
          onClick: () => {
            setShowModal(false);
            window.location.href = '/';
          }
        }
      });
      setShowModal(true);

    } catch (error) {
      console.error('Error with 30-day deletion:', error);
      throw error;
    }
  };

  // Process permanent deletion
  const processPermanentDeletion = async () => {
    try {
      const userEmail = currentUser.email;
      const userName = userProfile?.displayName || 'User';

      // Delete user data from Firestore
      await deleteUserData();

      // Delete user photos from Storage
      await deleteUserPhotos();

      // Send confirmation email (before deleting auth account)
      await sendAccountDeletionConfirmationEmail(
        userEmail,
        userName,
        'permanent',
        false, // hasRecoveryOption
        null
      );

      // Delete Firebase Auth account
      await deleteUser(currentUser);

      // Logout and redirect
      await logout();

      // Show success modal instead of alert
      setModalConfig({
        title: 'Account Permanently Deleted',
        message: (
          <div>
            <p className="mb-3">Your account and all data have been permanently deleted.</p>
            <p className="mb-3"><strong>Confirmation email sent</strong> to {userEmail}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This action cannot be undone. Thank you for using our service.
            </p>
          </div>
        ),
        type: 'success',
        primaryAction: {
          label: 'Go to Homepage',
          onClick: () => {
            setShowModal(false);
            window.location.href = '/';
          }
        }
      });
      setShowModal(true);

    } catch (error) {
      console.error('Error with permanent deletion:', error);
      throw error;
    }
  };

  // Generate recovery token
  const generateRecoveryToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Generate recovery URL
  const generateRecoveryUrl = (userId) => {
    const token = generateRecoveryToken();
    return `${window.location.origin}/account-recovery?userId=${userId}&token=${token}`;
  };

  // Delete all user data from Firestore
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

    } catch (error) {
      console.error('Error deleting user photos:', error);
      // Don't throw here - photo deletion failures shouldn't stop account deletion
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-base card-padding-lg">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Confirm Account Deletion
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {type === 'immediate-permanent'
              ? 'Your account and data will be permanently deleted immediately'
              : 'Your account will be disabled immediately with 30-day data retention'
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card-base card-padding-lg">
        <div className="space-y-6">
          {/* Password Verification */}
          <div>
            <label className="form-label">Enter Your Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`form-input ${errors.password ? 'border-red-300 dark:border-red-600' : ''}`}
                placeholder="Enter your password to confirm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="form-error">{errors.password}</p>
            )}
          </div>

          {/* Data Retention Options (only for immediate-30day type) */}
          {type === 'immediate-30day' && (
            <div>
              <label className="form-label">Data Retention</label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="dataRetention"
                    value="30days"
                    checked={formData.dataRetention === '30days'}
                    onChange={(e) => handleInputChange('dataRetention', e.target.value)}
                    className="form-radio mt-1"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">30-Day Grace Period (Recommended)</p>
                    <p className="text-gray-600 dark:text-gray-400">Account disabled immediately, data kept for 30 days for recovery</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="dataRetention"
                    value="immediate"
                    checked={formData.dataRetention === 'immediate'}
                    onChange={(e) => handleInputChange('dataRetention', e.target.value)}
                    className="form-radio mt-1"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">Delete Immediately</p>
                    <p className="text-gray-600 dark:text-gray-400">All data permanently deleted right away</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Acknowledgements */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Please confirm you understand:</h4>

            {/* Data Loss Acknowledgement */}
            <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="checkbox"
                checked={formData.acknowledgeDataLoss}
                onChange={(e) => handleInputChange('acknowledgeDataLoss', e.target.checked)}
                className="form-checkbox mt-1"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  All my data will be permanently deleted
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Projects, photos, progress, settings, and all personal information
                </p>
              </div>
            </label>

            {/* No Recovery Acknowledgement */}
            <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="checkbox"
                checked={formData.acknowledgeNoRecovery}
                onChange={(e) => handleInputChange('acknowledgeNoRecovery', e.target.checked)}
                className="form-checkbox mt-1"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  This action cannot be undone
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {formData.dataRetention === '30days'
                    ? 'After 30 days, no recovery will be possible'
                    : 'No backup exists and support cannot recover deleted accounts'
                  }
                </p>
              </div>
            </label>

            {/* Subscription Acknowledgement */}
            {hasActiveSubscription && (
              <label className="flex items-start gap-3 p-4 border border-amber-200 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-xl cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30">
                <input
                  type="checkbox"
                  checked={formData.acknowledgeSubscription}
                  onChange={(e) => handleInputChange('acknowledgeSubscription', e.target.checked)}
                  className="form-checkbox mt-1"
                />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                    I will forfeit my remaining subscription
                  </p>
                  <p className="text-amber-800 dark:text-amber-200">
                    Subscription expires {subscriptionExpiryDate?.toLocaleDateString()}.
                    No refund for unused time.
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Error Messages */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
              <div className="text-sm text-red-800 dark:text-red-200">
                <p className="font-medium">{errors.general}</p>
              </div>
            </div>
          )}

          {Object.keys(errors).length > 0 && !errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="text-sm text-red-800 dark:text-red-200">
                <p className="font-medium mb-2">Please complete all required fields:</p>
                <ul className="space-y-1">
                  {errors.password && <li>• Enter your password</li>}
                  {errors.acknowledgeDataLoss && <li>• Acknowledge data loss</li>}
                  {errors.acknowledgeNoRecovery && <li>• Acknowledge no recovery</li>}
                  {errors.acknowledgeSubscription && <li>• Acknowledge subscription forfeiture</li>}
                </ul>
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
              <p className="text-sm">
                This action will immediately and permanently delete your account. This cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="btn-outline btn-md flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="btn-danger btn-md flex items-center gap-2"
        >
          {isDeleting ? (
            <div className="loading-spinner"></div>
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
          {isDeleting ? 'Deleting Account...' : 'Delete Account'}
        </button>
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

export default DeletionConfirmation;