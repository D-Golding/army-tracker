// components/projects/wizard/project/photoUploader/cropStep/CropActions.jsx
import React from 'react';
import { Check } from 'lucide-react';

const CropActions = ({ onApply, onCancel }) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <p><strong>Drag</strong> crop area to reposition</p>
        <p><strong>Use size buttons</strong> to resize crop area</p>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onApply}
          className="btn-primary btn-md"
        >
          <Check size={16} />
          Apply Crop
        </button>
        <button
          onClick={onCancel}
          className="btn-tertiary btn-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CropActions;