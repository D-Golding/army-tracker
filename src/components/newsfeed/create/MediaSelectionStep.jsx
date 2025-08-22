// components/newsfeed/create/MediaSelectionStep.jsx - Complete step 1 with inline editing
import React, { useRef, useState } from 'react';
import { Camera, Upload, Plus, X, Video, Image, Edit, Scissors } from 'lucide-react';
import { validatePhotoFile } from '../../../utils/photoValidator';
import { validateVideoFile, isVideoFile } from '../../../utils/videoValidator';
import { generateVideoThumbnail } from '../../../utils/videoThumbnailGenerator';
import ProjectPhotoCropper from '../../projects/ProjectPhotoCropper';
import VideoTrimmer from './VideoTrimmer';

const MediaSelectionStep = ({ formData, onFilesSelected, onFileRemoved, onFileEdited }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [editingFile, setEditingFile] = useState(null);
  const [editMode, setEditMode] = useState(null); // 'crop' or 'trim'
  const fileInputRef = useRef(null);

  const selectedFiles = formData.files || [];
  const maxFiles = 10;
  const remainingSlots = Math.max(0, maxFiles - selectedFiles.length);

  // Generate unique ID for files
  const generateFileId = () => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Process files for internal use
  const processFiles = async (files) => {
    const processedFiles = [];

    for (const file of files) {
      const id = generateFileId();
      const isVideo = isVideoFile(file);
      let previewUrl = URL.createObjectURL(file);
      let thumbnailUrl = null;

      // Generate thumbnail for videos
      if (isVideo) {
        try {
          thumbnailUrl = await generateVideoThumbnail(file, 1);
        } catch (error) {
          console.error('Failed to generate video thumbnail:', error);
          // Fallback to video URL
          thumbnailUrl = previewUrl;
        }
      }

      processedFiles.push({
        id,
        type: isVideo ? 'video' : 'photo',
        originalFile: file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        previewUrl,
        thumbnailUrl: thumbnailUrl || previewUrl,
        metadata: {
          title: '',
          description: ''
        },
        editData: {
          isProcessed: false,
          skipEditing: false,
          processedBlob: null,
          processedPreviewUrl: null,
          trimData: isVideo ? { start: 0, end: 0 } : null,
          aspectRatio: 'original'
        }
      });
    }

    return processedFiles;
  };

  // Handle file selection
  const handleFileSelect = async (files) => {
    setError('');

    if (!files || files.length === 0) return;

    const validFiles = [];
    const errors = [];

    for (const file of Array.from(files)) {
      const isVideo = isVideoFile(file);

      // Validate based on file type
      let validation;
      if (isVideo) {
        validation = await validateVideoFile(file);
      } else {
        validation = validatePhotoFile(file);
      }

      if (!validation.isValid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      validFiles.push(file);
    }

    // Check if we have too many files
    if (validFiles.length > remainingSlots) {
      errors.push(`You can only add ${remainingSlots} more file(s).`);
      const processedFiles = await processFiles(validFiles.slice(0, remainingSlots));
      onFilesSelected(processedFiles);
      if (errors.length > 0) {
        setError(errors[0]);
      }
      return;
    }

    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    const processedFiles = await processFiles(validFiles);
    onFilesSelected(processedFiles);
  };

  // Drag handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (remainingSlots > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (remainingSlots <= 0) return;

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleChooseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle editing functions
  const handleEditStart = (file, mode) => {
    setEditingFile(file);
    setEditMode(mode);
  };

  const handleCropComplete = (croppedBlob) => {
    if (editingFile && croppedBlob) {
      const croppedPreviewUrl = URL.createObjectURL(croppedBlob);

      onFileEdited(editingFile.id, {
        isProcessed: true,
        skipEditing: false,
        processedBlob: croppedBlob,
        processedPreviewUrl: croppedPreviewUrl,
        aspectRatio: 'custom'
      });
    }
    setEditingFile(null);
    setEditMode(null);
  };

  const handleTrimComplete = (trimData) => {
    if (editingFile) {
      onFileEdited(editingFile.id, {
        isProcessed: true,
        skipEditing: false,
        trimData: trimData,
        aspectRatio: 'original'
      });
    }
    setEditingFile(null);
    setEditMode(null);
  };

  const handleEditCancel = () => {
    setEditingFile(null);
    setEditMode(null);
  };

  const handleEditSkip = () => {
    if (editingFile) {
      onFileEdited(editingFile.id, {
        isProcessed: true,
        skipEditing: true,
        trimData: null,
        aspectRatio: 'original'
      });
    }
    setEditingFile(null);
    setEditMode(null);
  };

  // Show editor if editing
  if (editingFile && editMode === 'crop') {
    return (
      <div className="pb-8">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Crop Photo: {editingFile.fileName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adjust the crop area to improve the photo composition
          </p>
        </div>
        <ProjectPhotoCropper
          file={editingFile.originalFile}
          onCropComplete={handleCropComplete}
          onCancel={handleEditCancel}
          onCropSkip={handleEditSkip}
          showSkipOption={true}
        />
      </div>
    );
  }

  if (editingFile && editMode === 'trim') {
    return (
      <div className="pb-8">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Trim Video: {editingFile.fileName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select the best part of your video to share (max 5 minutes)
          </p>
        </div>
        <VideoTrimmer
          file={editingFile}
          onTrimComplete={handleTrimComplete}
          onCancel={handleEditCancel}
          onSkip={handleEditSkip}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="mx-auto mb-4 flex items-center justify-center">
          <Camera className="text-brand mr-2" size={28} />
          <Video className="text-brand" size={28} />
        </div>
        <h3 className="page-header-title text-lg">
          Select & Edit Photos & Videos
        </h3>
        <p className="page-header-subtitle">
          Choose up to {maxFiles} files, then crop photos and trim videos before proceeding
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card-base p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0">⚠</div>
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      {remainingSlots > 0 && (
        <div
          className={`card-base cursor-pointer transition-all border-2 border-dashed p-8 text-center ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload your photos & videos
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop files here, or click to browse
              </p>
            </div>

            <button
              type="button"
              onClick={handleChooseFiles}
              className="btn-primary btn-md"
            >
              <Camera size={16} />
              Choose Files
            </button>

            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p><strong>Photos:</strong> JPEG, PNG, WebP, HEIC (max 20MB)</p>
              <p><strong>Videos:</strong> MP4, MOV, AVI, WebM (max 5 minutes, 500MB)</p>
              <p>Up to {remainingSlots} more file{remainingSlots !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Files Grid */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Selected Files ({selectedFiles.length}/{maxFiles})
            </h4>
            {remainingSlots > 0 && (
              <button
                onClick={handleChooseFiles}
                className="btn-tertiary btn-sm"
              >
                <Plus size={14} />
                Add More
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {selectedFiles.map((file) => (
              <MediaPreviewCard
                key={file.id}
                file={file}
                onRemove={() => onFileRemoved(file.id)}
                onEdit={handleEditStart}
              />
            ))}
          </div>

          {/* Processing Status */}
          <div className="card-base card-padding border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20">
            <div className="text-indigo-800 dark:text-indigo-300 text-sm">
              <div className="font-medium mb-2">Editing Status</div>
              <div className="space-y-1">
                <div>
                  {selectedFiles.filter(f => f.type === 'photo').length} photo{selectedFiles.filter(f => f.type === 'photo').length !== 1 ? 's' : ''} and {' '}
                  {selectedFiles.filter(f => f.type === 'video').length} video{selectedFiles.filter(f => f.type === 'video').length !== 1 ? 's' : ''} selected
                </div>
                <div>
                  {selectedFiles.filter(f => f.editData?.isProcessed).length} of {selectedFiles.length} files processed
                </div>
                {selectedFiles.some(f => !f.editData?.isProcessed) && (
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                    💡 Tip: Edit your media before proceeding to step 2
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editing Instructions */}
      {selectedFiles.length > 0 && (
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>✂️ Click "Crop" on photos to improve composition</p>
            <p>🎬 Click "Trim" on videos to select the best part</p>
            <p>⏭️ You can proceed without editing, but it's recommended</p>
            <p>📝 Next: Add captions, descriptions, and tags</p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

// Enhanced Media preview card component with visible editing controls
const MediaPreviewCard = ({ file, onRemove, onEdit }) => {
  const isVideo = file.type === 'video';
  const isProcessed = file.editData?.isProcessed;
  const isSkipped = file.editData?.skipEditing;
  const displayUrl = file.editData?.processedPreviewUrl || file.previewUrl;
  const thumbnailUrl = file.thumbnailUrl || displayUrl;

  return (
    <div className="space-y-3">
      {/* Media Preview */}
      <div className="relative group">
        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative">

          {/* Media Content */}
          {isVideo ? (
            <img
              src={thumbnailUrl}
              alt={file.fileName}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                console.error('Video thumbnail error:', e);
                // Fallback to video element
                e.target.style.display = 'none';
                const video = document.createElement('video');
                video.src = file.previewUrl;
                video.className = 'w-full h-full object-cover';
                video.muted = true;
                video.preload = 'metadata';
                video.currentTime = 1;
                e.target.parentNode.appendChild(video);
              }}
            />
          ) : (
            <img
              src={displayUrl}
              alt={file.fileName}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                console.error('Image preview error:', e);
              }}
            />
          )}

          {/* Media Type Badge */}
          <div className="absolute top-2 left-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isVideo 
                ? 'bg-purple-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {isVideo ? <Video size={12} /> : <Image size={12} />}
            </div>
          </div>

          {/* Processing Status Badge */}
          {isProcessed && (
            <div className="absolute top-2 right-8">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                isSkipped 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                {isSkipped ? 'Original' : 'Edited'}
              </div>
            </div>
          )}

          {/* Remove button */}
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Remove file"
          >
            <X size={12} />
          </button>

          {/* File info overlay on hover */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-white text-xs">
              <div className="truncate font-medium" title={file.fileName}>
                {file.fileName}
              </div>
              <div className="text-gray-300">
                {(file.fileSize / 1024 / 1024).toFixed(1)} MB
              </div>
              {file.editData?.trimData && (
                <div className="text-purple-300">
                  Trimmed: {Math.round(file.editData.trimData.duration)}s
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Always Visible Edit Controls */}
      <div className="space-y-2">
        {/* Edit Button */}
        <button
          onClick={() => onEdit(file, isVideo ? 'trim' : 'crop')}
          className={`w-full btn-sm flex items-center justify-center gap-2 ${
            isProcessed && !isSkipped
              ? 'btn-secondary' 
              : 'btn-primary'
          }`}
        >
          {isVideo ? (
            <>
              <Scissors size={14} />
              {isProcessed ? 'Re-trim Video' : 'Trim Video'}
            </>
          ) : (
            <>
              <Edit size={14} />
              {isProcessed ? 'Re-crop Photo' : 'Crop Photo'}
            </>
          )}
        </button>

        {/* File Status */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          {isProcessed ? (
            isSkipped ? (
              <span className="text-blue-600 dark:text-blue-400">Using original file</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">
                {isVideo ? 'Video trimmed' : 'Photo cropped'} ✓
              </span>
            )
          ) : (
            <span>Ready to edit</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaSelectionStep;