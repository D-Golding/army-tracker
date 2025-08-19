// components/friends/FriendCard.jsx - Individual friend card in friends list
import React, { useState } from 'react';
import { User, MessageCircle, MoreVertical, UserMinus, Settings, Eye } from 'lucide-react';
import { useRemoveFriend } from '../../hooks/useFriends';

const FriendCard = ({
  friend,
  onRemove,
  onSettings,
  onViewProfile,
  onMessage,
  disabled = false,
  showLastActive = true
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const removeFriendMutation = useRemoveFriend();

  // Format last active time
  const formatLastActive = (lastActive) => {
    if (!lastActive) return 'Never';

    const now = new Date();
    const activeDate = lastActive.seconds ? new Date(lastActive.seconds * 1000) : new Date(lastActive);
    const diffMs = now - activeDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 5) return 'Online';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return activeDate.toLocaleDateString();
  };

  // Handle remove friend
  const handleRemoveFriend = async () => {
    if (isProcessing || disabled) return;

    const confirmed = window.confirm(`Are you sure you want to remove ${friend.displayName} as a friend?`);
    if (!confirmed) return;

    setIsProcessing(true);
    setShowDropdown(false);

    try {
      const result = await removeFriendMutation.mutateAsync(friend.userId);
      if (result.success) {
        onRemove?.(friend);
      }
    } catch (error) {
      console.error('Failed to remove friend:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle dropdown actions
  const handleViewProfile = () => {
    setShowDropdown(false);
    onViewProfile?.(friend);
  };

  const handleSettings = () => {
    setShowDropdown(false);
    onSettings?.(friend);
  };

  const handleMessage = () => {
    setShowDropdown(false);
    onMessage?.(friend);
  };

  // Format friend since date
  const formatFriendSince = (date) => {
    if (!date) return '';
    const friendDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return friendDate.toLocaleDateString();
  };

  // Get online status indicator
  const getOnlineStatus = () => {
    if (!friend.showOnlineStatus || !showLastActive) return null;

    const lastActive = friend.lastActive;
    if (!lastActive) return 'offline';

    const now = new Date();
    const activeDate = lastActive.seconds ? new Date(lastActive.seconds * 1000) : new Date(lastActive);
    const diffMinutes = Math.floor((now - activeDate) / (1000 * 60));

    if (diffMinutes < 5) return 'online';
    if (diffMinutes < 15) return 'away';
    return 'offline';
  };

  const onlineStatus = getOnlineStatus();

  return (
    <div className="card-base card-padding hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
      <div className="flex items-start gap-4">
        {/* Friend Avatar with Online Status */}
        <div className="flex-shrink-0 relative">
          {friend.photoURL ? (
            <img
              src={friend.photoURL}
              alt={friend.displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
          )}

          {/* Online Status Indicator */}
          {onlineStatus && (
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
              onlineStatus === 'online' ? 'bg-emerald-500' :
              onlineStatus === 'away' ? 'bg-amber-500' :
              'bg-gray-400'
            }`} />
          )}
        </div>

        {/* Friend Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {friend.displayName}
              </h3>

              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                {showLastActive && onlineStatus && (
                  <span className={`text-xs ${
                    onlineStatus === 'online' ? 'text-emerald-600 dark:text-emerald-400' :
                    onlineStatus === 'away' ? 'text-amber-600 dark:text-amber-400' :
                    'text-gray-500 dark:text-gray-500'
                  }`}>
                    {onlineStatus === 'online' ? 'Online' :
                     onlineStatus === 'away' ? 'Away' :
                     formatLastActive(friend.lastActive)}
                  </span>
                )}

                {friend.friendSince && (
                  <>
                    {showLastActive && onlineStatus && <span>•</span>}
                    <span className="text-xs">
                      Friends since {formatFriendSince(friend.friendSince)}
                    </span>
                  </>
                )}
              </div>

              {/* Friend Settings Indicators */}
              <div className="flex items-center gap-1 mt-2">
                {friend.canMessage && (
                  <span className="badge-secondary text-xs">Messages</span>
                )}
                {friend.settings?.allowProjectSharing && (
                  <span className="badge-blue text-xs">Projects</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Quick Message Button */}
              {friend.canMessage && onMessage && (
                <button
                  onClick={handleMessage}
                  disabled={disabled || isProcessing}
                  className="btn-tertiary btn-sm"
                  title="Send message"
                >
                  <MessageCircle size={14} />
                </button>
              )}

              {/* Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={disabled || isProcessing}
                  className="btn-tertiary btn-sm"
                  title="More options"
                >
                  <MoreVertical size={14} />
                </button>

                {showDropdown && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="dropdown-backdrop"
                      onClick={() => setShowDropdown(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="dropdown-menu right-0 top-full mt-1 w-48 py-1">
                      <button
                        onClick={handleViewProfile}
                        className="dropdown-item-primary"
                      >
                        <Eye size={14} />
                        View Profile
                      </button>

                      {onMessage && friend.canMessage && (
                        <button
                          onClick={handleMessage}
                          className="dropdown-item"
                        >
                          <MessageCircle size={14} />
                          Send Message
                        </button>
                      )}

                      {onSettings && (
                        <button
                          onClick={handleSettings}
                          className="dropdown-item"
                        >
                          <Settings size={14} />
                          Friendship Settings
                        </button>
                      )}

                      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                      <button
                        onClick={handleRemoveFriend}
                        className="dropdown-item-danger"
                        disabled={isProcessing}
                      >
                        <UserMinus size={14} />
                        {isProcessing ? 'Removing...' : 'Remove Friend'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;