// components/AdminDashboard.jsx - Complete Future-Proof Admin System Using Design System
import React, { useState } from 'react';
import {
  Gift,
  Users,
  Activity,
  Shield,
  CreditCard,
  Megaphone,
  Palette
} from 'lucide-react';
import VoucherAdmin from './admin/VoucherAdmin';
import UserOverview from './admin/UserOverview';
import SystemHealth from './admin/SystemHealth';
import ContentModeration from './admin/ContentModeration';
import PaymentManagement from './admin/PaymentManagement';
import MarketingTools from './admin/MarketingTools';
import CatalogImport from './admin/CatalogImport';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('vouchers');

  const adminTabs = [
    {
      id: 'vouchers',
      label: 'Vouchers',
      icon: Gift,
      description: 'Manage voucher codes and redemptions'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'User analytics and management'
    },
    {
      id: 'system',
      label: 'System Health',
      icon: Activity,
      description: 'Monitor system performance'
    },
    {
      id: 'moderation',
      label: 'Moderation',
      icon: Shield,
      description: 'Content and community safety'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      description: 'Revenue and subscription management'
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: Megaphone,
      description: 'Campaigns and user engagement'
    },
    {
      id: 'catalogue',
      label: 'Paint Catalogue',
      icon: Palette,
      description: 'Import and manage paint database'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vouchers':
        return <VoucherAdmin />;
      case 'users':
        return <UserOverview />;
      case 'system':
        return <SystemHealth />;
      case 'moderation':
        return <ContentModeration />;
      case 'payments':
        return <PaymentManagement />;
      case 'marketing':
        return <MarketingTools />;
      case 'catalogue':
        return <CatalogImport />;
      default:
        return <VoucherAdmin />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-desktop py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your Tabletop Tactica platform
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="card-base overflow-hidden">
            <div className="flex flex-wrap">
              {adminTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-0 px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-center justify-center gap-2 font-medium transition-base group relative ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-brand'
                        : 'text-gray-600 dark:text-gray-400 hover:text-brand hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent size={20} className="flex-shrink-0" />
                    <span className="text-sm font-medium text-center sm:text-left">
                      {tab.label}
                    </span>

                    {/* Active indicator */}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
                    )}

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-base pointer-events-none z-10 whitespace-nowrap">
                      {tab.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="card-base min-h-[600px]">
          <div className="card-padding-lg">
            {renderTabContent()}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Admin Dashboard • Tabletop Tactica Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;