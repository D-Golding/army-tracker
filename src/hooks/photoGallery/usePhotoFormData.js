// hooks/usePhotoFormData.js - Updated for mixed photo/video support
import { useState, useCallback } from 'react';

export const usePhotoFormData = () => {
  const [formData, setFormData] = useState({
    files: [],
    caption: '',
    tags: [],
    visibility: 'public',
    copyrightAccepted: false
  });

  // Generate unique ID for files
  const generateFileId = () => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Create preview URL for a file
  const createPreviewUrl = (file) => {
    try {
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Error creating preview URL:', error);
      return null;
    }
  };

  // Add files to the form data
  const addFiles = useCallback((newFiles) => {
    if (!newFiles || newFiles.length === 0) return;

    // Files come pre-processed from MediaSelectionStep with type already set
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));

    console.log('📁 Added files to form data:', newFiles.map(f => `${f.fileName} (${f.type})`));
  }, []);

  // Remove a file from the form data
  const removeFile = useCallback((fileId) => {
    setFormData(prev => {
      const fileToRemove = prev.files.find(f => f.id === fileId);

      // Clean up preview URLs to prevent memory leaks
      if (fileToRemove) {
        if (fileToRemove.previewUrl) {
          URL.revokeObjectURL(fileToRemove.previewUrl);
        }
        if (fileToRemove.editData?.processedPreviewUrl) {
          URL.revokeObjectURL(fileToRemove.editData.processedPreviewUrl);
        }
      }

      return {
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      };
    });

    console.log('🗑️ Removed file from form data:', fileId);
  }, []);

  // Update file metadata
  const updateFileMetadata = useCallback((fileId, metadata) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.id === fileId
          ? {
              ...file,
              metadata: {
                ...file.metadata,
                ...metadata
              }
            }
          : file
      )
    }));

    console.log('🏷️ Updated file metadata:', fileId, metadata);
  }, []);

  // Update file edit data (for cropping/trimming)
  const updateFileEditData = useCallback((fileId, editData) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.id === fileId
          ? {
              ...file,
              editData: {
                ...file.editData,
                ...editData
              }
            }
          : file
      )
    }));

    console.log('✂️ Updated file edit data:', fileId, editData);
  }, []);

  // Update post data (caption, tags, etc.)
  const updatePostData = useCallback((data) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));

    console.log('📝 Updated post data:', data);
  }, []);

  // Get files by type
  const getFilesByType = useCallback((type) => {
    return formData.files.filter(f => f.type === type);
  }, [formData.files]);

  // Get files by processing status
  const getFilesByStatus = useCallback((status) => {
    switch (status) {
      case 'unprocessed':
        return formData.files.filter(f => !f.editData?.isProcessed);
      case 'processed':
        return formData.files.filter(f => f.editData?.isProcessed);
      case 'edited':
        return formData.files.filter(f => f.editData?.isProcessed && !f.editData?.skipEditing);
      case 'original':
        return formData.files.filter(f => f.editData?.isProcessed && f.editData?.skipEditing);
      default:
        return formData.files;
    }
  }, [formData.files]);

  // Check if all files are processed (ready for upload)
  const areAllFilesProcessed = useCallback(() => {
    if (formData.files.length === 0) return true;
    return formData.files.every(f => f.editData?.isProcessed === true);
  }, [formData.files]);

  // Get processing statistics
  const getProcessingStats = useCallback(() => {
    const total = formData.files.length;
    const processed = formData.files.filter(f => f.editData?.isProcessed).length;
    const photos = formData.files.filter(f => f.type === 'photo').length;
    const videos = formData.files.filter(f => f.type === 'video').length;
    const edited = formData.files.filter(f => f.editData?.isProcessed && !f.editData?.skipEditing).length;

    return {
      total,
      processed,
      unprocessed: total - processed,
      photos,
      videos,
      edited,
      progressPercentage: total > 0 ? (processed / total) * 100 : 0
    };
  }, [formData.files]);

  // Clear all form data
  const clearForm = useCallback(() => {
    // Clean up all preview URLs
    formData.files.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      if (file.editData?.processedPreviewUrl) {
        URL.revokeObjectURL(file.editData.processedPreviewUrl);
      }
    });

    setFormData({
      files: [],
      caption: '',
      tags: [],
      visibility: 'public',
      copyrightAccepted: false
    });

    console.log('🧹 Cleared form data');
  }, [formData.files]);

  // Reset processing for all files
  const resetProcessing = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file => {
        // Clean up processed preview URL if it exists
        if (file.editData?.processedPreviewUrl) {
          URL.revokeObjectURL(file.editData.processedPreviewUrl);
        }

        return {
          ...file,
          editData: {
            isProcessed: false,
            skipEditing: false,
            processedBlob: null,
            processedPreviewUrl: null,
            trimData: file.type === 'video' ? { start: 0, end: 0 } : null,
            aspectRatio: 'original'
          }
        };
      })
    }));

    console.log('🔄 Reset processing for all files');
  }, []);

  // Auto-process all files (skip editing for all)
  const autoProcessAllFiles = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file => ({
        ...file,
        editData: {
          ...file.editData,
          isProcessed: true,
          skipEditing: true,
          processedBlob: null,
          processedPreviewUrl: null,
          trimData: null,
          aspectRatio: 'original'
        }
      }))
    }));

    console.log('⭐ Auto-processed all files (skipped editing)');
  }, []);

  // Validate form data for submission
  const validateFormData = useCallback(() => {
    const errors = [];

    // Check we have files
    if (formData.files.length === 0) {
      errors.push('No files selected');
    }

    // Check caption
    if (!formData.caption || !formData.caption.trim()) {
      errors.push('Caption is required');
    }

    // Check copyright acceptance
    if (!formData.copyrightAccepted) {
      errors.push('You must accept the copyright terms');
    }

    // Check all files are processed
    if (!areAllFilesProcessed()) {
      errors.push('Some files still need to be processed');
    }

    // Validate individual files
    formData.files.forEach(file => {
      if (!file.originalFile) {
        errors.push(`${file.fileName}: Missing original file`);
      }
      if (!file.id) {
        errors.push(`${file.fileName}: Missing file ID`);
      }
      if (!file.previewUrl && !file.editData?.processedPreviewUrl) {
        errors.push(`${file.fileName}: Missing preview URL`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [formData, areAllFilesProcessed]);

  // Check if we can proceed to next step
  const canProceedToStep = useCallback((step) => {
    switch (step) {
      case 1: // Selection step
        return formData.files.length > 0;
      case 2: // Details step - need files and they should be processed
        return formData.files.length > 0 && areAllFilesProcessed();
      case 3: // Privacy step - need caption too
        return formData.files.length > 0 &&
               areAllFilesProcessed() &&
               formData.caption?.trim().length > 0;
      case 4: // Ready to submit
        return validateFormData().isValid;
      default:
        return false;
    }
  }, [formData, areAllFilesProcessed, validateFormData]);

  // Get submission data (prepared for upload)
  const getSubmissionData = useCallback(async () => {
    const validation = validateFormData();
    if (!validation.isValid) {
      throw new Error(`Form validation failed: ${validation.errors.join(', ')}`);
    }

    // Prepare files for upload
    const preparedFiles = formData.files.map(file => {
      const fileToUpload = file.editData?.processedBlob || file.originalFile;

      return {
        id: file.id,
        type: file.type,
        file: fileToUpload,
        metadata: file.metadata,
        editData: file.editData,
        originalName: file.fileName
      };
    });

    return {
      files: preparedFiles,
      caption: formData.caption.trim(),
      tags: formData.tags || [],
      visibility: formData.visibility || 'public'
    };
  }, [formData, validateFormData]);

  return {
    // Form data
    formData,
    setFormData,

    // File operations
    addFiles,
    removeFile,
    updateFileMetadata,
    updateFileEditData,

    // Post data operations
    updatePostData,

    // File queries
    getFilesByType,
    getFilesByStatus,
    areAllFilesProcessed,
    getProcessingStats,

    // Step validation
    canProceedToStep,

    // Form operations
    clearForm,
    resetProcessing,
    autoProcessAllFiles,
    validateFormData,
    getSubmissionData
  };
};