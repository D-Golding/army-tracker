// components/admin/BlogAdmin.jsx - Fixed navigation URLs
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Tag,
  Users,
  TrendingUp,
  FileText,
  Image
} from 'lucide-react';
import { getBlogPosts, getBlogStats, deleteBlogPost, updateBlogPost, BLOG_CATEGORIES } from '../../services/blogService';
import { formatDistanceToNow } from 'date-fns';

const BlogAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, filterStatus, filterCategory]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all posts (including drafts) for admin
      const [postsResult, statsResult] = await Promise.all([
        getBlogPosts({
          status: null, // Get all statuses
          limitCount: 100
        }),
        getBlogStats()
      ]);

      if (postsResult.success) {
        setPosts(postsResult.posts);
      }

      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(post => post.status === filterStatus);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(post => post.category === filterCategory);
    }

    setFilteredPosts(filtered);
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteBlogPost(postId);
      if (result.success) {
        setPosts(prev => prev.filter(post => post.id !== postId));
      } else {
        alert('Failed to delete post: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleToggleStatus = async (postId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';

    try {
      const result = await updateBlogPost(postId, { status: newStatus });
      if (result.success) {
        setPosts(prev => prev.map(post =>
          post.id === postId ? { ...post, status: newStatus } : post
        ));
      } else {
        alert('Failed to update post status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating post status:', error);
      alert('Failed to update post status');
    }
  };

  const handleToggleFeatured = async (postId, currentFeatured) => {
    try {
      const result = await updateBlogPost(postId, { featured: !currentFeatured });
      if (result.success) {
        setPosts(prev => prev.map(post =>
          post.id === postId ? { ...post, featured: !currentFeatured } : post
        ));
      } else {
        alert('Failed to update featured status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert('Failed to update featured status');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedPosts.length === 0) {
      alert('Please select posts to perform bulk actions');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedPosts.length} post(s)?`)) {
      return;
    }

    try {
      const promises = selectedPosts.map(postId => {
        switch (action) {
          case 'delete':
            return deleteBlogPost(postId);
          case 'publish':
            return updateBlogPost(postId, { status: 'published' });
          case 'draft':
            return updateBlogPost(postId, { status: 'draft' });
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      await loadData(); // Reload data
      setSelectedPosts([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return 'badge-secondary';
      case 'draft':
        return 'badge-tertiary';
      default:
        return 'badge-warning';
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      painting: 'badge-blue',
      tactics: 'badge-purple',
      reviews: 'badge-emerald',
      tutorials: 'badge-warning',
      news: 'badge-danger',
      showcase: 'badge-pink'
    };
    return badges[category] || 'badge-tertiary';
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    try {
      const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  // FIXED: Navigation functions
  const navigateToNewPost = () => {
    window.location.href = '/admin/blog/new';
  };

  const navigateToEditPost = (postId) => {
    window.location.href = `/admin/blog/edit/${postId}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card-base card-padding animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>

        <div className="card-base card-padding">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blog Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage blog posts
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={navigateToNewPost}
            className="btn-primary btn-md"
          >
            <Plus size={16} />
            New Post
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="summary-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Total Posts</p>
              <p className="summary-value-blue">{stats.totalPosts || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="summary-card-emerald">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Published</p>
              <p className="summary-value-emerald">{stats.publishedPosts || 0}</p>
            </div>
            <Eye className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="summary-card-amber">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Drafts</p>
              <p className="summary-value-amber">{stats.draftPosts || 0}</p>
            </div>
            <Edit className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="summary-card-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Total Views</p>
              <p className="summary-value-purple">{stats.totalViews || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card-base card-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-select"
          >
            <option value="all">All Categories</option>
            {Object.entries(BLOG_CATEGORIES).map(([key, value]) => (
              <option key={key} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>

          {/* Bulk Actions */}
          {selectedPosts.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction(e.target.value);
                  e.target.value = '';
                }
              }}
              className="form-select"
            >
              <option value="">Bulk Actions ({selectedPosts.length})</option>
              <option value="publish">Publish Selected</option>
              <option value="draft">Move to Draft</option>
              <option value="delete">Delete Selected</option>
            </select>
          )}
        </div>
      </div>

      {/* Posts Table */}
      <div className="card-base">
        {filteredPosts.length === 0 ? (
          <div className="card-padding text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No posts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your filters.'
                : 'Get started by creating your first blog post.'
              }
            </p>
            {(!searchTerm && filterStatus === 'all' && filterCategory === 'all') && (
              <button
                onClick={navigateToNewPost}
                className="btn-primary btn-md"
              >
                Create First Post
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPosts.length === filteredPosts.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts(filteredPosts.map(post => post.id));
                        } else {
                          setSelectedPosts([]);
                        }
                      }}
                      className="form-checkbox"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPosts(prev => [...prev, post.id]);
                          } else {
                            setSelectedPosts(prev => prev.filter(id => id !== post.id));
                          }
                        }}
                        className="form-checkbox"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {post.featuredImage && (
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                            <img
                              src={post.featuredImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {post.title}
                          </h4>
                          {post.excerpt && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                              {post.excerpt}
                            </p>
                          )}
                          {post.featured && (
                            <span className="badge-warning text-xs mt-1">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.category && (
                        <span className={`${getCategoryBadge(post.category)} capitalize`}>
                          {post.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${getStatusBadge(post.status)} capitalize`}>
                        {post.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="space-y-1">
                        <div>{post.viewCount || 0} views</div>
                        <div>{post.likeCount || 0} likes</div>
                        <div>{post.commentCount || 0} comments</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatTimeAgo(post.publishedAt || post.updatedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigateToEditPost(post.id)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          title="Edit post"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(post.id, post.status)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title={post.status === 'published' ? 'Move to draft' : 'Publish'}
                        >
                          {post.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>

                        <button
                          onClick={() => handleToggleFeatured(post.id, post.featured)}
                          className={`${post.featured ? 'text-amber-600' : 'text-gray-400'} hover:text-amber-900`}
                          title={post.featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <TrendingUp size={16} />
                        </button>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="Delete post"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogAdmin;