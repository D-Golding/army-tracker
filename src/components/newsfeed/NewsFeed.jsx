// components/newsfeed/NewsFeed.jsx - Main news feed component with infinite loading
import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Users, AlertCircle, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useNewsFeed, useNewsFeedPermissions, useRefreshNewsFeed } from '../../hooks/useNewsfeed';
import PostCard from './PostCard';

const NewsFeed = () => {
  const {
    data: feedData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useNewsFeed();

  const permissions = useNewsFeedPermissions();
  const refreshFeed = useRefreshNewsFeed();

  // Intersection observer for auto-loading
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '800px', // Load when user is 800px from the bottom
  });

  // Auto-load more posts when the load more element comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Check permissions first
  if (!permissions.canViewFeed) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-base card-padding text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            News Feed Not Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {permissions.restrictionReason}
          </p>
          {!permissions.isMinor && (
            <button
              onClick={() => window.location.href = '/app/dashboard/privacy'}
              className="btn-primary btn-md"
            >
              Update Privacy Settings
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading state for initial load
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Create post placeholder */}
          <div className="card-base card-padding">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Post placeholders */}
          {[1, 2, 3].map(i => (
            <div key={i} className="card-base card-padding">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-base card-padding text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load News Feed
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error?.message || 'Something went wrong while loading your news feed'}
          </p>
          <button
            onClick={() => refreshFeed()}
            className="btn-primary btn-md"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const posts = feedData?.posts || [];
  const totalPosts = feedData?.totalPosts || 0;

  // Handle load more
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Create Post Section */}
        {permissions.canCreatePosts && (
          <div className="card-base card-padding">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={() => window.location.href = '/app/community/create'}
                className="flex-1 text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl text-gray-600 dark:text-gray-400 transition-colors"
              >
                Share a photo of your latest work...
              </button>
            </div>
          </div>
        )}

        {/* Feed Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Community Feed
            </h2>
            {totalPosts > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalPosts} post{totalPosts !== 1 ? 's' : ''} loaded
              </p>
            )}
          </div>
          <button
            onClick={() => refreshFeed()}
            className="btn-tertiary btn-sm"
            title="Refresh feed"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post, postIndex) => (
              <PostCard
                key={post.id}
                post={post}
                isAboveFold={postIndex < 2}
              />
            ))}

            {/* Load More Section */}
            <div className="text-center py-6">
              {hasNextPage ? (
                <div className="space-y-4">
                  {/* Invisible trigger element for auto-loading */}
                  <div ref={loadMoreRef} className="h-1" />

                  <button
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                    className="btn-secondary btn-md"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Loading More Posts...
                      </>
                    ) : (
                      'Load More Posts'
                    )}
                  </button>

                  {/* Loading indicator for next page */}
                  {isFetchingNextPage && (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="card-base card-padding">
                          <div className="animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                              <div className="space-y-2 flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                              </div>
                            </div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                            <div className="flex gap-4">
                              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                    You've seen all recent posts
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">
                    Check back later for new content!
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Empty state
          <div className="card-base card-padding text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Posts Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Be the first to share your miniature painting progress with the community!
            </p>
            {permissions.canCreatePosts && (
              <button
                onClick={() => window.location.href = '/app/community/create'}
                className="btn-primary btn-md"
              >
                <Camera size={16} />
                Create Your First Post
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;