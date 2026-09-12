import React, { useState } from 'react';
import RecommendationCard from './RecommendationCard';

export default function RecommendationList({ recommendations }) {
  const [showAll, setShowAll] = useState(false);

  if (!recommendations || !recommendations.results || recommendations.results.length === 0) {
    return null;
  }

  const { weights = {}, results = [] } = recommendations;
  const topPick = results[0];
  const otherOptions = results.slice(1);

  return (
    <div className="recommendations-container" role="region" aria-label="EcoTrail Ranked Recommendations">
      {/* Header with Weights & Formula Info */}
      <div className="recs-header">
        <div className="recs-header-left">
          <span className="recs-header-icon" aria-hidden="true">🌱</span>
          <div>
            <h3 className="recs-main-heading">Recommended Sustainable Itineraries</h3>
            <p className="recs-sub-heading">Ranked by EcoTrail 2.0 Deterministic Green &amp; Accessible Score</p>
          </div>
        </div>

        <div className="weights-pill-badge" title="Project Scoring Weight Allocation">
          <span className="weights-title">Weights:</span>
          <span className="weight-item">Carbon <strong>40%</strong></span>
          <span className="weight-sep">·</span>
          <span className="weight-item">Access <strong>30%</strong></span>
          <span className="weight-sep">·</span>
          <span className="weight-item">Cost <strong>15%</strong></span>
          <span className="weight-sep">·</span>
          <span className="weight-item">Time <strong>15%</strong></span>
        </div>
      </div>

      {/* Top Pick (#1 Best Sustainable & Accessible Option) */}
      <div className="top-pick-wrapper">
        <RecommendationCard option={topPick} isTopPick={true} />
      </div>

      {/* Other Ranked Options */}
      {otherOptions.length > 0 && (
        <div className="other-options-section">
          <div className="other-options-toggle-bar">
            <span className="other-count-label">
              {otherOptions.length} other options evaluated &amp; ranked
            </span>
            <button
              type="button"
              className="btn small light toggle-other-btn"
              onClick={() => setShowAll(!showAll)}
              aria-expanded={showAll}
            >
              {showAll ? 'Show Top Pick Only ▲' : `Compare All ${results.length} Options ▼`}
            </button>
          </div>

          {showAll && (
            <div className="other-options-list">
              {otherOptions.map((opt) => (
                <RecommendationCard key={opt.id} option={opt} isTopPick={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
