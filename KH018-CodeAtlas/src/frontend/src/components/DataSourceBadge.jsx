import React from 'react';

export default function DataSourceBadge({ source, label, className = '' }) {
  const norm = (source || '').toLowerCase();

  let icon = '📊';
  let displayLabel = label || source || 'Normalized Data';
  let badgeStyle = 'source-badge-generic';

  if (norm.includes('duffel') || norm.includes('flight')) {
    icon = '✈️';
    displayLabel = label || 'Duffel Flights';
    badgeStyle = 'source-badge-duffel';
  } else if (norm.includes('rail') || norm.includes('train')) {
    icon = '🚆';
    displayLabel = label || 'Rail Network';
    badgeStyle = 'source-badge-rail';
  } else if (norm.includes('ev')) {
    icon = '⚡';
    displayLabel = label || 'Electric Fleet';
    badgeStyle = 'source-badge-ev';
  } else if (norm.includes('osm') || norm.includes('openstreetmap')) {
    icon = '◉';
    displayLabel = label || 'OpenStreetMap';
    badgeStyle = 'source-badge-osm';
  } else if (norm.includes('weather')) {
    icon = '🌦️';
    displayLabel = label || 'OpenWeatherMap';
    badgeStyle = 'source-badge-weather';
  } else if (norm.includes('photo') || norm.includes('verified')) {
    icon = '📷';
    displayLabel = label || 'Photo Verified';
    badgeStyle = 'source-badge-verified';
  } else if (norm.includes('factor') || norm.includes('emission')) {
    icon = '🌱';
    displayLabel = label || 'EcoTrail Factor';
    badgeStyle = 'source-badge-factor';
  }

  return (
    <span className={`data-source-badge ${badgeStyle} ${className}`} title={`Data Source: ${displayLabel}`}>
      <span className="source-icon" aria-hidden="true">{icon}</span>
      <span className="source-text">{displayLabel}</span>
    </span>
  );
}
