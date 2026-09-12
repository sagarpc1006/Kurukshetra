import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const WEBSITE_FEATURES = [
  {
    id: 'ai-assistant',
    name: 'AI Travel Assistant & Chat',
    category: 'AI & Planning',
    icon: '🤖',
    badge: 'Dual-LLM',
    status: 'Live & Active',
    summary: 'Conversational travel planner that uses natural language processing to extract your travel intent, destinations, dates, and budget.',
    techStack: ['Google Gemini 2.5 Flash', 'Groq LLaMA-3.3 (Fallback)', 'NLP Intent Parsing', 'Django REST Framework'],
    details: 'When you type a query like "Plan a weekend escape to Goa", the backend LLM parses origin, destination, duration, budget, and accessibility constraints into a structured JSON payload to orchestrate travel recommendations.',
    sampleOutput: 'Extracted: { origin: "Mumbai", destination: "Goa", duration_days: 4, budget: 15000, eco_priority: "High" }',
    actionType: 'prompt',
    actionPrompt: 'Plan a 3-day low-carbon escape to Munnar for 2 travelers with ₹15,000 budget',
    actionLabel: 'Try in AI Chat ↗',
  },
  {
    id: 'eco-twin',
    name: 'Eco-Twin Green Route Engine',
    category: 'Green & Eco',
    icon: '🌿',
    badge: 'Core Engine',
    status: 'Operational',
    summary: 'Compares high-emission travel options (flights/cabs) against sustainable twins (scenic trains/electric buses), showing exact CO₂ reduction.',
    techStack: ['DEFRA Carbon Models', 'Konkan & Vande Bharat Rail DB', 'Multi-Modal Normalizer', 'PostgreSQL'],
    details: 'The Eco-Twin algorithm computes carbon emission differences between standard air travel and rail or electric road transport, highlighting total kilograms of CO₂ avoided and equivalent trees saved.',
    sampleOutput: 'Eco-Twin Match: Mumbai → Goa via Konkan Railway (35 kg CO₂) vs Flight (130 kg CO₂) — saves 95 kg CO₂ (73% reduction)',
    actionType: 'prompt',
    actionPrompt: 'Find an Eco-Twin journey from Mumbai to Goa saving over 40% CO2',
    actionLabel: 'Find Eco-Twin ↗',
  },
  {
    id: 'show-your-math',
    name: '"Show Your Math" Carbon Transparency',
    category: 'Green & Eco',
    icon: '📐',
    badge: 'DEFRA Audited',
    status: 'Live Verification',
    summary: 'Eliminates greenwashing by breaking down carbon calculations, emission factors (EF), travel duration, cost normalization, and scoring math.',
    techStack: ['DEFRA 2024 Factors', 'European Environment Agency (EEA)', 'Normalization Algorithm', 'Deterministic Scoring'],
    details: 'Every carbon score is calculated using standard formulas: Carbon = Distance (km) × Mode Emission Factor (kg CO₂/pkm) × Efficiency Modifier. We show every formula and source transparently.',
    sampleOutput: 'Formula: 580 km × 0.035 kg CO₂/pkm (Electric Rail) = 20.3 kg CO₂ per passenger. Raw Score: 94/100.',
    actionType: 'inspect',
    actionLabel: 'Inspect Formula ↗',
  },
  {
    id: 'accessibility-engine',
    name: 'Verified Accessibility & Vision AI',
    category: 'Accessibility',
    icon: '♿',
    badge: 'AI Vision',
    status: 'Verified',
    summary: 'Multi-criteria accessibility filters for wheelchair ramps, step-free access, elevators, and tactile paving with Gemini Vision photo analysis.',
    techStack: ['Gemini 2.5 Flash Vision API', 'PostgreSQL AccessibilityProfile', 'OSM Wheelchair Tags', 'Photo Evidence DB'],
    details: 'Users can specify mobility needs. The system filters venues and transport stations with verified ramps, elevators, and step-free routes, and can inspect user-uploaded photos with computer vision for ramp slope verification.',
    sampleOutput: 'Accessibility Check: Ramp verified (Slope 1:12), Step-Free: Yes, Elevator: Operational, Score: 98/100.',
    actionType: 'navigate',
    actionPath: '/profile',
    actionLabel: 'View Access Profile ↗',
  },
  {
    id: 'interactive-itinerary',
    name: 'Day-by-Day Dynamic Itineraries',
    category: 'AI & Planning',
    icon: '🗺️',
    badge: 'Automated',
    status: 'Live Synthesis',
    summary: 'Generates balanced day-by-day itineraries categorized into Morning, Afternoon, Evening, and Night with live route guidance and eco scores.',
    techStack: ['Itinerary Synthesis Service', 'OpenTripMap POIs', 'Weather-Aware Pacing', 'Leaflet Routing'],
    details: 'Assembles realistic schedules based on user preferences. Each activity includes estimated time, walking distance, verified green credentials, and accessibility status.',
    sampleOutput: 'Day 1: Morning arrival & tea garden walk (Low Impact) → Afternoon spice plantation tour (Verified Green) → Sunset viewpoint.',
    actionType: 'prompt',
    actionPrompt: 'Create a 4-day accessible itinerary for Hampi heritage trip with morning and evening walking trails',
    actionLabel: 'Generate Itinerary ↗',
  },
  {
    id: 'saved-trips',
    name: 'PostgreSQL Saved Trips & Wishlist',
    category: 'Data & Storage',
    icon: '💾',
    badge: 'Database Synced',
    status: 'Active DB',
    summary: 'Save itineraries, bookmark eco-friendly destinations, and manage upcoming and past trips with persistent cloud synchronization.',
    techStack: ['Django ORM', 'PostgreSQL `trips_savedtrip`', 'Firebase Token Auth', 'Trip Serialization API'],
    details: 'Users can bookmark any generated itinerary. The trip is stored permanently in PostgreSQL with full route information, carbon metrics, estimated cost, and saved timestamp.',
    sampleOutput: 'Saved Trip #4: "Coastal slow days in Goa" · 2 travellers · 46% lower CO₂ · Synced with PostgreSQL.',
    actionType: 'navigate',
    actionPath: '/trips',
    actionLabel: 'Open My Trips ↗',
  },
  {
    id: 'onboarding-profiler',
    name: '7-Question Preference Profiler',
    category: 'Personalization',
    icon: '⚙️',
    badge: '7 Steps',
    status: 'Interactive',
    summary: 'Calibrates travel vibe, sustainability priority, budget limits, transit modes, accessibility requirements, companions, and home city.',
    techStack: ['React Multi-Step State', 'PostgreSQL UserProfile', 'AccessibilityProfile API', 'LocalStorage Session Cache'],
    details: 'During account creation or on-demand updates, users complete 7 structured questions that personalize all downstream AI recommendations and route filters.',
    sampleOutput: 'Profile calibrated: Style: Heritage · Eco Priority: High · Budget: ₹18,000 · Transit: Scenic Train · Home: Mumbai.',
    actionType: 'navigate',
    actionPath: '/onboarding',
    actionLabel: 'Retake 7 Questions ↗',
  },
  {
    id: 'weather-intelligence',
    name: 'Live Weather & Forecast Intelligence',
    category: 'Data & Transit',
    icon: '🌤️',
    badge: 'Live API',
    status: 'Real-time',
    summary: 'Real-time temperature, weather forecast, precipitation probability, and weather-aware packing suggestions for destinations.',
    techStack: ['Open-Meteo Weather API', 'OpenWeatherMap Fallback', 'Destination Geocoding', 'Packing Advisory Engine'],
    details: 'Queries destination coordinates to fetch real-time climate conditions, helping the recommendation engine avoid rainy seasons and advise travelers on clothing and gear.',
    sampleOutput: 'Munnar: 19°C · Partially Cloudy · 12% Rain Chance · Recommendation: Light woolens & rain poncho.',
    actionType: 'prompt',
    actionPrompt: 'Show current weather and best 3-day travel plan for Coorg hill station',
    actionLabel: 'Check Destination Weather ↗',
  },
  {
    id: 'multi-modal-transit',
    name: 'Multi-Modal Transit & Duffel Flights',
    category: 'Data & Transit',
    icon: '🚆',
    badge: 'Multi-Carrier',
    status: 'Connected',
    summary: 'Connects Duffel API for airline data with OpenRouteService and OpenStreetMap for railways, electric buses, and road networks.',
    techStack: ['Duffel Flight API', 'OpenRouteService (ORS)', 'OpenStreetMap Overpass', 'Konkan Railway Data'],
    details: 'Compares multiple transit layers side-by-side: commercial aviation with flight carbon tracking, intercity Indian Railways schedules, and electric bus routes.',
    sampleOutput: 'Modes compared: Flight (1h 20m, 130 kg CO₂) vs Vande Bharat Train (6h 30m, 24 kg CO₂) vs Volvo EV Bus (10h, 32 kg CO₂).',
    actionType: 'prompt',
    actionPrompt: 'Compare flights, trains, and buses from Bengaluru to Ooty with carbon footprint',
    actionLabel: 'Compare Transit Modes ↗',
  },
  {
    id: 'impact-analytics',
    name: 'Eco Impact Tracker & EcoScore Ring',
    category: 'Green & Eco',
    icon: '🏆',
    badge: 'Analytics',
    status: 'Live Meter',
    summary: 'Visualizes your cumulative CO₂ avoided, tree-equivalent planting offsets, and personal EcoTrail Score ring (0–100).',
    techStack: ['SVG Animated Gauge', 'Carbon Impact Calculator', 'Tree Equivalent Metrics (1 Tree = 60 kg CO₂/yr)', 'Achievement Badges'],
    details: 'Displays an interactive score ring evaluating lifetime travel decisions. Shows tangible real-world comparisons like "1,280 kg CO₂ saved is equivalent to growing 21 trees".',
    sampleOutput: 'EcoScore: 84/100 (Eco-Trailblazer) · Total CO₂ Saved: 1,280 kg · Trees Equivalent: 21 Trees.',
    actionType: 'scroll',
    actionTarget: 'eco-score-card',
    actionLabel: 'View EcoScore Ring ↗',
  },
  {
    id: 'leaflet-maps',
    name: 'Interactive Leaflet Route Maps',
    category: 'Data & Transit',
    icon: '📍',
    badge: 'Geospatial',
    status: 'Interactive GIS',
    summary: 'Interactive spatial maps plotting origin, destination, intermediate train/bus waypoints, and verified green attractions.',
    techStack: ['React-Leaflet', 'Leaflet.js', 'OpenStreetMap Tiles', 'GeoJSON Polylines'],
    details: 'Renders map layers with custom eco pins for train stations, accessible spots, and eco-certified stays, allowing users to visualize their entire green journey.',
    sampleOutput: 'Route Polyline: Mumbai CSMT [18.940, 72.835] → Ratnagiri [16.990, 73.312] → Madgaon [15.273, 73.958].',
    actionType: 'prompt',
    actionPrompt: 'Show map route and attractions for Mumbai to Goa train journey',
    actionLabel: 'Map Route ↗',
  },
  {
    id: 'firebase-django-auth',
    name: 'Firebase & Django Token Auth',
    category: 'Security & Auth',
    icon: '🔐',
    badge: 'Enterprise',
    status: 'Hardened',
    summary: 'Hybrid security combining Firebase Authentication (Email/Password & Google) with Django REST cryptographically verified tokens.',
    techStack: ['Firebase Client SDK', 'PyJWT / Cryptography', 'Django Custom Auth Backend', 'PostgreSQL UserProfile Sync'],
    details: 'Users authenticate securely with Firebase. The frontend sends the Firebase ID token in the Authorization header. Django verifies the cryptographic signature with Google public keys and loads the linked PostgreSQL profile.',
    sampleOutput: 'Authenticated via Firebase UID: verified against PostgreSQL user profile with role permissions.',
    actionType: 'navigate',
    actionPath: '/profile',
    actionLabel: 'Inspect Account Profile ↗',
  },
];

const CATEGORIES = [
  'All Features (12)',
  'AI & Planning',
  'Green & Eco',
  'Accessibility',
  'Data & Transit',
  'Security & Auth',
];

export default function FeaturesSidePanel({ onTriggerPrompt }) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All Features (12)');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFeatureId, setExpandedFeatureId] = useState(null);
  const [inspectingFeature, setInspectingFeature] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredFeatures = WEBSITE_FEATURES.filter((feat) => {
    const matchesCategory =
      selectedCategory.startsWith('All') ||
      feat.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      feat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAction = (feature) => {
    if (feature.actionType === 'prompt') {
      if (onTriggerPrompt) {
        onTriggerPrompt(feature.actionPrompt);
      }
      setDrawerOpen(false);
    } else if (feature.actionType === 'navigate' && feature.actionPath) {
      navigate(feature.actionPath);
    } else if (feature.actionType === 'inspect') {
      setInspectingFeature(feature);
    } else if (feature.actionType === 'scroll') {
      const el = document.querySelector(`.${feature.actionTarget}`) || document.querySelector('.eco-score-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        el.classList.add('feature-highlight-pulse');
        setTimeout(() => el.classList.remove('feature-highlight-pulse'), 2500);
      }
      setDrawerOpen(false);
    }
  };

  return (
    <>
      {/* ── Docked Side Card in Secondary Column ────────────────────────── */}
      <section className="features-side-panel" aria-label="Website Features Hub">
        <div className="features-panel-header">
          <div className="features-panel-header-left">
            <span className="features-badge">✦ WEBSITE CAPABILITIES</span>
            <h3 className="features-panel-title">Explore All Features</h3>
            <p className="features-panel-subtitle">
              Observe and test every feature active in EcoTrail
            </p>
          </div>
          <div className="features-count-badge">
            <span className="live-dot" /> 12 Active
          </div>
        </div>

        {/* Quick Search */}
        <div className="features-search-bar">
          <span className="features-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search features (e.g. Eco-Twin, Math, AI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="features-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="features-search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="features-category-pills">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`features-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Feature Cards List */}
        <div className="features-list-scroll">
          {filteredFeatures.length === 0 ? (
            <div className="features-empty">
              <span>🔍</span>
              <p>No features match "{searchQuery}"</p>
              <button type="button" onClick={() => { setSearchQuery(''); setSelectedCategory('All Features (12)'); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            filteredFeatures.map((feat) => {
              const isExpanded = expandedFeatureId === feat.id;
              return (
                <article
                  key={feat.id}
                  className={`feature-item-card ${isExpanded ? 'expanded' : ''}`}
                >
                  <div className="feature-item-main">
                    <div className="feature-icon-box">
                      <span className="feature-icon">{feat.icon}</span>
                    </div>
                    <div className="feature-info">
                      <div className="feature-meta-row">
                        <span className="feature-cat-tag">{feat.category}</span>
                        <span className="feature-status-tag">
                          <span className="mini-live-dot" /> {feat.badge}
                        </span>
                      </div>
                      <h4 className="feature-item-name">{feat.name}</h4>
                      <p className="feature-item-summary">{feat.summary}</p>
                    </div>
                  </div>

                  {/* Expanded Technical Details */}
                  {isExpanded && (
                    <div className="feature-expanded-drawer">
                      <div className="feature-expanded-section">
                        <strong>Architecture &amp; How It Works:</strong>
                        <p>{feat.details}</p>
                      </div>

                      <div className="feature-expanded-section">
                        <strong>Tech Stack &amp; APIs:</strong>
                        <div className="feature-tech-chips">
                          {feat.techStack.map((tech) => (
                            <span key={tech} className="tech-chip">{tech}</span>
                          ))}
                        </div>
                      </div>

                      <div className="feature-expanded-section">
                        <strong>Sample Output:</strong>
                        <pre className="feature-sample-code">{feat.sampleOutput}</pre>
                      </div>
                    </div>
                  )}

                  {/* Action Controls */}
                  <div className="feature-item-footer">
                    <button
                      type="button"
                      className="feature-expand-btn"
                      onClick={() => setExpandedFeatureId(isExpanded ? null : feat.id)}
                    >
                      {isExpanded ? 'Hide Details ▴' : 'View Architecture ▾'}
                    </button>

                    <div className="feature-cta-group">
                      <button
                        type="button"
                        className="feature-inspect-btn"
                        onClick={() => setInspectingFeature(feat)}
                      >
                        Observe
                      </button>
                      <button
                        type="button"
                        className="feature-action-btn"
                        onClick={() => handleAction(feat)}
                      >
                        {feat.actionLabel}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Side Panel Footer with Open Full Drawer CTA */}
        <div className="features-panel-footer">
          <button
            type="button"
            className="features-open-drawer-btn"
            onClick={() => setDrawerOpen(true)}
          >
            <span>⊞</span> View Full Feature Matrix ({WEBSITE_FEATURES.length} Features)
          </button>
        </div>
      </section>

      {/* ── Floating Quick-Access Side Toggle ────────────────────────────── */}
      <button
        type="button"
        className="features-floating-trigger"
        onClick={() => setDrawerOpen(true)}
        title="Observe all 12 platform features"
        aria-label="Open Features Hub"
      >
        <span className="floating-sparkle">✦</span>
        <span className="floating-text">All Features (12)</span>
      </button>

      {/* ── Full Screen / Slide-Out Feature Matrix Drawer ─────────────────── */}
      {drawerOpen && (
        <div
          className="features-drawer-overlay"
          onClick={(e) => e.target === e.currentTarget && setDrawerOpen(false)}
        >
          <div className="features-drawer-panel">
            <div className="features-drawer-header">
              <div>
                <span className="features-badge">✦ ECOTRAIL 2.0 FULL PLATFORM CAPABILITIES</span>
                <h2>All Website Features &amp; Architecture</h2>
                <p>Observe each and every feature built into the EcoTrail system</p>
              </div>
              <button
                type="button"
                className="features-drawer-close"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close feature drawer"
              >
                ✕
              </button>
            </div>

            <div className="features-drawer-grid">
              {WEBSITE_FEATURES.map((feat) => (
                <div key={feat.id} className="drawer-feature-card">
                  <div className="drawer-card-top">
                    <div className="drawer-card-icon">{feat.icon}</div>
                    <div>
                      <span className="drawer-card-badge">{feat.badge}</span>
                      <h3>{feat.name}</h3>
                      <span className="drawer-card-cat">{feat.category}</span>
                    </div>
                  </div>
                  <p className="drawer-card-summary">{feat.summary}</p>
                  
                  <div className="drawer-tech-tags">
                    {feat.techStack.map((t) => (
                      <span key={t} className="tech-chip small">{t}</span>
                    ))}
                  </div>

                  <div className="drawer-card-bottom">
                    <button
                      type="button"
                      className="drawer-inspect-link"
                      onClick={() => {
                        setDrawerOpen(false);
                        setInspectingFeature(feat);
                      }}
                    >
                      Inspect Details →
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => handleAction(feat)}
                    >
                      {feat.actionLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Feature Deep-Dive Inspection Modal ───────────────────────────── */}
      {inspectingFeature && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setInspectingFeature(null)}
        >
          <div className="feature-inspect-modal">
            <button
              type="button"
              className="modal-close"
              onClick={() => setInspectingFeature(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="inspect-modal-header">
              <div className="inspect-modal-icon-wrap">
                <span>{inspectingFeature.icon}</span>
              </div>
              <div>
                <span className="features-badge">{inspectingFeature.category}</span>
                <h2>{inspectingFeature.name}</h2>
                <span className="inspect-status-pill">
                  <span className="live-dot" /> {inspectingFeature.status} · {inspectingFeature.badge}
                </span>
              </div>
            </div>

            <div className="inspect-modal-body">
              <div className="inspect-block">
                <h4>What This Feature Does</h4>
                <p>{inspectingFeature.details}</p>
              </div>

              <div className="inspect-block">
                <h4>Technologies &amp; Connected APIs</h4>
                <div className="feature-tech-chips">
                  {inspectingFeature.techStack.map((tech) => (
                    <span key={tech} className="tech-chip large">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="inspect-block">
                <h4>Empirical Output &amp; Data Verification</h4>
                <pre className="feature-sample-code highlight">
                  {inspectingFeature.sampleOutput}
                </pre>
              </div>
            </div>

            <div className="inspect-modal-footer">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setInspectingFeature(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const feat = inspectingFeature;
                  setInspectingFeature(null);
                  handleAction(feat);
                }}
              >
                {inspectingFeature.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
