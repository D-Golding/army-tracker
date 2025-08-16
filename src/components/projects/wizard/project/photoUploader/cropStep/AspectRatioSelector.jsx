// components/projects/wizard/project/photoUploader/cropStep/AspectRatioSelector.jsx
import React from 'react';
import { Square, Smartphone, Monitor } from 'lucide-react';

const AspectRatioSelector = ({ selectedRatio, onRatioChange }) => {
  const aspectRatios = {
    portrait: { ratio: 4/5, label: 'Portrait', icon: Smartphone },
    square: { ratio: 1/1, label: 'Square', icon: Square },
    landscape: { ratio: 16/9, label: 'Landscape', icon: Monitor }
  };

  return (
    <div>
      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Choose Aspect Ratio</h4>
      <div className="flex gap-3 justify-center">
        {Object.entries(aspectRatios).map(([key, config]) => {
          const IconComponent = config.icon;
          const isSelected = selectedRatio === key;

          return (
            <button
              key={key}
              onClick={() => onRatioChange(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                isSelected 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <IconComponent size={16} />
              <span className="text-sm font-medium">{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AspectRatioSelector;