// Validate avatar file using existing validator
  const validateAvatarFile = (file) => {
    // Use your existing photo validator
    const validation = validatePhotoFile(file);
    if (!validation.isValid) {
      return validation;
    }

    // Additional avatar-specific validation can go here if needed
    return { isValid: true, error: null };
  };// components/dashboard/Profile/AvatarUpload.jsx - Avatar Upload System
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, User } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { processAndUploadPhoto, deletePhotoByURL } from '../../../services/photoService';
import { validatePhotoFile } from '../../../utils/photoValidator';
import ImageCropper from './ImageCropper';

const AvatarUpload = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadDetails, setShowUploadDetails] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const fileInputRef = useRef(null);

  // Avatar upload configuration
  const AVATAR_CONFIG = {
    maxFileSize: 20 * 1024 * 1024, // 20MB (before processing)
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
    dimensions: 400, // Target square dimensions
    quality: 0.85
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset previous states
    setUploadError(null);
    setPreviewUrl(null);
    setSelectedFile(null);
    setCroppedBlob(null);

    // Validate file
    const validation = validateAvatarFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error);
      return;
    }

    // Set file and show cropper
    setSelectedFile(file);
    setShowCropper(true);
  };

  // Handle crop completion
  const handleCropComplete = (blob) => {
    // Create preview URL from cropped blob
    const preview = URL.createObjectURL(blob);
    setPreviewUrl(preview);
    setCroppedBlob(blob);
    setShowCropper(false);
  };

  // Handle crop cancellation
  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
    setShowUploadDetails(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process and upload avatar
  const handleUploadAvatar = async () => {
    if (!croppedBlob || !userProfile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Delete old avatar if it exists
      if (userProfile.photoURL) {
        try {
          await deletePhotoByURL(userProfile.photoURL);
        } catch (error) {
          console.warn('Could not delete old avatar:', error);
          // Don't stop the upload if deletion fails
        }
      }

      // Create a File object from the cropped blob for the upload service
      const croppedFile = new File([croppedBlob], `avatar-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      // Process and upload new avatar
      const result = await processAndUploadPhoto(
        croppedFile,
        userProfile.uid,
        'avatar', // Use 'avatar' as project ID for avatars
        'profile', // Photo type
        null // No assignment ID
      );

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update user profile with new avatar URL
      await updateUserProfile({
        photoURL: result.downloadURL
      });

      // Clear all states
      setPreviewUrl(null);
      setSelectedFile(null);
      setCroppedBlob(null);
      setShowUploadDetails(false);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Avatar upload error:', error);
      setUploadError(error.message || 'Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel upload
  const handleCancelUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setSelectedFile(null);
    setCroppedBlob(null);
    setUploadError(null);
    setShowUploadDetails(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove current avatar
  const handleRemoveAvatar = async () => {
    if (!userProfile?.photoURL) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Delete from storage
      await deletePhotoByURL(userProfile.photoURL);

      // Update user profile to remove avatar
      await updateUserProfile({
        photoURL: null
      });

    } catch (error) {
      console.error('Avatar removal error:', error);
      setUploadError('Failed to remove avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input
  const handleSelectFile = () => {
    setShowUploadDetails(true);
    fileInputRef.current?.click();
  };

  // Clean up preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Show cropper if file is selected and needs cropping
  if (showCropper && selectedFile) {
    return (
      <ImageCropper
        file={selectedFile}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    );
  }

  return (
    <div className="card-base card-padding-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Profile Picture
      </h3>

      {/* Error Display */}
      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Avatar Display */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-lg">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt="Current avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            {/* Upload overlay for current avatar */}
            {!previewUrl && (
              <button
                onClick={handleSelectFile}
                disabled={isUploading}
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-4">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={AVATAR_CONFIG.allowedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {!previewUrl ? (
            /* Upload Actions */
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSelectFile}
                  disabled={isUploading}
                  className="btn-primary btn-sm flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {userProfile?.photoURL ? 'Change Avatar' : 'Upload Avatar'}
                </button>

                {userProfile?.photoURL && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                    className="btn-outline btn-sm flex items-center gap-2 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    {isUploading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Remove
                  </button>
                )}
              </div>

              {/* Show upload details only when uploading */}
              {showUploadDetails && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Upload a square image for best results.</p>
                  <p>Large images will be automatically compressed.</p>
                  <p>Supported formats: JPEG, PNG, WebP, HEIC</p>
                </div>
              )}
            </div>
          ) : (
            /* Preview Actions */
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleUploadAvatar}
                  disabled={isUploading}
                  className="btn-primary btn-sm flex items-center gap-2"
                >
                  {isUploading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {isUploading ? 'Uploading...' : 'Save Avatar'}
                </button>

                <button
                  onClick={handleCancelUpload}
                  disabled={isUploading}
                  className="btn-outline btn-sm flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Preview your cropped avatar above.</p>
                <p>File: {selectedFile?.name}</p>
                <p>Size: {croppedBlob ? (croppedBlob.size / 1024).toFixed(1) : 0}KB (cropped)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Guidelines - Only show when uploading */}
      {showUploadDetails && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Guidelines</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Use a clear, recognisable photo of yourself</li>
            <li>• Square images work best for circular display</li>
            <li>• Avoid images with text or complex backgrounds</li>
            <li>• Your avatar represents you in the community</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;