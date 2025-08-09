// components/dashboard/Profile/ImageCropperDesktop.jsx - Desktop Mouse-Controlled Image Cropper
import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const ImageCropperDesktop = ({ file, onCropComplete, onCancel }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: 200 });
  const [imageData, setImageData] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load and display the image
  useEffect(() => {
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Calculate display dimensions (max 500px for desktop)
      const maxSize = 500;
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
      const initialSize = Math.min(displayWidth, displayHeight) * 0.8;
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

  // Handle mouse down on crop area
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropArea.x,
      y: e.clientY - cropArea.y
    });
  };

  // Handle mouse down on resize handle
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startSize = cropArea.size;
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startCropX = cropArea.x;
    const startCropY = cropArea.y;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;
      const delta = Math.max(deltaX, deltaY);

      let newSize = startSize + delta;

      // Constrain size
      const maxSize = Math.min(imageData.width, imageData.height);
      const minSize = 50;
      newSize = Math.max(minSize, Math.min(maxSize, newSize));

      // Calculate new position to keep crop area within bounds
      let newX = startCropX;
      let newY = startCropY;

      // If expanding would go out of bounds, adjust position
      if (newX + newSize > imageData.width) {
        newX = imageData.width - newSize;
      }
      if (newY + newSize > imageData.height) {
        newY = imageData.height - newSize;
      }

      setCropArea({ x: newX, y: newY, size: newSize });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (!isDragging || isResizing) return;

    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = Math.max(0, Math.min(
      imageData.width - cropArea.size,
      e.clientX - rect.left - dragStart.x
    ));
    const newY = Math.max(0, Math.min(
      imageData.height - cropArea.size,
      e.clientY - rect.top - dragStart.y
    ));

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging && !isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, cropArea.size, imageData]);

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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Crop Area */}
        <div className="flex-1">
          <div className="relative inline-block border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <img
              ref={imageRef}
              alt="Crop preview"
              className="block select-none"
              draggable={false}
              style={{ cursor: isDragging ? 'grabbing' : 'default' }}
            />

            {/* Crop Overlay */}
            {imageData.width > 0 && (
              <div
                className="absolute border-2 border-white shadow-lg bg-black bg-opacity-20 select-none"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.size,
                  height: cropArea.size,
                  borderRadius: '8px',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleMouseDown}
              >
                {/* Resize Handle */}
                <div
                  className="absolute w-5 h-5 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize -bottom-2 -right-2 hover:bg-indigo-50 transition-colors"
                  onMouseDown={handleResizeMouseDown}
                  style={{ cursor: 'se-resize' }}
                />

                {/* Corner indicators */}
                <div className="absolute w-3 h-3 border-l-2 border-t-2 border-white top-1 left-1 opacity-75" />
                <div className="absolute w-3 h-3 border-r-2 border-t-2 border-white top-1 right-1 opacity-75" />
                <div className="absolute w-3 h-3 border-l-2 border-b-2 border-white bottom-1 left-1 opacity-75" />
                <div className="absolute w-3 h-3 border-r-2 border-b-2 border-white bottom-1 right-1 opacity-75" />

                {/* Grid Lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white opacity-50" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white opacity-50" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white opacity-50" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white opacity-50" />
                </div>

                {/* Center crosshair */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-4 h-px bg-white opacity-75" />
                  <div className="absolute w-px h-4 bg-white opacity-75" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Drag</strong> crop area to reposition</p>
            <p><strong>Drag corner handle</strong> to resize</p>
            <p><strong>Square crop enforced</strong> for perfect circular display</p>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-shrink-0">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Preview</h4>

          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-lg mb-4">
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

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>Final:</strong> 400×400px</p>
            <p><strong>Crop:</strong> {Math.round(cropArea.size)}×{Math.round(cropArea.size)}px</p>
            <p><strong>Position:</strong> ({Math.round(cropArea.x)}, {Math.round(cropArea.y)})</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleCrop}
          className="btn-primary btn-sm flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Apply Crop
        </button>

        <button
          onClick={onCancel}
          className="btn-outline btn-sm flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropperDesktop;