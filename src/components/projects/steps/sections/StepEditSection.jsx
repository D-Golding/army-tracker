// components/projects/steps/sections/StepEditSection.jsx
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { validateStepData } from '../../../../utils/steps/stepHelpers';
import { ERROR_MESSAGES } from '../../../../utils/steps/stepConstants';
import StepCoverPhotoEditor from './StepCoverPhotoEditor';

const StepEditSection = ({
  step,
  onSave,
  onCancel,
  isUpdating,
  projectData
}) => {
  const [editForm, setEditForm] = useState({
    title: step.title || '',
    description: step.description || '',
    stepPhoto: step.stepPhoto || null
  });
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle cover photo update - FIX: Make sure this function is defined
  const handlePhotoUpdate = (photoUrl) => {
    setEditForm(prev => ({
      ...prev,
      stepPhoto: photoUrl
    }));
  };

  // Handle cover photo removal - FIX: Make sure this function is defined
  const handlePhotoRemove = () => {
    setEditForm(prev => ({
      ...prev,
      stepPhoto: null
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const validation = validateStepData(editForm);
    if (!validation.isValid) {
      setErrors(validation.errors.reduce((acc, error) => {
        if (error.includes('title')) acc.title = error;
        if (error.includes('description')) acc.description = error;
        return acc;
      }, {}));
      return;
    }

    try {
      await onSave({
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        stepPhoto: editForm.stepPhoto,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      setErrors({ submit: ERROR_MESSAGES.UPDATE_FAILED });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditForm({
      title: step.title || '',
      description: step.description || '',
      stepPhoto: step.stepPhoto || null
    });
    setErrors({});
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Step Title */}
      <div>
        <label className="form-label">
          Step Title *
        </label>
        <input
          type="text"
          value={editForm.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`form-input text-base font-medium ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
          placeholder="Enter step title"
          disabled={isUpdating}
          autoFocus
        />
        {errors.title && (
          <div className="form-error">{errors.title}</div>
        )}
      </div>

      {/* Step Description */}
      <div>
        <label className="form-label">
          Description
        </label>
        <textarea
          value={editForm.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className={`form-textarea text-sm ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
          placeholder="Describe what needs to be done in this step (optional)"
          rows="3"
          disabled={isUpdating}
        />
        {errors.description && (
          <div className="form-error">{errors.description}</div>
        )}
        <div className="form-help">
          Add details about techniques, tips, or specific instructions
        </div>
      </div>

      {/* Cover Photo Editor - FIX: Pass the correct function names */}
      <StepCoverPhotoEditor
        currentPhoto={editForm.stepPhoto}
        onPhotoUpdate={handlePhotoUpdate}
        onPhotoRemove={handlePhotoRemove}
        projectData={projectData}
        isLoading={isUpdating}
      />

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3">
          <div className="text-red-800 dark:text-red-300 text-sm">
            {errors.submit}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!editForm.title.trim() || isUpdating}
          className="btn-primary btn-md flex-1"
        >
          {isUpdating ? (
            <>
              <div className="loading-spinner mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Check size={16} />
              Save Changes
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isUpdating}
          className="btn-tertiary btn-md flex-1"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </form>
  );
};

export default StepEditSection;