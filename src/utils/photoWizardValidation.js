// utils/photoWizardValidation.js - Updated validation for new crop step flow
export const validatePhotoWizardForm = (formData, enableCropping = true, currentStep = null) => {
  const errors = {};
  let isValid = true;

  // Get step configuration based on cropping enabled
  const getStepIndex = (stepName) => {
    if (stepName === 'select') return 0;
    if (stepName === 'crop') return enableCropping ? 1 : -1; // -1 means step doesn't exist
    if (stepName === 'details') return enableCropping ? 2 : 1;
    if (stepName === 'review') return enableCropping ? 3 : 2;
    return -1;
  };

  // Validate Step 0: Photo Selection
  const validatePhotoSelection = () => {
    if (!formData.files || formData.files.length === 0) {
      errors.files = 'Please select at least one photo to upload.';
      isValid = false;
      return;
    }

    // Validate each file
    const maxFileSize = 20 * 1024 * 1024; // 20MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

    for (const file of formData.files) {
      if (!file.originalFile) {
        errors.files = 'Invalid file data detected.';
        isValid = false;
        break;
      }

      if (!allowedTypes.includes(file.originalFile.type)) {
        errors.files = `${file.fileName}: Unsupported file type. Please use JPEG, PNG, WebP, or HEIC.`;
        isValid = false;
        break;
      }

      if (file.originalFile.size > maxFileSize) {
        errors.files = `${file.fileName}: File too large. Maximum size is 20MB.`;
        isValid = false;
        break;
      }
    }
  };

  // Validate Step 1: Photo Cropping (if enabled)
  const validatePhotoCropping = () => {
    if (!enableCropping) return; // Skip if cropping disabled

    if (!formData.files || formData.files.length === 0) {
      errors.processing = 'No photos available for processing.';
      isValid = false;
      return;
    }

    // Check if all photos have been processed
    const unprocessedFiles = formData.files.filter(f => !f.editData?.isProcessed);
    if (unprocessedFiles.length > 0) {
      errors.processing = `${unprocessedFiles.length} photo${unprocessedFiles.length !== 1 ? 's' : ''} still need${unprocessedFiles.length === 1 ? 's' : ''} to be processed. Please crop or skip each photo.`;
      isValid = false;
      return;
    }

    // Validate processed photos have proper edit data
    for (const file of formData.files) {
      if (!file.editData || typeof file.editData.isProcessed !== 'boolean') {
        errors.processing = 'Invalid photo processing data detected.';
        isValid = false;
        break;
      }

      // If photo was cropped, ensure we have the cropped data
      if (!file.editData.skipEditing && !file.editData.croppedBlob) {
        errors.processing = `${file.fileName}: Missing cropped image data.`;
        isValid = false;
        break;
      }
    }
  };

  // Validate Step 2/1: Photo Details (optional step, so no required validation)
  const validatePhotoDetails = () => {
    // This step is optional, so no validation errors
    // Just ensure metadata structure is valid if present
    if (formData.files) {
      for (const file of formData.files) {
        if (file.metadata) {
          // Validate metadata structure if present
          if (typeof file.metadata !== 'object') {
            errors.metadata = 'Invalid photo metadata format.';
            isValid = false;
            break;
          }
        }
      }
    }
  };

  // Validate Step 3/2: Review (final validation)
  const validateReview = () => {
    // Re-run all previous validations for final check
    validatePhotoSelection();
    if (enableCropping) {
      validatePhotoCropping();
    }
    validatePhotoDetails();

    // Additional final checks
    if (isValid && formData.files) {
      // Ensure we have the right number of files
      if (formData.files.length === 0) {
        errors.review = 'No photos selected for upload.';
        isValid = false;
      }

      // Check for any missing required data
      for (const file of formData.files) {
        if (!file.id || !file.fileName) {
          errors.review = 'Some photos are missing required information.';
          isValid = false;
          break;
        }

        if (!file.previewUrl && !file.editData?.croppedPreviewUrl) {
          errors.review = `${file.fileName}: Missing preview image.`;
          isValid = false;
          break;
        }
      }
    }
  };

  // Run validation based on current step or validate all if no step specified
  if (currentStep !== null) {
    // Validate specific step
    switch (currentStep) {
      case getStepIndex('select'):
        validatePhotoSelection();
        break;
      case getStepIndex('crop'):
        validatePhotoSelection(); // Must have photos selected first
        validatePhotoCropping();
        break;
      case getStepIndex('details'):
        validatePhotoSelection();
        if (enableCropping) validatePhotoCropping();
        validatePhotoDetails();
        break;
      case getStepIndex('review'):
        validateReview();
        break;
      default:
        // Unknown step, validate everything
        validateReview();
        break;
    }
  } else {
    // Validate everything (for final submission)
    validateReview();
  }

  return {
    isValid,
    errors
  };
};

// Helper function to check if a specific step is valid
export const isStepValid = (formData, enableCropping, stepIndex) => {
  const validation = validatePhotoWizardForm(formData, enableCropping, stepIndex);
  return validation.isValid;
};

// Helper function to get step-specific validation errors
export const getStepErrors = (formData, enableCropping, stepIndex) => {
  const validation = validatePhotoWizardForm(formData, enableCropping, stepIndex);
  return validation.errors;
};

// Helper to validate minimum requirements for proceeding
export const canProceedFromStep = (formData, enableCropping, currentStep) => {
  // Step 0 (select): Need at least one file
  if (currentStep === 0) {
    return formData.files && formData.files.length > 0;
  }

  // Step 1 (crop): Need all photos processed (if cropping enabled)
  if (currentStep === 1 && enableCropping) {
    if (!formData.files || formData.files.length === 0) return false;
    return formData.files.every(f => f.editData?.isProcessed === true);
  }

  // Step 2/1 (details): Always can proceed (optional step)
  if (currentStep === (enableCropping ? 2 : 1)) {
    return true;
  }

  // Step 3/2 (review): Need full validation
  if (currentStep === (enableCropping ? 3 : 2)) {
    const validation = validatePhotoWizardForm(formData, enableCropping);
    return validation.isValid;
  }

  return false;
};