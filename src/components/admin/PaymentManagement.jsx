// components/admin/PaymentManagement.jsx - Revenue and Subscription Dashboard Using Design System
import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  XCircle
} from 'lucide-react';

const PaymentManagement = () => {
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 12450,
    monthlyRevenue: 2850,
    weeklyRevenue: 680,
    dailyRevenue: 125,
    totalSubscribers: 58,
    newSubscriptions: 8,
    churnRate: '3.2%',
    avgRevenuePerUser: 24.50
  });

  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState({
    free: 98,
    casual: 34,
    pro: 18,
    battle: 6
  });

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 'txn_001',
      user: 'alex@example.com',
      plan: 'Pro Annual',
      amount: 99.00,
      status: 'completed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      method: 'card'
    },
    {
      id: 'txn_002',
      user: 'sarah@example.com',
      plan: 'Casual Monthly',
      amount: 9.99,
      status: 'completed',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      method: 'card'
    },
    {
      id: 'txn_003',
      user: 'mike@example.com',
      plan: 'Battle Monthly',
      amount: 19.99,
      status: 'failed',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      method: 'card',
      failureReason: 'Insufficient funds'
    },
    {
      id: 'txn_004',
      user: 'emma@example.com',
      plan: 'Pro Monthly',
      amount: 14.99,
      status: 'pending',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      method: 'card'
    }
  ]);

  const [failedPayments, setFailedPayments] = useState([
    {
      id: 'fail_001',
      user: 'john@example.com',
      plan: 'Casual Monthly',
      amount: 9.99,
      reason: 'Card expired',
      attempts: 2,
      nextRetry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      userEmail: 'john@example.com'
    },
    {
      id: 'fail_002',
      user: 'jane@example.com',
      plan: 'Pro Annual',
      amount: 99.00,
      reason: 'Payment method declined',
      attempts: 1,
      nextRetry: new Date(Date.now() + 12 * 60 * 60 * 1000),
      userEmail: 'jane@example.com'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRevenueStats(prev => ({
        ...prev,
        dailyRevenue: prev.dailyRevenue + Math.floor(Math.random() * 50),
        newSubscriptions: Math.floor(Math.random() * 5)
      }));
      setLoading(false);
    }, 1000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-secondary';
      case 'pending':
        return 'badge-warning';
      case 'failed':
        return 'badge-danger';
      case 'refunded':
        return 'badge-tertiary';
      default:
        return 'badge-tertiary';
    }
  };

  const getPlanBadge = (plan) => {
    if (plan.toLowerCase().includes('casual')) return 'badge-blue';
    if (plan.toLowerCase().includes('pro')) return 'badge-purple';
    if (plan.toLowerCase().includes('battle')) return 'badge-warning';
    return 'badge-tertiary';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
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

  const retryFailedPayment = (paymentId) => {
    alert(`Retrying payment ${paymentId}...`);
    // In production, this would trigger a payment retry
  };

  const exportRevenueData = () => {
    alert('Revenue data export feature coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Revenue tracking and subscription management
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportRevenueData}
            className="btn-secondary btn-md"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={refreshData}
            disabled={loading}
            className="btn-primary btn-md"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="summary-card-emerald">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Total Revenue</p>
              <p className="summary-value-emerald">{formatCurrency(revenueStats.totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="summary-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Monthly Revenue</p>
              <p className="summary-value-blue">{formatCurrency(revenueStats.monthlyRevenue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="summary-card-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Active Subscribers</p>
              <p className="summary-value-purple">{revenueStats.totalSubscribers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="summary-card-amber">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Churn Rate</p>
              <p className="summary-value-amber">{revenueStats.churnRate}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base card-padding">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Subscription Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(subscriptionBreakdown).map(([tier, count]) => {
              const total = Object.values(subscriptionBreakdown).reduce((a, b) => a + b, 0);
              const percentage = Math.round((count / total) * 100);
              const revenue = tier === 'free' ? 0 :
                            tier === 'casual' ? count * 9.99 :
                            tier === 'pro' ? count * 14.99 :
                            count * 19.99;

              return (
                <div key={tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`${
                      tier === 'free' ? 'badge-tertiary' :
                      tier === 'casual' ? 'badge-blue' :
                      tier === 'pro' ? 'badge-purple' :
                      'badge-warning'
                    } capitalize`}>
                      {tier}
                    </span>
                    <div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {count} users
                      </span>
                      {tier !== 'free' && (
                        <p className="text-xs text-gray-500">
                          {formatCurrency(revenue)} revenue
                        </p>
                      )}
                    </div>
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
            Revenue Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Average Revenue Per User
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(revenueStats.avgRevenuePerUser)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                New Subscriptions (30 days)
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {revenueStats.newSubscriptions}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Weekly Revenue
              </span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(revenueStats.weeklyRevenue)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Daily Revenue
              </span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(revenueStats.dailyRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Failed Payments Alert */}
      {failedPayments.length > 0 && (
        <div className="card-base border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <div className="card-padding">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  Failed Payments Require Attention
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {failedPayments.length} payments have failed and need to be retried.
                </p>
                <div className="mt-3 space-y-2">
                  {failedPayments.map(payment => (
                    <div key={payment.id} className="flex items-center justify-between p-2 bg-amber-100 dark:bg-amber-900/40 rounded">
                      <div>
                        <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          {payment.user} - {formatCurrency(payment.amount)}
                        </span>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          {payment.reason} • {payment.attempts} attempts
                        </p>
                      </div>
                      <button
                        onClick={() => retryFailedPayment(payment.id)}
                        className="btn-sm btn-warning"
                      >
                        Retry
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card-base">
        <div className="card-padding-sm border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
        </div>

        <div className="card-padding">
          {recentTransactions.length === 0 ? (
            <div className="empty-state">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No transactions yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Transactions will appear here once payments are processed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          {transaction.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {transaction.user}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getPlanBadge(transaction.plan)}>
                          {transaction.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${getStatusBadge(transaction.status)} capitalize`}>
                          {transaction.status}
                        </span>
                        {transaction.failureReason && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {transaction.failureReason}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatTimeAgo(transaction.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="text-brand hover:text-indigo-900 dark:hover:text-indigo-300"
                          title="View details"
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

      {/* Payment Integration Notice */}
      <div className="card-base border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <div className="card-padding">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                Payment System Status
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Payment integration is in development. Revenue tracking will be fully functional once live payments are enabled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;