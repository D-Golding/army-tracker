// components/friends/FriendSuggestions.jsx - Friend suggestions display
import React, { useState } from 'react';
import { Users, UserPlus, RefreshCw, Sparkles, X } from 'lucide-react';
import { useFriendSuggestions, useSendFriendRequest } from '../../hooks/useFriends';
import UserSearchCard from './UserSearchCard';

const FriendSuggestions = ({
  onRequestSent,
  onDismissSuggestion,
  maxSuggestions = 5,
  showRefresh = true,
  compact = false
}) => {
  const [dismissedUsers, setDismissedUsers] = useState(new Set());

  const {
    data: suggestionsData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useFriendSuggestions();

  // Filter out dismissed suggestions
  const suggestions = suggestionsData?.suggestions?.filter(
    user => !dismissedUsers.has(user.userId)
  ).slice(0, maxSuggestions) || [];

  // Handle dismiss suggestion
  const handleDismissSuggestion = (user) => {
    setDismissedUsers(prev => new Set([...prev, user.userId]));
    onDismissSuggestion?.(user);
  };

  // Handle refresh suggestions
  const handleRefresh = () => {
    setDismissedUsers(new Set());
    refetch();
  };

  // Handle request sent
  const handleRequestSent = (user) => {
    // Remove from suggestions after sending request
    setDismissedUsers(prev => new Set([...prev, user.userId]));
    onRequestSent?.(user);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Friend Suggestions
          </h4>
        </div>

        <div className="text-center py-6">
          <div className="loading-spinner-primary mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Finding people you might know...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Friend Suggestions
          </h4>
          {showRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefetching}
              className="btn-tertiary btn-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Retry
            </button>
          )}
        </div>

        <div className="text-center py-6">
          <div className="text-red-600 dark:text-red-400 text-sm">
            Failed to load suggestions. Please try again.
          </div>
        </div>
      </div>
    );
  }

  // No suggestions available
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Friend Suggestions
          </h4>
          {showRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefetching}
              className="btn-tertiary btn-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>

        <div className="text-center py-6">
          <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            No suggestions right now
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Check back later for new friend suggestions, or try searching for users directly.
          </p>
        </div>
      </div>
    );
  }

  // Compact view for smaller spaces
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Suggestions
          </h4>
          {showRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefetching}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Refresh suggestions"
            >
              <RefreshCw className={`w-3 h-3 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {suggestions.map((user) => (
            <CompactSuggestionCard
              key={user.userId}
              user={user}
              onRequestSent={handleRequestSent}
              onDismiss={handleDismissSuggestion}
            />
          ))}
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Friend Suggestions
        </h4>
        {showRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="btn-tertiary btn-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>

      {/* Suggestions count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} found
      </div>

      {/* Suggestions list */}
      <div className="space-y-3">
        {suggestions.map((user) => (
          <SuggestionCard
            key={user.userId}
            user={user}
            onRequestSent={handleRequestSent}
            onDismiss={handleDismissSuggestion}
          />
        ))}
      </div>

      {/* Footer info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
        Suggestions are based on shared interests and community activity
      </div>
    </div>
  );
};

// Individual suggestion card component
const SuggestionCard = ({ user, onRequestSent, onDismiss }) => {
  return (
    <div className="card-base card-padding border-l-4 border-l-purple-400">
      <div className="flex items-start gap-4">
        {/* User info */}
        <div className="flex-1">
          <UserSearchCard
            user={user}
            onRequestSent={onRequestSent}
            showRelationshipStatus={false}
          />
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => onDismiss(user)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          title="Dismiss suggestion"
        >
          <X size={16} />
        </button>
      </div>

      {/* Suggestion reason */}
      {user.reason && (
        <div className="mt-3 pl-16">
          <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg inline-block">
            💡 {user.reason}
          </div>
        </div>
      )}

      {/* Mutual friends count */}
      {user.mutualFriends > 0 && (
        <div className="mt-2 pl-16">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {user.mutualFriends} mutual friend{user.mutualFriends !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

// Compact suggestion card for smaller spaces
const CompactSuggestionCard = ({ user, onRequestSent, onDismiss }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const sendRequestMutation = useSendFriendRequest();

  const handleSendRequest = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await sendRequestMutation.mutateAsync({
        userId: user.userId,
        message: ''
      });

      if (result.success) {
        onRequestSent(user);
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <Users className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {/* User name */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {user.displayName}
        </div>
        {user.reason && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.reason}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleSendRequest}
          disabled={isProcessing}
          className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
          title="Send friend request"
        >
          {isProcessing ? (
            <div className="w-4 h-4 border border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <UserPlus size={14} />
          )}
        </button>
        <button
          onClick={() => onDismiss(user)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default FriendSuggestions;