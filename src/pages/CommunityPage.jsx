// pages/CommunityPage.jsx - Main community page with consistent styling
import React, { useState } from 'react';
import { Users, UserPlus, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewsFeed from '../components/newsfeed/NewsFeed';
import FriendsTab from '../components/community/FriendsTab';
import DiscoverTab from '../components/community/DiscoverTab';
import { useNewsFeedPermissions } from '../hooks/useNewsfeed';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('newsfeed');
  const navigate = useNavigate();
  const permissions = useNewsFeedPermissions();

  // Check permissions
  if (!permissions.canViewFeed) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-base card-padding text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Community Not Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {permissions.restrictionReason}
          </p>
          {!permissions.isMinor && (
            <button
              onClick={() => window.location.href = '/app/dashboard/privacy'}
              className="btn-primary btn-md"
            >
              Update Privacy Settings
            </button>
          )}
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'newsfeed',
      label: 'Newsfeed',
      icon: Users,
      component: NewsFeed
    },
    {
      id: 'my-posts',
      label: 'My Posts',
      icon: FileText,
      action: () => navigate('/app/community/my-posts')
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: UserPlus,
      component: FriendsTab
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: Search,
      component: DiscoverTab
    }
  ];

  const handleTabClick = (tab) => {
    if (tab.action) {
      // If tab has an action (like navigation), execute it
      tab.action();
    } else {
      // Otherwise, set as active tab
      setActiveTab(tab.id);
    }
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <div className="page-content">
      {/* Community Header */}
      <div className="page-header">
        <h1 className="page-header-title">
          Community
        </h1>
        <p className="page-header-subtitle">
          Connect with other painters in the community
        </p>
      </div>

      {/* Tab Navigation - 2x2 Grid with proper sizing */}
      <div className="tab-nav-container">
        <div className="card-base">
          <div className="tab-nav-grid">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={isActive ? 'tab-nav-button-active' : 'tab-nav-button-inactive'}
                >
                  <IconComponent size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="page-content-area">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default CommunityPage;