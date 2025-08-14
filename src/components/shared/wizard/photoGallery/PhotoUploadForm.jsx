// components/shared/wizard/photoGallery/PhotoUploadForm.jsx - Remove data usage displays
import React, { useState, useEffect } from 'react';
import { Upload, Check, X, AlertCircle } from 'lucide-react';
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
      error: null
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
        const fileToUpload = file.editData?.croppedBlob || file.originalFile;

        // Update status: processing
        setUploadProgress(prev => prev.map(item =>
          item.id === file.id ? { ...item, status: 'processing', progress: 25 } : item
        ));

        // Update status: uploading
        setUploadProgress(prev => prev.map(item =>
          item.id === file.id ? { ...item, status: 'uploading', progress: 50 } : item
        ));

        try {
          // DEBUG LOG - About to upload
          console.log('📤 About to upload:', {
            fileName: file.fileName,
            fileToUpload: fileToUpload,
            userId: currentUser.uid,
            projectId,
            photoType,
            assignmentId
          });

          // Upload the file
          const result = await processAndUploadPhoto(
            fileToUpload,
            currentUser.uid,
            projectId,
            photoType,
            assignmentId
          );

          // DEBUG LOG - Upload result
          console.log('📊 Upload result:', result);

          if (result.success) {
            // Update status: success
            setUploadProgress(prev => prev.map(item =>
              item.id === file.id ? { ...item, status: 'success', progress: 100 } : item
            ));

            // Add to results with metadata
            results.push({
              downloadURL: result.downloadURL,
              storagePath: result.storagePath,
              metadata: {
                title: file.metadata?.title || file.fileName.replace(/\.[^/.]+$/, ''),
                description: file.metadata?.description || '',
                originalFileName: file.fileName,
                wasEdited: file.editData?.croppedBlob && !file.editData?.skipEditing,
                aspectRatio: file.editData?.aspectRatio || 'original'
              }
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
          // DEBUG LOG - Upload error
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

      // DEBUG LOG - All uploads complete
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

  return (
    <div className="space-y-6">
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

// Individual upload progress item - removed file size display
const UploadProgressItem = ({ item }) => (
  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
        {item.fileName}
      </span>
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