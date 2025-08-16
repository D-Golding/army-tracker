// components/projects/wizard/project/photoUploader/detailsStep/PhotoDetailsList.jsx
import React from 'react';
import { Copy } from 'lucide-react';
import PhotoDetailsCard from './PhotoDetailsCard';

const PhotoDetailsList = ({
  files,
  onMetadataChange,
  onBatchApply,
  disabled = false
}) => {
  const filesWithMetadata = files.filter(f =>
    f.metadata?.title ||
    f.metadata?.description
  );

  const handleCopyToAll = (sourceFile) => {
    if (!sourceFile.metadata?.title && !sourceFile.metadata?.description) {
      return;
    }

    const metadataToApply = {
      title: sourceFile.metadata?.title || '',
      description: sourceFile.metadata?.description || ''
    };

    onBatchApply(metadataToApply);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Photo Details ({files.length})
        </h4>

        {filesWithMetadata.length > 0 && (
          <button
            onClick={() => onBatchApply({ title: '', description: '' })}
            disabled={disabled}
            className="btn-tertiary btn-sm"
          >
            <Copy size={14} />
            Batch Edit
          </button>
        )}
      </div>

      <div className="space-y-4">
        {files.map((file) => (
          <div key={file.id} className="relative">
            <PhotoDetailsCard
              file={file}
              onMetadataChange={onMetadataChange}
              disabled={disabled}
            />

            {/* Copy to all button */}
            {(file.metadata?.title || file.metadata?.description) && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => handleCopyToAll(file)}
                  disabled={disabled}
                  className="btn-tertiary btn-sm text-xs"
                  title="Copy this photo's details to all photos"
                >
                  <Copy size={12} />
                  Copy to All
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Completion Status */}
      {filesWithMetadata.length === files.length && files.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div className="text-emerald-800 dark:text-emerald-300 text-sm text-center">
            <div className="font-medium mb-1">All photos have details!</div>
            <div>Your photos are well organized and ready for upload</div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default PhotoDetailsList;