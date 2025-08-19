// components/newsfeed/create/PhotoMetadataStep.jsx - Photo metadata editing for news feed
import React, { useState } from 'react';
import { FileText, Camera, Copy, X, Check } from 'lucide-react';

const PhotoMetadataStep = ({ formData, onMetadataUpdated }) => {
  const [batchMode, setBatchMode] = useState(false);
  const [batchData, setBatchData] = useState({
    title: '',
    description: ''
  });

  const selectedFiles = formData.files || [];

  // Handle metadata update for a specific file
  const handleMetadataChange = (fileId, field, value) => {
    const currentMetadata = selectedFiles.find(f => f.id === fileId)?.metadata || {};
    onMetadataUpdated(fileId, {
      ...currentMetadata,
      [field]: value
    });
  };

  // Handle batch metadata application
  const handleApplyBatch = () => {
    selectedFiles.forEach(file => {
      const currentMetadata = file.metadata || {};
      const updatedMetadata = { ...currentMetadata };

      if (batchData.title.trim()) {
        updatedMetadata.title = batchData.title.trim();
      }
      if (batchData.description.trim()) {
        updatedMetadata.description = batchData.description.trim();
      }

      onMetadataUpdated(file.id, updatedMetadata);
    });

    // Clear batch data and exit batch mode
    setBatchData({ title: '', description: '' });
    setBatchMode(false);
  };

  // Copy metadata from one photo to all others
  const handleCopyToAll = (sourceFile) => {
    if (!sourceFile.metadata) return;

    selectedFiles.forEach(file => {
      if (file.id !== sourceFile.id) {
        onMetadataUpdated(file.id, { ...sourceFile.metadata });
      }
    });
  };

  // Get completion stats
  const filesWithTitles = selectedFiles.filter(f => f.metadata?.title?.trim()).length;
  const filesWithDescriptions = selectedFiles.filter(f => f.metadata?.description?.trim()).length;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Add Photo Details
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add titles and descriptions to your photos (optional but recommended)
        </p>
      </div>

      {/* Batch Mode Toggle */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200">
              Batch Edit Mode
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Apply the same details to all photos at once
            </p>
          </div>
          <button
            onClick={() => setBatchMode(!batchMode)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              batchMode
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600'
            }`}
          >
            {batchMode ? 'Exit Batch' : 'Batch Edit'}
          </button>
        </div>

        {batchMode && (
          <div className="space-y-3">
            <div>
              <label className="form-label text-sm">
                Batch Title
              </label>
              <input
                type="text"
                value={batchData.title}
                onChange={(e) => setBatchData(prev => ({ ...prev, title: e.target.value }))}
                className="form-input text-sm"
                placeholder="e.g., Work in Progress, Final Result"
                maxLength={100}
              />
            </div>

            <div>
              <label className="form-label text-sm">
                Batch Description
              </label>
              <textarea
                value={batchData.description}
                onChange={(e) => setBatchData(prev => ({ ...prev, description: e.target.value }))}
                className="form-textarea text-sm"
                placeholder="Description that applies to all photos..."
                rows="2"
                maxLength={300}
              />
            </div>

            <button
              onClick={handleApplyBatch}
              disabled={!batchData.title.trim() && !batchData.description.trim()}
              className="btn-primary btn-sm w-full"
            >
              <Check size={14} />
              Apply to All Photos
            </button>
          </div>
        )}
      </div>

      {/* Individual Photo Metadata */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Individual Photo Details ({selectedFiles.length})
          </h4>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filesWithTitles} titles, {filesWithDescriptions} descriptions
          </div>
        </div>

        {selectedFiles.map((file, index) => (
          <PhotoMetadataCard
            key={file.id}
            file={file}
            index={index}
            onMetadataChange={handleMetadataChange}
            onCopyToAll={handleCopyToAll}
            totalFiles={selectedFiles.length}
          />
        ))}
      </div>

      {/* Completion Status */}
      {filesWithTitles === selectedFiles.length && filesWithDescriptions === selectedFiles.length && selectedFiles.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div className="text-emerald-800 dark:text-emerald-300 text-sm text-center">
            <Check className="mx-auto mb-2" size={24} />
            <div className="font-medium mb-1">All photos have details!</div>
            <div>Your photos are well organized and ready for sharing</div>
          </div>
        </div>
      )}

      {/* Skip Option Info */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>📷 Add titles to help identify your photos later</p>
          <p>📝 Descriptions provide context for viewers</p>
          <p className="font-medium text-gray-600 dark:text-gray-300 mt-2">
            This step is optional - you can proceed without adding details
          </p>
        </div>
      </div>
    </div>
  );
};

// Individual photo metadata card
const PhotoMetadataCard = ({ file, index, onMetadataChange, onCopyToAll, totalFiles }) => {
  const previewUrl = file.editData?.croppedPreviewUrl || file.previewUrl;
  const hasMetadata = file.metadata?.title?.trim() || file.metadata?.description?.trim();

  return (
    <div className={`border rounded-xl p-4 transition-colors ${
      hasMetadata 
        ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' 
        : 'border-gray-200 dark:border-gray-600'
    }`}>
      <div className="flex gap-4">
        {/* Photo Thumbnail */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative">
            <img
              src={previewUrl}
              alt={file.fileName}
              className="w-full h-full object-cover"
            />

            {/* Photo number badge */}
            <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
              {index + 1}
            </div>

            {/* Processing indicator */}
            {file.editData?.isProcessed && (
              <div className="absolute top-1 right-1">
                {file.editData.skipEditing ? (
                  <div className="w-2 h-2 bg-gray-500 rounded-full" title="Original"></div>
                ) : file.editData.croppedBlob ? (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Cropped"></div>
                ) : null}
              </div>
            )}

            {/* Status indicator */}
            <div className="absolute bottom-1 right-1">
              {hasMetadata ? (
                <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* Metadata Form */}
        <div className="flex-1 space-y-3">
          {/* Photo Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Photo Title
            </label>
            <input
              type="text"
              value={file.metadata?.title || ''}
              onChange={(e) => onMetadataChange(file.id, 'title', e.target.value)}
              className="form-input text-sm"
              placeholder="e.g., Space Marine Captain, Detail Shot"
              maxLength={100}
            />
          </div>

          {/* Photo Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={file.metadata?.description || ''}
              onChange={(e) => onMetadataChange(file.id, 'description', e.target.value)}
              className="form-textarea text-sm"
              placeholder="Describe your painting technique, colors used, etc."
              rows="2"
              maxLength={300}
            />
          </div>

          {/* Actions and File Info */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {totalFiles > 1 && hasMetadata && (
                <button
                  onClick={() => onCopyToAll(file)}
                  className="btn-tertiary btn-sm text-xs"
                  title="Copy this photo's details to all other photos"
                >
                  <Copy size={12} />
                  Copy to All
                </button>
              )}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32" title={file.fileName}>
              {file.fileName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoMetadataStep;