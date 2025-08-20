// components/paints/PaintList/components/BulkDeleteControls.jsx
import React from 'react';
import { Trash2 } from 'lucide-react';

const BulkDeleteControls = ({
  selectedPaintsCount,
  filteredPaintsCount,
  totalPaintsCount,
  activeFilters,
  onSelectAll,
  onDeselectAll,
  onConfirmDelete,
  isOperationLoading = false
}) => {
  const hasNoFilters = Object.keys(activeFilters).length === 0;
  const selectAllCount = hasNoFilters ? totalPaintsCount : filteredPaintsCount;

  return (
    <div className="sticky top-4 z-40 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-4 shadow-lg paint-actions-container">
      <div className="flex items-center justify-between mb-3">
        <div className="text-gray-700 dark:text-gray-300 font-medium">
          {selectedPaintsCount} paint{selectedPaintsCount !== 1 ? 's' : ''} selected
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onSelectAll}
          disabled={filteredPaintsCount === 0}
          className="btn-sm btn-secondary"
        >
          {hasNoFilters ?
            `Select All (${selectAllCount})` :
            `Select All ${filteredPaintsCount > 0 ? `(${filteredPaintsCount})` : ''}`
          }
        </button>

        <button
          onClick={onDeselectAll}
          disabled={selectedPaintsCount === 0}
          className="btn-sm btn-tertiary"
        >
          Deselect All
        </button>

        <button
          onClick={onConfirmDelete}
          disabled={selectedPaintsCount === 0 || isOperationLoading}
          className="btn-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
        >
          <Trash2 className="inline-block mr-1" size={14} />
          Delete Selected ({selectedPaintsCount})
        </button>
      </div>
    </div>
  );
};

export default BulkDeleteControls;