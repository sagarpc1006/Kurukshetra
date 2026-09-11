import React from 'react';
import { mockEcoScore } from '../data/mockData';

export default function EcoScore({ scoreData = mockEcoScore }) {
  const score = scoreData?.overallScore || 91;
  const maxScore = scoreData?.maxScore || 100;
  const percentage = Math.round((score / maxScore) * 100);

  // SVG circular ring geometry
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="eco-score-card">
      <div className="score-card-header">
        <span className="score-badge-icon">🌿</span>
        <div>
          <h3 className="score-title">EcoTrail Score</h3>
          <p className="score-subtitle">Based on your greener travel choices</p>
        </div>
      </div>

      <div className="score-visual-row">
        <div className="score-ring-wrapper">
          <svg className="score-ring-svg" width="108" height="108" viewBox="0 0 108 108" aria-hidden="true">
            <circle
              className="score-ring-bg"
              cx="54"
              cy="54"
              r={radius}
              strokeWidth="9"
            />
            <circle
              className="score-ring-fg"
              cx="54"
              cy="54"
              r={radius}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 54 54)"
            />
          </svg>
          <div className="score-ring-text">
            <span className="score-number">{score}</span>
            <span className="score-divider">/ 100</span>
          </div>
        </div>

        <div className="score-summary-col">
          <span className="score-tier-pill">✦ {scoreData.level || 'Eco Pioneer'}</span>
          <p className="score-formula-hint">
            Weights: <strong>40%</strong> Carbon · <strong>30%</strong> Access · <strong>15%</strong> Cost · <strong>15%</strong> Time
          </p>
        </div>
      </div>

      <div className="score-breakdown-pills">
        {scoreData.breakdown?.map((item) => (
          <div key={item.label} className="breakdown-chip" title={`${item.label} (${item.weight})`}>
            <span className="chip-icon">{item.icon}</span>
            <span className="chip-name">{item.label}</span>
            <b className="chip-score">{item.score}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
