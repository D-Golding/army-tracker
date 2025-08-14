// components/projects/PaintOverview.jsx
import React, { useState } from 'react';
import { Palette, Plus, Trash2, MoreVertical, Eye, Info } from 'lucide-react';
import AddPaintToProjectModal from './AddPaintToProjectModal';
import { useSubscription } from '../../hooks/useSubscription';

const PaintOverview = ({
  projectData,
  onPaintsAdded,
  onPaintRemoved,
  className = ''
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false); // Changed to false by default
  const { canPerformAction, getUpgradeMessage, getRemainingAllowance, currentTier } = useSubscription();

  const paintOverview = projectData?.paintOverview || [];
  const existingPaintIds = paintOverview.map(paint => paint.paintId);

  // Handle adding paints to project
  const handlePaintsAdded = async (newPaints) => {
    if (onPaintsAdded) {
      await onPaintsAdded(newPaints);
    }
  };

  // Handle removing paint from project
  const handleRemovePaint = async (paintId) => {
    if (onPaintRemoved) {
      await onPaintRemoved(paintId);
    }
    setShowDeleteConfirm(null);
  };

  // Handle add paint button click
  const handleAddPaintClick = () => {
    if (!canPerformAction('add_paint_assignment', 1, projectData)) {
      alert(getUpgradeMessage('paintAssignments'));
      return;
    }
    setShowAddModal(true);
  };

  // Close dropdowns when clicking outside
  const handleBackdropClick = () => {
    setShowDropdown(null);
  };

  // Get usage information for a paint
  const getPaintUsageInfo = (paint) => {
    const stepsUsingPaint = projectData?.steps?.filter(step =>
      step.paints?.some(stepPaint => stepPaint.paintId === paint.paintId)
    ) || [];

    return {
      stepCount: stepsUsingPaint.length,
      steps: stepsUsingPaint
    };
  };

  const remainingSlots = getRemainingAllowance('paintAssignments', true, projectData);

  // Button logic
  const canAddPaints = canPerformAction('add_paint_assignment', 1, projectData);
  const isTopTier = currentTier === 'battle';
  const paintButtonDisabled = !canAddPaints && isTopTier;

  // Get paints to display (show 1 initially, all when expanded)
  const displayPaints = isExpanded ? paintOverview : paintOverview.slice(0, 1);
  const hasMorePaints = paintOverview.length > 1;

  return (
    <>
      <div className={`card-base card-padding ${className}`}>

        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Palette className="mr-2" size={18} />
              Paint Overview ({paintOverview.length})
            </h2>
          </div>

          {/* Add Paints Button - On separate line, left aligned */}
          <div className="flex justify-start mt-3">
            <button
              onClick={handleAddPaintClick}
              disabled={paintButtonDisabled}
              className={`btn-primary btn-sm ${paintButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus size={14} />
              {canAddPaints ? "Add Paints" : (isTopTier ? "Add Paints" : "Upgrade")}
            </button>
          </div>
        </div>

        {/* Usage Info */}
        {remainingSlots !== null && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {remainingSlots > 0 ? (
                <span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {remainingSlots}
                  </span> paint assignment{remainingSlots !== 1 ? 's' : ''} remaining
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Paint assignment limit reached
                </span>
              )}
            </div>
          </div>
        )}

        {/* No Paints State */}
        {paintOverview.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Palette className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="mb-3">No paints added to this project</p>
          </div>
        ) : (
          <>
            {/* Paint List */}
            <div className="space-y-3 mb-4">
              {displayPaints.map((paint) => {
                const usageInfo = getPaintUsageInfo(paint);

                return (
                  <div key={paint.paintId} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">

                    {/* Main Paint Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {paint.paintName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {paint.brand} • {paint.type}
                        </div>

                        {/* Usage Summary */}
                        <div className="mt-2">
                          {usageInfo.stepCount > 0 ? (
                            <div className="text-sm text-indigo-600 dark:text-indigo-400">
                              <Info size={12} className="inline mr-1" />
                              Used in {usageInfo.stepCount} step{usageInfo.stepCount !== 1 ? 's' : ''}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <Info size={12} className="inline mr-1" />
                              Not yet assigned to any steps
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(paint.paintId)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Mobile Menu */}
                        <div className="relative md:hidden">
                          <button
                            onClick={() => setShowDropdown(showDropdown === paint.paintId ? null : paint.paintId)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {showDropdown === paint.paintId && (
                            <>
                              <div className="dropdown-backdrop" onClick={handleBackdropClick}></div>
                              <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-[9999] w-40">
                                <button
                                  onClick={() => {
                                    setShowDeleteConfirm(paint.paintId);
                                    setShowDropdown(null);
                                  }}
                                  className="dropdown-item-danger"
                                >
                                  <Trash2 size={14} />
                                  Remove Paint
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step Usage Details (if used) */}
                    {usageInfo.stepCount > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Used in:</div>
                        <div className="flex flex-wrap gap-1">
                          {usageInfo.steps.map((step, index) => (
                            <span
                              key={step.id}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-lg"
                            >
                              {step.title || `Step ${step.order || index + 1}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* See All / Show Less Button */}
            {hasMorePaints && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
              >
                {isExpanded ? (
                  <>Show Less</>
                ) : (
                  <>See All ({paintOverview.length - 1} more)</>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Add Paint Modal */}
      <AddPaintToProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPaintsAdded={handlePaintsAdded}
        projectData={projectData}
        existingPaintIds={existingPaintIds}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Remove Paint?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will remove the paint from your project overview. Any step assignments using this paint will also be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-tertiary btn-md flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemovePaint(showDeleteConfirm)}
                className="btn-danger btn-md flex-1"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaintOverview;