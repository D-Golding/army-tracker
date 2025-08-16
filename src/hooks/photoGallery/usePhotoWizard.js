// hooks/photoGallery/usePhotoWizard.js - Add crop step to wizard flow
import { useState, useMemo } from 'react';

export const usePhotoWizard = (enableCropping = true) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Define wizard steps based on whether cropping is enabled
  const WIZARD_STEPS = useMemo(() => {
    const baseSteps = [
      {
        id: 'select',
        title: 'Select Photos',
        description: 'Choose photos to upload and add to your project'
      }
    ];

    if (enableCropping) {
      baseSteps.push({
        id: 'crop',
        title: 'Edit Photos',
        description: 'Crop your photos for better framing or keep originals'
      });
    }

    baseSteps.push(
      {
        id: 'details',
        title: 'Photo Details',
        description: 'Add titles and descriptions to your photos (optional)'
      },
      {
        id: 'review',
        title: 'Review & Upload',
        description: 'Review your photos and details before uploading'
      }
    );

    return baseSteps;
  }, [enableCropping]);

  const totalSteps = WIZARD_STEPS.length;

  // Navigation functions
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setCurrentStep(stepIndex);
    }
  };

  // Step info helper
  const getStepInfo = (stepIndex = currentStep) => {
    return WIZARD_STEPS[stepIndex] || WIZARD_STEPS[0];
  };

  // Step validation helpers
  const isStepCompleted = (stepIndex) => {
    return stepIndex < currentStep;
  };

  const isStepActive = (stepIndex) => {
    return stepIndex === currentStep;
  };

  const isStepAccessible = (stepIndex) => {
    // Allow access to current step and previous steps
    return stepIndex <= currentStep;
  };

  const isLastStep = () => {
    return currentStep === totalSteps - 1;
  };

  const isFirstStep = () => {
    return currentStep === 0;
  };

  // Navigation state helpers
  const canGoNext = () => {
    return currentStep < totalSteps - 1;
  };

  const canGoPrevious = () => {
    return currentStep > 0;
  };

  return {
    // Step configuration
    WIZARD_STEPS,
    currentStep,
    totalSteps,

    // Navigation
    nextStep,
    previousStep,
    goToStep,
    setCurrentStep,

    // Step info
    getStepInfo,
    isStepCompleted,
    isStepActive,
    isStepAccessible,
    isLastStep,
    isFirstStep,

    // Navigation state
    canGoNext,
    canGoPrevious
  };
};