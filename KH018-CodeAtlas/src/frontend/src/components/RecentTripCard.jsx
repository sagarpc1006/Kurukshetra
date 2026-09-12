import React from 'react';
import { Link } from 'react-router-dom';

export default function RecentTripCard({ trip, onViewTrip, onDeleteTrip }) {
  return (
    <article className="recent-trip-card">
      <div
        className="recent-trip-thumb"
        style={{ backgroundImage: `url(${trip.coverImage})` }}
        aria-hidden="true"
      >
        <span className="recent-trip-status-tag">{trip.status}</span>
      </div>

      <div className="recent-trip-details">
        <div className="recent-trip-headline">
          <div>
            <h4 className="trip-route-title">{trip.origin} → {trip.destination}</h4>
            <span className="trip-meta-info">{trip.duration} · {trip.travelDates}</span>
          </div>
          <div className="trip-score-badge" title="EcoTrail Score for this journey">
            <strong>{trip.ecoScore}</strong>
            <small>Eco Score</small>
          </div>
        </div>

        <p className="trip-transport-note">🚆 {trip.transport}</p>

        <div className="trip-stats-strip">
          <div className="stat-node">
            <span className="stat-label">Estimated Cost</span>
            <strong className="stat-figure">{trip.totalCost}</strong>
          </div>
          <div className="stat-node">
            <span className="stat-label">Footprint</span>
            <strong className="stat-figure green-stat">{trip.carbonEmissions}</strong>
          </div>
          <div className="stat-node wide">
            <span className="stat-label">Impact</span>
            <small className="stat-carbon-saved">✓ {trip.carbonSaved}</small>
          </div>
        </div>

        <div className="trip-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="trip-stay-hint">🏡 {trip.stays}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onDeleteTrip && (
              <button
                type="button"
                className="btn small light"
                style={{ padding: '4px 10px', color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => onDeleteTrip(trip.id)}
                title="Delete this saved journey"
                aria-label={`Delete trip from ${trip.origin} to ${trip.destination}`}
              >
                🗑
              </button>
            )}
            <button
              type="button"
              className="btn small view-trip-btn"
              onClick={() => onViewTrip && onViewTrip(trip)}
            >
              View Itinerary <b>→</b>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
