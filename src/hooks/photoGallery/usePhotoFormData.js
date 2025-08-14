// hooks/photoGallery/usePhotoFormData.js - Photo data state management
import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const usePhotoFormData = () => {
  const [formData, setFormData] = useState({
    files: [] // Array of file objects with metadata
  });

  // File object structure:
  // {
  //   id: string,
  //   originalFile: File,
  //   fileName: string,
  //   fileSize: number,
  //   fileType: string,
  //   previewUrl: string,
  //   editData: {
  //     isProcessed: boolean,
  //     skipEditing: boolean,
  //     croppedBlob: Blob | null,
  //     croppedPreviewUrl: string | null,
  //     aspectRatio: string,
  //     cropSettings: object
  //   },
  //   metadata: {
  //     title: string,
  //     description: string
  //   },
  //   uploadData: {
  //     isUploaded: boolean,
  //     downloadURL: string | null,
  //     storagePath: string | null,
  //     uploadProgress: number,
  //     uploadError: string | null
  //   }
  // }

  // Add new files to the wizard
  const addFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: uuidv4(),
      originalFile: file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      previewUrl: URL.createObjectURL(file),
      editData: {
        isProcessed: false,
        skipEditing: false,
        croppedBlob: null,
        croppedPreviewUrl: null,
        aspectRatio: 'original',
        cropSettings: null
      },
      metadata: {
        title: '',
        description: ''
      },
      uploadData: {
        isUploaded: false,
        downloadURL: null,
        storagePath: null,
        uploadProgress: 0,
        uploadError: null
      }
    }));

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));

    return newFiles.map(f => f.id); // Return IDs for reference
  }, []);

  // Remove a file from the wizard
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
  }, []);

  // Update file edit data (cropping results) - RENAMED for consistency
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
  }, []);

  // Update file metadata (title, description)
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
  }, []);

  // Update upload progress and results
  const updateFileUpload = useCallback((fileId, uploadData) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.id === fileId
          ? {
              ...file,
              uploadData: {
                ...file.uploadData,
                ...uploadData
              }
            }
          : file
      )
    }));
  }, []);

  // Batch update metadata for multiple files
  const batchUpdateMetadata = useCallback((metadata) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file => ({
        ...file,
        metadata: {
          ...file.metadata,
          ...metadata
        }
      }))
    }));
  }, []);

  // Mark file as processed (skip editing)
  const markFileAsProcessed = useCallback((fileId, skipEditing = false) => {
    updateFileEditData(fileId, {
      isProcessed: true,
      skipEditing
    });
  }, [updateFileEditData]);

  // Mark all files as processed (skip editing for all)
  const markAllFilesAsProcessed = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file => ({
        ...file,
        editData: {
          ...file.editData,
          isProcessed: true,
          skipEditing: true
        }
      }))
    }));
  }, []);

  // Clear all data (for cancellation) - RENAMED for consistency
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
  }, [formData.files]);

  // Get data for upload processing
  const getUploadData = useCallback(() => {
    return {
      files: formData.files.map(file => ({
        id: file.id,
        originalFile: file.originalFile,
        fileName: file.fileName,
        processedBlob: file.editData?.croppedBlob || file.originalFile,
        metadata: {
          title: file.metadata.title.trim() || file.fileName.replace(/\.[^/.]+$/, ''), // Default to filename without extension
          description: file.metadata.description.trim(),
          originalFileName: file.fileName,
          fileSize: file.fileSize,
          fileType: file.fileType,
          wasEdited: file.editData?.isProcessed && !file.editData?.skipEditing,
          aspectRatio: file.editData?.aspectRatio || 'original'
        }
      }))
    };
  }, [formData.files]);

  // Validation helpers
  const isDataValid = useMemo(() => {
    const files = formData.files || [];

    // Must have at least one file
    if (files.length === 0) return false;

    // All files must have valid data
    return files.every(file => {
      // Must have original file
      if (!file.originalFile) return false;

      // If editing is processed, must have valid result
      if (file.editData?.isProcessed && !file.editData?.skipEditing) {
        if (!file.editData?.croppedBlob) return false;
      }

      return true;
    });
  }, [formData.files]);

  // Statistics
  const getStats = useMemo(() => {
    const files = formData.files || [];

    return {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.fileSize, 0),
      processedFiles: files.filter(f => f.editData?.isProcessed).length,
      filesWithMetadata: files.filter(f =>
        f.metadata?.title ||
        f.metadata?.description
      ).length,
      uploadedFiles: files.filter(f => f.uploadData?.isUploaded).length,
      hasErrors: files.some(f => f.uploadData?.uploadError)
    };
  }, [formData.files]);

  // Get file by ID
  const getFileById = useCallback((fileId) => {
    return formData.files.find(f => f.id === fileId);
  }, [formData.files]);

  // Get files by status
  const getFilesByStatus = useCallback((status) => {
    switch (status) {
      case 'unprocessed':
        return formData.files.filter(f => !f.editData?.isProcessed);
      case 'processed':
        return formData.files.filter(f => f.editData?.isProcessed);
      case 'uploaded':
        return formData.files.filter(f => f.uploadData?.isUploaded);
      case 'failed':
        return formData.files.filter(f => f.uploadData?.uploadError);
      default:
        return formData.files;
    }
  }, [formData.files]);

  return {
    // State
    formData,

    // File management
    addFiles,
    removeFile,

    // Edit operations
    updateFileEditData, // RENAMED for consistency with wizard
    markFileAsProcessed,
    markAllFilesAsProcessed,

    // Metadata operations
    updateFileMetadata,
    batchUpdateMetadata,

    // Upload operations
    updateFileUpload,

    // Utility functions
    clearForm, // RENAMED for consistency with wizard
    getUploadData,
    getFileById,
    getFilesByStatus,

    // Validation and stats
    isDataValid,
    getStats
  };
};