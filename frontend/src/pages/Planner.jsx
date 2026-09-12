import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';

export default function Planner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read destination from query params if coming from Discover (e.g. /planner?destination=Tirupati)
  const initialDestination = searchParams.get('destination') || 'Goa, India';

  // Form state initialized with dynamic destination or reference defaults
  const [destination, setDestination] = useState(initialDestination);
  const [origin, setOrigin] = useState('Mumbai, India');
  const [dates, setDates] = useState('24 Sep – 28 Sep');
  const [travellers, setTravellers] = useState('2 travellers');
  const [travellersDropdownOpen, setTravellersDropdownOpen] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState(['Lower impact']);

  useEffect(() => {
    const destParam = searchParams.get('destination');
    if (destParam) {
      setDestination(destParam);
    }
  }, [searchParams]);

  const priorityOptions = [
    {
      id: 'Lower impact',
      label: 'Lower impact',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.7 2.3c-7.8 0-14.7 4.9-17.3 12.2C1.8 21.8 6.7 22 7 22c8.1 0 15-5.3 17-13.4.4-1.8-.4-4.5-2.3-6.3zm-3.2 6.5c-1.5 5.5-6 9.4-11.5 10.7 1.3-4.5 4.8-8.2 9.5-9.8 1.4-.5 2.1-.6 2-.9z" />
        </svg>
      ),
    },
    {
      id: 'Accessibility',
      label: 'Accessibility',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4" r="2" />
          <path d="M12 8v6h5l2 5" />
          <path d="M10 14a4 4 0 1 1-4-4" />
        </svg>
      ),
    },
    {
      id: 'Budget-friendly',
      label: 'Budget-friendly',
      icon: <span style={{ fontWeight: 700, fontSize: '13px', lineHeight: 1 }}>₹</span>,
    },
    {
      id: 'More comfort',
      label: 'More comfort',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ),
    },
  ];

  const togglePriority = (id) => {
    setSelectedPriorities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    navigate('/results', {
      state: {
        origin,
        destination,
        dates,
        travellers,
        selectedPriorities
      }
    });
  };

  return (
    <AppLayout>
      <div className="planner-page-wrapper">
        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <header className="planner-header">
          <div className="planner-eyebrow">
            <span className="planner-eyebrow-text">PLAN A TRIP</span>
            <span className="planner-eyebrow-rule" />
          </div>
          <h1 className="planner-title">Where to next?</h1>
          <p className="planner-subtitle">Plan smarter. Travel greener.</p>
        </header>

        {/* ── MAIN TWO-COLUMN COMPOSITION ─────────────────────────────── */}
        <div className="planner-grid">
          {/* LEFT: TRIP PLANNING FORM CARD */}
          <section className="planner-form-card">
            <form onSubmit={handleSubmit} className="planner-form-body">
              {/* Field 1: Where are you going? */}
              <div className="planner-field-group">
                <label className="planner-field-label">Where are you going?</label>
                <div className="planner-input-box">
                  <span className="planner-input-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#123b36" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="planner-text-input"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Destination (e.g. Goa, India)"
                  />
                </div>
              </div>

              {/* Field 2 & 3: Leaving from + Travel dates */}
              <div className="planner-dual-fields">
                {/* Leaving from */}
                <div className="planner-field-group">
                  <label className="planner-field-label">Leaving from</label>
                  <div className="planner-input-box">
                    <span className="planner-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#123b36" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      className="planner-text-input"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Origin city"
                    />
                  </div>
                </div>

                {/* Travel dates */}
                <div className="planner-field-group">
                  <label className="planner-field-label">Travel dates</label>
                  <div className="planner-input-box">
                    <span className="planner-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#123b36" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      className="planner-text-input"
                      value={dates}
                      onChange={(e) => setDates(e.target.value)}
                      placeholder="Travel dates"
                    />
                  </div>
                </div>
              </div>

              {/* Field 4: Who's going? */}
              <div className="planner-field-group" style={{ position: 'relative' }}>
                <label className="planner-field-label">Who&apos;s going?</label>
                <div
                  className="planner-input-box planner-select-box"
                  onClick={() => setTravellersDropdownOpen(!travellersDropdownOpen)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="planner-select-left">
                    <span className="planner-input-icon">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#123b36" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
                    <span className="planner-select-value">{travellers}</span>
                  </div>
                  <span className={`planner-select-chevron ${travellersDropdownOpen ? 'open' : ''}`}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#123b36" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>

                {/* Dropdown Menu */}
                {travellersDropdownOpen && (
                  <div className="planner-dropdown-menu">
                    {['1 traveller', '2 travellers', '3 travellers', '4+ group'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`planner-dropdown-item ${travellers === opt ? 'selected' : ''}`}
                        onClick={() => {
                          setTravellers(opt);
                          setTravellersDropdownOpen(false);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Field 5: What matters most? */}
              <div className="planner-field-group">
                <label className="planner-field-label">What matters most?</label>
                <div className="planner-pills-row">
                  {priorityOptions.map((opt) => {
                    const isSelected = selectedPriorities.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`planner-priority-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => togglePriority(opt.id)}
                      >
                        <span className="priority-pill-icon">{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary CTA Button */}
              <div className="planner-cta-wrapper">
                <button type="submit" className="planner-primary-btn">
                  <span>Find my Eco-Twin</span>
                  <span className="planner-btn-arrow">→</span>
                </button>
              </div>
            </form>
          </section>

          {/* RIGHT: SCENIC TRAVEL IMAGE VISUAL */}
          <aside className="planner-scenic-card">
            {/* Top-left editorial message */}
            <div className="planner-editorial-overlay">
              <h2 className="planner-editorial-title">
                Same places<br />
                Greener paths
              </h2>
              <svg
                className="planner-editorial-swoosh"
                width="72"
                height="10"
                viewBox="0 0 72 10"
                fill="none"
              >
                <path
                  d="M2 3C22 9.5 48 9.5 70 3"
                  stroke="#277855"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Bottom-right translucent badge */}
            <div className="planner-impact-badge">
              <div className="planner-badge-icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="#0b6c57">
                  <path d="M21.7 2.3c-7.8 0-14.7 4.9-17.3 12.2C1.8 21.8 6.7 22 7 22c8.1 0 15-5.3 17-13.4.4-1.8-.4-4.5-2.3-6.3zm-3.2 6.5c-1.5 5.5-6 9.4-11.5 10.7 1.3-4.5 4.8-8.2 9.5-9.8 1.4-.5 2.1-.6 2-.9z" />
                </svg>
              </div>
              <div className="planner-badge-text">
                <div className="badge-stat">~ 46% lower CO₂</div>
                <div className="badge-sub">with Eco-Twin travel</div>
              </div>
            </div>
          </aside>
        </div>

        {/* Subtle decorative bottom landscape hills illustration */}
        <div className="planner-bottom-hills" aria-hidden="true">
          <svg
            viewBox="0 0 1440 180"
            fill="none"
            preserveAspectRatio="none"
            className="planner-hills-svg"
          >
            {/* Soft morning sun */}
            <circle cx="690" cy="130" r="48" fill="#fbecc5" opacity="0.6" />
            {/* Birds in flight */}
            <path
              d="M740 85c4-3 8-1 12 2c4-3 8-1 12 2"
              stroke="#9bb5a8"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
            <path
              d="M785 105c3-2 6-1 9 1.5c3-2 6-1 9 1.5"
              stroke="#9bb5a8"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />
            {/* Back mountain layer */}
            <path
              d="M0 180L0 120C180 85 360 135 540 110C720 85 900 130 1080 105C1260 80 1380 115 1440 120L1440 180Z"
              fill="#e2ece2"
              opacity="0.6"
            />
            {/* Mid mountain layer */}
            <path
              d="M0 180L0 145C160 125 320 160 480 138C640 116 800 152 960 130C1120 108 1280 145 1440 140L1440 180Z"
              fill="#d9e6d9"
              opacity="0.8"
            />
            {/* Foreground subtle wave */}
            <path
              d="M0 180L0 165C200 150 400 172 600 158C800 144 1000 168 1200 155C1340 145 1400 160 1440 165L1440 180Z"
              fill="#cfded1"
              opacity="0.9"
            />
          </svg>
        </div>
      </div>
    </AppLayout>
  );
}
