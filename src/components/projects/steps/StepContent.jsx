// components/projects/steps/StepContent.jsx
import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import StepCompletionSection from './sections/StepCompletionSection';
import StepPhotoSection from './sections/StepPhotoSection';
import StepPaintSection from './sections/StepPaintSection';
import StepNotesSection from './sections/StepNotesSection';
import StepEditSection from './sections/StepEditSection';
import StepActions from './StepActions';

const StepContent = ({
  step,
  stepNumber,
  totalSteps,
  projectData,
  stepOperations
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle starting edit mode
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  // Handle saving edits
  const handleSaveEdit = async (editData) => {
    try {
      await stepOperations.updateStep(step.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving step edit:', error);
      throw error;
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Handle delete confirmation
  const handleShowDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  // Handle step deletion
  const handleDeleteStep = async () => {
    try {
      await stepOperations.deleteStep(step.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting step:', error);
    }
  };

  // Handle completion toggle
  const handleToggleCompletion = async () => {
    await stepOperations.toggleStepCompletion(step, stepNumber, totalSteps);
  };

  // Handle paint assignment
  const handlePaintAssigned = async (assignment) => {
    await stepOperations.assignPaint(step.id, assignment);
  };

  // Handle paint removal
  const handlePaintRemoved = async (paintId) => {
    await stepOperations.removePaint(step.id, paintId);
  };

  // Handle paint assignment update
  const handlePaintAssignmentUpdated = async (paintId, updates) => {
    await stepOperations.updatePaintAssignment(step.id, paintId, updates);
  };

  // Handle photo assignment
  const handlePhotosAssigned = async (photoUrls) => {
    await stepOperations.assignPhotos(step.id, photoUrls);
  };

  // Handle notes update
  const handleNotesUpdated = async (updatedNotes) => {
    await stepOperations.updateNotes(step.id, updatedNotes);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-6">

      {/* Edit Mode */}
      {isEditing ? (
       <StepEditSection
  step={step}
  onSave={handleSaveEdit}
  onCancel={handleCancelEdit}
  isUpdating={stepOperations.isUpdating}
  projectData={projectData} // Add this line
/>
      ) : (
        <>
          {/* Completion Section */}
          <StepCompletionSection
            step={step}
            onToggleCompletion={handleToggleCompletion}
            isUpdating={stepOperations.isUpdating}
          />

          {/* Photo Section */}
          <StepPhotoSection
            step={step}
            projectData={projectData}
            onPhotosAssigned={handlePhotosAssigned}
            maxPhotos={10}
          />

          {/* Paint Section */}
          <StepPaintSection
            step={step}
            projectData={projectData}
            onPaintAssigned={handlePaintAssigned}
            onPaintRemoved={handlePaintRemoved}
            onAssignmentUpdated={handlePaintAssignmentUpdated}
            maxPaints={10}
          />

          {/* Notes Section */}
          <StepNotesSection
            step={step}
            projectData={projectData}
            onNotesUpdated={handleNotesUpdated}
            maxNotes={10}
          />

          {/* Actions Section */}
          <StepActions
            step={step}
            onStartEdit={handleStartEdit}
            onShowDeleteConfirm={handleShowDeleteConfirm}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Step?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete "{step.title}" and all its paint assignments, photos, and notes. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-tertiary btn-md flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStep}
                className="btn-danger btn-md flex-1"
              >
                Delete Step
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepContent;