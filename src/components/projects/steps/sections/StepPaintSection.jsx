// components/projects/steps/sections/StepPaintSection.jsx
import React, { useState } from 'react';
import { Palette, Plus, X, Edit2, Check, Info } from 'lucide-react';
import { useSubscription } from '../../../../hooks/useSubscription';
import { useUpgradeModal } from '../../../../hooks/useUpgradeModal';
import { PAINT_TECHNIQUES } from '../../../../utils/steps/stepConstants';
import UpgradeModal from '../../../shared/UpgradeModal';

const StepPaintSection = ({
  step,
  projectData,
  onPaintAssigned,
  onPaintRemoved,
  onAssignmentUpdated,
  maxPaints = 10
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editForm, setEditForm] = useState({ usage: '', technique: '' });
  const [showAllPaints, setShowAllPaints] = useState(false);

  const { canPerformAction, getRemainingAllowance, currentTier } = useSubscription();
  const { showUpgradeModal, upgradeModalProps } = useUpgradeModal();

  const stepPaints = step.paints || [];
  const projectPaints = projectData?.paintOverview || [];

  // Get paints available for assignment (not yet assigned to this step)
  const availablePaints = projectPaints.filter(projectPaint =>
    !stepPaints.some(stepPaint => stepPaint.paintId === projectPaint.paintId)
  );

  // Handle adding paint to step
  const handleAddPaint = () => {
    if (!canPerformAction('add_paint_assignment', 1, projectData)) {
      showUpgradeModal('paintAssignments');
      return;
    }
    setShowAddModal(true);
  };

  // Handle paint assignment
  const handlePaintAssigned = async (paintData, usage, technique) => {
    const assignment = {
      paintId: paintData.paintId,
      paintName: paintData.paintName,
      brand: paintData.brand,
      type: paintData.type,
      usage: usage.trim(),
      technique: technique || 'brush',
      assignedAt: new Date().toISOString()
    };

    try {
      await onPaintAssigned(assignment);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error assigning paint to step:', error);
    }
  };

  // Handle removing paint assignment
  const handleRemovePaint = async (paintId) => {
    try {
      await onPaintRemoved(paintId);
    } catch (error) {
      console.error('Error removing paint from step:', error);
    }
  };

  // Handle editing assignment
  const startEdit = (assignment) => {
    setEditingAssignment(assignment.paintId);
    setEditForm({
      usage: assignment.usage || '',
      technique: assignment.technique || 'brush'
    });
  };

  const saveEdit = async (paintId) => {
    try {
      await onAssignmentUpdated(paintId, {
        usage: editForm.usage.trim(),
        technique: editForm.technique
      });
      setEditingAssignment(null);
      setEditForm({ usage: '', technique: '' });
    } catch (error) {
      console.error('Error updating paint assignment:', error);
    }
  };

  const cancelEdit = () => {
    setEditingAssignment(null);
    setEditForm({ usage: '', technique: '' });
  };

  const remainingAssignments = getRemainingAllowance('paintAssignments', true, projectData);
  const canAddMore = stepPaints.length < maxPaints && availablePaints.length > 0;

  // Button logic
  const canAssignPaint = canPerformAction('add_paint_assignment', 1, projectData);
  const isTopTier = currentTier === 'battle';
  const assignButtonDisabled = !canAssignPaint && isTopTier;

  // Get paints to display (show 2 initially, all when expanded)
  const displayPaints = showAllPaints ? stepPaints : stepPaints.slice(0, 2);
  const hasMorePaints = stepPaints.length > 2;

  return (
    <>
      <div className="space-y-3">

        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
            <Palette size={14} className="mr-1" />
            Paint Assignments ({stepPaints.length})
          </h4>

          {canAddMore && (
            <button
              onClick={handleAddPaint}
              disabled={assignButtonDisabled}
              className={`btn-tertiary btn-sm ${assignButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus size={12} />
              Add Paint
            </button>
          )}
        </div>

        {/* Assignment Limit Info */}
        {remainingAssignments !== null && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {remainingAssignments > 0 ? (
              <span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {remainingAssignments}
                </span> assignment{remainingAssignments !== 1 ? 's' : ''} remaining across all steps
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Paint assignment limit reached
              </span>
            )}
          </div>
        )}

        {/* Paint Assignments List */}
        {stepPaints.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <Palette className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-sm">No paints assigned to this step</p>
            {availablePaints.length === 0 && (
              <p className="text-xs mt-1">Add paints to project overview first</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayPaints.map((assignment) => (
              <div
                key={assignment.paintId}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
              >
                {/* Paint Info Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {assignment.paintName}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {assignment.brand} • {assignment.type}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(assignment)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Edit assignment"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleRemovePaint(assignment.paintId)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Remove assignment"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                {/* Assignment Details */}
                {editingAssignment === assignment.paintId ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Usage Notes
                      </label>
                      <input
                        type="text"
                        value={editForm.usage}
                        onChange={(e) => setEditForm({ ...editForm, usage: e.target.value })}
                        className="form-input text-xs"
                        placeholder="e.g., Helmet and gun - thinned 2:1 with water"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Technique
                      </label>
                      <select
                        value={editForm.technique}
                        onChange={(e) => setEditForm({ ...editForm, technique: e.target.value })}
                        className="form-select text-xs"
                      >
                        {PAINT_TECHNIQUES.map(technique => (
                          <option key={technique.value} value={technique.value}>
                            {technique.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(assignment.paintId)}
                        className="btn-primary btn-sm flex-1"
                      >
                        <Check size={12} />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="btn-tertiary btn-sm flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {assignment.usage && (
                      <div className="text-xs text-gray-700 dark:text-gray-300">
                        <Info size={10} className="inline mr-1" />
                        {assignment.usage}
                      </div>
                    )}
                    {assignment.technique && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Technique: {PAINT_TECHNIQUES.find(t => t.value === assignment.technique)?.label || assignment.technique}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* See All / Show Less Button */}
            {hasMorePaints && (
              <button
                onClick={() => setShowAllPaints(!showAllPaints)}
                className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
              >
                {showAllPaints ? (
                  <>Show Less</>
                ) : (
                  <>See All ({stepPaints.length - 2} more)</>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Paint Assignment Modal */}
      {showAddModal && (
        <AddPaintAssignmentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          availablePaints={availablePaints}
          onPaintAssigned={handlePaintAssigned}
          maxSelection={Math.min(maxPaints - stepPaints.length, remainingAssignments || Infinity)}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal {...upgradeModalProps} />
    </>
  );
};

// Simple Add Paint Assignment Modal Component
const AddPaintAssignmentModal = ({
  isOpen,
  onClose,
  availablePaints,
  onPaintAssigned,
  maxSelection = 1
}) => {
  const [selectedPaint, setSelectedPaint] = useState(null);
  const [usage, setUsage] = useState('');
  const [technique, setTechnique] = useState('brush');
  const [isAssigning, setIsAssigning] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPaint) return;

    setIsAssigning(true);
    try {
      await onPaintAssigned(selectedPaint, usage, technique);
      // Reset form
      setSelectedPaint(null);
      setUsage('');
      setTechnique('brush');
    } catch (error) {
      console.error('Error in modal submit:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    if (!isAssigning) {
      setSelectedPaint(null);
      setUsage('');
      setTechnique('brush');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Paint to Step
          </h3>
          <button
            onClick={handleClose}
            disabled={isAssigning}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Paint Selection */}
          <div>
            <label className="form-label">Select Paint *</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availablePaints.map((paint) => (
                <div
                  key={paint.paintId}
                  onClick={() => setSelectedPaint(paint)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all ${
                    selectedPaint?.paintId === paint.paintId
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {paint.paintName}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {paint.brand} • {paint.type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Details */}
          <div>
            <label className="form-label">Usage Notes</label>
            <input
              type="text"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              className="form-input"
              placeholder="e.g., For helmet and gun"
              disabled={isAssigning}
            />
          </div>

          <div>
            <label className="form-label">Technique</label>
            <select
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
              className="form-select"
              disabled={isAssigning}
            >
              {PAINT_TECHNIQUES.map(tech => (
                <option key={tech.value} value={tech.value}>
                  {tech.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isAssigning}
              className="btn-tertiary btn-md flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedPaint || isAssigning}
              className="btn-primary btn-md flex-1"
            >
              {isAssigning ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Paint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepPaintSection;