// components/newsfeed/create/PostReviewStep.jsx - Final review before posting
import React from 'react';
import { Check, Edit, Camera, Type, Hash, Users, Scissors, Image } from 'lucide-react';

const PostReviewStep = ({ formData, onEditStep }) => {
  const files = formData.files || [];

  const stats = {
    totalFiles: files.length,
    processedFiles: files.filter(f => f.editData?.isProcessed).length,
    croppedFiles: files.filter(f => f.editData?.isProcessed && f.editData?.croppedBlob && !f.editData?.skipEditing).length,
    originalFiles: files.filter(f => f.editData?.isProcessed && f.editData?.skipEditing).length,
    filesWithTitles: files.filter(f => f.metadata?.title && f.metadata.title.trim()).length,
    filesWithDescriptions: files.filter(f => f.metadata?.description && f.metadata.description.trim()).length
  };

  // Get caption preview (first 100 chars)
  const captionPreview = formData.caption ?
    (formData.caption.length > 100 ? formData.caption.substring(0, 100) + '...' : formData.caption)
    : '';

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Check className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Review Your Post
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review everything before sharing with the community
        </p>
      </div>

      {/* Post Preview Card */}
      <div className="card-base card-padding">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Post Preview
        </h4>

        {/* Mock post header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">You</span>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white text-sm">Your Name</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Just now</div>
          </div>
        </div>

        {/* Caption preview */}
        {formData.caption && (
          <div className="mb-4">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {captionPreview}
            </p>
            {formData.caption.length > 100 && (
              <button className="text-indigo-600 dark:text-indigo-400 text-sm mt-1">
                See more
              </button>
            )}
          </div>
        )}

        {/* Photo grid preview */}
        {files.length > 0 && (
          <div className="mb-4">
            {files.length === 1 ? (
              // Single photo
              <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 max-w-md mx-auto">
                <img
                  src={files[0].editData?.croppedPreviewUrl || files[0].previewUrl}
                  alt="Post preview"
                  className="w-full h-auto object-cover"
                />
              </div>
            ) : (
              // Multiple photos grid
              <div className={`grid gap-1 rounded-xl overflow-hidden ${
                files.length === 2 ? 'grid-cols-2' :
                files.length === 3 ? 'grid-cols-2' :
                files.length === 4 ? 'grid-cols-2' :
                'grid-cols-3'
              }`}>
                {files.slice(0, files.length === 3 ? 3 : 4).map((file, index) => (
                  <div
                    key={file.id}
                    className={`relative bg-gray-100 dark:bg-gray-700 ${
                      files.length === 3 && index === 0 ? 'row-span-2' : 'aspect-square'
                    }`}
                  >
                    <img
                      src={file.editData?.croppedPreviewUrl || file.previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 3 && files.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <span className="text-white font-semibold">+{files.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags preview */}
        {formData.tags && formData.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="badge-primary text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mock engagement */}
        <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
              <span className="text-sm">0</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
              <span className="text-sm">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
        <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-3">Post Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {stats.totalFiles}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              Total Photos
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {stats.croppedFiles}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              Cropped
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
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {formData.tags?.length || 0}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              Tags
            </div>
          </div>
        </div>
      </div>

      {/* Review Sections */}
      <div className="space-y-4">

        {/* Photos Review */}
        <ReviewSection
          title="Photos"
          icon={Camera}
          count={stats.totalFiles}
          onEdit={() => onEditStep(1)}
        >
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {files.slice(0, 20).map((file) => {
              const previewUrl = file.editData?.croppedPreviewUrl || file.previewUrl;
              const wasProcessed = file.editData?.isProcessed;
              const wasCropped = file.editData?.croppedBlob && !file.editData?.skipEditing;

              return (
                <div key={file.id} className="relative aspect-square rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={previewUrl}
                    alt={file.fileName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Processing indicator */}
                  {wasProcessed && (
                    <div className="absolute top-1 right-1">
                      {wasCropped ? (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Cropped"></div>
                      ) : (
                        <div className="w-2 h-2 bg-gray-500 rounded-full" title="Original"></div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {files.length > 20 && (
              <div className="aspect-square rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  +{files.length - 20}
                </span>
              </div>
            )}
          </div>

          {stats.processedFiles < stats.totalFiles && (
            <div className="mt-3 text-sm text-amber-600 dark:text-amber-400">
              ⚠️ {stats.totalFiles - stats.processedFiles} photo{stats.totalFiles - stats.processedFiles !== 1 ? 's' : ''} still need processing
            </div>
          )}
        </ReviewSection>

        {/* Photo Details Review */}
        <ReviewSection
          title="Photo Details"
          icon={Type}
          count={stats.filesWithTitles + stats.filesWithDescriptions}
          onEdit={() => onEditStep(3)}
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

        {/* Post Details Review */}
        <ReviewSection
          title="Post Details"
          icon={Hash}
          count={1}
          onEdit={() => onEditStep(4)}
        >
          <div className="space-y-3">
            {/* Caption */}
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Caption:</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {formData.caption ? (
                  <span className="whitespace-pre-wrap">{captionPreview}</span>
                ) : (
                  <span className="italic">No caption added</span>
                )}
              </div>
            </div>

            {/* Tags */}
            {formData.tags && formData.tags.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tags:</div>
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="badge-primary text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Visibility */}
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Visibility:</div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users size={14} />
                <span>Friends Only</span>
              </div>
            </div>
          </div>
        </ReviewSection>
      </div>

      {/* Processing Check */}
      {stats.processedFiles < stats.totalFiles && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="text-amber-800 dark:text-amber-300 text-sm">
            <div className="font-medium mb-2">⚠️ Action Required</div>
            <p className="mb-3">
              You have {stats.totalFiles - stats.processedFiles} photo{stats.totalFiles - stats.processedFiles !== 1 ? 's' : ''} that haven't been processed yet.
              Go back to the "Edit Photos" step to crop or skip them before posting.
            </p>
            <button
              onClick={() => onEditStep(2)}
              className="btn-primary btn-sm"
            >
              <Scissors size={14} />
              Process Photos
            </button>
          </div>
        </div>
      )}

      {/* Ready Message */}
      {stats.processedFiles === stats.totalFiles && formData.caption?.trim() && (
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-emerald-600 dark:text-emerald-400 font-medium mb-2 flex items-center justify-center gap-2">
            <Check size={16} />
            Ready to share your post!
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click "Share Post" to upload and share your {stats.totalFiles} photo{stats.totalFiles !== 1 ? 's' : ''} with the community
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

export default PostReviewStep;