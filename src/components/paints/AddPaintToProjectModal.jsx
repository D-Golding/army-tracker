// components/paints/AddPaintToProjectModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Check, FolderPlus } from 'lucide-react';
import { getAllProjects } from '../../services/projects/index.js';

const AddPaintToProjectModal = ({
  isOpen,
  onClose,
  paintName,
  currentProjects = [],
  onProjectsUpdated,
  isLoading = false
}) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState(new Set(currentProjects));
  const [isFetchingProjects, setIsFetchingProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load projects when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProjects();
      setSelectedProjects(new Set(currentProjects));
    }
  }, [isOpen, currentProjects]);

  const loadProjects = async () => {
    setIsFetchingProjects(true);
    try {
      const allProjects = await getAllProjects();

      // Sort projects by status priority: upcoming, started, completed
      // Then by name within each status group
      const sortedProjects = allProjects.sort((a, b) => {
        const statusOrder = { upcoming: 0, started: 1, completed: 2 };
        const aOrder = statusOrder[a.status] ?? 3;
        const bOrder = statusOrder[b.status] ?? 3;

        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }

        return a.name.localeCompare(b.name);
      });

      setProjects(sortedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
    setIsFetchingProjects(false);
  };

  // Toggle project selection
  const toggleProject = (projectId) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const projectsArray = Array.from(selectedProjects);
      await onProjectsUpdated(projectsArray);
      handleClose();
    } catch (error) {
      console.error('Error updating paint projects:', error);
    }
    setIsSaving(false);
  };

  // Handle close
  const handleClose = () => {
    if (!isSaving) {
      setSelectedProjects(new Set(currentProjects));
      onClose();
    }
  };

  // Get status styling
  const getStatusStyling = (status) => {
    switch (status) {
      case 'upcoming':
        return 'status-upcoming';
      case 'started':
        return 'status-started';
      case 'completed':
        return 'status-completed';
      default:
        return 'badge-tertiary';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content max-w-md max-h-[80vh] flex flex-col card-padding" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add to Projects
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {paintName}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selection Info */}
        <div className="mb-4 flex-shrink-0">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''} selected
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto mb-4 min-h-0">
          {isFetchingProjects ? (
            <div className="text-center py-8">
              <div className="loading-spinner-primary mx-auto mb-4"></div>
              <div className="text-gray-600 dark:text-gray-400">Loading projects...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FolderPlus className="mx-auto mb-3 text-gray-400" size={32} />
              <p className="mb-3">No projects found</p>
              <p className="text-sm">Create a project first to add paints to it</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => {
                const isSelected = selectedProjects.has(project.id);

                return (
                  <div
                    key={project.id}
                    onClick={() => toggleProject(project.id)}
                    className={`p-3 border rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {project.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge-base ${getStatusStyling(project.status)} text-xs`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                          {project.difficulty && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {project.difficulty}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ml-3 ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="btn-tertiary btn-md flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isFetchingProjects}
            className="btn-primary btn-md flex-1"
          >
            {isSaving ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Plus size={16} />
                Update Projects
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPaintToProjectModal;