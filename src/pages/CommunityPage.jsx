
// pages/CommunityPage.jsx - Main community page with 2x2 grid navigation
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
    <div className="space-y-6">
      {/* Community Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Community
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Connect with other painters in the community
        </p>
      </div>

      {/* Tab Navigation - 2x2 Grid */}
      <div className="card-base">
        <div className="grid grid-cols-2 gap-1 p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'gradient-primary text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <IconComponent size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default CommunityPage;