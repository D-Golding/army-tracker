// components/layouts/MainLayout.jsx - Updated with React Query
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Palette, Folder } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsageStats } from '../../hooks/useUsageStats';
import UserMenu from '../UserMenu';

const MainLayout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();

  // Get usage data via React Query - automatically refreshes!
  const { data: usageData, isLoading: isUsageLoading } = useUsageStats();

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
    { path: '/app', icon: Palette, label: 'Paint Inventory' },
    { path: '/app/projects', icon: Folder, label: 'Projects' }
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen relative">

          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 pt-12 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 transform rotate-12"></div>

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-1">Tabletop Tactica</h1>
                <p className="text-indigo-100 text-sm">
                  Welcome back, {getDisplayName()}
                </p>
              </div>

              <div className="flex gap-2">
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

            {/* Subscription Usage Bar - Dynamic based on current page */}
            {userProfile?.subscription?.tier !== 'free' && usageData && !isUsageLoading && (
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
                            width: `${Math.min(100, (usageData.projects / (userProfile?.limits?.projects || 2)) * 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-white/90">
                        {usageData.projects} / {userProfile?.limits?.projects || 2}
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
                            width: `${Math.min(100, (usageData.paints / (userProfile?.limits?.paints || 25)) * 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-white/90">
                        {usageData.paints} / {userProfile?.limits?.paints || 25}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Usage Loading State */}
            {isUsageLoading && userProfile?.subscription?.tier !== 'free' && (
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

          {/* Navigation Tabs */}
          <div className="flex bg-white dark:bg-gray-800 mx-4 -mt-3 rounded-xl shadow-lg relative z-5 border border-gray-100 dark:border-gray-700">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;

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
          <main className="p-4 pt-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;