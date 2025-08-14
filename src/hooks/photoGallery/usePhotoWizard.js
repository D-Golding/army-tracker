// hooks/photoGallery/usePhotoWizard.js - Updated to remove separate upload step
import { useState } from 'react';

export const usePhotoWizard = (enableCropping = true) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Calculate total steps based on features (removed upload step)
  const totalSteps = enableCropping ? 4 : 3; // Select, Edit (optional), Details, Review

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const getStepInfo = (step) => {
    const steps = enableCropping ? [
      { title: 'Select Photos', description: 'Choose photos to upload' },
      { title: 'Edit Photos', description: 'Crop and adjust your photos' },
      { title: 'Add Details', description: 'Add titles and descriptions' },
      { title: 'Review', description: 'Review before uploading' }
    ] : [
      { title: 'Select Photos', description: 'Choose photos to upload' },
      { title: 'Add Details', description: 'Add titles and descriptions' },
      { title: 'Review', description: 'Review before uploading' }
    ];

    return steps[step] || steps[0];
  };

  return {
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    goToStep,
    totalSteps,
    getStepInfo
  };
};