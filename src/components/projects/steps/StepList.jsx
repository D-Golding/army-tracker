// components/projects/steps/StepList.jsx
import React, { useState } from 'react';
import { ListOrdered } from 'lucide-react';
import StepContainer from './StepContainer';
import { getCompletionMessage } from '../../../utils/steps/stepHelpers';

const StepList = ({
  steps,
  projectData,
  stepOperations,
  stepExpansion,
  stepDragDrop,
  completionStats
}) => {
  const [showAllSteps, setShowAllSteps] = useState(false);
  const sortedSteps = stepDragDrop.getSortedSteps();

  // Get steps to display (show 3 initially, all when expanded)
  const displaySteps = showAllSteps ? sortedSteps : sortedSteps.slice(0, 3);
  const hasMoreSteps = sortedSteps.length > 3;

  // No steps state
  if (sortedSteps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <ListOrdered className="mx-auto mb-3 text-gray-400" size={32} />
        <p className="mb-3">No steps created yet</p>
        <p className="text-sm">Add your first step to start building your painting guide</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Steps Container */}
      <div className="steps-container space-y-3">
        {displaySteps.map((step, index) => {
          // Find the correct step number from the original sorted array
          const actualStepNumber = sortedSteps.findIndex(s => s.id === step.id) + 1;

          return (
            <StepContainer
              key={step.id}
              step={step}
              stepNumber={actualStepNumber}
              totalSteps={sortedSteps.length}
              projectData={projectData}
              stepOperations={stepOperations}
              stepExpansion={stepExpansion}
              stepDragDrop={stepDragDrop}
            />
          );
        })}

        {/* See All / Show Less Button */}
        {hasMoreSteps && (
          <button
            onClick={() => setShowAllSteps(!showAllSteps)}
            className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
          >
            {showAllSteps ? (
              <>Show Less</>
            ) : (
              <>See All ({sortedSteps.length - 3} more)</>
            )}
          </button>
        )}
      </div>

      {/* Completion Summary */}
      {completionStats.total > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className={`font-medium ${
              completionStats.completed === completionStats.total 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {getCompletionMessage(completionStats.completed, completionStats.total)}
            </div>

            {/* Progress Bar */}
            {completionStats.total > 1 && (
              <div className="mt-2 w-32 mx-auto">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionStats.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Actions - For future enhancement */}
      {sortedSteps.length > 1 && stepExpansion.expandedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-center gap-3 text-sm">
            <button
              onClick={() => stepExpansion.expandAllSteps(sortedSteps.map(s => s.id))}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Expand All ({sortedSteps.length})
            </button>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <button
              onClick={stepExpansion.collapseAllSteps}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Collapse All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepList;