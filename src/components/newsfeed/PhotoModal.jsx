// components/newsfeed/PhotoModal.jsx - Fullscreen photo modal with global styling
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
    <div className="photo-modal-backdrop">
      {/* Close button */}
      <button
        onClick={onClose}
        className="photo-modal-close"
      >
        <X size={24} />
      </button>

      {/* Photo counter */}
      {hasMultiplePhotos && (
        <div className="photo-modal-counter">
          {currentIndex + 1} / {photos.length}
        </div>
      )}

      {/* Zoom button */}
      <button
        onClick={toggleZoom}
        className="photo-modal-zoom"
      >
        {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
      </button>

      {/* Navigation arrows */}
      {hasMultiplePhotos && (
        <>
          <button
            onClick={goToPrevPhoto}
            className="photo-modal-nav-prev"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={goToNextPhoto}
            className="photo-modal-nav-next"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Main photo */}
      <div
        className="photo-modal-container"
        onClick={toggleZoom}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentPhoto.imageUrl}
          alt={currentPhoto.title || `Photo ${currentIndex + 1}`}
          className={isZoomed ? 'photo-modal-image-zoomed' : 'photo-modal-image-normal'}
          draggable={false}
        />
      </div>

      {/* Bottom info panel */}
      <div className="photo-modal-info-panel">
        {/* Photo metadata */}
        {(currentPhoto.title || currentPhoto.description) && (
          <div className="photo-modal-metadata">
            {currentPhoto.title && (
              <h3 className="photo-modal-title">{currentPhoto.title}</h3>
            )}
            {currentPhoto.description && (
              <p className="photo-modal-description">{currentPhoto.description}</p>
            )}
          </div>
        )}

        {/* Author info */}
        {postAuthor && (
          <div className="photo-modal-author">
            {postAuthor.photoURL ? (
              <img
                src={postAuthor.photoURL}
                alt={postAuthor.displayName}
                className="photo-modal-author-avatar"
              />
            ) : (
              <div className="photo-modal-author-placeholder">
                <span className="photo-modal-author-initial">
                  {postAuthor.displayName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <span>{postAuthor.displayName || 'Unknown User'}</span>
          </div>
        )}

        {/* Photo thumbnails for navigation */}
        {hasMultiplePhotos && (
          <div className="photo-modal-thumbnails">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => goToPhoto(index)}
                className={index === currentIndex ? 'photo-modal-thumbnail-active' : 'photo-modal-thumbnail-inactive'}
              >
                <img
                  src={photo.imageUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="photo-modal-thumbnail-image"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="photo-modal-instructions">
        <div>Click to zoom • Arrow keys to navigate • ESC to close</div>
        {hasMultiplePhotos && <div>Swipe on mobile to navigate</div>}
      </div>
    </div>
  );
};

export default PhotoModal;