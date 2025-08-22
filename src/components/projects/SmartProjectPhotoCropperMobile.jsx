// components/projects/SmartProjectPhotoCropperMobile.jsx - Smart mobile cropper with Instagram-style suggestions
import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Plus, Minus, Square, Smartphone, Monitor, Move, SkipForward, Zap, AlertCircle } from 'lucide-react';
import {
  ASPECT_RATIO_CONFIG,
  analyzeAspectRatio,
  calculateOptimalCrop,
  getAspectRatioDisplayInfo
} from '../../utils/aspectRatioConfig';

const SmartProjectPhotoCropperMobile = ({
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
  const [aspectRatio, setAspectRatio] = useState('square');
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);

  // Image and crop state
  const [imageData, setImageData] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 250, height: 250 });
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState(0);

  // Smart suggestion state
  const [ratioAnalysis, setRatioAnalysis] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [hasAppliedSuggestion, setHasAppliedSuggestion] = useState(false);

  // Available aspect ratios (Instagram style)
  const aspectRatios = ASPECT_RATIO_CONFIG.PRESETS;
  const currentRatio = aspectRatios[aspectRatio.toUpperCase()];

  // Load and analyze the image
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

      const imageInfo = {
        width: displayWidth,
        height: displayHeight,
        naturalWidth: img.width,
        naturalHeight: img.height
      };

      setImageData(imageInfo);

      // Analyze aspect ratio and provide smart suggestions
      const analysis = analyzeAspectRatio(img.width, img.height);
      setRatioAnalysis(analysis);

      // Show suggestion if image needs cropping
      if (analysis.needsCropping && !hasAppliedSuggestion) {
        setShowSuggestion(true);
      }

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
  }, [file, hasAppliedSuggestion]);

  // Update crop area when aspect ratio changes
  useEffect(() => {
    if (imageData.width === 0 || !currentRatio) return;

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
  }, [aspectRatio, imageData, currentRatio]);

  // Apply smart suggestion
  const applySuggestion = () => {
    if (!ratioAnalysis || !ratioAnalysis.suggestedPreset) return;

    const suggestedPreset = ratioAnalysis.suggestedPreset.toLowerCase();
    setAspectRatio(suggestedPreset);

    // Calculate optimal crop area for the suggestion
    const optimalCrop = calculateOptimalCrop(
      imageData.width,
      imageData.height,
      ratioAnalysis.suggestedRatio,
      'center'
    );

    setCropArea(optimalCrop);
    setShowSuggestion(false);
    setHasAppliedSuggestion(true);
  };

  // Dismiss suggestion
  const dismissSuggestion = () => {
    setShowSuggestion(false);
  };

  // Handle aspect ratio change
  const handleAspectRatioChange = (newRatio) => {
    setAspectRatio(newRatio);
    setShowSuggestion(false);
  };

  // Calculate distance between two touches
  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setIsDragging(true);
      setLastTouch({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    } else if (e.touches.length === 2) {
      setIsPinching(true);
      setIsDragging(false);
      setLastPinchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
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
      const currentDistance = getTouchDistance(e.touches);
      const scaleChange = currentDistance / lastPinchDistance;

      setImageScale(prev => Math.max(0.5, Math.min(3, prev * scaleChange)));
      setLastPinchDistance(currentDistance);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();

    if (e.touches.length === 0) {
      setIsDragging(false);
      setIsPinching(false);
    } else if (e.touches.length === 1 && isPinching) {
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

  // Resize crop area
  const resizeCropArea = (bigger) => {
    if (!currentRatio) return;

    const step = bigger ? 20 : -20;
    const newWidth = Math.max(80, Math.min(imageData.width, cropArea.width + step));
    const newHeight = newWidth / currentRatio.ratio;

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

    const newX = Math.max(0, Math.min(imageData.width - newWidth, cropArea.x - (newWidth - cropArea.width) / 2));
    const newY = Math.max(0, Math.min(imageData.height - newHeight, cropArea.y - (newHeight - cropArea.height) / 2));

    setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  // Crop the image
  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current || !currentRatio) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    canvas.width = currentRatio.outputWidth;
    canvas.height = currentRatio.outputHeight;

    const scaleX = (imageData.naturalWidth / imageData.width) / imageScale;
    const scaleY = (imageData.naturalHeight / imageData.height) / imageScale;

    const sourceX = (cropArea.x - imageOffset.x) * scaleX;
    const sourceY = (cropArea.y - imageOffset.y) * scaleY;
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;

    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, currentRatio.outputWidth, currentRatio.outputHeight
    );

    canvas.toBlob((blob) => {
      if (blob && onCropComplete) {
        onCropComplete(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleSkip = () => {
    if (onCropSkip) {
      onCropSkip();
    }
  };

  if (!file || !currentRatio) return null;

  const currentRatioInfo = getAspectRatioDisplayInfo(currentRatio.ratio);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 pb-8 max-w-sm w-full max-h-[95vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Smart Photo Cropper
        </h3>

        {/* Smart Suggestion Banner */}
        {showSuggestion && ratioAnalysis && (
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Zap className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={16} />
              <div className="flex-1">
                <div className="font-medium text-blue-800 dark:text-blue-300 text-sm mb-1">
                  Smart Suggestion
                </div>
                <p className="text-blue-700 dark:text-blue-400 text-xs mb-2">
                  {ratioAnalysis.reason}. We recommend <strong>{ratioAnalysis.suggestedPreset.toLowerCase()}</strong> format.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={applySuggestion}
                    className="btn-primary btn-sm text-xs px-2 py-1"
                  >
                    <Zap size={12} />
                    Apply
                  </button>
                  <button
                    onClick={dismissSuggestion}
                    className="btn-tertiary btn-sm text-xs px-2 py-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skip info banner when skip option is available */}
        {showSkipOption && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" size={16} />
              <div className="text-amber-800 dark:text-amber-300 text-sm">
                <div className="font-medium mb-1">💡 Optional Step</div>
                <p>Crop your photo for better framing and consistent feed display, or skip to use the original image.</p>
              </div>
            </div>
          </div>
        )}

        {/* Aspect Ratio Selector */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Choose Format</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(aspectRatios).map(([key, config]) => {
              const IconComponent = key === 'PORTRAIT' ? Smartphone : key === 'LANDSCAPE' ? Monitor : Square;
              const isSelected = aspectRatio === key.toLowerCase();
              const isSuggested = ratioAnalysis?.suggestedPreset?.toLowerCase() === key.toLowerCase();

              return (
                <button
                  key={key}
                  onClick={() => handleAspectRatioChange(key.toLowerCase())}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all mobile-touch-target relative ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {isSuggested && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                  <IconComponent size={16} />
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

          {/* Smart Action */}
          {ratioAnalysis && ratioAnalysis.suggestedPreset && !hasAppliedSuggestion && (
            <div className="text-center">
              <button
                onClick={applySuggestion}
                className="w-full btn-primary btn-sm flex items-center justify-center gap-2"
              >
                <Zap size={14} />
                Apply {ratioAnalysis.suggestedPreset} Suggestion
              </button>
            </div>
          )}
        </div>

        {/* Preview Info */}
        <div className="text-center mb-4">
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>Final: {currentRatio.outputWidth}×{currentRatio.outputHeight}px</div>
            <div>{currentRatioInfo.label} ({currentRatio.ratio.toFixed(2)}:1)</div>
            {ratioAnalysis && (
              <div className={`${ratioAnalysis.isValid ? 'text-green-600' : 'text-amber-600'}`}>
                {ratioAnalysis.isValid ? '✅ Optimized for feed' : '⚠️ Consider suggestion above'}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pb-4">
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

export default SmartProjectPhotoCropperMobile;