// components/projects/wizard/project/photoUploader/cropStep/useCropLogic.js
import { useState, useCallback } from 'react';
import { Square, Smartphone, Monitor } from 'lucide-react';

export const useCropLogic = (file, imageRef, canvasRef) => {
  const [aspectRatio, setAspectRatio] = useState('square');
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 300, height: 300 });
  const [imageData, setImageData] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });

  const aspectRatios = {
    portrait: { ratio: 4/5, label: 'Portrait', icon: Smartphone, outputWidth: 800, outputHeight: 1000 },
    square: { ratio: 1/1, label: 'Square', icon: Square, outputWidth: 800, outputHeight: 800 },
    landscape: { ratio: 16/9, label: 'Landscape', icon: Monitor, outputWidth: 800, outputHeight: 450 }
  };

  const loadImage = useCallback(() => {
    if (!file?.previewUrl) return;

    const img = new Image();
    img.onload = () => {
      const maxWidth = 400;
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

      if (imageRef.current) {
        imageRef.current.src = file.previewUrl;
        imageRef.current.style.width = `${displayWidth}px`;
        imageRef.current.style.height = `${displayHeight}px`;
      }
    };
    img.src = file.previewUrl;
  }, [file, imageRef]);

  const increaseCropSize = useCallback(() => {
    const step = 20;
    const currentRatio = aspectRatios[aspectRatio];
    const newWidth = Math.min(imageData.width * 0.9, cropArea.width + step);
    const newHeight = newWidth / currentRatio.ratio;

    const newX = Math.max(0, Math.min(imageData.width - newWidth, cropArea.x - step / 2));
    const newY = Math.max(0, Math.min(imageData.height - newHeight, cropArea.y - (newHeight - cropArea.height) / 2));

    setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
  }, [cropArea, imageData, aspectRatio, aspectRatios]);

  const decreaseCropSize = useCallback(() => {
    const step = 20;
    const currentRatio = aspectRatios[aspectRatio];
    const newWidth = Math.max(80, cropArea.width - step);
    const newHeight = newWidth / currentRatio.ratio;

    const newX = Math.max(0, Math.min(imageData.width - newWidth, cropArea.x + step / 2));
    const newY = Math.max(0, Math.min(imageData.height - newHeight, cropArea.y + (cropArea.height - newHeight) / 2));

    setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
  }, [cropArea, imageData, aspectRatio, aspectRatios]);

  const applyCrop = useCallback(async (currentAspectRatio) => {
    if (!imageRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    const currentRatio = aspectRatios[currentAspectRatio];

    canvas.width = currentRatio.outputWidth;
    canvas.height = currentRatio.outputHeight;

    const scaleX = imageData.naturalWidth / imageData.width;
    const scaleY = imageData.naturalHeight / imageData.height;

    ctx.drawImage(
      img,
      cropArea.x * scaleX, cropArea.y * scaleY, cropArea.width * scaleX, cropArea.height * scaleY,
      0, 0, currentRatio.outputWidth, currentRatio.outputHeight
    );

    return new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
  }, [cropArea, imageData, aspectRatios, imageRef, canvasRef]);

  return {
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
  };
};