// components/projects/wizard/project/photoUploader/cropStep/CropSizeControls.jsx
import React from 'react';
import { Plus, Minus } from 'lucide-react';

const CropSizeControls = ({
  cropArea,
  onIncrease,
  onDecrease,
  aspectRatioConfig
}) => {
  return (
    <div className="text-center">
      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Crop Size</h4>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onDecrease}
          className="p-3 btn-tertiary rounded-full flex items-center justify-center"
          disabled={cropArea.width <= 80}
        >
          <Minus className="w-5 h-5" />
        </button>

        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-32 text-center">
          {Math.round(cropArea.width)}×{Math.round(cropArea.height)}px
        </span>

        <button
          onClick={onIncrease}
          className="p-3 btn-tertiary rounded-full flex items-center justify-center"
          disabled={cropArea.width >= 900}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Final output: {aspectRatioConfig.outputWidth}×{aspectRatioConfig.outputHeight}px ({aspectRatioConfig.label})
      </div>
    </div>
  );
};

export default CropSizeControls;