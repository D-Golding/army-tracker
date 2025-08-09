// components/dashboard/Privacy/ProfileVisibility.jsx - Profile Visibility Settings Only
import React, { useState, useEffect } from 'react';
import { Eye, Lock, Users, Globe, Shield, Camera, User, Settings } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { showConfirmation } from '../../NotificationManager';

const ProfileVisibility = ({ onSettingChange, isUpdating }) => {
  const { userProfile } = useAuth();

  // Local state for the selected visibility option
  const [selectedVisibility, setSelectedVisibility] = useState('private');

  const isMinor = userProfile?.userCategory === 'minor';
  const hasCommunityAccess = userProfile?.communityAccess === true;

  // Update local state when userProfile changes
  useEffect(() => {
    if (userProfile?.privacySettings?.profileVisibility) {
      setSelectedVisibility(userProfile.privacySettings.profileVisibility);
    } else {
      setSelectedVisibility('private');
    }
  }, [userProfile?.privacySettings?.profileVisibility]);

  // Get current settings with proper defaults
  const currentSettings = {
    showDisplayName: userProfile?.privacySettings?.showDisplayName ?? true,
    showAvatar: userProfile?.privacySettings?.showAvatar ?? true,
    showAchievements: userProfile?.privacySettings?.showAchievements ?? false,
    showProgress: userProfile?.privacySettings?.showProgress ?? false,
  };

  const handleVisibilityChange = async (value) => {
    if (value === 'public') {
      const proceed = await showConfirmation({
        title: 'Make Profile Public?',
        message: 'Your profile will be visible to anyone on the internet. You can change this back anytime.',
        confirmText: 'Make Public',
        cancelText: 'Keep Private',
        type: 'warning'
      });

      if (!proceed) return;
    }

    setSelectedVisibility(value);
    onSettingChange('profileVisibility', value);
  };

  const visibilityOptions = [
    {
      value: 'private',
      name: 'Private',
      description: 'Only you can see your profile',
      icon: Lock,
      color: 'text-red-600 dark:text-red-400',
      available: true
    },
    {
      value: 'community',
      name: 'Community Only',
      description: 'Visible to other app users',
      icon: Users,
      color: 'text-amber-600 dark:text-amber-400',
      available: hasCommunityAccess
    },
    {
      value: 'public',
      name: 'Public',
      description: 'Visible to everyone on the internet',
      icon: Globe,
      color: 'text-emerald-600 dark:text-emerald-400',
      available: hasCommunityAccess && !isMinor
    }
  ];

  const visibilityItems = [
    { key: 'showDisplayName', name: 'Display Name', icon: User, description: 'Your chosen display name' },
    { key: 'showAvatar', name: 'Profile Picture', icon: Camera, description: 'Your profile photo/avatar' },
    { key: 'showAchievements', name: 'Achievements', icon: Shield, description: 'Badges and achievements earned' },
    { key: 'showProgress', name: 'Progress Stats', icon: Settings, description: 'Project counts and activity stats' }
  ];

  return (
    <div className="card-base card-padding-lg">
      <div className="flex items-center gap-3 mb-6">
        <Eye className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile Visibility
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control who can see your profile and information
          </p>
        </div>
      </div>

      {/* Community Access Notice for Minors */}
      {isMinor && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                Enhanced Privacy Protection
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                As someone under 18, some visibility options are not available to protect your privacy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overall Profile Visibility */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Overall Profile Visibility</h4>
        <div className="grid grid-cols-1 gap-3">
          {visibilityOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedVisibility === option.value;
            const isDisabled = !option.available;

            return (
              <div
                key={option.value}
                onClick={() => !isDisabled && !isUpdating && handleVisibilityChange(option.value)}
                className={`flex items-start gap-3 p-4 border rounded-xl transition-all ${
                  isDisabled 
                    ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                    : isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 cursor-pointer'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 cursor-pointer'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${option.color}`} />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {option.name}
                    </span>
                    {isDisabled && (
                      <span className="badge-tertiary text-xs">Not Available</span>
                    )}
                    {option.value === 'private' && (
                      <span className="badge-secondary text-xs">Recommended</span>
                    )}
                    {/* Debug info */}
                    {option.value === 'private' && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Debug: selected={isSelected ? 'true' : 'false'})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Visibility Controls */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">What Others Can See</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibilityItems.map((item) => {
            const Icon = item.icon;
            const isDisabled = selectedVisibility === 'private';

            return (
              <div key={item.key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <label htmlFor={item.key} className="font-medium text-gray-900 dark:text-white text-sm cursor-pointer">
                      {item.name}
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={currentSettings[item.key] === true}
                    onChange={(e) => onSettingChange(item.key, e.target.checked)}
                    disabled={isUpdating || isDisabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600 peer-disabled:opacity-50"></div>
                </label>
              </div>
            );
          })}
        </div>

        {selectedVisibility === 'private' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Lock className="w-4 h-4 inline mr-1" />
              Individual visibility settings are disabled when profile is set to private
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileVisibility;