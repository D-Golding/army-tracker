// hooks/useProjectWizard.js - Project creation wizard navigation logic
import { useState } from 'react';

const WIZARD_STEPS = [
  { id: 'details', title: 'Project Details', required: true },
  { id: 'paints', title: 'Paint Selection', required: false },
  { id: 'photos', title: 'Project Photos', required: false },
  { id: 'review', title: 'Review & Create', required: false }
];

export const useProjectWizard = (formData) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Validation logic for each step
  const isStepValid = (stepIndex) => {
    const step = WIZARD_STEPS[stepIndex];

    switch (step.id) {
      case 'details':
        // Name and difficulty are required
        return formData.name?.trim().length > 0 && formData.difficulty?.length > 0;
      case 'paints':
      case 'photos':
      case 'review':
        // These steps are optional, always valid
        return true;
      default:
        return false;
    }
  };

  // Check if we can move to next step
  const canGoNext = () => {
    // Must be valid current step and not at last step
    return isStepValid(currentStep) && currentStep < WIZARD_STEPS.length - 1;
  };

  // Check if we can go to previous step
  const canGoPrevious = () => currentStep > 0;

  // Move to next step
  const goNext = () => {
    if (canGoNext()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Move to previous step
  const goPrevious = () => {
    if (canGoPrevious()) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Jump to specific step (free navigation)
  const goToStep = (stepIndex) => {
    // Can always go to previous steps
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
      return;
    }

    // Can go to next steps if all previous steps are valid
    if (stepIndex > currentStep) {
      // Check all steps between current and target are valid
      for (let i = 0; i <= stepIndex; i++) {
        const step = WIZARD_STEPS[i];
        if (step.required && !isStepValid(i)) {
          // Can't skip required invalid steps
          return;
        }
      }
      setCurrentStep(stepIndex);
      return;
    }

    // Same step, just set it
    setCurrentStep(stepIndex);
  };

  // Step state helpers
  const isStepCompleted = (stepIndex) => {
    // Step is completed if we've moved past it and it was valid
    return stepIndex < currentStep && isStepValid(stepIndex);
  };

  const isStepActive = (stepIndex) => stepIndex === currentStep;

  const isStepAccessible = (stepIndex) => {
    // Always accessible if it's current or previous
    if (stepIndex <= currentStep) return true;

    // For future steps, check if all previous required steps are valid
    for (let i = 0; i < stepIndex; i++) {
      const step = WIZARD_STEPS[i];
      if (step.required && !isStepValid(i)) {
        return false;
      }
    }
    return true;
  };

  const isLastStep = () => currentStep === WIZARD_STEPS.length - 1;

  // Check if entire form is ready for submission
  const isFormReady = () => {
    // Must have completed all required steps
    for (let i = 0; i < WIZARD_STEPS.length; i++) {
      const step = WIZARD_STEPS[i];
      if (step.required && !isStepValid(i)) {
        return false;
      }
    }
    return true;
  };

  return {
    WIZARD_STEPS,
    currentStep,
    canGoNext,
    canGoPrevious,
    goNext,
    goPrevious,
    goToStep,
    isStepCompleted,
    isStepActive,
    isStepAccessible,
    isLastStep,
    isStepValid,
    isFormReady
  };
};