// components/projects/ProjectStep.jsx
import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Edit2,
  Trash2,
  Check,
  X,
  Calendar,
  Palette,
  Camera,
  FileText
} from 'lucide-react';
import DesktopDragWrapper from '../shared/DesktopDragWrapper';
import MobileDragWrapper from '../shared/MobileDragWrapper';
import StepPaintAssignment from './StepPaintAssignment';
import StepPhotoAssignment from './StepPhotoAssignment';
import StepNotesManager from './StepNotesManager';

const ProjectStep = ({
  step,
  stepNumber,
  totalSteps,
  isExpanded,
  projectData,
  onToggleExpansion,
  onStepUpdated,
  onStepDeleted,
  onDesktopDrop,
  onMobileReorder,
  onPaintAssigned,
  onPaintRemoved,
  onPaintAssignmentUpdated,
  onPhotosAssigned,
  onNotesUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: step.title,
    description: step.description
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle completion toggle
  const handleToggleComplete = async () => {
    setIsUpdating(true);
    try {
      const updatedStep = {
        ...step,
        completed: !step.completed,
        completedAt: !step.completed ? new Date().toISOString() : null
      };
      await onStepUpdated(step.id, updatedStep);
    } catch (error) {
      console.error('Error updating step completion:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle edit save
  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) return;

    setIsUpdating(true);
    try {
      const updatedStep = {
        ...step,
        title: editForm.title.trim(),
        description: editForm.description.trim()
      };
      await onStepUpdated(step.id, updatedStep);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating step:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle edit cancel
  const handleCancelEdit = () => {
    setEditForm({
      title: step.title,
      description: step.description
    });
    setIsEditing(false);
  };

  // Handle paint assignment to step
  const handlePaintAssigned = async (assignment) => {
    if (onPaintAssigned) {
      await onPaintAssigned(step.id, assignment);
    }
  };

  // Handle removing paint from step
  const handlePaintRemoved = async (paintId) => {
    if (onPaintRemoved) {
      await onPaintRemoved(step.id, paintId);
    }
  };

  // Handle updating paint assignment
  const handlePaintAssignmentUpdated = async (paintId, updates) => {
    if (onPaintAssignmentUpdated) {
      await onPaintAssignmentUpdated(step.id, paintId, updates);
    }
  };

  // Handle photo assignment to step
  const handlePhotosAssigned = async (photoUrls) => {
    if (onPhotosAssigned) {
      await onPhotosAssigned(step.id, photoUrls);
    }
  };

  // Handle notes update
  const handleNotesUpdated = async (updatedNotes) => {
    if (onNotesUpdated) {
      await onNotesUpdated(step.id, updatedNotes);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await onStepDeleted(step.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting step:', error);
    }
  };

  // Get counts for display
  const paintCount = step.paints?.length || 0;
  const photoCount = step.photos?.length || 0;
  const noteCount = step.notes?.length || 0;

  // Shared step content
  const StepContent = () => (
    <>
      {/* Step Header */}
      <div className="flex items-center gap-3 p-4">

        {/* Drag Handle */}
        <div className="drag-handle mobile-touch-target">
          <GripVertical size={18} />
        </div>

        {/* Step Number & Completion */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleComplete}
            disabled={isUpdating}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              step.completed
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500'
            }`}
          >
            {step.completed && <Check size={14} />}
          </button>

          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step.completed 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {stepNumber}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                className="form-input text-base font-medium"
                placeholder="Step title"
                autoFocus
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="form-textarea text-sm"
                placeholder="Step description (optional)"
                rows="2"
              />
            </div>
          ) : (
            <div>
              <h3 className={`font-medium text-base ${
                step.completed 
                  ? 'text-emerald-800 dark:text-emerald-300 line-through' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {step.title}
              </h3>
              {step.description && (
                <p className={`text-sm mt-1 ${
                  step.completed 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {step.description}
                </p>
              )}

              {/* Step Meta Info */}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                {paintCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Palette size={12} />
                    {paintCount} paint{paintCount !== 1 ? 's' : ''}
                  </span>
                )}
                {photoCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Camera size={12} />
                    {photoCount} photo{photoCount !== 1 ? 's' : ''}
                  </span>
                )}
                {noteCount > 0 && (
                  <span className="flex items-center gap-1">
                    <FileText size={12} />
                    {noteCount} note{noteCount !== 1 ? 's' : ''}
                  </span>
                )}
                {step.completedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Completed {new Date(step.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                disabled={!editForm.title.trim() || isUpdating}
                className="p-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                <Check size={16} />
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Edit step"
              >
                <Edit2 size={16} />
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                title="Delete step"
              >
                <Trash2 size={16} />
              </button>

              <button
                onClick={onToggleExpansion}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && !isEditing && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-6">

          {/* Step Photos */}
          <StepPhotoAssignment
            step={step}
            projectData={projectData}
            onPhotosAssigned={handlePhotosAssigned}
            maxPhotos={10}
          />

          {/* Paint Assignments */}
          <StepPaintAssignment
            step={step}
            projectData={projectData}
            onPaintAssigned={handlePaintAssigned}
            onPaintRemoved={handlePaintRemoved}
            onAssignmentUpdated={handlePaintAssignmentUpdated}
            maxPaints={10}
          />

          {/* Step Notes */}
          <StepNotesManager
            step={step}
            projectData={projectData}
            onNotesUpdated={handleNotesUpdated}
            maxNotes={10}
          />
        </div>
      )}
    </>
  );

  const stepClassName = `mobile-drag-item border border-gray-200 dark:border-gray-700 rounded-xl transition-all ${
    step.completed ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-gray-800'
  }`;

  return (
    <>
      {/* Desktop Drag Version */}
      <DesktopDragWrapper
        itemId={step.id}
        onDrop={onDesktopDrop}
        disabled={isEditing}
        className={`desktop-drag-item ${stepClassName}`}
        dragData={{ stepNumber, title: step.title }}
      >
        <StepContent />
      </DesktopDragWrapper>

      {/* Mobile Touch Version */}
      <MobileDragWrapper
        itemId={step.id}
        itemIndex={stepNumber - 1}
        totalItems={totalSteps}
        onReorder={onMobileReorder}
        disabled={isEditing}
        className={stepClassName}
        threshold={80}
        direction="vertical"
      >
        <StepContent />
      </MobileDragWrapper>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Step?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete "{step.title}" and all its paint assignments and photos. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-tertiary btn-md flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger btn-md flex-1"
              >
                Delete Step
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectStep;