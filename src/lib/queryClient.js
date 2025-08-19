// lib/queryClient.js - Professional React Query Configuration with Community Support and Pagination
import { QueryClient } from '@tanstack/react-query';

// Query key factory for consistent cache keys
export const queryKeys = {
  // Paint keys - WITH PAGINATION
  paints: {
    all: ['paints'],
    lists: () => [...queryKeys.paints.all, 'list'],
    list: (filter) => [...queryKeys.paints.lists(), filter],
    paginated: () => [...queryKeys.paints.all, 'paginated'],
    paginatedList: (filter, pageSize) => [...queryKeys.paints.paginated(), filter, pageSize],
    summary: () => [...queryKeys.paints.all, 'summary'],
    detail: (paintName) => [...queryKeys.paints.all, 'detail', paintName],
    byColour: (colour) => [...queryKeys.paints.all, 'byColour', colour],
    byColourAndStatus: (colour, status) => [...queryKeys.paints.all, 'byColourAndStatus', colour, status],
    colours: () => [...queryKeys.paints.all, 'colours'],
  },

  // Project keys - UPDATED WITH PAGINATION
  projects: {
    all: ['projects'],
    lists: () => [...queryKeys.projects.all, 'list'],
    list: (filter) => [...queryKeys.projects.lists(), filter],
    paginated: () => [...queryKeys.projects.all, 'paginated'],
    paginatedList: (filter, pageSize) => [...queryKeys.projects.paginated(), filter, pageSize],
    summary: () => [...queryKeys.projects.all, 'summary'],
    detail: (projectId) => [...queryKeys.projects.all, 'detail', projectId],
    detailByName: (projectName) => [...queryKeys.projects.all, 'detailByName', projectName],
    paintCheck: (projectName) => [...queryKeys.projects.all, 'paintCheck', projectName],
  },

  // Usage keys
  usage: {
    all: ['usage'],
    stats: () => [...queryKeys.usage.all, 'stats'],
  },

  // Community keys
  community: {
    all: ['community'],
    posts: () => [...queryKeys.community.all, 'posts'],
    post: (postId) => [...queryKeys.community.all, 'post', postId],
    feed: (filters) => [...queryKeys.community.all, 'feed', filters],
    userPosts: (userId) => [...queryKeys.community.all, 'userPosts', userId],
    social: (userId) => [...queryKeys.community.all, 'social', userId],
    followers: (userId) => [...queryKeys.community.all, 'followers', userId],
    following: (userId) => [...queryKeys.community.all, 'following', userId],
    groups: () => [...queryKeys.community.all, 'groups'],
    group: (groupId) => [...queryKeys.community.all, 'group', groupId],
    comments: (postId) => [...queryKeys.community.all, 'comments', postId],
    rateLimits: (userId) => [...queryKeys.community.all, 'rateLimits', userId],
    auditLogs: (userId) => [...queryKeys.community.all, 'auditLogs', userId],
  },

  // Notifications keys
  notifications: {
    all: ['notifications'],
    list: (userId) => [...queryKeys.notifications.all, 'list', userId],
    unread: (userId) => [...queryKeys.notifications.all, 'unread', userId],
  },

  // Friend keys - ADDED FOR FRIEND SYSTEM
  friends: {
    all: ['friends'],
    lists: () => [...queryKeys.friends.all, 'list'],
    list: (filter) => [...queryKeys.friends.lists(), filter],
    requests: () => [...queryKeys.friends.all, 'requests'],
    pendingRequests: () => [...queryKeys.friends.requests(), 'pending'],
    sentRequests: () => [...queryKeys.friends.requests(), 'sent'],
    search: (term) => [...queryKeys.friends.all, 'search', term],
    suggestions: () => [...queryKeys.friends.all, 'suggestions'],
    relationship: (userId) => [...queryKeys.friends.all, 'relationship', userId],
    socialProfile: (userId) => [...queryKeys.friends.all, 'socialProfile', userId],
    socialStats: () => [...queryKeys.friends.all, 'socialStats']
  },
};

// Create the QueryClient with professional configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: Data is considered fresh for different periods based on type
      staleTime: 30 * 1000, // 30 seconds default

      // Cache time: Data stays in cache for 5 minutes after becoming unused
      gcTime: 5 * 60 * 1000,

      // Retry failed queries up to 3 times with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('User not authenticated')) {
          return false;
        }

        // Don't retry on permission errors
        if (error?.message?.includes('Permission denied') ||
            error?.message?.includes('Missing or insufficient permissions')) {
          return false;
        }

        // Don't retry on rate limit errors immediately
        if (error?.message?.includes('Rate limited')) {
          return false;
        }

        // Retry up to 3 times for other errors
        return failureCount < 3;
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus for real-time feel
      refetchOnWindowFocus: true,

      // Refetch on mount if data is stale
      refetchOnMount: 'always',

      // Don't refetch on reconnect unless data is stale
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations once on network errors
      retry: (failureCount, error) => {
        if (error?.message?.includes('User not authenticated')) {
          return false;
        }

        if (error?.message?.includes('Permission denied')) {
          return false;
        }

        if (error?.message?.includes('Rate limited')) {
          return false;
        }

        return failureCount < 1;
      },

      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Helper function for error handling
export const handleQueryError = (error) => {
  console.error('Query error:', error);

  // You can add global error reporting here
  // e.g., send to error tracking service

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('User not authenticated')) {
      // Handle auth errors - could redirect to login
      return 'Please sign in to continue';
    }

    if (error.message.includes('Permission denied') ||
        error.message.includes('Missing or insufficient permissions')) {
      return 'You don\'t have permission to access this data';
    }

    if (error.message.includes('Rate limited')) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    if (error.message.includes('offline')) {
      return 'You appear to be offline. Please check your connection.';
    }

    if (error.message.includes('ValidationError')) {
      return 'Invalid data provided. Please check your input.';
    }

    // Generic error message
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

// Cache invalidation helpers for existing features - UPDATED FOR PAGINATION
export const invalidatePaintQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.paints.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.usage.all });
};

export const invalidateProjectQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.usage.all });
};

export const invalidateUsageQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.usage.all });
};

// Cache invalidation helpers for community features
export const invalidateCommunityQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.community.all });
};

export const invalidatePostQueries = (postId = null) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.community.posts() });
  queryClient.invalidateQueries({ queryKey: queryKeys.community.feed() });

  if (postId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.community.post(postId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.community.comments(postId) });
  }
};

export const invalidateSocialQueries = (userId = null) => {
  if (userId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.community.social(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.community.followers(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.community.following(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.community.userPosts(userId) });
  } else {
    queryClient.invalidateQueries({ queryKey: queryKeys.community.all });
  }
};

export const invalidateNotificationQueries = (userId) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread(userId) });
};

// Cache invalidation helpers for friend features - ADDED
export const invalidateFriendQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
};

export const invalidateFriendRequestQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.friends.requests() });
};

export const invalidateFriendSocialQueries = (userId = null) => {
  if (userId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.friends.socialProfile(userId) });
  } else {
    queryClient.invalidateQueries({ queryKey: queryKeys.friends.socialStats() });
  }
};

// Optimistic update helpers for community features
export const optimisticLikeUpdate = (postId, userId, isLiking) => {
  // Update post like count
  queryClient.setQueryData(
    queryKeys.community.post(postId),
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        post: {
          ...oldData.post,
          likesCount: oldData.post.likesCount + (isLiking ? 1 : -1)
        }
      };
    }
  );

  // Update user's social profile
  queryClient.setQueryData(
    queryKeys.community.social(userId),
    (oldData) => {
      if (!oldData) return oldData;

      const likedPosts = oldData.likedPosts || [];
      const updatedLikedPosts = isLiking
        ? [...likedPosts, postId]
        : likedPosts.filter(id => id !== postId);

      return {
        ...oldData,
        likedPosts: updatedLikedPosts
      };
    }
  );

  // Update feed queries
  queryClient.setQueriesData(
    { queryKey: queryKeys.community.feed() },
    (oldData) => {
      if (!oldData?.posts) return oldData;

      return {
        ...oldData,
        posts: oldData.posts.map(post =>
          post.id === postId
            ? { ...post, likesCount: post.likesCount + (isLiking ? 1 : -1) }
            : post
        )
      };
    }
  );
};

export const optimisticFollowUpdate = (targetUserId, currentUserId, isFollowing) => {
  // Update current user's following list
  queryClient.setQueryData(
    queryKeys.community.social(currentUserId),
    (oldData) => {
      if (!oldData) return oldData;

      const following = oldData.following || [];
      const updatedFollowing = isFollowing
        ? [...following, targetUserId]
        : following.filter(id => id !== targetUserId);

      return {
        ...oldData,
        following: updatedFollowing,
        followingCount: updatedFollowing.length
      };
    }
  );

  // Update target user's followers list
  queryClient.setQueryData(
    queryKeys.community.social(targetUserId),
    (oldData) => {
      if (!oldData) return oldData;

      const followers = oldData.followers || [];
      const updatedFollowers = isFollowing
        ? [...followers, currentUserId]
        : followers.filter(id => id !== currentUserId);

      return {
        ...oldData,
        followers: updatedFollowers,
        followersCount: updatedFollowers.length,
        isFollowing: isFollowing
      };
    }
  );
};

// Data prefetching helpers
export const prefetchCommunityData = async (userId) => {
  // Prefetch user's social profile
  await queryClient.prefetchQuery({
    queryKey: queryKeys.community.social(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Prefetch community feed with default filters
  await queryClient.prefetchQuery({
    queryKey: queryKeys.community.feed({ sortBy: 'newest', limitCount: 20 }),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Cache warming for community features
export const warmCommunityCache = (userId) => {
  // Set longer stale times for relatively static data
  queryClient.setQueryDefaults(queryKeys.community.social(userId), {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  queryClient.setQueryDefaults(queryKeys.community.followers(userId), {
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  queryClient.setQueryDefaults(queryKeys.community.following(userId), {
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Set shorter stale times for dynamic data
  queryClient.setQueryDefaults(queryKeys.community.posts(), {
    staleTime: 30 * 1000, // 30 seconds
  });

  queryClient.setQueryDefaults(queryKeys.community.feed(), {
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Background sync for community data
export const syncCommunityData = async (userId) => {
  // Silently refetch critical community data in the background
  try {
    await Promise.allSettled([
      queryClient.invalidateQueries({
        queryKey: queryKeys.community.social(userId),
        refetchType: 'active'
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unread(userId),
        refetchType: 'active'
      }),
    ]);
  } catch (error) {
    console.warn('Background sync failed:', error);
    // Silent failure - don't disrupt user experience
  }
};

// Community-specific stale time configurations
export const COMMUNITY_STALE_TIMES = {
  POSTS: 30 * 1000,        // 30 seconds - dynamic content
  FEED: 30 * 1000,         // 30 seconds - dynamic content
  SOCIAL_PROFILE: 5 * 60 * 1000,   // 5 minutes - relatively static
  FOLLOWERS: 10 * 60 * 1000,       // 10 minutes - slowly changing
  FOLLOWING: 10 * 60 * 1000,       // 10 minutes - slowly changing
  GROUPS: 5 * 60 * 1000,           // 5 minutes - relatively static
  COMMENTS: 1 * 60 * 1000,         // 1 minute - semi-dynamic
  NOTIFICATIONS: 30 * 1000,        // 30 seconds - real-time feel
  RATE_LIMITS: 1 * 60 * 1000,      // 1 minute - important for UX
  AUDIT_LOGS: 10 * 60 * 1000,      // 10 minutes - rarely changing
};

// Apply community-specific configurations
export const configureCommunityQueries = () => {
  // Configure different stale times based on data type
  queryClient.setQueryDefaults(['community', 'posts'], {
    staleTime: COMMUNITY_STALE_TIMES.POSTS,
  });

  queryClient.setQueryDefaults(['community', 'feed'], {
    staleTime: COMMUNITY_STALE_TIMES.FEED,
  });

  queryClient.setQueryDefaults(['community', 'social'], {
    staleTime: COMMUNITY_STALE_TIMES.SOCIAL_PROFILE,
  });

  queryClient.setQueryDefaults(['community', 'followers'], {
    staleTime: COMMUNITY_STALE_TIMES.FOLLOWERS,
  });

  queryClient.setQueryDefaults(['community', 'following'], {
    staleTime: COMMUNITY_STALE_TIMES.FOLLOWING,
  });

  queryClient.setQueryDefaults(['community', 'groups'], {
    staleTime: COMMUNITY_STALE_TIMES.GROUPS,
  });

  queryClient.setQueryDefaults(['community', 'comments'], {
    staleTime: COMMUNITY_STALE_TIMES.COMMENTS,
  });

  queryClient.setQueryDefaults(['notifications'], {
    staleTime: COMMUNITY_STALE_TIMES.NOTIFICATIONS,
  });

  queryClient.setQueryDefaults(['community', 'rateLimits'], {
    staleTime: COMMUNITY_STALE_TIMES.RATE_LIMITS,
  });

  queryClient.setQueryDefaults(['community', 'auditLogs'], {
    staleTime: COMMUNITY_STALE_TIMES.AUDIT_LOGS,
  });
};

// Initialize community query configurations
configureCommunityQueries();