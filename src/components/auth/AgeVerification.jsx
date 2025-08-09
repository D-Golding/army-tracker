// components/auth/AgeVerification.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Shield, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AgeVerification = ({ onComplete, onUnderAge }) => {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { cancelOnboarding } = useAuth();
  const navigate = useNavigate();

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const handleCancel = async () => {
    try {
      await cancelOnboarding();
      navigate('/');
    } catch (error) {
      console.error('Error canceling onboarding:', error);
      // Still navigate even if cancel fails
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!dateOfBirth) {
      setError('Please enter your date of birth');
      return;
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    // Basic validation
    if (birthDate > today) {
      setError('Date of birth cannot be in the future');
      return;
    }

    if (birthDate.getFullYear() < 1900) {
      setError('Please enter a valid date of birth');
      return;
    }

    setLoading(true);

    try {
      const age = calculateAge(dateOfBirth);

      // Under 13 - COPPA compliance requires blocking
      if (age < 13) {
        setLoading(false);
        onUnderAge();
        return;
      }

      // Determine user category for feature restrictions
      const userCategory = age < 18 ? 'minor' : 'adult';

      // Pass age information to complete the verification
      await onComplete({
        dateOfBirth,
        age,
        userCategory,
        verifiedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Age verification error:', error);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mb-4">
          <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Age Verification Required
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          We need to verify your age to comply with international privacy laws and provide age-appropriate features.
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
              Your Privacy is Protected
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              Your date of birth is only used for age verification and compliance. We follow strict privacy laws including GDPR and COPPA.
            </p>
          </div>
        </div>
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date of Birth
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min="1900-01-01"
              className="form-input pl-10"
              required
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You must be at least 13 years old to create an account
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="btn-secondary flex-1"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !dateOfBirth}
            className="btn-primary flex-1"
          >
            {loading ? (
              <>
                <div className="loading-spinner" />
                Verifying...
              </>
            ) : (
              'Verify Age & Continue'
            )}
          </button>
        </div>
      </form>

      {/* Legal Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-2">
        <p>
          By continuing, you confirm that the information provided is accurate and that you understand our age-based feature restrictions.
        </p>
        <p>
          Users under 18 have limited community features for safety and compliance with international privacy laws.
        </p>
      </div>
    </div>
  );
};

// Component for users under 13
export const UnderAgeNotice = ({ onGoBack }) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
        <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Account Creation Not Available
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Unfortunately, you must be at least 13 years old to create an account. This is required by international privacy laws including COPPA.
      </p>
    </div>

    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
        Why do we have this requirement?
      </h3>
      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
        <li>• COPPA (Children's Online Privacy Protection Act) compliance</li>
        <li>• GDPR (General Data Protection Regulation) requirements</li>
        <li>• International child safety standards</li>
      </ul>
    </div>

    <div className="flex gap-3">
      <button
        onClick={onGoBack}
        className="btn-secondary flex-1"
      >
        Go Back
      </button>
      <a
        href="/"
        className="btn-primary flex-1 text-center"
      >
        Visit Homepage
      </a>
    </div>
  </div>
);

export default AgeVerification;