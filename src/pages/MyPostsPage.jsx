// pages/MyPostsPage.jsx - User's post management page with global styling
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  Tag,
  Image,
  MoreHorizontal,
  Heart,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserPosts, useDeletePost } from '../hooks/useNewsfeed';
import { formatDistanceToNow } from 'date-fns';
import PhotoModal from '../components/newsfeed/PhotoModal';

const MyPostsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterTag, setFilterTag] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoModalIndex, setPhotoModalIndex] = useState(0);

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { data: postsData, isLoading, isError, error } = useUserPosts();
  const deletePostMutation = useDeletePost();

  const posts = postsData?.posts || [];

  // Get all unique tags from user's posts
  const allTags = [...new Set(posts.flatMap(post => post.tags || []))];

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = !searchQuery ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesTag = !filterTag || (post.tags && post.tags.includes(filterTag));

      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;

      switch (sortBy) {
        case 'newest':
          return timeB - timeA;
        case 'oldest':
          return timeA - timeB;
        case 'mostLiked':
          return (b.likes?.count || 0) - (a.likes?.count || 0);
        case 'mostCommented':
          return (b.comments?.count || 0) - (a.comments?.count || 0);
        default:
          return timeB - timeA;
      }
    });

  // Handle post deletion
  const handleDeletePost = (post) => {
    if (window.confirm(`Are you sure you want to delete this post? This action cannot be undone.`)) {
      deletePostMutation.mutate(post.id);
    }
  };

  // Handle photo modal
  const handlePhotoClick = (post, photoIndex = 0) => {
    setSelectedPost(post);
    setPhotoModalIndex(photoIndex);
    setShowPhotoModal(true);
  };

  // Format timestamp
  const getTimeAgo = (timestamp) => {
    try {
      const date = timestamp?.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  // Get stats
  const stats = {
    totalPosts: posts.length,
    totalLikes: posts.reduce((sum, post) => sum + (post.likes?.count || 0), 0),
    totalComments: posts.reduce((sum, post) => sum + (post.comments?.count || 0), 0),
    totalPhotos: posts.reduce((sum, post) => sum + (post.photos?.length || 1), 0)
  };

  return (
    <>
      <div className="my-posts-wrapper">
        <div className="my-posts-container">

          {/* Header */}
          <div className="my-posts-header">
            <div className="my-posts-header-content">
              <button
                onClick={() => navigate('/app/community')}
                className="my-posts-back-button"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="my-posts-title">My Posts</h1>
                <p className="my-posts-subtitle">
                  Manage your community posts and photos
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="my-posts-stats">
              <div className="my-posts-stat-item">
                <div className="my-posts-stat-value">{stats.totalPosts}</div>
                <div className="my-posts-stat-label">Posts</div>
              </div>
              <div className="my-posts-stat-item">
                <div className="my-posts-stat-value">{stats.totalPhotos}</div>
                <div className="my-posts-stat-label">Photos</div>
              </div>
              <div className="my-posts-stat-item">
                <div className="my-posts-stat-value">{stats.totalLikes}</div>
                <div className="my-posts-stat-label">Likes</div>
              </div>
              <div className="my-posts-stat-item">
                <div className="my-posts-stat-value">{stats.totalComments}</div>
                <div className="my-posts-stat-label">Comments</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="my-posts-controls">
            {/* Search and Filter Row */}
            <div className="my-posts-search-row">
              <div className="my-posts-search-container">
                <Search className="my-posts-search-icon" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts by content or tags..."
                  className="my-posts-search-input"
                />
              </div>

              <button
                onClick={() => navigate('/app/community/create')}
                className="my-posts-new-post-button"
              >
                <Plus size={16} />
                New Post
              </button>
            </div>

            {/* Sort and Filter Row */}
            <div className="my-posts-filter-row">
              <div className="my-posts-filter-group">
                <Calendar size={16} className="my-posts-filter-icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="my-posts-filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="mostLiked">Most Liked</option>
                  <option value="mostCommented">Most Commented</option>
                </select>
              </div>

              {allTags.length > 0 && (
                <div className="my-posts-filter-group">
                  <Tag size={16} className="my-posts-filter-icon" />
                  <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="my-posts-filter-select"
                  >
                    <option value="">All Tags</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>#{tag}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="my-posts-content">
            {isLoading ? (
              // Loading state
              <div className="my-posts-loading">
                {[1, 2, 3].map(i => (
                  <div key={i} className="my-posts-loading-card">
                    <div className="my-posts-loading-content">
                      <div className="my-posts-loading-title"></div>
                      <div className="my-posts-loading-image"></div>
                      <div className="my-posts-loading-actions">
                        <div className="my-posts-loading-button w-20"></div>
                        <div className="my-posts-loading-button w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              // Error state
              <div className="my-posts-error-state">
                <div className="my-posts-error-icon">
                  <AlertCircle size={48} className="mx-auto" />
                </div>
                <h3 className="my-posts-error-title">
                  Failed to Load Posts
                </h3>
                <p className="my-posts-error-text">
                  {error?.message || 'Something went wrong while loading your posts'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary btn-md"
                >
                  Try Again
                </button>
              </div>
            ) : filteredPosts.length === 0 ? (
              // Empty state
              <div className="my-posts-empty-state">
                <div className="my-posts-empty-icon">
                  <Image size={48} className="mx-auto" />
                </div>
                <h3 className="my-posts-empty-title">
                  {posts.length === 0 ? 'No Posts Yet' : 'No Posts Found'}
                </h3>
                <p className="my-posts-empty-text">
                  {posts.length === 0
                    ? 'Start sharing your miniature painting progress with the community!'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {posts.length === 0 && (
                  <button
                    onClick={() => navigate('/app/community/create')}
                    className="btn-primary btn-md"
                  >
                    <Plus size={16} />
                    Create Your First Post
                  </button>
                )}
              </div>
            ) : (
              // Posts grid
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <PostManagementCard
                    key={post.id}
                    post={post}
                    onEdit={(post) => navigate(`/app/community/edit/${post.id}`)}
                    onDelete={handleDeletePost}
                    onViewPost={(post) => navigate(`/app/community/post/${post.id}`)}
                    onPhotoClick={handlePhotoClick}
                    getTimeAgo={getTimeAgo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && selectedPost && (
        <PhotoModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          photos={selectedPost.photos || (selectedPost.photoData ? [selectedPost.photoData] : [])}
          initialIndex={photoModalIndex}
          postAuthor={selectedPost.authorData}
        />
      )}
    </>
  );
};

// Individual post management card
const PostManagementCard = ({ post, onEdit, onDelete, onViewPost, onPhotoClick, getTimeAgo }) => {
  const [showMenu, setShowMenu] = useState(false);

  // Handle both old single photo posts and new multi-photo posts
  const photos = post.photos || (post.photoData ? [post.photoData] : []);

  return (
    <div className="post-management-card">
      {/* Post Header */}
      <div className="post-management-header">
        <div className="post-management-meta">
          <div className="post-management-meta-row">
            <span className="post-management-timestamp">
              {getTimeAgo(post.createdAt)}
            </span>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-1">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="badge-primary text-xs">
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>

          <p className="post-management-content">
            {post.content}
          </p>
        </div>

        {/* Actions Menu */}
        <div className="post-management-menu">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="post-management-menu-button"
          >
            <MoreHorizontal size={16} />
          </button>

          {showMenu && (
            <>
              <div
                className="dropdown-backdrop"
                onClick={() => setShowMenu(false)}
              />
              <div className="dropdown-menu right-0 top-full mt-1 min-w-32">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      onViewPost(post);
                      setShowMenu(false);
                    }}
                    className="dropdown-item w-full"
                  >
                    <Eye size={14} />
                    View Post
                  </button>
                  <button
                    onClick={() => {
                      onEdit(post);
                      setShowMenu(false);
                    }}
                    className="dropdown-item w-full"
                  >
                    <Edit size={14} />
                    Edit Post
                  </button>
                  <button
                    onClick={() => {
                      onDelete(post);
                      setShowMenu(false);
                    }}
                    className="dropdown-item-danger w-full"
                  >
                    <Trash2 size={14} />
                    Delete Post
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="mb-4">
          {photos.length === 1 ? (
            // Single photo
            <div
              className="post-photos-single group"
              onClick={() => onPhotoClick(post, 0)}
            >
              <img
                src={photos[0].imageUrl}
                alt={photos[0].title || 'Post image'}
                className="post-photos-single-image"
              />
              <div className="post-photos-single-overlay" />
            </div>
          ) : (
            // Multiple photos grid
            <div className={photos.length === 2 ? 'post-photos-grid-2' : photos.length === 3 ? 'post-photos-grid-3' : 'post-photos-grid-2'}>
              {photos.slice(0, 4).map((photo, index) => (
                <div
                  key={index}
                  className={`post-photos-grid-item group ${photos.length === 3 && index === 0 ? 'post-photos-grid-tall' : 'post-photos-grid-square'}`}
                  onClick={() => onPhotoClick(post, index)}
                >
                  <img
                    src={photo.imageUrl}
                    alt={`Photo ${index + 1}`}
                    className="post-photos-grid-item-image"
                  />
                  {index === 3 && photos.length > 4 && (
                    <div className="post-photos-grid-more">
                      <span className="post-photos-grid-more-text">+{photos.length - 4}</span>
                    </div>
                  )}
                  <div className="post-photos-grid-item-overlay" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="post-stats-bar">
        <div className="post-stats-info">
          <span className="post-stats-item">
            <Heart size={14} />
            {post.likes?.count || 0} likes
          </span>
          <span className="post-stats-item">
            <MessageCircle size={14} />
            {post.comments?.count || 0} comments
          </span>
          <span className="post-stats-item">
            <Image size={14} />
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="post-stats-actions">
          <button
            onClick={() => onEdit(post)}
            className="post-edit-button"
          >
            <Edit size={14} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPostsPage;