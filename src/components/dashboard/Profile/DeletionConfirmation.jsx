// components/dashboard/Profile/DeletionConfirmation.jsx - Complete with Cloud Functions
import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Trash2,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../firebase';
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

    try {
      if (type === 'immediate-permanent') {
        await processImmediateDeletion();
      } else if (type === 'scheduled') {
        await processScheduledDeletion();
      }
    } catch (error) {
      console.error('Error processing account deletion:', error);
      setErrors({ general: 'Failed to process account deletion. Please try again.' });
      setIsDeleting(false);
    }
  };

  // Process immediate deletion using Cloud Function
  const processImmediateDeletion = async () => {
    try {
      const userEmail = currentUser.email;
      const userName = userProfile?.displayName || 'User';

      // Call the Cloud Function to delete everything
      const deleteFunction = httpsCallable(functions, 'deleteUserAccountImmediate');
      const result = await deleteFunction({ uid: currentUser.uid });

      if (!result.data.success) {
        throw new Error(result.data.message || 'Deletion failed');
      }

      // Send confirmation email
      await sendAccountDeletionConfirmationEmail(
        userEmail,
        userName,
        'permanent',
        false, // hasRecoveryOption
        null
      );

      // Logout user
      await logout();

      // Show success modal
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
      console.error('Error with immediate deletion:', error);
      throw error;
    }
  };

  // Process scheduled deletion using Cloud Function
  const processScheduledDeletion = async () => {
    try {
      const userEmail = currentUser.email;
      const userName = userProfile?.displayName || 'User';

      // Call the Cloud Function to schedule deletion
      const scheduleFunction = httpsCallable(functions, 'scheduleUserDeletion');
      const result = await scheduleFunction({
        uid: currentUser.uid,
        scheduledDate: subscriptionExpiryDate?.toISOString()
      });

      if (!result.data.success) {
        throw new Error(result.data.message || 'Scheduling failed');
      }

      // Send confirmation email
      await sendAccountDeletionConfirmationEmail(
        userEmail,
        userName,
        `scheduled for ${subscriptionExpiryDate?.toLocaleDateString()}`,
        false, // hasRecoveryOption
        null
      );

      // Show success modal
      setModalConfig({
        title: 'Deletion Scheduled',
        message: (
          <div>
            <p className="mb-3">Your account has been scheduled for deletion on <strong>{subscriptionExpiryDate?.toLocaleDateString()}</strong>.</p>
            <p className="mb-3"><strong>Confirmation email sent</strong> to {userEmail}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can cancel this scheduled deletion anytime through your profile settings before the scheduled date.
            </p>
          </div>
        ),
        type: 'success',
        primaryAction: {
          label: 'Continue Using Account',
          onClick: () => setShowModal(false)
        }
      });
      setShowModal(true);

    } catch (error) {
      console.error('Error with scheduled deletion:', error);
      throw error;
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
              : 'Your account will be deleted when your subscription expires'
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
                  {type === 'scheduled'
                    ? 'After the scheduled date, no recovery will be possible'
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
                    {type === 'scheduled'
                      ? 'I understand my subscription will end naturally'
                      : 'I will forfeit my remaining subscription'
                    }
                  </p>
                  <p className="text-amber-800 dark:text-amber-200">
                    {type === 'scheduled'
                      ? `Full access until ${subscriptionExpiryDate?.toLocaleDateString()}, then account deletion`
                      : `Subscription expires ${subscriptionExpiryDate?.toLocaleDateString()}. No refund for unused time.`
                    }
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
                  {errors.acknowledgeSubscription && <li>• Acknowledge subscription terms</li>}
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
                {type === 'immediate-permanent'
                  ? 'This action will immediately and permanently delete your account. This cannot be undone.'
                  : `Your account will be automatically deleted on ${subscriptionExpiryDate?.toLocaleDateString()}. This cannot be undone after the deletion date.`
                }
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
          ) : type === 'scheduled' ? (
            <Calendar className="w-5 h-5" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
          {isDeleting ? 'Processing...' :
           type === 'scheduled' ? 'Schedule Deletion' : 'Delete Account Now'}
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