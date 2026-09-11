import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';
import { useAuth } from '../context/AuthContext';
import { getUserPreferences } from '../services/tripAPI';
import api from '../services/api';

export default function Profile() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Form state
  const [ecoPriority, setEcoPriority] = useState('High');
  const [budget, setBudget] = useState('₹10,000');
  const [transport, setTransport] = useState('Public Transport');
  const [accessibility, setAccessibility] = useState('Required');

  // Step 5: Accessibility Profile State (persisted via Django / PostgreSQL)
  const [wheelchairRequired, setWheelchairRequired] = useState(false);
  const [stepFreeRequired, setStepFreeRequired] = useState(false);
  const [accessibleVehicleRequired, setAccessibleVehicleRequired] = useState(false);
  const [accessibleVenueRequired, setAccessibleVenueRequired] = useState(false);
  const [accessibleToiletPreferred, setAccessibleToiletPreferred] = useState(false);
  const [elevatorPreferred, setElevatorPreferred] = useState(false);
  const [reducedWalking, setReducedWalking] = useState(false);
  const [accSaveMessage, setAccSaveMessage] = useState('');
  const [isSavingAcc, setIsSavingAcc] = useState(false);

  const displayName =
    user?.displayName || profile?.name || user?.email?.split('@')[0] || 'Traveler';
  const email = user?.email || profile?.email || '—';
  const initial = (displayName[0] || 'T').toUpperCase();

  useEffect(() => {
    let isMounted = true;

    // Fetch persisted travel preferences from PostgreSQL backend
    api.get('/api/profile/')
      .then((res) => {
        if (isMounted && res.data?.success && res.data?.profile) {
          const prof = res.data.profile;
          setPreferences({
            ecoPriority: prof.eco_priority || 'High',
            budget: prof.budget_preference ? `₹${prof.budget_preference.toLocaleString()}` : '₹10,000',
            transportPreference: prof.preferred_transport || 'Public Transport',
            accessibility: 'Required'
          });
          setEcoPriority(prof.eco_priority || 'High');
          setBudget(prof.budget_preference ? `₹${prof.budget_preference.toLocaleString()}` : '₹10,000');
          setTransport(prof.preferred_transport || 'Public Transport');
        } else {
          getUserPreferences().then((data) => {
            if (isMounted && data) {
              setPreferences(data);
              setEcoPriority(data.ecoPriority || 'High');
              setBudget(data.budget || '₹10,000');
              setTransport(data.transportPreference || 'Public Transport');
              setAccessibility(data.accessibility || 'Required');
            }
          });
        }
      })
      .catch(() => {
        getUserPreferences().then((data) => {
          if (isMounted && data) {
            setPreferences(data);
            setEcoPriority(data.ecoPriority || 'High');
            setBudget(data.budget || '₹10,000');
            setTransport(data.transportPreference || 'Public Transport');
            setAccessibility(data.accessibility || 'Required');
          }
        });
      });

    // Fetch persisted Accessibility Profile from Django backend
    api.get('/api/accessibility/profile/')
      .then((res) => {
        if (isMounted && res.data?.success && res.data?.profile) {
          const p = res.data.profile;
          setWheelchairRequired(Boolean(p.wheelchair_required));
          setStepFreeRequired(Boolean(p.step_free_required));
          setAccessibleVehicleRequired(Boolean(p.accessible_vehicle_required));
          setAccessibleVenueRequired(Boolean(p.accessible_venue_required));
          setAccessibleToiletPreferred(Boolean(p.accessible_toilet_preferred));
          setElevatorPreferred(Boolean(p.elevator_preferred));
          setReducedWalking(Boolean(p.reduced_walking));
        }
      })
      .catch((err) => console.debug('Could not load accessibility profile:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveAccessibility = async (e) => {
    e.preventDefault();
    setIsSavingAcc(true);
    setAccSaveMessage('');
    try {
      const payload = {
        client_id: user?.uid ? `user_${user.uid}` : 'default_traveler',
        wheelchair_required: wheelchairRequired,
        step_free_required: stepFreeRequired,
        accessible_vehicle_required: accessibleVehicleRequired,
        accessible_venue_required: accessibleVenueRequired,
        accessible_toilet_preferred: accessibleToiletPreferred,
        elevator_preferred: elevatorPreferred,
        reduced_walking: reducedWalking,
      };
      const res = await api.post('/api/accessibility/profile/', payload);
      if (res.data?.success) {
        setAccSaveMessage('Accessibility preferences successfully saved to database!');
        setTimeout(() => setAccSaveMessage(''), 4000);
      }
    } catch (err) {
      console.error('Error saving accessibility profile:', err);
      setAccSaveMessage('Failed to save accessibility preferences.');
    } finally {
      setIsSavingAcc(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        eco_priority: ecoPriority,
        budget: budget,
        preferred_transport: transport,
      };
      const res = await api.patch('/api/profile/', payload);
      if (res.data?.success) {
        setPreferences({
          ...preferences,
          ecoPriority,
          budget,
          transportPreference: transport,
          accessibility,
        });
        setEditing(false);
        setSaveMessage('Preferences successfully saved to database!');
        setTimeout(() => setSaveMessage(''), 4000);
        return;
      }
    } catch (err) {
      console.error('Error saving preferences to backend:', err);
    }

    // Local fallback update
    setPreferences({
      ...preferences,
      ecoPriority,
      budget,
      transportPreference: transport,
      accessibility,
    });
    setEditing(false);
    setSaveMessage('Preferences updated.');
    setTimeout(() => setSaveMessage(''), 4000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="authenticated-home-shell">
      <AppNavbar />

      <main className="authenticated-home-main">
        <div className="home-content-container profile-container">
          <div className="page-header-strip">
            <div>
              <div className="welcome-badge">
                <span>ACCOUNT &amp; SETTINGS</span>
              </div>
              <h1 className="page-title">User Profile</h1>
              <p className="page-desc">
                Manage your identity and personalized eco-travel preferences.
              </p>
            </div>
          </div>

          {saveMessage && (
            <div className="profile-alert-box" role="status">
              ✓ {saveMessage}
            </div>
          )}

          {/* User Identity Card */}
          <div className="profile-identity-card">
            <div className="profile-avatar-large" aria-hidden="true">
              {initial}
            </div>
            <div className="profile-identity-info">
              <h2>{displayName}</h2>
              <p className="profile-email">✉ {email}</p>
              <div className="profile-auth-badge">
                <span className="badge-bullet">●</span>
                <span>Authenticated via Firebase</span>
              </div>
            </div>
            <button
              type="button"
              className="btn small light profile-logout-btn"
              onClick={handleLogout}
            >
              Log out ↪
            </button>
          </div>

          {/* Travel & Accessibility Preferences Section */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <div>
                <h3>Travel Preferences</h3>
                <p>These settings customize the AI Travel Assistant's recommendations.</p>
              </div>
              {!editing && (
                <button
                  type="button"
                  className="btn small light"
                  onClick={() => setEditing(true)}
                >
                  Edit Preferences
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSavePreferences} className="profile-edit-form">
                <div className="form-group-grid">
                  <label>
                    <span>🌱 Eco Priority</span>
                    <select
                      value={ecoPriority}
                      onChange={(e) => setEcoPriority(e.target.value)}
                    >
                      <option value="Maximum (Zero flight)">Maximum (Strictly trains/EVs)</option>
                      <option value="High">High (Recommended)</option>
                      <option value="Balanced">Balanced (Cost &amp; emissions)</option>
                    </select>
                  </label>

                  <label>
                    <span>💰 Default Budget</span>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. ₹10,000"
                    />
                  </label>

                  <label>
                    <span>🚆 Preferred Transport</span>
                    <select
                      value={transport}
                      onChange={(e) => setTransport(e.target.value)}
                    >
                      <option value="Public Transport">Public Transport (Train / Bus)</option>
                      <option value="Electric Rail Priority">Electric Rail Priority</option>
                      <option value="Shared EV Cabs">Shared EV Cabs</option>
                      <option value="Fastest Mixed Mode">Fastest Mixed Mode</option>
                    </select>
                  </label>

                  <label>
                    <span>♿ Accessibility Needs</span>
                    <select
                      value={accessibility}
                      onChange={(e) => setAccessibility(e.target.value)}
                    >
                      <option value="Required">Required (Step-free, elevators)</option>
                      <option value="Preferred">Preferred (Low incline, priority seating)</option>
                      <option value="None">Standard access</option>
                    </select>
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn small">
                    Save Preferences
                  </button>
                  <button
                    type="button"
                    className="btn small light"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-pref-summary-grid">
                <div className="profile-pref-item">
                  <span className="item-label">Eco Priority</span>
                  <strong className="green-val">{preferences?.ecoPriority || ecoPriority}</strong>
                </div>
                <div className="profile-pref-item">
                  <span className="item-label">Default Budget</span>
                  <strong>{preferences?.budget || budget}</strong>
                </div>
                <div className="profile-pref-item">
                  <span className="item-label">Preferred Transport</span>
                  <strong>{preferences?.transportPreference || transport}</strong>
                </div>
                <div className="profile-pref-item">
                  <span className="item-label">Accessibility</span>
                  <strong className="purple-val">{preferences?.accessibility || accessibility}</strong>
                </div>
              </div>
            )}
          </div>

          {/* ACCESSIBILITY PREFERENCES (STEP 5) */}
          <div className="profile-section-card" id="accessibility-preferences-section">
            <div className="profile-section-header">
              <div>
                <div className="welcome-badge" style={{ marginBottom: '6px' }}>
                  <span>VERIFIED, NOT CLAIMED</span>
                </div>
                <h3>Accessibility Preferences</h3>
                <p>
                  Customize your step-free and inclusive mobility requirements.
                  These preferences are securely persisted and automatically applied to travel planning.
                </p>
              </div>
            </div>

            {accSaveMessage && (
              <div className="profile-alert-box" style={{ marginBottom: '16px' }} role="status">
                ✓ {accSaveMessage}
              </div>
            )}

            <form onSubmit={handleSaveAccessibility} className="acc-pref-form">
              <div className="acc-checkbox-grid">
                <label className="acc-checkbox-item">
                  <input
                    type="checkbox"
                    checked={wheelchairRequired}
                    onChange={(e) => setWheelchairRequired(e.target.checked)}
                  />
                  <div>
                    <strong>♿ Wheelchair accessibility</strong>
                    <small>Require wheelchair-accessible boarding, low-floor vehicles, and designated spaces</small>
                  </div>
                </label>

                <label className="acc-checkbox-item">
                  <input
                    type="checkbox"
                    checked={stepFreeRequired}
                    onChange={(e) => setStepFreeRequired(e.target.checked)}
                  />
                  <div>
                    <strong>🪜 Step-free routes</strong>
                    <small>Require level transitions, ramps, or continuous step-free boarding</small>
                  </div>
                </label>

                <label className="acc-checkbox-item">
                  <input
                    type="checkbox"
                    checked={accessibleVenueRequired}
                    onChange={(e) => setAccessibleVenueRequired(e.target.checked)}
                  />
                  <div>
                    <strong>🚪 Accessible entrances</strong>
                    <small>Require automatic wide doors or level street-level entry</small>
                  </div>
                </label>

                <label className="acc-checkbox-item">
                  <input
                    type="checkbox"
                    checked={accessibleVehicleRequired}
                    onChange={(e) => setAccessibleVehicleRequired(e.target.checked)}
                  />
                  <div>
                    <strong>🚗 Accessible vehicle</strong>
                    <small>Require ramp-equipped transit or wheelchair-accessible vehicle</small>
                  </div>
                </label>

                <label className="acc-checkbox-item">
                  <input
                    type="checkbox"
                    checked={accessibleToiletPreferred}
                    onChange={(e) => setAccessibleToiletPreferred(e.target.checked)}
                  />
                  <div>
                    <strong>🚻 Accessible toilet</strong>
                    <small>Prefer transit and venues with verified grab-rail restrooms</small>
                  </div>
                </label>

                <label className="acc-checkbox-item">
                  <input
                    type="checkbox"
                    checked={elevatorPreferred}
                    onChange={(e) => setElevatorPreferred(e.target.checked)}
                  />
                  <div>
                    <strong>🛗 Elevator / lift</strong>
                    <small>Prefer stations and facilities with working elevators over stairs</small>
                  </div>
                </label>

                <label className="acc-checkbox-item">
                  <input
                    type="checkbox"
                    checked={reducedWalking}
                    onChange={(e) => setReducedWalking(e.target.checked)}
                  />
                  <div>
                    <strong>🚶 Reduce walking</strong>
                    <small>Prioritize direct transfers and short-distance platform connections</small>
                  </div>
                </label>
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="btn small" disabled={isSavingAcc}>
                  {isSavingAcc ? 'Saving Preferences...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
