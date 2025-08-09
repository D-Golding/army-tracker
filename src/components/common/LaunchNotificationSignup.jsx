// components/common/LaunchNotificationSignup.jsx
import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const LaunchNotificationSignup = ({
  title = "🚀 Coming Soon!",
  description = "We're putting the finishing touches on our premium features! Get notified when we launch.",
  className = "",
  compact = false,
  tier = null // Add tier prop to track which tier they're interested in
}) => {
  const [formState, setFormState] = useState({
    email: '',
    consent: false,
    loading: false,
    submitted: false,
    error: null
  });

  const handleEmailChange = (e) => {
    setFormState(prev => ({ ...prev, email: e.target.value, error: null }));
  };

  const handleConsentChange = (e) => {
    setFormState(prev => ({ ...prev, consent: e.target.checked }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Tier prop received:', tier); // Debug log

    if (!formState.email || !validateEmail(formState.email)) {
      setFormState(prev => ({ ...prev, error: 'Please enter a valid email address' }));
      return;
    }

    if (!formState.consent) {
      setFormState(prev => ({ ...prev, error: 'Please agree to receive notifications' }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Ensure we have a tier for collection naming
      if (!tier) {
        console.log('Tier is null/undefined:', tier); // Debug log
        throw new Error('Tier not specified for email collection');
      }

      const collectionName = `launch_notifications_${tier}`;
      console.log('Collection name:', collectionName); // Debug log

      await addDoc(collection(db, collectionName), {
        email: formState.email.toLowerCase().trim(),
        timestamp: serverTimestamp(),
        source: window.location.pathname,
        userAgent: navigator.userAgent
      });

      setFormState(prev => ({
        ...prev,
        loading: false,
        submitted: true,
        email: '',
        consent: false
      }));

    } catch (error) {
      console.error('Error saving email:', error);
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'Something went wrong. Please try again.'
      }));
    }
  };

  if (formState.submitted) {
    return (
      <div className={`p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="text-2xl mb-2">✅</div>
          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
            You're on the list!
          </h4>
          <p className="text-xs text-green-700 dark:text-green-300">
            We'll notify you as soon as our premium features are available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg ${className}`}>
      {!compact && (
        <>
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            {title}
          </h4>
          <p className="text-xs text-blue-800 dark:text-blue-200 mb-3">
            {description}
          </p>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          value={formState.email}
          onChange={handleEmailChange}
          placeholder="your.email@example.com"
          disabled={formState.loading}
          className="w-full px-3 py-2 text-xs border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
        />

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="privacy-consent"
            checked={formState.consent}
            onChange={handleConsentChange}
            disabled={formState.loading}
            className="mt-0.5 rounded border-blue-300"
          />
          <label htmlFor="privacy-consent" className="text-xs text-blue-700 dark:text-blue-300">
            I agree to receive launch notifications and understand my email will be stored securely
          </label>
        </div>

        {formState.error && (
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
            {formState.error}
          </div>
        )}

        <button
          type="submit"
          disabled={formState.loading}
          className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {formState.loading ? (
            <>
              <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></span>
              Adding you to the list...
            </>
          ) : (
            'Notify Me When Available'
          )}
        </button>
      </form>
    </div>
  );
};

export default LaunchNotificationSignup;