// components/shared/wizard/photoGallery/PhotoEditGrid.jsx - Grid display for photo editing workflow
import React from 'react';
import { Edit, SkipForward, RotateCcw, Check } from 'lucide-react';

const PhotoEditGrid = ({
  unprocessedFiles,
  processedFiles,
  onStartCrop,
  onSkipEditing,
  onFileEdited,
  isLoading
}) => {
  // Handle reset editing for a file
  const handleResetEdit = (fileId) => {
    const file = [...unprocessedFiles, ...processedFiles].find(f => f.id === fileId);
    if (file?.editData?.croppedPreviewUrl) {
      URL.revokeObjectURL(file.editData.croppedPreviewUrl);
    }

    onFileEdited(fileId, {
      isProcessed: false,
      skipEditing: false,
      croppedBlob: null,
      croppedPreviewUrl: null,
      aspectRatio: 'original',
      cropSettings: null
    });
  };

  return (
    <div className="space-y-6">
      {/* Unprocessed Files */}
      {unprocessedFiles.length > 0 && (
        <UnprocessedPhotosSection
          files={unprocessedFiles}
          onStartCrop={onStartCrop}
          onSkipEditing={onSkipEditing}
          isLoading={isLoading}
        />
      )}

      {/* Processed Files */}
      {processedFiles.length > 0 && (
        <ProcessedPhotosSection
          files={processedFiles}
          onResetEdit={handleResetEdit}
          isLoading={isLoading}
        />
      )}

      {/* Completion Message */}
      {processedFiles.length > 0 && unprocessedFiles.length === 0 && (
        <CompletionMessage />
      )}

      {/* Help Text */}
      <HelpText />
    </div>
  );
};

// Unprocessed photos section
const UnprocessedPhotosSection = ({ files, onStartCrop, onSkipEditing, isLoading }) => (
  <div className="space-y-4">
    <h4 className="font-medium text-gray-900 dark:text-white">
      Photos to Process ({files.length})
    </h4>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {files.map((file) => (
        <UnprocessedPhotoCard
          key={file.id}
          file={file}
          onStartCrop={onStartCrop}
          onSkipEditing={onSkipEditing}
          isLoading={isLoading}
        />
      ))}
    </div>
  </div>
);

// Processed photos section
const ProcessedPhotosSection = ({ files, onResetEdit, isLoading }) => (
  <div className="space-y-4">
    <h4 className="font-medium text-gray-900 dark:text-white">
      Processed Photos ({files.length})
    </h4>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {files.map((file) => (
        <ProcessedPhotoCard
          key={file.id}
          file={file}
          onResetEdit={onResetEdit}
          isLoading={isLoading}
        />
      ))}
    </div>
  </div>
);

// Individual unprocessed photo card
const UnprocessedPhotoCard = ({ file, onStartCrop, onSkipEditing, isLoading }) => (
  <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3">
      <img
        src={file.previewUrl}
        alt={file.fileName}
        className="w-full h-full object-cover"
      />
    </div>

    <div className="space-y-3">
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.fileName}>
          {file.fileName}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {Math.round(file.fileSize / 1024)} KB
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onStartCrop(file.id)}
          disabled={isLoading}
          className="btn-primary btn-sm flex-1"
        >
          <Edit size={14} />
          Crop
        </button>
        <button
          onClick={() => onSkipEditing(file.id)}
          disabled={isLoading}
          className="btn-tertiary btn-sm"
        >
          <SkipForward size={14} />
          Skip
        </button>
      </div>
    </div>
  </div>
);

// Individual processed photo card
const ProcessedPhotoCard = ({ file, onResetEdit, isLoading }) => {
  const previewUrl = file.editData?.croppedPreviewUrl || file.previewUrl;
  const wasEdited = file.editData?.croppedBlob && !file.editData?.skipEditing;

  return (
    <div className="relative group">
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        <img
          src={previewUrl}
          alt={file.fileName}
          className="w-full h-full object-cover"
        />

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          {wasEdited ? (
            <div className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
              <Edit size={10} />
              Edited
            </div>
          ) : (
            <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-lg">
              Original
            </div>
          )}
        </div>

        {/* Reset button */}
        <button
          onClick={() => onResetEdit(file.id)}
          disabled={isLoading}
          className="absolute bottom-2 right-2 w-6 h-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Edit again"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate" title={file.fileName}>
        {file.fileName}
      </div>
    </div>
  );
};

// Completion message
const CompletionMessage = () => (
  <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
    <div className="text-emerald-800 dark:text-emerald-300 text-sm text-center">
      <Check className="mx-auto mb-2" size={24} />
      <div className="font-medium mb-1">All photos processed!</div>
      <div>Ready to add labels and descriptions in the next step</div>
    </div>
  </div>
);

// Help text
const HelpText = () => (
  <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
      <p>🎨 Crop photos to focus on important details</p>
      <p>📐 Choose from Portrait, Square, or Landscape formats</p>
      <p>⏭️ Skip editing to keep original photos unchanged</p>
    </div>
  </div>
);

export default PhotoEditGrid;