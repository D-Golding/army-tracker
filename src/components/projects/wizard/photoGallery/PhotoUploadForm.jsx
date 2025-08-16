// components/shared/wizard/photoGallery/PhotoUploadForm.jsx - Updated for new crop step flow
import React, { useState, useEffect } from 'react';
import { Upload, Check, X, AlertCircle, Scissors, Image } from 'lucide-react';
import { processAndUploadPhoto } from '../../../../services/photoService';
import { useAuth } from '../../../../contexts/AuthContext';

const PhotoUploadForm = ({
  formData,
  projectId,
  photoType,
  assignmentId,
  onComplete,
  onCancel
}) => {
  const [uploadProgress, setUploadProgress] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);

  const { currentUser } = useAuth();
  const files = formData.files || [];

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

  // Start upload automatically when component mounts
  useEffect(() => {
    if (files.length > 0 && !hasStarted) {
      startUpload();
    }
  }, [files, hasStarted]);

  // Start upload process
  const startUpload = async () => {
    if (isUploading || files.length === 0) return;

    setIsUploading(true);
    setHasStarted(true);
    const results = [];

    try {
      // Process files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Determine which file to upload (cropped or original)
        let fileToUpload;
        let uploadMetadata = {
          title: file.metadata?.title || file.fileName.replace(/\.[^/.]+$/, ''),
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
        } else {
          // Use original file
          fileToUpload = file.originalFile;
          uploadMetadata.wasEdited = false;
        }

        // Update status: processing
        setUploadProgress(prev => prev.map(item =>
          item.id === file.id ? { ...item, status: 'processing', progress: 25 } : item
        ));

        // Update status: uploading
        setUploadProgress(prev => prev.map(item =>
          item.id === file.id ? { ...item, status: 'uploading', progress: 50 } : item
        ));

        try {
          console.log('📤 About to upload:', {
            fileName: file.fileName,
            fileToUpload: fileToUpload,
            userId: currentUser.uid,
            projectId,
            photoType,
            assignmentId,
            wasEdited: uploadMetadata.wasEdited
          });

          // Upload the file
          const result = await processAndUploadPhoto(
            fileToUpload,
            currentUser.uid,
            projectId,
            photoType,
            assignmentId
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
              metadata: uploadMetadata
            });
          } else {
            // Update status: error
            setUploadProgress(prev => prev.map(item =>
              item.id === file.id ? {
                ...item,
                status: 'error',
                progress: 0,
                error: result.error
              } : item
            ));
          }
        } catch (error) {
          console.error('❌ Upload error:', error);

          // Update status: error
          setUploadProgress(prev => prev.map(item =>
            item.id === file.id ? {
              ...item,
              status: 'error',
              progress: 0,
              error: error.message
            } : item
          ));
        }
      }

      setUploadResults(results);

      console.log('✅ All uploads complete. Results:', results);

      // Auto-complete if all successful
      if (results.length === files.length) {
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
  const overallProgress = files.length > 0 ? (completedCount / files.length) * 100 : 0;

  // Get processing statistics
  const processingStats = {
    total: files.length,
    cropped: files.filter(f => f.editData?.croppedBlob && !f.editData?.skipEditing).length,
    original: files.filter(f => f.editData?.skipEditing || !f.editData?.isProcessed).length
  };

  return (
    <div className="space-y-6">
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
            Upload Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {completedCount} / {files.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        {completedCount === files.length && (
          <div className="mt-2 text-sm text-center">
            {errorCount === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                All photos uploaded successfully!
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {successCount} successful, {errorCount} failed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Individual File Progress */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {uploadProgress.map((item) => (
          <UploadProgressItem key={item.id} item={item} />
        ))}
      </div>

      {/* Actions for completed upload */}
      {completedCount === files.length && (
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
              }}
              className="btn-tertiary btn-md"
            >
              Retry Failed
            </button>
          )}
          <button
            onClick={() => onComplete(uploadResults)}
            className="btn-primary btn-md flex-1"
          >
            <Check size={16} />
            Complete
          </button>
        </div>
      )}

      {/* Cancel option (only while uploading) */}
      {isUploading && (
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
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {item.fileName}
        </span>
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
      </div>
    </div>

    <div className="mb-2">
      <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
        <span className="capitalize">{item.status}</span>
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

export default PhotoUploadForm;