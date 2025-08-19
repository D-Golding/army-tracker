// components/friends/FriendRequestCard.jsx - Individual friend request card
import React, { useState } from 'react';
import { User, Check, X, Clock, MessageCircle } from 'lucide-react';
import { useAcceptFriendRequest, useDeclineFriendRequest } from '../../hooks/useFriends';

const FriendRequestCard = ({
  request,
  type = 'received', // 'received' or 'sent'
  onAccept,
  onDecline,
  onCancel,
  disabled = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const acceptMutation = useAcceptFriendRequest();
  const declineMutation = useDeclineFriendRequest();

  // Format time remaining
  const formatTimeRemaining = (timeMs) => {
    if (timeMs <= 0) return 'Expired';

    const days = Math.floor(timeMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} left`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} left`;
    } else {
      return 'Less than 1 hour left';
    }
  };

  // Handle accept request
  const handleAccept = async () => {
    if (isProcessing || disabled) return;

    setIsProcessing(true);
    try {
      const result = await acceptMutation.mutateAsync(request.id);
      if (result.success) {
        onAccept?.(request);
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle decline request
  const handleDecline = async () => {
    if (isProcessing || disabled) return;

    setIsProcessing(true);
    try {
      const result = await declineMutation.mutateAsync(request.id);
      if (result.success) {
        onDecline?.(request);
      }
    } catch (error) {
      console.error('Failed to decline friend request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel request (for sent requests)
  const handleCancel = () => {
    if (isProcessing || disabled) return;
    onCancel?.(request);
  };

  const userData = type === 'received' ? request.fromUserData : request.toUserData;
  const isExpired = request.isExpired || request.timeRemaining <= 0;

  return (
    <div className={`card-base card-padding border-l-4 ${
      isExpired 
        ? 'border-l-gray-400 bg-gray-50 dark:bg-gray-800/50' 
        : type === 'received'
          ? 'border-l-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
          : 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20'
    }`}>
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {userData.photoURL ? (
            <img
              src={userData.photoURL}
              alt={userData.displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </div>

        {/* Request Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {userData.displayName}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {type === 'received'
                  ? 'Sent you a friend request'
                  : 'Friend request sent'
                }
              </p>

              {/* Message if present */}
              {request.message && request.message.trim() && (
                <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      "{request.message}"
                    </p>
                  </div>
                </div>
              )}

              {/* Time info */}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>
                  {isExpired
                    ? 'Expired'
                    : formatTimeRemaining(request.timeRemaining)
                  }
                </span>
                <span>•</span>
                <span>
                  {new Date(request.createdAt.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isExpired && (
            <div className="flex gap-2 mt-3">
              {type === 'received' ? (
                <>
                  <button
                    onClick={handleAccept}
                    disabled={isProcessing || disabled}
                    className="btn-primary btn-sm flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <div className="loading-spinner" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        Accept
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={isProcessing || disabled}
                    className="btn-tertiary btn-sm flex-1"
                  >
                    <X size={14} />
                    Decline
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCancel}
                  disabled={isProcessing || disabled}
                  className="btn-tertiary btn-sm"
                >
                  <X size={14} />
                  Cancel Request
                </button>
              )}
            </div>
          )}

          {/* Expired state */}
          {isExpired && (
            <div className="mt-3">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                Request Expired
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendRequestCard;