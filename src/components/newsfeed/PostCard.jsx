// components/newsfeed/PostCard.jsx - Individual post display with video support
import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Flag, Video, Image } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../../contexts/AuthContext';
import { usePostInteractions, useDeletePost } from '../../hooks/useNewsfeed';
import { formatDistanceToNow } from 'date-fns';
import PostComments from './PostComments';
import PhotoModal from './PhotoModal';
import VideoPlayer from './VideoPlayer';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PostCard = ({ post, isAboveFold = false }) => {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
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

  // Intersection observer for video autoplay
  const { ref: postRef, inView } = useInView({
    threshold: 0.5, // Video plays when 50% visible
    triggerOnce: false
  });

  const isOwner = currentUser?.uid === post.userId;

  // 🔧 Fix R2 URLs for old posts
  const fixR2Url = (url) => {
    if (url?.includes('pub-433f30bb1467ae706c4b5e4686b7dc5e.r2.dev')) {
      return url.replace(
        'https://pub-433f30bb1467ae706c4b5e4686b7dc5e.r2.dev/',
        'https://433f30bb1467ae706c4b5e4686b7dc5e.r2.cloudflarestorage.com/'
      );
    }
    return url;
  };

  // Handle mixed media - get all media items
  const mediaItems = post.media || [];
  const photos = mediaItems.filter(item => item.type === 'photo');
  const videos = mediaItems.filter(item => item.type === 'video');
  const hasMultipleMedia = mediaItems.length > 1;
  const currentMedia = mediaItems[currentMediaIndex];

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
    const photoIndex = photos.findIndex(photo =>
      mediaItems.findIndex(item => item.url === photo.url) === index
    );
    setShowPhotoModal(true);
  };

  // Handle swiper slide change
  const handleSlideChange = (swiper) => {
    setCurrentMediaIndex(swiper.activeIndex);
  };

  // Render media item based on type
  const renderMediaItem = (mediaItem, index, isSingle = false) => {
    if (mediaItem.type === 'video') {
      return (
        <div key={index} className="relative">
          <VideoPlayer
            video={{
              ...mediaItem,
              url: fixR2Url(mediaItem.url) // 🔧 Fix URL for videos
            }}
            isInView={inView && index === currentMediaIndex}
            className="w-full aspect-video"
            showControls={true}
            autoPlay={true}
            muted={true}
          />
        </div>
      );
    } else {
      // Photo
      return (
        <div
          key={index}
          className="relative group cursor-pointer"
          onClick={() => handlePhotoClick(index)}
        >
          <img
            src={fixR2Url(mediaItem.url)} // 🔧 Fix URL for photos
            alt={mediaItem.title || `Post image ${index + 1}`}
            className="w-full h-auto object-cover transition-transform group-hover:scale-105"
            loading={isAboveFold ? "eager" : "lazy"}
          />

          {/* Media type indicator */}
          <div className="absolute top-2 left-2">
            <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <Image size={12} />
              PHOTO
            </div>
          </div>

          {/* Hover overlay for photos */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 text-white p-2 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div ref={postRef} className="card-base card-padding">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Author Avatar */}
            <div className="relative">
              {post.userPhotoURL ? (
                <img
                  src={post.userPhotoURL}
                  alt={post.userDisplayName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {post.userDisplayName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>

            {/* Author Info */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {post.userDisplayName || 'Unknown User'}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{getTimeAgo()}</span>
                {/* Media type indicators */}
                {post.hasPhotos && post.hasVideos && (
                  <span className="flex items-center gap-1">
                    • <Image size={10} /> <Video size={10} /> Mixed Media
                  </span>
                )}
                {post.hasPhotos && !post.hasVideos && post.photoCount > 1 && (
                  <span className="flex items-center gap-1">
                    • <Image size={10} /> {post.photoCount} Photos
                  </span>
                )}
                {post.hasVideos && !post.hasPhotos && post.videoCount > 1 && (
                  <span className="flex items-center gap-1">
                    • <Video size={10} /> {post.videoCount} Videos
                  </span>
                )}
              </div>
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

        {/* Media Carousel */}
        {mediaItems.length > 0 && (
          <div className="mb-4">
            <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
              {mediaItems.length === 1 ? (
                // Single media item
                renderMediaItem(mediaItems[0], 0, true)
              ) : (
                // Multiple media items - use Swiper
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
                  className="media-carousel group"
                  allowTouchMove={true}
                  simulateTouch={true}
                >
                  {mediaItems.map((mediaItem, index) => (
                    <SwiperSlide key={index}>
                      {renderMediaItem(mediaItem, index)}

                      {/* Media Counter */}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full pointer-events-none z-10">
                        {index + 1} / {mediaItems.length}
                      </div>
                    </SwiperSlide>
                  ))}

                  {/* Custom Navigation Buttons */}
                  <div className="swiper-button-prev !text-white !w-8 !h-8 !mt-0 !top-1/2 !left-2 !bg-black !bg-opacity-50 hover:!bg-opacity-70 !rounded-full after:!text-sm after:!font-bold !z-10"></div>
                  <div className="swiper-button-next !text-white !w-8 !h-8 !mt-0 !top-1/2 !right-2 !bg-black !bg-opacity-50 hover:!bg-opacity-70 !rounded-full after:!text-sm after:!font-bold !z-10"></div>
                </Swiper>
              )}
            </div>

            {/* Current Media Metadata */}
            {currentMedia && (currentMedia.title || currentMedia.description) && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {currentMedia.type === 'video' ? (
                    <Video size={16} className="text-purple-600" />
                  ) : (
                    <Image size={16} className="text-green-600" />
                  )}
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {currentMedia.type}
                  </span>
                </div>

                {currentMedia.title && (
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    {currentMedia.title}
                  </h4>
                )}
                {currentMedia.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {currentMedia.description}
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

          {/* Media Summary */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {post.hasPhotos && post.hasVideos ? (
              <span>{post.photoCount} photo{post.photoCount !== 1 ? 's' : ''} • {post.videoCount} video{post.videoCount !== 1 ? 's' : ''}</span>
            ) : post.hasPhotos ? (
              <span>{post.photoCount} photo{post.photoCount !== 1 ? 's' : ''}</span>
            ) : post.hasVideos ? (
              <span>{post.videoCount} video{post.videoCount !== 1 ? 's' : ''}</span>
            ) : null}
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

      {/* Photo Modal - only for photos */}
      {showPhotoModal && photos.length > 0 && (
        <PhotoModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          photos={photos.map(photo => ({
            ...photo,
            imageUrl: fixR2Url(photo.url) // 🔧 Fix URLs in photo modal too
          }))}
          initialIndex={0}
          postAuthor={{
            displayName: post.userDisplayName,
            photoURL: post.userPhotoURL
          }}
        />
      )}
    </>
  );
};

export default PostCard;