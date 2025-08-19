// components/newsfeed/create/PostUploadStep.jsx - Final upload step for news feed
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Check, X, AlertCircle, Scissors, Image, Loader2 } from 'lucide-react';
import { processAndUploadPhoto } from '../../../services/photoService';
import { useAuth } from '../../../contexts/AuthContext';

const PostUploadStep = ({ formData, onComplete, onCancel }) => {
  const [uploadProgress, setUploadProgress] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false); // Add this to prevent double completion

  const { currentUser } = useAuth();
  const files = formData.files || [];
  const uploadStartedRef = useRef(false); // Add ref to track if upload has started

  // Initialize upload progress tracking
  useEffect(() => {
    const progressArray = files.map((file, index) => ({
      id: file.id,
      fileName: file.fileName,
      status: 'waiting', // waiting, processing, uploading, success, error
      progress: 0,
      error: null,
      wasProcessed: file.editData?.isProcessed || false,
      wasCropped: file.editData?.croppedBlob && !file.editData?.skipEditing
    }));
    setUploadProgress(progressArray);
  }, [files]);

  // Start upload automatically when component mounts - but only once
  useEffect(() => {
    if (files.length > 0 && !hasStarted && !uploadStartedRef.current) {
      uploadStartedRef.current = true; // Mark as started immediately
      startUpload();
    }
  }, [files, hasStarted]);

  // Calculate overall progress
  useEffect(() => {
    if (uploadProgress.length > 0) {
      const totalProgress = uploadProgress.reduce((sum, item) => sum + item.progress, 0);
      setOverallProgress(Math.round(totalProgress / uploadProgress.length));
    }
  }, [uploadProgress]);

  // Start upload process
  const startUpload = async () => {
    if (isUploading || files.length === 0 || hasStarted) {
      console.log('🚫 Upload already in progress or conditions not met', {
        isUploading,
        filesLength: files.length,
        hasStarted
      });
      return;
    }

    console.log('🚀 Starting upload process with files:', files);
    console.log('🔍 First file structure:', {
      file: files[0],
      hasOriginalFile: !!files[0]?.originalFile,
      originalFileType: files[0]?.originalFile?.constructor?.name,
      hasEditData: !!files[0]?.editData,
      hasCroppedBlob: !!files[0]?.editData?.croppedBlob
    });

    setIsUploading(true);
    setHasStarted(true);
    const results = [];

    try {
      // Process files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        console.log('🔍 Processing file:', {
          fileName: file.fileName,
          hasOriginalFile: !!file.originalFile,
          hasEditData: !!file.editData,
          isProcessed: file.editData?.isProcessed,
          hasCroppedBlob: !!file.editData?.croppedBlob,
          skipEditing: file.editData?.skipEditing
        });

        // Determine which file to upload (cropped or original)
        let fileToUpload;
        let uploadMetadata = {
          title: file.metadata?.title || '',
          description: file.metadata?.description || '',
          originalFileName: file.fileName,
          wasEdited: false,
          aspectRatio: 'original'
        };

        if (file.editData?.isProcessed && file.editData?.croppedBlob && !file.editData?.skipEditing) {
          // Use cropped version
          fileToUpload = file.editData.croppedBlob;
          uploadMetadata.wasEdited = true;
          uploadMetadata.aspectRatio = file.editData.aspectRatio || 'custom';
          console.log('🔍 Using cropped version for', file.fileName);
        } else if (file.originalFile) {
          // Use original file
          fileToUpload = file.originalFile;
          uploadMetadata.wasEdited = false;
          console.log('📷 Using original file for', file.fileName);
        } else {
          console.error('⚠️ No file data available for', file.fileName);
          // Update status: error
          setUploadProgress(prev => prev.map(item =>
            item.id === file.id ? {
              ...item,
              status: 'error',
              progress: 0,
              error: 'No file data available'
            } : item
          ));
          continue;
        }

        // Validate fileToUpload
        if (!fileToUpload) {
          console.error('⚠️ fileToUpload is null/undefined for', file.fileName);
          setUploadProgress(prev => prev.map(item =>
            item.id === file.id ? {
              ...item,
              status: 'error',
              progress: 0,
              error: 'File data missing'
            } : item
          ));
          continue;
        }

        // Check if it's a valid File or Blob
        if (!(fileToUpload instanceof File) && !(fileToUpload instanceof Blob)) {
          console.error('⚠️ fileToUpload is not a File or Blob:', typeof fileToUpload, fileToUpload);
          setUploadProgress(prev => prev.map(item =>
            item.id === file.id ? {
              ...item,
              status: 'error',
              progress: 0,
              error: 'Invalid file format'
            } : item
          ));
          continue;
        }

        console.log('✅ File validation passed:', {
          fileName: file.fileName,
          fileToUploadType: fileToUpload.constructor.name,
          size: fileToUpload.size,
          type: fileToUpload.type
        });

        // Update status: processing
        setUploadProgress(prev => prev.map(item =>
          item.id === file.id ? { ...item, status: 'processing', progress: 25 } : item
        ));

        // Update status: uploading
        setUploadProgress(prev => prev.map(item =>
          item.id === file.id ? { ...item, status: 'uploading', progress: 50 } : item
        ));

        try {
          console.log('📤 Uploading file:', {
            fileName: file.fileName,
            wasEdited: uploadMetadata.wasEdited,
            userId: currentUser.uid
          });

          // Upload the file
          const result = await processAndUploadPhoto(
            fileToUpload,
            currentUser.uid,
            'newsfeed', // Use 'newsfeed' as projectId to satisfy validation
            'newsfeed',
            null // No assignment ID for news feed posts
          );

          console.log('📊 Upload result:', result);

          if (result.success) {
            // Update status: success
            setUploadProgress(prev => prev.map(item =>
              item.id === file.id ? { ...item, status: 'success', progress: 100 } : item
            ));

            // Add to results with enhanced metadata
            results.push({
              downloadURL: result.downloadURL,
              storagePath: result.storagePath,
              metadata: {
                ...uploadMetadata,
                metadata: {
                  fileSize: fileToUpload.size || file.fileSize,
                  fileType: fileToUpload.type || file.fileType,
                  uploadedAt: new Date().toISOString()
                }
              }
            });
          } else {
            // Update status: error
            setUploadProgress(prev => prev.map(item =>
              item.id === file.id ? {
                ...item,
                status: 'error',
                progress: 0,
                error: result.error || 'Upload failed'
              } : item
            ));
          }
        } catch (error) {
          console.error('⚠️ Upload error:', error);

          // Update status: error
          setUploadProgress(prev => prev.map(item =>
            item.id === file.id ? {
              ...item,
              status: 'error',
              progress: 0,
              error: error.message || 'Upload failed'
            } : item
          ));
        }
      }

      setUploadResults(results);

      console.log('✅ All uploads complete. Results:', results);

      // Auto-complete if all successful - but only once
      if (results.length === files.length && !hasCompleted) {
        setHasCompleted(true);
        setTimeout(() => {
          onComplete(results);
        }, 1500);
      }

    } catch (error) {
      console.error('Upload process failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const successCount = uploadProgress.filter(item => item.status === 'success').length;
  const errorCount = uploadProgress.filter(item => item.status === 'error').length;
  const completedCount = successCount + errorCount;

  // Get processing statistics
  const processingStats = {
    total: files.length,
    cropped: files.filter(f => f.editData?.croppedBlob && !f.editData?.skipEditing).length,
    original: files.filter(f => f.editData?.skipEditing || !f.editData?.isProcessed).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Upload className="mx-auto mb-4 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {completedCount === files.length ? 'Upload Complete!' : 'Uploading Your Post...'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {completedCount === files.length
            ? 'Your post is ready to be shared with the community'
            : 'Please wait while we process and upload your photos'
          }
        </p>
      </div>

      {/* Processing Summary */}
      <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
        <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-3">Upload Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {processingStats.total}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              Total Photos
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200 flex items-center justify-center gap-1">
              <Scissors size={14} />
              {processingStats.cropped}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              Cropped
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200 flex items-center justify-center gap-1">
              <Image size={14} />
              {processingStats.original}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              Original
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Overall Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {completedCount} / {files.length}
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <div className="text-center">
          {completedCount === files.length ? (
            errorCount === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                🎉 All photos uploaded successfully!
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium text-sm">
                ⚠️ {successCount} successful, {errorCount} failed
              </span>
            )
          ) : (
            <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
              Uploading photos... {overallProgress}%
            </span>
          )}
        </div>
      </div>

      {/* Individual File Progress */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Photo Upload Details
        </h4>
        {uploadProgress.map((item) => (
          <UploadProgressItem key={item.id} item={item} />
        ))}
      </div>

      {/* Post Details Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Post Details
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Caption: </span>
            <span className="text-gray-900 dark:text-white">
              {formData.caption ?
                (formData.caption.length > 60 ? formData.caption.substring(0, 60) + '...' : formData.caption)
                : 'No caption'
              }
            </span>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">Tags: </span>
              <span className="text-gray-900 dark:text-white">
                {formData.tags.slice(0, 3).map(tag => `#${tag}`).join(', ')}
                {formData.tags.length > 3 && ` +${formData.tags.length - 3} more`}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-600 dark:text-gray-400">Visibility: </span>
            <span className="text-gray-900 dark:text-white">Friends Only</span>
          </div>
        </div>
      </div>

      {/* Actions for completed upload */}
      {completedCount === files.length && !hasCompleted && (
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          {errorCount > 0 && (
            <button
              onClick={() => {
                // Reset failed uploads for retry
                setUploadProgress(prev => prev.map(item =>
                  item.status === 'error'
                    ? { ...item, status: 'waiting', progress: 0, error: null }
                    : item
                ));
                setHasStarted(false);
                setIsUploading(false);
                setUploadResults([]);
                setHasCompleted(false);
                uploadStartedRef.current = false;
              }}
              className="btn-tertiary btn-md"
            >
              Retry Failed
            </button>
          )}
          <button
            onClick={() => {
              if (!hasCompleted) {
                setHasCompleted(true);
                onComplete(uploadResults);
              }
            }}
            className="btn-primary btn-md flex-1"
          >
            <Check size={16} />
            Share Post
          </button>
        </div>
      )}

      {/* Cancel option (only while uploading) */}
      {isUploading && completedCount < files.length && (
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-gray-500 dark:text-gray-400 hover:underline text-sm"
          >
            Cancel Upload
          </button>
        </div>
      )}
    </div>
  );
};

// Individual upload progress item
const UploadProgressItem = ({ item }) => (
  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-40">
          {item.fileName}
        </span>

        {/* Processing badges */}
        {item.wasCropped && (
          <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Scissors size={10} />
            Cropped
          </div>
        )}
        {item.wasProcessed && !item.wasCropped && (
          <div className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Image size={10} />
            Original
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {item.status === 'success' && (
          <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
        )}
        {item.status === 'error' && (
          <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
        )}
        {(item.status === 'processing' || item.status === 'uploading') && (
          <Loader2 size={16} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
        )}
      </div>
    </div>

    <div className="mb-2">
      <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
        <span className="capitalize">
          {item.status === 'processing' ? 'Processing...' :
           item.status === 'uploading' ? 'Uploading...' :
           item.status === 'success' ? 'Complete' :
           item.status === 'error' ? 'Failed' :
           'Waiting...'}
        </span>
        <span>{item.progress}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            item.status === 'success' ? 'bg-emerald-500' :
            item.status === 'error' ? 'bg-red-500' :
            'bg-indigo-500'
          }`}
          style={{ width: `${item.progress}%` }}
        />
      </div>
    </div>

    {item.error && (
      <div className="text-xs text-red-600 dark:text-red-400">
        {item.error}
      </div>
    )}
  </div>
);

export default PostUploadStep;