// components/projects/wizard/project/photoUploader/cropStep/CropInterface.jsx
import React, { useRef, useEffect } from 'react';

const CropInterface = ({
  file,
  cropArea,
  onCropAreaChange,
  imageData,
  onImageDataChange,
  isDragging,
  onDragStart,
  onDragEnd
}) => {
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Load image when file changes
  useEffect(() => {
    if (!file) return;

    const img = new Image();
    const url = file.previewUrl;

    img.onload = () => {
      const maxWidth = 400;
      let displayWidth = img.width;
      let displayHeight = img.height;

      if (displayWidth > maxWidth) {
        const ratio = maxWidth / displayWidth;
        displayWidth = maxWidth;
        displayHeight = displayHeight * ratio;
      }

      const newImageData = {
        width: displayWidth,
        height: displayHeight,
        naturalWidth: img.width,
        naturalHeight: img.height
      };

      onImageDataChange(newImageData);

      if (imageRef.current) {
        imageRef.current.src = url;
        imageRef.current.style.width = `${displayWidth}px`;
        imageRef.current.style.height = `${displayHeight}px`;
      }
    };

    img.src = url;
  }, [file, onImageDataChange]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dragStart = {
      x: e.clientX - rect.left - cropArea.x,
      y: e.clientY - rect.top - cropArea.y
    };

    onDragStart(dragStart);
  };

  if (!file) {
    return (
      <div className="flex justify-center">
        <div className="w-96 h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">No image selected</span>
        </div>
      </div>
    );
  }

  return (
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
  );
};

export default CropInterface;