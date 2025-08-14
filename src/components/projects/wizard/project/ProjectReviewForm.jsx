// components/projects/wizard/ProjectReviewForm.jsx - Review and summary form step
import React from 'react';
import { Check, Edit, FileText, Palette, Camera, Star, Calendar } from 'lucide-react';

const ProjectReviewForm = ({
  formData,
  onEditStep
}) => {
  // Format date for European display (DD/MM/YYYY)
  const formatDateEuropean = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  // Get final values for display
  const getFinalManufacturer = () => {
    return formData.manufacturer === 'custom'
      ? formData.customManufacturer
      : formData.manufacturer;
  };

  const getFinalGame = () => {
    return formData.game === 'custom'
      ? formData.customGame
      : formData.game;
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      beginner: 'Beginner - Simple techniques',
      intermediate: 'Intermediate - Multiple techniques',
      advanced: 'Advanced - Complex techniques',
      expert: 'Expert - Master-level work'
    };
    return labels[difficulty] || difficulty;
  };

  const getStatusBadge = (status) => {
    const badges = {
      collection: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      wishlist: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      listed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return badges[status] || badges.listed;
  };

  const getStatusLabel = (status) => {
    const labels = {
      collection: 'Owned',
      wishlist: 'Wishlist',
      listed: 'Reference'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Check className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Review Your Project
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review your project details before creating
        </p>
      </div>

      {/* Project Details */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
            <FileText size={16} className="mr-2" />
            Project Details
          </h4>
          <button
            onClick={() => onEditStep(0)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm flex items-center gap-1"
          >
            <Edit size={12} />
            Edit
          </button>
        </div>
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name: </span>
            <span className="text-sm text-gray-900 dark:text-white">{formData.name}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty: </span>
            <span className="text-sm text-gray-900 dark:text-white">{getDifficultyLabel(formData.difficulty)}</span>
          </div>
          {getFinalManufacturer() && (
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manufacturer: </span>
              <span className="text-sm text-gray-900 dark:text-white">{getFinalManufacturer()}</span>
            </div>
          )}
          {getFinalGame() && (
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Game: </span>
              <span className="text-sm text-gray-900 dark:text-white">{getFinalGame()}</span>
            </div>
          )}
          {formData.description && (
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description: </span>
              <span className="text-sm text-gray-900 dark:text-white">{formData.description}</span>
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created: </span>
            <span className="text-sm text-gray-900 dark:text-white">
              <Calendar size={12} className="inline mr-1" />
              {formatDateEuropean(new Date().toISOString())}
            </span>
          </div>
        </div>
      </div>

      {/* Paint Selection */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
            <Palette size={16} className="mr-2" />
            Paint Selection ({formData.selectedPaints.length})
          </h4>
          <button
            onClick={() => onEditStep(1)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm flex items-center gap-1"
          >
            <Edit size={12} />
            Edit
          </button>
        </div>
        {formData.selectedPaints.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No paints selected</p>
        ) : (
          <div className="space-y-2">
            {formData.selectedPaints.slice(0, 5).map((paint) => (
              <div key={paint.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{paint.name}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadge(paint.status)}`}>
                    {getStatusLabel(paint.status)}
                  </span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {paint.brand} • {paint.type}
                </span>
              </div>
            ))}
            {formData.selectedPaints.length > 5 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                +{formData.selectedPaints.length - 5} more paint{formData.selectedPaints.length - 5 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Project Photos */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
            <Camera size={16} className="mr-2" />
            Project Photos ({formData.uploadedPhotos.length})
          </h4>
          <button
            onClick={() => onEditStep(2)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm flex items-center gap-1"
          >
            <Edit size={12} />
            Edit
          </button>
        </div>
        {formData.uploadedPhotos.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No photos uploaded</p>
        ) : (
          <div className="space-y-3">
            {/* Cover Photo Info */}
            {formData.coverPhotoURL && (
              <div className="flex items-center gap-2 text-sm">
                <Star size={14} className="text-yellow-500" />
                <span className="text-gray-700 dark:text-gray-300">Cover photo selected</span>
              </div>
            )}

            {/* Photo Grid Preview */}
            <div className="grid grid-cols-4 gap-2">
              {formData.uploadedPhotos.slice(0, 8).map((photoUrl, index) => (
                <div key={photoUrl} className="relative aspect-square rounded overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {photoUrl === formData.coverPhotoURL && (
                    <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
                      <Star size={8} />
                    </div>
                  )}
                </div>
              ))}
              {formData.uploadedPhotos.length > 8 && (
                <div className="aspect-square rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    +{formData.uploadedPhotos.length - 8}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
        <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-3">Project Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {formData.selectedPaints.length}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              Paint{formData.selectedPaints.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {formData.uploadedPhotos.length}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              Photo{formData.uploadedPhotos.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              {formData.difficulty}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              Difficulty
            </div>
          </div>
        </div>
      </div>

      {/* Ready to Create */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-emerald-600 dark:text-emerald-400 font-medium mb-2">
          ✅ Ready to create your project!
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Click "Create Project" to add this project to your collection
        </p>
      </div>
    </div>
  );
};

export default ProjectReviewForm;