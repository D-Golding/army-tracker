// components/shared/wizard/photoGallery/PhotoEditForm.jsx - Require photo processing
import React, { useState } from 'react';
import { Edit, Check } from 'lucide-react';
import ProjectPhotoCropper from '../../../projects/ProjectPhotoCropper.jsx';
import PhotoEditProgress from './PhotoEditProgress';
import PhotoEditGrid from './PhotoEditGrid';

const PhotoEditForm = ({
  formData,
  onFileEdited,
  enableCropping = true,
  isLoading = false
}) => {
  const [currentEditingId, setCurrentEditingId] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const selectedFiles = formData.files || [];
  const unprocessedFiles = selectedFiles.filter(f => !f.editData?.isProcessed);
  const processedFiles = selectedFiles.filter(f => f.editData?.isProcessed);
  const currentFile = selectedFiles.find(f => f.id === currentEditingId);

  // Handle starting crop for a file
  const handleStartCrop = (fileId) => {
    setCurrentEditingId(fileId);
    setShowCropper(true);
  };

  // Handle crop completion
  const handleCropComplete = (croppedBlob) => {
    if (!currentEditingId || !currentFile) return;

    const croppedPreviewUrl = URL.createObjectURL(croppedBlob);

    onFileEdited(currentEditingId, {
      isProcessed: true,
      skipEditing: false,
      croppedBlob,
      croppedPreviewUrl,
      aspectRatio: 'custom',
      cropSettings: { timestamp: new Date().toISOString() }
    });

    setShowCropper(false);
    setCurrentEditingId(null);
  };

  // Handle crop cancellation
  const handleCropCancel = () => {
    setShowCropper(false);
    setCurrentEditingId(null);
  };

  // Handle skip editing for a file
  const handleSkipEditing = (fileId) => {
    onFileEdited(fileId, {
      isProcessed: true,
      skipEditing: true,
      croppedBlob: null,
      croppedPreviewUrl: null,
      aspectRatio: 'original',
      cropSettings: null
    });
  };

  // Handle skip all unprocessed files
  const handleSkipAll = () => {
    unprocessedFiles.forEach(file => handleSkipEditing(file.id));
  };

  // Auto-process if cropping disabled
  if (!enableCropping) {
    React.useEffect(() => {
      unprocessedFiles.forEach(file => handleSkipEditing(file.id));
    }, [unprocessedFiles.length]);

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Edit className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Photo Processing
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Photos are being processed automatically
          </p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div className="text-emerald-800 dark:text-emerald-300 text-sm text-center">
            <Check className="mx-auto mb-2" size={24} />
            <div className="font-medium">All photos processed</div>
            <div>Ready to proceed to the next step</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Edit className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Photos
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Crop your photos or skip to use originals
          </p>
        </div>

        {/* Show warning if photos still need processing */}
        {unprocessedFiles.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="text-amber-800 dark:text-amber-300 text-sm">
              <div className="font-medium mb-1">Action Required</div>
              <div>
                You have {unprocessedFiles.length} photo{unprocessedFiles.length !== 1 ? 's' : ''} that need{unprocessedFiles.length === 1 ? 's' : ''} to be processed.
                You can crop them for better framing or skip to use the originals.
              </div>
            </div>
          </div>
        )}

        {/* Progress Summary */}
        <PhotoEditProgress
          processedCount={processedFiles.length}
          totalCount={selectedFiles.length}
          onSkipAll={handleSkipAll}
          isLoading={isLoading}
        />

        {/* Photo Editing Grid */}
        <PhotoEditGrid
          unprocessedFiles={unprocessedFiles}
          processedFiles={processedFiles}
          onStartCrop={handleStartCrop}
          onSkipEditing={handleSkipEditing}
          onFileEdited={onFileEdited}
          isLoading={isLoading}
        />
      </div>

      {/* Photo Cropper Modal */}
      {showCropper && currentFile && (
        <ProjectPhotoCropper
          file={currentFile.originalFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};

export default PhotoEditForm;