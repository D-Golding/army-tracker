// components/AdminDashboard.jsx - Updated admin dashboard with blog management
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  CreditCard,
  Shield,
  Megaphone,
  Gift,
  Activity,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import UserOverview from './admin/UserOverview';
import PaymentManagement from './admin/PaymentManagement';
import ContentModeration from './admin/ContentModeration';
import MarketingTools from './admin/MarketingTools';
import VoucherAdmin from './admin/VoucherAdmin';
import SystemHealth from './admin/SystemHealth';
import BlogAdmin from './admin/BlogAdmin';
import BulkImport from './admin/BulkImport';
import CatalogImport from './admin/CatalogImport';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 156,
    totalRevenue: 12450,
    totalPosts: 342,
    systemUptime: '99.9%'
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'content', label: 'Content', icon: Shield },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'vouchers', label: 'Vouchers', icon: Gift },
    { id: 'health', label: 'System', icon: Activity }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={stats} />;
      case 'users':
        return <UserOverview />;
      case 'blog':
        return <BlogAdmin />;
      case 'payments':
        return <PaymentManagement />;
      case 'content':
        return <ContentModeration />;
      case 'marketing':
        return <MarketingTools />;
      case 'vouchers':
        return <VoucherAdmin />;
      case 'health':
        return <SystemHealth />;
      default:
        return <OverviewTab stats={stats} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <IconComponent size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">£{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Blog Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPosts}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.systemUptime}</p>
            </div>
            <Activity className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <FileText className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Create Blog Post</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Write a new blog article</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Users className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Manage Users</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">View user accounts</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Gift className="w-6 h-6 text-emerald-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Create Voucher</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate new voucher codes</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Shield className="w-6 h-6 text-red-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Content Review</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Review reported content</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-6 h-6 text-gray-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Download system reports</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Activity className="w-6 h-6 text-amber-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">System Status</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Check system health</p>
            </div>
          </button>
        </div>
      </div>

      {/* Paint Management Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bulk Paint Import
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Import multiple paints from JSON data
            </p>
          </div>
          <div className="p-6">
            <BulkImport />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Paint Catalog Management
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage the master paint catalog
            </p>
          </div>
          <div className="p-6">
            <CatalogImport />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">New user registration</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">alex.johnson@example.com - 2 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">Blog post published</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">"Advanced Weathering Techniques" - 15 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">Payment processed</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pro subscription - £14.99 - 32 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">Community post reported</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Post ID: #1234 - 1 hour ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">Voucher redeemed</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">BETA2024 - Casual tier upgrade - 2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;