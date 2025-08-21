// components/blog/BlogComments.jsx - Comments system for blog posts
import React, { useState, useEffect } from 'react';
import { MessageCircle, AlertCircle, User, Clock, Send, Flag } from 'lucide-react';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const BlogComments = ({ postId }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, 'blogComments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComments(commentsData);
        setLoading(false);
        setError('');
      },
      (error) => {
        console.error('Error loading comments:', error);
        setError('Failed to load comments');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || submitting) return;

    try {
      setSubmitting(true);

      // Add comment to Firestore
      await addDoc(collection(db, 'blogComments'), {
        postId,
        content: newComment.trim(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonymous',
        authorEmail: currentUser.email,
        authorPhotoURL: currentUser.photoURL || null,
        createdAt: serverTimestamp(),
        isReported: false,
        isEdited: false
      });

      // Update comment count on blog post
      const postRef = doc(db, 'blogPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (commentId) => {
    if (!currentUser) return;

    try {
      const commentRef = doc(db, 'blogComments', commentId);
      await updateDoc(commentRef, {
        isReported: true,
        reportedBy: currentUser.uid,
        reportedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'just now';
    try {
      const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
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

  if (error) {
    return (
      <div className="comments-error-state">
        <AlertCircle className="comments-error-icon" />
        <p className="comments-error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Add a comment</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this post..."
              className="form-textarea"
              rows="4"
              maxLength={1000}
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {newComment.length}/1000 characters
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="btn-primary btn-sm"
              >
                {submitting ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="card-base card-padding text-center bg-gray-50 dark:bg-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sign in to join the discussion
          </p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="btn-primary btn-sm"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="comments-empty-state">
          <MessageCircle className="comments-empty-icon" />
          <p className="comments-empty-text">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <BlogCommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onReport={() => handleReport(comment.id)}
              formatTimeAgo={formatTimeAgo}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Individual comment component
const BlogCommentItem = ({ comment, currentUser, onReport, formatTimeAgo }) => {
  const [showReportButton, setShowReportButton] = useState(false);

  const isOwnComment = currentUser && currentUser.uid === comment.authorId;

  return (
    <div className="comment-item">
      {/* Author Avatar */}
      <div className="comment-avatar">
        {comment.authorPhotoURL ? (
          <img
            src={comment.authorPhotoURL}
            alt={comment.authorName}
            className="comment-avatar-image"
          />
        ) : (
          <div className="comment-avatar-placeholder">
            <span className="comment-avatar-initial">
              {comment.authorName?.charAt(0)?.toUpperCase() || 'A'}
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
              {comment.authorName || 'Anonymous'}
            </span>
            <span className="comment-timestamp">
              {formatTimeAgo(comment.createdAt)}
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
          {!isOwnComment && currentUser && !comment.isReported && (
            <button
              onClick={onReport}
              className="comment-reply-button text-gray-400 hover:text-red-500"
              title="Report inappropriate content"
            >
              <Flag size={12} className="mr-1" />
              Report
            </button>
          )}

          {comment.isReported && (
            <span className="comment-reported-label">
              Reported for review
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogComments;