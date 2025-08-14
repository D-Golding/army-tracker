// utils/steps/stepHelpers.js

// Get step completion statistics
export const getStepCompletionStats = (steps) => {
  if (!steps || steps.length === 0) {
    return {
      total: 0,
      completed: 0,
      remaining: 0,
      percentage: 0
    };
  }

  const total = steps.length;
  const completed = steps.filter(step => step.completed).length;
  const remaining = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    remaining,
    percentage
  };
};

// Get next step number for new steps
export const getNextStepNumber = (steps) => {
  if (!steps || steps.length === 0) return 1;

  const maxOrder = Math.max(...steps.map(step => step.order || 0));
  return maxOrder + 1;
};

// Format step data for creation
export const formatStepData = (stepInput, projectId, stepNumber) => {
  const now = new Date().toISOString();

  return {
    id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: stepInput.title.trim(),
    description: stepInput.description?.trim() || '',
    stepPhoto: stepInput.stepPhoto || null, // Include stepPhoto in creation
    order: stepNumber,
    completed: false,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    projectId,
    paints: stepInput.paints || [], // Include wizard paints
    photos: stepInput.photos || [], // Include wizard photos
    notes: stepInput.notes || [] // Include wizard notes
  };
};

// Validate step data
export const validateStepData = (stepData) => {
  const errors = [];

  if (!stepData.title || !stepData.title.trim()) {
    errors.push('Step title is required');
  }

  if (stepData.title && stepData.title.length > 100) {
    errors.push('Step title must be less than 100 characters');
  }

  if (stepData.description && stepData.description.length > 500) {
    errors.push('Step description must be less than 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get step cover photo (first photo if available)
export const getStepCoverPhoto = (step) => {
  return step.photos?.[0] || null;
};

// Get step paint count
export const getStepPaintCount = (step) => {
  return step.paints?.length || 0;
};

// Get step photo count
export const getStepPhotoCount = (step) => {
  return step.photos?.length || 0;
};

// Get step note count
export const getStepNoteCount = (step) => {
  return step.notes?.length || 0;
};

// Check if step has content
export const stepHasContent = (step) => {
  return (
    getStepPaintCount(step) > 0 ||
    getStepPhotoCount(step) > 0 ||
    getStepNoteCount(step) > 0 ||
    (step.description && step.description.trim())
  );
};

// Format step for display
export const formatStepForDisplay = (step, stepNumber) => {
  return {
    ...step,
    displayNumber: stepNumber,
    stepPhoto: step.stepPhoto, // Preserve stepPhoto field
    coverPhoto: getStepCoverPhoto(step),
    paintCount: getStepPaintCount(step),
    photoCount: getStepPhotoCount(step),
    noteCount: getStepNoteCount(step),
    hasContent: stepHasContent(step),
    displayTitle: step.title || `Step ${stepNumber}`
  };
};

// Reorder steps and update order numbers
export const reorderSteps = (steps, fromIndex, toIndex) => {
  if (fromIndex === toIndex) return steps;

  const reorderedSteps = [...steps];
  const [movedStep] = reorderedSteps.splice(fromIndex, 1);
  reorderedSteps.splice(toIndex, 0, movedStep);

  // Update order numbers
  return reorderedSteps.map((step, index) => ({
    ...step,
    order: index + 1
  }));
};

// Get step by ID
export const getStepById = (steps, stepId) => {
  return steps.find(step => step.id === stepId) || null;
};

// Get step index by ID
export const getStepIndexById = (steps, stepId) => {
  return steps.findIndex(step => step.id === stepId);
};

// Check if step can be deleted (last step logic, etc.)
export const canDeleteStep = (steps, stepId) => {
  // Always allow deletion for now
  // Could add logic like "can't delete if it's the only step" etc.
  return true;
};

// Get completion message
export const getCompletionMessage = (completedCount, totalCount) => {
  if (completedCount === 0) {
    return "Ready to start your first step!";
  }

  if (completedCount === totalCount) {
    return "🎉 All steps completed! Great work!";
  }

  const remaining = totalCount - completedCount;
  return `${remaining} step${remaining !== 1 ? 's' : ''} remaining`;
};