// components/projects/ProjectList.jsx - Fixed Subscription Integration
import React, { useState } from 'react';
import { useProjectListData, useProjectOperations } from '../../hooks/useProjects';
import { useProjectPaintCheck } from '../../hooks/useProjects';
import { useSubscription } from '../../hooks/useSubscription';
import { useUpgradeModal } from '../../hooks/useUpgradeModal';
import ProjectSummary from './ProjectSummary';
import ProjectFilters from './ProjectFilters';
import AddProjectButton from './AddProjectButton';
import AddProjectModal from './AddProjectModal';
import ProjectCard from './ProjectCard';
import ProjectPaintStatusModal from './ProjectPaintStatusModal';
import UpgradeModal from '../shared/UpgradeModal';

const ProjectList = () => {
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Get all project data and operations via React Query hooks
  const { projects, summary, isLoading, isError, error } = useProjectListData(filter);
  const {
    createProject,
    deleteProject,
    updateStatus,
    isLoading: isOperationLoading
  } = useProjectOperations();

  // Get subscription info with debug info
  const { canPerformAction, currentTier, usage, limits, refreshUsage } = useSubscription();

  // Get upgrade modal functionality
  const { upgradeModalProps, showUpgradeModal } = useUpgradeModal();

  // Project paint check query - only runs when selectedProject is set
  const {
    data: projectPaintStatus,
    isLoading: isPaintCheckLoading
  } = useProjectPaintCheck(selectedProject?.name);

  // Handle adding new project
  const handleProjectCreated = async (projectData) => {
    try {
      // Convert to the format expected by createProject
      const formattedData = {
        name: projectData.name,
        description: projectData.description,
        requiredPaints: '', // Empty for simplified creation
        photoURLs: '', // Empty for simplified creation
        status: projectData.status,
        difficulty: projectData.difficulty // New field
      };

      await createProject(formattedData);
      setShowAddModal(false);

      // Subscription will auto-refresh from React Query cache changes
      // But we can manually refresh as backup
      setTimeout(() => {
        refreshUsage();
      }, 500);

    } catch (error) {
      console.error('Error creating project:', error);
      throw error; // Re-throw so modal can handle UI feedback
    }
  };

  // Handle status update
  const handleStatusUpdate = async (projectName, newStatus) => {
    try {
      await updateStatus({ projectName, newStatus });
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  };

  // Handle delete
  const handleDelete = async (projectName) => {
    try {
      await deleteProject(projectName);

      // Clear selected project if it was deleted
      if (selectedProject?.name === projectName) {
        setSelectedProject(null);
      }

      // Subscription will auto-refresh from React Query cache changes
      // But we can manually refresh as backup
      setTimeout(() => {
        refreshUsage();
      }, 500);

    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  // Handle check paints
  const handleCheckPaints = (project) => {
    setSelectedProject(project);
  };

  // Handle filter changes (from summary cards or filter chips)
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Show error state
  if (isError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 dark:text-red-400 mb-4">
          Error loading projects: {error?.message || 'Unknown error'}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary btn-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>

      {/* Debug Info - Shows current subscription limits */}
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs">
        <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subscription Debug ({currentTier})
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          Projects: {usage.projects}/{limits.projects} |
          Can add: {canPerformAction('add_project') ? 'YES' : 'NO'}
        </div>
      </div>

      {/* Summary Cards - Clickable for filtering */}
      <ProjectSummary
        summary={summary}
        onFilterClick={handleFilterChange}
      />

      {/* Filter Chips */}
      <ProjectFilters
        currentFilter={filter}
        onFilterChange={handleFilterChange}
      />

      {/* Add Project Button */}
      <AddProjectButton
        onClick={() => setShowAddModal(true)}
        isLoading={isOperationLoading}
        showUpgradeModal={showUpgradeModal}
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="loading-spinner-primary mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">Loading projects...</div>
        </div>
      ) : (
        <>
          {/* Project Cards */}
          <div className="space-y-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDelete}
                onCheckPaints={handleCheckPaints}
                isLoading={isOperationLoading}
              />
            ))}
          </div>

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="empty-state">
              {filter === 'all' ? 'No projects found' : `No ${filter} projects found`}
            </div>
          )}
        </>
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProjectCreated={handleProjectCreated}
        isCreating={isOperationLoading}
      />

      {/* Paint Status Modal */}
      <ProjectPaintStatusModal
        project={selectedProject}
        paintStatus={projectPaintStatus}
        isLoading={isPaintCheckLoading}
        onClose={() => setSelectedProject(null)}
      />

      {/* Upgrade Modal */}
      <UpgradeModal {...upgradeModalProps} />
    </div>
  );
};

export default ProjectList;