import React, { useState } from 'react';

export default function ItineraryView({ itinerary }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return null;
  }

  const {
    title,
    summary,
    duration_days,
    transport_recommended,
    estimated_budget,
    carbon_footprint,
    accessibility_standard,
    days = []
  } = itinerary;

  return (
    <div className="itinerary-card-container">
      {/* Header */}
      <div className="itinerary-header">
        <div>
          <div className="welcome-badge" style={{ marginBottom: '6px' }}>
            <span>DETAILED ECO-ITINERARY</span>
          </div>
          <h3 className="itinerary-main-title">{title}</h3>
          <p className="itinerary-summary-text">{summary}</p>
        </div>
        <button
          type="button"
          className="btn small light"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Collapse Itinerary ▲' : 'Expand Itinerary ▼'}
        </button>
      </div>

      {/* Highlights Strip */}
      <div className="itinerary-metrics-strip">
        <div className="itinerary-metric">
          <span className="itinerary-metric-label">🚆 Transport</span>
          <strong className="itinerary-metric-val">{transport_recommended}</strong>
        </div>
        <div className="itinerary-metric">
          <span className="itinerary-metric-label">💰 Est. Budget</span>
          <strong className="itinerary-metric-val">{estimated_budget}</strong>
        </div>
        <div className="itinerary-metric">
          <span className="itinerary-metric-label">🌱 Carbon Footprint</span>
          <strong className="itinerary-metric-val green-text">{carbon_footprint}</strong>
        </div>
        <div className="itinerary-metric">
          <span className="itinerary-metric-label">♿ Accessibility</span>
          <strong className="itinerary-metric-val purple-text">{accessibility_standard}</strong>
        </div>
      </div>

      {/* Day by Day Schedule */}
      {isExpanded && (
        <div className="itinerary-days-list">
          {days.map((d) => (
            <div key={d.day} className="itinerary-day-card">
              <div className="day-card-header">
                <div className="day-badge">Day {d.day}</div>
                <h4 className="day-title">{d.title}</h4>
                {d.weather && (
                  <div className="day-weather-chip" title="Forecasted weather">
                    <span>🌦 {d.weather.temp}</span>
                    <small>{d.weather.condition} ({d.weather.rain_chance} rain)</small>
                  </div>
                )}
              </div>

              <div className="day-segments-grid">
                <div className="day-segment">
                  <span className="segment-label">🌅 Morning</span>
                  <p>{d.morning}</p>
                </div>
                <div className="day-segment">
                  <span className="segment-label">☀️ Afternoon</span>
                  <p>{d.afternoon}</p>
                </div>
                <div className="day-segment">
                  <span className="segment-label">🌙 Evening</span>
                  <p>{d.evening}</p>
                </div>
              </div>

              {/* Verified Places Tags */}
              {d.places && d.places.length > 0 && (
                <div className="day-places-strip">
                  <span className="places-label">📍 Highlights:</span>
                  {d.places.map((pl, idx) => (
                    <span key={idx} className="place-tag">
                      {pl.name} {pl.accessible ? '✓♿' : ''}
                    </span>
                  ))}
                </div>
              )}

              {/* Green Tip & Accessibility Note */}
              <div className="day-footer-strip">
                <div className="tip-box green-tip">
                  <span className="tip-icon">🌱</span>
                  <span><strong>Eco Tip:</strong> {d.green_tip}</span>
                </div>
                <div className="tip-box purple-tip">
                  <span className="tip-icon">♿</span>
                  <span><strong>Access Note:</strong> {d.accessibility_note}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
