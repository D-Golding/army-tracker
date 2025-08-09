// components/admin/MarketingTools.jsx - Marketing and User Engagement Dashboard Using Design System
import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Mail,
  Users,
  Send,
  Eye,
  BarChart3,
  Calendar,
  Target,
  TrendingUp,
  MessageCircle,
  Bell,
  Edit,
  Plus,
  Filter
} from 'lucide-react';

const MarketingTools = () => {
  const [campaignStats, setCampaignStats] = useState({
    totalSent: 1250,
    openRate: 24.5,
    clickRate: 3.2,
    activeCampaigns: 2,
    scheduledCampaigns: 1,
    totalAnnouncements: 8
  });

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Welcome Series - New Users',
      type: 'email',
      status: 'active',
      audience: 'new_users',
      sent: 156,
      opened: 89,
      clicked: 12,
      created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastSent: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 2,
      name: 'Premium Features Update',
      type: 'announcement',
      status: 'draft',
      audience: 'all_users',
      sent: 0,
      opened: 0,
      clicked: 0,
      created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      name: 'Monthly Newsletter - October',
      type: 'email',
      status: 'completed',
      audience: 'subscribers',
      sent: 234,
      opened: 142,
      clicked: 28,
      created: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastSent: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'New Paint Catalog Update',
      message: 'We\'ve added 150+ new paint colors to our database!',
      type: 'feature',
      audience: 'all_users',
      status: 'published',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      views: 89
    },
    {
      id: 2,
      title: 'Maintenance Window Scheduled',
      message: 'Brief maintenance planned for Sunday 2AM-4AM GMT.',
      type: 'maintenance',
      audience: 'all_users',
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      views: 0
    }
  ]);

  const [userSegments, setUserSegments] = useState([
    { id: 'all_users', name: 'All Users', count: 156 },
    { id: 'new_users', name: 'New Users (30 days)', count: 23 },
    { id: 'subscribers', name: 'Newsletter Subscribers', count: 87 },
    { id: 'premium_users', name: 'Premium Users', count: 34 },
    { id: 'inactive_users', name: 'Inactive Users (90 days)', count: 12 }
  ]);

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'badge-secondary';
      case 'completed':
        return 'badge-blue';
      case 'draft':
        return 'badge-tertiary';
      case 'scheduled':
        return 'badge-warning';
      case 'published':
        return 'badge-secondary';
      default:
        return 'badge-tertiary';
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'email':
        return 'badge-blue';
      case 'announcement':
        return 'badge-purple';
      case 'feature':
        return 'badge-emerald';
      case 'maintenance':
        return 'badge-warning';
      default:
        return 'badge-tertiary';
    }
  };

  const calculateEngagementRate = (campaign) => {
    if (campaign.sent === 0) return 0;
    return Math.round((campaign.opened / campaign.sent) * 100);
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

  const formatDateTime = (date) => {
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const createNewCampaign = () => {
    setShowNewCampaignModal(true);
  };

  const publishAnnouncement = (announcementId) => {
    setAnnouncements(prev =>
      prev.map(announcement =>
        announcement.id === announcementId
          ? { ...announcement, status: 'published', publishedAt: new Date() }
          : announcement
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Marketing Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage campaigns and user engagement
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={createNewCampaign}
            className="btn-secondary btn-md"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
          <button className="btn-primary btn-md">
            <Bell className="w-4 h-4" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Marketing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="summary-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Total Sent</p>
              <p className="summary-value-blue">{campaignStats.totalSent.toLocaleString()}</p>
            </div>
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="summary-card-emerald">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Open Rate</p>
              <p className="summary-value-emerald">{campaignStats.openRate}%</p>
            </div>
            <Eye className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="summary-card-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Click Rate</p>
              <p className="summary-value-purple">{campaignStats.clickRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="summary-card-amber">
          <div className="flex items-center justify-between">
            <div>
              <p className="summary-label">Active Campaigns</p>
              <p className="summary-value-amber">{campaignStats.activeCampaigns}</p>
            </div>
            <Target className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* User Segments */}
      <div className="card-base card-padding">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          User Segments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userSegments.map((segment) => (
            <div key={segment.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {segment.name}
                  </h4>
                  <p className="text-2xl font-bold text-brand mt-1">
                    {segment.count}
                  </p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns */}
      <div className="card-base">
        <div className="card-padding-sm border-b border-gray-200 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Email Campaigns
            </h3>

            <div className="flex gap-2">
              <select className="form-select text-sm">
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="announcement">Announcement</option>
              </select>
              <select className="form-select text-sm">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-padding">
          {campaigns.length === 0 ? (
            <div className="empty-state">
              <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No campaigns yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first email campaign to engage with your users.
              </p>
              <button
                onClick={createNewCampaign}
                className="btn-primary"
              >
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {campaign.name}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={getTypeBadge(campaign.type)}>
                          {campaign.type}
                        </span>
                        <span className={getStatusBadge(campaign.status)}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="btn-sm btn-secondary">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="btn-sm btn-primary">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Sent</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {campaign.sent.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Opened</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {campaign.opened.toLocaleString()} ({calculateEngagementRate(campaign)}%)
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Clicked</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {campaign.clicked.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        {campaign.status === 'scheduled' ? 'Scheduled' : 'Last Sent'}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {campaign.status === 'scheduled' && campaign.scheduledFor
                          ? formatDateTime(campaign.scheduledFor)
                          : campaign.lastSent
                          ? formatTimeAgo(campaign.lastSent)
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcements */}
      <div className="card-base">
        <div className="card-padding-sm border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Announcements
          </h3>
        </div>

        <div className="card-padding">
          {announcements.length === 0 ? (
            <div className="empty-state">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No announcements
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create announcements to keep users informed about updates and maintenance.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {announcement.title}
                        </h4>
                        <span className={getTypeBadge(announcement.type)}>
                          {announcement.type}
                        </span>
                        <span className={getStatusBadge(announcement.status)}>
                          {announcement.status}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {announcement.message}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {announcement.status === 'published'
                            ? `Published ${formatTimeAgo(announcement.publishedAt)}`
                            : announcement.status === 'scheduled'
                            ? `Scheduled for ${formatDateTime(announcement.scheduledFor)}`
                            : 'Draft'
                          }
                        </span>
                        {announcement.views > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {announcement.views} views
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button className="btn-sm btn-secondary">
                        <Edit className="w-4 h-4" />
                      </button>
                      {announcement.status === 'draft' && (
                        <button
                          onClick={() => publishAnnouncement(announcement.id)}
                          className="btn-sm btn-primary"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Marketing Integration Notice */}
      <div className="card-base border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <div className="card-padding">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                Marketing Tools Status
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Email integration and advanced marketing features are in development. Basic announcement system is ready for use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingTools;