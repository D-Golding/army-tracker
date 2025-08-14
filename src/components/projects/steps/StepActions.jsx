// components/projects/steps/StepActions.jsx
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const StepActions = ({
  step,
  onStartEdit,
  onShowDeleteConfirm
}) => {
  return (
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">

      {/* Edit Button */}
      <button
        onClick={onStartEdit}
        className="btn-tertiary btn-md w-full"
        aria-label={`Edit step: ${step.title}`}
      >
        <Edit2 size={16} />
        Edit Step Details
      </button>

      {/* Delete Button */}
      <button
        onClick={onShowDeleteConfirm}
        className="btn-danger btn-md w-full"
        aria-label={`Delete step: ${step.title}`}
      >
        <Trash2 size={16} />
        Delete Step
      </button>
    </div>
  );
};

export default StepActions;