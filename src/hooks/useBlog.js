// hooks/useBlog.js - Custom hooks for blog functionality
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  toggleBlogPostLike,
  getBlogStats
} from '../services/blogService';

// Hook for fetching blog posts
export const useBlogPosts = (options = {}) => {
  return useQuery({
    queryKey: ['blogPosts', options],
    queryFn: () => getBlogPosts(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Hook for fetching single blog post
export const useBlogPost = (postId) => {
  return useQuery({
    queryKey: ['blogPost', postId],
    queryFn: () => getBlogPost(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 5,
  });
};

// Hook for creating blog posts
export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postData, authorId }) => createBlogPost(postData, authorId),
    onSuccess: () => {
      // Invalidate and refetch blog posts
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['blogStats'] });
    },
  });
};

// Hook for updating blog posts
export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, updates }) => updateBlogPost(postId, updates),
    onSuccess: (data, variables) => {
      // Update the specific post in cache
      queryClient.invalidateQueries({ queryKey: ['blogPost', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['blogStats'] });
    },
  });
};

// Hook for deleting blog posts
export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => deleteBlogPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['blogStats'] });
    },
  });
};

// Hook for toggling blog post likes
export const useBlogPostLike = (postId) => {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const toggleLikeMutation = useMutation({
    mutationFn: (userId) => toggleBlogPostLike(postId, userId),
    onMutate: async () => {
      setIsToggling(true);
      // Optimistic update
      setIsLiked(prev => !prev);
    },
    onSuccess: (data) => {
      setIsLiked(data.liked);
      // Update the post data in cache
      queryClient.invalidateQueries({ queryKey: ['blogPost', postId] });
    },
    onError: () => {
      // Revert optimistic update on error
      setIsLiked(prev => !prev);
    },
    onSettled: () => {
      setIsToggling(false);
    },
  });

  const toggleLike = (userId) => {
    if (!isToggling) {
      toggleLikeMutation.mutate(userId);
    }
  };

  return {
    isLiked,
    isToggling,
    toggleLike,
  };
};

// Hook for blog statistics
export const useBlogStats = () => {
  return useQuery({
    queryKey: ['blogStats'],
    queryFn: getBlogStats,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for blog categories and tags
export const useBlogCategories = () => {
  const [categories] = useState([
    { value: 'painting', label: 'Painting', color: 'blue' },
    { value: 'tactics', label: 'Tactics', color: 'purple' },
    { value: 'reviews', label: 'Reviews', color: 'green' },
    { value: 'tutorials', label: 'Tutorials', color: 'yellow' },
    { value: 'news', label: 'News', color: 'red' },
    { value: 'showcase', label: 'Showcase', color: 'pink' },
  ]);

  return categories;
};

// Hook for managing blog filters
export const useBlogFilters = () => {
  const [filters, setFilters] = useState({
    category: '',
    tags: [],
    search: '',
    status: 'published'
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      tags: [],
      search: '',
      status: 'published'
    });
  };

  const hasActiveFilters = () => {
    return filters.category || filters.tags.length > 0 || filters.search;
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters
  };
};

// Hook for blog search functionality
export const useBlogSearch = (posts = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(posts);
      return;
    }

    const results = posts.filter(post => {
      const searchLower = searchTerm.toLowerCase();
      return (
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        post.category?.toLowerCase().includes(searchLower)
      );
    });

    setSearchResults(results);
  }, [searchTerm, posts]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    hasResults: searchResults.length > 0,
    resultCount: searchResults.length
  };
};