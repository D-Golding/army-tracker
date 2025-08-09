// components/dashboard/Profile/DeletionScheduling.jsx - Schedule Deletion at Subscription End
import React, { useState } from 'react';
import {
  Clock,
  ArrowLeft,
  Check,
  X,
  Eye,
  EyeOff,
  Calendar,
  Shield,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const DeletionScheduling = ({ onBack, onProceed, subscriptionExpiryDate }) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    password: '',
    confirmationText: '',
    acknowledgeScheduled: false,
    acknowledgeCanCancel: false,
    acknowledgeDataLoss: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const totalSteps = 3;
  const requiredConfirmationText = 'SCHEDULE DELETION';

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

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.password.trim()) {
          newErrors.password = 'Password is required to proceed';
        }
        break;

      case 2:
        if (!formData.acknowledgeScheduled) {
          newErrors.acknowledgeScheduled = 'You must acknowledge the scheduled deletion';
        }
        if (!formData.acknowledgeCanCancel) {
          newErrors.acknowledgeCanCancel = 'You must acknowledge you can cancel anytime';
        }
        if (!formData.acknowledgeDataLoss) {
          newErrors.acknowledgeDataLoss = 'You must acknowledge eventual data loss';
        }
        break;

      case 3:
        if (formData.confirmationText !== requiredConfirmationText) {
          newErrors.confirmationText = `You must type exactly: ${requiredConfirmationText}`;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - proceed to email verification
        onProceed({
          type: 'scheduled',
          password: formData.password,
          scheduledDate: subscriptionExpiryDate,
          confirmationText: formData.confirmationText,
          acknowledgements: {
            scheduled: formData.acknowledgeScheduled,
            canCancel: formData.acknowledgeCanCancel,
            dataLoss: formData.acknowledgeDataLoss
          }
        });
      }
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Verify Your Identity
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your password to schedule account deletion
              </p>
            </div>

            <div>
              <label className="form-label">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`form-input ${errors.password ? 'border-red-300 dark:border-red-600' : ''}`}
                  placeholder="Enter your password"
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

            {/* Scheduling Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Scheduled Deletion Date</p>
                  <p className="mb-2">
                    <strong>{subscriptionExpiryDate?.toLocaleDateString()}</strong>
                    ({daysUntilDeletion} days from now)
                  </p>
                  <p>Your account will be automatically deleted when your subscription expires, unless you cancel this request.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Scheduled Deletion Terms
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please acknowledge that you understand the scheduled deletion process
              </p>
            </div>

            <div className="space-y-4">
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
                    I understand my account will be deleted on {subscriptionExpiryDate?.toLocaleDateString()}
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
                    I understand I can cancel this deletion request anytime before the scheduled date
                  </p>
                  <p className="text-emerald-800 dark:text-emerald-200">
                    You can cancel scheduled deletion through your dashboard or by contacting support
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
                    I understand all my data will be permanently deleted when the scheduled date arrives
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Projects, photos, progress, and all account data will be permanently removed
                  </p>
                </div>
              </label>
            </div>

            {/* Error Messages */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium mb-2">Please acknowledge all items to continue:</p>
                  <ul className="space-y-1">
                    {errors.acknowledgeScheduled && <li>• Scheduled deletion acknowledgement required</li>}
                    {errors.acknowledgeCanCancel && <li>• Cancellation option acknowledgement required</li>}
                    {errors.acknowledgeDataLoss && <li>• Data loss acknowledgement required</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Confirm Scheduled Deletion
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Final confirmation for scheduled account deletion
              </p>
            </div>

            {/* Schedule Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Deletion Schedule Summary
              </h4>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Deletion Type:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Scheduled</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Scheduled Date:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {subscriptionExpiryDate?.toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Days Remaining:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{daysUntilDeletion} days</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Can Cancel:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Yes, anytime before deletion</span>
                </div>
              </div>
            </div>

            {/* Benefits of Scheduled Deletion */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
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

            {/* Confirmation Text Input */}
            <div>
              <label className="form-label">
                Type <span className="font-mono font-bold text-blue-600">{requiredConfirmationText}</span> to confirm
              </label>
              <input
                type="text"
                value={formData.confirmationText}
                onChange={(e) => handleInputChange('confirmationText', e.target.value)}
                className={`form-input font-mono ${errors.confirmationText ? 'border-red-300 dark:border-red-600' : ''}`}
                placeholder={requiredConfirmationText}
              />
              {errors.confirmationText && (
                <p className="form-error">{errors.confirmationText}</p>
              )}
              <p className="form-help">
                This confirms you want to schedule your account for deletion
              </p>
            </div>

            {/* Final Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">Important Reminder</p>
                  <p>
                    An email will be sent to <strong>{currentUser?.email}</strong> to confirm this scheduled deletion.
                    You can cancel this request anytime before {subscriptionExpiryDate?.toLocaleDateString()}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="card-base card-padding-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Schedule Account Deletion
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        <div className="flex gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                i + 1 <= currentStep
                  ? 'bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card-base card-padding-lg">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={handlePreviousStep}
          className="btn-outline btn-md flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          {currentStep === 1 ? 'Back to Overview' : 'Previous'}
        </button>

        <button
          onClick={handleNextStep}
          className="btn-primary btn-md flex items-center gap-2"
        >
          {currentStep === totalSteps ? (
            <>
              <Mail className="w-5 h-5" />
              Send Email Confirmation
            </>
          ) : (
            <>
              Continue
              <Check className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DeletionScheduling;