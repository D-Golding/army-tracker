// components/layouts/HeaderBanner.jsx - Updated for new dark mode hook
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../UserMenu';
import BannerUpload from '../dashboard/Profile/BannerUpload';
import BannerBackground from '../shared/BannerBackground';

const HeaderBanner = ({ darkMode, setDarkMode }) => {
  const { currentUser, userProfile } = useAuth();

  // setDarkMode is now the toggleDarkMode function from the hook
  const toggleDarkMode = () => {
    setDarkMode(); // This calls toggleDarkMode from useDarkMode hook
  };

  // Get display name with proper fallback logic
  const getDisplayName = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName;
    }
    if (currentUser?.displayName) {
      return currentUser.displayName;
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <div className="header-banner">
      {/* Auto-adjusting Banner Background */}
      <BannerBackground
        imageUrl={userProfile?.headerPhotoURL}
        brightness={userProfile?.headerPhotoBrightness}
      />

      {/* Decorative Element */}
      <div className="header-banner-decorative"></div>

      {/* Banner Edit Button - Top Left Corner */}
      <BannerUpload className="header-banner-edit-btn" />

      <div className="header-banner-content">
        <div>
          <h1 className="header-banner-title">Tabletop Tactica</h1>
          <p className="header-banner-subtitle">
            Welcome back, {getDisplayName()}
          </p>
        </div>

        <div className="header-banner-controls">
          {/* User Menu Component */}
          <UserMenu />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="header-control-btn"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderBanner;