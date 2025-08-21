// components/newsfeed/PostComments.jsx - Comments display component with global styling
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
          <div key={i} className="comment-skeleton">
            <div className="comment-skeleton-layout">
              <div className="comment-skeleton-avatar"></div>
              <div className="comment-skeleton-content">
                <div className="comment-skeleton-author"></div>
                <div className="comment-skeleton-text"></div>
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
      <div className="comments-error-state">
        <AlertCircle className="comments-error-icon" />
        <p className="comments-error-text">
          {error?.message || 'Failed to load comments'}
        </p>
      </div>
    );
  }

  const comments = commentsData?.comments || [];

  // Empty state
  if (comments.length === 0) {
    return (
      <div className="comments-empty-state">
        <MessageCircle className="comments-empty-icon" />
        <p className="comments-empty-text">
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
    <div className="comment-item">
      {/* Commenter Avatar */}
      <div className="comment-avatar">
        {comment.authorData?.photoURL ? (
          <img
            src={comment.authorData.photoURL}
            alt={comment.authorData.displayName}
            className="comment-avatar-image"
          />
        ) : (
          <div className="comment-avatar-placeholder">
            <span className="comment-avatar-initial">
              {comment.authorData?.displayName?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="comment-content">
        <div className="comment-bubble">
          {/* Comment Header */}
          <div className="comment-header">
            <span className="comment-author-name">
              {comment.authorData?.displayName || 'Unknown User'}
            </span>
            <span className="comment-timestamp">
              {getTimeAgo()}
            </span>
            {comment.isEdited && (
              <span className="comment-edited-label">
                (edited)
              </span>
            )}
          </div>

          {/* Comment Text */}
          <p className="comment-text">
            {comment.content}
          </p>
        </div>

        {/* Comment Actions */}
        <div className="comment-actions">
          <button className="comment-reply-button">
            Reply
          </button>
          {comment.isReported && (
            <span className="comment-reported-label">
              Reported
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostComments;