// components/projects/AddProjectModal.jsx - Simplified Project Creation Form
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const AddProjectModal = ({ isOpen, onClose, onProjectCreated, isCreating = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'upcoming',
    difficulty: 'beginner'
  });
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      await onProjectCreated({
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        difficulty: formData.difficulty
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'upcoming',
        difficulty: 'beginner'
      });
      setError(null);
    } catch (error) {
      setError('Failed to create project. Please try again.');
      console.error('Error creating project:', error);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isCreating) {
      setFormData({
        name: '',
        description: '',
        status: 'upcoming',
        difficulty: 'beginner'
      });
      setError(null);
      onClose();
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (error && field === 'name' && value.trim()) {
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content max-w-md card-padding" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add New Project
          </h3>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Project Name */}
          <div>
            <label className="form-label">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`form-input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., Space Marine Squad"
              disabled={isCreating}
              autoFocus
            />
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="form-label">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="form-textarea"
              placeholder="What are you planning to paint? (optional)"
              rows="3"
              disabled={isCreating}
            />
            <div className="form-help">
              Add details about your project goals and vision
            </div>
          </div>

          {/* Status and Difficulty Row */}
          <div className="grid grid-cols-2 gap-3">

            {/* Status */}
            <div>
              <label className="form-label">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="form-select"
                disabled={isCreating}
              >
                <option value="upcoming">Upcoming</option>
                <option value="started">Started</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="form-label">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="form-select"
                disabled={isCreating}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Pro tip:</strong> You can add paints, photos, and detailed steps after creating your project!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="btn-tertiary btn-md flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isCreating}
              className="btn-primary btn-md flex-1"
            >
              {isCreating ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;