// components/friends/UserSearchCard.jsx - User card for search results (clean version without age labels)
import React, { useState } from 'react';
import { User, UserPlus, Check, Clock, X } from 'lucide-react';
import { useSendFriendRequest, useRelationshipStatus } from '../../hooks/useFriends';

const UserSearchCard = ({
  user,
  onRequestSent,
  disabled = false,
  showRelationshipStatus = true
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState('');

  const sendRequestMutation = useSendFriendRequest();
  const { data: relationshipData } = useRelationshipStatus(user.userId);

  // Handle send friend request
  const handleSendRequest = async () => {
    if (isProcessing || disabled) return;

    setIsProcessing(true);
    try {
      const result = await sendRequestMutation.mutateAsync({
        userId: user.userId,
        message: message.trim()
      });

      if (result.success) {
        onRequestSent?.(user);
        setShowMessageInput(false);
        setMessage('');
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle message input
  const handleToggleMessage = () => {
    setShowMessageInput(!showMessageInput);
    if (showMessageInput) {
      setMessage('');
    }
  };

  // Get relationship status display
  const getRelationshipStatus = () => {
    if (!relationshipData) return null;

    switch (relationshipData.status) {
      case 'friends':
        return {
          icon: Check,
          text: 'Friends',
          className: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'request_sent':
        return {
          icon: Clock,
          text: 'Request Sent',
          className: 'text-amber-600 dark:text-amber-400'
        };
      case 'request_received':
        return {
          icon: UserPlus,
          text: 'Wants to be Friends',
          className: 'text-indigo-600 dark:text-indigo-400'
        };
      default:
        return null;
    }
  };

  const relationshipStatus = getRelationshipStatus();
  const canSendRequest = relationshipData?.status === 'none' && user.canReceiveFriendRequests;

  return (
    <div className="card-base card-padding hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {user.displayName}
              </h3>

              {/* Relationship Status */}
              {showRelationshipStatus && relationshipStatus && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${relationshipStatus.className}`}>
                  <relationshipStatus.icon size={12} />
                  <span>{relationshipStatus.text}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {canSendRequest && (
              <div className="flex-shrink-0">
                {!showMessageInput ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendRequest}
                      disabled={isProcessing || disabled}
                      className="btn-primary btn-sm"
                    >
                      {isProcessing ? (
                        <>
                          <div className="loading-spinner" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} />
                          Add Friend
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleToggleMessage}
                      disabled={isProcessing || disabled}
                      className="btn-tertiary btn-sm"
                      title="Add message"
                    >
                      💬
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleToggleMessage}
                    disabled={isProcessing}
                    className="btn-tertiary btn-sm"
                    title="Cancel message"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Message Input */}
          {showMessageInput && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Optional Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Say hello or mention common interests..."
                  maxLength={200}
                  rows={2}
                  className="w-full text-sm p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  disabled={isProcessing}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {message.length}/200
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSendRequest}
                  disabled={isProcessing || disabled}
                  className="btn-primary btn-sm flex-1"
                >
                  {isProcessing ? (
                    <>
                      <div className="loading-spinner" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      Send Request
                    </>
                  )}
                </button>
                <button
                  onClick={handleToggleMessage}
                  disabled={isProcessing}
                  className="btn-tertiary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Relationship Status Info */}
          {!canSendRequest && relationshipStatus && (
            <div className="mt-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 ${relationshipStatus.className}`}>
                <relationshipStatus.icon size={12} />
                {relationshipStatus.text}
              </div>
            </div>
          )}

          {/* Cannot receive requests */}
          {!user.canReceiveFriendRequests && relationshipData?.status === 'none' && (
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                Cannot receive friend requests
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchCard;