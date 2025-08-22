// components/newsfeed/create/PostDetailsStep.jsx - Step 2 focused on metadata only
import React, { useState } from 'react';
import { Type, Hash, Video, Image, Clock } from 'lucide-react';

const PostDetailsStep = ({ formData, onMetadataUpdated, onPostDataUpdated }) => {
  const [tagInput, setTagInput] = useState('');

  const selectedFiles = formData.files || [];
  const CAPTION_LIMIT = 2000;

  // Separate photos and videos
  const photos = selectedFiles.filter(f => f.type === 'photo');
  const videos = selectedFiles.filter(f => f.type === 'video');

  // Handle caption changes
  const handleCaptionChange = (caption) => {
    if (caption.length <= CAPTION_LIMIT) {
      onPostDataUpdated({ caption });
    }
  };

  // Handle tag management
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const currentTags = formData.tags || [];

    if (newTag && !currentTags.includes(newTag) && currentTags.length < 10) {
      onPostDataUpdated({ tags: [...currentTags, newTag] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = formData.tags || [];
    onPostDataUpdated({ tags: currentTags.filter(tag => tag !== tagToRemove) });
  };

  // Handle file metadata
  const handleFileMetadataChange = (fileId, field, value) => {
    const currentMetadata = selectedFiles.find(f => f.id === fileId)?.metadata || {};
    onMetadataUpdated(fileId, {
      ...currentMetadata,
      [field]: value
    });
  };

  return (
    <div className="space-y-8">
      {/* Processing Status Summary */}
      <div className="card-base card-padding border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
        <div className="text-green-800 dark:text-green-300">
          <div className="font-medium mb-2 flex items-center gap-2">
            <Clock size={16} />
            Media Processing Complete
          </div>
          <div className="text-sm space-y-1">
            <div>
              {photos.filter(f => f.editData?.isProcessed).length} of {photos.length} photos processed
            </div>
            <div>
              {videos.filter(f => f.editData?.isProcessed).length} of {videos.length} videos processed
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-2">
              Files will be uploaded and compressed when you publish the post
            </div>
          </div>
        </div>
      </div>

      {/* Post Caption */}
      <div>
        <label className="form-label flex items-center gap-2">
          <Type size={16} />
          Caption
        </label>
        <textarea
          value={formData.caption || ''}
          onChange={(e) => handleCaptionChange(e.target.value)}
          placeholder="Share the story behind your work... What techniques did you use? What inspired this piece?"
          className="form-textarea"
          rows="4"
          maxLength={CAPTION_LIMIT}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="form-help">
            Describe your work, techniques used, or inspiration
          </p>
          <span className={`text-xs ${
            (formData.caption?.length || 0) > CAPTION_LIMIT * 0.9 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {formData.caption?.length || 0}/{CAPTION_LIMIT}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="form-label flex items-center gap-2">
          <Hash size={16} />
          Tags (Optional)
        </label>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              onBlur={addTag}
              placeholder="Add tags (e.g., spacemarines, painting, weathering)"
              className="form-input flex-1"
              maxLength={20}
              disabled={(formData.tags || []).length >= 10}
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim() || (formData.tags || []).length >= 10}
              className="btn-secondary btn-md"
            >
              Add
            </button>
          </div>

          {/* Current Tags */}
          {(formData.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(formData.tags || []).map((tag, index) => (
                <span
                  key={index}
                  className="badge-primary text-sm px-3 py-1 inline-flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="form-help">
            Add up to 10 tags to help others discover your work. Press Enter or comma to add.
          </p>
        </div>
      </div>

      {/* Media Metadata Section */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Type size={18} />
          Media Details
        </h4>

        <div className="space-y-6">
          {/* Videos Section */}
          {videos.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <Video size={16} />
                Videos ({videos.length})
              </h5>
              <div className="space-y-4">
                {videos.map((file) => {
                  const displayUrl = file.previewUrl;
                  const trimData = file.editData?.trimData;
                  const isProcessed = file.editData?.isProcessed;

                  return (
                    <div key={file.id} className="card-base card-padding">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Video Preview */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative">
                            <video
                              src={displayUrl}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                              poster={displayUrl + "#t=0.1"}
                            />

                            {/* Status badges */}
                            <div className="absolute top-1 left-1">
                              <div className="bg-purple-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                                VIDEO
                              </div>
                            </div>

                            {isProcessed && (
                              <div className="absolute bottom-1 left-1 right-1">
                                <div className={`text-white text-xs text-center px-1 py-0.5 rounded ${
                                  file.editData?.skipEditing ? 'bg-blue-500' : 'bg-green-500'
                                }`}>
                                  {file.editData?.skipEditing ? 'Full' : 'Trimmed'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Video Metadata Form */}
                        <div className="flex-1 space-y-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {file.fileName}
                            </div>
                            <div>
                              {(file.fileSize / 1024 / 1024).toFixed(1)} MB
                            </div>
                            {trimData && (
                              <div className="text-green-600 dark:text-green-400">
                                Duration: {Math.round(trimData.duration)}s (trimmed from {Math.round(trimData.start)}-{Math.round(trimData.end)}s)
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label text-sm">
                              Video Title
                            </label>
                            <input
                              type="text"
                              value={file.metadata?.title || ''}
                              onChange={(e) => handleFileMetadataChange(file.id, 'title', e.target.value)}
                              className="form-input text-sm"
                              placeholder="e.g., Painting process, Final reveal, Technique demo"
                              maxLength={100}
                            />
                          </div>

                          <div>
                            <label className="form-label text-sm">
                              Description
                            </label>
                            <textarea
                              value={file.metadata?.description || ''}
                              onChange={(e) => handleFileMetadataChange(file.id, 'description', e.target.value)}
                              className="form-textarea text-sm"
                              placeholder="Describe what's shown in this video..."
                              rows="2"
                              maxLength={300}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Photos Section */}
          {photos.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <Image size={16} />
                Photos ({photos.length})
              </h5>
              <div className="space-y-4">
                {photos.map((file) => {
                  const displayUrl = file.editData?.processedPreviewUrl || file.previewUrl;

                  return (
                    <div key={file.id} className="card-base card-padding">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Photo Preview */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative">
                            <img
                              src={displayUrl}
                              alt={file.fileName}
                              className="w-full h-full object-cover"
                            />

                            {/* Status badges */}
                            <div className="absolute top-1 left-1">
                              <div className="bg-green-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                                PHOTO
                              </div>
                            </div>

                            {/* Edited Badge */}
                            {file.editData?.processedBlob && (
                              <div className="absolute bottom-1 left-1 right-1">
                                <div className="bg-blue-500 text-white text-xs text-center px-1 py-0.5 rounded">
                                  Cropped
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Photo Metadata Form */}
                        <div className="flex-1 space-y-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {file.fileName}
                            </div>
                            <div>
                              {(file.fileSize / 1024 / 1024).toFixed(1)} MB
                              {file.editData?.processedBlob && " (edited)"}
                            </div>
                          </div>

                          <div>
                            <label className="form-label text-sm">
                              Photo Title
                            </label>
                            <input
                              type="text"
                              value={file.metadata?.title || ''}
                              onChange={(e) => handleFileMetadataChange(file.id, 'title', e.target.value)}
                              className="form-input text-sm"
                              placeholder="e.g., Front view, Detail shot, Work in progress"
                              maxLength={100}
                            />
                          </div>

                          <div>
                            <label className="form-label text-sm">
                              Description
                            </label>
                            <textarea
                              value={file.metadata?.description || ''}
                              onChange={(e) => handleFileMetadataChange(file.id, 'description', e.target.value)}
                              className="form-textarea text-sm"
                              placeholder="Add details about this photo..."
                              rows="2"
                              maxLength={300}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps Info */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>📝 Add titles and descriptions to organize your content</p>
          <p>🏷️ Tags help others discover your work</p>
          <p>🔒 Next: Choose privacy settings and publish your post</p>
          <p>⚡ Media will be uploaded and optimized when you publish</p>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsStep;