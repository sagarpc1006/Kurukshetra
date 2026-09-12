import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';

export default function TravelPreferences() {
  const [isEditing, setIsEditing] = useState(false);
  const [saveToast, setSaveToast] = useState('');

  // 6 specific preferences
  const [travelStyle, setTravelStyle] = useState('Adventure');
  const [destination, setDestination] = useState('Mountains & Nature');
  const [transport, setTransport] = useState('Train / Public Transport');
  const [budget, setBudget] = useState('Value for money');
  const [sustainability, setSustainability] = useState('High priority');
  const [accessibility, setAccessibility] = useState('No specific requirements');

  const OPTIONS = {
    travelStyle: ['Adventure', 'Peace & relaxation', 'Exploration', 'Fun & nightlife'],
    destination: ['Mountains & Nature', 'Beach & Coastal', 'Forest & Wildlife', 'City & Culture'],
    transport: ['Train / Public Transport', 'Greener option', 'Faster option', 'More comfortable option'],
    budget: ['Value for money', 'Lower cost', 'Better experience', 'Best overall balance'],
    sustainability: ['High priority', 'Moderate', 'Balanced priority'],
    accessibility: ['No specific requirements', 'Step-free access', 'Wheelchair accessible', 'Reduced walking'],
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ecotrail_user_preferences');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.travelStyle) setTravelStyle(p.travelStyle);
        if (p.destination) setDestination(p.destination);
        if (p.transport) setTransport(p.transport);
        if (p.budget) setBudget(p.budget);
        if (p.sustainability) setSustainability(p.sustainability);
        if (p.accessibility) setAccessibility(p.accessibility);
      }
    } catch (e) {}
  }, []);

  const handleSave = () => {
    const updated = {
      travelStyle,
      destination,
      transport,
      budget,
      sustainability,
      accessibility,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('ecotrail_user_preferences', JSON.stringify(updated));
    setIsEditing(false);
    setSaveToast('Travel preferences saved successfully!');
    setTimeout(() => setSaveToast(''), 3000);
  };

  return (
    <AppLayout>
      <div className="minimal-page-wrapper">
        <div className="minimal-header">
          <h1>Travel Preferences</h1>
        </div>

        {saveToast && (
          <div className="minimal-toast-banner" role="alert">
            <span>✓</span> {saveToast}
          </div>
        )}

        <div className="minimal-card">
          <div className="minimal-card-head">
            <h2>Active Preferences</h2>
            {!isEditing ? (
              <button
                type="button"
                className="minimal-btn-outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Preferences
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
                  Save Preferences
                </button>
              </div>
            )}
          </div>

          <div className="minimal-pref-list">
            {/* 1. Travel Style */}
            <div className="minimal-pref-row">
              <span className="minimal-pref-label">Travel Style</span>
              <div className="minimal-pref-control">
                {isEditing ? (
                  <select
                    className="minimal-select"
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                  >
                    {OPTIONS.travelStyle.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <span className="minimal-pref-chip">{travelStyle}</span>
                )}
              </div>
            </div>

            {/* 2. Destination Preferences */}
            <div className="minimal-pref-row">
              <span className="minimal-pref-label">Destination Preferences</span>
              <div className="minimal-pref-control">
                {isEditing ? (
                  <select
                    className="minimal-select"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  >
                    {OPTIONS.destination.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <span className="minimal-pref-chip">{destination}</span>
                )}
              </div>
            </div>

            {/* 3. Transport Preference */}
            <div className="minimal-pref-row">
              <span className="minimal-pref-label">Transport Preference</span>
              <div className="minimal-pref-control">
                {isEditing ? (
                  <select
                    className="minimal-select"
                    value={transport}
                    onChange={(e) => setTransport(e.target.value)}
                  >
                    {OPTIONS.transport.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <span className="minimal-pref-chip">{transport}</span>
                )}
              </div>
            </div>

            {/* 4. Budget */}
            <div className="minimal-pref-row">
              <span className="minimal-pref-label">Budget</span>
              <div className="minimal-pref-control">
                {isEditing ? (
                  <select
                    className="minimal-select"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  >
                    {OPTIONS.budget.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <span className="minimal-pref-chip">{budget}</span>
                )}
              </div>
            </div>

            {/* 5. Sustainability Priority */}
            <div className="minimal-pref-row">
              <span className="minimal-pref-label">Sustainability Priority</span>
              <div className="minimal-pref-control">
                {isEditing ? (
                  <select
                    className="minimal-select"
                    value={sustainability}
                    onChange={(e) => setSustainability(e.target.value)}
                  >
                    {OPTIONS.sustainability.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <span className="minimal-pref-chip green-chip">{sustainability}</span>
                )}
              </div>
            </div>

            {/* 6. Accessibility Preferences */}
            <div className="minimal-pref-row">
              <span className="minimal-pref-label">Accessibility Preferences</span>
              <div className="minimal-pref-control">
                {isEditing ? (
                  <select
                    className="minimal-select"
                    value={accessibility}
                    onChange={(e) => setAccessibility(e.target.value)}
                  >
                    {OPTIONS.accessibility.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <span className="minimal-pref-chip">{accessibility}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
