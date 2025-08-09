// components/shared/MobileDragWrapper.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';

const MobileDragWrapper = ({
  children,
  itemId,
  itemIndex,
  totalItems,
  onReorder,
  threshold = 60, // Lower threshold for more responsive reordering
  className = '',
  disabled = false,
  direction = 'vertical'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [targetIndex, setTargetIndex] = useState(null);
  const elementRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate target index based on drag distance
  const calculateTargetIndex = useCallback((delta) => {
    if (!containerRef.current) return itemIndex;

    // Get the height/width of one item (assuming uniform sizing)
    const itemHeight = containerRef.current.clientHeight;
    const itemWidth = containerRef.current.clientWidth;
    const itemSize = direction === 'vertical' ? itemHeight : itemWidth;

    // Calculate how many items we've moved past
    const itemsMoved = Math.round(delta / itemSize);
    const newIndex = itemIndex + itemsMoved;

    // Clamp to valid range
    return Math.max(0, Math.min(totalItems - 1, newIndex));
  }, [itemIndex, totalItems, direction]);

  const handleTouchStart = useCallback((e) => {
    if (disabled) return;

    const touch = e.touches[0];
    const startPosition = {
      x: touch.clientX,
      y: touch.clientY
    };

    setStartPos(startPosition);
    setCurrentPos(startPosition);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(true);
    setTargetIndex(itemIndex);

    // Add dragging class to body to prevent scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    e.preventDefault();
  }, [disabled, itemIndex]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || disabled) return;

    const touch = e.touches[0];
    const currentPosition = {
      x: touch.clientX,
      y: touch.clientY
    };

    setCurrentPos(currentPosition);

    const deltaX = currentPosition.x - startPos.x;
    const deltaY = currentPosition.y - startPos.y;
    const primaryDelta = direction === 'vertical' ? deltaY : deltaX;

    setDragOffset({ x: deltaX, y: deltaY });

    // Calculate target index
    const newTargetIndex = calculateTargetIndex(primaryDelta);
    setTargetIndex(newTargetIndex);

    // Apply visual feedback to the dragged element
    if (elementRef.current) {
      const transform = direction === 'vertical'
        ? `translateY(${deltaY}px)`
        : `translateX(${deltaX}px)`;

      elementRef.current.style.transform = transform;
      elementRef.current.style.zIndex = '1000';
      elementRef.current.style.opacity = '0.9';
      elementRef.current.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.25)';
      elementRef.current.style.scale = '1.05';
      elementRef.current.style.transition = 'none';
    }

    // Trigger real-time reordering for visual feedback
    if (newTargetIndex !== itemIndex && onReorder) {
      onReorder({
        itemId,
        fromIndex: itemIndex,
        toIndex: newTargetIndex,
        isDragging: true, // Flag to indicate this is a preview
        direction: primaryDelta < 0 ? (direction === 'vertical' ? 'up' : 'left') : (direction === 'vertical' ? 'down' : 'right')
      });
    }

    e.preventDefault();
  }, [isDragging, disabled, startPos, direction, calculateTargetIndex, itemIndex, itemId, onReorder]);

  const handleTouchEnd = useCallback((e) => {
    if (!isDragging || disabled) return;

    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;
    const primaryDelta = direction === 'vertical' ? deltaY : deltaX;

    // Reset body scroll
    document.body.style.overflow = '';
    document.body.style.touchAction = '';

    // Reset visual state with smooth transition
    if (elementRef.current) {
      elementRef.current.style.transition = 'all 0.3s cubic-bezier(0.2, 0, 0, 1)';
      elementRef.current.style.transform = '';
      elementRef.current.style.zIndex = '';
      elementRef.current.style.opacity = '';
      elementRef.current.style.boxShadow = '';
      elementRef.current.style.scale = '';

      // Clean up transition after animation
      setTimeout(() => {
        if (elementRef.current) {
          elementRef.current.style.transition = '';
        }
      }, 300);
    }

    // Final reorder if we moved significantly
    if (Math.abs(primaryDelta) > threshold && targetIndex !== null && targetIndex !== itemIndex && onReorder) {
      onReorder({
        itemId,
        fromIndex: itemIndex,
        toIndex: targetIndex,
        isDragging: false, // Final reorder
        direction: primaryDelta < 0 ? (direction === 'vertical' ? 'up' : 'left') : (direction === 'vertical' ? 'down' : 'right')
      });
    }

    // Reset state
    setIsDragging(false);
    setStartPos({ x: 0, y: 0 });
    setCurrentPos({ x: 0, y: 0 });
    setDragOffset({ x: 0, y: 0 });
    setTargetIndex(null);
  }, [isDragging, disabled, currentPos, startPos, threshold, targetIndex, itemIndex, itemId, onReorder, direction]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`md:hidden ${className} ${isDragging ? 'select-none' : ''}`}
      style={{
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      <div
        ref={elementRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: 'none',
          userSelect: 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MobileDragWrapper;