// hooks/usePostFormData.js - Form data management for create post wizard
import { useState } from 'react';
import { processAndUploadPhoto } from '../services/photoService';

export const usePostFormData = () => {
  const [formData, setFormData] = useState({
    // Photo files
    files: [],

    // Post data
    caption: '',
    tags: [],
    visibility: 'friends' // Default to friends
  });

  // Add files to the form
  const addFiles = (newFiles) => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  // Remove a file
  const removeFile = (fileId) => {
    setFormData(prev => {
      // Clean up preview URLs
      const fileToRemove = prev.files.find(f => f.id === fileId);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      if (fileToRemove?.editData?.croppedPreviewUrl) {
        URL.revokeObjectURL(fileToRemove.editData.croppedPreviewUrl);
      }

      return {
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      };
    });
  };

  // Update file metadata (title, description)
  const updateFileMetadata = (fileId, metadata) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.id === fileId
          ? { ...file, metadata: { ...file.metadata, ...metadata } }
          : file
      )
    }));
  };

  // Update file edit data (cropping results)
  const updateFileEditData = (fileId, editData) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.id === fileId
          ? { ...file, editData: { ...file.editData, ...editData } }
          : file
      )
    }));
  };

  // Update post data (caption, tags, visibility)
  const updatePostData = (data) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  // Check if we can proceed to a specific step
  const canProceedToStep = (step) => {
    switch (step) {
      case 1: // Photo selection step
        return true; // Can always start
      case 2: // Details step
        return formData.files.length > 0; // Need at least one photo
      case 3: // Privacy step
        return formData.files.length > 0; // Need at least one photo
      case 4: // Final submission
        return formData.files.length > 0 && formData.caption?.trim().length > 0;
      default:
        return false;
    }
  };

  // Prepare data for submission
  const getSubmissionData = async () => {
    // Upload all photos first
    const photoResults = [];

    for (const file of formData.files) {
      // Determine which file to upload (cropped or original)
      let fileToUpload;
      if (file.editData?.croppedBlob) {
        fileToUpload = file.editData.croppedBlob;
      } else {
        fileToUpload = file.originalFile;
      }

      try {
        const result = await processAndUploadPhoto(
          fileToUpload,
          // These will be passed from the component using this hook
          null, // userId - will be set by the calling component
          'newsfeed', // projectId
          'newsfeed' // type
        );

        if (result.success) {
          photoResults.push({
            imageUrl: result.downloadURL,
            storagePath: result.storagePath,
            originalFileName: file.fileName,
            title: file.metadata?.title || '',
            description: file.metadata?.description || '',
            aspectRatio: file.editData?.aspectRatio || 'original',
            wasEdited: !!file.editData?.croppedBlob,
            order: photoResults.length,
            metadata: result.metadata || {}
          });
        }
      } catch (error) {
        console.error('Photo upload failed:', error);
        throw error;
      }
    }

    // Return the complete post data
    return {
      content: formData.caption.trim(),
      photos: photoResults,
      tags: formData.tags || [],
      visibility: formData.visibility || 'friends'
    };
  };

  // Clear all form data
  const clearForm = () => {
    // Clean up preview URLs
    formData.files.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      if (file.editData?.croppedPreviewUrl) {
        URL.revokeObjectURL(file.editData.croppedPreviewUrl);
      }
    });

    setFormData({
      files: [],
      caption: '',
      tags: [],
      visibility: 'friends'
    });
  };

  return {
    formData,
    addFiles,
    removeFile,
    updateFileMetadata,
    updateFileEditData,
    updatePostData,
    canProceedToStep,
    getSubmissionData,
    clearForm
  };
};