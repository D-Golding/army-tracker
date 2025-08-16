// components/projects/wizard/project/photoUploader/cropStep/CropperDesktop.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useCropLogic } from './useCropLogic';
import { useMouseDrag } from './useMouseDrag';
import AspectRatioSelector from './AspectRatioSelector';
import CropArea from './CropArea';
import CropSizeControls from './CropSizeControls';
import CropActions from './CropActions';

const CropperDesktop = ({ file, onCropComplete, onCancel }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const {
    aspectRatio,
    setAspectRatio,
    cropArea,
    setCropArea,
    imageData,
    aspectRatios,
    increaseCropSize,
    decreaseCropSize,
    loadImage,
    applyCrop
  } = useCropLogic(file, imageRef, canvasRef);

  const { isDragging, handleMouseDown } = useMouseDrag(
    containerRef,
    cropArea,
    setCropArea,
    imageData
  );

  // Load image when file changes
  useEffect(() => {
    loadImage();
  }, [file, loadImage]);

  const handleCropComplete = async () => {
    const blob = await applyCrop(aspectRatio);
    if (blob) {
      onCropComplete(blob, aspectRatio);
    }
  };

  const currentRatio = aspectRatios[aspectRatio];

  return (
    <div className="space-y-6">
      <AspectRatioSelector
        selectedRatio={aspectRatio}
        onRatioChange={setAspectRatio}
      />

      <CropArea
        imageRef={imageRef}
        containerRef={containerRef}
        cropArea={cropArea}
        imageData={imageData}
        isDragging={isDragging}
        onMouseDown={handleMouseDown}
      />

      <CropSizeControls
        cropArea={cropArea}
        onIncrease={increaseCropSize}
        onDecrease={decreaseCropSize}
        aspectRatioConfig={currentRatio}
      />

      <CropActions
        onApply={handleCropComplete}
        onCancel={onCancel}
      />

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CropperDesktop;