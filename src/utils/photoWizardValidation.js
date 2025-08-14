// utils/photoWizardValidation.js - Fix validation logic based on current step
export const validatePhotoWizardForm = (formData, enableCropping = true, currentStep = 0) => {
  const errors = {};
  const files = formData.files || [];

  // Must have at least one file
  if (files.length === 0) {
    errors.files = 'Please select at least one photo to upload';
    return { isValid: false, errors };
  }

  // Only validate processing if we're past the editing step
  // Step 0: Select Photos
  // Step 1: Edit Photos (if cropping enabled)
  // Step 2: Add Details
  // Step 3: Review

  const editingStepIndex = enableCropping ? 1 : -1; // -1 means no editing step

  // Only check for processed photos if we're trying to move past the editing step
  if (enableCropping && currentStep > editingStepIndex) {
    const unprocessedFiles = files.filter(f => !f.editData?.isProcessed);
    if (unprocessedFiles.length > 0) {
      errors.files = `${unprocessedFiles.length} photo(s) still need to be processed. Please crop them or skip editing.`;
      return { isValid: false, errors };
    }
  }

  // Validate that all files have valid data
  for (const file of files) {
    if (!file.originalFile) {
      errors.files = 'Invalid file data detected';
      return { isValid: false, errors };
    }

    // If file was edited, must have valid crop data (only check this after editing step)
    if (enableCropping && currentStep > editingStepIndex && file.editData?.isProcessed && !file.editData?.skipEditing) {
      if (!file.editData?.croppedBlob) {
        errors.files = 'Processed photos are missing crop data';
        return { isValid: false, errors };
      }
    }
  }

  return { isValid: true, errors: {} };
};