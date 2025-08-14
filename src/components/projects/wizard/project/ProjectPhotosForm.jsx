// components/projects/wizard/ProjectPhotosForm.jsx - Added skip option to cropper
import React, { useState } from 'react';
import { Camera, Star, X, Trash2, Edit, Plus } from 'lucide-react';
import { useSubscription } from '../../../../hooks/useSubscription';
import { useAuth } from '../../../../contexts/AuthContext';
import { processAndUploadPhoto } from '../../../../services/photoService';
import { validatePhotoFile } from '../../../../utils/photoValidator';
import ProjectPhotoCropper from '../../ProjectPhotoCropper';

const ProjectPhotosForm = ({
  formData,
  onPhotosAdded,
  onPhotoRemoved,
  onCoverPhotoSet,
  isLoading = false
}) => {
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cropperFile, setCropperFile] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);

  const { limits, canPerformAction, getRemainingAllowance, currentTier } = useSubscription();
  const { currentUser } = useAuth();
  const uploadedPhotos = formData.uploadedPhotos || [];
  const coverPhotoURL = formData.coverPhotoURL;

  // PROPER LIMIT CHECKING: Use formData directly with subscription hook
  const canAddMorePhotos = (count = 1) => {
    return canPerformAction('add_photo', count, formData);
  };

  const remainingPhotoSlots = getRemainingAllowance('photos', true, formData);
  const isAtPhotoLimit = remainingPhotoSlots <= 0;

  // Handle file selection - IMPROVED with proper limit checking
  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // CHECK LIMITS BEFORE PROCESSING
    if (!canAddMorePhotos(fileArray.length)) {
      const availableSlots = remainingPhotoSlots;
      if (availableSlots === 0) {
        alert(`You've reached your photo limit (${limits.photosPerProject} photos per project). Upgrade your plan to add more photos.`);
      } else {
        alert(`You can only add ${availableSlots} more photo${availableSlots !== 1 ? 's' : ''} to this project. Current limit: ${limits.photosPerProject} photos per project.`);
      }
      return;
    }

    // Validate all files first
    for (const file of fileArray) {
      const validation = validatePhotoFile(file);
      if (!validation.isValid) {
        alert(`Invalid file: ${validation.error}`);
        return;
      }
    }

    // Start cropping workflow with first file
    setPendingFiles(fileArray);
    setCropperFile(fileArray[0]);
  };

  // Handle crop completion - IMPROVED with live limit checking
  const handleCropComplete = async (croppedBlob) => {
    setIsUploading(true);

    try {
      // Double-check limits before uploading (in case something changed)
      if (!canAddMorePhotos(1)) {
        alert('Photo limit reached. Cannot upload more photos.');
        handleCropCancel();
        return;
      }

      // Upload the cropped image
      const uploadResult = await processAndUploadPhoto(
        croppedBlob,
        currentUser.uid,
        'wizard-project', // Temporary project ID for wizard uploads
        'project'
      );

      if (uploadResult.success) {
        // Add to uploaded photos
        onPhotosAdded([uploadResult.downloadURL]);

        // Auto-set first photo as cover if no cover is set
        if (!coverPhotoURL && uploadedPhotos.length === 0) {
          onCoverPhotoSet(uploadResult.downloadURL);
        }
      } else {
        console.error('Upload failed:', uploadResult.error);
        alert('Failed to upload photo. Please try again.');
      }

    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);

      // Move to next file or close cropper
      const remainingFiles = pendingFiles.slice(1);
      if (remainingFiles.length > 0 && canAddMorePhotos(1)) {
        setPendingFiles(remainingFiles);
        setCropperFile(remainingFiles[0]);
      } else {
        // Either no more files or hit limit
        if (remainingFiles.length > 0) {
          alert(`Remaining files cancelled - photo limit reached.`);
        }
        setCropperFile(null);
        setPendingFiles([]);
      }
    }
  };

  // NEW: Handle crop skip - upload original file without cropping
  const handleCropSkip = async () => {
    if (!cropperFile) return;

    setIsUploading(true);

    try {
      // Double-check limits before uploading
      if (!canAddMorePhotos(1)) {
        alert('Photo limit reached. Cannot upload more photos.');
        handleCropCancel();
        return;
      }

      // Upload the original file without cropping
      const uploadResult = await processAndUploadPhoto(
        cropperFile,
        currentUser.uid,
        'wizard-project', // Temporary project ID for wizard uploads
        'project'
      );

      if (uploadResult.success) {
        // Add to uploaded photos
        onPhotosAdded([uploadResult.downloadURL]);

        // Auto-set first photo as cover if no cover is set
        if (!coverPhotoURL && uploadedPhotos.length === 0) {
          onCoverPhotoSet(uploadResult.downloadURL);
        }
      } else {
        console.error('Upload failed:', uploadResult.error);
        alert('Failed to upload photo. Please try again.');
      }

    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);

      // Move to next file or close cropper
      const remainingFiles = pendingFiles.slice(1);
      if (remainingFiles.length > 0 && canAddMorePhotos(1)) {
        setPendingFiles(remainingFiles);
        setCropperFile(remainingFiles[0]);
      } else {
        // Either no more files or hit limit
        if (remainingFiles.length > 0) {
          alert(`Remaining files cancelled - photo limit reached.`);
        }
        setCropperFile(null);
        setPendingFiles([]);
      }
    }
  };

  // Handle crop cancellation
  const handleCropCancel = () => {
    setCropperFile(null);
    setPendingFiles([]);
  };

  // Handle setting cover photo
  const handleSetCoverPhoto = (photoUrl) => {
    onCoverPhotoSet(photoUrl);
    setShowCoverModal(false);
  };

  // Handle photo deletion
  const handleDeletePhoto = (photoUrl) => {
    onPhotoRemoved(photoUrl);

    // If deleted photo was cover, set new cover or clear it
    if (photoUrl === coverPhotoURL) {
      const remainingPhotos = uploadedPhotos.filter(url => url !== photoUrl);
      if (remainingPhotos.length > 0) {
        onCoverPhotoSet(remainingPhotos[0]);
      } else {
        onCoverPhotoSet(null);
      }
    }
  };

  // IMPROVED BUTTON STATE LOGIC
  const getUploadButtonState = () => {
    if (isUploading) return { disabled: true, text: 'Uploading...', icon: null };
    if (cropperFile) return { disabled: true, text: 'Cropping in progress...', icon: Camera };
    if (isAtPhotoLimit) {
      if (currentTier === 'battle') {
        return { disabled: true, text: 'Photo Limit Reached', icon: Plus };
      } else {
        return { disabled: false, text: 'Upgrade for More Photos', icon: Plus };
      }
    }
    return { disabled: false, text: 'Upload Photos', icon: Plus };
  };

  const uploadButtonState = getUploadButtonState();

  // Get photos to display in gallery (show 4 initially, all when expanded)
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const displayPhotos = showAllPhotos ? uploadedPhotos : uploadedPhotos.slice(0, 4);
  const hasMorePhotos = uploadedPhotos.length > 4;

  return (
    <>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Camera className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Photos
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload photos for your project (optional)
          </p>
        </div>

        {/* IMPROVED LIMIT DISPLAY */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Photo Usage</span>
            <span className={`font-medium ${isAtPhotoLimit ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {uploadedPhotos.length} / {limits.photosPerProject}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isAtPhotoLimit 
                  ? 'bg-red-500' 
                  : uploadedPhotos.length / limits.photosPerProject > 0.8 
                    ? 'bg-amber-500' 
                    : 'bg-indigo-500'
              }`}
              style={{
                width: `${Math.min(100, (uploadedPhotos.length / limits.photosPerProject) * 100)}%`
              }}
            ></div>
          </div>
          {remainingPhotoSlots > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {remainingPhotoSlots} photo{remainingPhotoSlots !== 1 ? 's' : ''} remaining
            </div>
          )}
          {pendingFiles.length > 1 && (
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {pendingFiles.length} files pending upload
            </div>
          )}
        </div>

        {/* IMPROVED UPLOAD SECTION */}
        <div className="text-center">
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={uploadButtonState.disabled || isLoading}
              className="sr-only"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className={`btn-primary btn-md cursor-pointer inline-flex items-center gap-2 ${
                uploadButtonState.disabled && currentTier === 'battle' ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isAtPhotoLimit && currentTier !== 'battle' ? 'bg-amber-600 hover:bg-amber-700' : ''
              }`}
            >
              {isUploading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  {uploadButtonState.text}
                </>
              ) : (
                <>
                  {uploadButtonState.icon && <uploadButtonState.icon size={16} />}
                  {uploadButtonState.text}
                </>
              )}
            </label>
          </div>

          {/* INFORMATIVE TEXT BASED ON STATE */}
          {isAtPhotoLimit && currentTier !== 'battle' && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Upgrade to add more photos to your projects
            </p>
          )}
          {isAtPhotoLimit && currentTier === 'battle' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Maximum photos reached for this project
            </p>
          )}
          {!isAtPhotoLimit && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {uploadedPhotos.length} / {limits.photosPerProject} photos uploaded
            </p>
          )}
        </div>

        {/* Photos Display - Keep existing code */}
        {uploadedPhotos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Camera className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="mb-3">No photos uploaded yet</p>
            <p className="text-sm">Photos help showcase your project and track progress</p>
          </div>
        ) : (
          <>
            {/* Cover Photo Section */}
            {coverPhotoURL && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <Star className="mr-1 text-yellow-500" size={14} />
                  Cover Photo
                </h4>

                <div className="w-1/2 pr-1.5">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-yellow-200 dark:border-yellow-600">
                    <img
                      src={coverPhotoURL}
                      alt="Project cover"
                      className="w-full h-full object-contain cursor-pointer"
                      onClick={() => setShowLightbox(coverPhotoURL)}
                    />
                  </div>

                  {uploadedPhotos.length > 1 && (
                    <button
                      onClick={() => setShowCoverModal(true)}
                      disabled={isLoading}
                      className="mt-2 w-full btn-tertiary btn-sm flex items-center justify-center gap-2"
                    >
                      <Edit size={14} />
                      Change Cover
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Gallery Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Gallery ({uploadedPhotos.length})
              </h4>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {displayPhotos.map((photoUrl, index) => {
                  const isCoverPhoto = photoUrl === coverPhotoURL;

                  return (
                    <div key={photoUrl} className="relative">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        <img
                          src={photoUrl}
                          alt={`Project photo ${index + 1}`}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => setShowLightbox(photoUrl)}
                        />
                      </div>

                      {isCoverPhoto && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                          <Star size={10} />
                          Cover
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photoUrl);
                        }}
                        disabled={isLoading}
                        className="absolute bottom-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                        title="Delete photo"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {hasMorePhotos && (
                <button
                  onClick={() => setShowAllPhotos(!showAllPhotos)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {showAllPhotos ? (
                    <>Show Less</>
                  ) : (
                    <>See All ({uploadedPhotos.length - 4} more)</>
                  )}
                </button>
              )}
            </div>
          </>
        )}

        {/* Skip Option */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can always add photos to your project later
          </p>
        </div>
      </div>

      {/* Photo Cropper with Skip Option */}
      {cropperFile && (
        <ProjectPhotoCropper
          file={cropperFile}
          onCropComplete={handleCropComplete}
          onCropSkip={handleCropSkip}
          onCancel={handleCropCancel}
          showSkipOption={true}
        />
      )}

      {/* Cover Photo Selection Modal */}
      {showCoverModal && (
        <div className="modal-backdrop" onClick={() => setShowCoverModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choose Cover Photo
              </h3>
              <button
                onClick={() => setShowCoverModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {uploadedPhotos.map((photoUrl, index) => {
                const isCurrentCover = photoUrl === coverPhotoURL;

                return (
                  <button
                    key={photoUrl}
                    onClick={() => handleSetCoverPhoto(photoUrl)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      isCurrentCover 
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`Photo option ${index + 1}`}
                      className="w-full h-full object-contain"
                    />

                    {isCurrentCover && (
                      <div className="absolute inset-0 bg-yellow-500 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-yellow-500 text-white px-2 py-1 rounded-lg flex items-center gap-1">
                          <Star size={12} />
                          Current
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <button
                onClick={() => setShowCoverModal(false)}
                className="btn-tertiary btn-md w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowLightbox(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={showLightbox}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowLightbox(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectPhotosForm;