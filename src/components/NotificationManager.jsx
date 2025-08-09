// components/NotificationManager.jsx - Achievement Notification System
import React, { useState, useEffect } from 'react';
import { X, Trophy, Star, Zap, Target, AlertTriangle, CheckCircle } from 'lucide-react';

// Achievement Notification Toast
const AchievementToast = ({ achievement, onClose, isVisible }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Trigger entrance animation
      const timer = setTimeout(() => setShow(true), 100);

      // Auto-close after 5 seconds
      const autoClose = setTimeout(() => {
        onClose();
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(autoClose);
      };
    } else {
      setShow(false);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ease-out ${
        show 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-2xl p-4 max-w-sm border-2 border-yellow-300">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-white bg-opacity-20 rounded-full p-1">
              <Trophy size={20} className="text-yellow-100" />
            </div>
            <span className="font-bold text-yellow-100">Achievement Unlocked!</span>
          </div>
          <button
            onClick={onClose}
            className="text-yellow-100 hover:text-white transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X size={16} />
          </button>
        </div>

        {/* Achievement Content */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">{achievement.icon}</div>
          <div>
            <h3 className="font-bold text-lg">{achievement.name}</h3>
            <p className="text-yellow-100 text-sm">{achievement.description}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={12} className="text-yellow-200" />
              <span className="text-xs font-medium">+{achievement.points} points</span>
            </div>
          </div>
        </div>

        {/* Celebration Animation */}
        <div className="absolute -top-2 -right-2 text-yellow-300 animate-bounce">
          🎉
        </div>
      </div>
    </div>
  );
};

// Streak Milestone Toast
const StreakToast = ({ milestone, onClose, isVisible }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 100);
      const autoClose = setTimeout(() => onClose(), 4000);
      return () => {
        clearTimeout(timer);
        clearTimeout(autoClose);
      };
    } else {
      setShow(false);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ease-out ${
        show 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className="gradient-primary text-white rounded-2xl shadow-2xl p-4 max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-white bg-opacity-20 rounded-full p-1">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-bold">Streak Milestone!</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 transition-colors p-1 rounded-full"
          >
            <X size={16} />
          </button>
        </div>

        {/* Milestone Content */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">{milestone.icon}</div>
          <div>
            <h3 className="font-bold text-lg">{milestone.name}</h3>
            <p className="text-indigo-100 text-sm">{milestone.description}</p>
          </div>
        </div>

        {/* Fire Animation */}
        <div className="absolute -top-2 -right-2 text-orange-300 animate-pulse">
          🔥
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component (replaces ugly alert boxes)
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default" // "default", "danger", "warning"
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle size={24} className="text-red-600" />,
          confirmBtn: "btn-danger btn-md",
          headerColor: "text-red-600 dark:text-red-400"
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} className="text-amber-600" />,
          confirmBtn: "btn-warning btn-md",
          headerColor: "text-amber-600 dark:text-amber-400"
        };
      default:
        return {
          icon: <CheckCircle size={24} className="text-indigo-600" />,
          confirmBtn: "btn-primary btn-md",
          headerColor: "text-indigo-600 dark:text-indigo-400"
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-md card-padding" onClick={(e) => e.stopPropagation()}>

        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-4">
          {typeStyles.icon}
          <h3 className={`text-lg font-semibold ${typeStyles.headerColor}`}>
            {title}
          </h3>
        </div>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-tertiary btn-md flex-1"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`${typeStyles.confirmBtn} flex-1`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification Manager - handles all notification types
const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [confirmations, setConfirmations] = useState([]);

  // Listen for achievement events
  useEffect(() => {
    const handleAchievementUnlocked = (event) => {
      const achievement = event.detail;
      const id = `achievement-${Date.now()}`;

      setNotifications(prev => [...prev, {
        id,
        type: 'achievement',
        data: achievement,
        isVisible: true
      }]);
    };

    const handleStreakMilestone = (event) => {
      const milestone = event.detail;
      const id = `streak-${Date.now()}`;

      setNotifications(prev => [...prev, {
        id,
        type: 'streak',
        data: milestone,
        isVisible: true
      }]);
    };

    const handleConfirmationRequest = (event) => {
      const confirmation = event.detail;
      const id = `confirm-${Date.now()}`;

      setConfirmations(prev => [...prev, {
        id,
        ...confirmation,
        isOpen: true
      }]);
    };

    window.addEventListener('achievementUnlocked', handleAchievementUnlocked);
    window.addEventListener('streakMilestone', handleStreakMilestone);
    window.addEventListener('confirmationRequest', handleConfirmationRequest);

    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievementUnlocked);
      window.removeEventListener('streakMilestone', handleStreakMilestone);
      window.removeEventListener('confirmationRequest', handleConfirmationRequest);
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isVisible: false } : notif
      )
    );

    // Remove from state after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 500);
  };

  const removeConfirmation = (id) => {
    setConfirmations(prev => prev.filter(conf => conf.id !== id));
  };

  return (
    <>
      {/* Achievement & Streak Notifications */}
      {notifications.map((notification) => {
        if (notification.type === 'achievement') {
          return (
            <AchievementToast
              key={notification.id}
              achievement={notification.data}
              onClose={() => removeNotification(notification.id)}
              isVisible={notification.isVisible}
            />
          );
        }

        if (notification.type === 'streak') {
          return (
            <StreakToast
              key={notification.id}
              milestone={notification.data}
              onClose={() => removeNotification(notification.id)}
              isVisible={notification.isVisible}
            />
          );
        }

        return null;
      })}

      {/* Confirmation Modals */}
      {confirmations.map((confirmation) => (
        <ConfirmationModal
          key={confirmation.id}
          isOpen={confirmation.isOpen}
          onClose={() => removeConfirmation(confirmation.id)}
          onConfirm={confirmation.onConfirm}
          title={confirmation.title}
          message={confirmation.message}
          confirmText={confirmation.confirmText}
          cancelText={confirmation.cancelText}
          type={confirmation.type}
        />
      ))}
    </>
  );
};

// Utility functions to trigger notifications and confirmations

  // Show achievement notification
const showAchievementNotification = (achievement) => {
    window.dispatchEvent(new CustomEvent('achievementUnlocked', {
      detail: achievement
    }));
  };

  // Show streak milestone notification
  const showStreakNotification = (milestone) => {
    window.dispatchEvent(new CustomEvent('streakMilestone', {
      detail: milestone
    }));
  };

  // Show confirmation modal (replaces window.confirm)
  const showConfirmation = ({
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "default", // "default", "danger", "warning"
    onConfirm
  }) => {
    return new Promise((resolve) => {
      const handleConfirm = () => {
        if (onConfirm) onConfirm();
        resolve(true);
      };




    window.dispatchEvent(new CustomEvent('confirmationRequest', {
      detail: {
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: handleConfirm
      }
    }));
  });
};
   export { showAchievementNotification, showStreakNotification, showConfirmation };


export default NotificationManager;