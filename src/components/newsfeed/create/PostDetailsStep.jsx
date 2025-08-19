// components/newsfeed/create/PostDetailsStep.jsx - Post details and visibility step
import React, { useState, useEffect } from 'react';
import { Type, Hash, Globe, Users, Lock, Info } from 'lucide-react';

const PostDetailsStep = ({ formData, onDetailsUpdated }) => {
  const [caption, setCaption] = useState(formData.caption || '');
  const [tags, setTags] = useState(formData.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState(formData.visibility || 'public');

  // Character limit for caption
  const CAPTION_LIMIT = 2000;

  // Update parent component when data changes
  useEffect(() => {
    onDetailsUpdated({
      caption,
      tags,
      visibility
    });
  }, [caption, tags, visibility, onDetailsUpdated]);

  // Handle tag input
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    if (newTag && !(tags || []).includes(newTag) && (tags || []).length < 10) {
      setTags([...(tags || []), newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags((tags || []).filter(tag => tag !== tagToRemove));
  };

  // Visibility options
  const visibilityOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone can see this post',
      icon: Globe,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      value: 'friends',
      label: 'Friends Only',
      description: 'Only your friends can see this post',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Only you can see this post',
      icon: Lock,
      color: 'text-gray-600 dark:text-gray-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Caption Section */}
      <div>
        <label className="form-label flex items-center gap-2">
          <Type size={16} />
          Caption
        </label>
        <textarea
          value={caption}
          onChange={(e) => {
            if (e.target.value.length <= CAPTION_LIMIT) {
              setCaption(e.target.value);
            }
          }}
          placeholder="Share the story behind your work... What techniques did you use? What inspired this piece?"
          className="form-textarea"
          rows="4"
          maxLength={CAPTION_LIMIT}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="form-help">
            Describe your work, techniques used, or inspiration
          </p>
          <span className={`text-xs ${
            caption.length > CAPTION_LIMIT * 0.9 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {caption.length}/{CAPTION_LIMIT}
          </span>
        </div>
      </div>

      {/* Tags Section */}
      <div>
        <label className="form-label flex items-center gap-2">
          <Hash size={16} />
          Tags (Optional)
        </label>

        {/* Tag Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              onBlur={addTag}
              placeholder="Add tags (e.g., spacemarines, painting, weathering)"
              className="form-input flex-1"
              maxLength={20}
              disabled={(tags || []).length >= 10}
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim() || (tags || []).length >= 10}
              className="btn-secondary btn-md"
            >
              Add
            </button>
          </div>

          {/* Current Tags */}
          {(tags || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(tags || []).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="form-help">
            Add up to 10 tags to help others discover your work. Press Enter or comma to add.
          </p>
        </div>
      </div>

      {/* Visibility Section */}
      <div>
        <label className="form-label flex items-center gap-2">
          <Globe size={16} />
          Who can see this post?
        </label>

        <div className="space-y-3">
          {visibilityOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = visibility === option.value;

            return (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="form-radio mt-1"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent size={18} className={option.color} />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Visibility Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-800 dark:text-blue-300 font-medium mb-1">
                Privacy Note
              </p>
              <p className="text-blue-700 dark:text-blue-400">
                {visibility === 'public' && "Public posts can be seen by anyone in the community and may appear in discovery feeds."}
                {visibility === 'friends' && "Friends-only posts are visible to people you've connected with and will appear in their feeds."}
                {visibility === 'private' && "Private posts are only visible to you and won't appear in any feeds except your own profile."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Post Summary
        </h4>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <p>• Caption: {caption.length > 0 ? `${caption.length} characters` : 'Not added'}</p>
          <p>• Tags: {(tags || []).length > 0 ? `${(tags || []).length} tag${(tags || []).length !== 1 ? 's' : ''}` : 'None'}</p>
          <p>• Visibility: {visibilityOptions.find(opt => opt.value === visibility)?.label}</p>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsStep;