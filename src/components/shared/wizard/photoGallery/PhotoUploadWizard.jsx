// components/shared/wizard/photoGallery/PhotoUploadWizard.jsx - Pass photo metadata to project
import React, { useState } from 'react';
import { addProjectPhotosById, updateProjectCoverPhoto } from '../../../../services/projects/features/projectPhotos.js';
import { usePhotoWizard } from '../../../../hooks/photoGallery/usePhotoWizard';
import { usePhotoFormData } from '../../../../hooks/photoGallery/usePhotoFormData';
import { validatePhotoWizardForm } from '../../../../utils/photoWizardValidation';
import PhotoSelectForm from './PhotoSelectForm';
import PhotoEditForm from './PhotoEditForm';
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
  enableCropping = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { formData, addFiles, removeFile, updateFileMetadata, updateFileEditData, clearForm } = usePhotoFormData();

  const {
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    totalSteps,
    getStepInfo
  } = usePhotoWizard(enableCropping);

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
    if (files.length === 0) return true; // If no files, consider "processed"
    return files.every(file => file.editData?.isProcessed === true);
  };

  // Check if next button should be disabled
  const isNextDisabled = () => {
    // Always require files to be selected (except on edit step where they're already selected)
    if (!formData.files || formData.files.length === 0) {
      return true;
    }

    // ONLY disable on the edit step (step 1) when cropping is enabled and not all photos are processed
    if (enableCropping && currentStep === 1) {
      return !areAllPhotosProcessed();
    }

    // For all other steps (select, details, review), don't disable based on processing
    return false;
  };

  // Handle step navigation
  const handleNext = async () => {
    // Don't proceed if next is disabled
    if (isNextDisabled()) {
      return;
    }

    // Validate current step - PASS THE CURRENT STEP TO VALIDATION
    const { isValid, errors } = validatePhotoWizardForm(formData, enableCropping, currentStep);

    if (!isValid) {
      console.error('Validation failed:', errors);
      return;
    }

    // If we're on the review step (last step), start upload immediately
    if (currentStep === totalSteps - 1) {
      console.log('🚀 Starting upload immediately from review step');
      setIsUploading(true);
      return;
    }

    nextStep();
  };

  // Handle upload completion - ADD PHOTOS TO EXISTING PROJECT GALLERY WITH METADATA
  const handleUploadComplete = async (uploadResults) => {
    try {
      console.log('📸 Adding photos with metadata to existing project gallery:', uploadResults);
      console.log('📁 Project ID:', projectId);

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

      console.log('📋 Photo objects to add:', photoObjects);

      // Add photo objects to existing project using the updated service function
      await addProjectPhotosById(projectId, photoObjects);
      console.log('✅ Photos with metadata added to project gallery successfully');

      // Set cover photo if none exists (use first photo URL)
      if (!projectData.coverPhotoURL && photoObjects.length > 0) {
        await updateProjectCoverPhoto(projectId, photoObjects[0].url);
        console.log('🌟 Cover photo set:', photoObjects[0].url);
      }

      clearForm();
      onComplete(uploadResults);
    } catch (error) {
      console.error('❌ Error adding photos to project:', error);
      console.error('📋 Error details:', {
        code: error.code,
        message: error.message,
        projectId,
        photoObjects: uploadResults.map(r => r.downloadURL)
      });

      // Still complete the wizard but show an error
      clearForm();
      onComplete(uploadResults);
    }
  };

  // Handle upload cancellation
  const handleUploadCancel = () => {
    setIsUploading(false);
    // Stay on the review step when cancelling upload
  };

  const stepInfo = getStepInfo(currentStep);

  // Show upload form when uploading (overlays the current step)
  if (isUploading) {
    return (
      <div>
        {/* Upload Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Uploading Photos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Processing and uploading your photos to the project
          </p>
        </div>

        {/* Upload Progress */}
        <PhotoUploadForm
          formData={formData}
          projectId={projectId}
          photoType={photoType}
          onComplete={handleUploadComplete}
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
          <PhotoEditForm
            formData={formData}
            onFileEdited={handleFileEdited}
            enableCropping={enableCropping}
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
            onClick={previousStep}
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
          {currentStep === totalSteps - 1 ? 'Start Upload' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default PhotoUploadWizard;