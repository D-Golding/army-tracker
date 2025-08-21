// pages/AdminBlogEditorPage.jsx - Admin blog editor page wrapper
import React from 'react';
import { useParams } from 'react-router-dom';
import BlogEditor from '../components/blog/BlogEditor';

const AdminBlogEditorPage = () => {
  const { postId } = useParams();
  const mode = postId ? 'edit' : 'create';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BlogEditor mode={mode} />
    </div>
  );
};

export default AdminBlogEditorPage;