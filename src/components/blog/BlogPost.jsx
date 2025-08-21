// components/blog/BlogPost.jsx - Fixed data access from service response
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Eye, Heart, MessageCircle, Tag, User, ArrowLeft, Share2 } from 'lucide-react';
import { getBlogPost, toggleBlogPostLike } from '../../services/blogService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import BlogComments from './BlogComments';

const BlogPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const result = await getBlogPost(postId);

      if (result.success) {
        setPost(result.post);
        // TODO: Check if user has liked this post from Firebase
        // For now, assume not liked
        setIsLiked(false);
        setError('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error loading post:', error);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser || liking) {
      return;
    }

    try {
      setLiking(true);

      const result = await toggleBlogPostLike(postId, currentUser.uid);
      console.log('Like result:', result);

      if (result && result.success) {
        // FIXED: Access data directly from result, not result.data
        setIsLiked(result.liked || false);

        // Update the post like count - use likeCount from result if available
        setPost(prev => ({
          ...prev,
          likeCount: result.likeCount !== undefined ? result.likeCount : prev.likeCount || 0
        }));

        console.log('Updated like state:', {
          liked: result.liked,
          count: result.likeCount
        });
      } else {
        console.error('Like toggle failed:', result);
        // Fallback: toggle local state
        setIsLiked(prev => {
          const newLiked = !prev;
          setPost(prevPost => ({
            ...prevPost,
            likeCount: (prevPost.likeCount || 0) + (newLiked ? 1 : -1)
          }));
          return newLiked;
        });
      }
    } catch (error) {
      console.error('Error in handleLike:', error);
      // Fallback: toggle local state
      setIsLiked(prev => {
        const newLiked = !prev;
        setPost(prevPost => ({
          ...prevPost,
          likeCount: Math.max(0, (prevPost.likeCount || 0) + (newLiked ? 1 : -1))
        }));
        return newLiked;
      });
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled or error occurred
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    try {
      const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      painting: 'badge-blue',
      tactics: 'badge-purple',
      reviews: 'badge-emerald',
      tutorials: 'badge-warning',
      news: 'badge-danger',
      showcase: 'badge-pink'
    };
    return badges[category] || 'badge-tertiary';
  };

  if (loading) {
    return (
      <div className="tab-nav-container">
        <div className="space-y-6">
          {/* Back button skeleton */}
          <div className="skeleton-text-md w-24 h-10"></div>

          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="skeleton-text-sm w-20"></div>
            <div className="skeleton-text-lg w-3/4"></div>
            <div className="skeleton-text-md w-1/2"></div>
          </div>

          {/* Image skeleton */}
          <div className="skeleton-image h-64"></div>

          {/* Content skeleton */}
          <div className="space-y-3">
            <div className="skeleton-text-sm w-full"></div>
            <div className="skeleton-text-sm w-full"></div>
            <div className="skeleton-text-sm w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="tab-nav-container">
        <div className="card-base card-padding text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Post not found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/app/blog')}
            className="btn-primary btn-md"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-nav-container">
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/app/blog')}
          className="btn-tertiary btn-sm"
        >
          <ArrowLeft size={16} />
          Back to Blog
        </button>

        {/* Post Header */}
        <div className="space-y-4">
          {/* Category */}
          {post.category && (
            <div>
              <span className={`${getCategoryBadge(post.category)} capitalize`}>
                {post.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{post.authorName || 'Admin'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{formatTimeAgo(post.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{post.viewCount || 0} views</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                disabled={!currentUser || liking}
                className={`btn-sm flex items-center gap-2 transition-all ${
                  isLiked 
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                } ${liking ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isLiked ? 'Unlike this post' : 'Like this post'}
              >
                <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                <span>{post.likeCount || 0}</span>
                {liking && <span className="text-xs">(saving...)</span>}
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="btn-sm flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              >
                <MessageCircle size={16} />
                <span>{post.commentCount || 0}</span>
              </button>

              <button
                onClick={handleShare}
                className="btn-sm flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                title="Share this post"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="card-base card-padding">
          {/* Excerpt */}
          {post.excerpt && (
            <div className="text-lg text-gray-600 dark:text-gray-400 mb-6 italic border-l-4 border-indigo-500 pl-4">
              {post.excerpt}
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div
              className="text-gray-900 dark:text-gray-100 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Additional Images */}
          {post.images && post.images.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Gallery
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.images.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={image.url}
                        alt={image.caption || `Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.caption && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
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

        {/* Comments Section */}
        {showComments && (
          <div className="card-base card-padding">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Comments ({post.commentCount || 0})
            </h3>
            <BlogComments postId={postId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPost;