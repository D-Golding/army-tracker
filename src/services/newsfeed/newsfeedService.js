// services/newsfeed/newsfeedService.js - Core news feed operations with public posts support
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  runTransaction,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { getCurrentUserId } from '../shared/userHelpers.js';
import { getFriendsList } from '../friends/friendQueries.js';

/**
 * Create a new photo post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Result with success/error
 */
export const createPhotoPost = async (postData) => {
  try {
    const authorId = getCurrentUserId();

    // Get current user data
    const userDoc = await getDoc(doc(db, 'users', authorId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();

    // Check permissions
    if (userData.userCategory !== 'adult' || !userData.communityAccess) {
      throw new Error('Community access required to create posts');
    }

    // Validate required fields
    if (!postData.content || !postData.photos || postData.photos.length === 0) {
      throw new Error('Content and at least one photo are required');
    }

    // Validate photos array
    if (postData.photos.length > 10) {
      throw new Error('Maximum 10 photos allowed per post');
    }

    // Validate visibility setting
    const validVisibilities = ['public', 'friends', 'private'];
    const visibility = postData.visibility || 'public'; // Default to public
    if (!validVisibilities.includes(visibility)) {
      throw new Error('Invalid visibility setting');
    }

    // Ensure all photos have required fields
    const validatedPhotos = postData.photos.map((photo, index) => ({
      imageUrl: photo.imageUrl,
      storagePath: photo.storagePath || '',
      originalFileName: photo.originalFileName || '',
      title: photo.title || '',
      description: photo.description || '',
      aspectRatio: photo.aspectRatio || 'original',
      wasEdited: photo.wasEdited || false,
      order: photo.order !== undefined ? photo.order : index,
      metadata: photo.metadata || {}
    }));

    // Create post document
    const newPost = {
      authorId,
      type: 'photo',
      content: postData.content.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      // Author data (denormalized)
      authorData: {
        displayName: userData.displayName,
        photoURL: userData.photoURL || null,
        userCategory: userData.userCategory
      },

      // Photos array (replaces single photoData)
      photos: validatedPhotos,
      photoCount: validatedPhotos.length,

      // Engagement counters
      likes: {
        count: 0
      },
      comments: {
        count: 0
      },

      // Visibility and safety
      visibility: visibility, // Now supports public, friends, or private
      isReported: false,
      isFlagged: false,

      // Tags and relationships
      tags: postData.tags || [],
      relatedProjectId: postData.relatedProjectId || null,

      // Algorithm data
      engagement: {
        totalInteractions: 0,
        engagementRate: 0.0,
        lastEngagement: serverTimestamp()
      }
    };

    const docRef = await addDoc(collection(db, 'posts'), newPost);

    return {
      success: true,
      postId: docRef.id,
      message: 'Post created successfully'
    };

  } catch (error) {
    console.error('Error creating photo post:', error);
    return {
      success: false,
      error: error.message || 'Failed to create post'
    };
  }
};

/**
 * Get news feed with pagination support
 * @param {Object} params - Pagination parameters
 * @param {number} params.pageSize - Number of posts per page (default: 15)
 * @param {Object} params.lastDoc - Last document from previous page (for pagination)
 * @returns {Promise<Object>} Feed posts with pagination info
 */
export const getNewsFeed = async ({ pageSize = 15, lastDoc = null } = {}) => {
  try {
    const currentUserId = getCurrentUserId();

    // Get user's friends list
    const friendsResult = await getFriendsList(100);
    const friendIds = friendsResult.success ?
      friendsResult.friends.map(f => f.userId) : [];

    // Get posts with mixed visibility:
    // 1. Public posts from everyone
    // 2. Friends posts from friends + self
    // 3. Private posts from self only

    let feedQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(pageSize * 2) // Get more to filter properly
    );

    // Add pagination cursor if provided
    if (lastDoc) {
      feedQuery = query(feedQuery, startAfter(lastDoc));
    }

    const snapshot = await getDocs(feedQuery);

    // Convert to posts array with document references for pagination
    const allPosts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      _doc: doc // Keep reference for pagination
    }));

    // Filter posts based on visibility rules
    const allowedUserIds = [currentUserId, ...friendIds];
    const filteredPosts = allPosts.filter(post => {
      switch (post.visibility) {
        case 'public':
          return true; // Everyone can see public posts
        case 'friends':
          return allowedUserIds.includes(post.authorId); // Only friends + self can see friends posts
        case 'private':
          return post.authorId === currentUserId; // Only author can see private posts
        default:
          return false; // Unknown visibility, exclude
      }
    });

    // Remove duplicates and sort by creation time
    const uniquePosts = [];
    const seenIds = new Set();

    for (const post of filteredPosts) {
      if (!seenIds.has(post.id)) {
        seenIds.add(post.id);
        uniquePosts.push(post);
      }
    }

    // Sort by creation time (most recent first)
    uniquePosts.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    // Take only the requested amount
    const limitedPosts = uniquePosts.slice(0, pageSize);

    // Determine if there are more posts (simplified approach)
    const hasNextPage = snapshot.docs.length === pageSize * 2 && limitedPosts.length === pageSize;
    const nextPageCursor = hasNextPage && limitedPosts.length > 0
      ? limitedPosts[limitedPosts.length - 1]._doc
      : null;

    // Clean up the _doc references before returning
    const cleanPosts = limitedPosts.map(({ _doc, ...post }) => post);

    return {
      success: true,
      posts: cleanPosts,
      hasNextPage,
      nextPageCursor,
      totalFetched: cleanPosts.length
    };

  } catch (error) {
    console.error('Error getting news feed:', error);
    return {
      success: false,
      error: error.message || 'Failed to load news feed',
      posts: [],
      hasNextPage: false,
      nextPageCursor: null,
      totalFetched: 0
    };
  }
};

/**
 * Get posts from a specific user (for user's post management page)
 * @param {string} userId - User ID to get posts for
 * @param {number} limitCount - Number of posts to fetch (optional, defaults to all)
 * @returns {Promise<Object>} User's posts
 */
export const getUserPosts = async (userId, limitCount = null) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    let q = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    // Apply limit if specified
    if (limitCount && limitCount > 0) {
      q = query(q, limit(limitCount));
    }

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      posts,
      total: posts.length
    };

  } catch (error) {
    console.error('Error getting user posts:', error);
    return {
      success: false,
      error: error.message || 'Failed to load user posts',
      posts: [],
      total: 0
    };
  }
};

/**
 * Get posts from the current user (for internal feed use)
 */
const getUserPostsInternal = async (userId, limitCount) => {
  try {
    let q = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      where('visibility', 'in', ['public', 'friends']), // Include both public and friends posts
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return posts;

  } catch (error) {
    console.error('Error getting user posts:', error);
    return [];
  }
};

/**
 * Get posts from user's friends
 */
const getFriendPosts = async (friendIds, limitCount, lastDoc) => {
  try {
    // Firebase 'in' operator is limited to 10 values
    const chunks = [];
    for (let i = 0; i < friendIds.length; i += 10) {
      chunks.push(friendIds.slice(i, i + 10));
    }

    const allPosts = [];

    for (const chunk of chunks) {
      let q = query(
        collection(db, 'posts'),
        where('authorId', 'in', chunk),
        where('visibility', 'in', ['public', 'friends']), // Include both public and friends posts
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      allPosts.push(...posts);
    }

    // Sort and limit
    allPosts.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    return allPosts.slice(0, limitCount);

  } catch (error) {
    console.error('Error getting friend posts:', error);
    return [];
  }
};

/**
 * Get random posts (excluding specified users)
 */
const getRandomPosts = async (limitCount, excludeUserIds) => {
  try {
    // Get recent public posts excluding specified users
    let q = query(
      collection(db, 'posts'),
      where('visibility', '==', 'public'), // Only public posts for discovery
      orderBy('createdAt', 'desc'),
      limit(limitCount * 3) // Get more to filter
    );

    const snapshot = await getDocs(q);
    const posts = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(post => !excludeUserIds.includes(post.authorId))
      .slice(0, limitCount);

    return posts;

  } catch (error) {
    console.error('Error getting random posts:', error);
    return [];
  }
};

/**
 * Like/unlike a post
 * @param {string} postId - Post ID to like
 * @returns {Promise<Object>} Result with success/error
 */
export const togglePostLike = async (postId) => {
  try {
    const currentUserId = getCurrentUserId();
    const likeId = `${postId}_${currentUserId}`;

    return await runTransaction(db, async (transaction) => {
      // Check if like already exists
      const likeRef = doc(db, 'postLikes', likeId);
      const likeDoc = await transaction.get(likeRef);

      const postRef = doc(db, 'posts', postId);
      const postDoc = await transaction.get(postRef);

      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const currentUser = await transaction.get(doc(db, 'users', currentUserId));
      const userData = currentUser.data();

      if (likeDoc.exists()) {
        // Unlike - remove like
        transaction.delete(likeRef);
        transaction.update(postRef, {
          'likes.count': increment(-1),
          'engagement.totalInteractions': increment(-1),
          'engagement.lastEngagement': serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        return {
          success: true,
          action: 'unliked',
          message: 'Post unliked'
        };
      } else {
        // Like - add like
        const likeData = {
          postId,
          userId: currentUserId,
          authorId: postDoc.data().authorId,
          createdAt: serverTimestamp(),
          userData: {
            displayName: userData.displayName,
            photoURL: userData.photoURL || null
          }
        };

        transaction.set(likeRef, likeData);
        transaction.update(postRef, {
          'likes.count': increment(1),
          'engagement.totalInteractions': increment(1),
          'engagement.lastEngagement': serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        return {
          success: true,
          action: 'liked',
          message: 'Post liked'
        };
      }
    });

  } catch (error) {
    console.error('Error toggling post like:', error);
    return {
      success: false,
      error: error.message || 'Failed to update like'
    };
  }
};

/**
 * Add comment to a post
 * @param {string} postId - Post ID
 * @param {string} content - Comment content
 * @returns {Promise<Object>} Result with success/error
 */
export const addComment = async (postId, content) => {
  try {
    const currentUserId = getCurrentUserId();

    if (!content || content.trim().length === 0) {
      throw new Error('Comment content is required');
    }

    if (content.trim().length > 500) {
      throw new Error('Comment is too long (max 500 characters)');
    }

    // Get current user data
    const userDoc = await getDoc(doc(db, 'users', currentUserId));
    const userData = userDoc.data();

    const commentData = {
      postId,
      authorId: currentUserId,
      content: content.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      authorData: {
        displayName: userData.displayName,
        photoURL: userData.photoURL || null,
        userCategory: userData.userCategory
      },

      isEdited: false,
      isReported: false,
      isFlagged: false,
      replyTo: null,
      repliesCount: 0
    };

    // Add comment and update post counters
    const batch = writeBatch(db);

    const commentRef = doc(collection(db, 'posts', postId, 'comments'));
    batch.set(commentRef, commentData);

    const postRef = doc(db, 'posts', postId);
    batch.update(postRef, {
      'comments.count': increment(1),
      'engagement.totalInteractions': increment(1),
      'engagement.lastEngagement': serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await batch.commit();

    return {
      success: true,
      commentId: commentRef.id,
      message: 'Comment added successfully'
    };

  } catch (error) {
    console.error('Error adding comment:', error);
    return {
      success: false,
      error: error.message || 'Failed to add comment'
    };
  }
};

/**
 * Get comments for a post
 * @param {string} postId - Post ID
 * @param {number} limitCount - Number of comments to fetch
 * @returns {Promise<Object>} Comments list
 */
export const getPostComments = async (postId, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      comments
    };

  } catch (error) {
    console.error('Error getting comments:', error);
    return {
      success: false,
      error: error.message || 'Failed to load comments',
      comments: []
    };
  }
};

/**
 * Check if current user has liked a post
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>} Whether user has liked the post
 */
export const hasUserLikedPost = async (postId) => {
  try {
    const currentUserId = getCurrentUserId();
    const likeId = `${postId}_${currentUserId}`;

    const likeDoc = await getDoc(doc(db, 'postLikes', likeId));
    return likeDoc.exists();

  } catch (error) {
    console.error('Error checking post like:', error);
    return false;
  }
};

/**
 * Delete a post (only by author)
 * @param {string} postId - Post ID to delete
 * @returns {Promise<Object>} Result with success/error
 */
export const deletePost = async (postId) => {
  try {
    const currentUserId = getCurrentUserId();

    // Check if user owns the post
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    if (postDoc.data().authorId !== currentUserId) {
      throw new Error('You can only delete your own posts');
    }

    // Delete post and related data
    const batch = writeBatch(db);

    // Delete the post
    batch.delete(doc(db, 'posts', postId));

    // Delete all likes for this post
    const likesQuery = query(
      collection(db, 'postLikes'),
      where('postId', '==', postId)
    );
    const likesSnapshot = await getDocs(likesQuery);
    likesSnapshot.docs.forEach(likeDoc => {
      batch.delete(likeDoc.ref);
    });

    await batch.commit();

    // Note: Comments are automatically deleted with the post document
    // due to Firestore subcollection behavior

    return {
      success: true,
      message: 'Post deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting post:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete post'
    };
  }
};