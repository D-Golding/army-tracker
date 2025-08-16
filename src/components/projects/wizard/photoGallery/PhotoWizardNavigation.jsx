// components/shared/wizard/photoGallery/PhotoWizardNavigation.jsx - Navigation buttons
import React from 'react';
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react';

const PhotoWizardNavigation = ({
  canGoPrevious,
  canGoNext,
  isLastStep,
  isLoading,
  onPrevious,
  onNext,
  onCancel,
  onSubmit,
  isWizardReady
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
            disabled={!isWizardReady || isLoading}
            className="btn-primary btn-md flex-1"
          >
            {isLoading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Processing Photos...
              </>
            ) : (
              <>
                <Upload size={16} />
                Start Upload
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            className="btn-primary btn-md flex-1"
          >
            Next
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PhotoWizardNavigation;