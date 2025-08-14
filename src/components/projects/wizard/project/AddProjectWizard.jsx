// components/projects/wizard/AddProjectWizard.jsx - Main project wizard orchestrator
import React, { useState } from 'react';
import { useProjectWizard } from '../../../../hooks/useProjectWizard';
import { useProjectFormData } from '../../../../hooks/useProjectFormData';
import { validateProjectForm } from '../../../../utils/projectValidation';
import ProjectWizardStepIndicator from './ProjectWizardStepIndicator';
import ProjectWizardNavigation from './ProjectWizardNavigation';
import ProjectDetailsForm from './ProjectDetailsForm';
import ProjectPaintsForm from './ProjectPaintsForm';
import ProjectPhotosForm from './ProjectPhotosForm';
import ProjectReviewForm from './ProjectReviewForm';

const AddProjectWizard = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [errors, setErrors] = useState({});

  const {
    formData,
    updateField,
    updateManufacturer,
    updateGame,
    addPaints,
    removePaint,
    addPhotos,
    removePhoto,
    setCoverPhoto,
    getProjectData,
    isRequiredFieldsValid
  } = useProjectFormData();

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
    isLastStep,
    isFormReady
  } = useProjectWizard(formData);

  // Handle form submission
  const handleSubmit = async () => {
    // Final validation
    const validation = validateProjectForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Go back to details step if there are validation errors
      goToStep(0);
      return;
    }

    setErrors({});

    try {
      const projectData = getProjectData();

      // DEBUG: Log the project data being created
      console.log('🐛 PROJECT DATA BEING CREATED:', projectData);
      console.log('🐛 CREATED DATE VALUE:', projectData.created);
      console.log('🐛 CREATED DATE TYPE:', typeof projectData.created);
      console.log('🐛 UPDATED DATE VALUE:', projectData.updatedAt);
      console.log('🐛 UPDATED DATE TYPE:', typeof projectData.updatedAt);

      await onSubmit(projectData);
    } catch (error) {
      setErrors({ submit: 'Failed to create project. Please try again.' });
      console.error('Error creating project:', error);
    }
  };

  // Handle navigation
  const handleNext = () => {
    // Clear errors when moving forward
    setErrors({});
    goNext();
  };

  const handlePrevious = () => {
    // Clear errors when moving backward
    setErrors({});
    goPrevious();
  };

  const handleStepClick = (stepIndex) => {
    // Clear errors when jumping to step
    setErrors({});
    goToStep(stepIndex);
  };

  // Handle field changes with error clearing
  const handleFieldChange = (field, value) => {
    updateField(field, value);

    // Clear specific field errors when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear submit errors
    if (errors.submit) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.submit;
        return newErrors;
      });
    }
  };

  // Handle manufacturer changes with error clearing
  const handleManufacturerChange = (manufacturer) => {
    updateManufacturer(manufacturer);

    // Clear manufacturer and game errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.manufacturer;
      delete newErrors.game;
      return newErrors;
    });
  };

  // Handle game changes with error clearing
  const handleGameChange = (game) => {
    updateGame(game);

    // Clear game errors
    if (errors.game) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.game;
        return newErrors;
      });
    }
  };

  // Handle paint operations
  const handlePaintsAdded = (paints) => {
    addPaints(paints);
  };

  const handlePaintRemoved = (paintId) => {
    removePaint(paintId);
  };

  // Handle photo operations
  const handlePhotosAdded = (photoUrls) => {
    addPhotos(photoUrls);
  };

  const handlePhotoRemoved = (photoUrl) => {
    removePhoto(photoUrl);
  };

  const handleCoverPhotoSet = (photoUrl) => {
    setCoverPhoto(photoUrl);
  };

  // Handle edit from review step
  const handleEditStep = (stepIndex) => {
    goToStep(stepIndex);
  };

  // Render current step content
  const renderStepContent = () => {
    const stepId = WIZARD_STEPS[currentStep].id;

    switch (stepId) {
      case 'details':
        return (
          <ProjectDetailsForm
            formData={formData}
            onFieldChange={handleFieldChange}
            onManufacturerChange={handleManufacturerChange}
            onGameChange={handleGameChange}
            errors={errors}
            isLoading={isLoading}
          />
        );

      case 'paints':
        return (
          <ProjectPaintsForm
            formData={formData}
            onPaintsAdded={handlePaintsAdded}
            onPaintRemoved={handlePaintRemoved}
            isLoading={isLoading}
          />
        );

      case 'photos':
        return (
          <ProjectPhotosForm
            formData={formData}
            onPhotosAdded={handlePhotosAdded}
            onPhotoRemoved={handlePhotoRemoved}
            onCoverPhotoSet={handleCoverPhotoSet}
            isLoading={isLoading}
          />
        );

      case 'review':
        return (
          <ProjectReviewForm
            formData={formData}
            onEditStep={handleEditStep}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <ProjectWizardStepIndicator
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        isStepCompleted={isStepCompleted}
        isStepActive={isStepActive}
        isStepAccessible={isStepAccessible}
        onStepClick={handleStepClick}
      />

      {/* Step Content */}
      <div className="min-h-[500px]">
        {renderStepContent()}
      </div>

      {/* Submit Error Display */}
      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="text-red-800 dark:text-red-300 text-sm font-medium">
            {errors.submit}
          </div>
        </div>
      )}

      {/* Navigation */}
      <ProjectWizardNavigation
        canGoPrevious={canGoPrevious()}
        canGoNext={canGoNext()}
        isLastStep={isLastStep()}
        isLoading={isLoading}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        isFormReady={isFormReady()}
      />
    </div>
  );
};

export default AddProjectWizard;