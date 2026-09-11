import React, { useState, useEffect } from 'react';
import { getEcoImpact } from '../services/tripAPI';

export default function EcoImpactCard() {
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getEcoImpact().then((data) => {
      if (isMounted) setImpact(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!impact) {
    return (
      <div className="eco-impact-card loading-card">
        <p>Loading eco metrics...</p>
      </div>
    );
  }

  return (
    <div className="eco-impact-card">
      <div className="impact-card-top">
        <div className="impact-heading-group">
          <span className="impact-icon" aria-hidden="true">🌱</span>
          <div>
            <h3 className="impact-title">Your Eco Impact</h3>
            <span className="impact-sub">Cumulative savings through greener choices</span>
          </div>
        </div>
        {impact.isExample && (
          <span className="example-badge" title="Will update with your actual booked trips">
            Example Preview
          </span>
        )}
      </div>

      <div className="impact-metrics-row">
        <div className="impact-hero-stat">
          <strong className="impact-big-val">{impact.co2SavedKg} kg</strong>
          <span className="impact-big-label">CO₂ emissions avoided</span>
          <small className="impact-sub-desc">
            Equivalent to growing <b>{impact.treesEquivalent} trees</b> for a year
          </small>
        </div>

        <div className="impact-mini-stats">
          <div className="mini-stat-box">
            <strong className="mini-val">{impact.greenTripsCount}</strong>
            <span className="mini-label">Green journeys</span>
          </div>
          <div className="mini-stat-box">
            <strong className="mini-val">{impact.coalAvoidedKg} kg</strong>
            <span className="mini-label">Coal burning avoided</span>
          </div>
        </div>
      </div>
    </div>
  );
}
