// pages/MyPostsPage.jsx - User's post management page
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 min-h-screen">

          {/* Header */}
          <div className="bg-indigo-600 text-white p-6 pt-12">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate('/app/community')}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">My Posts</h1>
                <p className="text-white/90 text-sm">
                  Manage your community posts and photos
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                <div className="text-xs text-white/80">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalPhotos}</div>
                <div className="text-xs text-white/80">Photos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalLikes}</div>
                <div className="text-xs text-white/80">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalComments}</div>
                <div className="text-xs text-white/80">Comments</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            {/* Search and Filter Row */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts by content or tags..."
                  className="form-input pl-10"
                />
              </div>

              <button
                onClick={() => navigate('/app/community/create')}
                className="btn-primary btn-md"
              >
                <Plus size={16} />
                New Post
              </button>
            </div>

            {/* Sort and Filter Row */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="mostLiked">Most Liked</option>
                  <option value="mostCommented">Most Commented</option>
                </select>
              </div>

              {allTags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="form-select text-sm"
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
          <div className="p-6">
            {isLoading ? (
              // Loading state
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="card-base card-padding">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                      <div className="flex gap-4">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              // Error state
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <AlertCircle size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Failed to Load Posts
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
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
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Image size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {posts.length === 0 ? 'No Posts Yet' : 'No Posts Found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
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
    <div className="card-base card-padding">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
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

          <p className="text-gray-900 dark:text-white text-sm line-clamp-3">
            {post.content}
          </p>
        </div>

        {/* Actions Menu */}
        <div className="relative ml-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
              className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer group"
              onClick={() => onPhotoClick(post, 0)}
            >
              <img
                src={photos[0].imageUrl}
                alt={photos[0].title || 'Post image'}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
            </div>
          ) : (
            // Multiple photos grid
            <div className={`grid gap-1 rounded-lg overflow-hidden ${
              photos.length === 2 ? 'grid-cols-2' :
              photos.length === 3 ? 'grid-cols-3' :
              'grid-cols-2'
            }`}>
              {photos.slice(0, 4).map((photo, index) => (
                <div
                  key={index}
                  className={`relative bg-gray-100 dark:bg-gray-700 cursor-pointer group ${
                    photos.length === 3 && index === 0 ? 'row-span-2' : 'aspect-square'
                  }`}
                  onClick={() => onPhotoClick(post, index)}
                >
                  <img
                    src={photo.imageUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {index === 3 && photos.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white font-semibold">+{photos.length - 4}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Heart size={14} />
            {post.likes?.count || 0} likes
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={14} />
            {post.comments?.count || 0} comments
          </span>
          <span className="flex items-center gap-1">
            <Image size={14} />
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(post)}
            className="btn-tertiary btn-sm"
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