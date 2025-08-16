// components/shared/wizard/photoGallery/PhotoReviewForm.jsx - Updated for new crop step flow
import React from 'react';
import { Check, Edit, Camera, FileText, Upload, Scissors, Image } from 'lucide-react';

const PhotoReviewForm = ({
  formData,
  onEditStep,
  enableCropping,
  projectData
}) => {
  const files = formData.files || [];

  const stats = {
    totalFiles: files.length,
    processedFiles: files.filter(f => f.editData?.isProcessed).length,
    croppedFiles: files.filter(f => f.editData?.isProcessed && f.editData?.croppedBlob && !f.editData?.skipEditing).length,
    originalFiles: files.filter(f => f.editData?.isProcessed && f.editData?.skipEditing).length,
    filesWithTitles: files.filter(f => f.metadata?.title && f.metadata.title.trim()).length,
    filesWithDescriptions: files.filter(f => f.metadata?.description && f.metadata.description.trim()).length
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Check className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Review Your Photos
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review your photos and details before uploading
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
        <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-3">Upload Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {stats.totalFiles}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              Total Photos
            </div>
          </div>
          {enableCropping && (
            <div>
              <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
                {stats.croppedFiles}
              </div>
              <div className="text-xs text-indigo-700 dark:text-indigo-400">
                Cropped
              </div>
            </div>
          )}
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {stats.filesWithTitles}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              With Titles
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {stats.filesWithDescriptions}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              With Descriptions
            </div>
          </div>
        </div>
      </div>

      {/* Review Sections */}
      <div className="space-y-4">
        {/* Photo Selection Review */}
        <ReviewSection
          title="Selected Photos"
          icon={Camera}
          count={stats.totalFiles}
          onEdit={() => onEditStep(0)}
        >
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {files.slice(0, 16).map((file) => {
              const previewUrl = file.editData?.croppedPreviewUrl || file.previewUrl;
              return (
                <div key={file.id} className="aspect-square rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={previewUrl}
                    alt={file.fileName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              );
            })}
            {files.length > 16 && (
              <div className="aspect-square rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  +{files.length - 16}
                </span>
              </div>
            )}
          </div>
        </ReviewSection>

        {/* Photo Processing Review */}
        {enableCropping && (
          <ReviewSection
            title="Photo Processing"
            icon={Scissors}
            count={stats.processedFiles}
            onEdit={() => onEditStep(1)}
          >
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stats.processedFiles === stats.totalFiles ? (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Check size={16} />
                    <span>All photos processed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <span>⚠️ {stats.totalFiles - stats.processedFiles} photos still need processing</span>
                  </div>
                )}
              </div>

              {stats.processedFiles > 0 && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Scissors size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{stats.croppedFiles} cropped</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image size={14} className="text-gray-600 dark:text-gray-400" />
                    <span>{stats.originalFiles} kept as original</span>
                  </div>
                </div>
              )}
            </div>
          </ReviewSection>
        )}

        {/* Photo Details Review */}
        <ReviewSection
          title="Photo Details"
          icon={FileText}
          count={stats.filesWithTitles + stats.filesWithDescriptions}
          onEdit={() => onEditStep(enableCropping ? 2 : 1)}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {stats.filesWithTitles > 0 || stats.filesWithDescriptions > 0 ? (
              <div className="space-y-1">
                {stats.filesWithTitles > 0 && (
                  <div>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {stats.filesWithTitles}
                    </span> photo{stats.filesWithTitles !== 1 ? 's' : ''} have titles
                  </div>
                )}
                {stats.filesWithDescriptions > 0 && (
                  <div>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {stats.filesWithDescriptions}
                    </span> photo{stats.filesWithDescriptions !== 1 ? 's' : ''} have descriptions
                  </div>
                )}
                {stats.filesWithTitles === 0 && stats.filesWithDescriptions === 0 && (
                  <span>No titles or descriptions added</span>
                )}
              </div>
            ) : (
              <span>No titles or descriptions added</span>
            )}
          </div>
        </ReviewSection>
      </div>

      {/* Processing Status Check */}
      {enableCropping && stats.processedFiles < stats.totalFiles && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="text-amber-800 dark:text-amber-300 text-sm">
            <div className="font-medium mb-2">⚠️ Action Required</div>
            <p className="mb-3">
              You have {stats.totalFiles - stats.processedFiles} photo{stats.totalFiles - stats.processedFiles !== 1 ? 's' : ''} that haven't been processed yet.
              Go back to the "Edit Photos" step to crop or skip them before uploading.
            </p>
            <button
              onClick={() => onEditStep(1)}
              className="btn-primary btn-sm"
            >
              <Scissors size={14} />
              Process Photos
            </button>
          </div>
        </div>
      )}

      {/* Ready Message */}
      {(!enableCropping || stats.processedFiles === stats.totalFiles) && (
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-emerald-600 dark:text-emerald-400 font-medium mb-2 flex items-center justify-center gap-2">
            <Upload size={16} />
            Ready to upload your photos!
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click "Start Upload" to process and upload your {stats.totalFiles} photo{stats.totalFiles !== 1 ? 's' : ''} to the project
          </p>
        </div>
      )}
    </div>
  );
};

// Reusable review section component
const ReviewSection = ({ title, icon: Icon, count, onEdit, children }) => (
  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
        <Icon size={16} />
        {title} ({count})
      </h4>
      <button
        onClick={onEdit}
        className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm flex items-center gap-1"
      >
        <Edit size={12} />
        Edit
      </button>
    </div>
    {children}
  </div>
);

export default PhotoReviewForm;