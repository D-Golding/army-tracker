// components/projects/wizard/StepReviewForm.jsx - Summary/review display
import React from 'react';
import { Check, Info } from 'lucide-react';

const StepReviewForm = ({ formData, stepNumber }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Check className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Review Step {stepNumber}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review your step details before creating
        </p>
      </div>

      {/* Step Details */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Step Details</h4>
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Title: </span>
            <span className="text-sm text-gray-900 dark:text-white">{formData.title}</span>
          </div>
          {formData.description && (
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description: </span>
              <span className="text-sm text-gray-900 dark:text-white">{formData.description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Paint Assignments */}
      {formData.paints.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Paint Assignments ({formData.paints.length})
          </h4>
          <div className="space-y-2">
            {formData.paints.map((paint) => (
              <div key={paint.paintId} className="text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{paint.paintName}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  {paint.brand} • {paint.technique || 'brush'}
                </span>
                {paint.usage && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Info size={10} className="inline mr-1" />
                    {paint.usage}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      {formData.photos.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Photos ({formData.photos.length})
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {formData.photos.slice(0, 8).map((photoUrl, index) => (
              <div key={photoUrl} className="aspect-square rounded overflow-hidden">
                <img
                  src={photoUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {formData.photos.length > 8 && (
              <div className="aspect-square rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  +{formData.photos.length - 8}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {formData.notes.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Notes ({formData.notes.length})
          </h4>
          <div className="space-y-2">
            {formData.notes.map((note) => (
              <div key={note.id} className="text-sm text-gray-900 dark:text-white">
                {note.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary counts */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <span>{formData.paints.length} paint{formData.paints.length !== 1 ? 's' : ''}</span>
          <span>{formData.photos.length} photo{formData.photos.length !== 1 ? 's' : ''}</span>
          <span>{formData.notes.length} note{formData.notes.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default StepReviewForm;