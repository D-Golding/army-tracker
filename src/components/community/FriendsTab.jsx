// components/community/FriendsTab.jsx - Friends list and management
import React, { useState } from 'react';
import { Users, Mail, Search, MoreHorizontal, MessageCircle, FolderOpen, UserX } from 'lucide-react';
import { useFriendData, useRemoveFriend } from '../../hooks/useFriends';
import { formatDistanceToNow } from 'date-fns';

const FriendsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('friends');
  const { friends, pendingRequests, stats, isLoading, isError } = useFriendData();
  const removeFriendMutation = useRemoveFriend();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats placeholders */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="card-base card-padding animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>

        {/* Friends list placeholder */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-base card-padding animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
      <div className="card-base card-padding text-center">
        <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to Load Friends
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Something went wrong while loading your friends list
        </p>
      </div>
    );
  }

  const friendsCount = friends?.length || 0;
  const pendingCount = pendingRequests?.length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Friends Count */}
        <div className="card-base card-padding text-center border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {friendsCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
            Friends
          </div>
        </div>

        {/* Pending Requests */}
        <div className="card-base card-padding text-center border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {pendingCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
            Pending Requests
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="card-base">
        <div className="grid grid-cols-3 gap-1 p-1">
          <button
            onClick={() => setActiveSubTab('friends')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeSubTab === 'friends'
                ? 'gradient-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Users size={14} />
            Friends
            {friendsCount > 0 && (
              <span className="badge-tertiary text-xs ml-1">{friendsCount}</span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('requests')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeSubTab === 'requests'
                ? 'gradient-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Mail size={14} />
            Requests
            {pendingCount > 0 && (
              <span className="badge-warning text-xs ml-1">{pendingCount}</span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('find')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeSubTab === 'find'
                ? 'gradient-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Search size={14} />
            Find
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'friends' && (
        <FriendsList friends={friends} onRemoveFriend={removeFriendMutation.mutate} />
      )}

      {activeSubTab === 'requests' && (
        <FriendRequests requests={pendingRequests} />
      )}

      {activeSubTab === 'find' && (
        <FindFriends />
      )}
    </div>
  );
};

// Friends List Component
const FriendsList = ({ friends, onRemoveFriend }) => {
  const [showMenuFor, setShowMenuFor] = useState(null);

  if (!friends || friends.length === 0) {
    return (
      <div className="card-base card-padding text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Friends Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start connecting with other painters in the community!
        </p>
      </div>
    );
  }

  const formatFriendSince = (timestamp) => {
    try {
      const date = timestamp?.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
      return `Friends since ${date.toLocaleDateString('en-GB')}`;
    } catch (error) {
      return 'Recently connected';
    }
  };

  const getLastActive = (timestamp) => {
    try {
      const date = timestamp?.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Your Friends ({friends.length})
      </h3>

      {friends.map((friend) => (
        <div key={friend.userId} className="card-base card-padding">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              {friend.photoURL ? (
                <img
                  src={friend.photoURL}
                  alt={friend.displayName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {friend.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}

              {/* Online indicator */}
              {friend.showOnlineStatus && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              )}
            </div>

            {/* Friend Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                {friend.displayName}
              </h4>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>Active {getLastActive(friend.lastActive)}</p>
                <p>{formatFriendSince(friend.friendSince)}</p>
              </div>
            </div>

            {/* Friend Actions */}
            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              <button
                className="btn-secondary btn-sm"
                title="Send message"
              >
                <MessageCircle size={14} />
                Messages
              </button>

              <button
                className="btn-tertiary btn-sm"
                title="View projects"
              >
                <FolderOpen size={14} />
                Projects
              </button>

              {/* More Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenuFor(showMenuFor === friend.userId ? null : friend.userId)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <MoreHorizontal size={16} />
                </button>

                {showMenuFor === friend.userId && (
                  <>
                    <div
                      className="dropdown-backdrop"
                      onClick={() => setShowMenuFor(null)}
                    />
                    <div className="dropdown-menu right-0 top-full mt-1 min-w-32">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            if (window.confirm(`Remove ${friend.displayName} from your friends?`)) {
                              onRemoveFriend(friend.userId);
                            }
                            setShowMenuFor(null);
                          }}
                          className="dropdown-item-danger w-full"
                        >
                          <UserX size={14} />
                          Remove Friend
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Friend Requests Component (placeholder)
const FriendRequests = ({ requests }) => {
  return (
    <div className="card-base card-padding text-center">
      <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Friend Requests
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Friend request management coming soon
      </p>
    </div>
  );
};

// Find Friends Component (placeholder)
const FindFriends = () => {
  return (
    <div className="card-base card-padding text-center">
      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Find Friends
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Search and discovery features coming soon
      </p>
    </div>
  );
};

export default FriendsTab;