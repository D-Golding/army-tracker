// components/dashboard/Profile/BannerCropperMobile.jsx - Mobile Banner Cropper (16:9)
import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Plus, Minus, Move } from 'lucide-react';

const BannerCropperMobile = ({ file, onCropComplete, onCancel }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 320, height: 180 }); // 16:9 ratio
  const [imageData, setImageData] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });

  // 16:9 aspect ratio
  const ASPECT_RATIO = 16 / 9;

  // Brightness analysis version - increment when algorithm changes
  const BRIGHTNESS_VERSION = 2;

  // Load and display the image
  useEffect(() => {
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Calculate display dimensions (max 300px width for mobile modal)
      const maxWidth = 300;
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

      // Set initial crop area (centered 16:9 rectangle)
      const maxCropWidth = displayWidth * 0.8;
      const maxCropHeight = displayHeight * 0.6;

      // Calculate crop dimensions maintaining 16:9 ratio
      let cropWidth, cropHeight;
      if (maxCropWidth / ASPECT_RATIO <= maxCropHeight) {
        cropWidth = maxCropWidth;
        cropHeight = maxCropWidth / ASPECT_RATIO;
      } else {
        cropHeight = maxCropHeight;
        cropWidth = maxCropHeight * ASPECT_RATIO;
      }

      setCropArea({
        x: (displayWidth - cropWidth) / 2,
        y: (displayHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight
      });

      // Set image source
      if (imageRef.current) {
        imageRef.current.src = url;
        imageRef.current.style.width = `${displayWidth}px`;
        imageRef.current.style.height = `${displayHeight}px`;
      }
    };

    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Handle touch start
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setLastTouch({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDragging) return;

    const touch = e.touches[0];
    const rect = imageRef.current?.getBoundingClientRect();
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
  };

  // Handle touch end
  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Increase crop size
  const increaseCropSize = () => {
    const maxWidth = imageData.width;
    const maxHeight = imageData.height;
    const newWidth = Math.min(maxWidth, cropArea.width + 30);
    const newHeight = newWidth / ASPECT_RATIO;

    // Check if new height fits
    if (newHeight > maxHeight) {
      const constrainedHeight = maxHeight;
      const constrainedWidth = constrainedHeight * ASPECT_RATIO;

      if (constrainedWidth <= maxWidth) {
        const newX = Math.max(0, Math.min(imageData.width - constrainedWidth, cropArea.x - (constrainedWidth - cropArea.width) / 2));
        const newY = Math.max(0, Math.min(imageData.height - constrainedHeight, cropArea.y - (constrainedHeight - cropArea.height) / 2));
        setCropArea({ x: newX, y: newY, width: constrainedWidth, height: constrainedHeight });
      }
      return;
    }

    // Adjust position to keep crop area centered and within bounds
    const newX = Math.max(0, Math.min(imageData.width - newWidth, cropArea.x - (newWidth - cropArea.width) / 2));
    const newY = Math.max(0, Math.min(imageData.height - newHeight, cropArea.y - (newHeight - cropArea.height) / 2));

    setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  // Decrease crop size
  const decreaseCropSize = () => {
    const minWidth = 160;
    const minHeight = minWidth / ASPECT_RATIO;

    const newWidth = Math.max(minWidth, cropArea.width - 30);
    const newHeight = newWidth / ASPECT_RATIO;

    // Adjust position to keep crop area centered
    const newX = cropArea.x + (cropArea.width - newWidth) / 2;
    const newY = cropArea.y + (cropArea.height - newHeight) / 2;

    setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  // Move crop area with buttons
  const moveCropArea = (direction) => {
    const step = 15;
    let newX = cropArea.x;
    let newY = cropArea.y;

    switch (direction) {
      case 'up':
        newY = Math.max(0, cropArea.y - step);
        break;
      case 'down':
        newY = Math.min(imageData.height - cropArea.height, cropArea.y + step);
        break;
      case 'left':
        newX = Math.max(0, cropArea.x - step);
        break;
      case 'right':
        newX = Math.min(imageData.width - cropArea.width, cropArea.x + step);
        break;
    }

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  // Analyze brightness of the cropped area
  const analyzeCroppedBrightness = (canvas) => {
    const ctx = canvas.getContext('2d');

    // Get image data from the top 40% where text appears
    const textAreaHeight = Math.floor(canvas.height * 0.4);
    const imageData = ctx.getImageData(0, 0, canvas.width, textAreaHeight);
    const data = imageData.data;

    let totalBrightness = 0;
    let pixelCount = 0;

    // Calculate average brightness using luminance formula
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Use luminance formula for perceived brightness
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
      totalBrightness += brightness;
      pixelCount++;
    }

    const avgBrightness = totalBrightness / pixelCount;
    return {
      brightness: avgBrightness / 255, // 0-1 scale
      version: BRIGHTNESS_VERSION
    };
  };

  // Crop the image and return blob with brightness data
  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Set canvas size to desired output (1200x675 for 16:9)
    const outputWidth = 1200;
    const outputHeight = 675;
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Calculate scaling factors
    const scaleX = imageData.naturalWidth / imageData.width;
    const scaleY = imageData.naturalHeight / imageData.height;

    // Calculate source crop area in original image coordinates
    const sourceX = cropArea.x * scaleX;
    const sourceY = cropArea.y * scaleY;
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;

    // Draw cropped image
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, outputWidth, outputHeight
    );

    // Analyze brightness of the cropped result
    const brightnessData = analyzeCroppedBrightness(canvas);

    console.log(`🎨 Analyzed crop brightness: ${(brightnessData.brightness * 100).toFixed(1)}%`);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob && onCropComplete) {
        // Pass both the blob and brightness data with version
        onCropComplete(blob, brightnessData.brightness, brightnessData.version);
      }
    }, 'image/jpeg', 0.9);
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Crop Your Banner Image
        </h3>

      {/* Image and Crop Area */}
      <div className="mb-6">
        <div className="relative inline-block border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden mx-auto">
          <img
            ref={imageRef}
            alt="Crop preview"
            className="block touch-none"
            style={{ userSelect: 'none' }}
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
                <Move className="w-6 h-6 text-white opacity-60" />
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

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
          Touch and drag the crop area to reposition
        </p>
      </div>

      {/* Mobile Controls */}
      <div className="space-y-4 mb-6">
        {/* Size Controls */}
        <div className="text-center">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Banner Size</h4>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={decreaseCropSize}
              className="mobile-touch-target btn-outline rounded-full flex items-center justify-center"
              disabled={cropArea.width <= 160}
            >
              <Minus className="w-5 h-5" />
            </button>

            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-24 text-center">
              {Math.round(cropArea.width)}×{Math.round(cropArea.height)}
            </span>

            <button
              onClick={increaseCropSize}
              className="mobile-touch-target btn-outline rounded-full flex items-center justify-center"
              disabled={cropArea.width >= imageData.width || cropArea.height >= imageData.height}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Position Controls */}
        <div className="text-center">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Fine Position</h4>
          <div className="grid grid-cols-3 gap-2 max-w-32 mx-auto">
            <div></div>
            <button
              onClick={() => moveCropArea('up')}
              className="mobile-touch-target btn-outline rounded-lg text-xs"
            >
              ↑
            </button>
            <div></div>

            <button
              onClick={() => moveCropArea('left')}
              className="mobile-touch-target btn-outline rounded-lg text-xs"
            >
              ←
            </button>
            <div className="mobile-touch-target flex items-center justify-center">
              <Move className="w-4 h-4 text-gray-400" />
            </div>
            <button
              onClick={() => moveCropArea('right')}
              className="mobile-touch-target btn-outline rounded-lg text-xs"
            >
              →
            </button>

            <div></div>
            <button
              onClick={() => moveCropArea('down')}
              className="mobile-touch-target btn-outline rounded-lg text-xs"
            >
              ↓
            </button>
            <div></div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="text-center mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Preview</h4>

        <div className="w-full max-w-80 h-20 bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-lg mx-auto mb-2 rounded-lg overflow-hidden">
          {imageRef.current && imageData.width > 0 && (
            <div
              className="w-full h-full bg-center bg-cover"
              style={{
                backgroundImage: `url(${imageRef.current?.src})`,
                backgroundPosition: `-${(cropArea.x / imageData.width) * 100}% -${(cropArea.y / imageData.height) * 100}%`,
                backgroundSize: `${(imageData.width / cropArea.width) * 100}% ${(imageData.height / cropArea.height) * 100}%`
              }}
            />
          )}
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400">
          Final: 1200×675px (16:9 banner)
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCrop}
          className="flex-1 btn-primary btn-md flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Apply Crop
        </button>

        <button
          onClick={onCancel}
          className="flex-1 btn-outline btn-md flex items-center justify-center gap-2"
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

export default BannerCropperMobile;