// components/shared/wizard/photoGallery/PhotoEditForm.jsx - Simplified for new flow
import React from 'react';
import { Edit, Check, ArrowRight } from 'lucide-react';

const PhotoEditForm = ({
  formData,
  onFileEdited,
  enableCropping = true,
  isLoading = false
}) => {
  const selectedFiles = formData.files || [];
  const unprocessedFiles = selectedFiles.filter(f => !f.editData?.isProcessed);
  const processedFiles = selectedFiles.filter(f => f.editData?.isProcessed);

  // This component is now essentially a redirect message since we have PhotoCropStep
  // But we keep it for backward compatibility and to show processing status

  // Auto-process if cropping disabled
  if (!enableCropping) {
    React.useEffect(() => {
      unprocessedFiles.forEach(file => {
        onFileEdited(file.id, {
          isProcessed: true,
          skipEditing: true,
          croppedBlob: null,
          croppedPreviewUrl: null,
          aspectRatio: 'original',
          cropSettings: null
        });
      });
    }, [unprocessedFiles.length]);

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Check className="mx-auto mb-2 text-emerald-600 dark:text-emerald-400" size={32} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Photos Processed
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All photos processed automatically (cropping disabled)
          </p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div className="text-emerald-800 dark:text-emerald-300 text-sm text-center">
            <Check className="mx-auto mb-2" size={24} />
            <div className="font-medium">All photos ready</div>
            <div>Photos will be uploaded in their original format</div>
          </div>
        </div>
      </div>
    );
  }

  // If cropping is enabled, this should redirect users to use the proper crop step
  // This is a fallback for any edge cases where this component is still rendered
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Edit className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Photo Editing
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Edit your photos in the dedicated editing step
        </p>
      </div>

      {/* Show current processing status */}
      <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
        <div className="text-indigo-800 dark:text-indigo-300 text-sm">
          <div className="font-medium mb-2">Photo Processing Status</div>
          <div className="space-y-1">
            <div>📸 Total photos: {selectedFiles.length}</div>
            <div>✅ Processed: {processedFiles.length}</div>
            <div>⏳ Remaining: {unprocessedFiles.length}</div>
          </div>
        </div>
      </div>

      {/* Show photo grid if we have processed photos */}
      {processedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Processed Photos ({processedFiles.length})
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {processedFiles.map((file) => {
              const previewUrl = file.editData?.croppedPreviewUrl || file.previewUrl;
              const wasEdited = file.editData?.croppedBlob && !file.editData?.skipEditing;

              return (
                <div key={file.id} className="relative">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <img
                      src={previewUrl}
                      alt={file.fileName}
                      className="w-full h-full object-cover"
                    />

                    {/* Status badge */}
                    <div className="absolute top-2 left-2">
                      {wasEdited ? (
                        <div className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                          <Edit size={10} />
                          Edited
                        </div>
                      ) : (
                        <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-lg">
                          Original
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate" title={file.fileName}>
                    {file.fileName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Message about dedicated crop step */}
      {unprocessedFiles.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="text-amber-800 dark:text-amber-300 text-sm">
            <div className="font-medium mb-2">⚠️ Photos Need Processing</div>
            <div className="mb-3">
              You have {unprocessedFiles.length} photo{unprocessedFiles.length !== 1 ? 's' : ''} that need{unprocessedFiles.length === 1 ? 's' : ''} to be processed.
              Use the dedicated photo editing step in the wizard flow.
            </div>
            <div className="flex items-center gap-2 text-xs">
              <ArrowRight size={14} />
              <span>Go back to the "Edit Photos" step to crop or skip photos</span>
            </div>
          </div>
        </div>
      )}

      {/* All processed - ready message */}
      {unprocessedFiles.length === 0 && processedFiles.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div className="text-emerald-800 dark:text-emerald-300 text-sm text-center">
            <Check className="mx-auto mb-2" size={24} />
            <div className="font-medium mb-1">All photos processed!</div>
            <div>Ready to proceed to the next step</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoEditForm;