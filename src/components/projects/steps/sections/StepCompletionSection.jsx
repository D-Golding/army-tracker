// components/projects/steps/sections/StepCompletionSection.jsx
import React from 'react';

const StepCompletionSection = ({
  step,
  onToggleCompletion,
  isUpdating
}) => {
  return (
    <div>
      <button
        onClick={onToggleCompletion}
        disabled={isUpdating}
        className={`btn-md w-full transition-all ${
          step.completed
            ? 'bg-gray-500 hover:bg-gray-600 text-white'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        }`}
        aria-label={step.completed ? 'Mark step as incomplete' : 'Mark step as complete'}
      >
        {isUpdating ? (
          <>
            <div className="loading-spinner mr-2"></div>
            Updating...
          </>
        ) : step.completed ? (
          'Mark as Incomplete'
        ) : (
          'Mark as Complete'
        )}
      </button>

      {/* Completion timestamp */}
      {step.completed && step.completedAt && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Completed on {new Date(step.completedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default StepCompletionSection;