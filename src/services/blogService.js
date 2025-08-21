// services/blogService.js - Blog post management service
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
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

// Blog post categories and tags
export const BLOG_CATEGORIES = {
  PAINTING: 'painting',
  TACTICS: 'tactics',
  REVIEWS: 'reviews',
  TUTORIALS: 'tutorials',
  NEWS: 'news',
  SHOWCASE: 'showcase'
};

export const BLOG_TAGS = {
  // Games
  WARHAMMER_40K: 'warhammer-40k',
  AGE_OF_SIGMAR: 'age-of-sigmar',
  KILL_TEAM: 'kill-team',
  NECROMUNDA: 'necromunda',
  BLOOD_BOWL: 'blood-bowl',
  MIDDLE_EARTH: 'middle-earth',

  // Manufacturers
  GAMES_WORKSHOP: 'games-workshop',
  FORGE_WORLD: 'forge-world',
  CITADEL: 'citadel',
  VALLEJO: 'vallejo',
  ARMY_PAINTER: 'army-painter',

  // Techniques
  PAINTING: 'painting',
  KITBASHING: 'kitbashing',
  WEATHERING: 'weathering',
  BASING: 'basing',
  MAGNETIZING: 'magnetizing',

  // Tactics
  TACTICS: 'tactics',
  LIST_BUILDING: 'list-building',
  STRATEGY: 'strategy',
  COMPETITIVE: 'competitive',
  CASUAL: 'casual'
};

// Create new blog post
export const createBlogPost = async (postData, authorId) => {
  try {
    const blogPost = {
      ...postData,
      authorId,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      status: postData.status || 'published',
      featured: postData.featured || false
    };

    const docRef = await addDoc(collection(db, 'blogPosts'), blogPost);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating blog post:', error);
    return { success: false, error: error.message };
  }
};

// Update blog post
export const updateBlogPost = async (postId, updates) => {
  try {
    const postRef = doc(db, 'blogPosts', postId);
    await updateDoc(postRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating blog post:', error);
    return { success: false, error: error.message };
  }
};

// Delete blog post
export const deleteBlogPost = async (postId) => {
  try {
    await deleteDoc(doc(db, 'blogPosts', postId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return { success: false, error: error.message };
  }
};

// Get blog posts with pagination
export const getBlogPosts = async (options = {}) => {
  try {
    const {
      category = null,
      tags = [],
      status = 'published',
      limitCount = 10,
      lastDoc = null,
      featured = null
    } = options;

    let q = query(collection(db, 'blogPosts'));

    // Add filters
    if (status) {
      q = query(q, where('status', '==', status));
    }

    if (category) {
      q = query(q, where('category', '==', category));
    }

    if (tags.length > 0) {
      q = query(q, where('tags', 'array-contains-any', tags));
    }

    if (featured !== null) {
      q = query(q, where('featured', '==', featured));
    }

    // Order by published date
    q = query(q, orderBy('publishedAt', 'desc'));

    // Add pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    q = query(q, limit(limitCount));

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      posts,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === limitCount
    };
  } catch (error) {
    console.error('Error getting blog posts:', error);
    return { success: false, error: error.message };
  }
};

// Get single blog post
export const getBlogPost = async (postId) => {
  try {
    const docRef = doc(db, 'blogPosts', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Increment view count
      await updateDoc(docRef, {
        viewCount: increment(1)
      });

      return {
        success: true,
        post: {
          id: docSnap.id,
          ...docSnap.data()
        }
      };
    } else {
      return { success: false, error: 'Post not found' };
    }
  } catch (error) {
    console.error('Error getting blog post:', error);
    return { success: false, error: error.message };
  }
};

// Upload blog post image
export const uploadBlogImage = async (file, postId, imageIndex = 0) => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `blog/${postId}/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      url: downloadURL,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error('Error uploading blog image:', error);
    return { success: false, error: error.message };
  }
};

// Like/unlike blog post
export const toggleBlogPostLike = async (postId, userId) => {
  try {
    const postRef = doc(db, 'blogPosts', postId);
    const likesRef = doc(db, 'blogLikes', `${postId}_${userId}`);

    const likeDoc = await getDoc(likesRef);

    if (likeDoc.exists()) {
      // Unlike
      await deleteDoc(likesRef);
      await updateDoc(postRef, {
        likeCount: increment(-1)
      });
      return { success: true, liked: false };
    } else {
      // Like
      await addDoc(collection(db, 'blogLikes'), {
        postId,
        userId,
        likedAt: serverTimestamp()
      });
      await updateDoc(postRef, {
        likeCount: increment(1)
      });
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error('Error toggling blog post like:', error);
    return { success: false, error: error.message };
  }
};

// Get blog statistics for admin
export const getBlogStats = async () => {
  try {
    const postsSnapshot = await getDocs(collection(db, 'blogPosts'));
    const publishedPosts = postsSnapshot.docs.filter(doc => doc.data().status === 'published');
    const draftPosts = postsSnapshot.docs.filter(doc => doc.data().status === 'draft');

    return {
      success: true,
      stats: {
        totalPosts: postsSnapshot.size,
        publishedPosts: publishedPosts.length,
        draftPosts: draftPosts.length,
        totalViews: publishedPosts.reduce((sum, doc) => sum + (doc.data().viewCount || 0), 0),
        totalLikes: publishedPosts.reduce((sum, doc) => sum + (doc.data().likeCount || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error getting blog stats:', error);
    return { success: false, error: error.message };
  }
};