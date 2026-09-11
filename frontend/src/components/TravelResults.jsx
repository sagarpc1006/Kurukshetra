import React from 'react';
import FlightResultCard from './FlightResultCard';
import RouteResultCard from './RouteResultCard';
import PlaceCard from './PlaceCard';
import WeatherCard from './WeatherCard';

export default function TravelResults({ travelData, origin, destination }) {
  if (!travelData) return null;

  const {
    transport_options = [],
    route = {},
    places = [],
    weather = {},
    api_statuses = {}
  } = travelData;

  const renderStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'live':
        return <span className="status-pill status-pill-live">LIVE</span>;
      case 'demo':
      case 'test':
        return <span className="status-pill status-pill-demo">TEST DATA</span>;
      case 'cached':
        return <span className="status-pill status-pill-cached">CACHED</span>;
      case 'estimated':
        return <span className="status-pill status-pill-estimated">ESTIMATED</span>;
      default:
        return <span className="status-pill status-pill-unavailable">UNAVAILABLE</span>;
    }
  };

  return (
    <div className="travel-results-container">
      {/* Real Travel Data Header */}
      <div className="travel-results-header">
        <div className="results-header-left">
          <span className="results-section-icon" aria-hidden="true">🌐</span>
          <div>
            <h3 className="results-main-title">Real Travel Options &amp; Destination Intelligence</h3>
            <p className="results-sub-title">Live and sandbox feeds aggregated by EcoTrail Travel Orchestrator</p>
          </div>
        </div>

        {/* API Services Status Strip */}
        <div className="api-status-strip" aria-label="External API Integration Status">
          <div className="api-chip" title="Duffel Sandbox Flights">
            <span className="chip-name">Duffel:</span>
            {renderStatusBadge(api_statuses.duffel)}
          </div>
          <div className="api-chip" title="OpenTripMap Attractions">
            <span className="chip-name">Places:</span>
            {renderStatusBadge(api_statuses.opentripmap)}
          </div>
          <div className="api-chip" title="OpenWeatherMap">
            <span className="chip-name">Weather:</span>
            {renderStatusBadge(api_statuses.weather)}
          </div>
          <div className="api-chip" title="OpenRouteService Ground Directions">
            <span className="chip-name">ORS Route:</span>
            {renderStatusBadge(api_statuses.ors)}
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      <div className="travel-sections-grid">
        {/* SECTION 1: Flights (Duffel) */}
        <div className="travel-section-block">
          <div className="section-title-bar">
            <h4>✈️ Flight Options</h4>
            <span className="section-caption">Duffel Test API</span>
          </div>

          {transport_options && transport_options.length > 0 ? (
            <div className="flights-cards-list">
              {transport_options.map((flight, idx) => (
                <FlightResultCard key={idx} flight={flight} />
              ))}
            </div>
          ) : (
            <div className="empty-section-notice">
              <p>No direct flight offers returned for this route in Duffel test mode.</p>
            </div>
          )}
        </div>

        {/* SECTION 2: Ground Route & Weather Row */}
        <div className="travel-two-col-grid">
          {/* Ground Route (ORS) */}
          <div className="travel-section-block">
            <div className="section-title-bar">
              <h4>🗺️ Ground Route</h4>
              <span className="section-caption">OpenRouteService</span>
            </div>
            <RouteResultCard route={route} origin={origin} destination={destination} />
          </div>

          {/* Destination Weather (OpenWeatherMap) */}
          <div className="travel-section-block">
            <div className="section-title-bar">
              <h4>🌦️ Destination Weather</h4>
              <span className="section-caption">OpenWeatherMap</span>
            </div>
            <WeatherCard weather={weather} destination={destination} />
          </div>
        </div>

        {/* SECTION 3: Attractions & Places (OpenTripMap) */}
        <div className="travel-section-block">
          <div className="section-title-bar">
            <h4>📍 Top Attractions &amp; Sights in {destination || 'Destination'}</h4>
            <span className="section-caption">OpenTripMap</span>
          </div>

          {places && places.length > 0 ? (
            <div className="places-cards-grid">
              {places.map((place, idx) => (
                <PlaceCard key={idx} place={place} />
              ))}
            </div>
          ) : (
            <div className="empty-section-notice">
              <p>No verified attractions discovered near {destination || 'the destination'}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
