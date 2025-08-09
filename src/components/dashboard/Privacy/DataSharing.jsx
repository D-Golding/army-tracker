// components/dashboard/Privacy/DataSharing.jsx - Data Sharing Settings Only
import React from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { showConfirmation } from '../../NotificationManager';

const DataSharing = ({ onSettingChange, isUpdating }) => {
  const { userProfile } = useAuth();

  // Get current settings with proper defaults
  const currentSettings = {
    allowAnalytics: userProfile?.privacyConsents?.analytics ?? true,
    shareStatsAnonymously: userProfile?.privacySettings?.shareStatsAnonymously ?? false,
    allowResearch: userProfile?.privacySettings?.allowResearch ?? false,
  };

  const handleStatsSharing = async (value) => {
    if (value === true) {
      const proceed = await showConfirmation({
        title: 'Share Anonymous Statistics?',
        message: 'This helps improve the app by sharing anonymous usage patterns. No personal information is shared.',
        confirmText: 'Share Statistics',
        cancelText: 'Keep Private',
        type: 'default'
      });

      if (!proceed) return;
    }

    onSettingChange('shareStatsAnonymously', value);
  };

  const dataSharingItems = [
    {
      key: 'allowAnalytics',
      name: 'Usage Analytics',
      description: 'Help improve the app by sharing anonymous usage data',
      note: 'This setting syncs with your privacy consent preferences',
      handler: (value) => onSettingChange('allowAnalytics', value)
    },
    {
      key: 'shareStatsAnonymously',
      name: 'Anonymous Statistics',
      description: 'Share anonymized statistics to help improve features',
      note: 'No personal information is ever shared',
      handler: handleStatsSharing
    },
    {
      key: 'allowResearch',
      name: 'Research Participation',
      description: 'Allow your anonymized data to be used for academic research',
      note: 'Only for studies about hobbyist behavior and app usage patterns',
      handler: (value) => onSettingChange('allowResearch', value)
    }
  ];

  return (
    <div className="card-base card-padding-lg">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Data Sharing & Analytics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control how your data is used for analytics and research
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {dataSharingItems.map((item) => (
          <div key={item.key} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex-1">
              <label htmlFor={`data_${item.key}`} className="font-medium text-gray-900 dark:text-white text-sm cursor-pointer">
                {item.name}
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {item.description}
              </p>
              {item.note && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                  {item.note}
                </p>
              )}
            </div>

            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                id={`data_${item.key}`}
                checked={currentSettings[item.key] === true}
                onChange={(e) => item.handler(e.target.checked)}
                disabled={isUpdating}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataSharing;