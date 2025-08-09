// components/projects/AddStepModal.jsx
import React, { useState } from 'react';
import { X, Plus, ListOrdered } from 'lucide-react';

const AddStepModal = ({
  isOpen,
  onClose,
  onStepCreated,
  stepNumber = 1
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Step title is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await onStepCreated({
        title: formData.title.trim(),
        description: formData.description.trim()
      });

      // Reset form
      setFormData({
        title: '',
        description: ''
      });

    } catch (error) {
      setError('Failed to create step. Please try again.');
      console.error('Error creating step:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isCreating) {
      setFormData({
        title: '',
        description: ''
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
    if (error && field === 'title' && value.trim()) {
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ListOrdered className="mr-2" size={18} />
            Add Step {stepNumber}
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

          {/* Step Title */}
          <div>
            <label className="form-label">
              Step Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`form-input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., Prime all surfaces"
              disabled={isCreating}
              autoFocus
            />
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}
          </div>

          {/* Step Description */}
          <div>
            <label className="form-label">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="form-textarea"
              placeholder="Add details about this step (optional)"
              rows="3"
              disabled={isCreating}
            />
            <div className="form-help">
              Describe what needs to be done in this step
            </div>
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
              disabled={!formData.title.trim() || isCreating}
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
                  Create Step
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStepModal;