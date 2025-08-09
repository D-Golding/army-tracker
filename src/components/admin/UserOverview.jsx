// components/admin/UserOverview.jsx - User Analytics Using Design System
import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  TrendingUp,
  Calendar,
  Search,
  Download,
  Eye,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase';

const UserOverview = () => {
  const [userStats, setUserStats] = useState({
    total: 156,
    newToday: 8,
    newThisWeek: 23,
    newThisMonth: 67,
    byTier: { free: 98, casual: 34, pro: 18, battle: 6 },
    byAge: { adults: 134, minors: 22, unverified: 0 }
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Sample data for demonstration
  const sampleRecentUsers = [
    {
      id: 1,
      displayName: 'Alex Johnson',
      email: 'alex@example.com',
      tier: 'pro',
      age: 28,
      userCategory: 'adult',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      lastLoginAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
      role: 'user'
    },
    {
      id: 2,
      displayName: 'Sarah Chen',
      email: 'sarah@example.com',
      tier: 'casual',
      age: 16,
      userCategory: 'minor',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      role: 'user'
    },
    {
      id: 3,
      displayName: 'Mike Williams',
      email: 'mike@example.com',
      tier: 'free',
      age: 34,
      userCategory: 'adult',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      lastLoginAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      role: 'user'
    },
    {
      id: 4,
      displayName: 'Emma Davis',
      email: 'emma@example.com',
      tier: 'battle',
      age: 25,
      userCategory: 'adult',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      role: 'user'
    }
  ];

  useEffect(() => {
    setRecentUsers(sampleRecentUsers);
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    // In production, load real user data from Firestore
    // For now, we'll use the sample data above
    setTimeout(() => setLoading(false), 1000);
  };

  const getTierBadge = (tier) => {
    const badges = {
      free: 'badge-tertiary',
      casual: 'badge-blue',
      pro: 'badge-purple',
      battle: 'badge-warning'
    };
    return badges[tier] || 'badge-tertiary';
  };

  const getUserCategoryBadge = (category) => {
    if (category === 'minor') return 'badge-warning';
    if (category === 'adult') return 'badge-secondary';
    return 'badge-tertiary';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const exportUserData = () => {
    // Sample export functionality
    alert('User data export feature coming soon!');
  };

  const filteredUsers = recentUsers.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor user growth and engagement
          </p>
        </div>

        <button
          onClick={exportUserData}
          className="btn-secondary btn-md"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="summary-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Total Users</p>
              <p className="summary-value-blue">{userStats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="summary-card-emerald">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">New This Week</p>
              <p className="summary-value-emerald">{userStats.newThisWeek}</p>
            </div>
            <UserPlus className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="summary-card-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">New This Month</p>
              <p className="summary-value-purple">{userStats.newThisMonth}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="summary-card-amber">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">New Today</p>
              <p className="summary-value-amber">{userStats.newToday}</p>
            </div>
            <Calendar className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base card-padding">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Users by Tier
          </h3>
          <div className="space-y-4">
            {Object.entries(userStats.byTier).map(([tier, count]) => {
              const percentage = Math.round((count / userStats.total) * 100);
              return (
                <div key={tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`${getTierBadge(tier)} capitalize`}>
                      {tier}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {count} users
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 progress-bar">
                      <div
                        className={`progress-fill ${
                          percentage > 50 ? 'progress-high' : 
                          percentage > 20 ? 'progress-medium' : 
                          'progress-low'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-10 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-base card-padding">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Age Demographics
          </h3>
          <div className="space-y-4">
            {Object.entries(userStats.byAge).map(([category, count]) => {
              const percentage = Math.round((count / userStats.total) * 100);
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`${getUserCategoryBadge(category)} capitalize`}>
                      {category === 'unverified' ? 'Unverified' : category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {count} users
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 progress-bar">
                      <div
                        className={`progress-fill ${
                          category === 'adults' ? 'progress-high' : 
                          category === 'minors' ? 'progress-medium' : 
                          'progress-low'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-10 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="card-base">
        <div className="card-padding-sm border-b border-gray-200 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Users
            </h3>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="card-padding">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner-primary mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No users found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search term.' : 'No recent users to display.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${getTierBadge(user.tier)} capitalize`}>
                          {user.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${getUserCategoryBadge(user.userCategory)} capitalize`}>
                          {user.userCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatTimeAgo(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {formatTimeAgo(user.lastLoginAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-brand hover:text-indigo-900 dark:hover:text-indigo-300"
                          title="View user details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOverview;