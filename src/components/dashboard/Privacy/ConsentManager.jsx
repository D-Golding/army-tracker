// components/dashboard/Privacy/ConsentManager.jsx - Privacy Consent Management with Audit Trail
import React, { useState } from 'react';
import { Shield, Check, X, AlertTriangle, Clock, Eye, Database, Users, History } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../../../firebase';
import { showConfirmation } from '../../NotificationManager';

const ConsentManager = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  const isMinor = userProfile?.userCategory === 'minor';
  const userAge = userProfile?.age || 0;

  // Get current consent status
  const currentConsents = userProfile?.privacyConsents || {};

  // Define consent types with metadata
  const consentTypes = [
    {
      id: 'essential',
      name: 'Essential Services',
      description: 'Account functionality, authentication, and core app features',
      icon: Database,
      required: true,
      legalBasis: 'Contract performance and legitimate interest',
      canModify: false,
      availableFor: 'all'
    },
    {
      id: 'analytics',
      name: 'Analytics & Performance',
      description: 'Anonymous usage data to improve app performance and user experience',
      icon: Eye,
      required: false,
      legalBasis: 'Consent',
      canModify: true,
      availableFor: 'all'
    },
    {
      id: 'marketing',
      name: 'Marketing Communications',
      description: 'Emails about new features, special offers, and product updates',
      icon: Users,
      required: false,
      legalBasis: 'Consent',
      canModify: true,
      availableFor: 'adults'
    },
    {
      id: 'community',
      name: 'Community Features',
      description: 'Social features, messaging, photo sharing, and community participation',
      icon: Users,
      required: false,
      legalBasis: 'Consent',
      canModify: true,
      availableFor: 'adults'
    }
  ];

  // Filter consent types based on user age
  const availableConsents = consentTypes.filter(consent => {
    if (consent.availableFor === 'adults' && isMinor) return false;
    return true;
  });

  // Handle consent change
  const handleConsentChange = async (consentId, newValue) => {
    const consentType = consentTypes.find(c => c.id === consentId);

    if (!consentType?.canModify) return;

    // Show confirmation for disabling important features
    if (!newValue && (consentId === 'analytics' || consentId === 'community')) {
      const proceed = await showConfirmation({
        title: `Disable ${consentType.name}?`,
        message: `Are you sure you want to disable ${consentType.name.toLowerCase()}? This may affect your app experience.`,
        confirmText: 'Disable',
        cancelText: 'Keep Enabled',
        type: 'warning'
      });

      if (!proceed) return;
    }

    setIsUpdating(true);
    setErrors({});

    try {
      const userId = userProfile.uid;
      const userRef = doc(db, 'users', userId);

      // Create audit trail entry
      const auditEntry = {
        consentType: consentId,
        previousValue: currentConsents[consentId] || false,
        newValue: newValue,
        changedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ipAddress: null, // Would be set server-side in production
        version: currentConsents.version || '1.0'
      };

      // Update consent record
      const updatedConsents = {
        ...currentConsents,
        [consentId]: newValue,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };

      // Database updates
      const updates = {
        privacyConsents: updatedConsents,
        privacyConsentHistory: arrayUnion(auditEntry),
        updatedAt: serverTimestamp()
      };

      // Handle community access specifically
      if (consentId === 'community') {
        updates.communityAccess = newValue && !isMinor;
      }

      await updateDoc(userRef, updates);

      // Update local state
      await updateUserProfile({
        privacyConsents: updatedConsents,
        ...(consentId === 'community' && { communityAccess: newValue && !isMinor })
      });

      console.log(`✅ Privacy consent updated: ${consentId} = ${newValue}`);

    } catch (error) {
      console.error('Error updating consent:', error);
      setErrors({ [consentId]: 'Failed to update consent. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Get consent status display
  const getConsentStatus = (consentId) => {
    const value = currentConsents[consentId];

    if (value === true) {
      return {
        text: 'Granted',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        icon: Check
      };
    } else {
      return {
        text: 'Declined',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        icon: X
      };
    }
  };

  // Format consent history for display
  const getConsentHistory = () => {
    const history = userProfile?.privacyConsentHistory || [];
    return history.slice(-5).reverse(); // Show last 5 changes, most recent first
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-base card-padding-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Privacy Consent Management
          </h3>

          <button
            onClick={() => setShowAuditTrail(!showAuditTrail)}
            className="btn-outline btn-sm flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            {showAuditTrail ? 'Hide' : 'Show'} History
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Manage how your data is used. You can change these settings anytime.
        </p>

        {/* Age-based notice for minors */}
        {isMinor && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                  Enhanced Privacy Protection
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  As someone under 18, you have enhanced privacy protections. Some data processing options are not available to protect your privacy.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Consent List */}
        <div className="space-y-4">
          {availableConsents.map((consent) => {
            const Icon = consent.icon;
            const status = getConsentStatus(consent.id);
            const StatusIcon = status.icon;
            const isCurrentlyGranted = currentConsents[consent.id] === true;

            return (
              <div key={consent.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {consent.name}
                        </h4>

                        {consent.required && (
                          <span className="badge-blue text-xs">Required</span>
                        )}

                        {!consent.required && (
                          <span className="badge-secondary text-xs">Optional</span>
                        )}

                        {/* Age restriction indicator */}
                        {consent.availableFor === 'adults' && (
                          <span className="badge-warning text-xs">Adults Only</span>
                        )}
                      </div>

                      {/* Status */}
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${status.bg}`}>
                        <StatusIcon className={`w-3 h-3 ${status.color}`} />
                        <span className={`text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {consent.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Legal basis: {consent.legalBasis}
                      </p>

                      {/* Toggle Switch */}
                      {consent.canModify && (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isCurrentlyGranted}
                            onChange={(e) => handleConsentChange(consent.id, e.target.checked)}
                            disabled={isUpdating}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                            {isCurrentlyGranted ? 'Granted' : 'Declined'}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Error display */}
                    {errors[consent.id] && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {errors[consent.id]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Trail */}
      {showAuditTrail && (
        <div className="card-base card-padding-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            Consent History
          </h4>

          <div className="space-y-3">
            {getConsentHistory().length > 0 ? (
              getConsentHistory().map((entry, index) => {
                const consentType = consentTypes.find(c => c.id === entry.consentType);
                const changeDate = new Date(entry.changedAt);

                return (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {consentType?.name || entry.consentType}
                        </span>

                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          changed from
                        </span>

                        <span className={`badge-base text-xs ${
                          entry.previousValue ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30' : 'text-red-700 bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {entry.previousValue ? 'Granted' : 'Declined'}
                        </span>

                        <span className="text-xs text-gray-500 dark:text-gray-400">to</span>

                        <span className={`badge-base text-xs ${
                          entry.newValue ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30' : 'text-red-700 bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {entry.newValue ? 'Granted' : 'Declined'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {changeDate.toLocaleDateString()} at {changeDate.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No consent changes recorded</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal Information */}
      <div className="card-base card-padding-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Your Privacy Rights
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Data Rights</h5>
            <ul className="space-y-1">
              <li>• Access your personal data</li>
              <li>• Correct inaccurate information</li>
              <li>• Request data deletion</li>
              <li>• Download your data</li>
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Contact</h5>
            <ul className="space-y-1">
              <li>• Email: privacy@painttracker.app</li>
              <li>• Data Protection Officer</li>
              <li>• Response within 30 days</li>
              <li>• Free of charge</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Current consent version:</strong> {currentConsents.version || '1.0'} •
            <strong> Last updated:</strong> {
              currentConsents.lastUpdated
                ? new Date(currentConsents.lastUpdated).toLocaleDateString()
                : 'Never'
            } •
            <strong> Initial consent:</strong> {
              currentConsents.consentedAt
                ? new Date(currentConsents.consentedAt).toLocaleDateString()
                : 'Unknown'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentManager;