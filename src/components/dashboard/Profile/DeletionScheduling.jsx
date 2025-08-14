// components/dashboard/Profile/DeletionScheduling.jsx - Simplified Schedule Deletion
import React, { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Calendar,
  Shield,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { sendAccountDeletionConfirmationEmail } from '../../../services/emailService';
import ConfirmationModal from '../../common/ConfirmationModal';

const DeletionScheduling = ({ onBack, subscriptionExpiryDate }) => {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    acknowledgeScheduled: false,
    acknowledgeCanCancel: false,
    acknowledgeDataLoss: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isScheduling, setIsScheduling] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  // Calculate days until deletion
  const daysUntilDeletion = subscriptionExpiryDate
    ? Math.ceil((subscriptionExpiryDate - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

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

    if (!formData.acknowledgeScheduled) {
      newErrors.acknowledgeScheduled = 'You must acknowledge the scheduled deletion';
    }

    if (!formData.acknowledgeCanCancel) {
      newErrors.acknowledgeCanCancel = 'You must acknowledge you can cancel anytime';
    }

    if (!formData.acknowledgeDataLoss) {
      newErrors.acknowledgeDataLoss = 'You must acknowledge eventual data loss';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle scheduling deletion
  const handleScheduleDeletion = async () => {
    if (!validateForm()) return;

    setIsScheduling(true);

    try {
      const userId = currentUser.uid;
      const userEmail = currentUser.email;
      const userName = userProfile?.displayName || 'User';

      // Update user profile with deletion schedule
      await updateDoc(doc(db, 'users', userId), {
        scheduledForDeletion: true,
        deletionDate: subscriptionExpiryDate,
        deletionScheduledAt: new Date(),
        accountStatus: 'scheduled_for_deletion',
        deletionType: 'scheduled'
      });

      // Send confirmation email
      await sendAccountDeletionConfirmationEmail(
        userEmail,
        userName,
        `scheduled for ${subscriptionExpiryDate?.toLocaleDateString()}`,
        false, // hasRecoveryOption (scheduled deletions don't have recovery links)
        null
      );

      // Show success modal instead of setting success message
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

      // Clear form after successful scheduling
      setFormData({
        password: '',
        acknowledgeScheduled: false,
        acknowledgeCanCancel: false,
        acknowledgeDataLoss: false
      });

    } catch (error) {
      console.error('Error scheduling account deletion:', error);
      setErrors({ general: 'Failed to schedule account deletion. Please try again.' });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-base card-padding-lg">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Schedule Account Deletion
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Account will be deleted on {subscriptionExpiryDate?.toLocaleDateString()} ({daysUntilDeletion} days from now)
          </p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="card-base border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <div className="card-padding-lg">
            <div className="text-emerald-800 dark:text-emerald-200">
              <p className="font-semibold">{successMessage}</p>
              <p className="text-sm mt-1">
                You can cancel this scheduled deletion anytime through your profile settings.
              </p>
            </div>
          </div>
        </div>
      )}

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

          {/* Benefits Summary */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-800 dark:text-emerald-200">
                <p className="font-medium mb-2">✓ Benefits of Scheduled Deletion</p>
                <ul className="space-y-1 ml-4">
                  <li>• Keep full access until subscription expires</li>
                  <li>• Use all remaining subscription benefits</li>
                  <li>• Can cancel deletion request anytime</li>
                  <li>• Automatic process - no further action needed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Acknowledgements */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Please confirm you understand:</h4>

            {/* Scheduled Deletion Acknowledgement */}
            <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="checkbox"
                checked={formData.acknowledgeScheduled}
                onChange={(e) => handleInputChange('acknowledgeScheduled', e.target.checked)}
                className="form-checkbox mt-1"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  My account will be deleted on {subscriptionExpiryDate?.toLocaleDateString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Deletion will occur automatically when my subscription expires in {daysUntilDeletion} days
                </p>
              </div>
            </label>

            {/* Cancellation Acknowledgement */}
            <label className="flex items-start gap-3 p-4 border border-emerald-200 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
              <input
                type="checkbox"
                checked={formData.acknowledgeCanCancel}
                onChange={(e) => handleInputChange('acknowledgeCanCancel', e.target.checked)}
                className="form-checkbox mt-1"
              />
              <div className="text-sm">
                <p className="font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                  I can cancel this deletion request anytime before the scheduled date
                </p>
                <p className="text-emerald-800 dark:text-emerald-200">
                  Cancel through your dashboard or by contacting support
                </p>
              </div>
            </label>

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
                  All my data will be permanently deleted when the scheduled date arrives
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Projects, photos, progress, and all account data will be permanently removed
                </p>
              </div>
            </label>
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
                  {errors.acknowledgeScheduled && <li>• Acknowledge scheduled deletion</li>}
                  {errors.acknowledgeCanCancel && <li>• Acknowledge cancellation option</li>}
                  {errors.acknowledgeDataLoss && <li>• Acknowledge data loss</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Final Warning */}
      <div className="card-base border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <div className="card-padding-lg">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
            <div className="text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-2">Confirmation</p>
              <p className="text-sm">
                Your account will be automatically deleted on {subscriptionExpiryDate?.toLocaleDateString()}.
                You can cancel this anytime before then.
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
          onClick={handleScheduleDeletion}
          disabled={isScheduling}
          className="btn-primary btn-md flex items-center gap-2"
        >
          {isScheduling ? (
            <div className="loading-spinner"></div>
          ) : (
            <Clock className="w-5 h-5" />
          )}
          {isScheduling ? 'Scheduling...' : 'Schedule Deletion'}
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

export default DeletionScheduling;