// components/layouts/Navigation.jsx - Updated to use global styles
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Palette, Folder, Users, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { userProfile } = useAuth();

  // Check if user can access community features
  const canAccessCommunity = () => {
    return userProfile?.userCategory === 'adult' && userProfile?.communityAccess === true;
  };

  const navItems = [
    {
      path: '/app/community',
      icon: Users,
      label: 'Community',
      enabled: canAccessCommunity()
    },
    {
      path: '/app/battle-planner',
      icon: Target,
      label: 'Battle Planner',
      enabled: false // Still placeholder
    },
    {
      path: '/app',
      icon: Palette,
      label: 'Paint Inventory',
      enabled: true
    },
    {
      path: '/app/projects',
      icon: Folder,
      label: 'Projects',
      enabled: true
    }
  ];

  // Fixed active state detection
  const getIsActive = (itemPath) => {
    if (itemPath === '/app') {
      // Paint Inventory should only be active on exact /app path
      return location.pathname === '/app';
    } else {
      // Other paths use startsWith for sub-routes
      return location.pathname.startsWith(itemPath);
    }
  };

  return (
    <div className="navigation-container">
      <div className="navigation-grid">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = getIsActive(item.path);

          if (!item.enabled) {
            // For disabled buttons, show them but make them non-functional
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
    </div>
  );
};

export default Navigation;