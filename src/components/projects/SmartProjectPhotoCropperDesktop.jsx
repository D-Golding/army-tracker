// components/projects/SmartProjectPhotoCropperDesktop.jsx - Smart cropper with Instagram-style aspect ratio suggestions
import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Plus, Minus, Square, Smartphone, Monitor, SkipForward, Zap, AlertCircle } from 'lucide-react';
import {
  ASPECT_RATIO_CONFIG,
  analyzeAspectRatio,
  calculateOptimalCrop,
  getAspectRatioDisplayInfo
} from '../../utils/aspectRatioConfig';

const SmartProjectPhotoCropperDesktop = ({
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
  const [customRatio, setCustomRatio] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');

  // Image and crop state
  const [imageData, setImageData] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 300, height: 300 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Smart suggestion state
  const [ratioAnalysis, setRatioAnalysis] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [hasAppliedSuggestion, setHasAppliedSuggestion] = useState(false);

  // Available aspect ratios (Instagram style + custom)
  const aspectRatios = {
    ...ASPECT_RATIO_CONFIG.PRESETS,
    custom: {
      ratio: customRatio,
      label: 'Custom',
      description: 'Custom aspect ratio',
      outputWidth: 800,
      outputHeight: Math.round(800 / customRatio)
    }
  };

  const currentRatio = aspectRatios[aspectRatio];

  // Load and analyze the image
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
  }, [aspectRatio, customRatio, imageData, currentRatio.ratio]);

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
    if (newRatio !== 'custom') {
      setShowSuggestion(false);
    }
  };

  // Handle custom ratio change
  const handleCustomRatioChange = (value) => {
    const newRatio = parseFloat(value);
    if (newRatio > 0 && newRatio <= 3) {
      setCustomRatio(newRatio);
    }
  };

  // Mouse event handlers (same as original)
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

      const minSize = 50;
      if (newWidth < minSize || newHeight < minSize) return;

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

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };

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

  // Crop size controls
  const increaseCropSize = () => {
    const step = 20;
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
    const step = 20;
    const newWidth = Math.max(80, cropArea.width - step);
    const newHeight = newWidth / currentRatio.ratio;

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

  if (!file) return null;

  const currentRatioInfo = getAspectRatioDisplayInfo(currentRatio.ratio);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Smart Photo Cropper
        </h3>

        {/* Smart Suggestion Banner */}
        {showSuggestion && ratioAnalysis && (
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Zap className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <div className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Smart Crop Suggestion
                </div>
                <p className="text-blue-700 dark:text-blue-400 text-sm mb-3">
                  {ratioAnalysis.reason}. We recommend a <strong>{ratioAnalysis.suggestedPreset.toLowerCase()}</strong> crop for the best feed display.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={applySuggestion}
                    className="btn-primary btn-sm"
                  >
                    <Zap size={14} />
                    Apply Suggestion
                  </button>
                  <button
                    onClick={dismissSuggestion}
                    className="btn-tertiary btn-sm"
                  >
                    No Thanks
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
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Choose Format</h4>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(aspectRatios).map(([key, config]) => {
              if (key === 'custom') return null; // Handle custom separately

              const IconComponent = key === 'PORTRAIT' ? Smartphone : key === 'LANDSCAPE' ? Monitor : Square;
              const isSelected = aspectRatio === key.toLowerCase();
              const isSuggested = ratioAnalysis?.suggestedPreset?.toLowerCase() === key.toLowerCase();

              return (
                <button
                  key={key}
                  onClick={() => handleAspectRatioChange(key.toLowerCase())}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all relative ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {isSuggested && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <Zap size={8} className="text-white" />
                    </div>
                  )}
                  <IconComponent size={16} />
                  <span className="text-sm font-medium">{config.label}</span>
                  <span className="text-xs text-gray-500">
                    {config.outputWidth}×{config.outputHeight}
                  </span>
                </button>
              );
            })}

            {/* Custom Ratio Option */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAspectRatioChange('custom')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                  aspectRatio === 'custom'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <Square size={16} />
                <span className="text-sm font-medium">Custom</span>
              </button>

              {aspectRatio === 'custom' && (
                <input
                  type="number"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={customRatio}
                  onChange={(e) => handleCustomRatioChange(e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                />
              )}
            </div>
          </div>

          {/* Current Ratio Info */}
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Current: <strong>{currentRatioInfo.label}</strong> ({currentRatio.ratio.toFixed(2)}:1) • {currentRatioInfo.description}
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
              <p><strong>Use controls</strong> to adjust crop size</p>
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

            {/* Aspect Ratio Info */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Output Details</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>Final:</strong> {currentRatio.outputWidth}×{currentRatio.outputHeight}px</p>
                <p><strong>Format:</strong> {currentRatioInfo.label}</p>
                <p><strong>Ratio:</strong> {currentRatio.ratio.toFixed(2)}:1</p>

                {ratioAnalysis && (
                  <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Original Analysis
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <p>Aspect Ratio: {ratioAnalysis.aspectRatio.toFixed(2)}:1</p>
                      <p>Status: {ratioAnalysis.isValid ? '✅ Good for feed' : '⚠️ Needs optimization'}</p>
                      {!ratioAnalysis.isValid && (
                        <p className="text-amber-600 dark:text-amber-400 mt-1">
                          {ratioAnalysis.reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {ratioAnalysis && ratioAnalysis.suggestedPreset && !hasAppliedSuggestion && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
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

export default SmartProjectPhotoCropperDesktop;