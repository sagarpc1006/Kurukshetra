import React from 'react';

export default function AccessibilityBadge({ status, confidence, verified, compact = false }) {
  const normStatus = (status || '').toLowerCase();

  let badgeClass = 'acc-badge-unknown';
  let icon = '⚠';
  let label = 'UNKNOWN';
  let tooltip = 'Accessibility information has not been verified';

  if (verified || normStatus === 'verified') {
    badgeClass = 'acc-badge-verified';
    icon = '✓';
    label = 'VERIFIED';
    tooltip = 'Independently verified with photo/audit evidence';
  } else if (normStatus === 'osm_supported' || normStatus === 'osm_data' || normStatus === 'osm') {
    badgeClass = 'acc-badge-osm';
    icon = '◉';
    label = 'OSM DATA';
    tooltip = 'Reported in OpenStreetMap community data';
  } else if (normStatus === 'business_declared' || normStatus === 'declared') {
    badgeClass = 'acc-badge-business';
    icon = '🏢';
    label = 'BUSINESS REPORTED';
    tooltip = 'Self-reported by operator or venue; unverified';
  } else if (normStatus === 'ai_supported') {
    badgeClass = 'acc-badge-ai';
    icon = '✦';
    label = 'AI SUPPORTED';
    tooltip = 'Visual features detected by AI vision model';
  } else if (normStatus === 'conflicting') {
    badgeClass = 'acc-badge-conflicting';
    icon = '✕';
    label = 'CONFLICTING';
    tooltip = 'Sources report conflicting accessibility information';
  }

  return (
    <div className={`acc-badge-wrapper ${compact ? 'compact' : ''}`} title={tooltip}>
      <span className={`acc-status-pill ${badgeClass}`}>
        <span className="badge-icon" aria-hidden="true">{icon}</span>
        <span className="badge-text">{label}</span>
      </span>
      {confidence > 0 && !compact && (
        <span className="acc-confidence-pill" title={`Evidence Confidence: ${confidence}%`}>
          {confidence}%
        </span>
      )}
    </div>
  );
}
