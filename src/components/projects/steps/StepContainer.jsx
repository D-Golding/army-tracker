// components/projects/steps/StepContainer.jsx
import React from 'react';
import DesktopDragWrapper from '../../shared/DesktopDragWrapper';
import MobileDragWrapper from '../../shared/MobileDragWrapper';
import StepHeader from './StepHeader';
import StepContent from './StepContent';
import { formatStepForDisplay } from '../../../utils/steps/stepHelpers';

const StepContainer = ({
  step,
  stepNumber,
  totalSteps,
  projectData,
  stepOperations,
  stepExpansion,
  stepDragDrop
}) => {
  const formattedStep = formatStepForDisplay(step, stepNumber);
  const isExpanded = stepExpansion.isStepExpanded(step.id);
  const isEditing = false; // This will be managed by StepContent

  // Handle expansion toggle
  const handleToggleExpansion = () => {
    stepExpansion.toggleStepExpansion(step.id);
  };

  // Shared step UI content
  const StepUI = () => (
    <>
      {/* Step Header */}
      <StepHeader
        step={formattedStep}
        stepNumber={stepNumber}
        isExpanded={isExpanded}
        isCompleted={step.completed}
        onToggleExpansion={handleToggleExpansion}
      />

      {/* Step Content (when expanded) */}
      {isExpanded && (
        <StepContent
          step={step}
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          projectData={projectData}
          stepOperations={stepOperations}
        />
      )}
    </>
  );

  const stepClassName = `
    border border-gray-200 dark:border-gray-700 
    rounded-xl transition-all bg-white dark:bg-gray-800 
    hover:border-gray-300 dark:hover:border-gray-600
    ${step.completed ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : ''}
  `.trim();

  return (
    <>
      {/* Desktop Drag Version */}
      <DesktopDragWrapper
        itemId={step.id}
        onDrop={stepDragDrop.handleDesktopDrop}
        disabled={isEditing}
        className={`desktop-drag-item ${stepClassName}`}
        dragData={{ stepNumber, title: step.title }}
      >
        <StepUI />
      </DesktopDragWrapper>

      {/* Mobile Touch Version */}
      <MobileDragWrapper
        itemId={step.id}
        itemIndex={stepNumber - 1}
        totalItems={totalSteps}
        onReorder={stepDragDrop.handleMobileReorder}
        disabled={isEditing}
        className={stepClassName}
        threshold={80}
        direction="vertical"
      >
        <StepUI />
      </MobileDragWrapper>
    </>
  );
};

export default StepContainer;