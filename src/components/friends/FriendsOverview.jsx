// components/friends/FriendsOverview.jsx - Main friends overview with increment object protection
import React, { useState } from 'react';
import { Users, UserPlus, Inbox, Search, Settings, RefreshCw } from 'lucide-react';
import { useFriendData, useFriendPermissions } from '../../hooks/useFriends';
import FriendCard from './FriendCard';
import FriendRequestCard from './FriendRequestCard';
import UserSearchForm from './UserSearchForm';
import FriendSuggestions from './FriendSuggestions';

const FriendsOverview = ({
  onViewProfile,
  onSendMessage,
  onFriendshipSettings,
  defaultTab = 'friends'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showNotifications, setShowNotifications] = useState(true);

  const {
    friends,
    pendingRequests,
    sentRequests,
    stats,
    isLoading,
    isError,
    friendsQuery
  } = useFriendData();

  const { canUseFriendSystem, canSendFriendRequests, isMinor } = useFriendPermissions();

  // Helper function to safely get count values
  const getSafeCount = (value) => {
    if (typeof value === 'object') return 0;
    return value || 0;
  };

  // Handle tab navigation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle friend request sent from search
  const handleRequestSent = (user) => {
    setShowNotifications(true);
    // Optionally switch to sent requests tab
    setActiveTab('sent');
  };

  // Handle friend request accepted
  const handleRequestAccepted = (request) => {
    setShowNotifications(true);
    // Optionally switch to friends tab
    setActiveTab('friends');
  };

  // Get tab counts
  const getTabCounts = () => {
    return {
      friends: friends.length,
      pending: pendingRequests.length,
      sent: sentRequests.length
    };
  };

  const tabCounts = getTabCounts();

  // Show access required message for restricted users
  if (!canUseFriendSystem) {
    return (
      <div className="container-mobile space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Friends
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with other painters in the community
          </p>
        </div>

        <div className="card-base card-padding-lg text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isMinor ? 'Friends Not Available' : 'Community Access Required'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isMinor
              ? 'Friend features are not available for users under 18 for safety reasons.'
              : 'You need community access enabled to use friend features.'
            }
          </p>
          {!isMinor && (
            <button
              onClick={() => window.location.href = '/app/dashboard'}
              className="btn-primary"
            >
              <Settings size={16} />
              Go to Settings
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container-mobile space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Friends
          </h1>
        </div>

        <div className="card-base card-padding-lg text-center">
          <div className="loading-spinner-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your friends...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container-mobile space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Friends
          </h1>
        </div>

        <div className="card-base card-padding-lg text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            Failed to load friends data
          </div>
          <button
            onClick={() => friendsQuery.refetch()}
            className="btn-primary"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-mobile space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Friends
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with other painters in the community
        </p>
      </div>

      {/* Stats Summary - 2 column layout with increment object protection */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="summary-card-blue text-center">
            <div className="summary-value-blue">
              {getSafeCount(stats.friendCount)}
            </div>
            <div className="summary-label">
              Friend{getSafeCount(stats.friendCount) !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="summary-card-amber text-center">
            <div className="summary-value-amber">
              {getSafeCount(stats.pendingRequestsCount)}
            </div>
            <div className="summary-label">
              Pending Requests
            </div>
          </div>
        </div>
      )}

      {/* Notification for new requests */}
      {showNotifications && pendingRequests.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Inbox className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <div className="font-medium text-indigo-800 dark:text-indigo-300">
                  {pendingRequests.length} new friend request{pendingRequests.length !== 1 ? 's' : ''}
                </div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400">
                  Click to review and respond
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab('pending');
                setShowNotifications(false);
              }}
              className="btn-primary btn-sm"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => handleTabChange('friends')}
          className={`nav-tab ${activeTab === 'friends' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
        >
          <Users size={16} />
          Friends
          {tabCounts.friends > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 rounded-full">
              {tabCounts.friends}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('pending')}
          className={`nav-tab ${activeTab === 'pending' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
        >
          <Inbox size={16} />
          Requests
          {tabCounts.pending > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {tabCounts.pending}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('search')}
          className={`nav-tab ${activeTab === 'search' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
        >
          <Search size={16} />
          Find
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Friends List Tab */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No friends yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start by searching for users or check out friend suggestions
                </p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="btn-primary"
                >
                  <Search size={16} />
                  Find Friends
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Your Friends ({friends.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {friends.map((friend) => (
                    <FriendCard
                      key={friend.userId}
                      friend={friend}
                      onViewProfile={onViewProfile}
                      onMessage={onSendMessage}
                      onSettings={onFriendshipSettings}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Pending Requests Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No pending requests
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Friend requests will appear here when you receive them
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Friend Requests ({pendingRequests.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      type="received"
                      onAccept={handleRequestAccepted}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Sent Requests Section */}
            {sentRequests.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                    Sent Requests ({sentRequests.length})
                  </h3>

                  <div className="space-y-3">
                    {sentRequests.map((request) => (
                      <FriendRequestCard
                        key={request.id}
                        request={request}
                        type="sent"
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* User Search */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                Search Users
              </h3>
              <UserSearchForm
                onRequestSent={handleRequestSent}
                maxResults={8}
                autoFocus={true}
              />
            </div>

            {/* Friend Suggestions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <FriendSuggestions
                onRequestSent={handleRequestSent}
                maxSuggestions={3}
                showRefresh={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      {canSendFriendRequests && (
        <div className="fixed bottom-4 right-4 md:hidden">
          <button
            onClick={() => setActiveTab('search')}
            className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <UserPlus size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FriendsOverview;