// components/newsfeed/create/CreatePostWizard.jsx - Main 3-step wizard using proper CSS classes
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCreatePhotoPost } from '../../../hooks/useNewsfeed';
import { useAuth } from '../../../contexts/AuthContext';
import { usePostFormData } from '../../../hooks/usePostFormData';

// Step Components
import PostPhotoSelectionStep from './PostPhotoSelectionStep';
import PostDetailsStep from './PostDetailsStep';
import PostPrivacyStep from './PostPrivacyStep';

const CreatePostWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Form data management
  const {
    formData,
    addFiles,
    removeFile,
    updateFileMetadata,
    updateFileEditData,
    updatePostData,
    clearForm,
    canProceedToStep,
    getSubmissionData
  } = usePostFormData();

  const createPostMutation = useCreatePhotoPost();

  const STEPS = [
    { number: 1, title: 'Select Photos to Share', component: PostPhotoSelectionStep },
    { number: 2, title: 'Add Photo Details', component: PostDetailsStep },
    { number: 3, title: 'Post Settings', component: PostPrivacyStep }
  ];

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < STEPS.length && canProceedToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All your progress will be lost.')) {
      clearForm();
      navigate('/app/community');
    }
  };

  // Final submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submissionData = await getSubmissionData();
      const result = await createPostMutation.mutateAsync(submissionData);

      if (result.success) {
        clearForm();
        navigate('/app/community', {
          state: {
            message: `Successfully shared your post with ${formData.files.length} photo${formData.files.length !== 1 ? 's' : ''}!`,
            type: 'success'
          }
        });
      } else {
        throw new Error(result.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Post creation failed:', error);
      alert(`Failed to create post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = STEPS[currentStep - 1];
  const StepComponent = currentStepData.component;

  return (
    <div className="create-post-wrapper">
      <div className="create-post-container">
        {/* Header */}
        <div className="create-post-header">
          <div className="create-post-header-content">
            <button
              onClick={handleCancel}
              className="create-post-back-button"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="create-post-title">Create Post</h1>
              <p className="create-post-subtitle">
                Step {currentStep} of {STEPS.length} - {currentStepData.title}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="create-post-progress">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={
                    index + 1 < currentStep
                      ? 'create-post-step-completed'
                      : index + 1 === currentStep
                      ? 'create-post-step-current'
                      : 'create-post-step-upcoming'
                  }
                >
                  {index + 1 < currentStep ? '✓' : index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={
                      index + 1 < currentStep
                        ? 'create-post-step-connector-completed'
                        : 'create-post-step-connector-upcoming'
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="create-post-content">
          <StepComponent
            formData={formData}
            onFilesSelected={addFiles}
            onFileRemoved={removeFile}
            onMetadataUpdated={updateFileMetadata}
            onFileEdited={updateFileEditData}
            onPostDataUpdated={updatePostData}
          />
        </div>

        {/* Navigation */}
        <div className="create-post-navigation">
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              disabled={isSubmitting}
              className="create-post-nav-back"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
          )}

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              disabled={!canProceedToStep(currentStep + 1) || isSubmitting}
              className="create-post-nav-continue"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceedToStep(currentStep + 1) || isSubmitting}
              className="create-post-nav-continue"
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Sharing Post...
                </>
              ) : (
                'Share Post'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePostWizard;