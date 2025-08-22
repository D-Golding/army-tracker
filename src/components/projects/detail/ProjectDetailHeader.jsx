// components/projects/detail/ProjectDetailHeader.jsx - Updated with inline editing, proper date handling, and faction/unit display
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, Clock, Play, Edit2, Check, X, MoreVertical, Shield, User } from 'lucide-react';
import { DIFFICULTY_OPTIONS } from '../../../utils/projectValidation';

// European date formatting utility
const formatDateEuropean = (dateInput) => {
  try {
    // Handle null, undefined, or empty values
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
      return 'Invalid date format';
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

const ProjectDetailHeader = ({ project, handlers }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(project?.name || '');
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const {
    handleTitleUpdate,
    handleDifficultyUpdate,
    handleStatusUpdate,
    isUpdating
  } = handlers;

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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'badge-secondary';
      case 'intermediate': return 'badge-warning';
      case 'advanced': return 'badge-danger';
      case 'expert': return 'badge-purple';
      default: return 'badge-tertiary';
    }
  };

  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming', icon: <Clock size={12} /> },
    { value: 'started', label: 'Started', icon: <Play size={12} /> },
    { value: 'completed', label: 'Completed', icon: <CheckCircle size={12} /> }
  ];

  // Handle title save
  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle.trim() !== project.name) {
      try {
        await handleTitleUpdate(editTitle.trim());
        setIsEditingTitle(false);
      } catch (error) {
        console.error('Error updating title:', error);
        alert('Failed to update title. Please try again.');
      }
    } else {
      setIsEditingTitle(false);
    }
  };

  // Handle title cancel
  const handleCancelTitle = () => {
    setEditTitle(project?.name || '');
    setIsEditingTitle(false);
  };

  // Handle difficulty change
  const handleDifficultyChange = async (newDifficulty) => {
    if (newDifficulty !== project.difficulty) {
      try {
        await handleDifficultyUpdate(newDifficulty);
        setIsEditingStatus(false);
      } catch (error) {
        console.error('Error updating difficulty:', error);
        alert('Failed to update difficulty. Please try again.');
      }
    } else {
      setIsEditingStatus(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    if (newStatus !== project.status) {
      try {
        await handleStatusUpdate(newStatus);
        setIsEditingStatus(false);
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status. Please try again.');
      }
    } else {
      setIsEditingStatus(false);
    }
  };

  return (
    <>
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          to="/app/projects"
          className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </Link>
        <div className="flex-1">
          {/* Editable Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-2xl font-bold bg-transparent border-b-2 border-indigo-500 text-gray-900 dark:text-white focus:outline-none flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') handleCancelTitle();
                }}
                disabled={isUpdating}
              />
              <button
                onClick={handleSaveTitle}
                disabled={isUpdating || !editTitle.trim()}
                className="p-1 text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
              >
                <Check size={16} />
              </button>
              <button
                onClick={handleCancelTitle}
                disabled={isUpdating}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project?.name}</h1>
              <button
                onClick={() => {
                  setEditTitle(project?.name || '');
                  setIsEditingTitle(true);
                }}
                disabled={isUpdating}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Edit project name"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}

          {/* NEW: Faction and Unit Name - positioned right under title */}
          <div className="space-y-1 mt-3">
            {project?.faction && project.faction.trim() && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-base">
                <Shield size={16} className="flex-shrink-0" />
                <span>{project.faction}</span>
              </div>
            )}

            {project?.unitName && project.unitName.trim() && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-base">
                <User size={16} className="flex-shrink-0" />
                <span>{project.unitName}</span>
              </div>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center mt-2">
            <Calendar className="mr-1" size={12} />
            Created: {formatDateEuropean(project?.created)}
          </p>
        </div>
      </div>

      {/* Status, Difficulty and Actions - Second Line */}
      <div className="flex items-center justify-end gap-2 mb-6">
        <span className={`badge-base ${getStatusColor(project?.status)} flex items-center gap-1`}>
          {getStatusIcon(project?.status)}
          {project?.status?.charAt(0).toUpperCase() + project?.status?.slice(1)}
        </span>

        <span className={`badge-base ${getDifficultyColor(project?.difficulty)}`}>
          {project?.difficulty?.charAt(0).toUpperCase() + project?.difficulty?.slice(1)}
        </span>

        {/* Mobile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsEditingStatus(!isEditingStatus)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={isUpdating}
            aria-label="Project actions menu"
          >
            <MoreVertical size={16} />
          </button>

          {isEditingStatus && (
            <>
              <div className="dropdown-backdrop" onClick={() => setIsEditingStatus(false)}></div>
              <div className="dropdown-menu top-8 right-0 w-48">

                {/* Status Updates */}
                {statusOptions.filter(s => s.value !== project?.status).map((status) => {
                  return (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      className="dropdown-item"
                      disabled={isUpdating}
                    >
                      {status.icon}
                      Mark {status.label}
                    </button>
                  );
                })}

                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                {/* Difficulty Updates */}
                {DIFFICULTY_OPTIONS.filter(d => d.value !== project?.difficulty).map((difficulty) => {
                  return (
                    <button
                      key={difficulty.value}
                      onClick={() => handleDifficultyChange(difficulty.value)}
                      className="dropdown-item"
                      disabled={isUpdating}
                    >
                      Set {difficulty.label}
                    </button>
                  );
                })}

              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectDetailHeader;