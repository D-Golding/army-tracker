// components/layouts/MainLayout.jsx - Updated with GlobalFooter
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Palette, Folder, Users, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsageStats } from '../../hooks/useUsageStats';
import { getTierLimits } from '../../config/subscription';
import UserMenu from '../UserMenu';
import BannerUpload from '../dashboard/Profile/BannerUpload';
import BannerBackground from '../shared/BannerBackground';
import GlobalFooter from '../GlobalFooter';

const MainLayout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();

  // Get usage data via React Query - automatically refreshes!
  const { data: usageData, isLoading: isUsageLoading } = useUsageStats();

  // Get dynamic tier limits
  const currentTier = userProfile?.subscription?.tier || 'free';
  const tierLimits = getTierLimits(currentTier);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
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

  const navItems = [
    { path: '/app/community', icon: Users, label: 'Community' },
    { path: '/app/battle-planner', icon: Target, label: 'Battle Planner' },
    { path: '/app', icon: Palette, label: 'Paint Inventory' },
    { path: '/app/projects', icon: Folder, label: 'Projects' }
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col relative">

          {/* Header */}
          <div className="relative text-white p-6 pt-12 overflow-visible">
            {/* Auto-adjusting Banner Background */}
            <BannerBackground
              imageUrl={userProfile?.headerPhotoURL}
              brightness={userProfile?.headerPhotoBrightness}
            />

            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 transform rotate-12"></div>

            {/* Banner Edit Button - Top Left Corner */}
            <BannerUpload className="absolute top-3 left-3 z-10" />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-1">Tabletop Tactica</h1>
                <p className="text-white/90 text-sm">
                  Welcome back, {getDisplayName()}
                </p>
              </div>

              <div className="flex gap-2 items-center">
                {/* User Menu Component */}
                <UserMenu />

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>

            {/* Subscription Usage Bar - Show for all users with dynamic limits */}
            {usageData && !isUsageLoading && (
              <div className="relative mt-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                {location.pathname === '/app/projects' ? (
                  // Project Collection Usage
                  <>
                    <div className="text-xs text-white/90 mb-2">Project Collection Usage</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all"
                          style={{
                            width: `${Math.min(100, (usageData.projects / tierLimits.projects) * 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-white/90">
                        {usageData.projects} / {tierLimits.projects}
                      </div>
                    </div>
                  </>
                ) : (
                  // Paint Collection Usage (default)
                  <>
                    <div className="text-xs text-white/90 mb-2">Paint Collection Usage</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all"
                          style={{
                            width: `${Math.min(100, (usageData.paints / tierLimits.paints) * 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-white/90">
                        {usageData.paints} / {tierLimits.paints}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Usage Loading State - Show for all users */}
            {isUsageLoading && (
              <div className="relative mt-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="text-xs text-white/90 mb-2">Loading usage data...</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/20 rounded-full h-2">
                    <div className="bg-white/50 rounded-full h-2 w-1/3 animate-pulse"></div>
                  </div>
                  <div className="text-xs text-white/90">--</div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs - 2x2 Grid keeping exact original styling */}
          <div className="bg-white dark:bg-gray-800 mx-4 -mt-3 rounded-xl shadow-lg relative z-5 border border-gray-100 dark:border-gray-700 grid grid-cols-2 divide-x divide-y divide-gray-200 dark:divide-gray-600">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;

              if (item.path === '/app/community' || item.path === '/app/battle-planner') {
                // For placeholder buttons, don't make them links
                return (
                  <div
                    key={item.path}
                    className="nav-tab nav-tab-inactive cursor-not-allowed opacity-75"
                  >
                    <IconComponent className="inline-block mr-2" size={16} />
                    {item.label}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-tab ${
                    isActive ? 'nav-tab-active' : 'nav-tab-inactive'
                  }`}
                >
                  <IconComponent className="inline-block mr-2" size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 pt-6">
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