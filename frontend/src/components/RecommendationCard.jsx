import React, { useState } from 'react';
import AccessibilityBadge from './AccessibilityBadge';
import AccessibilityDetailsModal from './AccessibilityDetailsModal';
import ShowYourMath from './ShowYourMath';

export default function RecommendationCard({ option, isTopPick = false }) {
  const [showAccModal, setShowAccModal] = useState(false);
  const [showMath, setShowMath] = useState(false);

  if (!option) return null;

  const {
    rank = 1,
    title = 'Travel Option',
    transport = {},
    green_accessible_score = 0,
    scores = {},
    price = {},
    duration_minutes = 0,
    carbon = {},
    accessibility = {},
    within_budget = true,
    over_budget = false,
    explanation = {}
  } = option;

  const mode = (transport?.mode || '').toLowerCase();
  const getModeIcon = () => {
    if (mode.includes('train') || mode.includes('rail')) return '🚆';
    if (mode.includes('ev')) return '⚡';
    if (mode.includes('bus') || mode.includes('coach')) return '🚌';
    if (mode.includes('flight')) return '✈️';
    return '🚗';
  };

  const hours = Math.floor(duration_minutes / 60);
  const mins = duration_minutes % 60;
  const formattedDuration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const formattedPrice = price?.currency === 'INR'
    ? `₹${Number(price.amount || 0).toLocaleString('en-IN')}`
    : `${price?.currency || 'INR'} ${Number(price?.amount || 0).toLocaleString()}`;

  const whyList = explanation?.why_recommended || [];

  const getScoreColorClass = (score) => {
    if (score >= 85) return 'score-green';
    if (score >= 70) return 'score-teal';
    if (score >= 50) return 'score-amber';
    return 'score-slate';
  };

  return (
    <div className={`recommendation-card ${isTopPick ? 'top-pick-card' : ''}`}>
      {/* Top Ribbon / Rank Header */}
      <div className="rec-card-header">
        <div className="rec-rank-area">
          <span className={`rank-badge ${isTopPick ? 'rank-badge-top' : ''}`}>
            {isTopPick ? '🌱 #1 BEST GREEN & ACCESSIBLE PICK' : `#${rank} Recommended Option`}
          </span>
          <div className="rec-mode-title-row">
            <span className="rec-mode-icon" aria-hidden="true">{getModeIcon()}</span>
            <div>
              <h4 className="rec-title">{title}</h4>
              <span className="rec-provider-sub">{transport?.label || transport?.provider || 'Eco Option'}</span>
            </div>
          </div>
        </div>

        {/* Green & Accessible Score Ring */}
        <div className="composite-score-badge">
          <span className="composite-score-label">Green &amp; Accessible</span>
          <div className={`composite-score-circle ${getScoreColorClass(green_accessible_score)}`}>
            <span className="score-num">{green_accessible_score}</span>
            <span className="score-denom">/100</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Strip (Price, Time, Carbon, Accessibility) */}
      <div className="rec-metrics-strip">
        <div className="rec-stat-col">
          <span className="stat-label">Estimated Fare</span>
          <span className="stat-val price-val">{formattedPrice}</span>
          {over_budget ? (
            <span className="budget-tag over-budget">⚠️ Over Target</span>
          ) : (
            <span className="budget-tag within-budget">✓ Within Budget</span>
          )}
        </div>

        <div className="rec-stat-col">
          <span className="stat-label">Duration</span>
          <span className="stat-val">{formattedDuration}</span>
          <small className="stat-sub">Travel Time</small>
        </div>

        <div className="rec-stat-col">
          <span className="stat-label">Carbon Footprint</span>
          <span className="stat-val carbon-val">
            {carbon?.kg_co2e != null ? `${carbon.kg_co2e} kg` : '--'}
          </span>
          <small className="stat-sub">CO₂e per passenger</small>
        </div>

        <div className="rec-stat-col">
          <span className="stat-label">Accessibility</span>
          <span className="stat-val access-val">
            {accessibility?.accessibility_rating != null ? `${accessibility.accessibility_rating}/5` : '--'}
          </span>
          <AccessibilityBadge
            status={accessibility?.accessibility_status}
            confidence={accessibility?.confidence}
            verified={accessibility?.accessibility_verified}
            compact={true}
          />
          <button
            type="button"
            className="acc-details-link-btn"
            onClick={() => setShowAccModal(true)}
          >
            Accessibility details ℹ️
          </button>
        </div>
      </div>

      {/* Component Scores Breakdown */}
      <div className="rec-scores-breakdown">
        <span className="breakdown-title">Score Breakdown:</span>
        <div className="scores-grid">
          <div className="score-bar-item">
            <div className="bar-label-row">
              <span>🌱 Carbon</span>
              <b>{scores?.carbon ?? '--'}</b>
            </div>
            <div className="progress-track">
              <div className="progress-fill fill-carbon" style={{ width: `${scores?.carbon || 0}%` }}></div>
            </div>
          </div>

          <div className="score-bar-item">
            <div className="bar-label-row">
              <span>♿ Accessibility</span>
              <b>{scores?.accessibility ?? '--'}</b>
            </div>
            <div className="progress-track">
              <div className="progress-fill fill-access" style={{ width: `${scores?.accessibility || 0}%` }}></div>
            </div>
          </div>

          <div className="score-bar-item">
            <div className="bar-label-row">
              <span>💰 Cost</span>
              <b>{scores?.cost ?? '--'}</b>
            </div>
            <div className="progress-track">
              <div className="progress-fill fill-cost" style={{ width: `${scores?.cost || 0}%` }}></div>
            </div>
          </div>

          <div className="score-bar-item">
            <div className="bar-label-row">
              <span>⏱️ Time</span>
              <b>{scores?.time ?? '--'}</b>
            </div>
            <div className="progress-track">
              <div className="progress-fill fill-time" style={{ width: `${scores?.time || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar: Why This Option & Show Your Math Toggle */}
      <div className="rec-action-row">
        <button
          type="button"
          className="rec-why-btn"
          onClick={() => setShowMath(!showMath)}
        >
          💡 Why this option?
        </button>
        <button
          type="button"
          className="rec-math-toggle-btn"
          onClick={() => setShowMath(!showMath)}
          aria-expanded={showMath}
        >
          {showMath ? '▲ Hide Math' : '▼ Show Your Math'}
        </button>

        {(mode.includes('train') || mode.includes('rail')) && (
          <a
            href="https://www.irctc.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="rec-official-book-link"
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#0b6c57',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#eef7f1',
              border: '1px solid #c4decb',
              transition: 'all 0.18s ease'
            }}
          >
            <span>Book on IRCTC ↗</span>
          </a>
        )}
      </div>

      {/* Why Recommended / Key Deterministic Facts */}
      {whyList && whyList.length > 0 && (
        <div className="rec-why-box">
          <span className="why-label">Why Recommended:</span>
          <ul className="why-list">
            {whyList.map((fact, idx) => (
              <li key={idx} className="why-item">
                <span className="why-bullet" aria-hidden="true">✓</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expandable Show Your Math Panel */}
      {showMath && <ShowYourMath option={option} />}

      {/* Accessibility Details & Photo Verification Modal */}
      <AccessibilityDetailsModal
        isOpen={showAccModal}
        onClose={() => setShowAccModal(false)}
        optionTitle={title}
        accessibility={accessibility}
      />
    </div>
  );
}
