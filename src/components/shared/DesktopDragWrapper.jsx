// components/shared/DesktopDragWrapper.jsx
import React from 'react';

const DesktopDragWrapper = ({
  children,
  itemId,
  onDragStart,
  onDragOver,
  onDrop,
  dragData = null,
  className = '',
  disabled = false
}) => {
  const handleDragStart = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';

    // Store additional data if provided
    if (dragData) {
      e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    }

    if (onDragStart) {
      onDragStart(e, itemId);
    }
  };

  const handleDragOver = (e) => {
    if (disabled) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (onDragOver) {
      onDragOver(e, itemId);
    }
  };

  const handleDrop = (e) => {
    if (disabled) return;

    e.preventDefault();
    const draggedItemId = e.dataTransfer.getData('text/plain');

    let draggedData = null;
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      if (jsonData) {
        draggedData = JSON.parse(jsonData);
      }
    } catch (err) {
      // Ignore JSON parsing errors
    }

    if (onDrop) {
      onDrop(e, { draggedItemId, targetItemId: itemId, draggedData });
    }
  };

  return (
    <div
      className={`hidden md:block ${className}`}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

export default DesktopDragWrapper;