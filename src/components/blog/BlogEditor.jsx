// components/blog/BlogEditor.jsx - Blog post creation and editing interface
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Eye,
  ArrowLeft,
  Image,
  X,
  Upload,
  Tag,
  Calendar,
  FileText,
  Globe,
  Edit
} from 'lucide-react';
import {
  createBlogPost,
  updateBlogPost,
  getBlogPost,
  uploadBlogImage,
  BLOG_CATEGORIES,
  BLOG_TAGS
} from '../../services/blogService';
import { useAuth } from '../../contexts/AuthContext';

const BlogEditor = ({ mode = 'create' }) => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    status: 'draft',
    featured: false,
    featuredImage: '',
    images: []
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Load existing post for editing
  useEffect(() => {
    if (mode === 'edit' && postId) {
      loadPost();
    }
  }, [mode, postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const result = await getBlogPost(postId);

      if (result.success) {
        setFormData({
          title: result.post.title || '',
          excerpt: result.post.excerpt || '',
          content: result.post.content || '',
          category: result.post.category || '',
          tags: result.post.tags || [],
          status: result.post.status || 'draft',
          featured: result.post.featured || false,
          featuredImage: result.post.featuredImage || '',
          images: result.post.images || []
        });
      } else {
        setError('Failed to load post');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file, type = 'gallery') => {
    if (!file) return;

    try {
      setUploading(true);
      const tempPostId = postId || `temp_${Date.now()}`;
      const result = await uploadBlogImage(file, tempPostId);

      if (result.success) {
        if (type === 'featured') {
          setFormData(prev => ({
            ...prev,
            featuredImage: result.url
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, {
              url: result.url,
              path: result.path,
              caption: ''
            }]
          }));
        }
      } else {
        setError('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index, type = 'gallery') => {
    if (type === 'featured') {
      setFormData(prev => ({
        ...prev,
        featuredImage: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageCaptionChange = (index, caption) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === index ? { ...img, caption } : img
      )
    }));
  };

  const handleTagAdd = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleSave = async (status = formData.status) => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const postData = {
        ...formData,
        status,
        authorName: currentUser.displayName || 'Admin'
      };

      let result;
      if (mode === 'edit' && postId) {
        result = await updateBlogPost(postId, postData);
      } else {
        result = await createBlogPost(postData, currentUser.uid);
      }

      if (result.success) {
        if (status === 'published') {
          navigate('/app/admin/blog');
        } else {
          // Stay on editor for drafts
          if (mode === 'create') {
            navigate(`/app/admin/blog/edit/${result.id}`);
          }
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setError('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!formData.title.trim()) {
      setError('Please add a title to preview');
      return;
    }
    setPreviewMode(!previewMode);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (previewMode) {
    return (
      <BlogPreview
        post={formData}
        onClose={() => setPreviewMode(false)}
        onEdit={() => setPreviewMode(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app/admin/blog')}
              className="btn-tertiary btn-sm"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'edit' ? 'Edit Post' : 'Create New Post'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreview}
              className="btn-tertiary btn-sm"
              disabled={!formData.title.trim()}
            >
              <Eye size={16} />
              Preview
            </button>

            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="btn-secondary btn-sm"
            >
              {saving ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Draft
                </>
              )}
            </button>

            <button
              onClick={() => handleSave('published')}
              disabled={saving || !formData.title.trim()}
              className="btn-primary btn-sm"
            >
              <Globe size={16} />
              Publish
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label className="form-label">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter your blog post title..."
                className="form-input text-lg font-semibold"
                maxLength={100}
              />
              <p className="form-help">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="form-label">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Brief description of your post..."
                className="form-textarea"
                rows="3"
                maxLength={300}
              />
              <p className="form-help">
                {formData.excerpt.length}/300 characters - appears in post previews
              </p>
            </div>

            {/* Featured Image */}
            <div>
              <label className="form-label">Featured Image</label>
              {formData.featuredImage ? (
                <div className="relative">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveImage(0, 'featured')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Click to upload featured image
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Recommended: 1200x630px, max 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'featured')}
                className="hidden"
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="form-label">Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your blog post content here... You can use HTML for formatting."
                className="form-textarea"
                rows="20"
                style={{ minHeight: '400px' }}
              />
              <p className="form-help">
                Supports HTML formatting. Use proper heading tags (h2, h3) for structure.
              </p>
            </div>

            {/* Additional Images */}
            <div>
              <label className="form-label">Gallery Images</label>
              <div className="space-y-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex gap-4">
                      <img
                        src={image.url}
                        alt={`Gallery ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={image.caption}
                          onChange={(e) => handleImageCaptionChange(index, e.target.value)}
                          placeholder="Image caption (optional)"
                          className="form-input mb-2"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="btn-danger btn-sm"
                        >
                          <X size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => document.getElementById('gallery-upload').click()}
                  disabled={uploading}
                  className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
                >
                  {uploading ? (
                    <>
                      <div className="loading-spinner mx-auto mb-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Image className="w-6 h-6 mx-auto mb-2" />
                      Add Gallery Image
                    </>
                  )}
                </button>
                <input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'gallery')}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Post Settings */}
            <div className="card-base card-padding">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Post Settings
              </h3>

              {/* Category */}
              <div className="mb-4">
                <label className="form-label">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Category</option>
                  {Object.entries(BLOG_CATEGORIES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="form-select"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Featured */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="form-checkbox"
                  />
                  <span className="form-label mb-0">Featured Post</span>
                </label>
                <p className="form-help">
                  Featured posts appear prominently on the blog
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="card-base card-padding">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Tags
              </h3>

              {/* Add Tag */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add a tag..."
                    className="form-input flex-1"
                    maxLength={20}
                  />
                  <button
                    onClick={handleTagAdd}
                    disabled={!tagInput.trim() || formData.tags.length >= 10}
                    className="btn-secondary btn-sm"
                  >
                    Add
                  </button>
                </div>
                <p className="form-help">
                  {formData.tags.length}/10 tags
                </p>
              </div>

              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Current Tags:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded-lg text-sm"
                      >
                        #{tag}
                        <button
                          onClick={() => handleTagRemove(tag)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Tags */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Popular Tags:
                </p>
                <div className="flex flex-wrap gap-1">
                  {Object.values(BLOG_TAGS).slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (!formData.tags.includes(tag) && formData.tags.length < 10) {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag]
                          }));
                        }
                      }}
                      disabled={formData.tags.includes(tag) || formData.tags.length >= 10}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Blog Preview Component
const BlogPreview = ({ post, onClose, onEdit }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Preview Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Preview Mode
          </h1>
          <div className="flex gap-2">
            <button onClick={onEdit} className="btn-secondary btn-sm">
              <Edit size={16} />
              Edit
            </button>
            <button onClick={onClose} className="btn-tertiary btn-sm">
              <X size={16} />
              Close
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="card-base card-padding">
          {/* Category */}
          {post.category && (
            <div className="mb-4">
              <span className="badge-blue capitalize">{post.category}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-6">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="text-lg text-gray-600 dark:text-gray-400 mb-6 italic border-l-4 border-indigo-500 pl-4">
              {post.excerpt}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Gallery Images */}
          {post.images && post.images.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Gallery
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.images.map((image, index) => (
                  <div key={index}>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={image.url}
                        alt={image.caption || `Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.caption && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span key={index} className="badge-primary text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;