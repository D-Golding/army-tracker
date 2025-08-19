// components/friends/UserSearchForm.jsx - User search form with results
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Users, X, Loader2 } from 'lucide-react';
import { useUserSearch } from '../../hooks/useFriends';
import { useFriendPermissions } from '../../hooks/useFriends';
import UserSearchCard from './UserSearchCard';

const UserSearchForm = ({
  onUserFound,
  onRequestSent,
  placeholder = "Search for users by name...",
  maxResults = 10,
  autoFocus = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { canSendFriendRequests, canUseFriendSystem } = useFriendPermissions();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 500);

    if (searchTerm.length >= 2) {
      setIsSearching(true);
    }

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search query
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError
  } = useUserSearch(debouncedSearchTerm, {
    enabled: debouncedSearchTerm.length >= 2 && canUseFriendSystem
  });

  // Memoized results
  const displayResults = useMemo(() => {
    if (!searchResults?.success) return [];
    return searchResults.users.slice(0, maxResults);
  }, [searchResults, maxResults]);

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsSearching(false);
  };

  // Handle request sent
  const handleRequestSent = (user) => {
    onRequestSent?.(user);
    // Optionally clear search after sending request
    // handleClearSearch();
  };

  // Handle user selection
  const handleUserFound = (user) => {
    onUserFound?.(user);
  };

  // Show loading state
  const showLoading = isSearching || isSearchLoading;

  // Check if should show results
  const shouldShowResults = debouncedSearchTerm.length >= 2 && !showLoading;

  if (!canUseFriendSystem) {
    return (
      <div className="card-base card-padding text-center">
        <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
          Community Access Required
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You need community access to search for and add friends.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="form-input pl-10 pr-10"
            autoFocus={autoFocus}
          />

          {/* Clear button */}
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}

          {/* Loading indicator */}
          {showLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
            </div>
          )}
        </div>

        {/* Search hint */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {searchTerm.length === 1 ? (
            'Type at least 2 characters to search'
          ) : canSendFriendRequests ? (
            'Search for users to send friend requests'
          ) : (
            'You can search but cannot send friend requests'
          )}
        </div>
      </div>

      {/* Search Results */}
      {shouldShowResults && (
        <div className="space-y-3">
          {searchError ? (
            <div className="text-center py-6">
              <div className="text-red-600 dark:text-red-400 text-sm">
                Failed to search users. Please try again.
              </div>
            </div>
          ) : displayResults.length === 0 ? (
            <div className="text-center py-6">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                No users found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Try searching with a different name or spelling
              </p>
            </div>
          ) : (
            <>
              {/* Results header */}
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Search Results
                </h4>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {displayResults.length} user{displayResults.length !== 1 ? 's' : ''} found
                </span>
              </div>

              {/* Results list */}
              <div className="space-y-3">
                {displayResults.map((user) => (
                  <UserSearchCard
                    key={user.userId}
                    user={user}
                    onRequestSent={handleRequestSent}
                    disabled={!canSendFriendRequests}
                  />
                ))}
              </div>

              {/* Show more indicator */}
              {searchResults?.users.length > maxResults && (
                <div className="text-center py-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {maxResults} of {searchResults.users.length} results
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Loading state */}
      {showLoading && debouncedSearchTerm.length >= 2 && (
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Searching for users...
          </p>
        </div>
      )}

      {/* Empty state when no search */}
      {!searchTerm && (
        <div className="text-center py-8">
          <Search className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Find New Friends
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Search for users by their display name to send friend requests
          </p>
        </div>
      )}
    </div>
  );
};

export default UserSearchForm;