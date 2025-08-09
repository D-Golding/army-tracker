// components/admin/ContentModeration.jsx - Community Safety Dashboard Using Design System
import React, { useState, useEffect } from 'react';
import {
  Shield,
  Flag,
  Eye,
  EyeOff,
  User,
  MessageSquare,
  Image,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  Ban,
  Trash2,
  Archive
} from 'lucide-react';

const ContentModeration = () => {
  const [moderationStats, setModerationStats] = useState({
    pendingReports: 3,
    resolvedToday: 7,
    activeUsers: 156,
    minorUsers: 22,
    autoModerated: 45,
    manualReviews: 12
  });

  const [reportedContent, setReportedContent] = useState([
    {
      id: 1,
      type: 'message',
      content: 'Inappropriate language in community chat',
      reportedBy: 'user123@example.com',
      reportedUser: 'problematic_user@example.com',
      reason: 'Harassment',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'pending',
      severity: 'high',
      userAge: 'adult'
    },
    {
      id: 2,
      type: 'image',
      content: 'Inappropriate model photo shared',
      reportedBy: 'parent@example.com',
      reportedUser: 'user456@example.com',
      reason: 'Inappropriate content',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'pending',
      severity: 'medium',
      userAge: 'minor'
    },
    {
      id: 3,
      type: 'message',
      content: 'Spam advertising in comments',
      reportedBy: 'moderator@example.com',
      reportedUser: 'spammer@example.com',
      reason: 'Spam',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: 'resolved',
      severity: 'low',
      userAge: 'adult',
      action: 'Content removed'
    }
  ]);

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const safetyFeatures = [
    {
      name: 'Auto Moderation',
      description: 'AI-powered content filtering',
      enabled: true,
      coverage: '95%'
    },
    {
      name: 'Minor Protection',
      description: 'Enhanced safety for users under 18',
      enabled: true,
      coverage: '100%'
    },
    {
      name: 'Community Reporting',
      description: 'User-driven content reporting',
      enabled: true,
      coverage: '100%'
    },
    {
      name: 'Real-time Monitoring',
      description: 'Live content monitoring',
      enabled: false,
      coverage: '0%'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'resolved':
        return 'badge-secondary';
      case 'escalated':
        return 'badge-danger';
      default:
        return 'badge-tertiary';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return 'badge-danger';
      case 'medium':
        return 'badge-warning';
      case 'low':
        return 'badge-blue';
      default:
        return 'badge-tertiary';
    }
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'profile':
        return <User className="w-4 h-4" />;
      default:
        return <Flag className="w-4 h-4" />;
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

  const handleResolveReport = (reportId, action) => {
    setReportedContent(prev =>
      prev.map(report =>
        report.id === reportId
          ? { ...report, status: 'resolved', action }
          : report
      )
    );

    setModerationStats(prev => ({
      ...prev,
      pendingReports: prev.pendingReports - 1,
      resolvedToday: prev.resolvedToday + 1
    }));
  };

  const filteredReports = reportedContent.filter(report => {
    if (selectedFilter !== 'all' && report.status !== selectedFilter) return false;
    if (selectedSeverity !== 'all' && report.severity !== selectedSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content Moderation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Community safety and content monitoring
          </p>
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary btn-md">
            <Shield className="w-4 h-4" />
            Safety Settings
          </button>
        </div>
      </div>

      {/* Moderation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="summary-card-amber">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Pending Reports</p>
              <p className="summary-value-amber">{moderationStats.pendingReports}</p>
            </div>
            <Flag className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="summary-card-emerald">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Resolved Today</p>
              <p className="summary-value-emerald">{moderationStats.resolvedToday}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="summary-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Protected Minors</p>
              <p className="summary-value-blue">{moderationStats.minorUsers}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Safety Features Status */}
      <div className="card-base card-padding">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Safety Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyFeatures.map((feature, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  feature.enabled ? 'bg-emerald-500' : 'bg-red-500'
                }`} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {feature.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${
                  feature.enabled ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {feature.enabled ? 'Active' : 'Disabled'}
                </span>
                <p className="text-xs text-gray-500">
                  {feature.coverage} coverage
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Reports */}
      <div className="card-base">
        <div className="card-padding-sm border-b border-gray-200 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reported Content
            </h3>

            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="form-select text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>

              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="form-select text-sm"
              >
                <option value="all">All Severity</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-padding">
          {filteredReports.length === 0 ? (
            <div className="empty-state">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No reports found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedFilter !== 'all' || selectedSeverity !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Your community is safe with no active reports.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className={`border rounded-lg p-4 ${
                    report.severity === 'high' && report.status === 'pending'
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getContentIcon(report.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`${getSeverityBadge(report.severity)} capitalize`}>
                          {report.severity}
                        </span>
                        <span className={`${getStatusBadge(report.status)} capitalize`}>
                          {report.status}
                        </span>
                        {report.userAge === 'minor' && (
                          <span className="badge-warning">
                            Minor Involved
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-auto">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(report.timestamp)}
                        </div>
                      </div>

                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {report.reason}
                      </h4>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {report.content}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Reported by: {report.reportedBy}</span>
                        <span>User: {report.reportedUser}</span>
                      </div>

                      {report.action && (
                        <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                          Action taken: {report.action}
                        </div>
                      )}
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolveReport(report.id, 'Content removed')}
                          className="btn-sm btn-danger"
                          title="Remove content"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleResolveReport(report.id, 'Warning issued')}
                          className="btn-sm btn-warning"
                          title="Issue warning"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleResolveReport(report.id, 'No action required')}
                          className="btn-sm btn-secondary"
                          title="Dismiss report"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Community Guidelines */}
      <div className="card-base card-padding">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Community Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Age-Appropriate Content
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• No inappropriate imagery or language</li>
              <li>• Enhanced protection for users under 18</li>
              <li>• Parental oversight for minors</li>
              <li>• Community reporting encouraged</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Community Standards
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Respectful communication required</li>
              <li>• No spam or self-promotion</li>
              <li>• Share hobby-related content only</li>
              <li>• Report concerning behavior</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentModeration;