import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';
import RecentTripCard from '../components/RecentTripCard';
import EmptyState from '../components/EmptyState';
import ItineraryView from '../components/ItineraryView';
import { getRecentTrips, deleteTrip } from '../services/tripAPI';

export default function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'saved' | 'completed'
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    getRecentTrips().then((data) => {
      if (isMounted) {
        setTrips(data || []);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to remove this journey from your saved trips?')) {
      return;
    }
    try {
      await deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      setStatusMessage('Journey deleted successfully.');
      setTimeout(() => setStatusMessage(''), 3000);
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(null);
      }
    } catch (err) {
      console.error('Error deleting trip:', err);
      // Fallback local deletion
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    }
  };

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip);
  };

  const filteredTrips = trips.filter((trip) => {
    if (activeTab === 'saved') return trip.status === 'Saved';
    if (activeTab === 'completed') return trip.status === 'Completed';
    return true;
  });

  return (
    <div className="authenticated-home-shell">
      <AppNavbar />

      <main className="authenticated-home-main">
        <div className="home-content-container">
          <div className="page-header-strip">
            <div>
              <div className="welcome-badge">
                <span>YOUR COLLECTION</span>
              </div>
              <h1 className="page-title">My Trips</h1>
              <p className="page-desc">
                Review your saved, planned, and completed sustainable journeys stored in PostgreSQL.
              </p>
            </div>
            <Link to="/dashboard" className="btn">
              Plan a New Trip <b>↗</b>
            </Link>
          </div>

          {statusMessage && (
            <div className="profile-alert-box" style={{ marginBottom: '16px' }} role="status">
              ✓ {statusMessage}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="trips-tab-bar" role="tablist">
            <button
              type="button"
              className={`trip-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Journeys ({trips.length})
            </button>
            <button
              type="button"
              className={`trip-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved ({trips.filter((t) => t.status === 'Saved').length})
            </button>
            <button
              type="button"
              className={`trip-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed ({trips.filter((t) => t.status === 'Completed').length})
            </button>
          </div>

          {/* Trips Content */}
          {loading ? (
            <div className="trips-loading-skeleton">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          ) : filteredTrips.length === 0 ? (
            <EmptyState
              icon="🗺️"
              title="No trips in this category"
              description="Your saved EcoTrail journeys will appear here once you explore and save routes."
              actionLabel="Plan a Trip"
              onAction={() => navigate('/dashboard')}
            />
          ) : (
            <div className="trips-page-grid">
              {filteredTrips.map((trip) => (
                <RecentTripCard
                  key={trip.id}
                  trip={trip}
                  onViewTrip={handleViewTrip}
                  onDeleteTrip={handleDeleteTrip}
                />
              ))}
            </div>
          )}

          {/* TRIP DETAIL & ITINERARY MODAL */}
          {selectedTrip && (
            <div className="acc-modal-overlay" role="dialog" aria-modal="true" onClick={() => setSelectedTrip(null)}>
              <div className="acc-modal-card" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
                <div className="acc-modal-header">
                  <div>
                    <span className="acc-modal-badge">SAVED ITINERARY</span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem' }}>{selectedTrip.title}</h3>
                    <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                      {selectedTrip.origin} → {selectedTrip.destination} · {selectedTrip.duration} · {selectedTrip.totalCost}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="acc-modal-close"
                    onClick={() => setSelectedTrip(null)}
                    aria-label="Close trip details"
                  >
                    ✕
                  </button>
                </div>

                <div className="acc-modal-content" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {/* Detailed Itinerary if available */}
                  {selectedTrip.itinerary && selectedTrip.itinerary.days ? (
                    <ItineraryView itinerary={selectedTrip.itinerary} />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                      <p>Full route metrics: {selectedTrip.transport}</p>
                      <p>Carbon emissions: {selectedTrip.carbonEmissions} ({selectedTrip.carbonSaved})</p>
                      <p>Eco Score: <strong>{selectedTrip.ecoScore}/100</strong></p>
                      <p>Accommodations: {selectedTrip.stays}</p>
                    </div>
                  )}

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn small light"
                      style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      onClick={() => handleDeleteTrip(selectedTrip.id)}
                    >
                      Delete Journey 🗑
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => setSelectedTrip(null)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
