// components/dashboard/Privacy/ProjectPrivacy.jsx - Project Privacy Settings Only
import React from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const ProjectPrivacy = ({ onSettingChange, isUpdating }) => {
  const { userProfile } = useAuth();

  const isMinor = userProfile?.userCategory === 'minor';
  const hasCommunityAccess = userProfile?.communityAccess === true;

  // Get current settings with proper defaults
  const currentSettings = {
    defaultProjectVisibility: userProfile?.privacySettings?.defaultProjectVisibility || 'private',
    allowProjectComments: userProfile?.privacySettings?.allowProjectComments ?? false,
    allowProjectSharing: userProfile?.privacySettings?.allowProjectSharing ?? false,
  };

  return (
    <div className="card-base card-padding-lg">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Privacy
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Default privacy settings for your projects
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Default Project Visibility */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Default Project Visibility</h4>
          <select
            value={currentSettings.defaultProjectVisibility}
            onChange={(e) => onSettingChange('defaultProjectVisibility', e.target.value)}
            disabled={isUpdating}
            className="form-select"
          >
            <option value="private">Private - Only you can see</option>
            {hasCommunityAccess && <option value="community">Community - App users can see</option>}
            {hasCommunityAccess && !isMinor && <option value="public">Public - Anyone can see</option>}
          </select>
          <p className="form-help">This sets the default visibility for new projects</p>
        </div>

        {/* Project Interaction Settings */}
        {hasCommunityAccess && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'allowProjectComments', name: 'Allow Comments', description: 'Let others comment on your projects' },
              { key: 'allowProjectSharing', name: 'Allow Sharing', description: 'Let others share your projects' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div>
                  <label htmlFor={`project_${item.key}`} className="font-medium text-gray-900 dark:text-white text-sm cursor-pointer">
                    {item.name}
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={`project_${item.key}`}
                    checked={currentSettings[item.key] === true}
                    onChange={(e) => onSettingChange(item.key, e.target.checked)}
                    disabled={isUpdating}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        )}

        {!hasCommunityAccess && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Community features require community consent to be enabled
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPrivacy;