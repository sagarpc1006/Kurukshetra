import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

export default function MyProfile() {
  const { user, profile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saveToast, setSaveToast] = useState('');

  // Personal Information fields
  const [name, setName] = useState('Yashraj Gadilkar');
  const [email, setEmail] = useState('yashraj@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [homeLocation, setHomeLocation] = useState('Pune, Maharashtra');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ecotrail_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.homeLocation) setHomeLocation(parsed.homeLocation);
      } else {
        if (user?.displayName || profile?.name) {
          setName(user.displayName || profile.name);
        }
        if (user?.email) {
          setEmail(user.email);
        }
      }
    } catch (e) {}
  }, [user, profile]);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const updated = {
      name,
      email,
      phone,
      homeLocation,
    };
    localStorage.setItem('ecotrail_user_profile', JSON.stringify(updated));
    window.dispatchEvent(new Event('ecotrail_profile_updated'));

    setIsEditing(false);
    setSaveToast('Profile saved successfully!');
    setTimeout(() => setSaveToast(''), 3000);
  };

  return (
    <AppLayout>
      <div className="minimal-page-wrapper">
        <div className="minimal-header">
          <h1>My Profile</h1>
        </div>

        {saveToast && (
          <div className="minimal-toast-banner" role="alert">
            <span>✓</span> {saveToast}
          </div>
        )}

        <div className="minimal-card">
          <div className="minimal-card-head">
            <h2>Personal Information</h2>
            {!isEditing ? (
              <button
                type="button"
                className="minimal-btn-outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <div className="minimal-btn-group">
                <button
                  type="button"
                  className="minimal-btn-cancel"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="minimal-btn-primary"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="minimal-info-form">
            {/* Name */}
            <div className="minimal-field-row">
              <label className="minimal-field-label" htmlFor="profile-name">Name</label>
              {isEditing ? (
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="minimal-input"
                  required
                />
              ) : (
                <div className="minimal-field-value">{name}</div>
              )}
            </div>

            {/* Email */}
            <div className="minimal-field-row">
              <label className="minimal-field-label" htmlFor="profile-email">Email</label>
              {isEditing ? (
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="minimal-input"
                  required
                />
              ) : (
                <div className="minimal-field-value">{email}</div>
              )}
            </div>

            {/* Phone */}
            <div className="minimal-field-row">
              <label className="minimal-field-label" htmlFor="profile-phone">Phone</label>
              {isEditing ? (
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="minimal-input"
                  placeholder="+91 98765 43210"
                />
              ) : (
                <div className="minimal-field-value">{phone}</div>
              )}
            </div>

            {/* Home / Living Location */}
            <div className="minimal-field-row">
              <label className="minimal-field-label" htmlFor="profile-home">Home / Living Location</label>
              {isEditing ? (
                <input
                  id="profile-home"
                  type="text"
                  value={homeLocation}
                  onChange={(e) => setHomeLocation(e.target.value)}
                  className="minimal-input"
                  placeholder="e.g. Pune, Maharashtra"
                  required
                />
              ) : (
                <div className="minimal-field-value">{homeLocation}</div>
              )}
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
