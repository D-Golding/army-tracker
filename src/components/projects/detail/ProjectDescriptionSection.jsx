// components/projects/detail/ProjectDescriptionSection.jsx
import React from 'react';
import { Edit2, Check } from 'lucide-react';

const ProjectDescriptionSection = ({ project, handlers }) => {
  const {
    isEditingDescription,
    setIsEditingDescription,
    editDescription,
    setEditDescription,
    isUpdatingDescription,
    handleSaveDescription,
    handleCancelEdit,
  } = handlers;

  return (
    <div className="card-base card-padding mb-6">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h2>
        {!isEditingDescription && (
          <button
            onClick={() => setIsEditingDescription(true)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title={project.description ? "Edit description" : "Add description"}
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {isEditingDescription ? (
        <div className="space-y-3">
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="form-textarea"
            placeholder="Add a description for your project..."
            rows="4"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={handleSaveDescription}
              disabled={isUpdatingDescription}
              className="btn-primary btn-sm"
            >
              {isUpdatingDescription ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Save
                </>
              )}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isUpdatingDescription}
              className="btn-tertiary btn-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 dark:text-gray-300">
          {project.description || (
            <span className="text-gray-500 dark:text-gray-400">No description added yet</span>
          )}
        </p>
      )}
    </div>
  );
};

export default ProjectDescriptionSection;