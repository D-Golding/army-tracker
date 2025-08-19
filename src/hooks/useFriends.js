// hooks/useFriends.js - React Query hooks for friend system with FIXED cache invalidation
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  getFriendsList,
  getPendingFriendRequests,
  getSentFriendRequests,
  searchUsers,
  getFriendSuggestions,
  getRelationshipStatus,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getSocialStatistics
} from '../services/friends';

// Query keys for consistent cache management
const FRIEND_QUERY_KEYS = {
  friends: ['friends'],
  pendingRequests: ['friends', 'pendingRequests'],
  sentRequests: ['friends', 'sentRequests'],
  socialStats: ['friends', 'socialStats'],
  userSearch: (searchTerm) => ['friends', 'userSearch', searchTerm],
  friendSuggestions: ['friends', 'suggestions'],
  relationshipStatus: (userId) => ['friends', 'relationship', userId]
};

// =====================================
// DATA QUERIES
// =====================================

/**
 * Get user's friends list
 */
export const useFriendsList = () => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.friends,
    queryFn: () => getFriendsList(),
    enabled: !!currentUser,
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Get pending friend requests (received)
 */
export const usePendingFriendRequests = () => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.pendingRequests,
    queryFn: () => getPendingFriendRequests(),
    enabled: !!currentUser,
    staleTime: 10000, // 10 seconds
    cacheTime: 60000, // 1 minute
    refetchOnWindowFocus: true
  });
};

/**
 * Get sent friend requests (pending)
 */
export const useSentFriendRequests = () => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.sentRequests,
    queryFn: () => getSentFriendRequests(),
    enabled: !!currentUser,
    staleTime: 10000, // 10 seconds
    cacheTime: 60000, // 1 minute
    refetchOnWindowFocus: true
  });
};

/**
 * Get social statistics
 */
export const useSocialStatistics = () => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.socialStats,
    queryFn: () => getSocialStatistics(),
    enabled: !!currentUser,
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Search for users
 */
export const useUserSearch = (searchTerm, options = {}) => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.userSearch(searchTerm),
    queryFn: () => searchUsers(searchTerm),
    enabled: !!currentUser && !!searchTerm && searchTerm.length >= 2 && options.enabled !== false,
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Get friend suggestions
 */
export const useFriendSuggestions = () => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.friendSuggestions,
    queryFn: () => getFriendSuggestions(),
    enabled: !!currentUser,
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Get relationship status with a specific user
 */
export const useRelationshipStatus = (userId) => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.relationshipStatus(userId),
    queryFn: () => getRelationshipStatus(userId),
    enabled: !!currentUser && !!userId,
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Combined hook for all friend data
 */
export const useFriendData = () => {
  const friendsQuery = useFriendsList();
  const pendingRequestsQuery = usePendingFriendRequests();
  const sentRequestsQuery = useSentFriendRequests();
  const statsQuery = useSocialStatistics();

  return {
    // Data
    friends: friendsQuery.data?.friends || [],
    pendingRequests: pendingRequestsQuery.data?.requests || [],
    sentRequests: sentRequestsQuery.data?.requests || [],
    stats: statsQuery.data?.stats || null,

    // Loading states
    isLoading: friendsQuery.isLoading || pendingRequestsQuery.isLoading ||
               sentRequestsQuery.isLoading || statsQuery.isLoading,
    isError: friendsQuery.isError || pendingRequestsQuery.isError ||
             sentRequestsQuery.isError || statsQuery.isError,

    // Individual queries for manual refetch
    friendsQuery,
    pendingRequestsQuery,
    sentRequestsQuery,
    statsQuery
  };
};

// =====================================
// MUTATIONS WITH CONSERVATIVE CACHE INVALIDATION
// =====================================

/**
 * Send friend request mutation
 */
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, message = '' }) => sendFriendRequest(userId, message),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Conservative cache invalidation - only invalidate what's necessary
        queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.sentRequests });
        queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.socialStats });
        queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.relationshipStatus(variables.userId) });
      }
    },
    onError: (error) => {
      console.error('Failed to send friend request:', error);
    }
  });
};

/**
 * Accept friend request mutation - SIMPLIFIED with targeted cache updates
 */
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId) => acceptFriendRequest(requestId),
    onSuccess: (result, requestId) => {
      if (result.success) {
        // Wait a moment for Firestore to propagate changes, then invalidate
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.friends });
          queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.pendingRequests });
          queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.socialStats });

          // Force refetch the most important data
          queryClient.refetchQueries({ queryKey: FRIEND_QUERY_KEYS.friends });
          queryClient.refetchQueries({ queryKey: FRIEND_QUERY_KEYS.pendingRequests });
        }, 500);
      }
    },
    onError: (error) => {
      console.error('Failed to accept friend request:', error);
    }
  });
};

/**
 * Decline friend request mutation
 */
export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId) => declineFriendRequest(requestId),
    onSuccess: (result, requestId) => {
      if (result.success) {
        // Simple invalidation with delay
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.pendingRequests });
          queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.socialStats });
          queryClient.refetchQueries({ queryKey: FRIEND_QUERY_KEYS.pendingRequests });
        }, 500);
      }
    },
    onError: (error) => {
      console.error('Failed to decline friend request:', error);
    }
  });
};

/**
 * Cancel friend request mutation
 */
export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId) => cancelFriendRequest(requestId),
    onSuccess: (result, requestId) => {
      if (result.success) {
        // Simple invalidation with delay
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.sentRequests });
          queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.socialStats });
          queryClient.refetchQueries({ queryKey: FRIEND_QUERY_KEYS.sentRequests });
        }, 500);
      }
    },
    onError: (error) => {
      console.error('Failed to cancel friend request:', error);
    }
  });
};

/**
 * Remove friend mutation
 */
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendUserId) => removeFriend(friendUserId),
    onSuccess: (result, friendUserId) => {
      if (result.success) {
        // Simple invalidation
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.friends });
          queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.socialStats });
          queryClient.refetchQueries({ queryKey: FRIEND_QUERY_KEYS.friends });
        }, 500);
      }
    },
    onError: (error) => {
      console.error('Failed to remove friend:', error);
    }
  });
};

// =====================================
// PERMISSION HOOKS
// =====================================

/**
 * Check friend system permissions
 */
export const useFriendPermissions = () => {
  const { userProfile, hasCommunityAccess, hasFeatureAccess } = useAuth();

  const isMinor = userProfile?.userCategory === 'minor';
  const canUseFriendSystem = hasCommunityAccess() && !isMinor;
  const canSendFriendRequests = canUseFriendSystem && hasFeatureAccess('friends');
  const canUseMessaging = canUseFriendSystem && hasFeatureAccess('messaging');

  return {
    isMinor,
    canUseFriendSystem,
    canSendFriendRequests,
    canUseMessaging
  };
};

// =====================================
// UTILITY FUNCTIONS
// =====================================

/**
 * Manually refresh all friend data
 */
export const useRefreshFriendData = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['friends'] });
    queryClient.refetchQueries({ queryKey: FRIEND_QUERY_KEYS.friends });
    queryClient.refetchQueries({ queryKey: FRIEND_QUERY_KEYS.pendingRequests });
    queryClient.refetchQueries({ queryKey: FRIEND_QUERY_KEYS.sentRequests });
    queryClient.refetchQueries({ queryKey: FRIEND_QUERY_KEYS.socialStats });
  };
};

/**
 * Clear friend data cache (useful for logout)
 */
export const useClearFriendCache = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.removeQueries({ queryKey: ['friends'] });
  };
};