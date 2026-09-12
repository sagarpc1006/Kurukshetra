import React from 'react';

// Bespoke illustrated vector SVG logos for Quick Ideas (no emojis)
function GreenRouteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 18V9"
        stroke="#0b6c57"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 12C10 7.5 14.5 5 18 5C18 9.5 14.5 13 10 13"
        fill="#10b981"
        stroke="#0b6c57"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M10 14C10 10.5 6.5 8 3 8C3 11.5 6.5 15 10 15"
        fill="#cce96d"
        stroke="#0b6c57"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BudgetTravelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#fef3c7" stroke="#b45309" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="5.8" stroke="#d97706" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      <path
        d="M7.5 7H12.5M7.5 9.2H12M7.5 7V10C7.5 11.2 8.4 12 9.8 12L12.5 15"
        stroke="#92400e"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccessibleTravelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="5" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1" />
      <circle cx="10" cy="5.2" r="1.6" fill="#2563eb" />
      <path
        d="M8.8 8.2H11.5L12 11.5H9.5M10.8 11.5V14.8H8.5"
        stroke="#2563eb"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.8 11.8C8.2 13.8 10 15.2 12.2 14.8C13.8 14.5 15 13.2 15 11.5"
        stroke="#1d4ed8"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CarbonBudgetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7.5" fill="#ecfdf5" stroke="#0f766e" strokeWidth="1.3" />
      <path
        d="M6 9C7.2 8 8 10 10 8.5C11.5 7 13.5 7.5 14 9C14.5 10.5 13 12 11.5 12.5C10 13 9 14.5 7.5 13.5"
        stroke="#14b8a6"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="9" stroke="#10b981" strokeWidth="0.8" strokeDasharray="2 2" />
    </svg>
  );
}

function WeatherAwareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="8" r="4.2" fill="#fde68a" stroke="#d97706" strokeWidth="1.2" />
      <path
        d="M9 2V3.5M9 12.5V14M3 8H4.5M13.5 8H15M4.8 3.8L5.8 4.8M12.2 11.2L13.2 12.2M4.8 12.2L5.8 11.2M12.2 4.8L13.2 3.8"
        stroke="#f59e0b"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M7 14.5C6.2 14.5 5.5 13.8 5.5 13C5.5 12.3 6 11.7 6.8 11.6C7.1 10.2 8.4 9.2 9.9 9.5C11 9.8 11.8 10.7 12 11.8C12.8 11.9 13.5 12.6 13.5 13.4C13.5 14.3 12.8 15 11.9 15H7.2"
        fill="#f0fdf4"
        stroke="#0b6c57"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const QUICK_IDEAS = [
  {
    id: 'greenest',
    tag: 'Greenest route',
    query: 'Find the greenest way to Goa with verified low-emission stays',
    Illustration: GreenRouteIcon,
  },
  {
    id: 'budget',
    tag: 'Budget travel',
    query: 'Plan a scenic 3-day trip under ₹10,000 using public transport',
    Illustration: BudgetTravelIcon,
  },
  {
    id: 'accessible',
    tag: 'Accessible travel',
    query: 'Plan an accessible trip to Mumbai with step-free transport and hotels',
    Illustration: AccessibleTravelIcon,
  },
  {
    id: 'carbon',
    tag: 'Carbon budget',
    query: 'Plan a weekend trip with carbon footprint strictly under 20 kg CO₂',
    Illustration: CarbonBudgetIcon,
  },
  {
    id: 'weather',
    tag: 'Weather-aware',
    query: 'Plan my trip based on pleasant weather and lower seasonal crowds',
    Illustration: WeatherAwareIcon,
  },
];

export default function QuickPrompts({ onSelectPrompt }) {
  return (
    <div className="quick-prompts-wrapper">
      <span className="quick-prompts-label">Quick Ideas:</span>
      <div className="quick-prompts-chips" role="group" aria-label="Suggested travel prompts">
        {QUICK_IDEAS.map((item) => {
          const IconComponent = item.Illustration;
          return (
            <button
              key={item.id}
              type="button"
              className="prompt-chip"
              onClick={() => onSelectPrompt(item.query)}
              title={`Select: "${item.query}"`}
            >
              <span className="prompt-chip-icon illustrated" aria-hidden="true">
                <IconComponent />
              </span>
              <span className="prompt-chip-tag">{item.tag}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
