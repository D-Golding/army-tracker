// components/admin/SystemHealth.jsx - System Monitoring Dashboard Using Design System
import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Users,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const SystemHealth = () => {
  const [systemStats, setSystemStats] = useState({
    uptime: '99.9%',
    responseTime: '124ms',
    activeUsers: 23,
    totalRequests: 15742,
    errorRate: '0.1%',
    databaseConnections: 12,
    storageUsed: '2.3GB',
    lastUpdated: new Date()
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      level: 'warning',
      message: 'High memory usage detected on server-2',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      resolved: false
    },
    {
      id: 2,
      level: 'info',
      message: 'Database backup completed successfully',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      resolved: true
    },
    {
      id: 3,
      level: 'error',
      message: 'Payment service timeout (resolved)',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      resolved: true
    }
  ]);

  const [loading, setLoading] = useState(false);

  // Sample performance metrics
  const performanceMetrics = [
    { name: 'API Response Time', value: '124ms', change: -8, status: 'good' },
    { name: 'Database Query Time', value: '45ms', change: 12, status: 'warning' },
    { name: 'Memory Usage', value: '72%', change: 5, status: 'warning' },
    { name: 'CPU Usage', value: '34%', change: -3, status: 'good' },
    { name: 'Disk Space', value: '23%', change: 2, status: 'good' },
    { name: 'Network Latency', value: '28ms', change: -15, status: 'good' }
  ];

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSystemStats(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 50) + 10,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 100),
        lastUpdated: new Date()
      }));
      setLoading(false);
    }, 1000);
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertBadge = (level, resolved) => {
    if (resolved) return 'badge-secondary';
    switch (level) {
      case 'error':
        return 'badge-danger';
      case 'warning':
        return 'badge-warning';
      case 'info':
        return 'badge-blue';
      default:
        return 'badge-tertiary';
    }
  };

  const getPerformanceStatus = (status) => {
    switch (status) {
      case 'good':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            System Health
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor system performance and alerts
          </p>
        </div>

        <button
          onClick={refreshData}
          disabled={loading}
          className="btn-secondary btn-md"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="summary-card-emerald">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Uptime</p>
              <p className="summary-value-emerald">{systemStats.uptime}</p>
            </div>
            <Activity className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="summary-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Response Time</p>
              <p className="summary-value-blue">{systemStats.responseTime}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="summary-card-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Active Users</p>
              <p className="summary-value-purple">{systemStats.activeUsers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="summary-card-amber">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Error Rate</p>
              <p className="summary-value-amber">{systemStats.errorRate}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base card-padding">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Metrics
          </h3>
          <div className="space-y-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {metric.name}
                    </p>
                    <p className={`text-sm ${getPerformanceStatus(metric.status)}`}>
                      {metric.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {metric.change > 0 ? (
                    <TrendingUp className={`w-4 h-4 ${
                      metric.status === 'good' ? 'text-emerald-500' : 'text-red-500'
                    }`} />
                  ) : (
                    <TrendingDown className={`w-4 h-4 ${
                      metric.status === 'good' ? 'text-emerald-500' : 'text-red-500'
                    }`} />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.change > 0 && metric.status !== 'good' ? 'text-red-600' :
                    metric.change < 0 || metric.status === 'good' ? 'text-emerald-600' :
                    'text-amber-600'
                  }`}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-base card-padding">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resource Usage
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">Database Connections</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 progress-bar">
                  <div className="progress-medium" style={{ width: '60%' }} />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                  {systemStats.databaseConnections}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-900 dark:text-white">Storage Used</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 progress-bar">
                  <div className="progress-low" style={{ width: '23%' }} />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                  {systemStats.storageUsed}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-gray-900 dark:text-white">Security Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 progress-bar">
                  <div className="progress-high" style={{ width: '94%' }} />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                  94%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="card-base">
        <div className="card-padding-sm border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Alerts
          </h3>
        </div>

        <div className="card-padding">
          {alerts.length === 0 ? (
            <div className="empty-state">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No alerts
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your system is running smoothly with no active alerts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    alert.resolved 
                      ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
                      : alert.level === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : alert.level === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="mt-0.5">
                    {getAlertIcon(alert.level)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${getAlertBadge(alert.level, alert.resolved)} capitalize`}>
                        {alert.resolved ? 'Resolved' : alert.level}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(alert.timestamp)}
                      </div>
                    </div>

                    <p className={`text-sm ${
                      alert.resolved 
                        ? 'text-gray-600 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {systemStats.lastUpdated.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default SystemHealth;