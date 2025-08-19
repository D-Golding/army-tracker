// components/newsfeed/PostComments.jsx - Comments display component
import React from 'react';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { usePostComments } from '../../hooks/useNewsfeed';
import { formatDistanceToNow } from 'date-fns';

const PostComments = ({ postId }) => {
  const { data: commentsData, isLoading, isError, error } = usePostComments(postId, true);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error?.message || 'Failed to load comments'}
        </p>
      </div>
    );
  }

  const comments = commentsData?.comments || [];

  // Empty state
  if (comments.length === 0) {
    return (
      <div className="text-center py-6">
        <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

const CommentItem = ({ comment }) => {
  // Format timestamp
  const getTimeAgo = () => {
    try {
      const timestamp = comment.createdAt?.seconds
        ? new Date(comment.createdAt.seconds * 1000)
        : new Date(comment.createdAt);
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <div className="flex gap-3">
      {/* Commenter Avatar */}
      <div className="flex-shrink-0">
        {comment.authorData?.photoURL ? (
          <img
            src={comment.authorData.photoURL}
            alt={comment.authorData.displayName}
            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-xs">
              {comment.authorData?.displayName?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
          {/* Comment Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              {comment.authorData?.displayName || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getTimeAgo()}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                (edited)
              </span>
            )}
          </div>

          {/* Comment Text */}
          <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-4 mt-2 ml-3">
          <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
            Reply
          </button>
          {comment.isReported && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Reported
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostComments;