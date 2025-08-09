// components/UserMenu.jsx - Updated with Smart Upgrade Logic
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Crown, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getSubscriptionTierColor = (tier) => {
    switch (tier) {
      case 'casual': return 'text-blue-600 dark:text-blue-400';
      case 'pro': return 'text-purple-600 dark:text-purple-400';
      case 'battle': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSubscriptionTierLabel = (tier) => {
    switch (tier) {
      case 'casual': return 'Casual Hobbyist';
      case 'pro': return 'Pro';
      case 'battle': return 'Battle Ready';
      default: return 'Free';
    }
  };

  // Check if user can upgrade (not on top tier)
  const canUpgrade = userProfile?.subscription?.tier !== 'battle';

  // Get upgrade text based on current tier
  const getUpgradeText = (currentTier) => {
    switch (currentTier) {
      case 'free': return 'Upgrade Subscription';
      case 'casual': return 'Upgrade to Pro or Battle Ready';
      case 'pro': return 'Upgrade to Battle Ready';
      default: return 'Upgrade Subscription';
    }
  };

  return (
    <div className="relative z-[9999]">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-2"
      >
        {currentUser?.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt="Profile"
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <User size={20} />
        )}
      </button>

      {showUserMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowUserMenu(false)}
          />

          {/* The NICE working menu */}
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-[9999] min-w-64">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="font-medium text-gray-900 dark:text-white">
                {userProfile?.displayName || 'User'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentUser?.email}
              </div>
              <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${getSubscriptionTierColor(userProfile?.subscription?.tier)}`}>
                {userProfile?.subscription?.tier !== 'free' && <Crown size={12} />}
                {getSubscriptionTierLabel(userProfile?.subscription?.tier)}
              </div>
            </div>

            <div className="p-2">
              {/* Dashboard Link */}
              <Link
                to="/app/dashboard/profile"
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings size={14} />
                Dashboard
              </Link>

              {/* Upgrade Subscription - Show if not on top tier */}
              {canUpgrade && (
                <button className="w-full px-3 py-2 text-left text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg flex items-center gap-2">
                  <Crown size={14} />
                  {getUpgradeText(userProfile?.subscription?.tier)}
                </button>
              )}

              {userProfile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
                  onClick={() => setShowUserMenu(false)}
                >
                  🔧 Admin Panel
                </Link>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  setShowUserMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;