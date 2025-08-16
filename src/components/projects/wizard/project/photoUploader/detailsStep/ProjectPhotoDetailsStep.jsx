// components/projects/wizard/project/photoUploader/detailsStep/ProjectPhotoDetailsStep.jsx - Fix data structure
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import PhotoDetailsList from './PhotoDetailsList';
import BatchMetadataModal from './BatchMetadataModal';

const ProjectPhotoDetailsStep = ({
  formData,
  onMetadataUpdated,
  errors = {},
  isLoading = false
}) => {
  const [showBatchModal, setShowBatchModal] = useState(false);

  // FIX: Use formData.files instead of formData.uploadedPhotos
  const selectedFiles = formData.files || [];

  const handleMetadataChange = (fileId, metadata) => {
    onMetadataUpdated(fileId, metadata);
  };

  const handleBatchApply = (batchMetadata) => {
    selectedFiles.forEach(file => {
      const updatedMetadata = {
        ...file.metadata,
        ...batchMetadata
      };
      onMetadataUpdated(file.id, updatedMetadata);
    });
    setShowBatchModal(false);
  };

  if (selectedFiles.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto mb-2 text-gray-400" size={32} />
        <p className="text-gray-500 dark:text-gray-400">No photos selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Add Photo Details
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add titles and descriptions to your photos (optional)
        </p>
      </div>

      <PhotoDetailsList
        files={selectedFiles}
        onMetadataChange={handleMetadataChange}
        onBatchApply={() => setShowBatchModal(true)}
        disabled={isLoading}
      />

      <BatchMetadataModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        onApply={handleBatchApply}
        totalFiles={selectedFiles.length}
      />

      {/* Validation Errors */}
      {errors.metadata && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="text-red-800 dark:text-red-300 text-sm font-medium">
            {errors.metadata}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPhotoDetailsStep;