// components/projects/wizard/project/photoUploader/cropStep/ProjectPhotoCropStep.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Edit, SkipForward, ArrowLeft, ArrowRight, Check, Plus, Minus, Square, Smartphone, Monitor, ChevronDown } from 'lucide-react';
import CropProgress from './CropProgress';
import PhotoNavigation from './PhotoNavigation';
import PhotoPreview from './PhotoPreview';

const ProjectPhotoCropStep = ({
 formData,
 onFileEdited,
 onAllPhotosProcessed
}) => {
 const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
 const [showCropper, setShowCropper] = useState(false);
 const [aspectRatio, setAspectRatio] = useState('square');
 const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 300, height: 300 });
 const [imageData, setImageData] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
 const [isDragging, setIsDragging] = useState(false);
 const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
 const [showPortraitOptions, setShowPortraitOptions] = useState(false);
 const [showLandscapeOptions, setShowLandscapeOptions] = useState(false);

 const canvasRef = useRef(null);
 const imageRef = useRef(null);
 const containerRef = useRef(null);

 const files = formData.files || [];
 const unprocessedFiles = files.filter(f => !f.editData?.isProcessed);
 const processedFiles = files.filter(f => f.editData?.isProcessed);
 const currentFile = files[currentPhotoIndex];

 // Extended aspect ratio configurations
 const aspectRatios = {
   // Portrait options
   'portrait-4x5': { ratio: 4/5, label: '4:5', icon: Smartphone, outputWidth: 800, outputHeight: 1000, category: 'portrait' },
   'portrait-3x4': { ratio: 3/4, label: '3:4', icon: Smartphone, outputWidth: 768, outputHeight: 1024, category: 'portrait' },
   'portrait-2x3': { ratio: 2/3, label: '2:3', icon: Smartphone, outputWidth: 683, outputHeight: 1024, category: 'portrait' },
   'portrait-9x16': { ratio: 9/16, label: '9:16', icon: Smartphone, outputWidth: 576, outputHeight: 1024, category: 'portrait' },

   // Square option
   'square': { ratio: 1/1, label: 'Square', icon: Square, outputWidth: 800, outputHeight: 800, category: 'square' },

   // Landscape options
   'landscape-16x9': { ratio: 16/9, label: '16:9', icon: Monitor, outputWidth: 1024, outputHeight: 576, category: 'landscape' },
   'landscape-3x2': { ratio: 3/2, label: '3:2', icon: Monitor, outputWidth: 1024, outputHeight: 683, category: 'landscape' },
   'landscape-4x3': { ratio: 4/3, label: '4:3', icon: Monitor, outputWidth: 1024, outputHeight: 768, category: 'landscape' },
   'landscape-5x4': { ratio: 5/4, label: '5:4', icon: Monitor, outputWidth: 1024, outputHeight: 819, category: 'landscape' }
 };

 const currentRatio = aspectRatios[aspectRatio];

 // Get ratios by category
 const portraitRatios = Object.entries(aspectRatios).filter(([key, config]) => config.category === 'portrait');
 const landscapeRatios = Object.entries(aspectRatios).filter(([key, config]) => config.category === 'landscape');

 // Auto-advance to next unprocessed photo when current is processed
 useEffect(() => {
   if (unprocessedFiles.length === 0) {
     onAllPhotosProcessed?.();
     return;
   }

   const nextUnprocessedIndex = files.findIndex(f => !f.editData?.isProcessed);
   if (nextUnprocessedIndex !== -1 && nextUnprocessedIndex !== currentPhotoIndex) {
     setCurrentPhotoIndex(nextUnprocessedIndex);
     setShowCropper(false);
   }
 }, [files, currentPhotoIndex, unprocessedFiles.length, onAllPhotosProcessed]);

 // Load image when file changes or cropper is shown
 useEffect(() => {
   if (!currentFile || !showCropper) return;

   const img = new Image();
   const url = currentFile.previewUrl;

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
       imageRef.current.src = url;
       imageRef.current.style.width = `${displayWidth}px`;
       imageRef.current.style.height = `${displayHeight}px`;
     }
   };

   img.src = url;
 }, [currentFile, showCropper]);

 // Update crop area when aspect ratio or image changes - FIXED
 useEffect(() => {
   if (imageData.width === 0) return;

   // Start with a reasonable base size
   const baseSize = Math.min(imageData.width, imageData.height) * 0.6;

   // Calculate dimensions based on aspect ratio
   let cropWidth, cropHeight;

   if (currentRatio.ratio > 1) {
     // Landscape: width is larger
     cropWidth = Math.min(baseSize * 1.2, imageData.width * 0.9);
     cropHeight = cropWidth / currentRatio.ratio;

     // If height doesn't fit, constrain by height
     if (cropHeight > imageData.height * 0.9) {
       cropHeight = imageData.height * 0.9;
       cropWidth = cropHeight * currentRatio.ratio;
     }
   } else if (currentRatio.ratio < 1) {
     // Portrait: height is larger
     cropHeight = Math.min(baseSize * 1.2, imageData.height * 0.9);
     cropWidth = cropHeight * currentRatio.ratio;

     // If width doesn't fit, constrain by width
     if (cropWidth > imageData.width * 0.9) {
       cropWidth = imageData.width * 0.9;
       cropHeight = cropWidth / currentRatio.ratio;
     }
   } else {
     // Square
     const maxSize = Math.min(imageData.width, imageData.height) * 0.8;
     cropWidth = cropHeight = maxSize;
   }

   // Ensure minimum size
   const minSize = 80;
   if (cropWidth < minSize) {
     cropWidth = minSize;
     cropHeight = cropWidth / currentRatio.ratio;
   }
   if (cropHeight < minSize) {
     cropHeight = minSize;
     cropWidth = cropHeight * currentRatio.ratio;
   }

   // Center the crop area
   const centerX = (imageData.width - cropWidth) / 2;
   const centerY = (imageData.height - cropHeight) / 2;

   setCropArea({
     x: Math.max(0, centerX),
     y: Math.max(0, centerY),
     width: cropWidth,
     height: cropHeight
   });
 }, [aspectRatio, imageData, currentRatio.ratio]);

 // Crop size controls - FIXED
 const increaseCropSize = () => {
   const step = 20;

   // Calculate new dimensions maintaining aspect ratio
   let newWidth, newHeight;

   if (currentRatio.ratio >= 1) {
     // Landscape or square: increase width first
     newWidth = Math.min(imageData.width * 0.95, cropArea.width + step);
     newHeight = newWidth / currentRatio.ratio;

     // Check if height fits
     if (newHeight > imageData.height * 0.95) {
       newHeight = imageData.height * 0.95;
       newWidth = newHeight * currentRatio.ratio;
     }
   } else {
     // Portrait: increase height first
     newHeight = Math.min(imageData.height * 0.95, cropArea.height + step);
     newWidth = newHeight * currentRatio.ratio;

     // Check if width fits
     if (newWidth > imageData.width * 0.95) {
       newWidth = imageData.width * 0.95;
       newHeight = newWidth / currentRatio.ratio;
     }
   }

   // Center the new crop area
   const newX = Math.max(0, Math.min(imageData.width - newWidth, cropArea.x - (newWidth - cropArea.width) / 2));
   const newY = Math.max(0, Math.min(imageData.height - newHeight, cropArea.y - (newHeight - cropArea.height) / 2));

   setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
 };

 const decreaseCropSize = () => {
   const step = 20;

   // Calculate new dimensions maintaining aspect ratio
   let newWidth, newHeight;

   if (currentRatio.ratio >= 1) {
     // Landscape or square: decrease width first
     newWidth = Math.max(80, cropArea.width - step);
     newHeight = newWidth / currentRatio.ratio;
   } else {
     // Portrait: decrease height first, but ensure width doesn't get too small
     const minWidth = 80;
     newWidth = Math.max(minWidth, cropArea.width - step);
     newHeight = newWidth / currentRatio.ratio;
   }

   // Center the new crop area
   const newX = Math.max(0, Math.min(imageData.width - newWidth, cropArea.x + (cropArea.width - newWidth) / 2));
   const newY = Math.max(0, Math.min(imageData.height - newHeight, cropArea.y + (cropArea.height - newHeight) / 2));

   setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
 };

 // Handle crop completion
 const handleCropComplete = async () => {
   if (!currentFile || !imageRef.current || !canvasRef.current) return;

   const canvas = canvasRef.current;
   const ctx = canvas.getContext('2d');
   const img = imageRef.current;

   canvas.width = currentRatio.outputWidth;
   canvas.height = currentRatio.outputHeight;

   const scaleX = imageData.naturalWidth / imageData.width;
   const scaleY = imageData.naturalHeight / imageData.height;

   const sourceX = cropArea.x * scaleX;
   const sourceY = cropArea.y * scaleY;
   const sourceWidth = cropArea.width * scaleX;
   const sourceHeight = cropArea.height * scaleY;

   ctx.drawImage(
     img,
     sourceX, sourceY, sourceWidth, sourceHeight,
     0, 0, currentRatio.outputWidth, currentRatio.outputHeight
   );

   canvas.toBlob((blob) => {
     if (blob) {
       const croppedPreviewUrl = URL.createObjectURL(blob);

       onFileEdited(currentFile.id, {
         isProcessed: true,
         skipEditing: false,
         croppedBlob: blob,
         croppedPreviewUrl,
         aspectRatio: aspectRatio,
         cropSettings: { timestamp: new Date().toISOString() }
       });

       setShowCropper(false);
     }
   }, 'image/jpeg', 0.9);
 };

 // Handle skip editing
 const handleSkipEditing = () => {
   if (!currentFile) return;

   onFileEdited(currentFile.id, {
     isProcessed: true,
     skipEditing: true,
     croppedBlob: null,
     croppedPreviewUrl: null,
     aspectRatio: 'original',
     cropSettings: null
   });

   setShowCropper(false);
 };

 // Handle mouse/touch events for dragging
 const handleStart = (e) => {
   e.preventDefault();
   const rect = containerRef.current?.getBoundingClientRect();
   if (!rect) return;

   setIsDragging(true);

   const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
   const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

   setDragStart({
     x: clientX - rect.left - cropArea.x,
     y: clientY - rect.top - cropArea.y
   });
 };

 const handleMove = (e) => {
   if (!isDragging) return;
   e.preventDefault();

   const rect = containerRef.current?.getBoundingClientRect();
   if (!rect) return;

   const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
   const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

   const newX = Math.max(0, Math.min(
     imageData.width - cropArea.width,
     clientX - rect.left - dragStart.x
   ));
   const newY = Math.max(0, Math.min(
     imageData.height - cropArea.height,
     clientY - rect.top - dragStart.y
   ));

   setCropArea(prev => ({ ...prev, x: newX, y: newY }));
 };

 const handleEnd = (e) => {
   e.preventDefault();
   setIsDragging(false);
 };

 // Event listeners for mouse and touch
 useEffect(() => {
   if (isDragging) {
     document.addEventListener('mousemove', handleMove);
     document.addEventListener('mouseup', handleEnd);
     document.addEventListener('touchmove', handleMove, { passive: false });
     document.addEventListener('touchend', handleEnd);

     return () => {
       document.removeEventListener('mousemove', handleMove);
       document.removeEventListener('mouseup', handleEnd);
       document.removeEventListener('touchmove', handleMove);
       document.removeEventListener('touchend', handleEnd);
     };
   }
 }, [isDragging, dragStart, cropArea, imageData]);

 // Handle aspect ratio selection
 const handleAspectRatioSelect = (ratioKey) => {
   setAspectRatio(ratioKey);
   setShowPortraitOptions(false);
   setShowLandscapeOptions(false);
 };

 if (files.length === 0) {
   return (
     <div className="text-center py-8">
       <Edit className="mx-auto mb-2 text-gray-400" size={32} />
       <p className="text-gray-500 dark:text-gray-400">No photos to edit</p>
     </div>
   );
 }

 // All photos processed
 if (unprocessedFiles.length === 0) {
   return (
     <div className="space-y-6">
       <div className="text-center mb-6">
         <Check className="mx-auto mb-2 text-emerald-600 dark:text-emerald-400" size={32} />
         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
           All Photos Processed
         </h3>
         <p className="text-sm text-gray-600 dark:text-gray-400">
           Ready to proceed to the next step
         </p>
       </div>

       <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
         <div className="text-emerald-800 dark:text-emerald-300 text-sm text-center">
           <div className="font-medium mb-2">Processing Complete!</div>
           <div className="space-y-1">
             <div>{processedFiles.filter(f => f.editData?.croppedBlob && !f.editData?.skipEditing).length} photos cropped</div>
             <div>{processedFiles.filter(f => f.editData?.skipEditing).length} photos kept as originals</div>
           </div>
         </div>
       </div>
     </div>
   );
 }

 return (
   <div className="space-y-6">
     <div className="text-center mb-6">
       <Edit className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
       <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
         Edit Your Photos
       </h3>
       <p className="text-sm text-gray-600 dark:text-gray-400">
         Crop photos for better framing or skip to use originals
       </p>
     </div>

     <CropProgress
       currentIndex={currentPhotoIndex}
       totalFiles={files.length}
       processedCount={processedFiles.length}
       unprocessedCount={unprocessedFiles.length}
     />

     {currentFile && (
       <div className="space-y-4">
         <PhotoNavigation
           currentIndex={currentPhotoIndex}
           totalFiles={files.length}
           onPrevious={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
           onNext={() => setCurrentPhotoIndex(Math.min(files.length - 1, currentPhotoIndex + 1))}
           disabled={showCropper}
         />

         {!showCropper ? (
           <PhotoPreview
             file={currentFile}
             onStartCrop={() => setShowCropper(true)}
             onSkipEditing={handleSkipEditing}
           />
         ) : (
           // Inline cropper interface
           <div className="space-y-6">
             {/* Aspect ratio selector */}
             <div>
               <h4 className="font-medium text-gray-900 dark:text-white mb-3">Choose Aspect Ratio</h4>

               {/* Main category buttons */}
               <div className="flex gap-3 justify-center mb-4">
                 {/* Portrait dropdown */}
                 <div className="relative">
                   <button
                     onClick={() => {
                       setShowPortraitOptions(!showPortraitOptions);
                       setShowLandscapeOptions(false);
                     }}
                     className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                       currentRatio.category === 'portrait'
                         ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                         : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                     }`}
                   >
                     <Smartphone size={16} />
                     <span className="text-sm font-medium">
                       {currentRatio.category === 'portrait' ? `Portrait ${currentRatio.label}` : 'Portrait'}
                     </span>
                     <ChevronDown size={14} />
                   </button>

                   {showPortraitOptions && (
                     <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-32">
                       {portraitRatios.map(([key, config]) => (
                         <button
                           key={key}
                           onClick={() => handleAspectRatioSelect(key)}
                           className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                             aspectRatio === key ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : ''
                           }`}
                         >
                           {config.label}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>

                 {/* Square button */}
                 <button
                   onClick={() => handleAspectRatioSelect('square')}
                   className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                     aspectRatio === 'square'
                       ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                       : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                   }`}
                 >
                   <Square size={16} />
                   <span className="text-sm font-medium">Square</span>
                 </button>

                 {/* Landscape dropdown */}
                 <div className="relative">
                   <button
                     onClick={() => {
                       setShowLandscapeOptions(!showLandscapeOptions);
                       setShowPortraitOptions(false);
                     }}
                     className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                       currentRatio.category === 'landscape'
                         ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                         : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                     }`}
                   >
                     <Monitor size={16} />
                     <span className="text-sm font-medium">
                       {currentRatio.category === 'landscape' ? `Landscape ${currentRatio.label}` : 'Landscape'}
                     </span>
                     <ChevronDown size={14} />
                   </button>

                   {showLandscapeOptions && (
                     <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-32">
                       {landscapeRatios.map(([key, config]) => (
                         <button
                           key={key}
                           onClick={() => handleAspectRatioSelect(key)}
                           className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                             aspectRatio === key ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : ''
                           }`}
                         >
                           {config.label}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
             </div>

             {/* Crop area */}
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
                     className="absolute border-2 border-white shadow-lg bg-black bg-opacity-20 select-none touch-none"
                     style={{
                       left: cropArea.x,
                       top: cropArea.y,
                       width: cropArea.width,
                       height: cropArea.height,
                       borderRadius: '4px',
                       cursor: isDragging ? 'grabbing' : 'grab'
                     }}
                     onMouseDown={handleStart}
                     onTouchStart={handleStart}
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

             {/* Crop Size Controls */}
             <div className="text-center">
               <h4 className="font-medium text-gray-900 dark:text-white mb-3">Crop Size</h4>
               <div className="flex items-center justify-center gap-4">
                 <button
                   onClick={decreaseCropSize}
                   className="p-3 btn-tertiary rounded-full flex items-center justify-center"
                   disabled={cropArea.width <= 80}
                 >
                   <Minus className="w-5 h-5" />
                 </button>

                 <span className="text-sm text-gray-600 dark:text-gray-400 min-w-32 text-center">
                   {Math.round(cropArea.width)}×{Math.round(cropArea.height)}px
                 </span>

                 <button
                   onClick={increaseCropSize}
                   className="p-3 btn-tertiary rounded-full flex items-center justify-center"
                   disabled={cropArea.width >= imageData.width * 0.95}
                 >
                   <Plus className="w-5 h-5" />
                 </button>
               </div>
               <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                 Final output: {currentRatio.outputWidth}×{currentRatio.outputHeight}px ({currentRatio.label})
               </div>
             </div>

             <div className="text-center space-y-1 text-sm text-gray-600 dark:text-gray-400">
               <p><strong>Drag</strong> crop area to reposition</p>
               <p><strong>Use size buttons</strong> to resize crop area</p>
             </div>

             {/* Crop actions */}
             <div className="flex gap-3 justify-center">
               <button
                 onClick={handleCropComplete}
                 className="btn-primary btn-md"
               >
                 <Check size={16} />
                 Apply Crop
               </button>
               <button
                 onClick={() => setShowCropper(false)}
                 className="btn-tertiary btn-md"
               >
                 Cancel
               </button>
             </div>
           </div>
         )}
       </div>
     )}

     {/* Hidden canvas for processing */}
     <canvas ref={canvasRef} className="hidden" />
   </div>
 );
};

export default ProjectPhotoCropStep;