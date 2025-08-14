// components/projects/detail/ProjectStepsSection.jsx
import React from 'react';
import StepManager from '../steps/StepManager';

const ProjectStepsSection = ({ project, handlers, className = "mb-6" }) => {
  const {
    handleStepAdded,
    handleStepUpdated,
    handleStepDeleted,
    handleStepsReordered,
    handlePaintAssigned,
    handlePaintRemovedFromStep,
    handlePaintAssignmentUpdated,
    handlePhotosAssigned,
    handleStepCoverPhotoSet,
    handleNotesUpdated,
  } = handlers;

  return (
    <StepManager
      projectData={project}
      onStepAdded={handleStepAdded}
      onStepUpdated={handleStepUpdated}
      onStepDeleted={handleStepDeleted}
      onStepsReordered={handleStepsReordered}
      onPaintAssigned={handlePaintAssigned}
      onPaintRemoved={handlePaintRemovedFromStep}
      onPaintAssignmentUpdated={handlePaintAssignmentUpdated}
      onPhotosAssigned={handlePhotosAssigned}
      onCoverPhotoSet={handleStepCoverPhotoSet}
      onNotesUpdated={handleNotesUpdated}
      className={className}
    />
  );
};

export default ProjectStepsSection;