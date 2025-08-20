// components/paints/PaintList/components/PaintListHeader.jsx
import React from 'react';
import { Plus, X, Trash2, Zap } from 'lucide-react';
import SummaryCards from '../SummaryCards';

const PaintListHeader = ({
  summary,
  totalPaintsCount,
  paintLimit,
  hasReachedPaintLimit,
  currentTier,
  showAddForm,
  bulkDeleteMode,
  filteredPaintsCount,
  onFilterClick,
  onAddPaintClick,
  onToggleBulkDelete,
  isOperationLoading = false
}) => {
  return (
    <>
      {/* Summary Cards */}
      <SummaryCards summary={summary} onFilterClick={onFilterClick} />

      {/* Action Buttons */}
      <div className="paint-actions-container">
        <div className="flex gap-3 mb-4">
          <button
            onClick={onAddPaintClick}
            disabled={isOperationLoading}
            className="btn-md flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all"
          >
            {hasReachedPaintLimit ? (
              <>
                <Zap className="inline-block mr-2" size={20} />
                Upgrade to add more ({totalPaintsCount}/{paintLimit})
              </>
            ) : showAddForm ? (
              <>
                <X className="inline-block mr-2" size={20} />
                Cancel
              </>
            ) : (
              <>
                <Plus className="inline-block mr-2" size={20} />
                Add New Paint ({totalPaintsCount}/{paintLimit})
              </>
            )}
          </button>

          <button
            onClick={onToggleBulkDelete}
            disabled={isOperationLoading || filteredPaintsCount === 0}
            className="p-3 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
            title={bulkDeleteMode ? "Cancel selection" : "Delete multiple paints"}
          >
            {bulkDeleteMode ? <X size={20} /> : <Trash2 size={20} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default PaintListHeader;