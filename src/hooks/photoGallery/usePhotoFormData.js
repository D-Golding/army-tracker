// hooks/photoGallery/usePhotoFormData.js - Updated for new crop step flow
import { useState, useCallback } from 'react';

export const usePhotoFormData = () => {
  const [formData, setFormData] = useState({
    files: []
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

    const processedFiles = newFiles.map(file => {
      const fileId = generateFileId();
      const previewUrl = createPreviewUrl(file);

      return {
        id: fileId,
        originalFile: file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        previewUrl,
        metadata: {
          title: '',
          description: '',
          tags: []
        },
        editData: {
          isProcessed: false,
          skipEditing: false,
          croppedBlob: null,
          croppedPreviewUrl: null,
          aspectRatio: 'original',
          cropSettings: null
        }
      };
    });

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...processedFiles]
    }));

    console.log('📁 Added files to form data:', processedFiles.map(f => f.fileName));
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
        if (fileToRemove.editData?.croppedPreviewUrl) {
          URL.revokeObjectURL(fileToRemove.editData.croppedPreviewUrl);
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

  // Update file edit data (for cropping step)
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

  // Get files by processing status
  const getFilesByStatus = useCallback((status) => {
    switch (status) {
      case 'unprocessed':
        return formData.files.filter(f => !f.editData?.isProcessed);
      case 'processed':
        return formData.files.filter(f => f.editData?.isProcessed);
      case 'cropped':
        return formData.files.filter(f => f.editData?.isProcessed && f.editData?.croppedBlob && !f.editData?.skipEditing);
      case 'original':
        return formData.files.filter(f => f.editData?.isProcessed && f.editData?.skipEditing);
      default:
        return formData.files;
    }
  }, [formData.files]);

  // Check if all files are processed
  const areAllFilesProcessed = useCallback(() => {
    if (formData.files.length === 0) return true;
    return formData.files.every(f => f.editData?.isProcessed === true);
  }, [formData.files]);

  // Get processing statistics
  const getProcessingStats = useCallback(() => {
    const total = formData.files.length;
    const processed = formData.files.filter(f => f.editData?.isProcessed).length;
    const cropped = formData.files.filter(f => f.editData?.isProcessed && f.editData?.croppedBlob && !f.editData?.skipEditing).length;
    const original = formData.files.filter(f => f.editData?.isProcessed && f.editData?.skipEditing).length;

    return {
      total,
      processed,
      unprocessed: total - processed,
      cropped,
      original,
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
      if (file.editData?.croppedPreviewUrl) {
        URL.revokeObjectURL(file.editData.croppedPreviewUrl);
      }
    });

    setFormData({ files: [] });
    console.log('🧹 Cleared form data');
  }, [formData.files]);

  // Reset processing for all files (useful for re-editing)
  const resetProcessing = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file => {
        // Clean up cropped preview URL if it exists
        if (file.editData?.croppedPreviewUrl) {
          URL.revokeObjectURL(file.editData.croppedPreviewUrl);
        }

        return {
          ...file,
          editData: {
            isProcessed: false,
            skipEditing: false,
            croppedBlob: null,
            croppedPreviewUrl: null,
            aspectRatio: 'original',
            cropSettings: null
          }
        };
      })
    }));

    console.log('🔄 Reset processing for all files');
  }, []);

  // Auto-process all files (skip cropping for all)
  const autoProcessAllFiles = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file => ({
        ...file,
        editData: {
          ...file.editData,
          isProcessed: true,
          skipEditing: true,
          croppedBlob: null,
          croppedPreviewUrl: null,
          aspectRatio: 'original',
          cropSettings: null
        }
      }))
    }));

    console.log('⏭️ Auto-processed all files (skipped cropping)');
  }, []);

  // Validate form data
  const validateFormData = useCallback(() => {
    const errors = [];

    if (formData.files.length === 0) {
      errors.push('No files selected');
    }

    formData.files.forEach(file => {
      if (!file.originalFile) {
        errors.push(`${file.fileName}: Missing original file`);
      }
      if (!file.id) {
        errors.push(`${file.fileName}: Missing file ID`);
      }
      if (!file.previewUrl && !file.editData?.croppedPreviewUrl) {
        errors.push(`${file.fileName}: Missing preview URL`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [formData]);

  return {
    // Form data
    formData,
    setFormData,

    // File operations
    addFiles,
    removeFile,
    updateFileMetadata,
    updateFileEditData,

    // File queries
    getFilesByStatus,
    areAllFilesProcessed,
    getProcessingStats,

    // Form operations
    clearForm,
    resetProcessing,
    autoProcessAllFiles,
    validateFormData
  };
};