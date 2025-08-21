// components/layouts/AdminLayout.jsx - Updated to use persistent dark mode
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Moon, Sun } from 'lucide-react';
import GlobalFooter from '../GlobalFooter';
import { useDarkMode } from '../../hooks/shared/useDarkMode';

const AdminLayout = () => {
  const { darkMode, toggleDarkMode, isLoading } = useDarkMode();

  // Show a minimal loading state while dark mode initializes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
        <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">

          {/* Admin Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 transform rotate-12"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <Link
                  to="/app"
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  title="Back to Main App"
                >
                  <ArrowLeft size={20} />
                </Link>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Shield size={28} />
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  </div>
                  <p className="text-red-100 text-sm">System administration and management</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Admin Content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>

          {/* Admin Footer */}
          <footer className="p-6 mt-8">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Shield size={16} />
                <span className="font-medium">Administrator Access Required</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                This area contains sensitive system management tools.
              </p>
            </div>
          </footer>

          {/* Global Footer */}
          <GlobalFooter />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;