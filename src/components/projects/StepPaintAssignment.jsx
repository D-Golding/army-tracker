// components/projects/StepPaintAssignment.jsx
import React, { useState } from 'react';
import { Palette, Plus, X, Edit2, Check, Info } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { useUpgradeModal } from '../../hooks/useUpgradeModal';
import UpgradeModal from '../shared/UpgradeModal';

const StepPaintAssignment = ({
  step,
  projectData,
  onPaintAssigned,
  onPaintRemoved,
  onAssignmentUpdated,
  maxPaints = 10,
  className = ''
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editForm, setEditForm] = useState({ usage: '', technique: '' });
  const [isExpanded, setIsExpanded] = useState(true);

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

  return (
    <>
      <div className={`space-y-3 ${className}`}>

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
              {canAssignPaint ? "Assign Paint" : (isTopTier ? "Assign Paint" : "Upgrade")}
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

        {/* Collapsible Toggle */}
        {stepPaints.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {isExpanded ? (
              <>
                Close
                <span className="ml-2 text-lg">-</span>
              </>
            ) : (
              <>
                See all Paints
                <span className="ml-2 text-lg">+</span>
              </>
            )}
          </button>
        )}

        {/* Paint Assignments List */}
        {stepPaints.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <Palette className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-sm">No paints assigned to this step</p>
            {availablePaints.length > 0 ? (
              <button
                onClick={handleAddPaint}
                disabled={assignButtonDisabled}
                className={`btn-tertiary btn-sm mt-2 ${assignButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Plus size={12} />
                {canAssignPaint ? "Assign Your First Paint" : (isTopTier ? "Assign Your First Paint" : "Upgrade")}
              </button>
            ) : (
              <p className="text-xs mt-1">Add paints to project overview first</p>
            )}
          </div>
        ) : isExpanded ? (
          <div className="space-y-2">
            {stepPaints.map((assignment) => (
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
                        <option value="brush">Brush</option>
                        <option value="airbrush">Airbrush</option>
                        <option value="drybrush">Dry Brush</option>
                        <option value="wash">Wash</option>
                        <option value="glaze">Glaze</option>
                        <option value="stipple">Stipple</option>
                        <option value="sponge">Sponge</option>
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
                        Technique: {assignment.technique}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add More Paints Button - only show when expanded */}
            {canAddMore && (
              <button
                onClick={handleAddPaint}
                disabled={assignButtonDisabled}
                className={`w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-3 text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${assignButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Plus size={16} className="mx-auto mb-1" />
                <div className="text-sm">{canAssignPaint ? "Add Another Paint" : (isTopTier ? "Add Another Paint" : "Upgrade")}</div>
                <div className="text-xs opacity-75">
                  {maxPaints - stepPaints.length} remaining for this step
                </div>
              </button>
            )}
          </div>
        ) : null}
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

// Enhanced Add Paint Assignment Modal Component with Multiple Selection
const AddPaintAssignmentModal = ({
  isOpen,
  onClose,
  availablePaints,
  onPaintAssigned,
  maxSelection = 1
}) => {
  const [selectedPaints, setSelectedPaints] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [isAssigning, setIsAssigning] = useState(false);

  // Handle paint selection
  const togglePaintSelection = (paint) => {
    setSelectedPaints(prev => {
      const isSelected = prev.find(p => p.paintId === paint.paintId);
      if (isSelected) {
        // Remove paint and its assignment data
        const newAssignments = { ...assignments };
        delete newAssignments[paint.paintId];
        setAssignments(newAssignments);
        return prev.filter(p => p.paintId !== paint.paintId);
      } else {
        // Add paint if under limit
        if (prev.length < maxSelection) {
          // Initialize assignment data
          setAssignments(prev => ({
            ...prev,
            [paint.paintId]: { usage: '', technique: 'brush' }
          }));
          return [...prev, paint];
        }
        return prev;
      }
    });
  };

  // Handle assignment data changes
  const updateAssignment = (paintId, field, value) => {
    setAssignments(prev => ({
      ...prev,
      [paintId]: {
        ...prev[paintId],
        [field]: value
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedPaints.length === 0) return;

    setIsAssigning(true);
    try {
      // Assign each selected paint
      for (const paint of selectedPaints) {
        const assignmentData = assignments[paint.paintId] || { usage: '', technique: 'brush' };
        await onPaintAssigned(paint, assignmentData.usage, assignmentData.technique);
      }

      // Reset form
      setSelectedPaints([]);
      setAssignments({});
    } catch (error) {
      console.error('Error in modal submit:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    if (!isAssigning) {
      setSelectedPaints([]);
      setAssignments({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Assign Paints to Step
          </h3>
          <button
            onClick={handleClose}
            disabled={isAssigning}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selection Info */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {selectedPaints.length} paint{selectedPaints.length !== 1 ? 's' : ''} selected
              {maxSelection > 1 && ` (max ${maxSelection})`}
            </span>
            {selectedPaints.length > 0 && (
              <button
                onClick={() => {
                  setSelectedPaints([]);
                  setAssignments({});
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">

          {/* Paint Selection */}
          <div className="mb-4 flex-shrink-0">
            <label className="form-label">Select Paint{maxSelection > 1 ? 's' : ''} *</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availablePaints.map((paint) => {
                const isSelected = selectedPaints.find(p => p.paintId === paint.paintId);
                const canSelect = selectedPaints.length < maxSelection || isSelected;

                return (
                  <div
                    key={paint.paintId}
                    onClick={() => canSelect && togglePaintSelection(paint)}
                    className={`p-3 border rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : canSelect
                          ? 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          : 'border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {paint.paintName}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {paint.brand} • {paint.type}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assignment Details for Selected Paints */}
          {selectedPaints.length > 0 && (
            <div className="flex-1 overflow-y-auto mb-4 min-h-0">
              <label className="form-label">Assignment Details</label>
              <div className="space-y-4">
                {selectedPaints.map((paint) => (
                  <div key={paint.paintId} className="border border-gray-200 dark:border-gray-600 rounded-xl p-3">
                    <div className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                      {paint.paintName}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Usage Notes
                        </label>
                        <input
                          type="text"
                          value={assignments[paint.paintId]?.usage || ''}
                          onChange={(e) => updateAssignment(paint.paintId, 'usage', e.target.value)}
                          className="form-input text-xs"
                          placeholder="e.g., For helmet and gun"
                          disabled={isAssigning}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Technique
                        </label>
                        <select
                          value={assignments[paint.paintId]?.technique || 'brush'}
                          onChange={(e) => updateAssignment(paint.paintId, 'technique', e.target.value)}
                          className="form-select text-xs"
                          disabled={isAssigning}
                        >
                          <option value="brush">Brush</option>
                          <option value="airbrush">Airbrush</option>
                          <option value="drybrush">Dry Brush</option>
                          <option value="wash">Wash</option>
                          <option value="glaze">Glaze</option>
                          <option value="stipple">Stipple</option>
                          <option value="sponge">Sponge</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
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
              disabled={selectedPaints.length === 0 || isAssigning}
              className="btn-primary btn-md flex-1"
            >
              {isAssigning ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Assign {selectedPaints.length} Paint{selectedPaints.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepPaintAssignment;