// components/newsfeed/create/PhotoCropStep.jsx - News feed photo cropping step
import React, { useState, useEffect, useRef } from 'react';
import { Edit, SkipForward, ArrowLeft, ArrowRight, Check, Plus, Minus, Square, Smartphone, Monitor, Scissors } from 'lucide-react';

const PhotoCropStep = ({ formData, onFileEdited, onAllPhotosProcessed }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showCropper, setShowCropper] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('square');
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 300, height: 300 });
  const [imageData, setImageData] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const files = formData.files || [];
  const unprocessedFiles = files.filter(f => !f.editData?.isProcessed);
  const processedFiles = files.filter(f => f.editData?.isProcessed);
  const currentFile = files[currentPhotoIndex];

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Aspect ratio configurations
  const aspectRatios = {
    portrait: { ratio: 4/5, label: 'Portrait', icon: Smartphone, outputWidth: 800, outputHeight: 1000 },
    square: { ratio: 1/1, label: 'Square', icon: Square, outputWidth: 800, outputHeight: 800 },
    landscape: { ratio: 16/9, label: 'Landscape', icon: Monitor, outputWidth: 800, outputHeight: 450 }
  };

  const currentRatio = aspectRatios[aspectRatio];

  // Auto-advance to next unprocessed photo when current is processed
  useEffect(() => {
    if (unprocessedFiles.length === 0) {
      onAllPhotosProcessed?.();
      return;
    }

    const nextUnprocessedIndex = files.findIndex(f => !f.editData?.isProcessed);
    if (nextUnprocessedIndex !== -1 && nextUnprocessedIndex !== currentPhotoIndex) {
      setCurrentPhotoIndex(nextUnprocessedIndex);
      setShowCropper(false);
    }
  }, [files, currentPhotoIndex, unprocessedFiles.length, onAllPhotosProcessed]);

  // Load image when file changes or cropper is shown
  useEffect(() => {
    if (!currentFile || !showCropper) return;

    const img = new Image();
    const url = currentFile.previewUrl;

    img.onload = () => {
      const maxWidth = isMobile ? 300 : 400;
      let displayWidth = img.width;
      let displayHeight = img.height;

      if (displayWidth > maxWidth) {
        const ratio = maxWidth / displayWidth;
        displayWidth = maxWidth;
        displayHeight = displayHeight * ratio;
      }

      setImageData({
        width: displayWidth,
        height: displayHeight,
        naturalWidth: img.width,
        naturalHeight: img.height
      });

      if (imageRef.current) {
        imageRef.current.src = url;
        imageRef.current.style.width = `${displayWidth}px`;
        imageRef.current.style.height = `${displayHeight}px`;
      }
    };

    img.src = url;
  }, [currentFile, showCropper, isMobile]);

  // Update crop area when aspect ratio or image changes
  useEffect(() => {
    if (imageData.width === 0) return;

    const containerWidth = Math.min(imageData.width * 0.7, isMobile ? 250 : 300);
    const containerHeight = containerWidth / currentRatio.ratio;

    const maxWidth = Math.min(containerWidth, imageData.width * 0.9);
    const maxHeight = Math.min(containerHeight, imageData.height * 0.9);

    let finalWidth, finalHeight;
    if (maxWidth / currentRatio.ratio <= maxHeight) {
      finalWidth = maxWidth;
      finalHeight = maxWidth / currentRatio.ratio;
    } else {
      finalHeight = maxHeight;
      finalWidth = maxHeight * currentRatio.ratio;
    }

    setCropArea({
      x: (imageData.width - finalWidth) / 2,
      y: (imageData.height - finalHeight) / 2,
      width: finalWidth,
      height: finalHeight
    });
  }, [aspectRatio, imageData, currentRatio.ratio, isMobile]);

  // Mobile touch handlers
  const handleTouchStart = (e) => {
    if (!isMobile) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragStart({
      x: touch.clientX - rect.left - cropArea.x,
      y: touch.clientY - rect.top - cropArea.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !isDragging) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = Math.max(0, Math.min(
      imageData.width - cropArea.width,
      touch.clientX - rect.left - dragStart.x
    ));
    const newY = Math.max(0, Math.min(
      imageData.height - cropArea.height,
      touch.clientY - rect.top - dragStart.y
    ));

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    setIsDragging(false);
  };

  // Desktop mouse handlers
  const handleMouseDown = (e) => {
    if (isMobile) return;

    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left - cropArea.x,
      y: e.clientY - rect.top - cropArea.y
    });
  };

  const handleMouseMove = (e) => {
    if (isMobile || !isDragging) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = Math.max(0, Math.min(
      imageData.width - cropArea.width,
      e.clientX - rect.left - dragStart.x
    ));
    const newY = Math.max(0, Math.min(
      imageData.height - cropArea.height,
      e.clientY - rect.top - dragStart.y
    ));

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    if (isMobile) return;
    setIsDragging(false);
  };

  // Event listeners for desktop
  useEffect(() => {
    if (!isMobile && isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isMobile, isDragging, dragStart, cropArea, imageData]);

  // Crop size controls
  const increaseCropSize = () => {
    const step = isMobile ? 15 : 20;
    const newWidth = Math.min(imageData.width * 0.9, cropArea.width + step);
    const newHeight = newWidth / currentRatio.ratio;

    if (newHeight > imageData.height * 0.9) {
      const constrainedHeight = imageData.height * 0.9;
      const constrainedWidth = constrainedHeight * currentRatio.ratio;

      if (constrainedWidth <= imageData.width * 0.9) {
        const newX = Math.max(0, Math.min(imageData.width - constrainedWidth, cropArea.x - (constrainedWidth - cropArea.width) / 2));
        const newY = Math.max(0, Math.min(imageData.height - constrainedHeight, cropArea.y - (constrainedHeight - cropArea.height) / 2));
        setCropArea({ x: newX, y: newY, width: constrainedWidth, height: constrainedHeight });
      }
      return;
    }

    const newX = Math.max(0, Math.min(imageData.width - newWidth, cropArea.x - (newWidth - cropArea.width) / 2));
    const newY = Math.max(0, Math.min(imageData.height - newHeight, cropArea.y - (newHeight - cropArea.height) / 2));

    setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  const decreaseCropSize = () => {
    const step = isMobile ? 15 : 20;
    const newWidth = Math.max(60, cropArea.width - step);
    const newHeight = newWidth / currentRatio.ratio;

    const newX = Math.max(0, Math.min(imageData.width - newWidth, cropArea.x - (newWidth - cropArea.width) / 2));
    const newY = Math.max(0, Math.min(imageData.height - newHeight, cropArea.y - (newHeight - cropArea.height) / 2));

    setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  // Handle crop completion
  const handleCropComplete = async () => {
    if (!currentFile || !imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    canvas.width = currentRatio.outputWidth;
    canvas.height = currentRatio.outputHeight;

    const scaleX = imageData.naturalWidth / imageData.width;
    const scaleY = imageData.naturalHeight / imageData.height;

    const sourceX = cropArea.x * scaleX;
    const sourceY = cropArea.y * scaleY;
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;

    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, currentRatio.outputWidth, currentRatio.outputHeight
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedPreviewUrl = URL.createObjectURL(blob);

        onFileEdited(currentFile.id, {
          isProcessed: true,
          skipEditing: false,
          croppedBlob: blob,
          croppedPreviewUrl,
          aspectRatio: aspectRatio,
          cropSettings: { timestamp: new Date().toISOString() }
        });

        setShowCropper(false);
      }
    }, 'image/jpeg', 0.9);
  };

  // Handle skip editing
  const handleSkipEditing = (fileId = null) => {
    const targetId = fileId || currentFile?.id;
    if (!targetId) return;

    onFileEdited(targetId, {
      isProcessed: true,
      skipEditing: true,
      croppedBlob: null,
      croppedPreviewUrl: null,
      aspectRatio: 'original',
      cropSettings: null
    });

    setShowCropper(false);
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <Edit className="mx-auto mb-2 text-gray-400" size={32} />
        <p className="text-gray-500 dark:text-gray-400">No photos to edit</p>
      </div>
    );
  }

  // All photos processed
  if (unprocessedFiles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Check className="mx-auto mb-2 text-emerald-600 dark:text-emerald-400" size={32} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Photos Processed
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ready to proceed to the next step
          </p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div className="text-emerald-800 dark:text-emerald-300 text-sm text-center">
            <div className="font-medium mb-2 flex items-center justify-center gap-2">
              <Scissors size={16} />
              Processing Complete!
            </div>
            <div className="space-y-1">
              <div>{processedFiles.filter(f => f.editData?.croppedBlob && !f.editData?.skipEditing).length} photos cropped</div>
              <div>{processedFiles.filter(f => f.editData?.skipEditing).length} photos kept as originals</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Edit className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Edit Your Photos
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Crop photos for better framing or skip to use originals
        </p>
      </div>

      {/* Progress indicator */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Photo {currentPhotoIndex + 1} of {files.length}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {processedFiles.length} processed, {unprocessedFiles.length} remaining
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${(processedFiles.length / files.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current photo display */}
      {currentFile && (
        <div className="space-y-4">
          {/* Photo navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
              disabled={currentPhotoIndex === 0}
              className="btn-secondary btn-sm"
            >
              <ArrowLeft size={14} />
              Previous
            </button>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentPhotoIndex + 1} of {files.length}
            </div>

            <button
              onClick={() => setCurrentPhotoIndex(Math.min(files.length - 1, currentPhotoIndex + 1))}
              disabled={currentPhotoIndex === files.length - 1}
              className="btn-secondary btn-sm"
            >
              Next
              <ArrowRight size={14} />
            </button>
          </div>

          {!showCropper ? (
            // Photo preview with action buttons
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600">
                    <img
                      src={currentFile.editData?.croppedPreviewUrl || currentFile.previewUrl}
                      alt={currentFile.fileName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowCropper(true)}
                  className="btn-primary btn-md"
                >
                  <Edit size={16} />
                  Crop Photo
                </button>
                <button
                  onClick={() => handleSkipEditing()}
                  className="btn-secondary btn-md"
                >
                  <SkipForward size={16} />
                  Keep Original
                </button>
              </div>
            </div>
          ) : (
            // Inline cropper interface
            <div className="space-y-6">
              {/* Aspect ratio selector */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Choose Aspect Ratio</h4>
                <div className="flex gap-3 justify-center">
                  {Object.entries(aspectRatios).map(([key, config]) => {
                    const IconComponent = config.icon;
                    const isSelected = aspectRatio === key;

                    return (
                      <button
                        key={key}
                        onClick={() => setAspectRatio(key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <IconComponent size={16} />
                        <span className="text-sm font-medium">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Crop area */}
              <div className="flex justify-center">
                <div
                  ref={containerRef}
                  className="relative inline-block border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                  style={{ cursor: isDragging ? 'grabbing' : 'default' }}
                >
                  <img
                    ref={imageRef}
                    alt="Crop preview"
                    className="block select-none"
                    draggable={false}
                  />

                  {/* Crop Overlay */}
                  {imageData.width > 0 && (
                    <div
                      className="absolute border-2 border-white shadow-lg bg-black bg-opacity-20 select-none"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height,
                        borderRadius: '4px',
                        cursor: isDragging ? 'grabbing' : 'grab'
                      }}
                      onMouseDown={handleMouseDown}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {/* Grid Lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white opacity-50" />
                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white opacity-50" />
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white opacity-50" />
                        <div className="absolute top-2/3 left-0 right-0 h-px bg-white opacity-50" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Crop Size Controls */}
              <div className="text-center">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Crop Size</h4>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={decreaseCropSize}
                    className="p-3 btn-tertiary rounded-full flex items-center justify-center"
                    disabled={cropArea.width <= 60}
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-32 text-center">
                    {Math.round(cropArea.width)}×{Math.round(cropArea.height)}px
                  </span>

                  <button
                    onClick={increaseCropSize}
                    className="p-3 btn-tertiary rounded-full flex items-center justify-center"
                    disabled={cropArea.width >= imageData.width * 0.9}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Final output: {currentRatio.outputWidth}×{currentRatio.outputHeight}px ({currentRatio.label})
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400 text-center">
                <p><strong>{isMobile ? 'Touch and drag' : 'Drag'}</strong> crop area to reposition</p>
                <p><strong>Use size buttons</strong> to resize crop area</p>
              </div>

              {/* Crop actions */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCropComplete}
                  className="btn-primary btn-md"
                >
                  <Check size={16} />
                  Apply Crop
                </button>
                <button
                  onClick={() => setShowCropper(false)}
                  className="btn-tertiary btn-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoCropStep;