// components/dashboard/Privacy/PrivacySettings.jsx - Main Privacy Settings with Small Components
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';

// Import small, focused components
import ProfileVisibility from './ProfileVisibility';
import ProjectPrivacy from './ProjectPrivacy';
import DataSharing from './DataSharing';

const PrivacySettings = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize privacy settings with secure defaults on first load
  useEffect(() => {
    const initializePrivacyDefaults = async () => {
      if (!userProfile?.uid) return; // Wait for user profile to load

      // Check if privacy settings exist, if not initialize them
      if (!userProfile.privacySettings?.profileVisibility) {
        try {
          const userId = userProfile.uid;
          const userRef = doc(db, 'users', userId);

          const defaultPrivacySettings = {
            profileVisibility: 'private',
            showDisplayName: true,
            showAvatar: true,
            showAchievements: false,
            showProgress: false,
            defaultProjectVisibility: 'private',
            allowProjectComments: false,
            allowProjectSharing: false,
            shareStatsAnonymously: false,
            allowResearch: false,
            autoDeleteInactiveProjects: false,
            dataRetentionPeriod: '2years'
          };

          await updateDoc(userRef, {
            privacySettings: defaultPrivacySettings,
            updatedAt: serverTimestamp()
          });

          await updateUserProfile({
            privacySettings: defaultPrivacySettings
          });

          console.log('✅ Privacy settings initialized with secure defaults');
        } catch (error) {
          console.error('Error initializing privacy defaults:', error);
        }
      }
    };

    initializePrivacyDefaults();
  }, [userProfile?.uid, userProfile?.privacySettings?.profileVisibility, updateUserProfile]);

  // Handle settings change from child components
  const handleSettingChange = async (key, value) => {
    setIsUpdating(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const userId = userProfile.uid;
      const userRef = doc(db, 'users', userId);

      let updates = {
        updatedAt: serverTimestamp()
      };

      // Handle consent-related settings separately
      if (key === 'allowAnalytics') {
        updates['privacyConsents.analytics'] = value;
      } else {
        updates[`privacySettings.${key}`] = value;
      }

      await updateDoc(userRef, updates);

      // Update local state
      const localUpdates = {};
      if (key === 'allowAnalytics') {
        localUpdates.privacyConsents = {
          ...userProfile.privacyConsents,
          analytics: value
        };
      } else {
        localUpdates.privacySettings = {
          ...userProfile.privacySettings,
          [key]: value
        };
      }

      await updateUserProfile(localUpdates);

      setSuccessMessage('Privacy settings updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Error updating privacy settings:', error);
      setErrors({ [key]: 'Failed to update setting. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

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

      {/* Profile Visibility Component */}
      <ProfileVisibility
        onSettingChange={handleSettingChange}
        isUpdating={isUpdating}
      />

      {/* Project Privacy Component */}
      <ProjectPrivacy
        onSettingChange={handleSettingChange}
        isUpdating={isUpdating}
      />

      {/* Data Sharing Component */}
      <DataSharing
        onSettingChange={handleSettingChange}
        isUpdating={isUpdating}
      />

      {/* Legal Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
        <p className="mb-2">
          <strong>Important Privacy Information:</strong>
        </p>
        <ul className="space-y-1 ml-4">
          <li>• Privacy settings changes take effect immediately</li>
          <li>• Some settings may be restricted based on your age and consent preferences</li>
          <li>• Community features require separate community consent</li>
          <li>• You can change these settings anytime through this dashboard</li>
          <li>• Public profiles may be indexed by search engines</li>
          <li>• All settings comply with GDPR, COPPA, and other privacy regulations</li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacySettings;