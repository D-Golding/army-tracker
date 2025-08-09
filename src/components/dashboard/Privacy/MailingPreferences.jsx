// components/dashboard/Privacy/MailingPreferences.jsx - Granular Email and Notification Controls
import React, { useState } from 'react';
import { Mail, Bell, Trophy, Zap, Users, TrendingUp, AlertTriangle, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';

const MailingPreferences = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const isMinor = userProfile?.userCategory === 'minor';
  const hasMarketingConsent = userProfile?.privacyConsents?.marketing === true;

  // Get current preferences
  const currentPreferences = {
    // Email preferences
    emailWeeklySummary: userProfile?.gamification?.preferences?.emailWeeklySummary ?? true,
    emailAchievements: userProfile?.gamification?.preferences?.emailAchievements ?? true,
    emailStreaks: userProfile?.gamification?.preferences?.emailStreaks ?? true,
    emailSecurityAlerts: userProfile?.preferences?.emailSecurityAlerts ?? true,
    emailMarketingFeatures: userProfile?.preferences?.emailMarketingFeatures ?? false,
    emailMarketingOffers: userProfile?.preferences?.emailMarketingOffers ?? false,
    emailCommunityDigest: userProfile?.preferences?.emailCommunityDigest ?? false,

    // In-app notification preferences
    showAchievementNotifications: userProfile?.gamification?.preferences?.showAchievementNotifications ?? true,
    showStreakNotifications: userProfile?.gamification?.preferences?.showStreakNotifications ?? true,
    showProgressReminders: userProfile?.preferences?.showProgressReminders ?? true,
    showCommunityNotifications: userProfile?.preferences?.showCommunityNotifications ?? false,

    // Frequency preferences
    summaryFrequency: userProfile?.preferences?.summaryFrequency || 'weekly', // weekly, monthly, never
    reminderFrequency: userProfile?.preferences?.reminderFrequency || 'weekly' // daily, weekly, monthly, never
  };

  // Define notification categories
  const emailCategories = [
    {
      id: 'essential',
      name: 'Essential Emails',
      description: 'Security alerts, account changes, and important updates',
      icon: AlertTriangle,
      required: true,
      availableFor: 'all',
      items: [
        {
          key: 'emailSecurityAlerts',
          name: 'Security Alerts',
          description: 'Login attempts, password changes, account security',
          required: true
        }
      ]
    },
    {
      id: 'progress',
      name: 'Progress & Activity',
      description: 'Achievements, streaks, and progress summaries',
      icon: Trophy,
      required: false,
      availableFor: 'all',
      items: [
        {
          key: 'emailWeeklySummary',
          name: 'Weekly Summary',
          description: 'Your weekly progress, completed projects, and achievements'
        },
        {
          key: 'emailAchievements',
          name: 'Achievement Unlocks',
          description: 'Email notifications when you unlock new badges'
        },
        {
          key: 'emailStreaks',
          name: 'Streak Milestones',
          description: 'Celebrate your consistency streaks via email'
        }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing & Features',
      description: 'New features, special offers, and product updates',
      icon: TrendingUp,
      required: false,
      availableFor: 'adults',
      requiresConsent: true,
      items: [
        {
          key: 'emailMarketingFeatures',
          name: 'Feature Announcements',
          description: 'New app features and major updates'
        },
        {
          key: 'emailMarketingOffers',
          name: 'Special Offers',
          description: 'Discounts, promotions, and premium features'
        }
      ]
    },
    {
      id: 'community',
      name: 'Community',
      description: 'Community highlights, social features, and interactions',
      icon: Users,
      required: false,
      availableFor: 'adults',
      requiresCommunityAccess: true,
      items: [
        {
          key: 'emailCommunityDigest',
          name: 'Community Digest',
          description: 'Weekly highlights from the paint modeling community'
        }
      ]
    }
  ];

  const notificationCategories = [
    {
      id: 'in_app_progress',
      name: 'Progress Notifications',
      description: 'In-app toast notifications for achievements and progress',
      icon: Bell,
      items: [
        {
          key: 'showAchievementNotifications',
          name: 'Achievement Notifications',
          description: 'Show pop-up when you unlock new achievements'
        },
        {
          key: 'showStreakNotifications',
          name: 'Streak Notifications',
          description: 'Show pop-up for streak milestones'
        },
        {
          key: 'showProgressReminders',
          name: 'Progress Reminders',
          description: 'Gentle reminders to keep working on projects'
        }
      ]
    },
    {
      id: 'in_app_social',
      name: 'Social Notifications',
      description: 'Community interactions and social features',
      icon: Users,
      availableFor: 'adults',
      requiresCommunityAccess: true,
      items: [
        {
          key: 'showCommunityNotifications',
          name: 'Community Interactions',
          description: 'Comments, likes, and community activity'
        }
      ]
    }
  ];

  // Handle preference change
  const handlePreferenceChange = async (key, value) => {
    setIsUpdating(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const userId = userProfile.uid;
      const userRef = doc(db, 'users', userId);

      let updates = {
        updatedAt: serverTimestamp()
      };

      // Determine where to store the preference
      if (key.startsWith('email') && (key.includes('Achievement') || key.includes('Streak') || key === 'emailWeeklySummary')) {
        // Gamification email preferences
        updates[`gamification.preferences.${key}`] = value;
      } else if (key.startsWith('show') && (key.includes('Achievement') || key.includes('Streak'))) {
        // Gamification notification preferences
        updates[`gamification.preferences.${key}`] = value;
      } else {
        // General preferences
        updates[`preferences.${key}`] = value;
      }

      await updateDoc(userRef, updates);

      // Update local state
      const localUpdates = {};
      if (key.startsWith('email') && (key.includes('Achievement') || key.includes('Streak') || key === 'emailWeeklySummary')) {
        localUpdates.gamification = {
          ...userProfile.gamification,
          preferences: {
            ...userProfile.gamification?.preferences,
            [key]: value
          }
        };
      } else if (key.startsWith('show') && (key.includes('Achievement') || key.includes('Streak'))) {
        localUpdates.gamification = {
          ...userProfile.gamification,
          preferences: {
            ...userProfile.gamification?.preferences,
            [key]: value
          }
        };
      } else {
        localUpdates.preferences = {
          ...userProfile.preferences,
          [key]: value
        };
      }

      await updateUserProfile(localUpdates);

      setSuccessMessage('Preferences updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Error updating preferences:', error);
      setErrors({ [key]: 'Failed to update preference. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if category is available for user
  const isCategoryAvailable = (category) => {
    if (category.availableFor === 'adults' && isMinor) return false;
    if (category.requiresConsent && !hasMarketingConsent) return false;
    if (category.requiresCommunityAccess && !userProfile?.communityAccess) return false;
    return true;
  };

  // Filter categories based on user permissions
  const availableEmailCategories = emailCategories.filter(isCategoryAvailable);
  const availableNotificationCategories = notificationCategories.filter(isCategoryAvailable);

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Email Preferences */}
      <div className="card-base card-padding-lg">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Email Preferences
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control what emails you receive from us
            </p>
          </div>
        </div>

        {/* Marketing consent notice for minors */}
        {isMinor && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                  Limited Email Options
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Marketing emails are not available for users under 18 to protect your privacy.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Marketing consent notice for adults without consent */}
        {!isMinor && !hasMarketingConsent && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
                  Marketing Consent Required
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  To receive marketing emails, enable marketing consent in your Privacy Settings first.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {availableEmailCategories.map((category) => {
            const Icon = category.icon;

            return (
              <div key={category.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-4">
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <label htmlFor={item.key} className="font-medium text-gray-900 dark:text-white text-sm cursor-pointer">
                            {item.name}
                          </label>
                          {item.required && (
                            <span className="badge-blue text-xs">Required</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {item.description}
                        </p>
                      </div>

                      {/* Toggle Switch */}
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={currentPreferences[item.key] === true}
                          onChange={(e) => handlePreferenceChange(item.key, e.target.checked)}
                          disabled={isUpdating || item.required}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600 peer-disabled:opacity-50"></div>
                      </label>

                      {/* Error display */}
                      {errors[item.key] && (
                        <div className="ml-4">
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors[item.key]}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Email Frequency Settings */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Email Frequency
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Summary Frequency */}
            <div>
              <label className="form-label">Summary Email Frequency</label>
              <select
                value={currentPreferences.summaryFrequency}
                onChange={(e) => handlePreferenceChange('summaryFrequency', e.target.value)}
                disabled={isUpdating}
                className="form-select"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="never">Never</option>
              </select>
              <p className="form-help">How often to receive progress summaries</p>
            </div>

            {/* Reminder Frequency */}
            <div>
              <label className="form-label">Reminder Frequency</label>
              <select
                value={currentPreferences.reminderFrequency}
                onChange={(e) => handlePreferenceChange('reminderFrequency', e.target.value)}
                disabled={isUpdating}
                className="form-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="never">Never</option>
              </select>
              <p className="form-help">How often to receive progress reminders</p>
            </div>
          </div>
        </div>
      </div>

      {/* In-App Notification Preferences */}
      <div className="card-base card-padding-lg">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              In-App Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control what notifications appear while using the app
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {availableNotificationCategories.map((category) => {
            const Icon = category.icon;

            return (
              <div key={category.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-4">
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div className="flex-1">
                        <label htmlFor={`notif_${item.key}`} className="font-medium text-gray-900 dark:text-white text-sm cursor-pointer">
                          {item.name}
                        </label>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {item.description}
                        </p>
                      </div>

                      {/* Toggle Switch */}
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          id={`notif_${item.key}`}
                          checked={currentPreferences[item.key] === true}
                          onChange={(e) => handlePreferenceChange(item.key, e.target.checked)}
                          disabled={isUpdating}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                      </label>

                      {/* Error display */}
                      {errors[item.key] && (
                        <div className="ml-4">
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {errors[item.key]}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unsubscribe Information */}
      <div className="card-base card-padding-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Unsubscribe Information
        </h4>

        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">Email Unsubscribe</p>
              <p>Every marketing email includes an unsubscribe link. You can also manage preferences here anytime.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Bell className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">Browser Notifications</p>
              <p>To disable browser notifications completely, use your browser's notification settings for this site.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <X className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">Complete Opt-Out</p>
              <p>To stop all non-essential communications, disable all optional preferences above and revoke marketing consent in Privacy Settings.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
        <p className="mb-2">
          <strong>Legal Notice:</strong> Communication preferences:
        </p>
        <ul className="space-y-1 ml-4">
          <li>• Essential security emails cannot be disabled for account safety</li>
          <li>• Marketing emails require explicit consent and are never sent to minors</li>
          <li>• Community features require separate community access consent</li>
          <li>• Changes take effect immediately for in-app notifications</li>
          <li>• Email preference changes may take up to 24 hours to take effect</li>
          <li>• All communications comply with CAN-SPAM and GDPR regulations</li>
        </ul>
      </div>
    </div>
  );
};

export default MailingPreferences;