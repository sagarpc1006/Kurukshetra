import React, { useState } from 'react';
import CalculationRow from './CalculationRow';
import DataSourceBadge from './DataSourceBadge';
import AccessibilityBadge from './AccessibilityBadge';

export default function ShowYourMath({ option }) {
  const [showCarbonHelp, setShowCarbonHelp] = useState(false);

  if (!option) return null;

  const sym = option.show_your_math || {};
  const weights = sym.weights || option.weights || { carbon: 0.40, accessibility: 0.30, cost: 0.15, time: 0.15 };
  const scores = sym.scores || option.scores || {};
  const inputs = sym.inputs || {};
  const contributions = sym.contributions || option.contributions || {};
  const calculation = sym.calculation || option.calculation || {};
  const sources = sym.sources || {};

  const carbonScore = scores.carbon ?? 0;
  const accessScore = scores.accessibility ?? 0;
  const costScore = scores.cost ?? 0;
  const timeScore = scores.time ?? 0;

  const carbonContrib = contributions.carbon ?? (carbonScore * (weights.carbon || 0.40));
  const accessContrib = contributions.accessibility ?? (accessScore * (weights.accessibility || 0.30));
  const costContrib = contributions.cost ?? (costScore * (weights.cost || 0.15));
  const timeContrib = contributions.time ?? (timeScore * (weights.time || 0.15));

  const finalScore = sym.final_score ?? calculation.final_score ?? (carbonContrib + accessContrib + costContrib + timeContrib).toFixed(1);
  const roundedScore = sym.rounded_score ?? Math.round(Number(finalScore));

  const carbonSource = sources.carbon || {};
  const accessSource = sources.accessibility || {};
  const costSource = sources.cost || {};
  const timeSource = sources.time || {};

  const carbonKg = inputs.carbon_kg_co2e ?? option.carbon?.kg_co2e;
  const accessRating = inputs.accessibility_rating ?? accessSource.rating ?? option.accessibility?.accessibility_rating;
  const priceAmount = inputs.price ?? option.price?.amount;
  const currency = inputs.currency || option.price?.currency || 'INR';
  const durationMins = inputs.duration_minutes ?? option.duration_minutes;

  const formatMins = (mins) => {
    if (mins == null) return '--';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatCurrency = (amt) => {
    if (amt == null) return '--';
    const symbol = currency === 'INR' ? '₹' : `${currency} `;
    return `${symbol}${Number(amt).toLocaleString('en-IN')}`;
  };

  return (
    <div className="show-your-math-panel">
      {/* 1. Header & Weight Transparency */}
      <div className="sym-header">
        <div className="sym-title-block">
          <span className="sym-eyebrow">DETERMINISTIC TRANSPARENCY</span>
          <h4 className="sym-heading">SHOW YOUR MATH — SCORING BREAKDOWN</h4>
        </div>
        <div className="sym-priorities-box">
          <span className="priorities-lbl">YOUR CURRENT PRIORITIES</span>
          <div className="priorities-pills">
            <span className="p-pill green">🌱 Carbon: {Math.round((weights.carbon || 0.40) * 100)}%</span>
            <span className="p-pill purple">♿ Access: {Math.round((weights.accessibility || 0.30) * 100)}%</span>
            <span className="p-pill blue">💰 Cost: {Math.round((weights.cost || 0.15) * 100)}%</span>
            <span className="p-pill amber">⏱ Time: {Math.round((weights.time || 0.15) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* 2. Four Score Component Cards */}
      <div className="sym-components-grid">
        {/* CARBON CARD */}
        <div className="sym-card card-carbon">
          <div className="sym-card-header">
            <span className="card-badge green">CARBON EMISSIONS</span>
            <DataSourceBadge source={carbonSource.method || option.source} label={carbonSource.label} />
          </div>
          <div className="sym-card-metric">
            <strong className="metric-val">{carbonKg != null ? `${carbonKg} kg CO₂e` : 'Calculated'}</strong>
            <span className="metric-sub">Lower carbon → Higher score</span>
          </div>
          <CalculationRow
            icon="🌱"
            label="Carbon Score"
            score={carbonScore}
            weight={weights.carbon || 0.40}
            contribution={carbonContrib}
            metricDetail={`${carbonKg != null ? `${carbonKg} kg` : ''}`}
          />
          <p className="sym-method-note">
            {carbonSource.description || "Calculated using EcoTrail's configured transport emission factors."}
          </p>
          <button
            type="button"
            className="sym-help-toggle"
            onClick={() => setShowCarbonHelp(!showCarbonHelp)}
          >
            <span>{showCarbonHelp ? '▲ Hide Carbon Formula' : 'ℹ How is carbon calculated?'}</span>
          </button>
          {showCarbonHelp && (
            <div className="sym-help-drawer">
              <p>Carbon emissions are calculated from:</p>
              <code>Emissions = Transport Mode Factor × Distance ({carbonSource.distance_km || option.distance_km || 0} km) ÷ Passengers</code>
              <small>Calculated using verified carrier reporting (Duffel) or EcoTrail's configured transport emission factors.</small>
            </div>
          )}
        </div>

        {/* ACCESSIBILITY CARD */}
        <div className="sym-card card-access">
          <div className="sym-card-header">
            <span className="card-badge purple">ACCESSIBILITY</span>
            <AccessibilityBadge
              status={accessSource.status || option.accessibility?.accessibility_status}
              confidence={accessSource.confidence || option.accessibility?.confidence}
              verified={accessSource.verified ?? option.accessibility?.accessibility_verified}
              compact={true}
            />
          </div>
          <div className="sym-card-metric">
            <strong className="metric-val">{accessRating != null ? `${accessRating}/5` : 'Standard'}</strong>
            <span className="metric-sub">Verified step-free &amp; inclusive access</span>
          </div>
          <CalculationRow
            icon="♿"
            label="Accessibility Score"
            score={accessScore}
            weight={weights.accessibility || 0.30}
            contribution={accessContrib}
            metricDetail={`Rating ${accessRating}/5`}
          />
          <div className="sym-evidence-summary">
            <span className="ev-label">Evidence Verification:</span>
            <span className="ev-sources">
              {accessSource.sources && accessSource.sources.length > 0
                ? accessSource.sources.join(', ')
                : (accessSource.status_label || 'Standard audit')}
            </span>
            <span className="ev-conf"> · Confidence: {accessSource.confidence ?? 85}%</span>
          </div>
        </div>

        {/* COST CARD */}
        <div className="sym-card card-cost">
          <div className="sym-card-header">
            <span className="card-badge blue">COST &amp; FARE</span>
            <DataSourceBadge source={costSource.source || option.source} />
          </div>
          <div className="sym-card-metric">
            <strong className="metric-val">{formatCurrency(priceAmount)}</strong>
            <span className="metric-sub">
              {costSource.budget != null
                ? (costSource.within_budget ? `✓ Within target budget (${formatCurrency(costSource.budget)})` : `⚠️ Over budget by ${formatCurrency(Math.abs(costSource.budget_difference || 0))}`)
                : 'Normalized ticket price'}
            </span>
          </div>
          <CalculationRow
            icon="💰"
            label="Cost Score"
            score={costScore}
            weight={weights.cost || 0.15}
            contribution={costContrib}
            metricDetail={formatCurrency(priceAmount)}
          />
          <p className="sym-method-note">
            Fare retrieved from live partner inventory or standard tariff normalization.
          </p>
        </div>

        {/* TIME CARD */}
        <div className="sym-card card-time">
          <div className="sym-card-header">
            <span className="card-badge amber">TRAVEL DURATION</span>
            <DataSourceBadge source={timeSource.source || 'routing'} label="Routing Schedule" />
          </div>
          <div className="sym-card-metric">
            <strong className="metric-val">{formatMins(durationMins)}</strong>
            <span className="metric-sub">Direct journey duration</span>
          </div>
          <CalculationRow
            icon="⏱️"
            label="Time Score"
            score={timeScore}
            weight={weights.time || 0.15}
            contribution={timeContrib}
            metricDetail={formatMins(durationMins)}
          />
          <p className="sym-method-note">
            Calculated from scheduled departure-to-arrival timetables.
          </p>
        </div>
      </div>

      {/* 3. Final Calculation Card */}
      <div className="sym-final-card">
        <h5 className="final-card-title">HOW YOUR SCORE WAS CALCULATED</h5>
        <div className="final-calc-equation">
          <div className="calc-term">
            <span className="term-name">🌱 Carbon</span>
            <span className="term-math">({carbonScore} × {Math.round((weights.carbon || 0.40) * 100)}%)</span>
            <span className="term-res">+{Number(carbonContrib).toFixed(1)}</span>
          </div>
          <span className="calc-plus">+</span>
          <div className="calc-term">
            <span className="term-name">♿ Accessibility</span>
            <span className="term-math">({accessScore} × {Math.round((weights.accessibility || 0.30) * 100)}%)</span>
            <span className="term-res">+{Number(accessContrib).toFixed(1)}</span>
          </div>
          <span className="calc-plus">+</span>
          <div className="calc-term">
            <span className="term-name">💰 Cost</span>
            <span className="term-math">({costScore} × {Math.round((weights.cost || 0.15) * 100)}%)</span>
            <span className="term-res">+{Number(costContrib).toFixed(1)}</span>
          </div>
          <span className="calc-plus">+</span>
          <div className="calc-term">
            <span className="term-name">⏱ Time</span>
            <span className="term-math">({timeScore} × {Math.round((weights.time || 0.15) * 100)}%)</span>
            <span className="term-res">+{Number(timeContrib).toFixed(1)}</span>
          </div>
        </div>

        <div className="final-score-summary">
          <div className="raw-total">
            <span>UNROUNDED TOTAL:</span>
            <strong>{Number(finalScore).toFixed(1)} / 100</strong>
          </div>
          <div className="displayed-total">
            <span>GREEN &amp; ACCESSIBLE SCORE:</span>
            <span className="score-big">{roundedScore}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
