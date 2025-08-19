// components/newsfeed/PhotoModal.jsx - Fullscreen photo modal component
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

const PhotoModal = ({
  isOpen,
  onClose,
  photos,
  initialIndex = 0,
  postAuthor = null
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const hasMultiplePhotos = photos.length > 1;
  const currentPhoto = photos[currentIndex];

  // Update current index when initial index changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevPhoto();
          break;
        case 'ArrowRight':
          goToNextPhoto();
          break;
        case ' ':
          e.preventDefault();
          toggleZoom();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex, photos.length, isZoomed]);

  // Navigation functions
  const goToNextPhoto = () => {
    if (hasMultiplePhotos) {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
      setIsZoomed(false); // Reset zoom when changing photos
    }
  };

  const goToPrevPhoto = () => {
    if (hasMultiplePhotos) {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
      setIsZoomed(false); // Reset zoom when changing photos
    }
  };

  const goToPhoto = (index) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  };

  // Zoom functionality
  const toggleZoom = () => {
    setIsZoomed(prev => !prev);
  };

  // Touch handling
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && hasMultiplePhotos) {
      goToNextPhoto();
    }
    if (isRightSwipe && hasMultiplePhotos) {
      goToPrevPhoto();
    }
  };

  if (!isOpen || !currentPhoto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all"
      >
        <X size={24} />
      </button>

      {/* Photo counter */}
      {hasMultiplePhotos && (
        <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      )}

      {/* Zoom button */}
      <button
        onClick={toggleZoom}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all"
      >
        {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
      </button>

      {/* Navigation arrows */}
      {hasMultiplePhotos && (
        <>
          <button
            onClick={goToPrevPhoto}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={goToNextPhoto}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Main photo */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 cursor-pointer"
        onClick={toggleZoom}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentPhoto.imageUrl}
          alt={currentPhoto.title || `Photo ${currentIndex + 1}`}
          className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
            isZoomed ? 'transform scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          draggable={false}
        />
      </div>

      {/* Bottom info panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 pt-12">
        {/* Photo metadata */}
        {(currentPhoto.title || currentPhoto.description) && (
          <div className="text-white mb-4">
            {currentPhoto.title && (
              <h3 className="text-lg font-semibold mb-1">{currentPhoto.title}</h3>
            )}
            {currentPhoto.description && (
              <p className="text-sm text-gray-300">{currentPhoto.description}</p>
            )}
          </div>
        )}

        {/* Author info */}
        {postAuthor && (
          <div className="flex items-center gap-3 text-white text-sm">
            {postAuthor.photoURL ? (
              <img
                src={postAuthor.photoURL}
                alt={postAuthor.displayName}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs">
                  {postAuthor.displayName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <span>{postAuthor.displayName || 'Unknown User'}</span>
          </div>
        )}

        {/* Photo thumbnails for navigation */}
        {hasMultiplePhotos && (
          <div className="flex justify-center gap-2 mt-4 overflow-x-auto">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => goToPhoto(index)}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-white opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-80'
                }`}
              >
                <img
                  src={photo.imageUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-white text-xs bg-black bg-opacity-50 px-3 py-2 rounded-lg">
        <div>Click to zoom • Arrow keys to navigate • ESC to close</div>
        {hasMultiplePhotos && <div>Swipe on mobile to navigate</div>}
      </div>
    </div>
  );
};

export default PhotoModal;