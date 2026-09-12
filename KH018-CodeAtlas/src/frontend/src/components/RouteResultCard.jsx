import React from 'react';

export default function RouteResultCard({ route, origin, destination }) {
  const isAvailable = route && route.status === 'live' && route.distance_km != null;
  const isUnavailable = !route || route.status === 'unavailable' || route.distance_km == null;

  const hours = route?.duration_minutes ? Math.floor(route.duration_minutes / 60) : 0;
  const mins = route?.duration_minutes ? route.duration_minutes % 60 : 0;
  const formattedDuration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="travel-route-card">
      <div className="route-card-header">
        <div className="route-title-area">
          <span className="route-icon" aria-hidden="true">🗺️</span>
          <div>
            <h4 className="route-header-title">Ground Route</h4>
            <span className="route-cities">
              {route?.origin || origin || 'Origin'} → {route?.destination || destination || 'Destination'}
            </span>
          </div>
        </div>

        {isAvailable && (
          <span className="badge badge-live" title="Live data from OpenRouteService">
            LIVE
          </span>
        )}
        {isUnavailable && (
          <span className="badge badge-unavailable" title="OpenRouteService access disallowed or limited">
            UNAVAILABLE
          </span>
        )}
      </div>

      <div className="route-card-body">
        {isAvailable ? (
          <div className="route-stats-grid">
            <div className="route-stat">
              <span className="stat-label">Driving Distance</span>
              <strong className="stat-value">{route.distance_km} km</strong>
              <small className="stat-sub">Road Network</small>
            </div>
            <div className="route-stat">
              <span className="stat-label">Estimated Drive Time</span>
              <strong className="stat-value">{formattedDuration}</strong>
              <small className="stat-sub">Standard Traffic</small>
            </div>
          </div>
        ) : (
          <div className="route-unavailable-box">
            <span className="unavailable-icon" aria-hidden="true">ℹ️</span>
            <div className="unavailable-text">
              <p>Road route calculation currently unavailable via OpenRouteService.</p>
              <small>Flight and place data remain active and verified below.</small>
            </div>
          </div>
        )}
      </div>

      <div className="route-card-footer">
        <span className="route-provider-note">
          Provider: <strong>OpenRouteService / HeiGIT</strong>
        </span>
      </div>
    </div>
  );
}
