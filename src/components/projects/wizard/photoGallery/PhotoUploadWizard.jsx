// components/shared/wizard/photoGallery/PhotoUploadWizard.jsx - Enhanced for project creation mode with scroll
import React, { useState, useEffect } from 'react';
import { addProjectPhotosById, updateProjectCoverPhoto } from '../../../../services/projects/features/projectPhotos.js';
import { processAndUploadPhoto } from '../../../../services/photoService';
import { useAuth } from '../../../../contexts/AuthContext';
import { usePhotoWizard } from '../../../../hooks/photoGallery/usePhotoWizard';
import { usePhotoFormData } from '../../../../hooks/photoGallery/usePhotoFormData';
import { validatePhotoWizardForm } from '../../../../utils/photoWizardValidation';
import PhotoSelectForm from './PhotoSelectForm';
import PhotoCropStep from './PhotoCropStep';
import PhotoDetailsForm from './PhotoDetailsForm';
import PhotoReviewForm from './PhotoReviewForm';
import PhotoUploadForm from './PhotoUploadForm';

const PhotoUploadWizard = ({
  onComplete,
  onCancel,
  projectId,
  projectData,
  photoType = 'project',
  maxPhotos = 10,
  enableCropping = true,
  mode = 'standalone' // 'standalone' or 'project-creation'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStarted, setUploadStarted] = useState(false);
  const { currentUser } = useAuth();
  const { formData, addFiles, removeFile, updateFileMetadata, updateFileEditData, clearForm } = usePhotoFormData();

  const {
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    totalSteps,
    getStepInfo
  } = usePhotoWizard(enableCropping);

  // Scroll to top when step changes within photo wizard
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Handle file selection
  const handleFilesSelected = (files) => {
    addFiles(files);
  };

  // Handle file removal
  const handleFileRemoved = (fileId) => {
    removeFile(fileId);
  };

  // Handle file editing
  const handleFileEdited = (fileId, editData) => {
    updateFileEditData(fileId, editData);
  };

  // Handle metadata updates
  const handleMetadataUpdated = (fileId, metadata) => {
    updateFileMetadata(fileId, metadata);
  };

  // Check if all photos are processed (for edit step)
  const areAllPhotosProcessed = () => {
    const files = formData.files || [];
    if (files.length === 0) return true;
    return files.every(file => file.editData?.isProcessed === true);
  };

  // Check if next button should be disabled
  const isNextDisabled = () => {
    // Always require files to be selected
    if (!formData.files || formData.files.length === 0) {
      return true;
    }

    // ONLY disable on the crop step when cropping is enabled and not all photos are processed
    if (enableCropping && currentStep === 1) {
      return !areAllPhotosProcessed();
    }

    return false;
  };

  // Handle upload for project creation mode
  const handleProjectCreationUpload = async () => {
    try {
      console.log('📸 Processing photos for project creation mode');
      const uploadResults = [];

      for (const file of formData.files) {
        // Determine which file to upload (cropped or original)
        let fileToUpload;
        let uploadMetadata = {
          title: file.metadata?.title || file.fileName.replace(/\.[^/.]+$/, ''),
          description: file.metadata?.description || '',
          originalFileName: file.fileName,
          wasEdited: false,
          aspectRatio: 'original'
        };

        if (file.editData?.isProcessed && file.editData?.croppedBlob && !file.editData?.skipEditing) {
          // Use cropped version
          fileToUpload = file.editData.croppedBlob;
          uploadMetadata.wasEdited = true;
          uploadMetadata.aspectRatio = file.editData.aspectRatio || 'custom';
        } else {
          // Use original file
          fileToUpload = file.originalFile;
          uploadMetadata.wasEdited = false;
        }

        try {
          // Upload the file
          const result = await processAndUploadPhoto(
            fileToUpload,
            currentUser.uid,
            projectId,
            photoType
          );

          if (result.success) {
            uploadResults.push({
              downloadURL: result.downloadURL,
              storagePath: result.storagePath,
              metadata: uploadMetadata
            });
          }
        } catch (error) {
          console.error('Upload error:', error);
        }
      }

      clearForm();
      onComplete(uploadResults);
    } catch (error) {
      console.error('Project creation upload failed:', error);
      clearForm();
      onComplete([]);
    }
  };

  // Handle upload completion for standalone mode
  const handleStandaloneUpload = async (uploadResults) => {
    try {
      console.log('📸 Adding photos with metadata to existing project gallery:', uploadResults);

      // Transform upload results into photo objects with metadata
      const photoObjects = uploadResults.map(result => ({
        url: result.downloadURL,
        title: result.metadata?.title || '',
        description: result.metadata?.description || '',
        originalFileName: result.metadata?.originalFileName || '',
        uploadedAt: new Date().toISOString(),
        wasEdited: result.metadata?.wasEdited || false,
        aspectRatio: result.metadata?.aspectRatio || 'original'
      }));

      // Add photo objects to existing project
      await addProjectPhotosById(projectId, photoObjects);

      // Set cover photo if none exists
      if (!projectData.coverPhotoURL && photoObjects.length > 0) {
        await updateProjectCoverPhoto(projectId, photoObjects[0].url);
      }

      clearForm();
      onComplete(uploadResults);
    } catch (error) {
      console.error('Error adding photos to project:', error);
      clearForm();
      onComplete(uploadResults);
    }
  };

  // Handle upload cancellation
  const handleUploadCancel = () => {
    setIsUploading(false);
    setUploadStarted(false);
  };

  // Effect to handle project creation upload start
  useEffect(() => {
    if (isUploading && mode === 'project-creation' && !uploadStarted) {
      setUploadStarted(true);
      handleProjectCreationUpload();
    }
  }, [isUploading, mode, uploadStarted]);

  // Handle step navigation
  const handleNext = async () => {
    if (isNextDisabled()) {
      return;
    }

    // Validate current step
    const { isValid, errors } = validatePhotoWizardForm(formData, enableCropping, currentStep);

    if (!isValid) {
      console.error('Validation failed:', errors);
      return;
    }

    // If we're on the review step, start upload immediately
    if (currentStep === totalSteps - 1) {
      console.log('🚀 Starting upload immediately from review step');
      setIsUploading(true);
      return;
    }

    nextStep();
  };

  // Handle previous step navigation
  const handlePrevious = () => {
    previousStep();
  };

  const stepInfo = getStepInfo(currentStep);

  // Show upload form when uploading
  if (isUploading) {
    // For project creation mode, show simple processing message
    if (mode === 'project-creation') {
      return (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Processing Photos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processing and uploading your photos
            </p>
          </div>

          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner-primary"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Processing {formData.files?.length || 0} photos...
            </span>
          </div>
        </div>
      );
    }

    // For standalone mode, use the full upload form
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Uploading Photos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Processing and uploading your photos to the project
          </p>
        </div>

        <PhotoUploadForm
          formData={formData}
          projectId={projectId}
          photoType={photoType}
          onComplete={handleStandaloneUpload}
          onCancel={handleUploadCancel}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Step Info */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {stepInfo.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {stepInfo.description}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                index < currentStep
                  ? 'bg-indigo-600 text-white'
                  : index === currentStep
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`h-1 w-12 mx-2 transition-all ${
                  index < currentStep ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === 0 && (
          <PhotoSelectForm
            formData={formData}
            onFilesSelected={handleFilesSelected}
            onFileRemoved={handleFileRemoved}
            maxPhotos={maxPhotos}
            projectData={projectData}
          />
        )}

        {currentStep === 1 && enableCropping && (
          <PhotoCropStep
            formData={formData}
            onFileEdited={handleFileEdited}
            onAllPhotosProcessed={() => {
              // Auto-advance when all photos are processed
              if (areAllPhotosProcessed()) {
                setTimeout(() => nextStep(), 500);
              }
            }}
          />
        )}

        {currentStep === (enableCropping ? 2 : 1) && (
          <PhotoDetailsForm
            formData={formData}
            onMetadataUpdated={handleMetadataUpdated}
          />
        )}

        {currentStep === totalSteps - 1 && (
          <PhotoReviewForm
            formData={formData}
            onEditStep={setCurrentStep}
            enableCropping={enableCropping}
            projectData={projectData}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="btn-tertiary btn-md"
        >
          Cancel
        </button>

        {currentStep > 0 && (
          <button
            onClick={handlePrevious}
            className="btn-secondary btn-md"
          >
            Previous
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={isNextDisabled()}
          className="btn-primary btn-md flex-1"
        >
          {currentStep === totalSteps - 1 ?
            (mode === 'project-creation' ? 'Add Photos' : 'Start Upload') :
            'Next'
          }
        </button>
      </div>
    </div>
  );
};

export default PhotoUploadWizard;