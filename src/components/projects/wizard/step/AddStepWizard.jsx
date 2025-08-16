// components/projects/wizard/step/AddStepWizard.jsx - Main wizard orchestrator
import React, { useState } from 'react';
import { useStepWizard } from '../../../../hooks/useStepWizard';
import { useStepFormData } from '../../../../hooks/useStepFormData';
import WizardStepIndicator from './WizardStepIndicator';
import WizardNavigation from './WizardNavigation';
import StepDetailsForm from './StepDetailsForm';
import StepPaintsForm from './StepPaintsForm';
import StepPhotosForm from './StepPhotosForm';
import StepNotesForm from './StepNotesForm';
import StepReviewForm from './StepReviewForm';

const AddStepWizard = ({
  onSubmit,
  onCancel,
  onNextStep,
  isLoading = false,
  stepNumber = 1,
  projectData
}) => {
  const [error, setError] = useState(null);

  const {
    formData,
    updateField,
    addPaint,
    removePaint,
    updatePaint,
    addPhotos,
    removePhoto,
    addNote,
    updateNote,
    removeNote
  } = useStepFormData();

  const {
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
  } = useStepWizard(formData);

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Step title is required');
      return;
    }

    setError(null);

    const stepData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      stepPhoto: formData.stepPhoto, // Include the step photo
      paints: formData.paints,
      photos: formData.photos,
      notes: formData.notes
    };

    console.log('📄 Submitting step data:', stepData);
    console.log('📸 Step photo URL:', stepData.stepPhoto);

    try {
      await onSubmit(stepData);
    } catch (error) {
      setError('Failed to create step. Please try again.');
      console.error('Error creating step:', error);
    }
  };

  // Handle navigation with scroll to top
  const handleNext = () => {
    goNext();
    setError(null);
    // Scroll to top when moving to next step
    if (onNextStep) {
      onNextStep();
    }
  };

  const handlePrevious = () => {
    goPrevious();
    setError(null);
    // Scroll to top when moving to previous step
    if (onNextStep) {
      onNextStep();
    }
  };

  const handleStepClick = (stepIndex) => {
    goToStep(stepIndex);
    setError(null);
    // Scroll to top when clicking on step indicator
    if (onNextStep) {
      onNextStep();
    }
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    updateField(field, value);

    // Clear error when user starts typing title
    if (error && field === 'title' && value.trim()) {
      setError(null);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    const stepId = WIZARD_STEPS[currentStep].id;

    switch (stepId) {
      case 'details':
        return (
          <StepDetailsForm
            formData={formData}
            onFieldChange={handleFieldChange}
            error={error}
            isLoading={isLoading}
            stepNumber={stepNumber}
            projectData={projectData} // ← Added projectData prop
          />
        );

      case 'paints':
        return (
          <StepPaintsForm
            formData={formData}
            projectData={projectData}
            onPaintAssigned={addPaint}
            onPaintRemoved={removePaint}
            onPaintUpdated={updatePaint}
          />
        );

      case 'photos':
        return (
          <StepPhotosForm
            formData={formData}
            projectData={projectData}
            onPhotosAdded={addPhotos}
            onPhotoRemoved={removePhoto}
          />
        );

      case 'notes':
        return (
          <StepNotesForm
            formData={formData}
            onNoteAdded={addNote}
            onNoteUpdated={updateNote}
            onNoteDeleted={removeNote}
          />
        );

      case 'review':
        return (
          <StepReviewForm
            formData={formData}
            stepNumber={stepNumber}
          />
        );

      default:
        return null;
    }
  };

  const isFormValid = formData.title.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <WizardStepIndicator
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        isStepCompleted={isStepCompleted}
        isStepActive={isStepActive}
        isStepAccessible={isStepAccessible}
        onStepClick={handleStepClick}
      />

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <WizardNavigation
        canGoPrevious={canGoPrevious()}
        canGoNext={canGoNext()}
        isLastStep={isLastStep()}
        isLoading={isLoading}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        stepNumber={stepNumber}
        isFormValid={isFormValid}
      />
    </div>
  );
};

export default AddStepWizard;