// Firebase structure for news feed system

/**
 * POSTS COLLECTION STRUCTURE
 * Collection: posts
 * Document ID: auto-generated
 */

const postSchema = {
  // Basic post info
  id: "auto-generated",
  authorId: "user-uid",
  type: "photo", // 'photo', 'project', 'battle_report' (future)
  content: "User's post text/caption",

  // Timestamps
  createdAt: "serverTimestamp()",
  updatedAt: "serverTimestamp()",

  // Author info (denormalized for performance)
  authorData: {
    displayName: "User Name",
    photoURL: "profile-photo-url",
    userCategory: "adult" // for safety checks
  },

  // Photo-specific data (when type === 'photo')
  photoData: {
    imageUrl: "firebase-storage-url",
    storagePath: "storage/path",
    originalFileName: "filename.jpg",
    title: "Photo title",
    description: "Photo description",
    aspectRatio: "square", // 'square', 'portrait', 'landscape', 'original'
    wasEdited: true, // boolean
    metadata: {
      // EXIF data, dimensions, etc.
    }
  },

  // Engagement
  likes: {
    count: 0,
    // No subcollection for likes - we'll use a separate collection for privacy
  },

  comments: {
    count: 0,
    // Comments will be in a subcollection
  },

  // Visibility & Safety
  visibility: "friends", // 'friends', 'public' (future)
  isReported: false,
  isFlagged: false,

  // Additional metadata
  tags: [], // Array of strings
  relatedProjectId: null, // If posted from a project

  // Feed algorithm data
  engagement: {
    totalInteractions: 0, // likes + comments
    engagementRate: 0.0, // calculated metric
    lastEngagement: "timestamp"
  }
};

/**
 * POST LIKES COLLECTION
 * Collection: postLikes
 * Document ID: {postId}_{userId}
 */
const postLikeSchema = {
  postId: "post-document-id",
  userId: "user-uid",
  authorId: "post-author-uid", // for notifications
  createdAt: "serverTimestamp()",

  // Denormalized user data
  userData: {
    displayName: "User Name",
    photoURL: "profile-photo-url"
  }
};

/**
 * POST COMMENTS SUBCOLLECTION
 * Collection: posts/{postId}/comments
 * Document ID: auto-generated
 */
const postCommentSchema = {
  id: "auto-generated",
  postId: "parent-post-id",
  authorId: "commenter-uid",
  content: "Comment text",
  createdAt: "serverTimestamp()",
  updatedAt: "serverTimestamp()",

  // Author info (denormalized)
  authorData: {
    displayName: "Commenter Name",
    photoURL: "profile-photo-url",
    userCategory: "adult"
  },

  // Moderation
  isEdited: false,
  isReported: false,
  isFlagged: false,

  // Future: replies support
  replyTo: null, // comment ID if this is a reply
  repliesCount: 0
};

/**
 * USER FEED COLLECTION (Optional - for feed optimization)
 * Collection: userFeeds/{userId}/posts
 * Document ID: post-id
 */
const userFeedItemSchema = {
  postId: "original-post-id",
  authorId: "post-author-id",
  postType: "photo",
  createdAt: "original-post-timestamp",
  addedToFeedAt: "serverTimestamp()",

  // Algorithm scoring
  score: 0.0, // relevance score for this user
  reason: "friend_post", // 'friend_post', 'random', 'suggested'

  // Denormalized for quick display
  previewData: {
    authorName: "Author Name",
    authorPhoto: "author-photo-url",
    content: "Post preview text...",
    photoUrl: "post-photo-url"
  }
};

/**
 * FIRESTORE INDEXES NEEDED
 */
const requiredIndexes = [
  // Posts queries
  {
    collection: "posts",
    fields: [
      { field: "authorId", order: "ASCENDING" },
      { field: "createdAt", order: "DESCENDING" }
    ]
  },
  {
    collection: "posts",
    fields: [
      { field: "type", order: "ASCENDING" },
      { field: "createdAt", order: "DESCENDING" }
    ]
  },
  {
    collection: "posts",
    fields: [
      { field: "visibility", order: "ASCENDING" },
      { field: "createdAt", order: "DESCENDING" }
    ]
  },

  // Feed algorithm queries
  {
    collection: "posts",
    fields: [
      { field: "authorId", order: "ASCENDING" },
      { field: "engagement.totalInteractions", order: "DESCENDING" },
      { field: "createdAt", order: "DESCENDING" }
    ]
  },

  // Likes queries
  {
    collection: "postLikes",
    fields: [
      { field: "postId", order: "ASCENDING" },
      { field: "createdAt", order: "DESCENDING" }
    ]
  },
  {
    collection: "postLikes",
    fields: [
      { field: "userId", order: "ASCENDING" },
      { field: "createdAt", order: "DESCENDING" }
    ]
  },

  // Comments queries (subcollection)
  {
    collectionGroup: "comments",
    fields: [
      { field: "postId", order: "ASCENDING" },
      { field: "createdAt", order: "ASCENDING" }
    ]
  }
];

/**
 * SECURITY RULES STRUCTURE
 */
const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Posts collection
    match /posts/{postId} {
      // Read: authenticated users with community access
      allow read: if isAuthenticated() && hasCommunityAccess();
      
      // Write: only post author
      allow create: if isAuthenticated() && 
        hasCommunityAccess() && 
        request.auth.uid == resource.data.authorId &&
        isValidPostData();
        
      allow update: if isAuthenticated() && 
        request.auth.uid == resource.data.authorId &&
        onlyUpdatingAllowedFields();
        
      allow delete: if isAuthenticated() && 
        request.auth.uid == resource.data.authorId;
      
      // Comments subcollection
      match /comments/{commentId} {
        allow read: if isAuthenticated() && hasCommunityAccess();
        allow create: if isAuthenticated() && 
          hasCommunityAccess() &&
          request.auth.uid == request.resource.data.authorId;
        allow update: if isAuthenticated() && 
          request.auth.uid == resource.data.authorId;
        allow delete: if isAuthenticated() && 
          request.auth.uid == resource.data.authorId;
      }
    }
    
    // Post likes collection  
    match /postLikes/{likeId} {
      allow read: if isAuthenticated() && hasCommunityAccess();
      allow create: if isAuthenticated() && 
        hasCommunityAccess() &&
        request.auth.uid == request.resource.data.userId;
      allow delete: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
    }
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasCommunityAccess() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.communityAccess == true &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userCategory == 'adult';
    }
    
    function isValidPostData() {
      return request.resource.data.keys().hasAll(['authorId', 'type', 'content', 'createdAt', 'authorData']) &&
             request.resource.data.authorId == request.auth.uid &&
             request.resource.data.type in ['photo', 'project', 'battle_report'];
    }
    
    function onlyUpdatingAllowedFields() {
      return request.resource.data.diff(resource.data).affectedKeys().hasOnly(['content', 'updatedAt', 'tags']);
    }
  }
}
`;

export { postSchema, postLikeSchema, postCommentSchema, userFeedItemSchema, requiredIndexes, firestoreRules };