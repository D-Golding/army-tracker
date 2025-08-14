// components/dashboard/Profile/BannerUpload.jsx - Banner Photo Upload Component
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Edit3, Settings } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { processAndUploadPhoto, deletePhotoByURL } from '../../../services/photoService';
import { validatePhotoFile } from '../../../utils/photoValidator';
import BannerCropper from './BannerCropper';

const BannerUpload = ({ className = '' }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

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
    const validation = validatePhotoFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error);
      return;
    }

    // Set file and show cropper
    setSelectedFile(file);
    setShowCropper(true);
  };

  // Handle crop completion with brightness data and version
  const handleCropComplete = (blob, brightness, version) => {
    // Create preview URL from cropped blob
    const preview = URL.createObjectURL(blob);
    setPreviewUrl(preview);
    setCroppedBlob(blob);

    // Store brightness data and version for later use
    blob.brightness = brightness;
    blob.brightnessVersion = version;

    setShowCropper(false);
  };

  // Handle crop cancellation
  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process and upload banner
  const handleUploadBanner = async () => {
    if (!croppedBlob || !userProfile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Delete old banner if it exists
      if (userProfile.headerPhotoURL) {
        try {
          await deletePhotoByURL(userProfile.headerPhotoURL);
        } catch (error) {
          console.warn('Could not delete old banner:', error);
          // Don't stop the upload if deletion fails
        }
      }

      // Create a File object from the cropped blob for the upload service
      const croppedFile = new File([croppedBlob], `banner-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      // Process and upload new banner
      const result = await processAndUploadPhoto(
        croppedFile,
        userProfile.uid,
        'banner', // Use 'banner' as project ID for banners
        'banner', // Photo type
        null // No assignment ID
      );

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update user profile with new banner URL, brightness, and version
      await updateUserProfile({
        headerPhotoURL: result.downloadURL,
        headerPhotoBrightness: croppedBlob.brightness || 0.5,
        headerPhotoBrightnessVersion: croppedBlob.brightnessVersion || 2
      });

      // Clear all states
      setPreviewUrl(null);
      setSelectedFile(null);
      setCroppedBlob(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Banner upload error:', error);
      setUploadError(error.message || 'Failed to upload banner. Please try again.');
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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove current banner
  const handleRemoveBanner = async () => {
    if (!userProfile?.headerPhotoURL) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Delete from storage
      await deletePhotoByURL(userProfile.headerPhotoURL);

      // Update user profile to remove banner and brightness
      await updateUserProfile({
        headerPhotoURL: null,
        headerPhotoBrightness: null,
        headerPhotoBrightnessVersion: null
      });

    } catch (error) {
      console.error('Banner removal error:', error);
      setUploadError('Failed to remove banner. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input
  const handleSelectFile = () => {
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
      <BannerCropper
        file={selectedFile}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    );
  }

  // If there's a preview or we're in the middle of uploading, show the upload interface
  if (previewUrl || isUploading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Header Banner
        </h3>

        {/* Error Display */}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
          </div>
        )}

        {/* Preview */}
        {previewUrl && (
          <div className="mb-4">
            <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
              <img
                src={previewUrl}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Preview of your header banner (16:9 aspect ratio)
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleUploadBanner}
            disabled={isUploading}
            className="btn-primary btn-sm flex items-center gap-2"
          >
            {isUploading ? (
              <div className="loading-spinner"></div>
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isUploading ? 'Uploading...' : 'Save Banner'}
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

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  // Default view - edit panel style button for header
  return (
    <>
      {/* Edit Panel Style Button */}
      <button
        onClick={handleSelectFile}
        disabled={isUploading}
        className={`p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50 flex items-center justify-center ${className}`}
        title={userProfile?.headerPhotoURL ? 'Change header banner' : 'Add header banner'}
      >
        <Edit3 size={16} className="text-white" />
      </button>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Remove Banner Option (only show in dropdown/menu) */}
      {userProfile?.headerPhotoURL && (
        <div className="hidden">
          <button
            onClick={handleRemoveBanner}
            disabled={isUploading}
            className="btn-outline btn-sm flex items-center gap-2 text-red-600 dark:text-red-400"
          >
            <X className="w-4 h-4" />
            Remove Banner
          </button>
        </div>
      )}
    </>
  );
};

export default BannerUpload;