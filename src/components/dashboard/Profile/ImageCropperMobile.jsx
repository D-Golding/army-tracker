// components/dashboard/Profile/ImageCropperMobile.jsx - Mobile Touch-Friendly Image Cropper
import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Plus, Minus, Move } from 'lucide-react';

const ImageCropperMobile = ({ file, onCropComplete, onCancel }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: 200 });
  const [imageData, setImageData] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });

  // Load and display the image
  useEffect(() => {
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Calculate display dimensions (max 320px for mobile)
      const maxSize = 320;
      let displayWidth = img.width;
      let displayHeight = img.height;

      if (displayWidth > maxSize || displayHeight > maxSize) {
        const ratio = Math.min(maxSize / displayWidth, maxSize / displayHeight);
        displayWidth = displayWidth * ratio;
        displayHeight = displayHeight * ratio;
      }

      setImageData({
        width: displayWidth,
        height: displayHeight,
        naturalWidth: img.width,
        naturalHeight: img.height
      });

      // Set initial crop area (centered square)
      const initialSize = Math.min(displayWidth, displayHeight) * 0.7;
      setCropArea({
        x: (displayWidth - initialSize) / 2,
        y: (displayHeight - initialSize) / 2,
        size: initialSize
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
      imageData.width - cropArea.size,
      cropArea.x + deltaX
    ));
    const newY = Math.max(0, Math.min(
      imageData.height - cropArea.size,
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
    const maxSize = Math.min(imageData.width, imageData.height);
    const newSize = Math.min(maxSize, cropArea.size + 20);

    // Adjust position to keep crop area centered and within bounds
    let newX = cropArea.x - (newSize - cropArea.size) / 2;
    let newY = cropArea.y - (newSize - cropArea.size) / 2;

    newX = Math.max(0, Math.min(imageData.width - newSize, newX));
    newY = Math.max(0, Math.min(imageData.height - newSize, newY));

    setCropArea({ x: newX, y: newY, size: newSize });
  };

  // Decrease crop size
  const decreaseCropSize = () => {
    const minSize = 80;
    const newSize = Math.max(minSize, cropArea.size - 20);

    // Adjust position to keep crop area centered
    const newX = cropArea.x + (cropArea.size - newSize) / 2;
    const newY = cropArea.y + (cropArea.size - newSize) / 2;

    setCropArea({ x: newX, y: newY, size: newSize });
  };

  // Move crop area with buttons
  const moveCropArea = (direction) => {
    const step = 10;
    let newX = cropArea.x;
    let newY = cropArea.y;

    switch (direction) {
      case 'up':
        newY = Math.max(0, cropArea.y - step);
        break;
      case 'down':
        newY = Math.min(imageData.height - cropArea.size, cropArea.y + step);
        break;
      case 'left':
        newX = Math.max(0, cropArea.x - step);
        break;
      case 'right':
        newX = Math.min(imageData.width - cropArea.size, cropArea.x + step);
        break;
    }

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  // Crop the image and return blob
  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Set canvas size to desired output (400x400)
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Calculate scaling factors
    const scaleX = imageData.naturalWidth / imageData.width;
    const scaleY = imageData.naturalHeight / imageData.height;

    // Calculate source crop area in original image coordinates
    const sourceX = cropArea.x * scaleX;
    const sourceY = cropArea.y * scaleY;
    const sourceSize = cropArea.size * scaleX;

    // Draw cropped image
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceSize, sourceSize,
      0, 0, outputSize, outputSize
    );

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob && onCropComplete) {
        onCropComplete(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  if (!file) return null;

  return (
    <div className="card-base card-padding-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Crop Your Image
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
                width: cropArea.size,
                height: cropArea.size,
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
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Crop Size</h4>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={decreaseCropSize}
              className="mobile-touch-target btn-outline rounded-full flex items-center justify-center"
              disabled={cropArea.size <= 80}
            >
              <Minus className="w-5 h-5" />
            </button>

            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-20 text-center">
              {Math.round(cropArea.size)}px
            </span>

            <button
              onClick={increaseCropSize}
              className="mobile-touch-target btn-outline rounded-full flex items-center justify-center"
              disabled={cropArea.size >= Math.min(imageData.width, imageData.height)}
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

        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-lg mx-auto mb-2">
          {imageRef.current && imageData.width > 0 && (
            <div
              className="w-full h-full bg-center bg-cover"
              style={{
                backgroundImage: `url(${imageRef.current?.src})`,
                backgroundPosition: `-${(cropArea.x / imageData.width) * 100}% -${(cropArea.y / imageData.height) * 100}%`,
                backgroundSize: `${(imageData.width / cropArea.size) * 100}% ${(imageData.height / cropArea.size) * 100}%`
              }}
            />
          )}
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400">
          Final: 400×400px
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
  );
};

export default ImageCropperMobile;