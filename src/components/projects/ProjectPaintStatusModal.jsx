// components/projects/ProjectPaintStatusModal.jsx - Paint Status Checker
import React from 'react';
import { X, Palette, CheckCircle, AlertTriangle } from 'lucide-react';

const ProjectPaintStatusModal = ({
  project,
  paintStatus,
  isLoading,
  onClose
}) => {
  if (!project) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-md card-padding" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Palette className="mr-2" size={18} />
            Paint Status for "{project.name}"
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="loading-spinner-primary mx-auto mb-4"></div>
            <div className="text-gray-600 dark:text-gray-400">Checking paint status...</div>
          </div>
        ) : paintStatus ? (
          <>
            {/* Paint List */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {paintStatus.paints.map((paint, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {paint.name}
                    </div>
                    {paint.brand && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {paint.brand} • {paint.type}
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-3">
                    <div className={`text-sm font-medium flex items-center gap-1 ${
                      paint.status === 'AVAILABLE' ? 'text-emerald-600 dark:text-emerald-400' :
                      paint.status === 'UNAVAILABLE' ? 'text-red-600 dark:text-red-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {paint.status === 'AVAILABLE' ? (
                        <CheckCircle size={14} />
                      ) : (
                        <AlertTriangle size={14} />
                      )}
                      {paint.status}
                    </div>
                    {paint.level !== undefined && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {paint.level}% remaining
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className={`p-4 rounded-xl ${
              paintStatus.allPaintsAvailable 
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              <div className="flex items-center gap-2">
                {paintStatus.allPaintsAvailable ? (
                  <>
                    <CheckCircle size={16} />
                    <span className="font-medium">All paints are available!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    <span className="font-medium">Some paints are missing or unavailable</span>
                  </>
                )}
              </div>
              {!paintStatus.allPaintsAvailable && (
                <p className="text-sm mt-1 opacity-90">
                  Consider adding missing paints to your wishlist or finding substitutes.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-600 dark:text-gray-400 mb-4">
              <AlertTriangle className="mx-auto mb-2" size={32} />
              Failed to load paint status
            </div>
            <button
              onClick={onClose}
              className="btn-tertiary btn-sm"
            >
              Close
            </button>
          </div>
        )}

        {/* Close Button */}
        {!isLoading && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="btn-tertiary btn-md w-full"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPaintStatusModal;