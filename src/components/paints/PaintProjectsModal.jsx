// components/paints/PaintProjectsModal.jsx - Updated with cover photo thumbnails
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ExternalLink, FolderPlus, Camera } from 'lucide-react';
import { getAllProjects } from '../../services/projects/index.js';

const PaintProjectsModal = ({
  isOpen,
  onClose,
  paintName,
  projectIds = []
}) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load project details when modal opens
  useEffect(() => {
    if (isOpen && projectIds.length > 0) {
      loadProjectDetails();
    }
  }, [isOpen, projectIds]);

  const loadProjectDetails = async () => {
    setIsLoading(true);
    try {
      // Get all projects and filter to only the ones this paint is in
      const allProjects = await getAllProjects();
      const paintProjects = allProjects.filter(project =>
        projectIds.includes(project.id)
      );

      // Sort by status priority: upcoming, started, completed
      const sortedProjects = paintProjects.sort((a, b) => {
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
      console.error('Error loading project details:', error);
    }
    setIsLoading(false);
  };

  // Get cover photo URL for a project
  const getCoverPhoto = (project) => {
    // Priority: coverPhotoURL > first photoURL > first photo from photos array
    if (project.coverPhotoURL) return project.coverPhotoURL;
    if (project.photoURLs && project.photoURLs.length > 0) return project.photoURLs[0];
    if (project.photos && project.photos.length > 0) {
      // Handle new photo format - could be string or object
      const firstPhoto = project.photos[0];
      return typeof firstPhoto === 'string' ? firstPhoto : firstPhoto.url;
    }
    return null;
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

  // Handle close
  const handleClose = () => {
    setProjects([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content max-w-md max-h-[70vh] flex flex-col card-padding" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Projects Using This Paint
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {paintName}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="loading-spinner-primary mx-auto mb-4"></div>
              <div className="text-gray-600 dark:text-gray-400">Loading projects...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FolderPlus className="mx-auto mb-3 text-gray-400" size={32} />
              <p>This paint isn't used in any projects yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const coverPhoto = getCoverPhoto(project);

                return (
                  <div
                    key={project.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-xl p-4"
                  >
                    {/* Project Content with Cover Photo */}
                    <div className="flex gap-3 mb-3">

                      {/* Cover Photo Thumbnail */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                          {coverPhoto ? (
                            <img
                              src={coverPhoto}
                              alt={`${project.name} cover`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // If image fails to load, show placeholder
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}

                          {/* Placeholder for missing cover photo */}
                          <div
                            className="w-full h-full flex items-center justify-center text-gray-400"
                            style={{ display: coverPhoto ? 'none' : 'flex' }}
                          >
                            <Camera size={20} />
                          </div>
                        </div>
                      </div>

                      {/* Project Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {project.name}
                        </h4>

                        {project.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <span className={`badge-base ${getStatusStyling(project.status)} text-xs`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>

                          {project.difficulty && (
                            <span className="badge-tertiary text-xs">
                              {project.difficulty}
                            </span>
                          )}

                          {project.steps && project.steps.length > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {project.steps.length} step{project.steps.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Go to Project Button */}
                    <Link
                      to={`/app/projects/${project.id}`}
                      onClick={handleClose}
                      className="btn-primary btn-sm w-full flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={14} />
                      Go to project
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={handleClose}
            className="btn-tertiary btn-md w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaintProjectsModal;