// components/projects/ProjectCard.jsx - Individual Project Display with Actions
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Calendar,
  Palette as PaletteIcon,
  CheckCircle,
  Clock,
  Play,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react';
import { showConfirmation } from '../NotificationManager';

const ProjectCard = ({
  project,
  onStatusUpdate,
  onDelete,
  onCheckPaints,
  isLoading = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Get status styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'status-upcoming';
      case 'started': return 'status-started';
      case 'completed': return 'status-completed';
      default: return 'badge-tertiary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return <Clock size={12} />;
      case 'started': return <Play size={12} />;
      case 'completed': return <CheckCircle size={12} />;
      default: return null;
    }
  };

  // Get available status transitions
  const getStatusOptions = (currentStatus) => {
    const statuses = ['upcoming', 'started', 'completed'];
    return statuses.filter(status => status !== currentStatus);
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      await onStatusUpdate(project.name, newStatus);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    // Close dropdown FIRST
    setShowDropdown(false);

    // Small delay to let dropdown close before showing modal
    setTimeout(async () => {
      const confirmed = await showConfirmation({
        title: "Delete Project?",
        message: `This will permanently delete "${project.name}" and all its data. This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger"
      });

      if (confirmed) {
        try {
          await onDelete(project.name);
        } catch (error) {
          console.error('Error deleting project:', error);
        }
      }
    }, 100);
  };

  // Handle check paints
  const handleCheckPaints = () => {
    onCheckPaints(project);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  const handleBackdropClick = () => {
    setShowDropdown(false);
  };

  return (
    <div className="card-base overflow-hidden">

      {/* Project Photo */}
      {project.photoURLs && project.photoURLs.length > 0 ? (
        <div className="aspect-video bg-gray-200 dark:bg-gray-700">
          <img
            src={project.photoURLs[0]}
            alt={project.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
          <Camera className="text-gray-400 dark:text-gray-500" size={32} />
        </div>
      )}

      <div className="card-padding">

        {/* Header with Status */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
              {project.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs flex items-center mt-1">
              <Calendar className="mr-1" size={12} />
              Created: {new Date(project.created).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-2">
            <span className={`badge-base ${getStatusColor(project.status)} flex items-center gap-1`}>
              {getStatusIcon(project.status)}
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>

            {/* Mobile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={isLoading}
              >
                <MoreVertical size={16} />
              </button>

              {showDropdown && (
                <>
                  <div className="dropdown-backdrop" onClick={handleBackdropClick}></div>
                  <div className="dropdown-menu top-8 right-0 w-48">

                    {/* Status Updates */}
                    {getStatusOptions(project.status).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        className="dropdown-item"
                        disabled={isLoading}
                      >
                        {getStatusIcon(status)}
                        Mark {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}

                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                    {/* Other Actions */}
                    <button
                      onClick={handleCheckPaints}
                      className="dropdown-item"
                      disabled={isLoading}
                    >
                      <PaletteIcon size={14} />
                      Check Paints
                    </button>

                    <button
                      onClick={handleDelete}
                      className="dropdown-item-danger"
                      disabled={isLoading}
                    >
                      <Trash2 size={14} />
                      Delete Project
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Project Metadata */}
        <div className="space-y-3 mb-4">

          {/* Difficulty Badge */}
          {project.difficulty && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Difficulty:</span>
              <span className={`badge-base ${
                project.difficulty === 'beginner' ? 'badge-secondary' :
                project.difficulty === 'intermediate' ? 'badge-warning' :
                project.difficulty === 'advanced' ? 'badge-danger' :
                'badge-purple'
              }`}>
                {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
              </span>
            </div>
          )}

          {/* Required Paints (Legacy) */}
          {project.requiredPaints && project.requiredPaints.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2 flex items-center">
                <PaletteIcon className="mr-1" size={14} />
                Required Paints ({project.requiredPaints.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {project.requiredPaints.slice(0, 6).map((paint, index) => (
                  <span key={index} className="badge-tertiary text-xs">
                    {paint}
                  </span>
                ))}
                {project.requiredPaints.length > 6 && (
                  <span className="badge-tertiary text-xs">
                    +{project.requiredPaints.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Project Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {project.steps && (
              <span>{project.steps.length} step{project.steps.length !== 1 ? 's' : ''}</span>
            )}
            {project.photoURLs && project.photoURLs.length > 0 && (
              <span>{project.photoURLs.length} photo{project.photoURLs.length !== 1 ? 's' : ''}</span>
            )}
            {project.paintOverview && project.paintOverview.length > 0 && (
              <span>{project.paintOverview.length} paint{project.paintOverview.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Primary Action */}
        <Link
          to={`/app/projects/${project.id}`}
          className="btn-primary btn-md w-full"
        >
          <Eye size={16} />
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;