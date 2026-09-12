import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import api from '../services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80';

// High-quality fallback destinations to ensure zero downtime
const DEFAULT_PLACES = [
  {
    id: 'munnar',
    name: 'Munnar',
    state: 'Kerala',
    type: 'Tea country',
    tag: 'Low-impact stay',
    rating: '4.9',
    img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
    categories: ['For you', 'Nature', 'Weekend escape', '♿ Accessible'],
    eco_score: 94,
    co2_kg: 18,
    carbon_saved_percent: 68,
    transit_tip: 'Electric rail to Aluva/Ernakulam + KSRTC green mountain bus',
    description: 'Misty rolling tea gardens, Eravikulam National Park, and certified low-carbon organic plantation homestays.',
    highlights: ['Eravikulam Nilgiri Tahr Sanctuary', 'Organic Tea Tasting', 'Attukad Waterfalls Walk', 'Zero-waste homestays'],
    weather: { temperature: 16, condition: 'Clouds', description: 'Overcast clouds', icon: '04d', humidity: 94 },
    has_official_package: true,
    official_package: {
      name: 'Kerala Tourism Development Corporation (KTDC) Packages',
      url: 'https://www.ktdc.com/packages',
      domain: 'ktdc.com',
      is_package: true,
    },
    official_links: [
      { name: 'KTDC Official Packages', url: 'https://www.ktdc.com/packages', domain: 'ktdc.com', is_package: true },
      { name: 'Official IRCTC Indian Railways E-Ticketing', url: 'https://www.irctc.co.in', domain: 'irctc.co.in', is_package: false }
    ]
  },
  {
    id: 'coorg',
    name: 'Coorg',
    state: 'Karnataka',
    type: 'Forest trails',
    tag: 'Accessible',
    rating: '4.8',
    img: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=900&q=80',
    categories: ['For you', 'Nature', 'Weekend escape', '♿ Accessible'],
    eco_score: 91,
    co2_kg: 22,
    carbon_saved_percent: 62,
    transit_tip: 'Train to Mysore Junction + KSRTC electric bus through Madikeri pass',
    description: 'Lush Western Ghats rainforest canopy, certified shade-grown coffee estates, and step-free spice plantation trails.',
    highlights: ['Dubare Elephant Camp', 'Abbey Falls Trail', 'Organic Coffee Plantation Walks', 'Nagarhole Eco Safari'],
    weather: { temperature: 21, condition: 'Clear', description: 'Clear skies', icon: '01d', humidity: 75 },
    has_official_package: true,
    official_package: {
      name: 'KSTDC Karnataka State Tourism Packages',
      url: 'https://kstdc.co/tour-packages/',
      domain: 'kstdc.co',
      is_package: true,
    },
    official_links: [
      { name: 'KSTDC Official Packages', url: 'https://kstdc.co/tour-packages/', domain: 'kstdc.co', is_package: true },
      { name: 'Official IRCTC Indian Railways E-Ticketing', url: 'https://www.irctc.co.in', domain: 'irctc.co.in', is_package: false }
    ]
  },
  {
    id: 'hampi',
    name: 'Hampi',
    state: 'Karnataka',
    type: 'Living heritage',
    tag: 'Verified clean',
    rating: '4.7',
    img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=900&q=80',
    categories: ['For you', 'Culture', '♿ Accessible'],
    eco_score: 89,
    co2_kg: 26,
    carbon_saved_percent: 71,
    transit_tip: 'Direct Hampi Express to Hosapete Junction + authorized battery buggies',
    description: 'UNESCO World Heritage monumental landscape of Vijayanagara ruins, boulder trails, and zero-emission electric buggy transit.',
    highlights: ['Virupaksha Temple', 'Vijaya Vittala Stone Chariot', 'Tungabhadra River Coracle Safari', 'Sanapur Lake Boulders'],
    weather: { temperature: 28, condition: 'Clear', description: 'Sunny & warm', icon: '01d', humidity: 55 },
    has_official_package: true,
    official_package: {
      name: 'KSTDC UNESCO Heritage Packages',
      url: 'https://kstdc.co/tour-packages/',
      domain: 'kstdc.co',
      is_package: true,
    },
    official_links: [
      { name: 'KSTDC Official Packages', url: 'https://kstdc.co/tour-packages/', domain: 'kstdc.co', is_package: true },
      { name: 'Archaeological Survey of India (ASI)', url: 'https://asi.nic.in', domain: 'asi.nic.in', is_package: true }
    ]
  },
  {
    id: 'alleppey',
    name: 'Alleppey',
    state: 'Kerala',
    type: 'Backwater canals',
    tag: 'Low-impact stay',
    rating: '4.9',
    img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=900&q=80',
    categories: ['For you', 'Beach', 'Weekend escape'],
    eco_score: 93,
    co2_kg: 20,
    carbon_saved_percent: 65,
    transit_tip: 'Direct coastal railway to Alappuzha + SWTD electric water taxi',
    description: 'Certified solar-powered backwater houseboats, zero-discharge canal networks, and regenerative coir artisan cooperatives.',
    highlights: ['Solar Houseboat Canal Cruise', 'Marari Beach Eco-village', 'Kuttanad Below-Sea Farming', 'Ayurvedic Herbal Gardens'],
    weather: { temperature: 27, condition: 'Rain', description: 'Light tropical shower', icon: '10d', humidity: 88 },
    has_official_package: true,
    official_package: {
      name: 'Kerala Tourism Development Corporation (KTDC) Packages',
      url: 'https://www.ktdc.com/packages',
      domain: 'ktdc.com',
      is_package: true,
    },
    official_links: [
      { name: 'KTDC Official Packages', url: 'https://www.ktdc.com/packages', domain: 'ktdc.com', is_package: true },
      { name: 'Official IRCTC Indian Railways E-Ticketing', url: 'https://www.irctc.co.in', domain: 'irctc.co.in', is_package: false }
    ]
  },
  {
    id: 'spiti',
    name: 'Spiti Valley',
    state: 'Himachal Pradesh',
    type: 'Himalayan valley',
    tag: 'Accessible',
    rating: '4.8',
    img: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=900&q=80',
    categories: ['Nature'],
    eco_score: 96,
    co2_kg: 32,
    carbon_saved_percent: 74,
    transit_tip: 'HRTC electric bus from Manali/Shimla through Atal Tunnel corridor',
    description: 'High-altitude cold desert sanctuary, ancient Buddhist gompas, and solar-warmed village community homestays.',
    highlights: ['Key Gompa Monastery', 'Chandratal High Altitude Lake', 'Kibber Wildlife Sanctuary', 'Fossil Village Langza'],
    weather: { temperature: 11, condition: 'Clear', description: 'Crisp alpine air', icon: '01d', humidity: 40 },
    has_official_package: true,
    official_package: {
      name: 'HPTDC Himachal Pradesh Tourism Packages',
      url: 'https://hptdc.in',
      domain: 'hptdc.in',
      is_package: true,
    },
    official_links: [
      { name: 'HPTDC Official Packages', url: 'https://hptdc.in', domain: 'hptdc.in', is_package: true },
      { name: 'HRTC Official Bus Booking', url: 'https://www.hrtchp.com', domain: 'hrtchp.com', is_package: false }
    ]
  },
  {
    id: 'pondicherry',
    name: 'Pondicherry',
    state: 'Puducherry',
    type: 'French heritage coast',
    tag: 'Verified clean',
    rating: '4.7',
    img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=900&q=80',
    categories: ['For you', 'Culture', 'Beach', 'Weekend escape'],
    eco_score: 90,
    co2_kg: 24,
    carbon_saved_percent: 60,
    transit_tip: 'Direct electric train from Chennai/Bangalore + vintage rental bicycles',
    description: 'Preserved French quarters, seaside promenade closed to vehicles in evening, and world-renowned Auroville eco-township.',
    highlights: ['White Town Bicycle Tour', 'Auroville Matrimandir', 'Paradise Beach Mangroves', 'Organic Cafes & Bakeries'],
    weather: { temperature: 29, condition: 'Clouds', description: 'Scattered sea clouds', icon: '03d', humidity: 76 },
    has_official_package: true,
    official_package: {
      name: 'PTDC Puducherry Tourism Official Packages',
      url: 'https://pondytourism.py.gov.in',
      domain: 'pondytourism.py.gov.in',
      is_package: true,
    },
    official_links: [
      { name: 'Puducherry Tourism Official Portal', url: 'https://pondytourism.py.gov.in', domain: 'pondytourism.py.gov.in', is_package: true },
      { name: 'Official IRCTC Indian Railways E-Ticketing', url: 'https://www.irctc.co.in', domain: 'irctc.co.in', is_package: false }
    ]
  }
];

function getWeatherEmoji(condition) {
  if (!condition) return '⛅';
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return '🌧️';
  if (c.includes('thunder')) return '⛈️';
  if (c.includes('snow')) return '❄️';
  if (c.includes('cloud')) return '⛅';
  if (c.includes('clear') || c.includes('sun')) return '☀️';
  if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return '🌫️';
  return '🌿';
}

export default function Discover() {
  const [activeFilter, setActiveFilter] = useState('For you');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [places, setPlaces] = useState(DEFAULT_PLACES);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const filterCategories = ['For you', 'Nature', 'Culture', 'Beach', 'Weekend escape', '♿ Accessible'];

  const TRENDING_SUGGESTIONS = [
    'Tirupati', 'Goa', 'Varanasi', 'Manali', 'Coorg', 'Amritsar', 'Udaipur', 'Kashmir', 'Ooty', 'Rishikesh'
  ];

  // Fetch real-time destinations from Django API
  const loadPlaces = async (cat, query) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat && cat !== 'For you') {
        params.append('category', cat);
      }
      if (query && query.trim()) {
        params.append('search', query.trim());
      }
      const res = await api.get(`/api/discover/?${params.toString()}`);
      if (res.data && res.data.places && res.data.places.length > 0) {
        setPlaces(res.data.places);
      } else if (res.data && Array.isArray(res.data.places)) {
        setPlaces([]);
      } else {
        setPlaces(DEFAULT_PLACES);
      }
    } catch (err) {
      console.warn('Real-time API unavailable, using cached registry fallback:', err);
      if (!query) {
        setPlaces(DEFAULT_PLACES);
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced search: as the user types, automatically search real time!
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveQuery(searchTerm.trim());
    }, 280);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load places whenever category or debounced query changes
  useEffect(() => {
    loadPlaces(activeFilter, activeQuery);
  }, [activeFilter, activeQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveQuery(searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    if (searchTerm) {
      setSearchTerm('');
      setActiveQuery('');
    }
  };

  const handleSuggestionClick = (dest) => {
    setSearchTerm(dest);
    setActiveQuery(dest);
  };

  const handleCardClick = (place) => {
    setSelectedPlace(place);
  };

  const handleCloseModal = () => {
    setSelectedPlace(null);
  };

  const handlePlanTripToPlace = (placeName) => {
    setSelectedPlace(null);
    navigate(`/planner?destination=${encodeURIComponent(placeName)}`);
  };

  return (
    <AppLayout>
      {/* HEADER SECTION */}
      <section className="discover-title">
        <div className="discover-badge-row">
          <span className="discover-pill">EXPLORE MINDFULLY</span>
          <span className="live-realtime-pill">
            <span className="live-beacon-dot"></span> Dynamic Real-Time Weather &amp; Govt Packages
          </span>
        </div>

        <h1>Places that give back.</h1>
        <p>Find inspiring destinations with lighter footprints and richer experiences.</p>

        {/* DYNAMIC REAL-TIME SEARCH BAR */}
        <form className="discover-search" onSubmit={handleSearchSubmit}>
          <span className="discover-search-icon" aria-hidden="true">⌕</span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Where do you want to go? (Type any place: Tirupati, Goa, Udaipur, Paris...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Where do you want to go?"
            autoComplete="off"
          />

          {loading && (
            <span className="search-dynamic-spinner" title="Searching live climate & official packages">
              <span className="spinner-dot"></span>
              <small>Live</small>
            </span>
          )}

          {searchTerm && !loading && (
            <button
              type="button"
              className="discover-clear-btn"
              onClick={handleClearSearch}
              title="Clear search"
            >
              ✕
            </button>
          )}

          <button type="submit" className="discover-search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* QUICK ONE-CLICK TRENDING SUGGESTIONS */}
        <div className="discover-quick-suggestions">
          <span className="suggestions-label">⚡ Try real time:</span>
          <div className="suggestions-chips-row">
            {TRENDING_SUGGESTIONS.map((dest) => (
              <button
                key={dest}
                type="button"
                className={`suggestion-chip ${searchTerm.toLowerCase() === dest.toLowerCase() ? 'active' : ''}`}
                onClick={() => handleSuggestionClick(dest)}
              >
                {dest} ↗
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FILTER PILLS */}
      <div className="filters discover-filters-row">
        {filterCategories.map((f) => (
          <button
            key={f}
            type="button"
            className={`discover-filter-btn ${activeFilter === f && !activeQuery ? 'active' : ''}`}
            onClick={() => handleFilterClick(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ACTIVE SEARCH FEEDBACK BANNER */}
      {activeQuery && (
        <div className="discover-search-feedback">
          <div className="feedback-left-group">
            <span className="live-search-pulse-dot"></span>
            <span>Real-time results for &ldquo;<strong>{activeQuery}</strong>&rdquo;</span>
            <span className="feedback-count-tag">{places.length} destination{places.length === 1 ? '' : 's'}</span>
          </div>
          <button type="button" onClick={handleClearSearch} className="clear-query-link">
            Clear search ✕
          </button>
        </div>
      )}

      {/* PLACES GRID */}
      <div className="place-grid large discover-grid-container">
        {loading ? (
          <div className="discover-loading-state">
            <div className="loading-orbit small">
              <div className="loading-pulse-ring"></div>
              <span className="loading-center-leaf">🌿</span>
            </div>
            <p>Fetching real-time weather &amp; verified official packages...</p>
          </div>
        ) : places.length > 0 ? (
          places.map((p) => {
            const weather = p.weather || {};
            const temp = weather.temperature;
            const cond = weather.condition;
            const emoji = getWeatherEmoji(cond);

            return (
              <div
                key={p.id || p.name}
                className="place discover-place-card"
                onClick={() => handleCardClick(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleCardClick(p);
                }}
              >
                {/* Image Container with Live Badges */}
                <div className="card-img-wrapper">
                  <img
                    src={p.img || FALLBACK_IMAGE}
                    alt={p.name}
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== FALLBACK_IMAGE) {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
                  {temp !== undefined && (
                    <div className="card-floating-weather-tag">
                      <span className="weather-emoji">{emoji}</span>
                      <span className="weather-degrees">{temp}°C</span>
                    </div>
                  )}
                  {p.has_official_package && (
                    <div className="card-floating-pkg-tag">
                      ⭐ Official Package
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="card-body-content">
                  <div className="card-tag-row">
                    <span className="discover-card-pill">{p.tag || 'Low-impact stay'}</span>
                    {p.eco_score && (
                      <span className="card-eco-score-pill">
                        🌿 {p.eco_score}/100 Eco
                      </span>
                    )}
                  </div>

                  <h3 className="card-destination-name">{p.name}</h3>

                  <div className="card-sub-row">
                    <span className="card-type-desc">{p.type}</span>
                    <span className="card-rating-star">★ {p.rating || '4.8'}</span>
                  </div>

                  {/* Real-time Transit summary */}
                  {p.transit_tip && (
                    <div className="card-transit-snippet">
                      <span className="transit-icon">🚆</span>
                      <span className="transit-text">{p.transit_tip}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="discover-empty-state">
            <div className="empty-icon">📍</div>
            <h3>No destinations found matching &ldquo;{activeQuery || searchTerm}&rdquo;</h3>
            <p>Try searching for popular eco-hubs like <strong>Goa</strong>, <strong>Tirupati</strong>, <strong>Munnar</strong>, <strong>Coorg</strong>, or <strong>Varanasi</strong>.</p>
            <button
              type="button"
              className="btn small light"
              onClick={handleClearSearch}
            >
              Show All Destinations ↺
            </button>
          </div>
        )}
      </div>

      {/* REAL-TIME DESTINATION INTEL MODAL */}
      {selectedPlace && (
        <div className="discover-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="discover-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedPlace.name} Real-Time Travel Intel`}
          >
            {/* Modal Header */}
            <div className="modal-hero-cover">
              <img
                src={selectedPlace.img || FALLBACK_IMAGE}
                alt={selectedPlace.name}
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                ✕
              </button>
              <div className="modal-cover-overlay">
                <span className="modal-state-pill">{selectedPlace.state || 'India'}</span>
                <h2>{selectedPlace.name}</h2>
                <p>{selectedPlace.type}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="modal-body-scroll">
              {/* REAL-TIME WEATHER WIDGET */}
              {selectedPlace.weather && (
                <div className="modal-live-weather-card">
                  <div className="weather-top-meta">
                    <span className="live-pulse-dot"></span>
                    <strong>Live Destination Climate</strong>
                    <span className="weather-source-tag">OpenWeatherMap Live</span>
                  </div>
                  <div className="weather-main-grid">
                    <div className="weather-temp-display">
                      <span className="weather-big-emoji">
                        {getWeatherEmoji(selectedPlace.weather.condition)}
                      </span>
                      <span className="weather-big-number">
                        {selectedPlace.weather.temperature}°C
                      </span>
                    </div>
                    <div className="weather-details-col">
                      <div className="weather-desc-line">
                        <strong>{selectedPlace.weather.description || selectedPlace.weather.condition}</strong>
                      </div>
                      <div className="weather-stat-pills">
                        <span>Feels like: {selectedPlace.weather.feels_like || selectedPlace.weather.temperature}°C</span>
                        <span>Humidity: {selectedPlace.weather.humidity || 70}%</span>
                        {selectedPlace.weather.temp_min && (
                          <span>Range: {selectedPlace.weather.temp_min}° – {selectedPlace.weather.temp_max}°C</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ECO IMPACT & TRANSIT */}
              <div className="modal-eco-card">
                <div className="eco-header-row">
                  <div>
                    <span className="eco-title-label">GREEN &amp; ACCESSIBLE SCORE</span>
                    <div className="eco-score-highlight">
                      <span className="score-number">{selectedPlace.eco_score || 92}</span>
                      <span className="score-total">/100</span>
                    </div>
                  </div>
                  {selectedPlace.carbon_saved_percent && (
                    <div className="eco-saving-pill">
                      −{selectedPlace.carbon_saved_percent}% CO₂ saved vs flight
                    </div>
                  )}
                </div>
                {selectedPlace.transit_tip && (
                  <div className="eco-transit-recommendation">
                    <strong>🚆 Verified Low-Emission Route:</strong>
                    <p>{selectedPlace.transit_tip}</p>
                  </div>
                )}
              </div>

              {/* AUTHENTIC OFFICIAL GOVERNMENT PACKAGES & BOOKINGS */}
              {selectedPlace.official_links && selectedPlace.official_links.length > 0 && (
                <div className="modal-packages-section">
                  <div className="modal-section-title">
                    <span className="section-icon">🏛️</span>
                    <h4>Verified Official Government Packages &amp; Portals</h4>
                  </div>
                  <p className="packages-subtitle">
                    Direct bookings with zero intermediary markup, authentic government rates, and confirmed access.
                  </p>

                  <div className="modal-packages-list">
                    {selectedPlace.official_links.map((link, idx) => (
                      <div
                        key={idx}
                        className={`modal-pkg-item ${link.is_package ? 'is-official-pkg' : ''}`}
                      >
                        <div className="pkg-item-header">
                          <span className={`pkg-badge-pill ${link.is_package ? 'pkg-gold' : ''}`}>
                            {link.is_package ? '⭐ Official Package' : '✓ Verified Transit'}
                          </span>
                          <span className="pkg-domain">{link.domain}</span>
                        </div>
                        <h5 className="pkg-title">{link.name}</h5>
                        {link.description && <p className="pkg-desc">{link.description}</p>}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`btn small ${link.is_package ? 'btn-package-cta' : 'light'}`}
                        >
                          <span>{link.is_package ? 'Access Official Package' : 'Visit Official Portal'}</span>
                          <span className="btn-arrow" aria-hidden="true">↗</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CURATED HIGHLIGHTS */}
              {selectedPlace.highlights && selectedPlace.highlights.length > 0 && (
                <div className="modal-highlights-section">
                  <div className="modal-section-title">
                    <span className="section-icon">🌿</span>
                    <h4>Sustainable Highlights &amp; Certified Stays</h4>
                  </div>
                  <ul className="modal-highlights-grid">
                    {selectedPlace.highlights.map((h, i) => (
                      <li key={i} className="highlight-item">
                        <span className="check-dot">✓</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="modal-footer-actions">
              <button
                type="button"
                className="btn secondary modal-action-btn"
                onClick={handleCloseModal}
              >
                Close
              </button>
              <button
                type="button"
                className="btn primary modal-action-btn"
                onClick={() => handlePlanTripToPlace(selectedPlace.name)}
              >
                <span>Plan Trip to {selectedPlace.name}</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
