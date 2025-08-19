// components/newsfeed/create/PhotoSelectionStep.jsx - Photo selection for news feed
import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Plus, AlertCircle } from 'lucide-react';

const PhotoSelectionStep = ({ formData, onFilesSelected, onFileRemoved, maxPhotos = 10 }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const selectedFiles = formData.files || [];
  const remainingSlots = Math.max(0, maxPhotos - selectedFiles.length);

  // Generate unique ID for files
  const generateFileId = () => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Validate files
  const validateFiles = (files) => {
    const maxFileSize = 20 * 1024 * 1024; // 20MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type. Please use JPEG, PNG, WebP, or HEIC.`);
        continue;
      }

      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File too large. Maximum size is 20MB.`);
        continue;
      }

      validFiles.push(file);
    }

    // Check if we have too many files
    if (validFiles.length > remainingSlots) {
      errors.push(`You can only add ${remainingSlots} more photo(s).`);
      return {
        isValid: false,
        validFiles: validFiles.slice(0, remainingSlots),
        errors
      };
    }

    return {
      isValid: errors.length === 0,
      validFiles,
      errors
    };
  };

  // Process files for internal use
  const processFiles = (files) => {
    return files.map(file => {
      const id = generateFileId();
      const previewUrl = URL.createObjectURL(file);

      return {
        id,
        originalFile: file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        previewUrl,
        metadata: {},
        editData: {
          isProcessed: false,
          skipEditing: false,
          croppedBlob: null,
          croppedPreviewUrl: null,
          aspectRatio: 'original',
          cropSettings: null
        }
      };
    });
  };

  // Handle file selection
  const handleFileSelect = (files) => {
    setError('');

    if (!files || files.length === 0) return;

    const validation = validateFiles(Array.from(files));

    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    const processedFiles = processFiles(validation.validFiles);
    onFilesSelected(processedFiles);
  };

  // Handle drag events
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

  // Handle file input clicks
  const handleChooseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTakePhoto = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Handle file removal
  const handleRemoveFile = (fileId) => {
    // Clean up preview URL
    const file = selectedFiles.find(f => f.id === fileId);
    if (file?.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
    if (file?.editData?.croppedPreviewUrl) {
      URL.revokeObjectURL(file.editData.croppedPreviewUrl);
    }

    onFileRemoved(fileId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Camera className="mx-auto mb-4 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Select Photos to Share
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Choose up to {maxPhotos} photos of your miniature painting work
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      {remainingSlots > 0 && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
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
                {selectedFiles.length === 0 ? 'Upload your photos' : 'Add more photos'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop files here, or click to browse
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleChooseFiles}
                className="btn-primary btn-md"
              >
                <Upload size={16} />
                Choose Files
              </button>

              <button
                type="button"
                onClick={handleTakePhoto}
                className="btn-secondary btn-md"
              >
                <Camera size={16} />
                Take Photos
              </button>
            </div>

            {/* File Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Supports: JPEG, PNG, WebP, HEIC</p>
              <p>Maximum file size: 20MB each</p>
              <p>Up to {remainingSlots} more photo{remainingSlots !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Photos Grid */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Selected Photos ({selectedFiles.length}/{maxPhotos})
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {selectedFiles.map((file) => (
              <PhotoPreviewCard
                key={file.id}
                file={file}
                onRemove={() => handleRemoveFile(file.id)}
              />
            ))}
          </div>

          {/* Selection Summary */}
          <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
            <div className="text-indigo-800 dark:text-indigo-300 text-sm">
              <div className="font-medium mb-1">Ready to proceed</div>
              <div className="space-y-1">
                <div>{selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''} selected</div>
                {remainingSlots > 0 && (
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">
                    You can add {remainingSlots} more photo{remainingSlots !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps Info */}
      {selectedFiles.length > 0 && (
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>🎨 Next: Edit and crop your photos for better framing</p>
            <p>🏷️ Then: Add titles and descriptions to organize your photos</p>
            <p>📝 Finally: Write your post caption and add tags</p>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        multiple
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

// Individual photo preview card
const PhotoPreviewCard = ({ file, onRemove }) => {
  return (
    <div className="relative group">
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        <img
          src={file.previewUrl}
          alt={file.fileName}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove photo"
        >
          <X size={12} />
        </button>

        {/* File info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-xs truncate" title={file.fileName}>
            {file.fileName}
          </div>
          <div className="text-xs text-gray-300">
            {(file.fileSize / 1024 / 1024).toFixed(1)} MB
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoSelectionStep;