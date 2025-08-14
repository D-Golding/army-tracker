// components/projects/detail/ProjectDetailHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, Clock, Play } from 'lucide-react';

const ProjectDetailHeader = ({ project }) => {
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
      case 'upcoming': return <Clock size={16} />;
      case 'started': return <Play size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      default: return null;
    }
  };

  return (
    <>
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/app/projects"
          className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center mt-1">
            <Calendar className="mr-1" size={12} />
            Created: {new Date(project.created).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Project Status */}
      <div className="mb-6">
        <span className={`badge-base ${getStatusColor(project.status)} flex items-center gap-2 w-fit`}>
          {getStatusIcon(project.status)}
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
      </div>
    </>
  );
};

export default ProjectDetailHeader;