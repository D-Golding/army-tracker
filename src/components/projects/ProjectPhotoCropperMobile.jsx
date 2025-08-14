// components/projects/ProjectPhotoCropperMobile.jsx - Mobile Project Photo Cropper with Skip Option
import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Plus, Minus, Square, Smartphone, Monitor, Move, SkipForward } from 'lucide-react';

const ProjectPhotoCropperMobile = ({
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
  const [isPinching, setIsPinching] = useState(false);

  // Image and crop state
  const [imageData, setImageData] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 250, height: 250 });
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState(0);

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
      // Calculate display dimensions (max 280px width for mobile)
      const maxWidth = 280;
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

    const containerWidth = Math.min(imageData.width * 0.6, 200);
    const containerHeight = containerWidth / currentRatio.ratio;

    // Ensure crop area fits within image bounds
    const maxWidth = Math.min(containerWidth, imageData.width * 0.8);
    const maxHeight = Math.min(containerHeight, imageData.height * 0.8);

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

  // Calculate distance between two touches
  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      // Single touch - dragging
      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setIsDragging(true);
      setLastTouch({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    } else if (e.touches.length === 2) {
      // Two touches - pinch to zoom
      setIsPinching(true);
      setIsDragging(false);
      setLastPinchDistance(getTouchDistance(e.touches));
    }
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      // Single touch - move crop area
      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const currentTouch = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };

      const deltaX = currentTouch.x - lastTouch.x;
      const deltaY = currentTouch.y - lastTouch.y;

      const newX = Math.max(0, Math.min(
        imageData.width - cropArea.width,
        cropArea.x + deltaX
      ));
      const newY = Math.max(0, Math.min(
        imageData.height - cropArea.height,
        cropArea.y + deltaY
      ));

      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
      setLastTouch(currentTouch);
    } else if (e.touches.length === 2 && isPinching) {
      // Two touches - pinch to zoom
      const currentDistance = getTouchDistance(e.touches);
      const scaleChange = currentDistance / lastPinchDistance;

      setImageScale(prev => Math.max(0.5, Math.min(3, prev * scaleChange)));
      setLastPinchDistance(currentDistance);
    }
  };

  // Handle touch end
  const handleTouchEnd = (e) => {
    e.preventDefault();

    if (e.touches.length === 0) {
      setIsDragging(false);
      setIsPinching(false);
    } else if (e.touches.length === 1 && isPinching) {
      // Switched from pinch to drag
      setIsPinching(false);
      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setIsDragging(true);
      setLastTouch({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }
  };

  // Zoom in
  const zoomIn = () => {
    setImageScale(prev => Math.min(3, prev + 0.3));
  };

  // Zoom out
  const zoomOut = () => {
    setImageScale(prev => Math.max(0.5, prev - 0.3));
  };

  // Resize crop area
  const resizeCropArea = (bigger) => {
    const step = bigger ? 20 : -20;
    const newWidth = Math.max(80, Math.min(imageData.width, cropArea.width + step));
    const newHeight = newWidth / currentRatio.ratio;

    // Check if new height fits
    if (newHeight > imageData.height) {
      const constrainedHeight = imageData.height;
      const constrainedWidth = constrainedHeight * currentRatio.ratio;

      if (constrainedWidth <= imageData.width) {
        const newX = Math.max(0, Math.min(imageData.width - constrainedWidth, cropArea.x - (constrainedWidth - cropArea.width) / 2));
        const newY = Math.max(0, Math.min(imageData.height - constrainedHeight, cropArea.y - (constrainedHeight - cropArea.height) / 2));
        setCropArea({ x: newX, y: newY, width: constrainedWidth, height: constrainedHeight });
      }
      return;
    }

    // Adjust position to keep crop area centered
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
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-w-sm w-full max-h-[95vh] overflow-y-auto">
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
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Choose Aspect Ratio</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(aspectRatios).map(([key, config]) => {
              const IconComponent = config.icon;
              const isSelected = aspectRatio === key;

              return (
                <button
                  key={key}
                  onClick={() => handleAspectRatioChange(key)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all mobile-touch-target ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <IconComponent size={20} />
                  <span className="text-xs font-medium">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Image and Crop Area */}
        <div className="mb-4">
          <div
            ref={containerRef}
            className="relative inline-block border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden mx-auto touch-none"
          >
            <img
              ref={imageRef}
              alt="Crop preview"
              className="block touch-none select-none"
              style={{
                transform: `scale(${imageScale}) translate(${imageOffset.x}px, ${imageOffset.y}px)`,
                transformOrigin: 'top left',
                userSelect: 'none'
              }}
            />

            {/* Crop Overlay */}
            {imageData.width > 0 && (
              <div
                className="absolute border-2 border-white shadow-lg bg-black bg-opacity-20 touch-none"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  borderRadius: '8px'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Touch indicator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Move className="w-5 h-5 text-white opacity-60" />
                </div>

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

          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center space-y-1">
            <p>Touch and drag crop area to move</p>
            <p>Pinch to zoom image</p>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="space-y-4 mb-4">
          {/* Crop Size Controls */}
          <div className="text-center">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Crop Size</h4>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => resizeCropArea(false)}
                className="mobile-touch-target btn-outline rounded-full flex items-center justify-center"
                disabled={cropArea.width <= 80}
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-20 text-center">
                {Math.round(cropArea.width)}×{Math.round(cropArea.height)}
              </span>

              <button
                onClick={() => resizeCropArea(true)}
                className="mobile-touch-target btn-outline rounded-full flex items-center justify-center"
                disabled={cropArea.width >= imageData.width * 0.9}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="text-center mb-4">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Final: {currentRatio.outputWidth}×{currentRatio.outputHeight}px ({currentRatio.label})
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleCrop}
            className="w-full btn-primary btn-md flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Apply Crop
          </button>

          <div className="flex gap-3">
            {showSkipOption && onCropSkip && (
              <button
                onClick={handleSkip}
                className="flex-1 btn-secondary btn-md flex items-center justify-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                Skip Crop
              </button>
            )}

            <button
              onClick={onCancel}
              className={`${showSkipOption ? 'flex-1' : 'w-full'} btn-outline btn-md flex items-center justify-center gap-2`}
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ProjectPhotoCropperMobile;