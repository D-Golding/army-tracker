// components/projects/steps/StepHeader.jsx
import React from 'react';
import { ChevronRight, GripVertical, Check } from 'lucide-react';

const StepHeader = ({
  step,
  stepNumber,
  isExpanded,
  isCompleted,
  onToggleExpansion
}) => {

  return (
    <div className="flex items-center gap-4 p-4">

      {/* Drag Handle - Hidden on mobile for cleaner look */}
      <div className="drag-handle hidden md:block">
        <GripVertical size={16} className="text-gray-400" />
      </div>

      {/* Step Photo/Number */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
        {step.stepPhoto ? (
          <img
            src={step.stepPhoto}
            alt={`Step ${stepNumber}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-lg font-bold text-gray-400 dark:text-gray-500">
              {stepNumber}
            </div>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base text-gray-900 dark:text-white leading-tight">
          {step.displayTitle || step.title}
        </h3>
        {step.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {step.description}
          </p>
        )}

        {/* Step Stats */}
        {step.hasContent && (
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
            {step.paintCount > 0 && (
              <span>{step.paintCount} paint{step.paintCount !== 1 ? 's' : ''}</span>
            )}
            {step.photoCount > 0 && (
              <span>{step.photoCount} photo{step.photoCount !== 1 ? 's' : ''}</span>
            )}
            {step.noteCount > 0 && (
              <span>{step.noteCount} note{step.noteCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>

      {/* Right Side: Completion Status & Expand Arrow */}
      <div className="flex items-center gap-3 flex-shrink-0">

        {/* Completion Indicator */}
        {isCompleted && (
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={16} className="text-white" />
          </div>
        )}

        {/* Expand Arrow */}
        <button
          onClick={onToggleExpansion}
          className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          title={isExpanded ? "Collapse" : "Expand"}
          aria-label={isExpanded ? "Collapse step" : "Expand step"}
        >
          <ChevronRight
            size={20}
            className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </button>
      </div>
    </div>
  );
};

export default StepHeader;