// components/auth/PrivacyConsent.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Database, Users, CheckCircle, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PrivacyConsent = ({ userAge, onComplete, onDecline }) => {
  const { cancelOnboarding } = useAuth();
  const navigate = useNavigate();

  const [consents, setConsents] = useState({
    essential: true, // Always required, pre-checked
    analytics: true, // Default to checked - user unchecks if they don't want
    marketing: userAge >= 18, // Only available for adults, default checked
    community: userAge >= 18 // Only available for adults, default checked
  });
  const [loading, setLoading] = useState(false);

  const isMinor = userAge < 18;

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

  const handleConsentChange = (type, value) => {
    if (type === 'essential') return; // Cannot be unchecked

    setConsents(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const consentRecord = {
        essential: true, // Always required
        analytics: consents.analytics,
        marketing: consents.marketing && !isMinor, // Minors cannot consent to marketing
        community: consents.community && userAge >= 18, // Only adults get community features
        consentedAt: new Date().toISOString(),
        userAge: userAge,
        ipAddress: null, // Would be set server-side in production
        userAgent: navigator.userAgent,
        version: '1.0' // Consent version for future updates
      };

      await onComplete(consentRecord);
    } catch (error) {
      console.error('Privacy consent error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
          <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Privacy & Data Consent
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          We respect your privacy. Review your preferences below and uncheck anything you don't want.
        </p>
        {isMinor && (
          <div className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium">
            Enhanced privacy protections apply to users under 18
          </div>
        )}
      </div>

      {/* Data Processing Categories */}
      <div className="space-y-4">
        {/* Essential - Always Required */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Essential Services
                </h3>
                <span className="badge-blue text-xs">Required</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Account creation, authentication, paint tracking, and core app functionality.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Legal basis: Contract performance and legitimate interest
              </p>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <input
                type="checkbox"
                id="analytics"
                checked={consents.analytics}
                onChange={(e) => handleConsentChange('analytics', e.target.checked)}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <label htmlFor="analytics" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                  Analytics & Performance
                </label>
                <span className="badge-secondary text-xs">Optional</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Help us improve the app by sharing anonymous usage data and performance metrics.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Legal basis: Consent • Data: Anonymous usage patterns, device info
              </p>
            </div>
          </div>
        </div>

        {/* Marketing - Not available for minors */}
        {!isMinor && (
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={consents.marketing}
                  onChange={(e) => handleConsentChange('marketing', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <label htmlFor="marketing" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                    Marketing Communications
                  </label>
                  <span className="badge-secondary text-xs">Optional</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Receive emails about new features, community highlights, and special offers.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Legal basis: Consent • You can unsubscribe anytime
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Community Features - Adults only */}
        {userAge >= 18 && (
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <input
                  type="checkbox"
                  id="community"
                  checked={consents.community}
                  onChange={(e) => handleConsentChange('community', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <label htmlFor="community" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                    Community Features
                  </label>
                  <span className="badge-orange text-xs">Adults Only</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Access messaging, photo sharing, and social features. Required for community participation.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Legal basis: Consent • Includes content moderation and safety measures
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Minor Privacy Notice */}
        {isMinor && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                  Enhanced Privacy Protection
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  As someone under 18, you have enhanced privacy protections. Marketing communications and full community features are not available to protect your privacy.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legal Links */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a
            href="/privacy-policy"
            target="_blank"
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Privacy Policy <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="/terms-of-service"
            target="_blank"
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Terms of Service <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="/cookie-policy"
            target="_blank"
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Cookie Policy <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="btn-secondary w-full"
        >
          <X size={16} />
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <div className="loading-spinner" />
              Processing...
            </>
          ) : (
            'Accept & Continue'
          )}
        </button>
      </div>

      {/* Your Rights Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p className="mb-1">
          You can change these preferences anytime in your account settings.
        </p>
        <p>
          You have rights including access, rectification, erasure, and data portability under GDPR.
        </p>
      </div>
    </div>
  );
};

export default PrivacyConsent;