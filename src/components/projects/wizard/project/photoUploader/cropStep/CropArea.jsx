// components/projects/wizard/project/photoUploader/cropStep/CropArea.jsx
import React from 'react';

const CropArea = ({
  imageRef,
  containerRef,
  cropArea,
  imageData,
  isDragging,
  onMouseDown
}) => {
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
            onMouseDown={onMouseDown}
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

export default CropArea;