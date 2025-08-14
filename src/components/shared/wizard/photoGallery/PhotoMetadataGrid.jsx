// components/shared/wizard/photoGallery/PhotoMetadataGrid.jsx - Grid for editing photo metadata
import React from 'react';
import { Check } from 'lucide-react';
import PhotoMetadataCard from './PhotoMetadataCard';

const PhotoMetadataGrid = ({
  files,
  onMetadataUpdated,
  onCopyMetadataToAll,
  isLoading
}) => {
  const filesWithMetadata = files.filter(f =>
    f.metadata?.label ||
    f.metadata?.description ||
    (f.metadata?.tags && f.metadata.tags.length > 0)
  );

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-white">
        Photo Details ({files.length})
      </h4>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {files.map((file) => (
          <PhotoMetadataCard
            key={file.id}
            file={file}
            onMetadataUpdated={onMetadataUpdated}
            onCopyMetadataToAll={onCopyMetadataToAll}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Completion Status */}
      {filesWithMetadata.length === files.length && files.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div className="text-emerald-800 dark:text-emerald-300 text-sm text-center">
            <Check className="mx-auto mb-2" size={24} />
            <div className="font-medium mb-1">All photos have details!</div>
            <div>Your photos are well organized and ready for upload</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoMetadataGrid;