// components/projects/wizard/project/photoUploader/ProjectPhotoSelectStep.jsx - Fix button placement
import React, { useRef } from 'react';
import { useSubscription } from '../../../../../hooks/useSubscription';
import { validatePhotoFiles } from '../../../../../utils/photoValidator';
import PhotoUsageStats from './PhotoUsageStats';
import PhotoDropZone from './PhotoDropZone';
import EmptyPhotoState from './EmptyPhotoState';
import { Plus } from 'lucide-react';
import PhotoCard from './PhotoCard';
import PhotoGrid from './PhotoGrid';

const ProjectPhotoSelectStep = ({
  formData,
  onFilesSelected,
  onFileRemoved,
  maxPhotos = 50,
  isLoading = false,
  errors = {}
}) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const { canPerformAction } = useSubscription();
  const selectedFiles = formData.files || [];
  const remainingSlots = Math.max(0, maxPhotos - selectedFiles.length);
  const canAddPhotos = canPerformAction('add_photo', 1, formData);

  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;

    const validation = validatePhotoFiles(files);
    if (!validation.isValid) {
      console.error('File validation failed:', validation.error);
      alert(validation.error);
      return;
    }

    if (files.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more photo(s).`);
      return;
    }

    const fileArray = Array.from(files);
    onFilesSelected(fileArray);
  };

  const handleFileInput = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
    event.target.value = '';
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <PhotoUsageStats current={selectedFiles.length} max={maxPhotos} />

      <PhotoDropZone
        onFilesDropped={handleFileSelect}
        canAddPhotos={canAddPhotos}
        remainingSlots={remainingSlots}
        isLoading={isLoading}
      >
        {selectedFiles.length === 0 ? (
          <EmptyPhotoState
            onChooseFiles={handleChooseFiles}
            onTakePhoto={handleTakePhoto}
            canAddPhotos={canAddPhotos}
            remainingSlots={remainingSlots}
            isLoading={isLoading}
          />
        ) : (
          /* Show photos WITHOUT the upload button inside */
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Selected Photos ({selectedFiles.length})
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedFiles.map((file) => (
                <PhotoCard
                  key={file.id}
                  file={file}
                  onRemove={onFileRemoved}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>
        )}
      </PhotoDropZone>

      {/* Upload More Button - OUTSIDE the drop zone, centered */}
      {selectedFiles.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleChooseFiles}
            disabled={!canAddPhotos || remainingSlots <= 0 || isLoading}
            className={`btn-primary btn-md ${
              remainingSlots <= 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Plus size={16} />
            Upload More Photos
          </button>
        </div>
      )}

      {/* Footer message */}
      {selectedFiles.length > 0 && (
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can always add photos to your project later
          </p>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        multiple
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Validation Errors */}
      {errors.photos && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="text-red-800 dark:text-red-300 text-sm font-medium">
            {errors.photos}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPhotoSelectStep;