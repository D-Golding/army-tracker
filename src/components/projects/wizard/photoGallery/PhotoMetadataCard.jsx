// components/shared/wizard/photoGallery/PhotoMetadataCard.jsx - Individual photo metadata editor
import React from 'react';
import { Check, Copy, X } from 'lucide-react';

const PhotoMetadataCard = ({
  file,
  onMetadataUpdated,
  onCopyMetadataToAll,
  isLoading
}) => {
  const previewUrl = file.editData?.croppedPreviewUrl || file.previewUrl;
  const hasMetadata = file.metadata?.label || file.metadata?.description ||
    (file.metadata?.tags && file.metadata.tags.length > 0);

  // Handle metadata field updates
  const handleFieldUpdate = (field, value) => {
    onMetadataUpdated(file.id, { [field]: value });
  };

  // Handle tag addition
  const handleAddTag = (newTag) => {
    const currentTags = file.metadata?.tags || [];
    if (!currentTags.includes(newTag)) {
      handleFieldUpdate('tags', [...currentTags, newTag]);
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagIndex) => {
    const currentTags = file.metadata?.tags || [];
    const newTags = currentTags.filter((_, i) => i !== tagIndex);
    handleFieldUpdate('tags', newTags);
  };

  return (
    <div className={`border rounded-xl p-4 transition-colors ${
      hasMetadata 
        ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' 
        : 'border-gray-200 dark:border-gray-600'
    }`}>
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

          {/* Status indicator */}
          <div className="mt-1 flex items-center justify-center">
            {hasMetadata ? (
              <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
            )}
          </div>
        </div>

        {/* Metadata Form */}
        <div className="flex-1 space-y-3">
          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Label
            </label>
            <input
              type="text"
              value={file.metadata?.label || ''}
              onChange={(e) => handleFieldUpdate('label', e.target.value)}
              className="form-input text-sm"
              placeholder="e.g., Front view, Detail shot, Work in progress"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={file.metadata?.description || ''}
              onChange={(e) => handleFieldUpdate('description', e.target.value)}
              className="form-textarea text-sm"
              placeholder="Add details about this photo..."
              rows="2"
              disabled={isLoading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {(file.metadata?.tags || []).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(index)}
                    disabled={isLoading}
                    className="hover:text-indigo-600 dark:hover:text-indigo-200"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tags (press Enter)"
              className="form-input text-sm"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleAddTag(e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onCopyMetadataToAll(file)}
              disabled={isLoading || !hasMetadata}
              className="btn-tertiary btn-sm text-xs"
              title="Copy this photo's details to all photos"
            >
              <Copy size={12} />
              Copy to All
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={file.fileName}>
              {file.fileName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoMetadataCard;