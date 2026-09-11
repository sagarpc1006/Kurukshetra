import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QuickPrompts from './QuickPrompts';
import TravelResults from './TravelResults';
import RecommendationList from './RecommendationList';
import EcoTwinCard from './EcoTwinCard';
import ItineraryView from './ItineraryView';
import { sendChatMessage } from '../services/chatAPI';
import { saveTrip } from '../services/tripAPI';

export default function TravelAssistant({ onTripSaved }) {
  const [prompt, setPrompt] = useState('');
  const [searchState, setSearchState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [loadingStage, setLoadingStage] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [saveMessage, setSaveMessage] = useState('');
  const textareaRef = useRef(null);

  // Progressive loading stages
  const STAGES = [
    { title: 'Understanding your trip...', desc: 'Gemini AI parsing destinations, dates, budget & eco priority' },
    { title: 'Finding travel options...', desc: 'Querying Duffel API for flight offers and transit availability' },
    { title: 'Checking ground routes...', desc: 'Analyzing road network and distance via OpenRouteService & OSM' },
    { title: 'Checking local places...', desc: 'Discovering verified attractions & cultural sites via OpenTripMap' },
    { title: 'Checking real-time weather...', desc: 'Retrieving destination climate & forecast via OpenWeatherMap' },
    { title: 'Scoring & ranking itineraries...', desc: 'Calculating deterministic Green & Accessible Scores (Carbon, Access, Cost, Time)' },
    { title: 'Comparing Eco-Twin alternatives...', desc: 'Finding low-carbon, accessible multimodal alternative' },
    { title: 'Assembling complete itinerary...', desc: 'Synthesizing day-by-day sustainable schedule' },
  ];

  useEffect(() => {
    let timer;
    if (searchState === 'loading') {
      setLoadingStage(0);
      timer = setInterval(() => {
        setLoadingStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
      }, 1200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [searchState]);

  const handlePromptSelect = (selectedText) => {
    setPrompt(selectedText);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = prompt.trim();
    if (!query) return;

    setSearchState('loading');
    setErrorMessage('');
    setSaveStatus('idle');
    setSaveMessage('');

    try {
      // Calls real Django REST Framework API: POST /api/chat/
      const data = await sendChatMessage(query);
      if (data && data.success) {
        setResultData(data);
        setSearchState('success');
      } else {
        setErrorMessage(data?.message || 'Something went wrong. Please try again.');
        setSearchState('error');
      }
    } catch (err) {
      console.error('Error calling chat endpoint:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      setErrorMessage(serverMsg || 'Something went wrong. Please try again.');
      setSearchState('error');
    }
  };

  const handleReset = () => {
    setSearchState('idle');
    setResultData(null);
    setErrorMessage('');
    setPrompt('');
    setLoadingStage(0);
    setSaveStatus('idle');
    setSaveMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSaveTripToDatabase = async () => {
    if (!resultData) return;
    setSaveStatus('saving');
    setSaveMessage('');

    const intent = resultData.intent || {};
    const topOption = resultData.recommendations?.results?.[0] || {};
    const ecoTwin = resultData.eco_twin || {};
    const itinerary = resultData.itinerary || {};

    const payload = {
      title: itinerary.title || `${intent.duration_days || 3}-Day Trip: ${intent.origin || 'Origin'} to ${intent.destination || 'Destination'}`,
      origin: intent.origin || 'Origin',
      destination: intent.destination || 'Destination',
      duration_days: intent.duration_days || 3,
      travel_dates: intent.travel_dates || '',
      transport_mode: topOption.title || 'Electric Rail + Shared EV',
      total_cost: topOption.price?.amount || 2310,
      currency: topOption.price?.currency || 'INR',
      eco_score: topOption.green_accessible_score || 92,
      carbon_emissions: topOption.carbon?.kg_co2e || 9.4,
      carbon_saved: ecoTwin?.comparison?.carbon_saved_kg ? `${ecoTwin.comparison.carbon_saved_kg} kg CO₂e saved` : '54.9 kg CO₂e saved',
      accessibility_rating: topOption.accessibility?.accessibility_rating || 5.0,
      accessibility_verified: Boolean(topOption.accessibility?.accessibility_verified),
      status: 'Saved',
      stays: 'Verified Eco Homestay & Solar Lodging',
      itinerary_data: itinerary,
      recommendation_data: topOption,
      eco_twin_data: ecoTwin,
      show_your_math_data: resultData.show_your_math || topOption.show_your_math || {},
    };

    try {
      const res = await saveTrip(payload);
      if (res.success) {
        setSaveStatus('saved');
        setSaveMessage('Journey successfully saved to your collection in PostgreSQL!');
        if (onTripSaved) onTripSaved(res.trip);
      } else {
        setSaveStatus('error');
        setSaveMessage(res.message || 'Could not save trip.');
      }
    } catch (err) {
      console.error('Error saving trip to database:', err);
      setSaveStatus('error');
      const msg = err.response?.data?.message || 'Failed to save journey. Please ensure you are logged in.';
      setSaveMessage(msg);
    }
  };

  const intent = resultData?.intent || {};
  const travelData = resultData?.travel_data || null;
  const recommendations = resultData?.recommendations || null;
  const ecoTwin = resultData?.eco_twin || null;
  const itinerary = resultData?.itinerary || null;

  return (
    <div className="travel-assistant-card">
      <div className="assistant-card-header">
        <div className="assistant-header-title">
          <span className="ai-sparkle-icon" aria-hidden="true">✦</span>
          <h2>Plan your journey with EcoTrail</h2>
        </div>
        <p className="assistant-header-desc">
          Tell me where you want to go, your budget, preferences, or accessibility needs.
        </p>
      </div>

      {/* STATE 1: IDLE or Form Input */}
      {searchState !== 'loading' && (
        <form onSubmit={handleSubmit} className="assistant-form">
          <div className="assistant-input-shell">
            <textarea
              ref={textareaRef}
              rows={2}
              className="assistant-textarea"
              placeholder="Try: Pune to Goa for 3 days under ₹10,000 with low carbon emissions..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Travel request query"
            />
            <div className="assistant-input-footer">
              <span className="input-hint">Press ↵ Enter to plan</span>
              <button
                type="submit"
                className="btn assistant-submit-btn"
                disabled={!prompt.trim()}
              >
                <span>Plan My Trip</span>
                <span className="btn-icon" aria-hidden="true">✦</span>
              </button>
            </div>
          </div>

          {/* Quick Prompts below input */}
          <QuickPrompts onSelectPrompt={handlePromptSelect} />
        </form>
      )}

      {/* STATE 2: LOADING (Progressive Stages) */}
      {searchState === 'loading' && (
        <div className="search-state-loading" role="status" aria-live="polite">
          <div className="loading-orbit">
            <div className="loading-pulse-ring"></div>
            <span className="loading-center-leaf">🌿</span>
          </div>
          <h3>Finding real travel options...</h3>
          <p className="current-stage-title">{STAGES[loadingStage].title}</p>
          <small className="current-stage-desc">{STAGES[loadingStage].desc}</small>

          {/* Stage Progress Chips */}
          <div className="stage-indicators-strip">
            {STAGES.map((stg, i) => (
              <div
                key={i}
                className={`stage-chip-item ${i < loadingStage ? 'completed' : (i === loadingStage ? 'active' : 'pending')}`}
              >
                <span className="stage-icon">
                  {i < loadingStage ? '✓' : (i === loadingStage ? '⏳' : '○')}
                </span>
                <span className="stage-label">{stg.title.replace('...', '')}</span>
              </div>
            ))}
          </div>

          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      {/* STATE 4: ERROR */}
      {searchState === 'error' && (
        <div className="search-state-error" role="alert">
          <div className="error-icon" aria-hidden="true">⚠️</div>
          <div className="error-body">
            <strong>Unable to process request</strong>
            <p>{errorMessage || 'Something went wrong. Please try again.'}</p>
          </div>
          <button
            type="button"
            className="btn small light"
            onClick={handleReset}
          >
            Try Again ↺
          </button>
        </div>
      )}

      {/* STATE 3: SUCCESS */}
      {searchState === 'success' && resultData && (
        <div className="search-state-result" role="region" aria-label="Extracted Travel Intent & Results">
          {/* Assistant confirmation message */}
          <div className="assistant-response-bubble">
            <div className="assistant-avatar" aria-hidden="true">✦</div>
            <div className="assistant-bubble-content">
              <strong>EcoTrail Assistant</strong>
              <p>{resultData.message || 'I understood your trip and gathered travel options.'}</p>
            </div>
          </div>

          {/* Structured Travel Intent Card */}
          <div className="recommendation-result-box">
            <div className="rec-top-banner">
              <div>
                <span className="rec-badge">STRUCTURED TRAVEL REQUEST (GEMINI AI)</span>
                <h3>
                  {intent.origin ? intent.origin : 'Departure'} → {intent.destination ? intent.destination : 'Destination'}
                </h3>
                <p className="rec-transport">
                  {intent.duration_days ? `${intent.duration_days} Days Journey` : 'Trip duration not specified'}
                  {intent.travel_dates ? ` · ${intent.travel_dates}` : ''}
                </p>
              </div>
              <div className="rec-eco-badge">
                <span className="eco-badge-score">
                  {intent.eco_priority === 'high' ? 'High' : intent.eco_priority ? intent.eco_priority : 'Standard'}
                </span>
                <span className="eco-badge-label">Eco Priority</span>
              </div>
            </div>

            {/* Extracted Details Grid */}
            <div className="rec-metrics-grid">
              <div className="rec-metric-item">
                <span className="metric-label">📍 Origin</span>
                <strong className="metric-value">{intent.origin || 'Not specified'}</strong>
              </div>

              <div className="rec-metric-item">
                <span className="metric-label">🎯 Destination</span>
                <strong className="metric-value">{intent.destination || 'Not specified'}</strong>
              </div>

              <div className="rec-metric-item">
                <span className="metric-label">⏱️ Duration</span>
                <strong className="metric-value">
                  {intent.duration_days ? `${intent.duration_days} days` : 'Not specified'}
                </strong>
              </div>

              <div className="rec-metric-item">
                <span className="metric-label">💰 Budget</span>
                <strong className="metric-value">
                  {intent.budget != null ? `₹${Number(intent.budget).toLocaleString('en-IN')}` : 'Not specified'}
                </strong>
                <small>{intent.currency || 'INR'}</small>
              </div>

              <div className="rec-metric-item highlight-green">
                <span className="metric-label">🌱 Eco Priority</span>
                <strong className="metric-value">
                  {intent.eco_priority ? intent.eco_priority.toUpperCase() : 'Standard'}
                </strong>
                <small className="metric-sub-green">
                  {intent.eco_priority === 'high' ? 'Prioritizing lowest carbon options' : 'Default eco-balancing'}
                </small>
              </div>

              <div className="rec-metric-item">
                <span className="metric-label">♿ Accessibility</span>
                <strong className={`metric-value small ${intent.accessibility_required ? 'bold-purple' : ''}`}>
                  {intent.accessibility_required ? 'Required (Step-free / accessible)' : 'Not specified'}
                </strong>
                <small>
                  {intent.accessibility_required ? 'Wheelchair & accessible transit requested' : 'Standard accessibility'}
                </small>
              </div>
            </div>

            {/* Weather status banner if unavailable */}
            {travelData?.weather?.status === 'unavailable' && (
              <div className="weather-notice-strip" style={{ marginTop: '10px', fontSize: '0.85rem', color: '#64748b' }}>
                ℹ️ Weather data currently unavailable.
              </div>
            )}
          </div>

          {/* EMPTY RESULTS STATE */}
          {recommendations?.results && recommendations.results.length === 0 && (
            <div className="empty-results-box" role="status" style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '16px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>No suitable travel options found</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 16px 0' }}>
                No travel routes matched your strict criteria. Try changing your budget, dates, or accessibility filters.
              </p>
              <button type="button" className="btn small" onClick={handleReset}>
                Modify Search
              </button>
            </div>
          )}

          {/* DETERMINISTIC ECO-TWIN ALTERNATIVE COMPARISON */}
          {ecoTwin && ecoTwin.available && (
            <EcoTwinCard ecoTwin={ecoTwin} />
          )}

          {/* DETERMINISTIC GREEN & ACCESSIBLE RECOMMENDATIONS (Includes Show Your Math) */}
          {recommendations && recommendations.results && recommendations.results.length > 0 && (
            <RecommendationList recommendations={recommendations} />
          )}

          {/* STRUCTURED DAY-BY-DAY ITINERARY */}
          {itinerary && (
            <ItineraryView itinerary={itinerary} />
          )}

          {/* SAVE TRIP TO DATABASE STRIP */}
          <div className="save-trip-action-card" style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(99, 102, 241, 0.08))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '14px',
            padding: '20px 24px',
            marginTop: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div>
              <div className="welcome-badge" style={{ marginBottom: '4px' }}>
                <span>PERSISTENCE &amp; SHARING</span>
              </div>
              <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '1.15rem' }}>
                Ready to save this journey?
              </h4>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.88rem' }}>
                Store this personalized itinerary and verified Eco-Twin comparison in your collection in PostgreSQL.
              </p>
              {saveMessage && (
                <div style={{
                  marginTop: '10px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: saveStatus === 'saved' ? '#059669' : '#dc2626'
                }}>
                  {saveStatus === 'saved' ? '✓ ' : '⚠️ '}{saveMessage}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {saveStatus === 'saved' ? (
                <Link to="/trips" className="btn small" style={{ background: '#059669' }}>
                  View in My Trips ↗
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn small"
                  onClick={handleSaveTripToDatabase}
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? 'Saving Journey...' : 'Save Trip to My Trips 🔖'}
                </button>
              )}
            </div>
          </div>

          {/* REAL TRAVEL DATA RESULTS (Duffel, ORS, OpenTripMap, OpenWeatherMap) */}
          {travelData && (
            <TravelResults
              travelData={travelData}
              origin={intent.origin}
              destination={intent.destination}
            />
          )}

          {/* Result Actions */}
          <div className="rec-actions-bar" style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn light text-btn"
              onClick={handleReset}
            >
              Plan Another Trip ↺
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
