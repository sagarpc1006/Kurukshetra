import React, { useState } from 'react';
import AccessibilityBadge from './AccessibilityBadge';
import AccessibilityDetailsModal from './AccessibilityDetailsModal';

export default function EcoTwinCard({ ecoTwin }) {
  const [showMath, setShowMath] = useState(false);
  const [accModalData, setAccModalData] = useState(null);

  if (!ecoTwin || !ecoTwin.available) {
    return null;
  }

  const {
    baseline = {},
    eco_twin = {},
    comparison = {},
    summary = [],
    headline = '',
    why_eco_twin = [],
    weights = {}
  } = ecoTwin;

  const formatDuration = (mins) => {
    if (mins == null) return '--';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatPrice = (priceObj) => {
    if (!priceObj || priceObj.amount == null) return '--';
    const curr = priceObj.currency === 'INR' ? '₹' : `${priceObj.currency} `;
    return `${curr}${Number(priceObj.amount).toLocaleString('en-IN')}`;
  };

  const getModeIcon = (modeStr, transportStr) => {
    const text = `${modeStr || ''} ${transportStr || ''}`.toLowerCase();
    if (text.includes('train') || text.includes('rail')) return '🚆';
    if (text.includes('ev') || text.includes('electric')) return '⚡';
    if (text.includes('bus') || text.includes('coach')) return '🚌';
    if (text.includes('flight') || text.includes('plane') || text.includes('air')) return '✈️';
    return '🚗';
  };

  const carbonReduction = comparison.carbon_reduction_percent != null
    ? Math.round(comparison.carbon_reduction_percent)
    : null;

  const costDiff = comparison.cost_difference != null
    ? Math.round(comparison.cost_difference)
    : 0;

  const timeDiff = comparison.time_difference_minutes != null
    ? comparison.time_difference_minutes
    : 0;

  const accDiff = comparison.accessibility_difference != null
    ? comparison.accessibility_difference
    : 0;

  return (
    <div className="eco-twin-container" id="eco-twin-feature" aria-label="Eco-Twin Travel Comparison">
      {/* Top Banner Header */}
      <div className="eco-twin-banner">
        <div className="eco-twin-title-group">
          <span className="eco-twin-badge">🌱 ECO-TWIN ⭐</span>
          <div>
            <h3 className="eco-twin-headline-title">Greener &amp; More Accessible Alternative</h3>
            <p className="eco-twin-subtitle">
              Smarter routing calculated by deterministic carbon &amp; accessibility engine
            </p>
          </div>
        </div>
        <div className="eco-twin-score-tag">
          <span className="score-tag-label">Eco-Twin Score</span>
          <span className="score-tag-value">{eco_twin.green_accessible_score}/100</span>
        </div>
      </div>

      {/* Main Side-by-Side Comparison Grid */}
      <div className="eco-twin-vs-grid">
        {/* Baseline / Standard Option Card */}
        <div className="eco-twin-col baseline-col">
          <div className="col-header">
            <span className="col-pill baseline-pill">STANDARD OPTION</span>
            <span className="col-score">Score: {baseline.green_accessible_score}/100</span>
          </div>

          <div className="col-transport-row">
            <span className="transport-icon" aria-hidden="true">
              {getModeIcon(baseline.mode, baseline.transport)}
            </span>
            <div>
              <h4 className="transport-name">{baseline.title || 'Conventional Flight / Taxi'}</h4>
              <span className="transport-detail">{baseline.transport}</span>
            </div>
          </div>

          <div className="col-metrics-list">
            <div className="metric-row">
              <span className="metric-label">Estimated Fare</span>
              <strong className="metric-num">{formatPrice(baseline.price)}</strong>
            </div>
            <div className="metric-row">
              <span className="metric-label">Travel Time</span>
              <strong className="metric-num">{formatDuration(baseline.duration_minutes)}</strong>
            </div>
            <div className="metric-row">
              <span className="metric-label">Carbon Footprint</span>
              <strong className="metric-num carbon-high">
                {baseline.carbon_kg_co2e != null ? `${baseline.carbon_kg_co2e} kg CO₂e` : 'Unknown'}
              </strong>
            </div>
            <div className="metric-row">
              <span className="metric-label">Accessibility</span>
              <div className="metric-acc-cell">
                <strong className="metric-num">
                  {baseline.accessibility_rating != null ? `${baseline.accessibility_rating}/5` : 'Unknown'}
                </strong>
                <AccessibilityBadge
                  status={baseline.accessibility_status}
                  confidence={baseline.confidence}
                  verified={baseline.accessibility_verified}
                  compact={true}
                />
                <button
                  type="button"
                  className="acc-details-link-btn"
                  onClick={() => setAccModalData({ title: baseline.title || 'Standard Option', accessibility: baseline })}
                >
                  Details ℹ️
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* VS Divider Badge */}
        <div className="eco-twin-vs-divider">
          <div className="vs-circle">VS</div>
        </div>

        {/* Eco-Twin Recommended Card */}
        <div className="eco-twin-col ecotwin-col">
          <div className="col-header">
            <span className="col-pill ecotwin-pill">ECO-TWIN ⭐</span>
            <span className="col-score highlight">Score: {eco_twin.green_accessible_score}/100</span>
          </div>

          <div className="col-transport-row">
            <span className="transport-icon highlight-icon" aria-hidden="true">
              {getModeIcon(eco_twin.mode, eco_twin.transport)}
            </span>
            <div>
              <h4 className="transport-name highlight-name">{eco_twin.title || 'Sustainable Alternative'}</h4>
              <span className="transport-detail">{eco_twin.transport}</span>
            </div>
          </div>

          <div className="col-metrics-list">
            <div className="metric-row">
              <span className="metric-label">Estimated Fare</span>
              <strong className="metric-num green-text">
                {formatPrice(eco_twin.price)}
                {costDiff < 0 && <span className="diff-badge green"> (₹{Math.abs(costDiff).toLocaleString()} less)</span>}
              </strong>
            </div>
            <div className="metric-row">
              <span className="metric-label">Travel Time</span>
              <strong className="metric-num">
                {formatDuration(eco_twin.duration_minutes)}
                {timeDiff > 0 && <span className="diff-badge amber"> (+{timeDiff}m)</span>}
              </strong>
            </div>
            <div className="metric-row">
              <span className="metric-label">Carbon Footprint</span>
              <strong className="metric-num carbon-low">
                {eco_twin.carbon_kg_co2e != null ? `${eco_twin.carbon_kg_co2e} kg CO₂e` : 'Unknown'}
                {carbonReduction > 0 && <span className="diff-badge green"> (↓ {carbonReduction}%)</span>}
              </strong>
            </div>
            <div className="metric-row">
              <span className="metric-label">Accessibility</span>
              <div className="metric-acc-cell">
                <strong className="metric-num">
                  {eco_twin.accessibility_rating != null ? `${eco_twin.accessibility_rating}/5` : 'Unknown'}
                </strong>
                <AccessibilityBadge
                  status={eco_twin.accessibility_status}
                  confidence={eco_twin.confidence}
                  verified={eco_twin.accessibility_verified}
                  compact={true}
                />
                <button
                  type="button"
                  className="acc-details-link-btn"
                  onClick={() => setAccModalData({ title: eco_twin.title || 'Eco-Twin Alternative', accessibility: eco_twin })}
                >
                  Details ℹ️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Metrics Bar */}
      <div className="eco-twin-impact-bar">
        <span className="impact-bar-title">ECO-TWIN IMPACT</span>
        <div className="impact-pills-row">
          {carbonReduction != null && (
            <div className="impact-pill green-pill">
              <span className="pill-arrow">↓</span>
              <strong>{carbonReduction}% less carbon</strong>
              <small>({comparison.carbon_reduction_kg} kg saved)</small>
            </div>
          )}

          {costDiff !== 0 && (
            <div className={`impact-pill ${costDiff < 0 ? 'green-pill' : 'amber-pill'}`}>
              <span className="pill-arrow">{costDiff < 0 ? '↓' : '↑'}</span>
              <strong>₹{Math.abs(costDiff).toLocaleString()} {costDiff < 0 ? 'cost savings' : 'fare delta'}</strong>
            </div>
          )}

          {timeDiff !== 0 && (
            <div className="impact-pill neutral-pill">
              <span className="pill-arrow">{timeDiff > 0 ? '+' : '-'}</span>
              <strong>{Math.abs(timeDiff)} min travel time</strong>
            </div>
          )}

          {accDiff !== 0 && (
            <div className={`impact-pill ${accDiff > 0 ? 'purple-pill' : 'neutral-pill'}`}>
              <span className="pill-arrow">{accDiff > 0 ? '↑' : '↓'}</span>
              <strong>Accessibility {baseline.accessibility_rating}/5 → {eco_twin.accessibility_rating}/5</strong>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Headline Callout */}
      {headline && (
        <div className="eco-twin-callout">
          <span className="callout-bulb" aria-hidden="true">💡</span>
          <p className="callout-text">{headline}</p>
        </div>
      )}

      {/* WHY THIS ECO-TWIN? Section */}
      {why_eco_twin && why_eco_twin.length > 0 && (
        <div className="eco-twin-why-box">
          <h5 className="why-box-title">WHY THIS ECO-TWIN?</h5>
          <ul className="why-checklist">
            {why_eco_twin.map((point, idx) => (
              <li key={idx} className="why-check-item">
                <span className="check-icon" aria-hidden="true">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Show Your Math / Weighting Transparency */}
      <div className="eco-twin-footer">
        <button
          type="button"
          className="math-toggle-btn"
          onClick={() => setShowMath(!showMath)}
          aria-expanded={showMath}
        >
          <span>{showMath ? '▲ Hide Eco-Twin Math' : '▼ Show Your Math & Formulas'}</span>
        </button>

        {showMath && (
          <div className="math-details-drawer">
            <div className="eco-math-grid">
              {/* Carbon Comparison */}
              <div className="eco-math-col">
                <span className="col-tag green">🌱 CARBON REDUCTION</span>
                <div className="math-metric-compare">
                  <span>Standard: <strong>{baseline.carbon_kg_co2e != null ? `${baseline.carbon_kg_co2e} kg` : '--'}</strong></span>
                  <span>Eco-Twin: <strong className="green-text">{eco_twin.carbon_kg_co2e != null ? `${eco_twin.carbon_kg_co2e} kg` : '--'}</strong></span>
                  <div className="math-delta-box">
                    <span>Saved: <strong>{comparison.carbon_reduction_kg} kg CO₂e</strong></span>
                    <span>Reduction: <strong className="green-text">{comparison.carbon_reduction_percent}%</strong></span>
                  </div>
                </div>
                <code className="math-formula-code">((base - twin) / base) × 100</code>
              </div>

              {/* Cost Comparison */}
              <div className="eco-math-col">
                <span className="col-tag blue">💰 FARE DELTA</span>
                <div className="math-metric-compare">
                  <span>Standard: <strong>{formatPrice(baseline.price)}</strong></span>
                  <span>Eco-Twin: <strong className="blue-text">{formatPrice(eco_twin.price)}</strong></span>
                  <div className="math-delta-box">
                    <span>Difference: <strong>{costDiff < 0 ? `₹${Math.abs(costDiff).toLocaleString()} cheaper` : `+₹${costDiff.toLocaleString()}`}</strong></span>
                  </div>
                </div>
                <code className="math-formula-code">twin_cost - baseline_cost</code>
              </div>

              {/* Time Comparison */}
              <div className="eco-math-col">
                <span className="col-tag amber">⏱️ DURATION</span>
                <div className="math-metric-compare">
                  <span>Standard: <strong>{formatDuration(baseline.duration_minutes)}</strong></span>
                  <span>Eco-Twin: <strong>{formatDuration(eco_twin.duration_minutes)}</strong></span>
                  <div className="math-delta-box">
                    <span>Difference: <strong>{timeDiff > 0 ? `+${timeDiff} mins` : `${timeDiff} mins`}</strong></span>
                  </div>
                </div>
                <code className="math-formula-code">twin_time - baseline_time</code>
              </div>

              {/* Accessibility Comparison */}
              <div className="eco-math-col">
                <span className="col-tag purple">♿ ACCESSIBILITY</span>
                <div className="math-metric-compare">
                  <span>Standard: <strong>{baseline.accessibility_rating != null ? `${baseline.accessibility_rating}/5` : '--'}</strong></span>
                  <span>Eco-Twin: <strong className="purple-text">{eco_twin.accessibility_rating != null ? `${eco_twin.accessibility_rating}/5` : '--'}</strong></span>
                  <div className="math-delta-box">
                    <span>Improvement: <strong>{accDiff > 0 ? `+${accDiff} points` : `${accDiff} points`}</strong></span>
                  </div>
                </div>
                <code className="math-formula-code">twin_acc - baseline_acc</code>
              </div>
            </div>

            <div className="math-row" style={{ marginTop: '12px' }}>
              <span>Composite Weights:</span>
              <code>
                Score = ({Math.round((weights.carbon || 0.40) * 100)}% × Carbon) + ({Math.round((weights.accessibility || 0.30) * 100)}% × Access) + ({Math.round((weights.cost || 0.15) * 100)}% × Cost) + ({Math.round((weights.time || 0.15) * 100)}% × Time)
              </code>
            </div>
            {comparison.score_difference != null && (
              <div className="math-row">
                <span>Score Advantage:</span>
                <strong className="green-text">+{comparison.score_difference} points advantage over standard option</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accessibility Details Modal */}
      <AccessibilityDetailsModal
        isOpen={!!accModalData}
        onClose={() => setAccModalData(null)}
        optionTitle={accModalData?.title}
        accessibility={accModalData?.accessibility}
      />
    </div>
  );
}
