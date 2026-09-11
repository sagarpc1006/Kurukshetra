import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecentTripCard from './RecentTripCard';
import EmptyState from './EmptyState';
import { getRecentTrips } from '../services/tripAPI';

export default function RecentTrips({ onPlanTripClick }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTripModal, setSelectedTripModal] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getRecentTrips()
      .then((data) => {
        if (isMounted) {
          setTrips(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching recent trips:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="recent-trips-section">
      <div className="section-header-row">
        <div>
          <span className="section-kicker">YOUR JOURNEYS</span>
          <h3 className="section-heading">Recent Trips</h3>
        </div>
        <Link to="/trips" className="section-action-link">
          View All Trips →
        </Link>
      </div>

      {loading ? (
        <div className="trips-loading-skeleton">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          icon="🧳"
          title="No trips yet"
          description="Your planned and saved journeys will appear here once you explore with EcoTrail."
          actionLabel="Plan Your First Trip"
          onAction={onPlanTripClick}
        />
      ) : (
        <div className="recent-trips-list">
          {trips.map((trip) => (
            <RecentTripCard
              key={trip.id}
              trip={trip}
              onViewTrip={(t) => setSelectedTripModal(t)}
            />
          ))}
        </div>
      )}

      {/* Lightweight Quick View Modal */}
      {selectedTripModal && (
        <div
          className="trip-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedTripModal(null)}
        >
          <div
            className="trip-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{selectedTripModal.origin} → {selectedTripModal.destination}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedTripModal(null)}
              >
                ✕
              </button>
            </div>
            <p className="modal-meta">{selectedTripModal.duration} · {selectedTripModal.travelDates}</p>
            <div className="modal-body-stats">
              <div><span>Transport</span><strong>{selectedTripModal.transport}</strong></div>
              <div><span>Total Cost</span><strong>{selectedTripModal.totalCost}</strong></div>
              <div><span>Carbon Footprint</span><strong className="green-val">{selectedTripModal.carbonEmissions}</strong></div>
              <div><span>EcoTrail Score</span><strong>{selectedTripModal.ecoScore} / 100</strong></div>
            </div>
            <div className="modal-footer">
              <Link to="/trips" className="btn full">Go to My Trips ↗</Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
