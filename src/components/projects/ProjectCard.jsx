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

// Enterprise-grade date formatting utility
const formatDateEuropean = (dateInput) => {
  try {
    // Handle null, undefined, or empty string
    if (!dateInput) return 'No date';

    // Handle different input types
    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Handle ISO string, timestamp string, or other date formats
      date = new Date(dateInput);
    } else if (typeof dateInput === 'number') {
      // Handle Unix timestamp (seconds or milliseconds)
      date = new Date(dateInput);
    } else if (dateInput && dateInput.toDate && typeof dateInput.toDate === 'function') {
      // Handle Firestore Timestamp objects
      date = dateInput.toDate();
    } else if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
      // Handle Firestore Timestamp-like objects
      date = new Date(dateInput.seconds * 1000 + (dateInput.nanoseconds || 0) / 1000000);
    } else {
      return 'Unknown date format';
    }

    // Validate the date object
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Format to European standard (DD/MM/YYYY)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.warn('Date formatting error:', error, 'Input:', dateInput);
    return 'Date error';
  }
};

// Difficulty badge utility
const getDifficultyBadgeClass = (difficulty) => {
  const difficultyMap = {
    beginner: 'badge-secondary',
    intermediate: 'badge-warning',
    advanced: 'badge-danger',
    expert: 'badge-purple'
  };
  return difficultyMap[difficulty?.toLowerCase()] || 'badge-secondary';
};

// Status utilities
const getStatusConfig = (status) => {
  const statusConfigs = {
    upcoming: {
      color: 'status-upcoming',
      icon: <Clock size={12} />,
      label: 'Upcoming'
    },
    started: {
      color: 'status-started',
      icon: <Play size={12} />,
      label: 'Started'
    },
    completed: {
      color: 'status-completed',
      icon: <CheckCircle size={12} />,
      label: 'Completed'
    }
  };

  return statusConfigs[status] || {
    color: 'badge-tertiary',
    icon: null,
    label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
  };
};

const ProjectCard = ({
  project,
  onStatusUpdate,
  onDelete,
  onCheckPaints,
  isLoading = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Validate project data
  if (!project) {
    return (
      <div className="card-base overflow-hidden">
        <div className="card-padding">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-sm">Invalid project data</div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(project.status);

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

  // Safely get cover photo (prioritize coverPhotoURL, fallback to first photo)
  const getCoverPhoto = () => {
    if (project.coverPhotoURL) return project.coverPhotoURL;
    if (project.photoURLs && project.photoURLs.length > 0) return project.photoURLs[0];
    return null;
  };

  const coverPhoto = getCoverPhoto();

  // Calculate project statistics with safe array access
  const projectStats = {
    steps: project.steps?.length || 0,
    photos: project.photoURLs?.length || 0,
    paints: project.paintOverview?.length || 0,
    legacyPaints: project.requiredPaints?.length || 0
  };

  return (
    <div className="card-base overflow-hidden">

      {/* Project Photo */}
      {coverPhoto ? (
        <div className="aspect-video bg-gray-200 dark:bg-gray-700">
          <img
            src={coverPhoto}
            alt={project.name || 'Project'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <svg class="text-gray-400 dark:text-gray-500" width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              `;
            }}
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
              {project.name || 'Untitled Project'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs flex items-center mt-1">
              <Calendar className="mr-1" size={12} />
              Created: {formatDateEuropean(project.created)}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-2">
            <span className={`badge-base ${statusConfig.color} flex items-center gap-1`}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>

            {/* Mobile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={isLoading}
                aria-label="Project actions menu"
              >
                <MoreVertical size={16} />
              </button>

              {showDropdown && (
                <>
                  <div className="dropdown-backdrop" onClick={handleBackdropClick}></div>
                  <div className="dropdown-menu top-8 right-0 w-48">

                    {/* Status Updates */}
                    {getStatusOptions(project.status).map((status) => {
                      const statusOpt = getStatusConfig(status);
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(status)}
                          className="dropdown-item"
                          disabled={isLoading}
                        >
                          {statusOpt.icon}
                          Mark {statusOpt.label}
                        </button>
                      );
                    })}

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
              <span className={`badge-base ${getDifficultyBadgeClass(project.difficulty)}`}>
                {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
              </span>
            </div>
          )}

          {/* Manufacturer and Game */}
          {(project.manufacturer || project.game) && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {project.manufacturer && (
                <span>Manufacturer: {project.manufacturer}</span>
              )}
              {project.manufacturer && project.game && <span> • </span>}
              {project.game && (
                <span>Game: {project.game}</span>
              )}
            </div>
          )}

          {/* Legacy Required Paints */}
          {projectStats.legacyPaints > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2 flex items-center">
                <PaletteIcon className="mr-1" size={14} />
                Required Paints ({projectStats.legacyPaints})
              </h4>
              <div className="flex flex-wrap gap-1">
                {project.requiredPaints.slice(0, 6).map((paint, index) => (
                  <span key={index} className="badge-tertiary text-xs">
                    {paint}
                  </span>
                ))}
                {projectStats.legacyPaints > 6 && (
                  <span className="badge-tertiary text-xs">
                    +{projectStats.legacyPaints - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Project Statistics */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {projectStats.steps > 0 && (
              <span>{projectStats.steps} step{projectStats.steps !== 1 ? 's' : ''}</span>
            )}
            {projectStats.photos > 0 && (
              <span>{projectStats.photos} photo{projectStats.photos !== 1 ? 's' : ''}</span>
            )}
            {projectStats.paints > 0 && (
              <span>{projectStats.paints} paint{projectStats.paints !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Primary Action */}
        <Link
          to={`/app/projects/${project.id}`}
          className="btn-primary btn-md w-full"
          aria-label={`View details for ${project.name || 'project'}`}
        >
          <Eye size={16} />
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;