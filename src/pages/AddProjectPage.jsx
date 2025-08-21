// pages/AddProjectPage.jsx - Simplified to just project details
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useProjectOperations } from '../hooks/useProjects';
import { useGamificationOperations } from '../hooks/useGamification';
import { validateProjectForm } from '../utils/projectValidation';
import ProjectDetailsForm from '../components/projects/wizard/project/ProjectDetailsForm';

const AddProjectPage = () => {
  const navigate = useNavigate();
  const { createProject, isLoading } = useProjectOperations();
  const { triggerForAction } = useGamificationOperations();

  // Form state - just the basic project details
  const [formData, setFormData] = useState({
    name: '',
    difficulty: 'beginner',
    manufacturer: '',
    customManufacturer: '',
    game: '',
    customGame: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  // Update a single field
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle manufacturer changes with reset logic
  const updateManufacturer = (manufacturer) => {
    setFormData(prev => ({
      ...prev,
      manufacturer,
      customManufacturer: manufacturer === 'custom' ? prev.customManufacturer : '',
      game: '', // Reset game when manufacturer changes
      customGame: ''
    }));
  };

  // Handle game changes
  const updateGame = (game) => {
    setFormData(prev => ({
      ...prev,
      game,
      customGame: game === 'custom' ? prev.customGame : ''
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateProjectForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

    try {
      console.log('AddProjectPage: Creating project with data:', formData);

      // Determine final manufacturer and game values
      const finalManufacturer = formData.manufacturer === 'custom'
        ? (formData.customManufacturer || '').trim()
        : (formData.manufacturer || '');

      const finalGame = formData.game === 'custom'
        ? (formData.customGame || '').trim()
        : (formData.game || '');

      // Create project data object
      const projectData = {
        name: formData.name.trim(),
        manufacturer: finalManufacturer,
        game: finalGame,
        description: (formData.description || '').trim(),
        difficulty: formData.difficulty || 'beginner',
        status: 'upcoming'
      };

      console.log('AddProjectPage: Calling createProject...');
      const result = await createProject(projectData);
      console.log('AddProjectPage: Project created successfully:', result);

      // Trigger achievement check for project creation
      try {
        await triggerForAction('project_created', {
          projectData,
          projectName: projectData.name
        });
        console.log('🎯 Achievement check triggered for project creation');
      } catch (achievementError) {
        console.error('Achievement trigger failed (non-blocking):', achievementError);
      }

      // Navigate to the newly created project
      console.log('AddProjectPage: Navigating to project:', result.id);
      navigate(`/app/projects/${result.id}`);

    } catch (error) {
      console.error('AddProjectPage: Error creating project:', error);
      setErrors({
        submit: error.message || 'Failed to create project. Please try again.'
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/app/projects');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/app/projects"
          className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Project</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Set up your new miniature painting project
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="card-base card-padding">
        <form onSubmit={handleSubmit} className="space-y-6">
          <ProjectDetailsForm
            formData={formData}
            onFieldChange={updateField}
            onManufacturerChange={updateManufacturer}
            onGameChange={updateGame}
            errors={errors}
            isLoading={isLoading}
          />

          {/* Submit Error Display */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="text-red-800 dark:text-red-300 text-sm font-medium">
                {errors.submit}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="btn-tertiary btn-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !formData.name?.trim()}
              className={`btn-primary btn-md flex-1 ${
                isLoading || !formData.name?.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Creating Project...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Project
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
            <div className="text-indigo-800 dark:text-indigo-300 text-sm">
              <div className="font-medium mb-1">💡 What's next?</div>
              <p>After creating your project, you can add paints, upload photos, and create detailed painting steps!</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectPage;