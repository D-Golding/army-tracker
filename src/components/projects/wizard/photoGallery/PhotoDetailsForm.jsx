// components/shared/wizard/photoGallery/PhotoDetailsForm.jsx - Simplified photo metadata
import React from 'react';
import { FileText, Camera } from 'lucide-react';

const PhotoDetailsForm = ({
  formData,
  onMetadataUpdated,
  errors = {},
  isLoading = false
}) => {
  const selectedFiles = formData.files || [];

  // Handle metadata update for a specific file
  const handleMetadataChange = (fileId, field, value) => {
    onMetadataUpdated(fileId, { [field]: value });
  };

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

      {/* Photo List */}
      <div className="space-y-4">
        {selectedFiles.map((file, index) => {
          const previewUrl = file.editData?.croppedPreviewUrl || file.previewUrl;

          return (
            <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex gap-4">
                {/* Photo Thumbnail */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <img
                      src={previewUrl}
                      alt={file.fileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Photo Details Form */}
                <div className="flex-1 space-y-3">
                  {/* Photo Title */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Photo Title
                    </label>
                    <input
                      type="text"
                      value={file.metadata?.title || ''}
                      onChange={(e) => handleMetadataChange(file.id, 'title', e.target.value)}
                      className="form-input text-sm"
                      placeholder="e.g., Front view, Detail shot, Work in progress"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Photo Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={file.metadata?.description || ''}
                      onChange={(e) => handleMetadataChange(file.id, 'description', e.target.value)}
                      className="form-textarea text-sm"
                      placeholder="Add details about this photo..."
                      rows="2"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Original filename reference */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Original: {file.fileName}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skip Option Info */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>📷 Add titles to help identify your photos later</p>
          <p>📝 Descriptions provide context for future reference</p>
          <p className="font-medium text-gray-600 dark:text-gray-300 mt-2">
            This step is optional - you can proceed without adding details
          </p>
        </div>
      </div>

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

export default PhotoDetailsForm;