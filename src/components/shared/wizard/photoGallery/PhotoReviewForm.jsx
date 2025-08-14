// components/shared/wizard/photoGallery/PhotoReviewForm.jsx - Simplified review without file size
import React from 'react';
import { Check, Edit, Camera, FileText, Upload } from 'lucide-react';

const PhotoReviewForm = ({
  formData,
  onEditStep,
  enableCropping,
  projectData
}) => {
  const files = formData.files || [];

  const stats = {
    totalFiles: files.length,
    editedFiles: files.filter(f => f.editData?.croppedBlob && !f.editData?.skipEditing).length,
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
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {stats.totalFiles}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              Photo{stats.totalFiles !== 1 ? 's' : ''}
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {stats.editedFiles}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              Edited
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {stats.filesWithTitles}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              With Titles
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

        {/* Photo Editing Review */}
        {enableCropping && (
          <ReviewSection
            title="Photo Editing"
            icon={Edit}
            count={stats.editedFiles}
            onEdit={() => onEditStep(1)}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stats.editedFiles > 0 ? (
                <span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {stats.editedFiles}
                  </span> photo{stats.editedFiles !== 1 ? 's' : ''} edited, {' '}
                  <span className="font-medium">
                    {stats.totalFiles - stats.editedFiles}
                  </span> original{stats.totalFiles - stats.editedFiles !== 1 ? 's' : ''}
                </span>
              ) : (
                <span>All photos will be uploaded as originals</span>
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
              </div>
            ) : (
              <span>No titles or descriptions added</span>
            )}
          </div>
        </ReviewSection>
      </div>

      {/* Ready Message */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-emerald-600 dark:text-emerald-400 font-medium mb-2 flex items-center justify-center gap-2">
          <Upload size={16} />
          Ready to upload your photos!
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Click "Start Upload" to process and upload your {stats.totalFiles} photo{stats.totalFiles !== 1 ? 's' : ''}
        </p>
      </div>
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