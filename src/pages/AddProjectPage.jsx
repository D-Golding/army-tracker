// pages/AddProjectPage.jsx - Updated to use project wizard
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useProjectOperations } from '../hooks/useProjects';
import { useGamificationOperations } from '../hooks/useGamification';
import AddProjectWizard from '../components/projects/wizard/project/AddProjectWizard';

const AddProjectPage = () => {
  const navigate = useNavigate();
  const { createProject, isLoading } = useProjectOperations();
  const { triggerForAction } = useGamificationOperations();

  // Handle form submission
  const handleFormSubmit = async (projectData) => {
    console.log('AddProjectPage: Received project data:', projectData);

    try {
      console.log('AddProjectPage: Calling createProject...');
      await createProject(projectData);
      console.log('AddProjectPage: Project created successfully');

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

      // Navigate back to projects list
      console.log('AddProjectPage: Navigating to projects list...');
      navigate('/app/projects');

    } catch (error) {
      console.error('AddProjectPage: Error creating project:', error);
      throw error; // Re-throw so wizard can handle UI feedback
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

      {/* Wizard Card */}
      <div className="card-base card-padding">
        <AddProjectWizard
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AddProjectPage;