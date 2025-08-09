// components/projects/ProjectSteps.jsx
import React, { useState } from 'react';
import { Plus, ListOrdered, CheckSquare } from 'lucide-react';
import ProjectStep from './ProjectStep';
import AddStepModal from './AddStepModal';
import { useSubscription } from '../../hooks/useSubscription';
import { useUpgradeModal } from '../../hooks/useUpgradeModal';
import UpgradeModal from '../shared/UpgradeModal';

const ProjectSteps = ({
  projectData,
  onStepAdded,
  onStepUpdated,
  onStepDeleted,
  onStepsReordered,
  onPaintAssigned,
  onPaintRemoved,
  onPaintAssignmentUpdated,
  onPhotosAssigned,
  onNotesUpdated,
  className = ''
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const { canPerformAction, getRemainingAllowance, currentTier } = useSubscription();
  const { showUpgradeModal, upgradeModalProps } = useUpgradeModal();

  const steps = projectData?.steps || [];
  const sortedSteps = [...steps].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Handle adding a new step
  const handleAddStep = () => {
    if (!canPerformAction('add_step', 1, projectData)) {
      showUpgradeModal('steps');
      return;
    }
    setShowAddModal(true);
  };

  // Handle step creation
  const handleStepCreated = async (stepData) => {
    const newStep = {
      id: `step_${Date.now()}`,
      title: stepData.title,
      description: stepData.description,
      order: steps.length + 1,
      completed: false,
      paints: [],
      photos: [],
      notes: [],
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    try {
      await onStepAdded(newStep);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding step:', error);
      throw error; // Re-throw so modal can handle UI feedback
    }
  };

  // Handle desktop drag start
  const handleDragStart = (e, stepId) => {
    e.dataTransfer.setData('text/plain', stepId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle desktop drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle desktop drop
  const handleDesktopDrop = async (e, dropData) => {
    const { draggedItemId, targetItemId } = dropData;

    if (draggedItemId === targetItemId) return;

    const draggedIndex = sortedSteps.findIndex(step => step.id === draggedItemId);
    const targetIndex = sortedSteps.findIndex(step => step.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order array
    const reorderedSteps = [...sortedSteps];
    const [movedStep] = reorderedSteps.splice(draggedIndex, 1);
    reorderedSteps.splice(targetIndex, 0, movedStep);

    // Update order numbers
    const updatedSteps = reorderedSteps.map((step, index) => ({
      ...step,
      order: index + 1
    }));

    try {
      await onStepsReordered(updatedSteps);
    } catch (error) {
      console.error('Error reordering steps:', error);
    }
  };

  // Handle mobile reordering with real-time visual feedback
  const handleMobileReorder = async (reorderData) => {
    const { itemId, fromIndex, toIndex, isDragging } = reorderData;

    console.log('Mobile reorder:', { itemId, fromIndex, toIndex, isDragging }); // Debug log

    // Validate indices
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= sortedSteps.length) {
      return;
    }

    // For real-time visual feedback during drag, we might want to update local state
    // For now, let's handle the final reorder when dragging is complete
    if (!isDragging) {
      // Create new order array
      const reorderedSteps = [...sortedSteps];
      const [movedStep] = reorderedSteps.splice(fromIndex, 1);
      reorderedSteps.splice(toIndex, 0, movedStep);

      // Update order numbers
      const updatedSteps = reorderedSteps.map((step, index) => ({
        ...step,
        order: index + 1
      }));

      try {
        await onStepsReordered(updatedSteps);
      } catch (error) {
        console.error('Error reordering steps:', error);
      }
    }
  };

  // Toggle step expansion
  const toggleStepExpansion = (stepId) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  // Calculate completion statistics
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const remainingSteps = getRemainingAllowance('steps', true, projectData);

  // Button logic
  const canAddSteps = canPerformAction('add_step', 1, projectData);
  const isTopTier = currentTier === 'battle';
  const stepButtonDisabled = !canAddSteps && isTopTier;

  return (
    <>
      <div className={`card-base card-padding ${className}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ListOrdered className="mr-2" size={18} />
              Project Steps ({totalSteps})
            </h2>
            {totalSteps > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CheckSquare size={14} className="mr-1" />
                  {completedSteps} of {totalSteps} completed ({completionPercentage}%)
                </div>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-emerald-500 h-1 rounded-full transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAddStep}
            disabled={stepButtonDisabled}
            className={`btn-primary btn-sm ${stepButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus size={14} />
            {canAddSteps ? "Add Step" : (isTopTier ? "Add Step" : "Upgrade")}
          </button>
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

        {/* Steps List */}
        {sortedSteps.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <ListOrdered className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="mb-3">No steps created yet</p>
            <button
              onClick={handleAddStep}
              disabled={stepButtonDisabled}
              className={`btn-primary btn-sm ${stepButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus size={14} />
              {canAddSteps ? "Create Your First Step" : (isTopTier ? "Create Your First Step" : "Upgrade")}
            </button>
          </div>
        ) : (
          <div className="steps-container space-y-3">
            {sortedSteps.map((step, index) => (
              <ProjectStep
                key={step.id}
                step={step}
                stepNumber={index + 1}
                totalSteps={sortedSteps.length}
                isExpanded={expandedSteps.has(step.id)}
                projectData={projectData}
                onToggleExpansion={() => toggleStepExpansion(step.id)}
                onStepUpdated={onStepUpdated}
                onStepDeleted={onStepDeleted}
                onDesktopDrop={handleDesktopDrop}
                onMobileReorder={handleMobileReorder}
                onPaintAssigned={onPaintAssigned}
                onPaintRemoved={onPaintRemoved}
                onPaintAssignmentUpdated={onPaintAssignmentUpdated}
                onPhotosAssigned={onPhotosAssigned}
                onNotesUpdated={onNotesUpdated}
              />
            ))}
          </div>
        )}

        {/* Completion Summary */}
        {totalSteps > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              {completedSteps === totalSteps ? (
                <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                  🎉 All steps completed! Great work!
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  {totalSteps - completedSteps} step{totalSteps - completedSteps !== 1 ? 's' : ''} remaining
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Step Modal */}
      <AddStepModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onStepCreated={handleStepCreated}
        stepNumber={steps.length + 1}
      />

      {/* Upgrade Modal */}
      <UpgradeModal {...upgradeModalProps} />
    </>
  );
};

export default ProjectSteps;