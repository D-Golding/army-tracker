// components/user/UserSecuritySettings.jsx - Security Settings for User Dashboard
import React, { useState } from 'react';
import {
  Shield,
  Key,
  Mail,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PasswordReset from '../auth/PasswordReset';

const UserSecuritySettings = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handlePasswordResetSuccess = (email) => {
    setShowPasswordReset(false);
    setSuccess(`Password reset link sent to ${email}`);
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    // This would require re-authentication in a real implementation
    setError('Email change functionality requires additional security verification. Please contact support.');
  };

  const securityInfo = [
    {
      title: 'Account Created',
      value: currentUser?.metadata?.creationTime ?
        new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown',
      icon: Clock,
      type: 'info'
    },
    {
      title: 'Last Sign In',
      value: currentUser?.metadata?.lastSignInTime ?
        new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : 'Unknown',
      icon: Shield,
      type: 'info'
    },
    {
      title: 'Email Verified',
      value: currentUser?.emailVerified ? 'Yes' : 'No',
      icon: currentUser?.emailVerified ? Check : AlertTriangle,
      type: currentUser?.emailVerified ? 'success' : 'warning'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Security Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account security and authentication
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Security Information */}
      <div className="card-base card-padding">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {securityInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 ${
                    info.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                    info.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{info.title}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{info.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Password Management */}
      <div className="card-base">
        <div className="card-padding-sm border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Password Management
            </h3>
          </div>
        </div>

        <div className="card-padding">
          {!showPasswordReset ? (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Password
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last changed: Unknown
                </p>
              </div>
              <button
                onClick={() => setShowPasswordReset(true)}
                className="btn-secondary btn-md"
              >
                Reset Password
              </button>
            </div>
          ) : (
            <div>
              <PasswordReset
                onBack={() => setShowPasswordReset(false)}
                onSuccess={handlePasswordResetSuccess}
                variant="inline"
                title="Reset Your Password"
                description="We'll send a password reset link to your current email address."
              />
            </div>
          )}
        </div>
      </div>

      {/* Email Management */}
      <div className="card-base">
        <div className="card-padding-sm border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Email Settings
            </h3>
          </div>
        </div>

        <div className="card-padding">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Email Address
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentUser?.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentUser?.emailVerified ? (
                <span className="badge-secondary flex items-center gap-1">
                  <Check size={14} />
                  Verified
                </span>
              ) : (
                <span className="badge-warning flex items-center gap-1">
                  <AlertTriangle size={14} />
                  Unverified
                </span>
              )}
            </div>
          </div>

          {!currentUser?.emailVerified && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Email Not Verified
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    Please verify your email address to ensure account security and receive important notifications.
                  </p>
                  <button className="btn-warning btn-sm">
                    Send Verification Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Change Email (placeholder for future enhancement) */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              To change your email address, please contact our support team for security verification.
            </p>
            <a
              href="/support"
              target="_blank"
              className="btn-secondary btn-sm"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication (Future Feature) */}
      <div className="card-base">
        <div className="card-padding-sm border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h3>
          </div>
        </div>

        <div className="card-padding">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                2FA Status
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Not enabled
              </p>
            </div>
            <button
              disabled
              className="btn-tertiary btn-md opacity-50 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Two-factor authentication will be available in a future update to provide additional security for your account.
            </p>
          </div>
        </div>
      </div>

      {/* Security Tips */}
      <div className="card-base card-padding">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Security Tips
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <p>Use a strong, unique password that you don't use on other websites</p>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <p>Keep your email address verified to ensure you can recover your account</p>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p>Never share your password with anyone, even Tabletop Tactica support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSecuritySettings;