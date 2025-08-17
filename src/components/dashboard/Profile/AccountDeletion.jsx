// components/dashboard/Profile/AccountDeletion.jsx - Simplified without 30-day option
import React, { useState } from 'react';
import { AlertTriangle, Trash2, Calendar, Shield, Mail } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import DeletionConfirmation from './DeletionConfirmation';

const AccountDeletion = () => {
  const { userProfile } = useAuth();
  const [deletionStep, setDeletionStep] = useState('overview');
  const [selectedOption, setSelectedOption] = useState(null);

  // Check if user has active subscription
  const hasActiveSubscription = userProfile?.subscription?.tier !== 'free' &&
    userProfile?.subscription?.expiresAt &&
    new Date(userProfile.subscription.expiresAt.seconds * 1000) > new Date();

  // Get subscription expiry date
  const subscriptionExpiryDate = userProfile?.subscription?.expiresAt
    ? new Date(userProfile.subscription.expiresAt.seconds * 1000)
    : null;

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setDeletionStep('confirmation');
  };

  const handleBackToOverview = () => {
    setDeletionStep('overview');
    setSelectedOption(null);
  };

  if (deletionStep === 'confirmation') {
    return (
      <DeletionConfirmation
        type={selectedOption}
        onBack={handleBackToOverview}
        hasActiveSubscription={hasActiveSubscription}
        subscriptionExpiryDate={subscriptionExpiryDate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning Header */}
      <div className="card-base border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <div className="card-padding-lg">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                Account Deletion
              </h3>
              <div className="text-red-800 dark:text-red-200 space-y-2">
                <p className="font-semibold">
                  ⚠️ This action affects ALL of your data including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>All projects and paint collections</li>
                  <li>All uploaded photos and images</li>
                  <li>All progress and achievement data</li>
                  <li>All account preferences and settings</li>
                  <li>Access to any remaining subscription benefits</li>
                  <li>Your login credentials and account access</li>
                </ul>
                <p className="font-semibold text-sm">
                  Choose your deletion option carefully
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Account Status */}
      <div className="card-base card-padding-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Current Account Status
        </h4>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Account Type:</span>
            <span className="font-medium text-gray-900 dark:text-white capitalize">
              {userProfile?.subscription?.tier || 'Free'} Tier
            </span>
          </div>

          {hasActiveSubscription && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Subscription Expires:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {subscriptionExpiryDate?.toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Projects Created:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {userProfile?.gamification?.statistics?.projectsCreated || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Deletion Options */}
      <div className="card-base card-padding-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Choose Your Deletion Option
        </h4>

        <div className="space-y-4">
          {/* Option 1: Delete Immediately (Permanent) */}
          <div
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedOption === 'immediate-permanent'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500'
            }`}
            onClick={() => setSelectedOption('immediate-permanent')}
          >
            <div className="flex items-start gap-3">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Immediately (Permanent)
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Your account and all data will be permanently deleted right now. No recovery possible.
                </p>

                <div className="space-y-2">
                  <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <div>• Account and data deleted immediately</div>
                    <div>• Login credentials permanently removed</div>
                    <div>• Cannot be recovered under any circumstances</div>
                    <div>• No grace period or backup</div>
                  </div>

                  {hasActiveSubscription && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span><strong>Warning:</strong> Your subscription will be cancelled immediately with no refund for unused time</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: Schedule Deletion at Subscription End */}
          {hasActiveSubscription && (
            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedOption === 'scheduled'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-500'
              }`}
              onClick={() => setSelectedOption('scheduled')}
            >
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Delete When Subscription Expires
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Keep full access until {subscriptionExpiryDate?.toLocaleDateString()}, then account will be automatically deleted.
                  </p>

                  <div className="space-y-2">
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                      <div>• Keep full access until subscription expires</div>
                      <div>• Use all remaining subscription benefits</div>
                      <div>• Can cancel deletion request anytime before expiry</div>
                      <div>• Automatic complete deletion when subscription ends</div>
                      <div>• Login credentials will be permanently removed</div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                      <Shield className="w-4 h-4 flex-shrink-0" />
                      <span><strong>Benefit:</strong> No early cancellation - use your full subscription value</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Continue Button */}
        {selectedOption && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleSelectOption(selectedOption)}
              className={`btn-md flex items-center gap-2 ${
                selectedOption === 'immediate-permanent' ? 'btn-danger' : 'btn-secondary'
              }`}
            >
              <Mail className="w-5 h-5" />
              Continue with {
                selectedOption === 'immediate-permanent' ? 'Permanent Deletion' : 'Scheduled Deletion'
              }
            </button>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Enter your password and confirm your choice on the next screen
            </p>
          </div>
        )}
      </div>

      {/* Alternative Actions */}
      <div className="card-base card-padding-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Alternative Actions
        </h4>

        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Before deleting your account, consider these alternatives:
          </p>

          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Export Data:</strong> Download your projects and photos before deletion</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Contact Support:</strong> Resolve any issues that are prompting deletion</span>
            </li>
            {hasActiveSubscription && (
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>Downgrade to Free:</strong> Keep your data but remove subscription features</span>
              </li>
            )}
          </ul>
        </div>

        <div className="flex gap-3 mt-4">
          <button className="btn-outline btn-sm">
            Export My Data
          </button>
          <button className="btn-outline btn-sm">
            Contact Support
          </button>
          {hasActiveSubscription && (
            <button className="btn-outline btn-sm">
              Downgrade to Free
            </button>
          )}
        </div>
      </div>

      {/* Legal Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
        <p className="mb-2">
          <strong>Legal Notice:</strong> Account deletion terms:
        </p>
        <ul className="space-y-1 ml-4">
          <li>• Immediate deletion removes all data and login access permanently with no refund</li>
          <li>• Scheduled deletion allows full use of remaining subscription time</li>
          <li>• Both deletion types permanently remove login credentials and cannot be recovered</li>
          <li>• Scheduled deletion can be cancelled anytime before the scheduled date</li>
          <li>• All deletion processes comply with GDPR "Right to be Forgotten" regulations</li>
        </ul>
      </div>
    </div>
  );
};

export default AccountDeletion;