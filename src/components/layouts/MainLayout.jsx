// components/layouts/MainLayout.jsx - Updated to use persistent dark mode
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import GlobalFooter from '../GlobalFooter';
import { useDarkMode } from '../../hooks/shared/useDarkMode';

const MainLayout = () => {
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
      <div className="app-wrapper">
        {/* Full-width Header - Outside container constraints */}
        <Header darkMode={darkMode} setDarkMode={toggleDarkMode} />

        {/* Constrained Main Content */}
        <div className="main-content-container">
          {/* Navigation - Now part of content area, naturally constrained */}
          <Navigation />

          <main className="main-content">
            <Outlet />
          </main>

          {/* Global Footer */}
          <GlobalFooter />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;