import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserPreferences } from '../services/tripAPI';

export default function TravelPreferencesCard() {
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getUserPreferences().then((data) => {
      if (isMounted) setPreferences(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!preferences) {
    return (
      <div className="pref-card card-loading">
        <div className="pref-loading-pulse">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="pref-card">
      <div className="pref-card-header">
        <div className="pref-title-group">
          <span className="pref-icon" aria-hidden="true">⚙️</span>
          <h3>Your Travel Preferences</h3>
        </div>
        <Link to="/profile" className="pref-edit-link">
          Edit Preferences →
        </Link>
      </div>

      <div className="pref-grid">
        <div className="pref-item">
          <div className="pref-item-label">
            <span aria-hidden="true">🌱</span> Eco Priority
          </div>
          <strong className="pref-item-val green-val">{preferences.ecoPriority}</strong>
          <small className="pref-item-sub">{preferences.ecoPriorityDescription}</small>
        </div>

        <div className="pref-item">
          <div className="pref-item-label">
            <span aria-hidden="true">💰</span> Budget
          </div>
          <strong className="pref-item-val">{preferences.budget}</strong>
          <small className="pref-item-sub">Default cap per trip</small>
        </div>

        <div className="pref-item">
          <div className="pref-item-label">
            <span aria-hidden="true">🚆</span> Transport
          </div>
          <strong className="pref-item-val">{preferences.transportPreference}</strong>
          <small className="pref-item-sub">{preferences.transportModes?.join(', ')}</small>
        </div>

        <div className="pref-item">
          <div className="pref-item-label">
            <span aria-hidden="true">♿</span> Accessibility
          </div>
          <strong className="pref-item-val purple-val">{preferences.accessibility}</strong>
          <small className="pref-item-sub">{preferences.accessibilityDetails?.join(' · ')}</small>
        </div>
      </div>
    </div>
  );
}
