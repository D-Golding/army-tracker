// components/layouts/MainLayout.jsx - Navigation moved to content area
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import GlobalFooter from '../GlobalFooter';

const MainLayout = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="app-wrapper">
        {/* Full-width Header - Outside container constraints */}
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

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