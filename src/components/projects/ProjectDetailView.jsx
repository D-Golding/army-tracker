// components/projects/ProjectDetailView.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../../hooks/useProjects';
import { useProjectDetail } from '../../hooks/useProjectDetail';
import ProjectDetailHeader from './detail/ProjectDetailHeader';
import ProjectDescriptionSection from './detail/ProjectDescriptionSection';
import ProjectPhotoSection from './detail/ProjectPhotoSection';
import ProjectPaintSection from './detail/ProjectPaintSection';
import ProjectStepsSection from './detail/ProjectStepsSection';

const ProjectDetailView = () => {
  const { projectId } = useParams();
  const { data: project, isLoading, isError, error, refetch } = useProject(projectId);
  const projectHandlers = useProjectDetail(project, projectId, refetch);

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="loading-spinner-primary mx-auto mb-4"></div>
        <div className="text-gray-600 dark:text-gray-400">Loading project...</div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-4">
          Error loading project: {error?.message || 'Project not found'}
        </div>
        <Link
          to="/app/projects"
          className="btn-primary btn-md"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  // Project not found
  if (!project) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 dark:text-gray-400 mb-4">
          Project not found
        </div>
        <Link
          to="/app/projects"
          className="btn-primary btn-md"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ProjectDetailHeader project={project} />
      <ProjectDescriptionSection project={project} handlers={projectHandlers} />
      <ProjectPhotoSection project={project} handlers={projectHandlers} />
      <ProjectPaintSection project={project} handlers={projectHandlers} />
      <ProjectStepsSection project={project} handlers={projectHandlers} />

      {/* Debug Info - Remove in production */}
      <div className="card-base card-padding bg-gray-50 dark:bg-gray-800">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Debug Info</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Project ID: {projectId}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Project loaded successfully from Firestore.</p>
        {project.coverPhotoURL && (
          <p className="text-xs text-gray-500 dark:text-gray-400">Cover Photo: {project.coverPhotoURL}</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailView;