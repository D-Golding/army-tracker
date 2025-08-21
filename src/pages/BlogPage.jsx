// pages/BlogPage.jsx - Main blog page container
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BlogList from '../components/blog/BlogList';
import BlogPost from '../components/blog/BlogPost';

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="main-content-container">
        <div className="main-content">
          <Routes>
            <Route index element={<BlogList />} />
            <Route path=":postId" element={<BlogPost />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;