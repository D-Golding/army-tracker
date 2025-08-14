// components/dashboard/Gamification/AchievementCard.jsx
import React, { useState } from 'react';
import { Calendar, Star, ChevronDown, ChevronUp } from 'lucide-react';

const AchievementCard = ({ achievement }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
      achievement.isUnlocked
        ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 hover:border-yellow-300 dark:hover:border-yellow-700'
        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60 hover:opacity-80'
    }`}
    onClick={() => setShowDetails(!showDetails)}
    >

      {/* Achievement Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`text-3xl ${achievement.isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
            {achievement.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm ${
              achievement.isUnlocked 
                ? 'text-yellow-800 dark:text-yellow-200' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {achievement.name}
            </h3>
            <p className={`text-xs mt-1 ${
              achievement.isUnlocked 
                ? 'text-yellow-700 dark:text-yellow-300' 
                : 'text-gray-500 dark:text-gray-500'
            }`}>
              {achievement.description}
            </p>
          </div>
        </div>

        {/* Points Badge */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
          achievement.isUnlocked
            ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          <Star size={10} />
          {achievement.points}
        </div>
      </div>

      {/* Progress Bar (for locked achievements) */}
      {!achievement.isUnlocked && achievement.progress && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{achievement.progress.current}/{achievement.progress.required}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all"
              style={{ width: `${achievement.progress.percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Unlock Date (for unlocked achievements) */}
      {achievement.isUnlocked && achievement.unlockedAt && (
        <div className="flex items-center gap-1 text-xs text-yellow-700 dark:text-yellow-300">
          <Calendar size={12} />
          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
        </div>
      )}

      {/* Expand Arrow */}
      <div className="flex justify-center mt-2">
        {showDetails ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Category:</span>
              <span className="text-gray-800 dark:text-gray-200 capitalize">
                {achievement.category?.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
              <span className={`font-medium ${
                achievement.points >= 100 ? 'text-red-600 dark:text-red-400' :
                achievement.points >= 50 ? 'text-amber-600 dark:text-amber-400' :
                'text-emerald-600 dark:text-emerald-400'
              }`}>
                {achievement.points >= 100 ? 'Hard' :
                 achievement.points >= 50 ? 'Medium' : 'Easy'}
              </span>
            </div>
            {achievement.threshold && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Target:</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {achievement.threshold}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementCard;