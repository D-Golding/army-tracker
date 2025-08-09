// components/dashboard/UserDashboard.jsx - Complete User Dashboard with Privacy Integration
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Shield,
  CreditCard,
  Trophy,
  Activity,
  ArrowLeft,
  Mail,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Import Privacy Components
import ConsentManager from './Privacy/ConsentManager';
import MailingPreferences from './Privacy/MailingPreferences';
import PrivacySettings from './Privacy/PrivacySettings';

// Import Profile Components
import ProfileInfo from './Profile/ProfileInfo';

const UserDashboard = () => {
  const { userProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get current section from URL or default to profile
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.includes('/privacy')) return 'privacy';
    if (path.includes('/subscription')) return 'subscription';
    if (path.includes('/achievements')) return 'achievements';
    if (path.includes('/activity')) return 'activity';
    return 'profile';
  };

  const [activeSection, setActiveSection] = useState(getCurrentSection());
  const [activePrivacyTab, setActivePrivacyTab] = useState('consent');

  // Dashboard sections configuration
  const dashboardSections = [
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      description: 'Personal information and settings'
    },
    {
      id: 'privacy',
      name: 'Privacy',
      icon: Shield,
      description: 'Privacy settings and consent management'
    },
    {
      id: 'subscription',
      name: 'Subscription',
      icon: CreditCard,
      description: 'Billing and subscription management'
    },
    {
      id: 'achievements',
      name: 'Achievements',
      icon: Trophy,
      description: 'Badges and gamification progress'
    },
    {
      id: 'activity',
      name: 'Activity',
      icon: Activity,
      description: 'Recent activity and data export'
    }
  ];

  // Privacy tabs configuration
  const privacyTabs = [
    {
      id: 'consent',
      name: 'Consent Management',
      icon: Shield,
      component: ConsentManager,
      description: 'Manage your privacy consents and view audit trail'
    },
    {
      id: 'communications',
      name: 'Communications',
      icon: Mail,
      component: MailingPreferences,
      description: 'Control email and notification preferences'
    },
    {
      id: 'visibility',
      name: 'Visibility & Sharing',
      icon: Eye,
      component: PrivacySettings,
      description: 'Profile visibility and data sharing settings'
    }
  ];

  const currentSection = dashboardSections.find(section => section.id === activeSection);

  // Handle section navigation
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    navigate(`/app/dashboard/${sectionId}`);
  };

  // Handle back to app
  const handleBackToApp = () => {
    navigate('/app');
  };

  // Render Privacy Dashboard with tabs
  const renderPrivacyDashboard = () => {
    const activeTab = privacyTabs.find(tab => tab.id === activePrivacyTab);
    const ActiveComponent = activeTab?.component;

    return (
      <div className="space-y-6">
        {/* Privacy Tab Navigation */}
        <div className="card-base card-padding-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            {privacyTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePrivacyTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePrivacyTab(tab.id)}
                  className={`flex-1 text-left p-4 rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800'
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${
                      isActive 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      isActive 
                        ? 'text-indigo-900 dark:text-indigo-100' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {tab.name}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    isActive 
                      ? 'text-indigo-700 dark:text-indigo-300' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Privacy Tab Content */}
        {ActiveComponent && <ActiveComponent />}
      </div>
    );
  };

  // Render placeholder for other sections
  const renderPlaceholder = (sectionName) => (
    <div className="card-base card-padding-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {sectionName}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {sectionName} coming soon...
      </p>
    </div>
  );

  // Render main content based on active section
  const renderMainContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileInfo />;
      case 'privacy':
        return renderPrivacyDashboard();
      case 'subscription':
        return renderPlaceholder('Subscription Management');
      case 'achievements':
        return renderPlaceholder('Achievements & Gamification');
      case 'activity':
        return renderPlaceholder('Activity & Data Export');
      default:
        return <ProfileInfo />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="mobile-only">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToApp}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to App</span>
            </button>

            <div className="flex items-center gap-3">
              <currentSection.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentSection.name}
              </h1>
            </div>

            <div className="w-5"></div>
          </div>

          {/* Mobile section description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {currentSection.description}
          </p>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <nav className="px-4 py-2">
            {dashboardSections.map((section) => {
              const isActive = activeSection === section.id;
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{section.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {section.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="desktop-only">
        <div className="flex h-screen">
          {/* Desktop Sidebar */}
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={handleBackToApp}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to App</span>
              </button>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard
              </h1>

              {userProfile && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    {userProfile.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {userProfile.displayName || 'User'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {userProfile.subscription?.tier || 'free'} tier
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="flex-1 p-6">
              <div className="space-y-2">
                {dashboardSections.map((section) => {
                  const isActive = activeSection === section.id;
                  const Icon = section.icon;

                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium">{section.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {section.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Desktop Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Desktop Content Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
              <div className="flex items-center gap-3">
                <currentSection.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentSection.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {currentSection.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Content Area */}
            <div className="flex-1 overflow-auto">
              <div className="p-8">
                {renderMainContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Content Area */}
      <div className="mobile-only">
        <div className="p-4">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;