// components/projects/GroupedProjectDisplay.jsx - Display projects in groups
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { getGroupDisplayConfig } from '../../utils/projectFilters';

const GroupedProjectDisplay = ({
  groupedProjects,
  groupKey,
  onStatusUpdate,
  onDelete,
  onCheckPaints,
  isLoading
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const groupConfig = getGroupDisplayConfig(groupKey);

  // Toggle group collapse state
  const toggleGroup = (groupName) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupName)) {
      newCollapsed.delete(groupName);
    } else {
      newCollapsed.add(groupName);
    }
    setCollapsedGroups(newCollapsed);
  };

  // If no grouping, show simple project list
  if (groupKey === 'none' || Object.keys(groupedProjects).length === 1) {
    const projects = Object.values(groupedProjects)[0] || [];

    if (projects.length === 0) {
      return (
        <div className="empty-state">
          {groupConfig.emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onStatusUpdate={onStatusUpdate}
            onDelete={onDelete}
            onCheckPaints={onCheckPaints}
            isLoading={isLoading}
          />
        ))}
      </div>
    );
  }

  // Grouped display
  return (
    <div className="space-y-6">
      {Object.entries(groupedProjects).map(([groupName, projects]) => {
        const isCollapsed = collapsedGroups.has(groupName);
        const projectCount = projects.length;

        return (
          <div key={groupName} className="space-y-3">

            {/* Group Header */}
            <div
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => toggleGroup(groupName)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{groupConfig.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {groupName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {projectCount} project{projectCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Project count badge */}
                <span className="badge-tertiary">
                  {projectCount}
                </span>

                {/* Collapse/expand icon */}
                {isCollapsed ? (
                  <ChevronRight size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </div>
            </div>

            {/* Projects List */}
            {!isCollapsed && (
              <div className="space-y-4 ml-4">
                {projects.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                    No projects in this group
                  </div>
                ) : (
                  projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onStatusUpdate={onStatusUpdate}
                      onDelete={onDelete}
                      onCheckPaints={onCheckPaints}
                      isLoading={isLoading}
                    />
                  ))
                )}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
};

export default GroupedProjectDisplay;