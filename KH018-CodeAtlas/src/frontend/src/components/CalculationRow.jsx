import React from 'react';

export default function CalculationRow({ label, score, weight, contribution, icon, metricDetail }) {
  const weightPct = Math.round((weight || 0) * 100);
  const formattedContrib = contribution != null ? Number(contribution).toFixed(1) : '--';

  return (
    <div className="calc-row-card">
      <div className="calc-row-left">
        <span className="calc-metric-icon" aria-hidden="true">{icon}</span>
        <div className="calc-metric-info">
          <strong className="calc-metric-title">{label}</strong>
          {metricDetail && <span className="calc-metric-detail">{metricDetail}</span>}
        </div>
      </div>

      <div className="calc-row-math">
        <div className="math-step">
          <span className="step-label">Score</span>
          <strong className="step-val">{score ?? '--'}/100</strong>
        </div>
        <span className="math-op" aria-hidden="true">×</span>
        <div className="math-step">
          <span className="step-label">Weight</span>
          <strong className="step-val">{weightPct}%</strong>
        </div>
        <span className="math-op" aria-hidden="true">=</span>
        <div className="math-step highlight">
          <span className="step-label">Points</span>
          <strong className="step-val contrib-val">+{formattedContrib}</strong>
        </div>
      </div>
    </div>
  );
}
