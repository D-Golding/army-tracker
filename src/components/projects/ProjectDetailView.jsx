// components/projects/ProjectDetailView.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Palette as PaletteIcon, Camera, CheckCircle, Clock, Play } from 'lucide-react';
import { useProject, useProjectOperations } from '../../hooks/useProjects';
import { useSubscription } from '../../hooks/useSubscription';
import { addProjectPhotosById } from '../../services/projectService';
import CameraCapture from '../shared/CameraCapture';
import PhotoGallery from '../shared/PhotoGallery';
import PaintOverview from './PaintOverview';
import ProjectSteps from './ProjectSteps';

const ProjectDetailView = () => {
  const { projectId } = useParams();
  const [projectPhotos, setProjectPhotos] = useState([]);

  // Fetch real project data using the new hook
  const { data: project, isLoading, isError, error, refetch } = useProject(projectId);
  const { addPaints, removePaint, addStep, updateStep, deleteStep, reorderSteps } = useProjectOperations();

  // Get subscription limits
  const { limits, canPerformAction, currentTier } = useSubscription();

  // Initialize project photos when project data loads
  React.useEffect(() => {
    if (project && project.photoURLs) {
      setProjectPhotos(project.photoURLs);
    }
  }, [project]);

  // Handle new photos being uploaded
  const handlePhotosUploaded = async (uploadResults) => {
    const newPhotoURLs = uploadResults.map(result => result.downloadURL);

    try {
      // Save to Firestore
      await addProjectPhotosById(projectId, newPhotoURLs);

      // Update local state
      setProjectPhotos(prev => [...prev, ...newPhotoURLs]);

      // Refetch project data to ensure consistency
      refetch();
    } catch (error) {
      console.error('Error saving photos to project:', error);
      // Could show an error message to user here
    }
  };

  // Handle photo deletion
  const handlePhotoDeleted = (deletedPhotoUrl) => {
    setProjectPhotos(prev => prev.filter(url => url !== deletedPhotoUrl));

    // Refetch project data to ensure consistency
    refetch();
  };

  // Handle adding paints to project
  const handlePaintsAdded = async (paintsToAdd) => {
    try {
      await addPaints({ projectId, paints: paintsToAdd });
      refetch(); // Refresh project data to show new paints
    } catch (error) {
      console.error('Error adding paints to project:', error);
      throw error; // Re-throw so PaintOverview can handle UI feedback
    }
  };

  // Handle removing paint from project
  const handlePaintRemoved = async (paintId) => {
    try {
      await removePaint({ projectId, paintId });
      refetch(); // Refresh project data to remove paint
    } catch (error) {
      console.error('Error removing paint from project:', error);
      throw error; // Re-throw so PaintOverview can handle UI feedback
    }
  };

  // Handle adding step to project
  const handleStepAdded = async (stepData) => {
    try {
      await addStep({ projectId, step: stepData });
      refetch(); // Refresh project data to show new step
    } catch (error) {
      console.error('Error adding step to project:', error);
      throw error; // Re-throw so ProjectSteps can handle UI feedback
    }
  };

  // Handle updating step
  const handleStepUpdated = async (stepId, stepUpdates) => {
    try {
      await updateStep({ projectId, stepId, updates: stepUpdates });
      refetch(); // Refresh project data to show updated step
    } catch (error) {
      console.error('Error updating step:', error);
      throw error; // Re-throw so ProjectStep can handle UI feedback
    }
  };

  // Handle deleting step
  const handleStepDeleted = async (stepId) => {
    try {
      await deleteStep({ projectId, stepId });
      refetch(); // Refresh project data to remove step
    } catch (error) {
      console.error('Error deleting step:', error);
      throw error; // Re-throw so ProjectStep can handle UI feedback
    }
  };

  // Handle reordering steps
  const handleStepsReordered = async (reorderedSteps) => {
    try {
      await reorderSteps({ projectId, steps: reorderedSteps });
      refetch(); // Refresh project data to show new order
    } catch (error) {
      console.error('Error reordering steps:', error);
      throw error; // Re-throw so ProjectSteps can handle UI feedback
    }
  };

  // Handle assigning paint to step
  const handlePaintAssigned = async (stepId, assignment) => {
    try {
      const currentStep = project?.steps?.find(s => s.id === stepId);
      if (!currentStep) {
        throw new Error('Step not found');
      }

      const currentPaints = currentStep.paints || [];
      const updatedPaints = [...currentPaints, assignment];

      await updateStep({
        projectId,
        stepId,
        updates: { paints: updatedPaints }
      });
      refetch(); // Refresh project data to show new assignment
    } catch (error) {
      console.error('Error assigning paint to step:', error);
      throw error;
    }
  };

  // Handle removing paint from step
  const handlePaintRemovedFromStep = async (stepId, paintId) => {
    try {
      const currentStep = project?.steps?.find(s => s.id === stepId);
      if (!currentStep) {
        throw new Error('Step not found');
      }

      const updatedPaints = (currentStep.paints || []).filter(p => p.paintId !== paintId);

      await updateStep({
        projectId,
        stepId,
        updates: { paints: updatedPaints }
      });
      refetch(); // Refresh project data to remove assignment
    } catch (error) {
      console.error('Error removing paint from step:', error);
      throw error;
    }
  };

  // Handle updating paint assignment
  const handlePaintAssignmentUpdated = async (stepId, paintId, updates) => {
    try {
      const currentStep = project?.steps?.find(s => s.id === stepId);
      if (!currentStep) {
        throw new Error('Step not found');
      }

      const updatedPaints = (currentStep.paints || []).map(paint =>
        paint.paintId === paintId ? { ...paint, ...updates } : paint
      );

      await updateStep({
        projectId,
        stepId,
        updates: { paints: updatedPaints }
      });
      refetch(); // Refresh project data to show updated assignment
    } catch (error) {
      console.error('Error updating paint assignment:', error);
      throw error;
    }
  };

  // Handle assigning photos to step
  const handlePhotosAssigned = async (stepId, photoUrls) => {
    try {
      await updateStep({
        projectId,
        stepId,
        updates: { photos: photoUrls }
      });
      refetch(); // Refresh project data to show new photos
    } catch (error) {
      console.error('Error assigning photos to step:', error);
      throw error;
    }
  };

  // Handle updating step notes
  const handleNotesUpdated = async (stepId, updatedNotes) => {
    try {
      await updateStep({
        projectId,
        stepId,
        updates: { notes: updatedNotes }
      });
      refetch(); // Refresh project data to show updated notes
    } catch (error) {
      console.error('Error updating step notes:', error);
      throw error;
    }
  };

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

  // Photo button logic
  const canAddPhotos = canPerformAction('add_photo', 1, project);
  const isTopTier = currentTier === 'battle';
  const photoButtonDisabled = !canAddPhotos && isTopTier;

  return (
    <div>
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

      {/* Project Photos Section */}
      <div className="card-base card-padding mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Camera className="mr-2" size={18} />
            Project Photos ({projectPhotos.length})
          </h2>

          {/* Add Photos Button */}
          <CameraCapture
            onPhotosUploaded={handlePhotosUploaded}
            projectId={projectId}
            projectData={project}
            photoType="project"
            maxPhotos={limits.photosPerProject}
            buttonText={canAddPhotos ? "Add Photos" : (isTopTier ? "Add Photos" : "Upgrade")}
            buttonStyle={`btn-primary btn-sm ${photoButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={photoButtonDisabled}
          />
        </div>

        {/* Photo Gallery */}
        <PhotoGallery
          photos={projectPhotos}
          onPhotoDeleted={handlePhotoDeleted}
          allowDelete={true}
          gridCols={2}
          aspectRatio="aspect-video"
        />
      </div>

      {/* Description Section */}
      {project.description && (
        <div className="card-base card-padding mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
          <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
        </div>
      )}

      {/* Paint Overview Section */}
      <PaintOverview
        projectData={project}
        onPaintsAdded={handlePaintsAdded}
        onPaintRemoved={handlePaintRemoved}
        className="mb-6"
      />

      {/* Project Steps Section */}
      <ProjectSteps
        projectData={project}
        onStepAdded={handleStepAdded}
        onStepUpdated={handleStepUpdated}
        onStepDeleted={handleStepDeleted}
        onStepsReordered={handleStepsReordered}
        onPaintAssigned={handlePaintAssigned}
        onPaintRemoved={handlePaintRemovedFromStep}
        onPaintAssignmentUpdated={handlePaintAssignmentUpdated}
        onPhotosAssigned={handlePhotosAssigned}
        onNotesUpdated={handleNotesUpdated}
        className="mb-6"
      />

      {/* Required Paints Section - Legacy (keep for backward compatibility) */}
      {project.requiredPaints && project.requiredPaints.length > 0 && (
        <div className="card-base card-padding mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <PaletteIcon className="mr-2" size={18} />
            Required Paints (Legacy) ({project.requiredPaints.length})
          </h2>
          <div className="space-y-2">
            {project.requiredPaints.map((paint, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span className="font-medium text-gray-900 dark:text-white">{paint}</span>
                <button className="btn-tertiary btn-sm">
                  Check Status
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paint Assignments Section - Placeholder for future development */}
      <div className="card-base card-padding mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paint Assignments</h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <PaletteIcon className="mx-auto mb-3" size={32} />
          <p className="mb-3">No paint assignments yet</p>
          <button className="btn-primary btn-sm">
            Add Paint Assignment
          </button>
        </div>
      </div>

      {/* Project Notes Section - Placeholder for future development */}
      <div className="card-base card-padding mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Notes</h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="mb-3">No project notes yet</p>
          <button className="btn-primary btn-sm">
            Add Note
          </button>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      <div className="card-base card-padding bg-gray-50 dark:bg-gray-800">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Debug Info</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Project ID: {projectId}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Project loaded successfully from Firestore.</p>
      </div>
    </div>
  );
};

export default ProjectDetailView;