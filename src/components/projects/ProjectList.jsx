// components/projects/ProjectList.jsx - Updated with Enhanced Filtering
import React, { useState, useMemo } from 'react';
import { useProjectListData, useProjectOperations } from '../../hooks/useProjects';
import { useProjectPaintCheck } from '../../hooks/useProjects';
import { useSubscription } from '../../hooks/useSubscription';
import { useUpgradeModal } from '../../hooks/useUpgradeModal';
import { useGamificationOperations } from '../../hooks/useGamification';
import ProjectSummary from './ProjectSummary';
import ProjectFilterDropdown from './ProjectFilterDropdown';
import AddProjectButton from './AddProjectButton';
import GroupedProjectDisplay from './GroupedProjectDisplay';
import ProjectPaintStatusModal from './ProjectPaintStatusModal';
import UpgradeModal from '../shared/UpgradeModal';
import {
  filterProjects,
  groupProjects,
  getUniqueManufacturers,
  getUniqueGames,
  createDefaultFilters,
  areFiltersDefault
} from '../../utils/projectFilters';

const ProjectList = () => {
  // Filter state
  const [filters, setFilters] = useState(createDefaultFilters());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  // Get all project data and operations via React Query hooks
  const { projects: allProjects, summary, isLoading, isError, error } = useProjectListData('all');
  const {
    deleteProject,
    updateStatus,
    isLoading: isOperationLoading
  } = useProjectOperations();

  // Get unique values for filter dropdowns
  const availableManufacturers = useMemo(() =>
    getUniqueManufacturers(allProjects), [allProjects]
  );

  const availableGames = useMemo(() =>
    getUniqueGames(allProjects), [allProjects]
  );

  // Apply filters and grouping with search
  const { filteredProjects, groupedProjects } = useMemo(() => {
    if (!allProjects) return { filteredProjects: [], groupedProjects: {} };

    // First apply search filter
    let searchFiltered = allProjects;
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      searchFiltered = allProjects.filter(project =>
        (project.name && project.name.toLowerCase().includes(searchLower)) ||
        (project.description && project.description.toLowerCase().includes(searchLower)) ||
        (project.manufacturer && project.manufacturer.toLowerCase().includes(searchLower)) ||
        (project.game && project.game.toLowerCase().includes(searchLower))
      );
    }

    // Then apply other filters
    const filtered = filterProjects(searchFiltered, filters);
    const grouped = groupProjects(filtered, filters.group);

    return { filteredProjects: filtered, groupedProjects: grouped };
  }, [allProjects, filters, searchTerm]);

  // Get subscription info
  const { canPerformAction, currentTier, usage, limits, refreshUsage } = useSubscription();

  // Get upgrade modal functionality
  const { upgradeModalProps, showUpgradeModal } = useUpgradeModal();

  // Get gamification operations for achievement triggers
  const { triggerForAction } = useGamificationOperations();

  // Project paint check query - only runs when selectedProject is set
  const {
    data: projectPaintStatus,
    isLoading: isPaintCheckLoading
  } = useProjectPaintCheck(selectedProject?.name);

  // Filter change handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(createDefaultFilters());
    setSearchTerm('');
  };

  // Handle status update from summary cards
  const handleSummaryFilterClick = (statusFilter) => {
    setFilters(prev => ({ ...prev, status: statusFilter }));
  };

  // Handle status update
  const handleStatusUpdate = async (projectName, newStatus) => {
    try {
      const oldProject = allProjects.find(p => p.name === projectName);
      const oldStatus = oldProject?.status;

      await updateStatus({ projectName, newStatus });

      // Trigger achievement check for project completion
      if (newStatus === 'completed' && oldStatus !== 'completed') {
        try {
          await triggerForAction('project_completed', {
            projectName,
            projectData: oldProject,
            previousStatus: oldStatus,
            newStatus
          });
          console.log('🎯 Achievement check triggered for project completion');
        } catch (achievementError) {
          console.error('Achievement trigger failed (non-blocking):', achievementError);
          // Don't fail the status update if achievements fail
        }
      }

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
        {!areFiltersDefault(filters) || (searchTerm && searchTerm.trim()) && (
          <div className="mt-1 text-indigo-600 dark:text-indigo-400">
            Active filters: {JSON.stringify({...filters, search: searchTerm}, null, 1)}
          </div>
        )}
      </div>

      {/* Summary Cards - Clickable for filtering */}
      <ProjectSummary
        summary={summary}
        onFilterClick={handleSummaryFilterClick}
      />

      {/* Enhanced Filter System with Search */}
      <ProjectFilterDropdown
        // Current filter props
        currentFilter={filters.status}
        onFilterChange={(value) => handleFilterChange('status', value)}
        currentDifficulty={filters.difficulty}
        onDifficultyChange={(value) => handleFilterChange('difficulty', value)}

        // New sorting/grouping props
        currentSort={filters.sort}
        onSortChange={(value) => handleFilterChange('sort', value)}
        currentGroup={filters.group}
        onGroupChange={(value) => handleFilterChange('group', value)}

        // Additional filters
        currentManufacturer={filters.manufacturer}
        onManufacturerChange={(value) => handleFilterChange('manufacturer', value)}
        currentGame={filters.game}
        onGameChange={(value) => handleFilterChange('game', value)}

        // Available options for dropdowns
        availableManufacturers={availableManufacturers}
        availableGames={availableGames}

        // Search functionality
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}

        // Reset function
        onResetFilters={handleResetFilters}
      />

      {/* Add Project Button */}
      <AddProjectButton
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
          {/* Filter Results Summary */}
          {(!areFiltersDefault(filters) || (searchTerm && searchTerm.trim())) && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-sm text-blue-800 dark:text-blue-300">
                Showing {filteredProjects.length} of {allProjects?.length || 0} projects
                {filters.group !== 'none' && (
                  <span> in {Object.keys(groupedProjects).length} groups</span>
                )}
              </div>
            </div>
          )}

          {/* Grouped Project Display */}
          <GroupedProjectDisplay
            groupedProjects={groupedProjects}
            groupKey={filters.group}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDelete}
            onCheckPaints={handleCheckPaints}
            isLoading={isOperationLoading}
          />

          {/* Empty State */}
          {filteredProjects.length === 0 && allProjects?.length > 0 && (
            <div className="empty-state">
              <div className="mb-2">No projects match your current filters</div>
              <button
                onClick={handleResetFilters}
                className="btn-outline btn-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* No Projects State */}
          {allProjects?.length === 0 && (
            <div className="empty-state">
              No projects found
            </div>
          )}
        </>
      )}

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