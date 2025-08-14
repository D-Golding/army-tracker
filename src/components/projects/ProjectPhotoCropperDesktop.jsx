// components/projects/ProjectPhotoCropperDesktop.jsx - Desktop Project Photo Cropper with Skip Option
import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Plus, Minus, Square, Smartphone, Monitor, SkipForward } from 'lucide-react';

const ProjectPhotoCropperDesktop = ({
  file,
  onCropComplete,
  onCancel,
  onCropSkip = null,
  showSkipOption = false
}) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Aspect ratio state
  const [aspectRatio, setAspectRatio] = useState('square'); // 'portrait', 'square', 'landscape'
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');

  // Image and crop state
  const [imageData, setImageData] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 300, height: 300 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Aspect ratio configurations
  const aspectRatios = {
    portrait: { ratio: 4/5, label: 'Portrait', icon: Smartphone, outputWidth: 800, outputHeight: 1000 },
    square: { ratio: 1/1, label: 'Square', icon: Square, outputWidth: 800, outputHeight: 800 },
    landscape: { ratio: 16/9, label: 'Landscape', icon: Monitor, outputWidth: 800, outputHeight: 450 }
  };

  const currentRatio = aspectRatios[aspectRatio];

  // Load and display the image
  useEffect(() => {
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Calculate display dimensions (max 500px width for desktop)
      const maxWidth = 500;
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

      // Set image source
      if (imageRef.current) {
        imageRef.current.src = url;
        imageRef.current.style.width = `${displayWidth}px`;
        imageRef.current.style.height = `${displayHeight}px`;
      }

      // Reset image transform
      setImageScale(1);
      setImageOffset({ x: 0, y: 0 });
    };

    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Update crop area when aspect ratio changes
  useEffect(() => {
    if (imageData.width === 0) return;

    const containerWidth = Math.min(imageData.width * 0.7, 400);
    const containerHeight = containerWidth / currentRatio.ratio;

    // Ensure crop area fits within image bounds
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
  }, [aspectRatio, imageData, currentRatio.ratio]);

  // Handle aspect ratio change
  const handleAspectRatioChange = (newRatio) => {
    setAspectRatio(newRatio);
  };

  // Handle mouse down on crop area for dragging
  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left - cropArea.x,
      y: e.clientY - rect.top - cropArea.y
    });
  };

  // Handle resize handle mouse down
  const handleResizeMouseDown = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeHandle(handle);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isDragging) {
      const newX = Math.max(0, Math.min(
        imageData.width - cropArea.width,
        e.clientX - rect.left - dragStart.x
      ));
      const newY = Math.max(0, Math.min(
        imageData.height - cropArea.height,
        e.clientY - rect.top - dragStart.y
      ));

      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let newWidth = cropArea.width;
      let newHeight = cropArea.height;
      let newX = cropArea.x;
      let newY = cropArea.y;

      // Calculate new dimensions based on resize handle
      if (resizeHandle.includes('right')) {
        newWidth = Math.min(imageData.width - cropArea.x, mouseX - cropArea.x);
      }
      if (resizeHandle.includes('left')) {
        const deltaX = mouseX - cropArea.x;
        newWidth = Math.max(50, cropArea.width - deltaX);
        newX = Math.max(0, cropArea.x + deltaX);
      }
      if (resizeHandle.includes('bottom')) {
        newHeight = Math.min(imageData.height - cropArea.y, mouseY - cropArea.y);
      }
      if (resizeHandle.includes('top')) {
        const deltaY = mouseY - cropArea.y;
        newHeight = Math.max(50, cropArea.height - deltaY);
        newY = Math.max(0, cropArea.y + deltaY);
      }

      // Maintain aspect ratio
      if (newWidth / currentRatio.ratio <= newHeight) {
        newHeight = newWidth / currentRatio.ratio;
      } else {
        newWidth = newHeight * currentRatio.ratio;
      }

      // Ensure minimum size
      const minSize = 50;
      if (newWidth < minSize || newHeight < minSize) return;

      // Ensure within bounds
      if (newX + newWidth > imageData.width) {
        newWidth = imageData.width - newX;
        newHeight = newWidth / currentRatio.ratio;
      }
      if (newY + newHeight > imageData.height) {
        newHeight = imageData.height - newY;
        newWidth = newHeight * currentRatio.ratio;
      }

      setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, cropArea, imageData, currentRatio.ratio]);

  // Zoom in
  const zoomIn = () => {
    setImageScale(prev => Math.min(3, prev + 0.2));
  };

  // Zoom out
  const zoomOut = () => {
    setImageScale(prev => Math.max(0.5, prev - 0.2));
  };

  // Increase crop size
  const increaseCropSize = () => {
    const step = 20;
    const newWidth = Math.min(imageData.width * 0.9, cropArea.width + step);
    const newHeight = newWidth / currentRatio.ratio;

    // Check if new height fits
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

    // Adjust position to keep crop area centred
    const newX = Math.max(0, Math.min(imageData.width - newWidth, cropArea.x - (newWidth - cropArea.width) / 2));
    const newY = Math.max(0, Math.min(imageData.height - newHeight, cropArea.y - (newHeight - cropArea.height) / 2));

    setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  // Decrease crop size
  const decreaseCropSize = () => {
    const step = 20;
    const newWidth = Math.max(80, cropArea.width - step);
    const newHeight = newWidth / currentRatio.ratio;

    // Adjust position to keep crop area centred
    const newX = Math.max(0, Math.min(imageData.width - newWidth, cropArea.x - (newWidth - cropArea.width) / 2));
    const newY = Math.max(0, Math.min(imageData.height - newHeight, cropArea.y - (newHeight - cropArea.height) / 2));

    setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  // Crop the image
  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Set canvas size to desired output
    canvas.width = currentRatio.outputWidth;
    canvas.height = currentRatio.outputHeight;

    // Calculate scaling factors accounting for zoom
    const scaleX = (imageData.naturalWidth / imageData.width) / imageScale;
    const scaleY = (imageData.naturalHeight / imageData.height) / imageScale;

    // Calculate source crop area in original image coordinates
    const sourceX = (cropArea.x - imageOffset.x) * scaleX;
    const sourceY = (cropArea.y - imageOffset.y) * scaleY;
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;

    // Draw cropped image
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, currentRatio.outputWidth, currentRatio.outputHeight
    );

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob && onCropComplete) {
        onCropComplete(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  // Handle skip crop
  const handleSkip = () => {
    if (onCropSkip) {
      onCropSkip();
    }
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Crop Your Photo
        </h3>

        {/* Skip info banner when skip option is available */}
        {showSkipOption && (
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <div className="text-blue-800 dark:text-blue-300 text-sm">
              <div className="font-medium mb-1">💡 Optional Step</div>
              <p>Crop your photo for better framing, or skip to use the original image.</p>
            </div>
          </div>
        )}

        {/* Aspect Ratio Selector */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Choose Aspect Ratio</h4>
          <div className="flex gap-3">
            {Object.entries(aspectRatios).map(([key, config]) => {
              const IconComponent = config.icon;
              const isSelected = aspectRatio === key;

              return (
                <button
                  key={key}
                  onClick={() => handleAspectRatioChange(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <IconComponent size={16} />
                  <span className="text-sm font-medium">{config.label}</span>
                  <span className="text-xs text-gray-500">
                    {config.outputWidth}×{config.outputHeight}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Crop Area */}
          <div className="flex-1">
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
                style={{
                  transform: `scale(${imageScale}) translate(${imageOffset.x}px, ${imageOffset.y}px)`,
                  transformOrigin: 'top left'
                }}
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
                    borderRadius: '8px',
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={handleMouseDown}
                >
                  {/* Resize Handles */}
                  <div
                    className="resize-handle absolute w-3 h-3 bg-white border border-gray-400 rounded-full -top-1 -left-1 cursor-nw-resize"
                    onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
                  />
                  <div
                    className="resize-handle absolute w-3 h-3 bg-white border border-gray-400 rounded-full -top-1 -right-1 cursor-ne-resize"
                    onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
                  />
                  <div
                    className="resize-handle absolute w-3 h-3 bg-white border border-gray-400 rounded-full -bottom-1 -left-1 cursor-sw-resize"
                    onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
                  />
                  <div
                    className="resize-handle absolute w-3 h-3 bg-white border border-gray-400 rounded-full -bottom-1 -right-1 cursor-se-resize"
                    onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
                  />

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

            <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Drag</strong> crop area to reposition</p>
              <p><strong>Drag corners</strong> to resize</p>
              <p><strong>Use zoom buttons</strong> to scale image</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-shrink-0 space-y-6">
            {/* Crop Size Controls */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Crop Size</h4>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={decreaseCropSize}
                  className="p-3 btn-outline rounded-full flex items-center justify-center"
                  disabled={cropArea.width <= 80}
                >
                  <Minus className="w-5 h-5" />
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-32 text-center">
                  {Math.round(cropArea.width)}×{Math.round(cropArea.height)}px
                </span>

                <button
                  onClick={increaseCropSize}
                  className="p-3 btn-outline rounded-full flex items-center justify-center"
                  disabled={cropArea.width >= imageData.width * 0.9}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Crop Info */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Output Details</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>Final:</strong> {currentRatio.outputWidth}×{currentRatio.outputHeight}px</p>
                <p><strong>Format:</strong> {currentRatio.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCrop}
            className="btn-primary btn-md flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Apply Crop
          </button>

          {showSkipOption && onCropSkip && (
            <button
              onClick={handleSkip}
              className="btn-secondary btn-md flex items-center gap-2"
            >
              <SkipForward className="w-5 h-5" />
              Skip Crop
            </button>
          )}

          <button
            onClick={onCancel}
            className="btn-outline btn-md flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ProjectPhotoCropperDesktop;