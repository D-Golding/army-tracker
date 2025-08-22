// services/newsfeed/newsfeedService.js - Updated with video support
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { auth } from '../../firebase';

/**
 * Create a new photo/video post
 * @param {Object} postData - Post data
 * @param {string} postData.content - Post caption/content
 * @param {Array} postData.media - Array of media objects (photos/videos)
 * @param {Array} postData.tags - Array of tags
 * @param {string} postData.visibility - Post visibility (public, friends, private)
 * @returns {Promise<{success: boolean, postId?: string, error?: string}>}
 */
export const createPhotoPost = async (postData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Validate required fields
    if (!postData.content || !postData.content.trim()) {
      throw new Error('Post content is required');
    }

    if (!postData.media || postData.media.length === 0) {
      throw new Error('At least one photo or video is required');
    }

    // Validate media array
    for (const mediaItem of postData.media) {
      if (!mediaItem.url || !mediaItem.type) {
        throw new Error('Invalid media data: missing URL or type');
      }
      if (!['photo', 'video'].includes(mediaItem.type)) {
        throw new Error(`Invalid media type: ${mediaItem.type}`);
      }
    }

    // Prepare post document
    const postDoc = {
      // Basic post info
      userId: currentUser.uid,
      content: postData.content.trim(),
      type: 'mixed_media', // Can contain photos, videos, or both

      // Media array with enhanced metadata
      media: postData.media.map((item, index) => ({
        type: item.type, // 'photo' or 'video'
        url: item.url,
        storagePath: item.storagePath || null,
        order: index,

        // Media metadata
        title: item.title || '',
        description: item.description || '',
        originalFileName: item.originalFileName || `${item.type}_${index}`,

        // Technical metadata
        metadata: {
          fileSize: item.metadata?.fileSize || 0,
          fileType: item.metadata?.fileType || '',
          uploadedAt: item.metadata?.uploadedAt || new Date().toISOString(),
          wasEdited: item.metadata?.wasEdited || false,
          ...item.metadata
        }
      })),

      // Post metadata
      tags: postData.tags || [],
      visibility: postData.visibility || 'public',

      // Engagement counters
      likes: {
        count: 0,
        userIds: []
      },
      comments: {
        count: 0
      },

      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      // Content statistics
      mediaCount: postData.media.length,
      photoCount: postData.media.filter(m => m.type === 'photo').length,
      videoCount: postData.media.filter(m => m.type === 'video').length,

      // Status flags
      isActive: true,
      isPinned: false,

      // User info snapshot (for efficient querying)
      userDisplayName: currentUser.displayName || 'Anonymous',
      userPhotoURL: currentUser.photoURL || null
    };

    console.log('📝 Creating mixed media post:', {
      mediaCount: postDoc.mediaCount,
      photoCount: postDoc.photoCount,
      videoCount: postDoc.videoCount,
      userId: currentUser.uid
    });

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'posts'), postDoc);

    console.log('✅ Post created successfully:', docRef.id);

    return {
      success: true,
      postId: docRef.id
    };

  } catch (error) {
    console.error('Error creating post:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get news feed posts with pagination
 * @param {Object} options - Query options
 * @param {number} options.pageSize - Number of posts per page
 * @param {DocumentSnapshot} options.lastDoc - Last document for pagination
 * @returns {Promise<{posts: Array, hasNextPage: boolean, nextPageCursor: DocumentSnapshot}>}
 */
export const getNewsFeed = async ({ pageSize = 15, lastDoc = null } = {}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Build query
    let q = query(
      collection(db, 'posts'),
      where('isActive', '==', true),
      where('visibility', 'in', ['public', 'friends']), // Exclude private posts
      orderBy('createdAt', 'desc'),
      limit(pageSize + 1) // Get one extra to check if there are more
    );

    // Add pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const posts = [];
    const docs = querySnapshot.docs;

    // Process posts (excluding the extra one used for pagination check)
    const postsToProcess = docs.slice(0, pageSize);

    for (const doc of postsToProcess) {
      const data = doc.data();

      // Enhanced post object with media type detection
      const post = {
        id: doc.id,
        ...data,

        // Convert Firestore timestamps
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),

        // Ensure media array exists and is properly formatted
        media: data.media || [],

        // Convenience flags for UI
        hasPhotos: (data.photoCount || 0) > 0,
        hasVideos: (data.videoCount || 0) > 0,
        isMixedMedia: (data.photoCount || 0) > 0 && (data.videoCount || 0) > 0,

        // Legacy compatibility for existing components
        photos: data.media?.filter(m => m.type === 'photo') || [],
        videos: data.media?.filter(m => m.type === 'video') || []
      };

      posts.push(post);
    }

    // Check if there are more posts
    const hasNextPage = docs.length > pageSize;
    const nextPageCursor = hasNextPage ? docs[pageSize - 1] : null;

    console.log(`📰 Loaded ${posts.length} posts (hasNextPage: ${hasNextPage})`);

    return {
      posts,
      hasNextPage,
      nextPageCursor
    };

  } catch (error) {
    console.error('Error fetching news feed:', error);
    throw new Error(`Failed to load news feed: ${error.message}`);
  }
};

/**
 * Get posts by a specific user
 * @param {string} userId - User ID
 * @returns {Promise<{posts: Array}>}
 */
export const getUserPosts = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const q = query(
      collection(db, 'posts'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const posts = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        media: data.media || [],
        hasPhotos: (data.photoCount || 0) > 0,
        hasVideos: (data.videoCount || 0) > 0,
        isMixedMedia: (data.photoCount || 0) > 0 && (data.videoCount || 0) > 0,
        photos: data.media?.filter(m => m.type === 'photo') || [],
        videos: data.media?.filter(m => m.type === 'video') || []
      });
    });

    console.log(`👤 Loaded ${posts.length} posts for user ${userId}`);

    return { posts };

  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw new Error(`Failed to load user posts: ${error.message}`);
  }
};

/**
 * Toggle like on a post
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, isLiked: boolean}>}
 */
export const togglePostLike = async (postId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const postData = postDoc.data();
    const currentLikes = postData.likes || { count: 0, userIds: [] };
    const isCurrentlyLiked = currentLikes.userIds.includes(currentUser.uid);

    if (isCurrentlyLiked) {
      // Unlike the post
      await updateDoc(postRef, {
        'likes.count': increment(-1),
        'likes.userIds': arrayRemove(currentUser.uid),
        updatedAt: serverTimestamp()
      });

      return { success: true, isLiked: false };
    } else {
      // Like the post
      await updateDoc(postRef, {
        'likes.count': increment(1),
        'likes.userIds': arrayUnion(currentUser.uid),
        updatedAt: serverTimestamp()
      });

      return { success: true, isLiked: true };
    }

  } catch (error) {
    console.error('Error toggling post like:', error);
    throw new Error(`Failed to toggle like: ${error.message}`);
  }
};

/**
 * Check if current user has liked a post
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>}
 */
export const hasUserLikedPost = async (postId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) return false;

    const postData = postDoc.data();
    const likes = postData.likes || { userIds: [] };

    return likes.userIds.includes(currentUser.uid);

  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

/**
 * Add a comment to a post
 * @param {string} postId - Post ID
 * @param {string} content - Comment content
 * @returns {Promise<{success: boolean, commentId?: string}>}
 */
export const addComment = async (postId, content) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    if (!content || !content.trim()) {
      throw new Error('Comment content is required');
    }

    // Add comment to comments subcollection
    const commentData = {
      userId: currentUser.uid,
      userDisplayName: currentUser.displayName || 'Anonymous',
      userPhotoURL: currentUser.photoURL || null,
      content: content.trim(),
      createdAt: serverTimestamp(),
      isActive: true
    };

    const commentRef = await addDoc(
      collection(db, 'posts', postId, 'comments'),
      commentData
    );

    // Update comment count on post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      'comments.count': increment(1),
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      commentId: commentRef.id
    };

  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error(`Failed to add comment: ${error.message}`);
  }
};

/**
 * Get comments for a post
 * @param {string} postId - Post ID
 * @returns {Promise<{comments: Array}>}
 */
export const getPostComments = async (postId) => {
  try {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const comments = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });

    return { comments };

  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new Error(`Failed to load comments: ${error.message}`);
  }
};

/**
 * Delete a post (soft delete)
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean}>}
 */
export const deletePost = async (postId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const postData = postDoc.data();

    // Check if user owns the post
    if (postData.userId !== currentUser.uid) {
      throw new Error('You can only delete your own posts');
    }

    // Soft delete
    await updateDoc(postRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true };

  } catch (error) {
    console.error('Error deleting post:', error);
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};