// components/shared/wizard/photoGallery/PhotoWizardStepIndicator.jsx - Icons only version
import React from 'react';
import { Check, Camera, Edit, FileText, Eye, Upload } from 'lucide-react';

const STEP_ICONS = {
  select: Camera,
  edit: Edit,
  details: FileText,
  review: Eye,
  upload: Upload
};

const PhotoWizardStepIndicator = ({
  steps,
  currentStep,
  isStepCompleted,
  isStepActive,
  isStepAccessible,
  onStepClick
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const StepIcon = STEP_ICONS[step.id] || Camera;
        const isActive = isStepActive(index);
        const isCompleted = isStepCompleted(index);
        const isAccessible = isStepAccessible(index);

        return (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => isAccessible && onStepClick(index)}
              disabled={!isAccessible}
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                isCompleted
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : isActive
                  ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-gray-900'
                  : isAccessible
                  ? 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-gray-400 cursor-pointer'
                  : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title={step.title}
            >
              {isCompleted ? (
                <Check size={18} />
              ) : (
                <StepIcon size={18} />
              )}
            </button>

            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-4 transition-colors ${
                  isCompleted
                    ? 'bg-indigo-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PhotoWizardStepIndicator;