import React from 'react';

export default function FlightResultCard({ flight }) {
  if (!flight) return null;

  const {
    airline = 'Airline',
    origin = '',
    destination = '',
    origin_iata = '',
    destination_iata = '',
    price = 0,
    currency = 'INR',
    duration_minutes = 0,
    status = 'demo'
  } = flight;

  const hours = Math.floor(duration_minutes / 60);
  const mins = duration_minutes % 60;
  const formattedDuration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const formattedPrice = currency === 'INR'
    ? `₹${Number(price).toLocaleString('en-IN')}`
    : `${currency} ${Number(price).toLocaleString()}`;

  return (
    <div className="travel-flight-card">
      <div className="flight-card-header">
        <div className="flight-airline-info">
          <span className="flight-plane-icon" aria-hidden="true">✈️</span>
          <div>
            <h4 className="flight-airline-name">{airline}</h4>
            <span className="flight-route-iata">
              {origin_iata || origin} → {destination_iata || destination}
            </span>
          </div>
        </div>
        <span className="badge badge-test" title="Duffel Sandbox Test Flight Data">
          TEST DATA
        </span>
      </div>

      <div className="flight-card-body">
        <div className="flight-stat">
          <span className="stat-label">Duration</span>
          <span className="stat-value">{formattedDuration}</span>
          <small className="stat-sub">Non-stop / Direct</small>
        </div>

        <div className="flight-stat">
          <span className="stat-label">Estimated Fare</span>
          <span className="stat-value price-tag">{formattedPrice}</span>
          <small className="stat-sub">Economy · 1 Passenger</small>
        </div>
      </div>

      <div className="flight-card-footer">
        <span className="flight-provider-note">
          Provider: <strong>Duffel Flights API</strong> (Sandbox)
        </span>
      </div>
    </div>
  );
}
