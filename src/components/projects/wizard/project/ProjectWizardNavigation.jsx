// components/projects/wizard/ProjectWizardNavigation.jsx - Navigation buttons
import React from 'react';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';

const ProjectWizardNavigation = ({
  canGoPrevious,
  canGoNext,
  isLastStep,
  isLoading,
  onPrevious,
  onNext,
  onCancel,
  onSubmit,
  isFormReady,
  isNextDisabled = false // ADD THIS
}) => {
  return (
    <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="btn-tertiary btn-md"
      >
        Cancel
      </button>

      <div className="flex-1 flex gap-3">
        {canGoPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isLoading}
            className="btn-secondary btn-md"
          >
            <ArrowLeft size={16} />
            Previous
          </button>
        )}

        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isFormReady || isLoading}
            className={`btn-primary btn-md flex-1 ${
              !isFormReady || isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Creating Project...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Project
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isLoading || isNextDisabled}
            className={`btn-primary btn-md flex-1 ${
              !canGoNext || isLoading || isNextDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Next
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectWizardNavigation;