// components/shared/wizard/photoGallery/PhotoDropZone.jsx - With debug logs
import React, { useRef, useState } from 'react';
import { Upload, Camera, FolderOpen } from 'lucide-react';

const PhotoDropZone = ({
  onFilesSelected,
  remainingSlots = 10,
  disabled = false,
  isLoading = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Handle file input change
  const handleFileInput = (event) => {
    console.log('📁 File input changed', event.target.files); // DEBUG
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    // Reset input value to allow selecting the same files again
    event.target.value = '';
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
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

    if (disabled) return;

    console.log('📂 Files dropped', e.dataTransfer.files); // DEBUG
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  // Handle button clicks
  const handleChooseFiles = () => {
    console.log('📁 Choose Files clicked', fileInputRef.current); // DEBUG
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTakePhoto = () => {
    console.log('📸 Take Photo clicked', cameraInputRef.current); // DEBUG
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : disabled
            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Upload your photos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop files here, or click to browse
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleChooseFiles}
              disabled={disabled || remainingSlots <= 0}
              className="btn-primary btn-md"
            >
              <FolderOpen size={16} />
              Choose Files
            </button>

            <button
              type="button"
              onClick={handleTakePhoto}
              disabled={disabled || remainingSlots <= 0}
              className="btn-secondary btn-md"
            >
              <Camera size={16} />
              Take Photos
            </button>
          </div>

          {/* File Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>Supports: JPEG, PNG, WebP, HEIC</p>
            <p>Maximum file size: 20MB</p>
            <p>Up to {remainingSlots} more photos</p>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center">
            <div className="loading-spinner-primary"></div>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        multiple
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
};

export default PhotoDropZone;