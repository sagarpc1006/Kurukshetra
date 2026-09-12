import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';

export default function SettingsPage() {
  const [toastMessage, setToastMessage] = useState('');

  // Manage expanded sections: 'notifications' | 'privacy' | 'language' | 'account' | null
  const [expandedSection, setExpandedSection] = useState(null);

  // 1. Notifications State
  const [notifications, setNotifications] = useState(true);
  const [tripReminders, setTripReminders] = useState(true);
  const [ecoTwinUpdates, setEcoTwinUpdates] = useState(true);

  // 2. Privacy & Security State
  const [locationAccess, setLocationAccess] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 3. Language & Currency State
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('INR (₹)');
  const [distanceUnit, setDistanceUnit] = useState('km');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ecotrail_user_settings');
      if (saved) {
        const s = JSON.parse(saved);
        if (s.notifications !== undefined) setNotifications(s.notifications);
        if (s.tripReminders !== undefined) setTripReminders(s.tripReminders);
        if (s.ecoTwinUpdates !== undefined) setEcoTwinUpdates(s.ecoTwinUpdates);
        if (s.locationAccess !== undefined) setLocationAccess(s.locationAccess);
        if (s.twoFactorAuth !== undefined) setTwoFactorAuth(s.twoFactorAuth);
        if (s.language) setLanguage(s.language);
        if (s.currency) setCurrency(s.currency);
        if (s.distanceUnit) setDistanceUnit(s.distanceUnit);
      }
    } catch (e) {}
  }, []);

  const saveSettings = (partial) => {
    try {
      const current = JSON.parse(localStorage.getItem('ecotrail_user_settings') || '{}');
      const updated = { ...current, ...partial };
      localStorage.setItem('ecotrail_user_settings', JSON.stringify(updated));
    } catch (e) {}
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const toggleSection = (sec) => {
    setExpandedSection(prev => (prev === sec ? null : sec));
  };

  const handleDownloadData = () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        profile: JSON.parse(localStorage.getItem('ecotrail_user_profile') || '{}'),
        preferences: JSON.parse(localStorage.getItem('ecotrail_user_preferences') || '{}'),
        settings: JSON.parse(localStorage.getItem('ecotrail_user_settings') || '{}'),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecotrail_data_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Your EcoTrail data has been downloaded');
    } catch (e) {
      showToast('Failed to download data');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setShowPasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password successfully changed');
  };

  return (
    <AppLayout>
      <div className="minimal-page-wrapper">
        <div className="minimal-header">
          <h1>Settings</h1>
        </div>

        {toastMessage && (
          <div className="minimal-toast-banner" role="alert">
            <span>✓</span> {toastMessage}
          </div>
        )}

        <div className="settings-cards-stack">
          {/* 1. Notifications */}
          <div className={`settings-main-card ${expandedSection === 'notifications' ? 'expanded' : ''}`}>
            <div className="settings-main-row" onClick={() => toggleSection('notifications')}>
              <span className="settings-main-title">Notifications</span>
              <button
                type="button"
                className="settings-manage-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection('notifications');
                }}
              >
                {expandedSection === 'notifications' ? 'Close ✕' : 'Manage →'}
              </button>
            </div>

            {expandedSection === 'notifications' && (
              <div className="settings-expanded-content">
                <div className="settings-sub-row">
                  <span className="settings-sub-label">Notifications</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => {
                        setNotifications(e.target.checked);
                        saveSettings({ notifications: e.target.checked });
                        showToast(`Notifications ${e.target.checked ? 'ON' : 'OFF'}`);
                      }}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-sub-row">
                  <span className="settings-sub-label">Trip reminders</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={tripReminders}
                      onChange={(e) => {
                        setTripReminders(e.target.checked);
                        saveSettings({ tripReminders: e.target.checked });
                        showToast(`Trip reminders ${e.target.checked ? 'ON' : 'OFF'}`);
                      }}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-sub-row">
                  <span className="settings-sub-label">Eco-Twin updates</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={ecoTwinUpdates}
                      onChange={(e) => {
                        setEcoTwinUpdates(e.target.checked);
                        saveSettings({ ecoTwinUpdates: e.target.checked });
                        showToast(`Eco-Twin updates ${e.target.checked ? 'ON' : 'OFF'}`);
                      }}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 2. Privacy & Security */}
          <div className={`settings-main-card ${expandedSection === 'privacy' ? 'expanded' : ''}`}>
            <div className="settings-main-row" onClick={() => toggleSection('privacy')}>
              <span className="settings-main-title">Privacy &amp; Security</span>
              <button
                type="button"
                className="settings-manage-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection('privacy');
                }}
              >
                {expandedSection === 'privacy' ? 'Close ✕' : 'Manage →'}
              </button>
            </div>

            {expandedSection === 'privacy' && (
              <div className="settings-expanded-content">
                <div className="settings-sub-row">
                  <span className="settings-sub-label">Location access</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={locationAccess}
                      onChange={(e) => {
                        setLocationAccess(e.target.checked);
                        saveSettings({ locationAccess: e.target.checked });
                        showToast(`Location access ${e.target.checked ? 'ON' : 'OFF'}`);
                      }}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-sub-row">
                  <span className="settings-sub-label">Change password</span>
                  <button
                    type="button"
                    className="minimal-btn-inline"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change password
                  </button>
                </div>

                <div className="settings-sub-row">
                  <span className="settings-sub-label">Two-factor authentication</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={twoFactorAuth}
                      onChange={(e) => {
                        setTwoFactorAuth(e.target.checked);
                        saveSettings({ twoFactorAuth: e.target.checked });
                        showToast(`Two-factor authentication ${e.target.checked ? 'ON' : 'OFF'}`);
                      }}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-sub-row">
                  <span className="settings-sub-label">Delete account</span>
                  <button
                    type="button"
                    className="minimal-btn-danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account?')) {
                        showToast('Account deletion request registered');
                      }
                    }}
                  >
                    Delete account
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Language & Currency */}
          <div className={`settings-main-card ${expandedSection === 'language' ? 'expanded' : ''}`}>
            <div className="settings-main-row" onClick={() => toggleSection('language')}>
              <span className="settings-main-title">Language &amp; Currency</span>
              <button
                type="button"
                className="settings-manage-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection('language');
                }}
              >
                {expandedSection === 'language' ? 'Close ✕' : 'Manage →'}
              </button>
            </div>

            {expandedSection === 'language' && (
              <div className="settings-expanded-content">
                <div className="settings-sub-row">
                  <span className="settings-sub-label">Language</span>
                  <select
                    className="minimal-select"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      saveSettings({ language: e.target.value });
                      showToast(`Language: ${e.target.value}`);
                    }}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>

                <div className="settings-sub-row">
                  <span className="settings-sub-label">Currency</span>
                  <select
                    className="minimal-select"
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      saveSettings({ currency: e.target.value });
                      showToast(`Currency: ${e.target.value}`);
                    }}
                  >
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                  </select>
                </div>

                <div className="settings-sub-row">
                  <span className="settings-sub-label">Distance</span>
                  <select
                    className="minimal-select"
                    value={distanceUnit}
                    onChange={(e) => {
                      setDistanceUnit(e.target.value);
                      saveSettings({ distanceUnit: e.target.value });
                      showToast(`Distance: ${e.target.value}`);
                    }}
                  >
                    <option value="km">km</option>
                    <option value="miles">miles</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 4. Manage Account */}
          <div className={`settings-main-card ${expandedSection === 'account' ? 'expanded' : ''}`}>
            <div className="settings-main-row" onClick={() => toggleSection('account')}>
              <span className="settings-main-title">Manage Account</span>
              <button
                type="button"
                className="settings-manage-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection('account');
                }}
              >
                {expandedSection === 'account' ? 'Close ✕' : 'Manage →'}
              </button>
            </div>

            {expandedSection === 'account' && (
              <div className="settings-expanded-content">
                <div className="settings-sub-row">
                  <span className="settings-sub-label">Download my data</span>
                  <button
                    type="button"
                    className="minimal-btn-inline"
                    onClick={handleDownloadData}
                  >
                    Download data
                  </button>
                </div>

                <div className="settings-sub-row">
                  <span className="settings-sub-label">Log out of all devices</span>
                  <button
                    type="button"
                    className="minimal-btn-inline"
                    onClick={() => {
                      if (window.confirm('Log out from all other active sessions?')) {
                        showToast('Logged out of all other devices');
                      }
                    }}
                  >
                    Log out all
                  </button>
                </div>

                <div className="settings-sub-row">
                  <span className="settings-sub-label">Deactivate account</span>
                  <button
                    type="button"
                    className="minimal-btn-warning"
                    onClick={() => {
                      if (window.confirm('Temporarily deactivate your account?')) {
                        showToast('Account deactivated');
                      }
                    }}
                  >
                    Deactivate
                  </button>
                </div>

                <div className="settings-destructive-divider" />

                <div className="settings-sub-row destructive-row">
                  <span className="settings-sub-label danger-label">Delete account</span>
                  <button
                    type="button"
                    className="minimal-btn-danger"
                    onClick={() => {
                      if (window.confirm('Permanently delete your account and all data?')) {
                        showToast('Account scheduled for deletion');
                      }
                    }}
                  >
                    Delete account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="logout-modal-backdrop" onClick={() => setShowPasswordModal(false)}>
            <div className="logout-modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="password-modal-form">
                <div className="minimal-field-row" style={{ borderBottom: 'none', padding: '8px 0' }}>
                  <label className="minimal-field-label">New Password</label>
                  <input
                    type="password"
                    className="minimal-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>
                <div className="minimal-field-row" style={{ borderBottom: 'none', padding: '8px 0' }}>
                  <label className="minimal-field-label">Confirm Password</label>
                  <input
                    type="password"
                    className="minimal-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="logout-modal-actions" style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-save-primary"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
