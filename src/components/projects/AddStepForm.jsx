// components/projects/AddStepForm.jsx - Updated main form wrapper
import React from 'react';
import AddStepWizard from './wizard/step/AddStepWizard';

const AddStepForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  stepNumber = 1,
  projectData
}) => {
  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
            {stepNumber}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Step
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add a new step to your project with details, paints, photos, and notes
          </p>
        </div>
      </div>

      {/* Wizard */}
      <AddStepWizard
        onSubmit={onSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
        stepNumber={stepNumber}
        projectData={projectData}
      />
    </div>
  );
};

export default AddStepForm;