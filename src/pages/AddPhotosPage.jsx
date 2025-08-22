// pages/AddPhotosPage.jsx - Updated to use simplified mode
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PhotoUploadWizard from '../components/projects/wizard/photoGallery/PhotoUploadWizard.jsx';
import { useProject } from '../hooks/useProjects';
import { useSubscription } from '../hooks/useSubscription';

const AddPhotosPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { data: projectData, isLoading } = useProject(projectId);
  const { limits } = useSubscription();

  const handleComplete = async (uploadResults) => {
    navigate(`/app/projects/${projectId}`, {
      state: {
        message: `Successfully uploaded ${uploadResults.length} photo${uploadResults.length !== 1 ? 's' : ''}!`,
        type: 'success'
      }
    });
  };

  const handleCancel = () => {
    navigate(`/app/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner-primary mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">Loading project...</div>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-4">Project not found</div>
          <button
            onClick={() => navigate('/app/projects')}
            className="btn-primary btn-md"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 min-h-screen">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 pt-12">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleCancel}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Add Photos</h1>
              <p className="text-white/90 text-sm">
                {projectData?.name || 'Project'}
              </p>
            </div>
          </div>
        </div>

        {/* Simplified Upload Content */}
        <div className="p-6">
          <PhotoUploadWizard
            onComplete={handleComplete}
            onCancel={handleCancel}
            projectId={projectId}
            projectData={projectData}
            photoType="project"
            maxPhotos={limits?.photosPerProject || 10}
            enableCropping={true}
            mode="simplified"
          />
        </div>
      </div>
    </div>
  );
};

export default AddPhotosPage;