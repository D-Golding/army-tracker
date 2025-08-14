// components/projects/wizard/StepPaintsForm.jsx - Paint assignment interface
import React from 'react';
import { Palette } from 'lucide-react';
import { useSubscription } from '../../../../hooks/useSubscription';
import { useUpgradeModal } from '../../../../hooks/useUpgradeModal';
import PaintAssignmentCard from './../shared/PaintAssignmentCard.jsx';
import AddPaintAssignmentForm from './../shared/AddPaintAssignmentForm.jsx';
import UpgradeModal from '../../../shared/UpgradeModal';

const StepPaintsForm = ({
  formData,
  projectData,
  onPaintAssigned,
  onPaintRemoved,
  onPaintUpdated
}) => {
  const { canPerformAction, getRemainingAllowance } = useSubscription();
  const { showUpgradeModal, upgradeModalProps } = useUpgradeModal();

  const projectPaints = projectData?.paintOverview || [];

  // Get available paints for assignment
  const availablePaints = projectPaints.filter(projectPaint =>
    !formData.paints.some(stepPaint => stepPaint.paintId === projectPaint.paintId)
  );

  const remainingAssignments = getRemainingAllowance('paintAssignments', true, projectData);
  const canAssignPaint = canPerformAction('add_paint_assignment', 1, projectData);

  const handlePaintAssigned = (assignment) => {
    if (!canAssignPaint) {
      showUpgradeModal('paintAssignments');
      return;
    }
    onPaintAssigned(assignment);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Palette className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Paint Assignments
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Assign paints from your project to this step (optional)
          </p>
        </div>

        {/* Current Assignments */}
        {formData.paints.length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Assigned Paints ({formData.paints.length})
            </h4>
            {formData.paints.map((assignment) => (
              <PaintAssignmentCard
                key={assignment.paintId}
                assignment={assignment}
                onRemove={() => onPaintRemoved(assignment.paintId)}
                onUpdate={(updates) => onPaintUpdated(assignment.paintId, updates)}
              />
            ))}
          </div>
        )}

        {/* Add Paint Assignment */}
        {availablePaints.length > 0 && (canAssignPaint || formData.paints.length === 0) && (
          <AddPaintAssignmentForm
            availablePaints={availablePaints}
            onPaintAssigned={handlePaintAssigned}
            canAssign={canAssignPaint}
            remainingAssignments={remainingAssignments}
          />
        )}

        {/* No paints available */}
        {availablePaints.length === 0 && formData.paints.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Palette className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-sm">No paints available for assignment</p>
            <p className="text-xs mt-1">Add paints to your project overview first</p>
          </div>
        )}

        {/* Skip option */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can always add paint assignments later
          </p>
        </div>
      </div>

      <UpgradeModal {...upgradeModalProps} />
    </>
  );
};

export default StepPaintsForm;