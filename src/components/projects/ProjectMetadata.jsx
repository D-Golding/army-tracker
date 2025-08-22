// components/projects/ProjectMetadata.jsx - Display faction and unit name under title
import React from 'react';
import { Shield, User } from 'lucide-react';

const ProjectMetadata = ({
  project,
  showIcons = true,
  className = "",
  textSize = "text-sm"
}) => {
  const hasFaction = project.faction && project.faction.trim();
  const hasUnitName = project.unitName && project.unitName.trim();

  // Don't render anything if no metadata
  if (!hasFaction && !hasUnitName) {
    return null;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Faction */}
      {hasFaction && (
        <div className={`flex items-center gap-2 text-gray-600 dark:text-gray-400 ${textSize}`}>
          {showIcons && <Shield size={14} className="flex-shrink-0" />}
          <span className="truncate">{project.faction}</span>
        </div>
      )}

      {/* Unit Name */}
      {hasUnitName && (
        <div className={`flex items-center gap-2 text-gray-600 dark:text-gray-400 ${textSize}`}>
          {showIcons && <User size={14} className="flex-shrink-0" />}
          <span className="truncate">{project.unitName}</span>
        </div>
      )}
    </div>
  );
};

export default ProjectMetadata;
