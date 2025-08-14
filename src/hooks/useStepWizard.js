// hooks/useStepWizard.js - Wizard navigation logic
import { useState } from 'react';

const WIZARD_STEPS = [
  { id: 'details', title: 'Step Details', required: true },
  { id: 'paints', title: 'Paint Assignments', required: false },
  { id: 'photos', title: 'Step Photos', required: false },
  { id: 'notes', title: 'Notes', required: false },
  { id: 'review', title: 'Review', required: false }
];

export const useStepWizard = (formData) => {
  const [currentStep, setCurrentStep] = useState(0);

  const canGoNext = () => {
    if (currentStep === 0) {
      return formData.title?.trim().length > 0;
    }
    return currentStep < WIZARD_STEPS.length - 1;
  };

  const canGoPrevious = () => currentStep > 0;

  const goNext = () => {
    if (canGoNext()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goPrevious = () => {
    if (canGoPrevious()) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex) => {
    const step = WIZARD_STEPS[stepIndex];
    const isAccessible = stepIndex <= currentStep || (!step.required && formData.title?.trim());

    if (isAccessible) {
      setCurrentStep(stepIndex);
    }
  };

  const isStepCompleted = (stepIndex) => stepIndex < currentStep;
  const isStepActive = (stepIndex) => stepIndex === currentStep;
  const isStepAccessible = (stepIndex) => {
    const step = WIZARD_STEPS[stepIndex];
    return stepIndex <= currentStep || (!step.required && formData.title?.trim());
  };

  const isLastStep = () => currentStep === WIZARD_STEPS.length - 1;

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
    isLastStep
  };
};