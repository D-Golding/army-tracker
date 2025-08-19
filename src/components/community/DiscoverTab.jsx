// components/community/DiscoverTab.jsx - User discovery and friend suggestions
import React, { useState } from 'react';
import { Search, Users, UserPlus, Compass, Star, AlertCircle } from 'lucide-react';
import { useUserSearch, useFriendSuggestions, useSendFriendRequest } from '../../hooks/useFriends';

const DiscoverTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);

  const { data: searchResults, isLoading: isSearching } = useUserSearch(searchTerm, {
    enabled: searchEnabled && searchTerm.length >= 2
  });

  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useFriendSuggestions();
  const sendFriendRequestMutation = useSendFriendRequest();

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 2) {
      setSearchEnabled(true);
    }
  };

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.length < 2) {
      setSearchEnabled(false);
    }
  };

  // Handle friend request
  const handleSendFriendRequest = (userId, userName) => {
    sendFriendRequestMutation.mutate(
      { userId, message: '' },
      {
        onSuccess: (result) => {
          if (result.success) {
            // Success handled by React Query cache updates
          }
        }
      }
    );
  };

  const suggestions = suggestionsData?.suggestions || [];
  const searchUsers = searchResults?.users || [];

  return (
    <div className="space-y-6">
      {/* Discover Header */}
      <div className="text-center">
        <Compass className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Discover Painters
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Find and connect with other miniature painters
        </p>
      </div>

      {/* Search Section */}
      <div className="card-base card-padding">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Search size={20} />
          Search Users
        </h3>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by username..."
              className="form-input flex-1"
              minLength={2}
            />
            <button
              type="submit"
              disabled={searchTerm.length < 2 || isSearching}
              className="btn-primary btn-md"
            >
              {isSearching ? (
                <div className="loading-spinner" />
              ) : (
                <Search size={16} />
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter at least 2 characters to search
          </p>
        </form>

        {/* Search Results */}
        {searchEnabled && (
          <div className="mt-6">
            {isSearching ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3 p-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchUsers.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Search Results ({searchUsers.length})
                </h4>
                {searchUsers.map((user) => (
                  <UserCard
                    key={user.userId}
                    user={user}
                    onSendRequest={handleSendFriendRequest}
                    isLoading={sendFriendRequestMutation.isPending}
                    showReason={false}
                  />
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="text-center py-6">
                <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No users found matching "{searchTerm}"
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Friend Suggestions */}
      <div className="card-base card-padding">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Star size={20} />
          Suggested for You
        </h3>

        {isLoadingSuggestions ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-3 p-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((user) => (
              <UserCard
                key={user.userId}
                user={user}
                onSendRequest={handleSendFriendRequest}
                isLoading={sendFriendRequestMutation.isPending}
                showReason={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No suggestions available right now
            </p>
          </div>
        )}
      </div>

      {/* Discovery Tips */}
      <div className="card-base card-padding bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
              Tips for Finding Friends
            </p>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs">
              <li>• Search for painters by their display name</li>
              <li>• Connect with suggested users who share similar interests</li>
              <li>• Be respectful when sending friend requests</li>
              <li>• You can send up to 300 friend requests per month</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Card Component
const UserCard = ({ user, onSendRequest, isLoading, showReason = false }) => {
  const [requestSent, setRequestSent] = useState(false);

  const handleSendRequest = () => {
    onSendRequest(user.userId, user.displayName);
    setRequestSent(true);
  };

  return (
    <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.displayName?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {user.displayName}
          </h4>

          {showReason && user.reason && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.reason}
            </p>
          )}

          {user.mutualFriends > 0 && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              {user.mutualFriends} mutual friend{user.mutualFriends !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {requestSent ? (
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              Request Sent
            </div>
          ) : (
            <button
              onClick={handleSendRequest}
              disabled={isLoading || !user.canReceiveFriendRequests}
              className="btn-primary btn-sm"
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                <>
                  <UserPlus size={14} />
                  Add Friend
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverTab;