// components/dashboard/Profile/DeletionConfirmation.jsx - Immediate Deletion Confirmation Process
import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  X,
  Eye,
  EyeOff,
  Clock,
  Trash2,
  Shield,
  Mail
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const DeletionConfirmation = ({
  type,
  onBack,
  onProceed,
  hasActiveSubscription,
  subscriptionExpiryDate
}) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    password: '',
    confirmationText: '',
    dataRetention: '30days', // '30days' or 'immediate'
    acknowledgeSubscription: false,
    acknowledgeDataLoss: false,
    acknowledgeNoRecovery: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const totalSteps = 4;
  const requiredConfirmationText = 'DELETE MY ACCOUNT';

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
        if (!formData.acknowledgeDataLoss) {
          newErrors.acknowledgeDataLoss = 'You must acknowledge data loss';
        }
        if (!formData.acknowledgeNoRecovery) {
          newErrors.acknowledgeNoRecovery = 'You must acknowledge no recovery is possible';
        }
        if (hasActiveSubscription && !formData.acknowledgeSubscription) {
          newErrors.acknowledgeSubscription = 'You must acknowledge subscription forfeiture';
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
          type: 'immediate',
          password: formData.password,
          dataRetention: formData.dataRetention,
          confirmationText: formData.confirmationText,
          acknowledgements: {
            dataLoss: formData.acknowledgeDataLoss,
            noRecovery: formData.acknowledgeNoRecovery,
            subscription: formData.acknowledgeSubscription
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
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Verify Your Identity
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your password to confirm this is really you
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

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">Security Check</p>
                  <p>We require password verification for all account deletions to prevent unauthorised access.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Understand the Consequences
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please acknowledge that you understand what will happen
              </p>
            </div>

            <div className="space-y-4">
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
                    I understand all my data will be permanently deleted
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Including projects, photos, progress, settings, and all personal information
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
                    I understand this action cannot be undone
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    No backup exists and customer support cannot recover deleted accounts
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
                      I understand I will forfeit my remaining subscription
                    </p>
                    <p className="text-amber-800 dark:text-amber-200">
                      Subscription expires {subscriptionExpiryDate?.toLocaleDateString()}.
                      No refund will be provided for unused time.
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Error Messages */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium mb-2">Please acknowledge all items to continue:</p>
                  <ul className="space-y-1">
                    {errors.acknowledgeDataLoss && <li>• Data loss acknowledgement required</li>}
                    {errors.acknowledgeNoRecovery && <li>• No recovery acknowledgement required</li>}
                    {errors.acknowledgeSubscription && <li>• Subscription forfeiture acknowledgement required</li>}
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
              <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Choose Data Retention Option
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                How quickly should we delete your data?
              </p>
            </div>

            {/* Data Retention Options */}
            <div className="space-y-4">
              <div
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.dataRetention === '30days'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => handleInputChange('dataRetention', '30days')}
              >
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Keep Data for 30 Days (Recommended)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Account is deactivated immediately, but data is kept for 30 days in case you change your mind.
                    </p>
                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <div>• Account access disabled immediately</div>
                      <div>• Data permanently deleted after 30 days</div>
                      <div>• Can contact support to recover within 30 days</div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.dataRetention === 'immediate'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => handleInputChange('dataRetention', 'immediate')}
              >
                <div className="flex items-start gap-3">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Delete Everything Immediately
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      All data is permanently deleted right away with no recovery period.
                    </p>
                    <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      <div>• Account and data deleted immediately</div>
                      <div>• No recovery period or backup</div>
                      <div>• Cannot be undone under any circumstances</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Text Input */}
            <div>
              <label className="form-label">
                Type <span className="font-mono font-bold text-red-600">{requiredConfirmationText}</span> to confirm
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
                This confirms you want to proceed with account deletion
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Final Review
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Review your deletion request before proceeding
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Deletion Summary
              </h4>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Deletion Type:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Immediate</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Data Retention:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.dataRetention === '30days' ? '30 Day Grace Period' : 'Delete Immediately'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account Access:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">Disabled Immediately</span>
                </div>

                {hasActiveSubscription && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subscription:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">Forfeited (No Refund)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="text-sm text-red-800 dark:text-red-200">
                <p className="font-medium mb-2">⚠️ Final Warning</p>
                <p>
                  Once you proceed, an email will be sent to <strong>{currentUser?.email}</strong> to
                  confirm this deletion. After email confirmation, this action cannot be undone.
                </p>
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
            Account Deletion Process
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
                  ? 'bg-red-500'
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
          className="btn-danger btn-md flex items-center gap-2"
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

export default DeletionConfirmation;