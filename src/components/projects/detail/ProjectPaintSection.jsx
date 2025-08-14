// components/projects/detail/ProjectPaintSection.jsx
import React from 'react';
import PaintOverview from '../PaintOverview';

const ProjectPaintSection = ({ project, handlers, className = "mb-6" }) => {
  const {
    handlePaintsAdded,
    handlePaintRemoved,
  } = handlers;

  return (
    <PaintOverview
      projectData={project}
      onPaintsAdded={handlePaintsAdded}
      onPaintRemoved={handlePaintRemoved}
      className={className}
    />
  );
};

export default ProjectPaintSection;