// components/dashboard/Profile/PasswordManager.jsx - Password Change and Security Settings
import React, { useState } from 'react';
import { Eye, EyeOff, Check, X, Shield, AlertTriangle, Lock } from 'lucide-react';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { useAuth } from '../../../contexts/AuthContext';

const PasswordManager = () => {
  const { currentUser } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Password strength requirements
  const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/,
    hasNumber: /\d/,
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    const checks = {
      minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
      hasUppercase: PASSWORD_REQUIREMENTS.hasUppercase.test(password),
      hasLowercase: PASSWORD_REQUIREMENTS.hasLowercase.test(password),
      hasNumber: PASSWORD_REQUIREMENTS.hasNumber.test(password),
      hasSpecial: PASSWORD_REQUIREMENTS.hasSpecial.test(password)
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const strength = passedChecks / Object.keys(checks).length;

    return {
      checks,
      strength,
      level: strength < 0.4 ? 'weak' : strength < 0.8 ? 'medium' : 'strong'
    };
  };

  // Get password strength for display
  const passwordStrength = formData.newPassword ? checkPasswordStrength(formData.newPassword) : null;

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

    // Clear success message when editing
    setSuccessMessage('');
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Current password validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else {
      const strength = checkPasswordStrength(formData.newPassword);
      if (strength.strength < 0.6) {
        newErrors.newPassword = 'Password does not meet security requirements';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check if new password is different from current
    if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Change password
  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        formData.currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, formData.newPassword);

      // Clear form and show success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      setSuccessMessage('Password updated successfully');

    } catch (error) {
      console.error('Password change error:', error);

      // Handle specific Firebase errors
      if (error.code === 'auth/wrong-password') {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else if (error.code === 'auth/weak-password') {
        setErrors({ newPassword: 'Password is too weak' });
      } else if (error.code === 'auth/requires-recent-login') {
        setErrors({ general: 'Please sign out and sign back in before changing your password' });
      } else {
        setErrors({ general: 'Failed to update password. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel password change
  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setIsChangingPassword(false);
    setSuccessMessage('');
  };

  return (
    <div className="card-base card-padding-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Password & Security
      </h3>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
          </div>
        </div>
      )}

      {!isChangingPassword ? (
        /* Password Overview */
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Password Protection</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: Unknown
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsChangingPassword(true)}
            className="btn-primary btn-sm flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Change Password
          </button>

          {/* Security Recommendations */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Security Recommendations</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Use a unique password for this account</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Include uppercase, lowercase, numbers, and symbols</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Make it at least 8 characters long</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Consider using a password manager</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        /* Password Change Form */
        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="form-label">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className={`form-input ${errors.currentPassword ? 'border-red-300 dark:border-red-600' : ''}`}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="form-error">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="form-label">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`form-input ${errors.newPassword ? 'border-red-300 dark:border-red-600' : ''}`}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="form-error">{errors.newPassword}</p>
            )}

            {/* Password Strength Indicator */}
            {formData.newPassword && passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength.level === 'weak' ? 'bg-red-500 w-1/3' :
                        passwordStrength.level === 'medium' ? 'bg-amber-500 w-2/3' :
                        'bg-emerald-500 w-full'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength.level === 'weak' ? 'text-red-600 dark:text-red-400' :
                    passwordStrength.level === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                  </span>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {Object.entries(passwordStrength.checks).map(([check, passed]) => (
                    <div key={check} className="flex items-center gap-2">
                      {passed ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <X className="w-3 h-3 text-red-500" />
                      )}
                      <span className={passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {check === 'minLength' && '8+ characters'}
                        {check === 'hasUppercase' && 'Uppercase letter'}
                        {check === 'hasLowercase' && 'Lowercase letter'}
                        {check === 'hasNumber' && 'Number'}
                        {check === 'hasSpecial' && 'Special character'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="form-label">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`form-input ${errors.confirmPassword ? 'border-red-300 dark:border-red-600' : ''}`}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="btn-primary btn-sm flex items-center gap-2"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>

            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="btn-outline btn-sm flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordManager;