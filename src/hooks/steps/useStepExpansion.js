// hooks/steps/useStepExpansion.js
import { useState, useCallback } from 'react';

export const useStepExpansion = (initialExpandedSteps = []) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set(initialExpandedSteps));

  // Toggle expansion for a specific step
  const toggleStepExpansion = useCallback((stepId) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  }, []);

  // Check if a step is expanded
  const isStepExpanded = useCallback((stepId) => {
    return expandedSteps.has(stepId);
  }, [expandedSteps]);

  // Expand a specific step
  const expandStep = useCallback((stepId) => {
    setExpandedSteps(prev => new Set([...prev, stepId]));
  }, []);

  // Collapse a specific step
  const collapseStep = useCallback((stepId) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId);
      return newSet;
    });
  }, []);

  // Expand all steps
  const expandAllSteps = useCallback((stepIds) => {
    setExpandedSteps(new Set(stepIds));
  }, []);

  // Collapse all steps
  const collapseAllSteps = useCallback(() => {
    setExpandedSteps(new Set());
  }, []);

  // Get count of expanded steps
  const expandedCount = expandedSteps.size;

  return {
    expandedSteps,
    isStepExpanded,
    toggleStepExpansion,
    expandStep,
    collapseStep,
    expandAllSteps,
    collapseAllSteps,
    expandedCount
  };
};