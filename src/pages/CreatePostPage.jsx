// pages/CreatePostPage.jsx - Create post page with global styling
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Type, Hash, Upload } from 'lucide-react';
import { useCreatePhotoPost } from '../hooks/useNewsfeed';
import { useAuth } from '../contexts/AuthContext';
import PhotoSelectionStep from '../components/newsfeed/create/PhotoSelectionStep';
import PhotoCropStep from '../components/newsfeed/create/PhotoCropStep';
import PhotoMetadataStep from '../components/newsfeed/create/PhotoMetadataStep';
import PostDetailsStep from '../components/newsfeed/create/PostDetailsStep';
import PostReviewStep from '../components/newsfeed/create/PostReviewStep';
import PostUploadStep from '../components/newsfeed/create/PostUploadStep';

const CreatePostPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    caption: '',
    tags: [],
    files: [],
    visibility: 'public' // Default to public
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const createPostMutation = useCreatePhotoPost();

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Handle back navigation
  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/app/community');
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle file selection
  const handleFilesSelected = (files) => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  // Handle file removal
  const handleFileRemoved = (fileId) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }));
  };

  // Handle file editing
  const handleFileEdited = (fileId, editData) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.id === fileId
          ? { ...file, editData: { ...file.editData, ...editData } }
          : file
      )
    }));
  };

  // Handle file metadata update
  const handleFileMetadataUpdated = (fileId, metadata) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.id === fileId
          ? { ...file, metadata: { ...file.metadata, ...metadata } }
          : file
      )
    }));
  };

  // Handle post details update (includes visibility)
  const handlePostDetailsUpdated = (details) => {
    setFormData(prev => ({
      ...prev,
      caption: details.caption,
      tags: details.tags,
      visibility: details.visibility
    }));
  };

  // Handle final submission
  const handleSubmit = async (uploadResults) => {
    // Prevent double submission
    if (isSubmitting) {
      console.log('🚫 Submission already in progress, ignoring...');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('🎯 Creating post with:', {
        uploadResults,
        caption: formData.caption,
        tags: formData.tags,
        visibility: formData.visibility
      });

      // Validate we have upload results
      if (!uploadResults || uploadResults.length === 0) {
        throw new Error('No photos were uploaded successfully');
      }

      // Validate we have a caption
      if (!formData.caption || !formData.caption.trim()) {
        throw new Error('Caption is required');
      }

      // Map all uploaded photos to the new structure
      const photos = uploadResults.map((uploadResult, index) => ({
        imageUrl: uploadResult.downloadURL,
        storagePath: uploadResult.storagePath,
        title: uploadResult.metadata?.title || '',
        description: uploadResult.metadata?.description || '',
        originalFileName: uploadResult.metadata?.originalFileName || '',
        aspectRatio: uploadResult.metadata?.aspectRatio || 'original',
        wasEdited: uploadResult.metadata?.wasEdited || false,
        order: index, // For maintaining photo order
        metadata: {
          fileSize: uploadResult.metadata?.metadata?.fileSize || 0,
          fileType: uploadResult.metadata?.metadata?.fileType || 'image/jpeg',
          uploadedAt: uploadResult.metadata?.metadata?.uploadedAt || new Date().toISOString()
        }
      }));

      const postData = {
        content: formData.caption.trim(),
        photos: photos, // Now an array of photos instead of single photoData
        tags: formData.tags || [],
        visibility: formData.visibility || 'public', // Include visibility
        relatedProjectId: null
      };

      console.log('📝 Final post data:', postData);

      const result = await createPostMutation.mutateAsync(postData);

      if (result.success) {
        console.log('✅ Post created successfully:', result.postId);
        navigate('/app/community', {
          state: {
            message: `Post shared ${formData.visibility === 'public' ? 'publicly' : formData.visibility === 'friends' ? 'with friends' : 'privately'}!`,
            type: 'success'
          }
        });
      } else {
        throw new Error(result.error || 'Failed to create post');
      }

    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current step is valid
  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.files.length > 0;
      case 2: return formData.files.every(f => f.editData?.isProcessed);
      case 3: return true; // Metadata is optional
      case 4: return formData.caption.trim().length > 0;
      case 5: return true; // Review step
      default: return false;
    }
  };

  // Step configuration
  const steps = [
    { id: 1, title: 'Select Photos', description: 'Choose up to 10 photos to share' },
    { id: 2, title: 'Edit Photos', description: 'Crop and adjust your photos' },
    { id: 3, title: 'Photo Details', description: 'Add titles and descriptions' },
    { id: 4, title: 'Post Details', description: 'Add caption, tags and privacy' },
    { id: 5, title: 'Review', description: 'Review your post before sharing' },
    { id: 6, title: 'Upload', description: 'Sharing your post...' }
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="create-post-wrapper">
      <div className="create-post-container">

        {/* Header */}
        <div className="create-post-header">
          <div className="create-post-header-content">
            <button
              onClick={handleBack}
              className="create-post-back-button"
              disabled={isUploading || isSubmitting}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="create-post-title">Create Post</h1>
              <p className="create-post-subtitle">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="create-post-progress">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
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
                {index < steps.length - 1 && (
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
          {currentStep === 1 && (
            <PhotoSelectionStep
              formData={formData}
              onFilesSelected={handleFilesSelected}
              onFileRemoved={handleFileRemoved}
              maxPhotos={10}
            />
          )}

          {currentStep === 2 && (
            <PhotoCropStep
              formData={formData}
              onFileEdited={handleFileEdited}
              onAllPhotosProcessed={() => {
                // Auto-advance when all photos are processed
                setTimeout(() => setCurrentStep(3), 500);
              }}
            />
          )}

          {currentStep === 3 && (
            <PhotoMetadataStep
              formData={formData}
              onMetadataUpdated={handleFileMetadataUpdated}
            />
          )}

          {currentStep === 4 && (
            <PostDetailsStep
              formData={formData}
              onDetailsUpdated={handlePostDetailsUpdated}
            />
          )}

          {currentStep === 5 && (
            <PostReviewStep
              formData={formData}
              onEditStep={setCurrentStep}
            />
          )}

          {currentStep === 6 && (
            <PostUploadStep
              formData={formData}
              onComplete={handleSubmit}
              onCancel={() => navigate('/app/community')}
            />
          )}
        </div>

        {/* Navigation */}
        {currentStep < 6 && (
          <div className="create-post-navigation">
            <button
              onClick={handleBack}
              disabled={isUploading || isSubmitting}
              className="create-post-nav-back"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed() || isUploading || isSubmitting}
              className="create-post-nav-continue"
            >
              {currentStep === 5 ? 'Share Post' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePostPage;