// components/paints/PaintList/components/PaintListFilters.jsx
import React from 'react';
import { Info } from 'lucide-react';
import PaintSearchFilter from '../PaintSearchFilter';

const PaintListFilters = ({
  activeFilters,
  onFiltersChange,
  totalPaintsCount,
  onShowDisclaimer
}) => {
  return (
    <>
      {/* Integrated Search and Filter Component */}
      <PaintSearchFilter
        onFiltersChange={onFiltersChange}
        initialFilters={activeFilters}
      />

      {/* Disclaimer Section */}
      {totalPaintsCount > 0 && (
        <div className="paint-actions-container">
          <div className="mb-4 flex justify-end items-center">
            <button
              onClick={onShowDisclaimer}
              className="flex items-center gap-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Paint reference disclaimer"
            >
              <Info size={16} className="w-4 h-4 border border-current rounded-full" />
              <span className="text-sm">Disclaimer</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PaintListFilters;