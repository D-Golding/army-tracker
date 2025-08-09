// components/auth/PasswordReset.jsx - Reusable Password Reset Component
import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PasswordReset = ({
  onBack = null,
  onSuccess = null,
  variant = 'standalone', // 'standalone' | 'modal' | 'inline'
  title = 'Reset Your Password',
  description = 'Enter your email address and we\'ll send you a link to reset your password.'
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { resetPassword, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    clearError();

    try {
      await resetPassword(email);
      setSuccess(true);
      onSuccess?.(email);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send reset email. Please check your email address and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setSuccess(false);
    setError('');
    setEmail('');
    onBack?.();
  };

  // Success state
  if (success) {
    return (
      <div className={`space-y-6 ${variant === 'modal' ? '' : 'text-center'}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            What to do next:
          </h3>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>1. Check your email inbox (and spam folder)</li>
            <li>2. Click the reset link in the email</li>
            <li>3. Enter your new password</li>
            <li>4. Sign in with your new password</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGoBack}
            className="btn-secondary flex-1"
          >
            Try Different Email
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="btn-primary flex-1"
            >
              Back to Sign In
            </button>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </p>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="space-y-6">
      <div className={variant === 'modal' ? '' : 'text-center'}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="form-input pl-10"
              disabled={loading}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <div className="loading-spinner" />
              Sending Reset Link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      {onBack && (
        <div className="text-center">
          <button
            onClick={onBack}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default PasswordReset;