// pages/AddStepPage.jsx - Page wrapper for adding steps
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ListOrdered } from 'lucide-react';
import { useProject, useProjectOperations } from '../hooks/useProjects';
import { useGamificationOperations } from '../hooks/useGamification';
import { formatStepData } from '../utils/steps/stepHelpers';
import AddStepForm from '../components/projects/AddStepForm';

const AddStepPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading: isProjectLoading } = useProject(projectId);
  const { addStep, isLoading } = useProjectOperations();
  const { triggerForAction } = useGamificationOperations();

  // Handle form submission
  const handleFormSubmit = async (stepData) => {
    try {
      const stepNumber = (project?.steps?.length || 0) + 1;

      // Use formatStepData helper to create step with stepPhoto preserved
      const newStep = formatStepData(stepData, projectId, stepNumber);

      console.log('🔄 Creating step with data:', newStep);
      console.log('📸 Step photo in final data:', newStep.stepPhoto);

      await addStep({ projectId, step: newStep });

      // Trigger achievement check for step creation
      try {
        await triggerForAction('step_created', {
          stepData: newStep,
          projectData: project,
          totalSteps: stepNumber
        });
        console.log('🎯 Achievement check triggered for step creation');
      } catch (achievementError) {
        console.error('Achievement trigger failed (non-blocking):', achievementError);
      }

      // Navigate back to project detail
      navigate(`/app/projects/${projectId}`);

    } catch (error) {
      console.error('Error creating step:', error);
      throw error; // Re-throw so form can handle UI feedback
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/app/projects/${projectId}`);
  };

  // Loading state for project
  if (isProjectLoading) {
    return (
      <div className="text-center py-8">
        <div className="loading-spinner-primary mx-auto mb-4"></div>
        <div className="text-gray-600 dark:text-gray-400">Loading project...</div>
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

  const stepNumber = (project.steps?.length || 0) + 1;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={`/app/projects/${projectId}`}
          className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add Step {stepNumber}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Add a new step to "{project.name}"
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="card-base card-padding">
        <AddStepForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          stepNumber={stepNumber}
          projectData={project}
        />
      </div>
    </div>
  );
};

export default AddStepPage;