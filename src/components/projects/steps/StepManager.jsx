// components/projects/steps/StepManager.jsx
import React from 'react';
import { Plus, ListOrdered, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../../hooks/useSubscription';
import { useUpgradeModal } from '../../../hooks/useUpgradeModal';
import { useStepOperations } from '../../../hooks/steps/useStepOperations';
import { useStepExpansion } from '../../../hooks/steps/useStepExpansion';
import { useStepDragDrop } from '../../../hooks/steps/useStepDragDrop';
import { getStepCompletionStats } from '../../../utils/steps/stepHelpers';
import StepList from './StepList';
import UpgradeModal from '../../shared/UpgradeModal';

const StepManager = ({
  projectData,
  onStepAdded,
  onStepUpdated,
  onStepDeleted,
  onStepsReordered,
  onPaintAssigned,
  onPaintRemoved,
  onPaintAssignmentUpdated,
  onPhotosAssigned,
  onCoverPhotoSet,
  onNotesUpdated,
  className = ''
}) => {
  const navigate = useNavigate();
  const { canPerformAction, getRemainingAllowance, currentTier } = useSubscription();
  const { showUpgradeModal, upgradeModalProps } = useUpgradeModal();

  const steps = projectData?.steps || [];
  const completionStats = getStepCompletionStats(steps);

  // Initialize hooks
  const stepOperations = useStepOperations({
    projectData,
    onStepUpdated,
    onStepDeleted,
    onStepsReordered,
    onPaintAssigned,
    onPaintRemoved,
    onPaintAssignmentUpdated,
    onPhotosAssigned,
    onCoverPhotoSet,
    onNotesUpdated
  });

  const stepExpansion = useStepExpansion();

  const stepDragDrop = useStepDragDrop({
    steps,
    onStepsReordered
  });

  // Handle adding a new step
  const handleAddStep = () => {
    if (!canPerformAction('add_step', 1, projectData)) {
      showUpgradeModal('steps');
      return;
    }
    navigate(`/app/projects/${projectData.id}/steps/new`);
  };

  // Get subscription info
  const remainingSteps = getRemainingAllowance('steps', true, projectData);
  const canAddSteps = canPerformAction('add_step', 1, projectData);
  const isTopTier = currentTier === 'battle';
  const stepButtonDisabled = !canAddSteps && isTopTier;

  return (
    <>
      <div className={`card-base card-padding ${className}`}>

        {/* Header Section */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ListOrdered className="mr-2" size={18} />
                Project Steps ({completionStats.total})
              </h2>

              {/* Progress Display */}
              {completionStats.total > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckSquare size={14} className="mr-1" />
                    {completionStats.completed} of {completionStats.total} completed ({completionStats.percentage}%)
                  </div>
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-emerald-500 h-1 rounded-full transition-all"
                      style={{ width: `${completionStats.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add Step Button */}
          <div className="flex justify-start mt-3">
            <button
              onClick={handleAddStep}
              disabled={stepButtonDisabled}
              className={`btn-primary btn-sm ${stepButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus size={14} />
              {canAddSteps ? "Add Step" : (isTopTier ? "Add Step" : "Upgrade")}
            </button>
          </div>
        </div>

        {/* Usage Info */}
        {remainingSteps !== null && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {remainingSteps > 0 ? (
                <span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {remainingSteps}
                  </span> step{remainingSteps !== 1 ? 's' : ''} remaining
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Step limit reached
                </span>
              )}
            </div>
          </div>
        )}

        {/* Step List */}
        <StepList
          steps={steps}
          projectData={projectData}
          stepOperations={stepOperations}
          stepExpansion={stepExpansion}
          stepDragDrop={stepDragDrop}
          completionStats={completionStats}
        />

      </div>

      {/* Upgrade Modal */}
      <UpgradeModal {...upgradeModalProps} />
    </>
  );
};

export default StepManager;