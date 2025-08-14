// components/shared/CameraCapture.jsx
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, RotateCcw } from 'lucide-react';
import { validatePhotoFile } from '../../utils/photoValidator';
import { processAndUploadPhoto } from '../../services/photoService';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useUpgradeModal } from '../../hooks/useUpgradeModal';
import UpgradeModal from './UpgradeModal';
import ProjectPhotoCropper from '../projects/ProjectPhotoCropper';

const CameraCapture = ({
  onPhotosUploaded,
  projectId,
  projectData = null,
  assignmentId = null,
  photoType = 'project',
  maxPhotos = 10,
  disabled = false,
  buttonText = 'Add Photos',
  buttonStyle = 'btn-primary btn-md',
  enableCropping = false // New prop to enable cropping for project photos
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [error, setError] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { currentUser } = useAuth();
  const { canPerformAction, getRemainingAllowance, currentTier, getNextTier } = useSubscription();
  const { showUpgradeModal, upgradeModalProps } = useUpgradeModal();

  // Check if user can add photos and if they're on the highest tier
  const canAddPhotos = canPerformAction('add_photo', 1, projectData);
  const isHighestTier = !getNextTier(); // No next tier available

  // Determine if we should show cropping option
  const shouldShowCropping = enableCropping && photoType === 'project';

  // Handle button click - check limits and show modal if needed
  const handleButtonClick = () => {
    if (!canAddPhotos) {
      if (isHighestTier) {
        // Don't open modal if on highest tier and at limit
        return;
      } else {
        // Show upgrade modal for lower tiers
        showUpgradeModal('photos');
        return;
      }
    }
    setIsOpen(true);
  };

  // Handle file selection for cropping
  const handleFileSelectForCropping = async (files) => {
    if (!files || files.length === 0) return;

    // For cropping, we only handle one file at a time
    const file = files[0];

    // Validate file type
    if (file.type && !['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(file.type.toLowerCase())) {
      setError('Invalid file type. Please select an image file.');
      return;
    }

    setSelectedFile(file);
    setShowCropper(true);
    setIsOpen(false); // Close the upload modal
  };

  // Handle crop completion
  const handleCropComplete = async (croppedBlob) => {
    setShowCropper(false);
    setSelectedFile(null);

    // Convert blob back to File object
    const croppedFile = new File([croppedBlob], 'cropped-photo.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    // Process the cropped file
    await processFiles([croppedFile]);
  };

  // Handle crop cancellation
  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
    setIsOpen(true); // Reopen the upload modal
  };

  // Process files (cropped or original)
  const processFiles = async (files) => {
    if (!files || files.length === 0) return;

    // Check subscription limits BEFORE processing
    const filesToUpload = Math.min(files.length, maxPhotos);

    if (!canPerformAction('add_photo', filesToUpload, projectData)) {
      showUpgradeModal('photos');
      return;
    }

    // Additional check: ensure we don't exceed project photo limits
    if (projectData) {
      const remainingPhotos = getRemainingAllowance('photos', true, projectData);

      if (filesToUpload > remainingPhotos) {
        showUpgradeModal('photos');
        return;
      }
    }

    setError(null);
    setIsUploading(true);
    setIsOpen(true); // Show upload modal for progress

    const fileArray = Array.from(files).slice(0, filesToUpload);
    const totalFiles = fileArray.length;

    // Initialize progress tracking
    const progressArray = fileArray.map((_, index) => ({
      id: index,
      status: 'waiting',
      progress: 0,
      fileName: fileArray[index].name
    }));
    setUploadProgress(progressArray);

    const uploadResults = [];

    try {
      // Process files one by one to show progress
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Update progress: processing
        setUploadProgress(prev => prev.map(item =>
          item.id === i ? { ...item, status: 'processing', progress: 25 } : item
        ));

        // Update progress: uploading
        setUploadProgress(prev => prev.map(item =>
          item.id === i ? { ...item, status: 'uploading', progress: 50 } : item
        ));

        // Process and upload
        const result = await processAndUploadPhoto(
          file,
          currentUser.uid,
          projectId,
          photoType,
          assignmentId
        );

        if (result.success) {
          setUploadProgress(prev => prev.map(item =>
            item.id === i ? { ...item, status: 'success', progress: 100 } : item
          ));
          uploadResults.push({
            downloadURL: result.downloadURL,
            storagePath: result.storagePath,
            metadata: result.metadata
          });
        } else {
          setUploadProgress(prev => prev.map(item =>
            item.id === i ? { ...item, status: 'error', progress: 0, error: result.error } : item
          ));
        }
      }

      // Call success callback with successfully uploaded photos
      if (uploadResults.length > 0 && onPhotosUploaded) {
        onPhotosUploaded(uploadResults);
      }

      // Auto-close modal after successful uploads
      if (uploadResults.length === totalFiles) {
        setTimeout(() => {
          setIsOpen(false);
          setUploadProgress([]);
        }, 1500);
      }

    } catch (error) {
      setError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection (camera or file picker)
  const handleFileSelect = async (files) => {
    if (shouldShowCropping) {
      // Route to cropping flow
      handleFileSelectForCropping(files);
    } else {
      // Process directly without cropping
      await processFiles(files);
    }
  };

  // Handle camera/file input trigger
  const handleCameraClick = () => {
    // Check limits before opening file picker
    if (!canPerformAction('add_photo', 1, projectData)) {
      showUpgradeModal('photos');
      return;
    }

    if (fileInputRef.current) {
      // For cropping, restrict to single file
      if (shouldShowCropping) {
        fileInputRef.current.removeAttribute('multiple');
      } else {
        fileInputRef.current.setAttribute('multiple', 'multiple');
      }
      fileInputRef.current.click();
    }
  };

  // Handle gallery selection (without capture attribute)
  const handleGalleryClick = () => {
    // Check limits before opening file picker
    if (!canPerformAction('add_photo', 1, projectData)) {
      showUpgradeModal('photos');
      return;
    }

    if (fileInputRef.current) {
      // Remove capture attribute to force gallery selection
      fileInputRef.current.removeAttribute('capture');

      // For cropping, restrict to single file
      if (shouldShowCropping) {
        fileInputRef.current.removeAttribute('multiple');
      } else {
        fileInputRef.current.setAttribute('multiple', 'multiple');
      }

      fileInputRef.current.click();

      // Add capture back for next camera use
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.setAttribute('capture', 'environment');
          if (!shouldShowCropping) {
            fileInputRef.current.setAttribute('multiple', 'multiple');
          }
        }
      }, 100);
    }
  };

  // Reset modal state
  const handleClose = () => {
    setIsOpen(false);
    setUploadProgress([]);
    setError(null);
  };

  // Retry failed upload
  const handleRetry = () => {
    const failedFiles = uploadProgress
      .filter(item => item.status === 'error')
      .map(item => item.fileName);

    if (failedFiles.length > 0) {
      setUploadProgress([]);
      setError(null);
      // Would need to store original files to retry - simplified for now
      setError('Please try selecting the files again');
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleButtonClick}
        disabled={disabled || isUploading || (isHighestTier && !canAddPhotos)}
        className={`${buttonStyle} ${(disabled || isUploading || (isHighestTier && !canAddPhotos)) ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={(isHighestTier && !canAddPhotos) ? 'Photo limit reached' : ''}
      >
        <Camera size={16} />
        {isUploading ? 'Uploading...' : buttonText}
      </button>

      {/* Upload Modal */}
      {isOpen && (
        <div className="modal-backdrop" onClick={handleClose}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Photos
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Upload Options */}
            {uploadProgress.length === 0 && !error && (
              <div className="space-y-4">

                {/* Cropping Info */}
                {shouldShowCropping && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3 mb-4">
                    <div className="text-indigo-800 dark:text-indigo-300 text-sm">
                      <div className="font-medium mb-1">📸 Photo Cropping Enabled</div>
                      <p>You can crop and resize your photos before uploading. Choose from Portrait, Square, or Landscape formats.</p>
                    </div>
                  </div>
                )}

                {/* Camera/File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple={!shouldShowCropping}
                  capture="environment" // Use rear camera on mobile
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />

                {/* Camera Button */}
                <button
                  onClick={handleCameraClick}
                  disabled={isUploading}
                  className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <Camera className="mx-auto mb-2" size={32} />
                  <div className="font-medium">
                    {shouldShowCropping ? 'Take Photo / Choose File' : 'Take Photo / Choose Files'}
                  </div>
                  <div className="text-sm mt-1">Supports JPEG, PNG, WebP, HEIC</div>
                  <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    {shouldShowCropping
                      ? 'Single photo with cropping options'
                      : 'Auto-resized to 1200px, compressed for web'
                    }
                  </div>
                </button>

                {/* Alternative Upload Button */}
                <button
                  onClick={handleGalleryClick}
                  disabled={isUploading}
                  className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <Upload className="inline-block mr-2" size={16} />
                  {shouldShowCropping ? 'Choose from Gallery' : 'Choose Multiple from Gallery'}
                </button>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {uploadProgress.map((item) => (
                  <div key={item.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl">

                    {/* File info */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.fileName}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.status === 'success' && (
                          <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                        )}
                        {item.status === 'error' && (
                          <X size={16} className="text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span className="capitalize">{item.status}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            item.status === 'success' ? 'bg-emerald-500' :
                            item.status === 'error' ? 'bg-red-500' :
                            'bg-indigo-500'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Error message */}
                    {item.error && (
                      <div className="text-xs text-red-600 dark:text-red-400">
                        {item.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
                <div className="text-red-800 dark:text-red-300 text-sm">
                  {error}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {(uploadProgress.length > 0 || error) && (
              <div className="flex gap-2 mt-4">
                {uploadProgress.some(item => item.status === 'error') && (
                  <button
                    onClick={handleRetry}
                    disabled={isUploading}
                    className="btn-tertiary btn-sm"
                  >
                    <RotateCcw size={14} />
                    Retry Failed
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="btn-primary btn-sm ml-auto"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Photo Cropper */}
      {showCropper && selectedFile && (
        <ProjectPhotoCropper
          file={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal {...upgradeModalProps} />
    </>
  );
};

export default CameraCapture;