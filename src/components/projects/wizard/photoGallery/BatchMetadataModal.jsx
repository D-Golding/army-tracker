// components/shared/wizard/photoGallery/BatchMetadataModal.jsx - Batch metadata editing modal
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const BatchMetadataModal = ({
  isOpen,
  onClose,
  onApply,
  totalFiles
}) => {
  const [batchMetadata, setBatchMetadata] = useState({
    label: '',
    description: '',
    tags: []
  });

  if (!isOpen) return null;

  // Handle metadata field updates
  const handleFieldUpdate = (field, value) => {
    setBatchMetadata(prev => ({ ...prev, [field]: value }));
  };

  // Handle tag addition
  const handleAddTag = (newTag) => {
    if (!batchMetadata.tags.includes(newTag)) {
      setBatchMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagIndex) => {
    setBatchMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== tagIndex)
    }));
  };

  // Handle apply and close
  const handleApply = () => {
    onApply(batchMetadata);
    setBatchMetadata({ label: '', description: '', tags: [] });
  };

  // Handle close and reset
  const handleClose = () => {
    setBatchMetadata({ label: '', description: '', tags: [] });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Batch Edit Details
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <div className="text-blue-800 dark:text-blue-300 text-sm">
              <div className="font-medium mb-1">Apply to all photos</div>
              <p>These details will be added to all {totalFiles} photos. Individual photo details will be preserved if they already exist.</p>
            </div>
          </div>

          {/* Batch Label */}
          <div>
            <label className="form-label">
              Common Label
            </label>
            <input
              type="text"
              value={batchMetadata.label}
              onChange={(e) => handleFieldUpdate('label', e.target.value)}
              className="form-input"
              placeholder="e.g., Work in progress, Final result"
            />
          </div>

          {/* Batch Description */}
          <div>
            <label className="form-label">
              Common Description
            </label>
            <textarea
              value={batchMetadata.description}
              onChange={(e) => handleFieldUpdate('description', e.target.value)}
              className="form-textarea"
              placeholder="Description that applies to all photos..."
              rows="3"
            />
          </div>

          {/* Batch Tags */}
          <div>
            <label className="form-label">
              Common Tags
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {batchMetadata.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(index)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-200"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tags (press Enter)"
              className="form-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleAddTag(e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <button
            onClick={handleClose}
            className="btn-tertiary btn-md flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="btn-primary btn-md flex-1"
          >
            <Check size={16} />
            Apply to All
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchMetadataModal;