// hooks/steps/useStepDragDrop.js
import { useCallback } from 'react';

export const useStepDragDrop = ({ steps, onStepsReordered }) => {
  // Handle desktop drag and drop
  const handleDesktopDrop = useCallback(async (e, dropData) => {
    const { draggedItemId, targetItemId } = dropData;

    if (draggedItemId === targetItemId) return;

    const sortedSteps = [...steps].sort((a, b) => (a.order || 0) - (b.order || 0));
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
      throw error;
    }
  }, [steps, onStepsReordered]);

  // Handle mobile touch reordering
  const handleMobileReorder = useCallback(async (reorderData) => {
    const { itemId, fromIndex, toIndex, isDragging } = reorderData;

    // Validate indices
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= steps.length) {
      return;
    }

    // Only execute reorder when drag is complete
    if (!isDragging) {
      const sortedSteps = [...steps].sort((a, b) => (a.order || 0) - (b.order || 0));

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
        throw error;
      }
    }
  }, [steps, onStepsReordered]);

  // Get sorted steps for consistent ordering
  const getSortedSteps = useCallback(() => {
    return [...steps].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [steps]);

  // Check if reordering is possible
  const canReorder = steps.length > 1;

  return {
    handleDesktopDrop,
    handleMobileReorder,
    getSortedSteps,
    canReorder
  };
};