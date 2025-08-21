// components/blog/BlogList.jsx - Fixed with click handlers for posts
import React, { useState, useEffect } from 'react';
import { Clock, Eye, Heart, MessageCircle, Tag, User, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBlogPosts, BLOG_CATEGORIES, BLOG_TAGS } from '../../services/blogService';
import { formatDistanceToNow } from 'date-fns';

const BlogList = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    tag: ''
  });
  const [error, setError] = useState('');

  // Load initial posts
  useEffect(() => {
    loadPosts(true);
  }, [filters]);

  const loadPosts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPosts([]);
        setLastDoc(null);
      } else {
        setLoadingMore(true);
      }

      const options = {
        limitCount: 12,
        lastDoc: reset ? null : lastDoc
      };

      if (filters.category) {
        options.category = filters.category;
      }

      if (filters.tag) {
        options.tags = [filters.tag];
      }

      const result = await getBlogPosts(options);

      if (result.success) {
        if (reset) {
          setPosts(result.posts);
        } else {
          setPosts(prev => [...prev, ...result.posts]);
        }
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
        setError('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredPosts = posts.filter(post => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt?.toLowerCase().includes(searchLower) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    try {
      const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="tab-nav-container">
        <div className="space-y-6">
          {/* Loading skeleton */}
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-post">
              <div className="skeleton-text-lg w-3/4 mb-2"></div>
              <div className="skeleton-text-md w-1/2 mb-4"></div>
              <div className="skeleton-image h-48 mb-4"></div>
              <div className="skeleton-text-sm w-full mb-2"></div>
              <div className="skeleton-text-sm w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tab-nav-container">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="feed-header-title">
              Tabletop Blog
            </h1>
            <p className="feed-header-subtitle">
              Latest painting guides, tactics, and hobby news
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card-base card-padding">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search posts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="form-select"
            >
              <option value="">All Categories</option>
              <option value={BLOG_CATEGORIES.PAINTING}>Painting</option>
              <option value={BLOG_CATEGORIES.TACTICS}>Tactics</option>
              <option value={BLOG_CATEGORIES.REVIEWS}>Reviews</option>
              <option value={BLOG_CATEGORIES.TUTORIALS}>Tutorials</option>
              <option value={BLOG_CATEGORIES.NEWS}>News</option>
              <option value={BLOG_CATEGORIES.SHOWCASE}>Showcase</option>
            </select>

            {/* Tag Filter */}
            <select
              value={filters.tag}
              onChange={(e) => handleFilterChange('tag', e.target.value)}
              className="form-select"
            >
              <option value="">All Tags</option>
              <optgroup label="Games">
                <option value={BLOG_TAGS.WARHAMMER_40K}>Warhammer 40K</option>
                <option value={BLOG_TAGS.AGE_OF_SIGMAR}>Age of Sigmar</option>
                <option value={BLOG_TAGS.KILL_TEAM}>Kill Team</option>
                <option value={BLOG_TAGS.NECROMUNDA}>Necromunda</option>
                <option value={BLOG_TAGS.BLOOD_BOWL}>Blood Bowl</option>
              </optgroup>
              <optgroup label="Techniques">
                <option value={BLOG_TAGS.PAINTING}>Painting</option>
                <option value={BLOG_TAGS.KITBASHING}>Kitbashing</option>
                <option value={BLOG_TAGS.WEATHERING}>Weathering</option>
                <option value={BLOG_TAGS.BASING}>Basing</option>
              </optgroup>
              <optgroup label="Manufacturers">
                <option value={BLOG_TAGS.GAMES_WORKSHOP}>Games Workshop</option>
                <option value={BLOG_TAGS.CITADEL}>Citadel</option>
                <option value={BLOG_TAGS.VALLEJO}>Vallejo</option>
                <option value={BLOG_TAGS.ARMY_PAINTER}>Army Painter</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="card-base card-padding bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogPostCard
                key={post.id}
                post={post}
                onClick={() => navigate(`/app/blog/${post.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="card-base card-padding text-center py-12">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="feed-empty-title">
              No posts found
            </h3>
            <p className="feed-empty-text">
              {filters.search || filters.category || filters.tag
                ? 'Try adjusting your filters to see more posts.'
                : 'No blog posts available yet.'
              }
            </p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && filteredPosts.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => loadPosts(false)}
              disabled={loadingMore}
              className="btn-secondary btn-md"
            >
              {loadingMore ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Loading More...
                </>
              ) : (
                'Load More Posts'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual blog post card component - FIXED with onClick handler
const BlogPostCard = ({ post, onClick }) => {
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    try {
      const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      [BLOG_CATEGORIES.PAINTING]: 'badge-blue',
      [BLOG_CATEGORIES.TACTICS]: 'badge-purple',
      [BLOG_CATEGORIES.REVIEWS]: 'badge-emerald',
      [BLOG_CATEGORIES.TUTORIALS]: 'badge-warning',
      [BLOG_CATEGORIES.NEWS]: 'badge-danger',
      [BLOG_CATEGORIES.SHOWCASE]: 'badge-pink'
    };
    return badges[category] || 'badge-tertiary';
  };

  return (
    <div
      className="card-base card-padding group cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition-all"
      onClick={onClick}
    >
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-4">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Category Badge */}
      {post.category && (
        <div className="mb-3">
          <span className={`${getCategoryBadge(post.category)} capitalize`}>
            {post.category}
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {post.title}
      </h3>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="badge-tertiary text-xs">
              #{tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{post.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Meta Information */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{post.viewCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={12} />
            <span>{post.likeCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={12} />
            <span>{post.commentCount || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{formatTimeAgo(post.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default BlogList;