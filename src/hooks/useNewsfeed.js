// hooks/useNewsfeed.js - React Query hooks for news feed operations with infinite loading
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  createPhotoPost,
  getNewsFeed,
  togglePostLike,
  addComment,
  getPostComments,
  hasUserLikedPost,
  deletePost,
  getUserPosts
} from '../services/newsfeed/newsfeedService';

// Query keys for consistent cache management
const NEWSFEED_QUERY_KEYS = {
  feed: ['newsfeed', 'feed'],
  userPosts: (userId) => ['newsfeed', 'userPosts', userId],
  post: (postId) => ['newsfeed', 'post', postId],
  comments: (postId) => ['newsfeed', 'comments', postId],
  likes: (postId) => ['newsfeed', 'likes', postId],
  userLike: (postId, userId) => ['newsfeed', 'userLike', postId, userId]
};

/**
 * Get news feed with infinite loading (15 posts at a time)
 */
export const useNewsFeed = (pageSize = 7) => {
  const { currentUser } = useAuth();

  return useInfiniteQuery({
    queryKey: NEWSFEED_QUERY_KEYS.feed,
    queryFn: ({ pageParam }) => getNewsFeed({
      pageSize,
      lastDoc: pageParam
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      // Return the cursor for the next page, or undefined if no more pages
      return lastPage?.hasNextPage ? lastPage.nextPageCursor : undefined;
    },
    enabled: !!currentUser,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Refresh every minute
    select: (data) => {
      // Flatten all pages into a single array of posts
      const allPosts = data.pages.flatMap(page => page.posts || []);

      return {
        posts: allPosts,
        hasNextPage: data.pages[data.pages.length - 1]?.hasNextPage || false,
        totalPosts: allPosts.length
      };
    }
  });
};

/**
 * Get current user's posts
 */
export const useUserPosts = () => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: NEWSFEED_QUERY_KEYS.userPosts(currentUser?.uid),
    queryFn: () => getUserPosts(currentUser?.uid),
    enabled: !!currentUser,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: true
  });
};

/**
 * Check if user has liked a specific post
 */
export const usePostLikeStatus = (postId) => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: NEWSFEED_QUERY_KEYS.userLike(postId, currentUser?.uid),
    queryFn: () => hasUserLikedPost(postId),
    enabled: !!currentUser && !!postId,
    staleTime: 60000, // 1 minute
    gcTime: 300000 // 5 minutes
  });
};

/**
 * Get comments for a post
 */
export const usePostComments = (postId, enabled = true) => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: NEWSFEED_QUERY_KEYS.comments(postId),
    queryFn: () => getPostComments(postId),
    enabled: !!currentUser && !!postId && enabled,
    staleTime: 30000, // 30 seconds
    gcTime: 300000 // 5 minutes
  });
};

/**
 * Create a new photo post
 */
export const useCreatePhotoPost = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  return useMutation({
    mutationFn: (postData) => createPhotoPost(postData),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch the feed
        queryClient.invalidateQueries({ queryKey: NEWSFEED_QUERY_KEYS.feed });

        // Invalidate user posts
        queryClient.invalidateQueries({ queryKey: NEWSFEED_QUERY_KEYS.userPosts(currentUser?.uid) });
      }
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
    }
  });
};

/**
 * Toggle like on a post
 */
export const useTogglePostLike = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  return useMutation({
    mutationFn: (postId) => togglePostLike(postId),
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: NEWSFEED_QUERY_KEYS.feed });
      await queryClient.cancelQueries({ queryKey: NEWSFEED_QUERY_KEYS.userPosts(currentUser?.uid) });
      await queryClient.cancelQueries({ queryKey: NEWSFEED_QUERY_KEYS.userLike(postId, currentUser?.uid) });

      // Snapshot previous values
      const previousFeed = queryClient.getQueryData(NEWSFEED_QUERY_KEYS.feed);
      const previousUserPosts = queryClient.getQueryData(NEWSFEED_QUERY_KEYS.userPosts(currentUser?.uid));
      const previousLikeStatus = queryClient.getQueryData(NEWSFEED_QUERY_KEYS.userLike(postId, currentUser?.uid));

      // Optimistically update like status
      queryClient.setQueryData(NEWSFEED_QUERY_KEYS.userLike(postId, currentUser?.uid), !previousLikeStatus);

      // Optimistically update infinite feed
      if (previousFeed?.pages) {
        const updatedPages = previousFeed.pages.map(page => ({
          ...page,
          posts: page.posts?.map(post => {
            if (post.id === postId) {
              const currentCount = post.likes?.count || 0;
              const newCount = previousLikeStatus ? currentCount - 1 : currentCount + 1;
              return {
                ...post,
                likes: {
                  ...post.likes,
                  count: Math.max(0, newCount)
                }
              };
            }
            return post;
          }) || []
        }));

        queryClient.setQueryData(NEWSFEED_QUERY_KEYS.feed, {
          ...previousFeed,
          pages: updatedPages
        });
      }

      // Optimistically update user posts
      if (previousUserPosts?.posts) {
        const updatedUserPosts = previousUserPosts.posts.map(post => {
          if (post.id === postId) {
            const currentCount = post.likes?.count || 0;
            const newCount = previousLikeStatus ? currentCount - 1 : currentCount + 1;
            return {
              ...post,
              likes: {
                ...post.likes,
                count: Math.max(0, newCount)
              }
            };
          }
          return post;
        });

        queryClient.setQueryData(NEWSFEED_QUERY_KEYS.userPosts(currentUser?.uid), {
          ...previousUserPosts,
          posts: updatedUserPosts
        });
      }

      return { previousFeed, previousUserPosts, previousLikeStatus };
    },
    onError: (error, postId, context) => {
      // Revert optimistic updates on error
      if (context?.previousFeed) {
        queryClient.setQueryData(NEWSFEED_QUERY_KEYS.feed, context.previousFeed);
      }
      if (context?.previousUserPosts) {
        queryClient.setQueryData(NEWSFEED_QUERY_KEYS.userPosts(currentUser?.uid), context.previousUserPosts);
      }
      if (context?.previousLikeStatus !== undefined) {
        queryClient.setQueryData(
          NEWSFEED_QUERY_KEYS.userLike(postId, currentUser?.uid),
          context.previousLikeStatus
        );
      }
      console.error('Failed to toggle like:', error);
    },
    onSettled: (result, error, postId) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: NEWSFEED_QUERY_KEYS.userLike(postId, currentUser?.uid) });
      queryClient.invalidateQueries({ queryKey: NEWSFEED_QUERY_KEYS.feed });
      queryClient.invalidateQueries({ queryKey: NEWSFEED_QUERY_KEYS.userPosts(currentUser?.uid) });
    }
  });
};

/**
 * Add comment to a post
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  return useMutation({
    mutationFn: ({ postId, content }) => addComment(postId, content),
    onSuccess: (result, variables) => {
      if (result.success) {
        const { postId } = variables;

        // Invalidate comments for this post
        queryClient.invalidateQueries({ queryKey: NEWSFEED_QUERY_KEYS.comments(postId) });

        // Update comment count in infinite feed optimistically
        const feedData = queryClient.getQueryData(NEWSFEED_QUERY_KEYS.feed);
        if (feedData?.pages) {
          const updatedPages = feedData.pages.map(page => ({
            ...page,
            posts: page.posts?.map(post => {
              if (post.id === postId) {
                return {
                  ...post,
                  comments: {
                    ...post.comments,
                    count: (post.comments?.count || 0) + 1
                  }
                };
              }
              return post;
            }) || []
          }));

          queryClient.setQueryData(NEWSFEED_QUERY_KEYS.feed, {
            ...feedData,
            pages: updatedPages
          });
        }

        // Update comment count in user posts optimistically
        const userPostsData = queryClient.getQueryData(NEWSFEED_QUERY_KEYS.userPosts(currentUser?.uid));
        if (userPostsData?.posts) {
          const updatedUserPosts = userPostsData.posts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: {
                  ...post.comments,
                  count: (post.comments?.count || 0) + 1
                }
              };
            }
            return post;
          });

          queryClient.setQueryData(NEWSFEED_QUERY_KEYS.userPosts(currentUser?.uid), {
            ...userPostsData,
            posts: updatedUserPosts
          });
        }

        // Refetch comments to get the new comment
        queryClient.refetchQueries({ queryKey: NEWSFEED_QUERY_KEYS.comments(postId) });
      }
    },
    onError: (error) => {
      console.error('Failed to add comment:', error);
    }
  });
};

/**
 * Delete a post
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  return useMutation({
    mutationFn: (postId) => deletePost(postId),
    onSuccess: (result, postId) => {
      if (result.success) {
        // Remove post from infinite feed optimistically
        const feedData = queryClient.getQueryData(NEWSFEED_QUERY_KEYS.feed);
        if (feedData?.pages) {
          const updatedPages = feedData.pages.map(page => ({
            ...page,
            posts: page.posts?.filter(post => post.id !== postId) || []
          }));

          queryClient.setQueryData(NEWSFEED_QUERY_KEYS.feed, {
            ...feedData,
            pages: updatedPages
          });
        }

        // Remove post from user posts optimistically
        const userPostsData = queryClient.getQueryData(NEWSFEED_QUERY_KEYS.userPosts(currentUser?.uid));
        if (userPostsData?.posts) {
          const updatedUserPosts = userPostsData.posts.filter(post => post.id !== postId);
          queryClient.setQueryData(NEWSFEED_QUERY_KEYS.userPosts(currentUser?.uid), {
            ...userPostsData,
            posts: updatedUserPosts
          });
        }

        // Remove all related queries
        queryClient.removeQueries({ queryKey: NEWSFEED_QUERY_KEYS.post(postId) });
        queryClient.removeQueries({ queryKey: NEWSFEED_QUERY_KEYS.comments(postId) });
        queryClient.removeQueries({ queryKey: NEWSFEED_QUERY_KEYS.likes(postId) });
      }
    },
    onError: (error) => {
      console.error('Failed to delete post:', error);
    }
  });
};

/**
 * Load more posts for infinite scroll
 */
export const useLoadMorePosts = () => {
  const queryClient = useQueryClient();

  return () => {
    const feedQuery = queryClient.getQueryState(NEWSFEED_QUERY_KEYS.feed);
    if (feedQuery?.data) {
      queryClient.fetchNextPage({ queryKey: NEWSFEED_QUERY_KEYS.feed });
    }
  };
};

/**
 * Refresh news feed manually
 */
export const useRefreshNewsFeed = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: NEWSFEED_QUERY_KEYS.feed });
    queryClient.refetchQueries({ queryKey: NEWSFEED_QUERY_KEYS.feed });
  };
};

/**
 * Combined hook for post interactions
 */
export const usePostInteractions = (postId) => {
  const likeStatus = usePostLikeStatus(postId);
  const comments = usePostComments(postId, false); // Don't auto-fetch comments
  const toggleLike = useTogglePostLike();
  const addCommentMutation = useAddComment();

  const handleToggleLike = () => {
    toggleLike.mutate(postId);
  };

  const handleAddComment = (content) => {
    addCommentMutation.mutate({ postId, content });
  };

  return {
    // Like data
    isLiked: likeStatus.data || false,
    isLikeLoading: likeStatus.isLoading,

    // Comments data
    comments: comments.data?.comments || [],
    isCommentsLoading: comments.isLoading,
    loadComments: () => comments.refetch(),

    // Actions
    toggleLike: handleToggleLike,
    addComment: handleAddComment,

    // Loading states
    isTogglingLike: toggleLike.isPending,
    isAddingComment: addCommentMutation.isPending
  };
};

/**
 * Check news feed permissions
 */
export const useNewsFeedPermissions = () => {
  const { userProfile, hasCommunityAccess } = useAuth();

  const isMinor = userProfile?.userCategory === 'minor';
  const canViewFeed = hasCommunityAccess() && !isMinor;
  const canCreatePosts = canViewFeed;
  const canInteract = canViewFeed;

  return {
    isMinor,
    canViewFeed,
    canCreatePosts,
    canInteract,
    restrictionReason: isMinor
      ? 'News feed not available for users under 18'
      : !hasCommunityAccess()
      ? 'Community access required'
      : null
  };
};