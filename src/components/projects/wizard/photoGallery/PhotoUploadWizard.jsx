// components/shared/wizard/photoGallery/PhotoUploadWizard.jsx - Simplified mode only
import React, { useState, useEffect } from 'react';
import { addProjectPhotosById, updateProjectCoverPhoto } from '../../../../services/projects/features/projectPhotos.js';
import { processAndUploadPhoto } from '../../../../services/photoService';
import { useAuth } from '../../../../contexts/AuthContext';
import { usePhotoFormData } from '../../../../hooks/photoGallery/usePhotoFormData';
import PhotoSelectForm from './PhotoSelectForm';

const PhotoUploadWizard = ({
  onComplete,
  onCancel,
  projectId,
  projectData,
  photoType = 'project',
  maxPhotos = 10,
  enableCropping = true,
  mode = 'standalone' // 'standalone', 'project-creation', or 'simplified'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { currentUser } = useAuth();
  const { formData, addFiles, removeFile, updateFileMetadata, updateFileEditData, clearForm } = usePhotoFormData();

  // Handle file selection
  const handleFilesSelected = (files) => {
    addFiles(files);
  };

  // Handle file removal
  const handleFileRemoved = (fileId) => {
    removeFile(fileId);
  };

  // Handle file editing
  const handleFileEdited = (fileId, editData) => {
    updateFileEditData(fileId, editData);
  };

  // Handle metadata updates
  const handleMetadataUpdated = (fileId, metadata) => {
    updateFileMetadata(fileId, metadata);
  };

  // SIMPLIFIED MODE: Handle direct upload
  const handleSimplifiedUpload = async () => {
    if (formData.files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadResults = [];

      for (const file of formData.files) {
        // Determine which file to upload (cropped or original)
        let fileToUpload;
        let uploadMetadata = {
          title: file.metadata?.title || file.fileName.replace(/\.[^/.]+$/, ''),
          description: file.metadata?.description || '',
          originalFileName: file.fileName,
          wasEdited: false,
          aspectRatio: 'original'
        };

        if (file.editData?.croppedBlob) {
          // Use cropped version
          fileToUpload = file.editData.croppedBlob;
          uploadMetadata.wasEdited = true;
          uploadMetadata.aspectRatio = file.editData.aspectRatio || 'custom';
        } else {
          // Use original file
          fileToUpload = file.originalFile;
        }

        try {
          // Upload the file
          const result = await processAndUploadPhoto(
            fileToUpload,
            currentUser.uid,
            projectId,
            photoType
          );

          if (result.success) {
            uploadResults.push({
              url: result.downloadURL,
              title: uploadMetadata.title,
              description: uploadMetadata.description,
              originalFileName: uploadMetadata.originalFileName,
              uploadedAt: new Date().toISOString(),
              wasEdited: uploadMetadata.wasEdited,
              aspectRatio: uploadMetadata.aspectRatio
            });
          }
        } catch (error) {
          console.error('Upload error:', error);
        }
      }

      // Handle upload completion based on mode
      if (mode === 'project-creation') {
        clearForm();
        onComplete(uploadResults);
      } else {
        // Standalone mode - add to existing project
        await addProjectPhotosById(projectId, uploadResults);

        // Set cover photo if none exists
        if (!projectData.coverPhotoURL && uploadResults.length > 0) {
          await updateProjectCoverPhoto(projectId, uploadResults[0].url);
        }

        clearForm();
        onComplete(uploadResults.map(r => ({ downloadURL: r.url })));
      }
    } catch (error) {
      console.error('Simplified upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // For simplified mode, just show PhotoSelectForm
  return (
    <PhotoSelectForm
      formData={formData}
      onFilesSelected={handleFilesSelected}
      onFileRemoved={handleFileRemoved}
      onMetadataUpdated={handleMetadataUpdated}
      onFileEdited={handleFileEdited}
      onUpload={handleSimplifiedUpload}
      maxPhotos={maxPhotos}
      projectData={projectData}
      mode="simplified"
      isUploading={isUploading}
    />
  );
};

export default PhotoUploadWizard;