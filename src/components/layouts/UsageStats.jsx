// components/layouts/UsageStats.jsx - Updated to use global styles
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUsageStats } from '../../hooks/useUsageStats';
import { getTierLimits } from '../../config/subscription';

const UsageStats = () => {
  const location = useLocation();
  const { userProfile } = useAuth();

  // Get usage data via React Query - automatically refreshes!
  const { data: usageData, isLoading: isUsageLoading } = useUsageStats();

  // Get dynamic tier limits
  const currentTier = userProfile?.subscription?.tier || 'free';
  const tierLimits = getTierLimits(currentTier);

  return (
    <div className="usage-stats-container">
      {/* Subscription Usage Bar - Show for all users with dynamic limits */}
      {usageData && !isUsageLoading && (
        <div className="usage-stats-card">
          {location.pathname === '/app/projects' ? (
            // Project Collection Usage
            <>
              <div className="usage-stats-label">Project Collection Usage</div>
              <div className="usage-stats-bar-container">
                <div className="usage-stats-bar">
                  <div
                    className="usage-stats-fill"
                    style={{
                      width: `${Math.min(100, (usageData.projects / tierLimits.projects) * 100)}%`
                    }}
                  ></div>
                </div>
                <div className="usage-stats-text">
                  {usageData.projects} / {tierLimits.projects}
                </div>
              </div>
            </>
          ) : (
            // Paint Collection Usage (default)
            <>
              <div className="usage-stats-label">Paint Collection Usage</div>
              <div className="usage-stats-bar-container">
                <div className="usage-stats-bar">
                  <div
                    className="usage-stats-fill"
                    style={{
                      width: `${Math.min(100, (usageData.paints / tierLimits.paints) * 100)}%`
                    }}
                  ></div>
                </div>
                <div className="usage-stats-text">
                  {usageData.paints} / {tierLimits.paints}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Usage Loading State - Show for all users */}
      {isUsageLoading && (
        <div className="usage-stats-card">
          <div className="usage-stats-label">Loading usage data...</div>
          <div className="usage-stats-bar-container">
            <div className="usage-stats-bar">
              <div className="bg-white/50 rounded-full h-2 w-1/3 animate-pulse md:h-3 lg:h-3"></div>
            </div>
            <div className="usage-stats-text">--</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageStats;