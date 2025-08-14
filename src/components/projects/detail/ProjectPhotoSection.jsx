// components/projects/detail/ProjectPhotoSection.jsx - Pass metadata handler
import React from 'react';
import ProjectPhotoGallery from '../ProjectPhotoGallery';

const ProjectPhotoSection = ({ project, handlers, className = "mb-6" }) => {
  const {
    projectPhotos,
    handlePhotosUploaded,
    handlePhotoDeleted,
    handleCoverPhotoSet,
    handlePhotoMetadataUpdated, // NEW: Extract this from handlers
  } = handlers;

  return (
    <ProjectPhotoGallery
      projectData={project}
      projectPhotos={projectPhotos}
      onPhotosUploaded={handlePhotosUploaded}
      onPhotoDeleted={handlePhotoDeleted}
      onCoverPhotoSet={handleCoverPhotoSet}
      onPhotoMetadataUpdated={handlePhotoMetadataUpdated} // NEW: Pass this prop
      className={className}
    />
  );
};

export default ProjectPhotoSection;