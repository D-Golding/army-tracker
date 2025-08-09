// components/dashboard/Profile/ProfileInfo.jsx - Profile Information Display and Editing
import React, { useState } from 'react';
import { User, Edit3, Check, X, Crown } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import AvatarUpload from './AvatarUpload';
import PasswordManager from './PasswordManager';
import AccountDeletion from './AccountDeletion';

const ProfileInfo = () => {
  const { userProfile, updateUserProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    email: userProfile?.email || ''
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when userProfile loads
  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        email: userProfile.email || ''
      });
    }
  }, [userProfile]);

  // Get tier display information
  const getTierInfo = () => {
    const tier = userProfile?.subscription?.tier || 'free';
    const tierNames = {
      free: 'Free',
      casual: 'Casual Hobbyist',
      pro: 'Pro',
      battle: 'Battle Ready'
    };

    const tierColors = {
      free: 'text-gray-600 dark:text-gray-400',
      casual: 'text-blue-600 dark:text-blue-400',
      pro: 'text-purple-600 dark:text-purple-400',
      battle: 'text-amber-600 dark:text-amber-400'
    };

    return {
      name: tierNames[tier] || tier,
      color: tierColors[tier] || tierColors.free,
      showCrown: tier !== 'free'
    };
  };

  const tierInfo = getTierInfo();

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    } else if (formData.displayName.trim().length > 50) {
      newErrors.displayName = 'Display name must be less than 50 characters';
    }

    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName: formData.displayName.trim(),
        // Note: Email updates typically require re-authentication in Firebase
        // For now, we'll only update displayName
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      displayName: userProfile?.displayName || '',
      email: userProfile?.email || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="card-base card-padding-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar Upload Section */}
      <AvatarUpload />

      {/* Profile Information Card */}
      <div className="card-base card-padding-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile Information
          </h3>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-outline btn-sm flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="form-label">Display Name</label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className={`form-input ${errors.displayName ? 'border-red-300 dark:border-red-600' : ''}`}
                  placeholder="Enter your display name"
                />
                {errors.displayName && (
                  <p className="form-error">{errors.displayName}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-900 dark:text-white">
                {userProfile?.displayName || 'Not set'}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="form-label">Email Address</label>
            <div>
              <p className="text-gray-900 dark:text-white">{userProfile?.email}</p>
              <p className="form-help">Email changes require re-authentication and are not currently supported in this interface.</p>
            </div>
          </div>

          {/* Account Created */}
          <div>
            <label className="form-label">Member Since</label>
            <p className="text-gray-900 dark:text-white">
              {userProfile?.createdAt
                ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString()
                : 'Unknown'
              }
            </p>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary btn-sm flex items-center gap-2"
              >
                {isSaving ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="btn-outline btn-sm flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password Management */}
      <PasswordManager />

      {/* Subscription Information Card */}
      <div className="card-base card-padding-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Subscription Information
        </h3>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {tierInfo.showCrown && <Crown className="w-5 h-5 text-amber-500" />}
            <User className="w-5 h-5 text-gray-400" />
          </div>

          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {tierInfo.name} Tier
            </p>
            <p className={`text-sm ${tierInfo.color}`}>
              {userProfile?.subscription?.type === 'trial' ? 'Trial Account' : 'Active Subscription'}
            </p>
          </div>
        </div>

        {userProfile?.subscription?.expiresAt && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Expires:</strong> {new Date(userProfile.subscription.expiresAt.seconds * 1000).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Account Statistics */}
      <div className="card-base card-padding-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Statistics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {userProfile?.gamification?.statistics?.projectsCreated || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Projects Created</p>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {userProfile?.gamification?.statistics?.projectsCompleted || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Projects Completed</p>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {userProfile?.gamification?.achievements?.totalPoints || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Achievement Points</p>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {userProfile?.gamification?.achievements?.unlockedBadges?.length || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</p>
          </div>
        </div>
      </div>

      {/* Account Deletion - DANGER ZONE */}
      <AccountDeletion />
    </div>
  );
};

export default ProfileInfo;