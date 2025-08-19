// components/newsfeed/PostCard.jsx - Individual post display component with conditional image loading
import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Flag } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useAuth } from '../../contexts/AuthContext';
import { usePostInteractions, useDeletePost } from '../../hooks/useNewsfeed';
import { formatDistanceToNow } from 'date-fns';
import PostComments from './PostComments';
import PhotoModal from './PhotoModal';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PostCard = ({ post, isAboveFold = false }) => {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const { currentUser } = useAuth();
  const {
    isLiked,
    toggleLike,
    addComment,
    isTogglingLike,
    isAddingComment
  } = usePostInteractions(post.id);
  const deletePostMutation = useDeletePost();

  const isOwner = currentUser?.uid === post.authorId;

  // Handle both old single photo posts and new multi-photo posts
  const photos = post.photos || (post.photoData ? [post.photoData] : []);
  const hasMultiplePhotos = photos.length > 1;

  // Format timestamp
  const getTimeAgo = () => {
    try {
      const timestamp = post.createdAt?.seconds
        ? new Date(post.createdAt.seconds * 1000)
        : new Date(post.createdAt);
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  // Handle like button
  const handleLike = () => {
    if (!isTogglingLike) {
      toggleLike();
    }
  };

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() && !isAddingComment) {
      addComment(newComment.trim());
      setNewComment('');
    }
  };

  // Handle post deletion
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deletePostMutation.mutate(post.id);
    }
    setShowMenu(false);
  };

  // Handle photo click to open modal
  const handlePhotoClick = (index) => {
    console.log('Photo clicked, opening modal at index:', index); // Debug log
    setCurrentPhotoIndex(index);
    setShowPhotoModal(true);
  };

  // Handle swiper slide change
  const handleSlideChange = (swiper) => {
    setCurrentPhotoIndex(swiper.activeIndex);
  };

  return (
    <>
      <div className="card-base card-padding">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Author Avatar */}
            <div className="relative">
              {post.authorData?.photoURL ? (
                <img
                  src={post.authorData.photoURL}
                  alt={post.authorData.displayName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {post.authorData?.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>

            {/* Author Info */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {post.authorData?.displayName || 'Unknown User'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getTimeAgo()}
              </p>
            </div>
          </div>

          {/* Post Menu */}
          <div className="relative">
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
                  <div className="p-2">
                    {isOwner ? (
                      <button
                        onClick={handleDelete}
                        className="dropdown-item-danger w-full"
                        disabled={deletePostMutation.isPending}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          // TODO: Implement report functionality
                          console.log('Report post');
                          setShowMenu(false);
                        }}
                        className="dropdown-item w-full"
                      >
                        <Flag size={14} />
                        Report
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Post Content */}
        {post.content && (
          <div className="mb-4">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        )}

        {/* Photo Carousel */}
        {post.type === 'photo' && photos.length > 0 && (
          <div className="mb-4">
            <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
              {photos.length === 1 ? (
                // Single photo - clickable to open modal
                <div
                  className="relative group cursor-pointer"
                  onClick={() => handlePhotoClick(0)}
                >
                  <img
                    src={photos[0].imageUrl}
                    alt={photos[0].title || 'Post image'}
                    className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                    loading={isAboveFold ? "eager" : "lazy"}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 text-white p-2 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                // Multiple photos - use Swiper with click handling
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation={{
                    prevEl: '.swiper-button-prev',
                    nextEl: '.swiper-button-next',
                  }}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true,
                    dynamicMainBullets: 3,
                  }}
                  spaceBetween={0}
                  slidesPerView={1}
                  onSlideChange={handleSlideChange}
                  className="photo-carousel group"
                  allowTouchMove={true}
                  simulateTouch={true}
                >
                  {photos.map((photo, index) => (
                    <SwiperSlide key={index}>
                      <div
                        className="relative cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePhotoClick(index);
                        }}
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.title || `Post image ${index + 1}`}
                          className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                          loading={isAboveFold ? "eager" : "lazy"}
                        />

                        {/* Photo Counter */}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                          {index + 1} / {photos.length}
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center pointer-events-none">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 text-white p-2 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}

                  {/* Custom Navigation Buttons */}
                  <div className="swiper-button-prev !text-white !w-8 !h-8 !mt-0 !top-1/2 !left-2 !bg-black !bg-opacity-50 hover:!bg-opacity-70 !rounded-full after:!text-sm after:!font-bold !z-10"></div>
                  <div className="swiper-button-next !text-white !w-8 !h-8 !mt-0 !top-1/2 !right-2 !bg-black !bg-opacity-50 hover:!bg-opacity-70 !rounded-full after:!text-sm after:!font-bold !z-10"></div>
                </Swiper>
              )}
            </div>

            {/* Current Photo Metadata */}
            {(photos[currentPhotoIndex]?.title || photos[currentPhotoIndex]?.description) && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {photos[currentPhotoIndex]?.title && (
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    {photos[currentPhotoIndex].title}
                  </h4>
                )}
                {photos[currentPhotoIndex]?.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {photos[currentPhotoIndex].description}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
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

        {/* Engagement Bar */}
        <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isTogglingLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isLiked
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <Heart
                size={16}
                className={isLiked ? 'fill-current' : ''}
              />
              <span>{post.likes?.count || 0}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
            >
              <MessageCircle size={16} />
              <span>{post.comments?.count || 0}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="form-textarea text-sm resize-none"
                    rows="2"
                    maxLength={500}
                    disabled={isAddingComment}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isAddingComment}
                  className="btn-primary btn-sm self-end"
                >
                  {isAddingComment ? (
                    <div className="loading-spinner" />
                  ) : (
                    'Post'
                  )}
                </button>
                </div>
            </form>

            {/* Comments List */}
            <PostComments postId={post.id} />
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <PhotoModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          photos={photos}
          initialIndex={currentPhotoIndex}
          postAuthor={post.authorData}
        />
      )}
    </>
  );
};

export default PostCard;