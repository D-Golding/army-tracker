// pages/CreatePostPage.jsx - Fixed timing: processing starts at step 1→2 transition
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCreatePhotoPost } from '../hooks/useNewsfeed';
import { useAuth } from '../contexts/AuthContext';
import { processAndUploadPhoto } from '../services/photoService';
import { processVideo } from '../utils/videoProcessor';
import { uploadVideoToR2, uploadPhotoToR2 } from '../utils/r2Upload';

// Updated simplified step components
import MediaSelectionStep from '../components/newsfeed/create/MediaSelectionStep.jsx';
import PostDetailsStep from '../components/newsfeed/create/PostDetailsStep';
import PostPrivacyStep from '../components/newsfeed/create/PostPrivacyStep';

const CreatePostPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    caption: '',
    tags: [],
    files: [],
    visibility: 'public',
    copyrightAccepted: false,
    uploadResults: [] // Store upload results here
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

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
      // Clean up any preview URLs before leaving
      formData.files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
        if (file.editData?.processedPreviewUrl) {
          URL.revokeObjectURL(file.editData.processedPreviewUrl);
        }
      });
      navigate('/app/community');
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Background processing function (now called at step 1→2)
  const startBackgroundProcessing = async () => {
    console.log('🚀 Starting background processing of', formData.files.length, 'files');
    setIsProcessing(true);

    const uploadResults = [];

    for (const file of formData.files) {
      try {
        setUploadProgress(prev => ({
          ...prev,
          [file.id]: { status: 'processing', progress: 10 }
        }));

        let fileToUpload;
        let uploadResult;

        if (file.type === 'video') {
          // Process video if trimmed, otherwise use original
          if (file.editData?.isProcessed && !file.editData?.skipEditing && file.editData?.trimData) {
            setUploadProgress(prev => ({
              ...prev,
              [file.id]: { status: 'compressing', progress: 30 }
            }));

            const { start, end } = file.editData.trimData;
            const processedBlob = await processVideo(
              file.originalFile,
              start,
              end,
              (progress) => {
                setUploadProgress(prev => ({
                  ...prev,
                  [file.id]: { status: 'compressing', progress: 30 + (progress * 0.4) }
                }));
              }
            );

            // Convert blob to File for AWS SDK
            fileToUpload = new File([processedBlob], file.fileName, { type: 'video/mp4' });
          } else {
            fileToUpload = file.originalFile;
          }

          setUploadProgress(prev => ({
            ...prev,
            [file.id]: { status: 'uploading', progress: 70 }
          }));

          const fileName = `${currentUser.uid}/${Date.now()}_${file.fileName}`;
          uploadResult = await uploadVideoToR2(fileToUpload, fileName);
        } else {
          // Handle photos
          if (file.editData?.processedBlob) {
            // Convert blob to File for AWS SDK
            fileToUpload = new File([file.editData.processedBlob], file.fileName, { type: file.fileType });
          } else {
            fileToUpload = file.originalFile;
          }

          setUploadProgress(prev => ({
            ...prev,
            [file.id]: { status: 'uploading', progress: 50 }
          }));

          const fileName = `${currentUser.uid}/${Date.now()}_${file.fileName}`;
          uploadResult = await uploadPhotoToR2(fileToUpload, fileName);
        }

        if (uploadResult.success) {
          uploadResults.push({
            id: file.id,
            type: file.type,
            url: uploadResult.url,
            fileName: uploadResult.fileName,
            originalFileName: file.fileName,
            title: file.metadata?.title || '',
            description: file.metadata?.description || '',
            metadata: {
              fileSize: file.fileSize,
              fileType: file.fileType,
              uploadedAt: new Date().toISOString(),
              wasEdited: !!(file.editData?.processedBlob || file.editData?.trimData)
            }
          });

          setUploadProgress(prev => ({
            ...prev,
            [file.id]: { status: 'complete', progress: 100 }
          }));
        } else {
          throw new Error(uploadResult.error);
        }

      } catch (error) {
        console.error(`Error processing ${file.fileName}:`, error);
        setUploadProgress(prev => ({
          ...prev,
          [file.id]: { status: 'error', progress: 0, error: error.message }
        }));
      }
    }

    // Store upload results in form data
    setFormData(prev => ({
      ...prev,
      uploadResults
    }));

    setIsProcessing(false);
    console.log('✅ Background processing complete. Results:', uploadResults.length);
  };

  // Handle next step - Process starts when Next clicked at end of Step 1
  const handleNext = async () => {
    if (currentStep === 1 && canProceed()) {
      // Moving from Step 1 (Media Selection) to Step 2 (Details)
      // ALWAYS start processing when Next is clicked (regardless of edit status)
      console.log('🎯 Next button clicked - starting background processing...');
      setCurrentStep(2); // Move to step 2 first
      await startBackgroundProcessing(); // Then start processing in background
    } else if (currentStep === 2 && canProceed()) {
      // Moving from Step 2 (Details) to Step 3 (Privacy)
      setCurrentStep(3);
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
    setFormData(prev => {
      const fileToRemove = prev.files.find(f => f.id === fileId);

      // Clean up preview URLs
      if (fileToRemove) {
        if (fileToRemove.previewUrl) {
          URL.revokeObjectURL(fileToRemove.previewUrl);
        }
        if (fileToRemove.editData?.processedPreviewUrl) {
          URL.revokeObjectURL(fileToRemove.editData.processedPreviewUrl);
        }
      }

      return {
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      };
    });
  };

  // Handle file editing (cropping/trimming)
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

  // Handle post data updates (caption, tags, visibility)
  const handlePostDataUpdated = (data) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  // Check if current step is valid for proceeding
  const canProceed = () => {
    switch (currentStep) {
      case 1: // Media selection
        return formData.files.length > 0;
      case 2: // Details
        return formData.files.length > 0 &&
               formData.caption?.trim().length > 0;
      case 3: // Privacy - ready to submit
        return formData.files.length > 0 &&
               formData.caption?.trim().length > 0 &&
               formData.copyrightAccepted === true &&
               formData.uploadResults?.length > 0;
      default:
        return false;
    }
  };

  // Handle final submission
  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Create post with uploaded media URLs
      const postData = {
        content: formData.caption.trim(),
        media: formData.uploadResults, // Already uploaded to R2
        tags: formData.tags || [],
        visibility: formData.visibility || 'public'
      };

      const result = await createPostMutation.mutateAsync(postData);

      if (result.success) {
        // Clean up preview URLs
        formData.files.forEach(file => {
          if (file.previewUrl) {
            URL.revokeObjectURL(file.previewUrl);
          }
          if (file.editData?.processedPreviewUrl) {
            URL.revokeObjectURL(file.editData.processedPreviewUrl);
          }
        });

        const mediaCount = formData.uploadResults.length;
        const photoCount = formData.uploadResults.filter(r => r.type === 'photo').length;
        const videoCount = formData.uploadResults.filter(r => r.type === 'video').length;

        let message = `Post shared ${formData.visibility === 'public' ? 'publicly' : formData.visibility === 'friends' ? 'with friends' : 'privately'}!`;
        if (photoCount > 0 && videoCount > 0) {
          message += ` ${photoCount} photo${photoCount !== 1 ? 's' : ''} and ${videoCount} video${videoCount !== 1 ? 's' : ''} uploaded.`;
        } else if (photoCount > 0) {
          message += ` ${photoCount} photo${photoCount !== 1 ? 's' : ''} uploaded.`;
        } else if (videoCount > 0) {
          message += ` ${videoCount} video${videoCount !== 1 ? 's' : ''} uploaded.`;
        }

        navigate('/app/community', {
          state: { message, type: 'success' }
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

  // Step configuration
  const steps = [
    { id: 1, title: 'Select & Edit Media', description: 'Choose and edit photos and videos' },
    { id: 2, title: 'Add Details', description: 'Caption, tags, and descriptions' },
    { id: 3, title: 'Privacy & Share', description: 'Choose who can see your post' }
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
              disabled={isSubmitting || isProcessing}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="create-post-title">Create Post</h1>
              <p className="create-post-subtitle">
                Step {currentStep} of {steps.length} - {currentStepData.description}
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

        {/* Processing Indicator - NOW SHOWS IN STEP 2 */}
        {isProcessing && currentStep === 2 && (
          <div className="card-base card-padding mb-6 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-blue-800 dark:text-blue-300 font-medium">
                  Processing and uploading your media in the background...
                </p>
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  You can add captions and details while we process your files
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress - NOW SHOWS IN STEP 2 */}
        {Object.keys(uploadProgress).length > 0 && currentStep >= 2 && (
          <div className="card-base card-padding mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Upload Progress</h4>
            <div className="space-y-2">
              {formData.files.map(file => {
                const progress = uploadProgress[file.id];
                if (!progress) return null;

                return (
                  <div key={file.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="truncate">{file.fileName}</span>
                        <span className={`capitalize ${
                          progress.status === 'complete' ? 'text-green-600' :
                          progress.status === 'error' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>
                          {progress.status}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress.status === 'complete' ? 'bg-green-500' :
                            progress.status === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${progress.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="create-post-content">
          {currentStep === 1 && (
            <MediaSelectionStep
              formData={formData}
              onFilesSelected={handleFilesSelected}
              onFileRemoved={handleFileRemoved}
              onFileEdited={handleFileEdited}
              maxFiles={10}
            />
          )}

          {currentStep === 2 && (
            <PostDetailsStep
              formData={formData}
              onMetadataUpdated={handleFileMetadataUpdated}
              onPostDataUpdated={handlePostDataUpdated}
            />
          )}

          {currentStep === 3 && (
            <PostPrivacyStep
              formData={formData}
              onPostDataUpdated={handlePostDataUpdated}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="create-post-navigation">
          <button
            onClick={handleBack}
            disabled={isSubmitting || isProcessing}
            className="create-post-nav-back"
          >
            Cancel
          </button>

          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={isSubmitting || isProcessing}
              className="btn-tertiary btn-md"
            >
              Previous
            </button>
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting || isProcessing}
              className="create-post-nav-continue"
            >
              {isProcessing && currentStep === 1 ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="create-post-nav-continue"
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Sharing Post...
                </>
              ) : (
                'Share'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;