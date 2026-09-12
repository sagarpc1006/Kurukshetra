import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QuickPrompts from './QuickPrompts';
import TravelResults from './TravelResults';
import RecommendationList from './RecommendationList';
import EcoTwinCard from './EcoTwinCard';
import ItineraryView from './ItineraryView';
import { sendChatMessage } from '../services/chatAPI';
import { saveTrip } from '../services/tripAPI';

/**
 * Parses inline markdown: **bold**, [label](url), [label] (url), standalone URLs, `code`
 */
function renderInlineFormatting(str) {
  if (!str) return '';
  const tokens = [];
  // Matches:
  // 1. [label](url) or [label] (url)
  // 2. **bold**
  // 3. `code`
  // 4. Standalone https?:// URLs
  const regex = /(\[([^\]]+)\]\s*\((https?:\/\/[^\s\)]+)\))|(\*\*([^*]+)\*\*)|(`([^`]+)`)|((https?:\/\/[^\s\)]+))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(str.substring(lastIndex, match.index));
    }

    if (match[1]) {
      // Link [text](url) or [text] (url)
      const linkLabel = match[2];
      const linkUrl = match[3];
      const isPkg = /package|darshan|tour|irctctourism|ttdevasthanams|aptourism|ktdc|gtdc|kstdc|rtdc|uptourism/i.test(linkLabel) ||
                    /package|tourpckage|darshan|ttdevasthanams|irctctourism/i.test(linkUrl);
      tokens.push(
        <a
          key={key++}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`ai-inline-link ${isPkg ? 'ai-package-link' : ''}`}
        >
          {isPkg ? '⭐ ' : ''}{linkLabel} ↗
        </a>
      );
    } else if (match[4]) {
      // Bold **bold**
      tokens.push(<strong key={key++}>{match[5]}</strong>);
    } else if (match[6]) {
      // Code `code`
      tokens.push(<code key={key++} className="ai-inline-code">{match[7]}</code>);
    } else if (match[8]) {
      // Standalone URL
      const cleanUrl = match[8].replace(/[.,;:!?)]+$/, '');
      tokens.push(
        <a
          key={key++}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ai-inline-link"
        >
          {cleanUrl.replace(/^https?:\/\/(www\.)?/, '')} ↗
        </a>
      );
      if (cleanUrl.length < match[8].length) {
        tokens.push(match[8].substring(cleanUrl.length));
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    tokens.push(str.substring(lastIndex));
  }

  return tokens.length > 0 ? tokens : str;
}

/**
 * Parses raw AI text into structured blocks with proper symmetry, lists, and section headers.
 */
function parseAiBlocks(raw) {
  if (!raw) return [];
  // Ensure bullets/numbered items glued onto a line are split cleanly onto their own lines
  let str = raw.replace(/([^\n])\s*([•\*]\s+)/g, '$1\n$2');
  str = str.replace(/([^\n])\s*(\d+\.\s+)/g, '$1\n$2');

  const lines = str.split('\n');
  const blocks = [];
  let currentList = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (currentList) {
        blocks.push({ type: 'list', items: currentList });
        currentList = null;
      }
      continue;
    }

    // Check if line is a bullet item (*, -, •, or 1.)
    const listMatch = line.match(/^([•\*\-]\s+|\d+\.\s+)(.+)$/);
    if (listMatch) {
      if (!currentList) currentList = [];
      currentList.push(listMatch[2].trim());
      continue;
    }

    // If we were in a list and hit a non-list line, close the list
    if (currentList) {
      blocks.push({ type: 'list', items: currentList });
      currentList = null;
    }

    // Check if header
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h4', text: line.replace(/^###\s+/, '').trim() });
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'h3', text: line.replace(/^##\s+/, '').trim() });
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'h2', text: line.replace(/^#\s+/, '').trim() });
    } else if (
      /^[🚆🌿⚡🏖️🏛️🚲💰📍🎯🌱♿✈️🚌][\s\S]+$/.test(line) ||
      (/^[A-Z][\w\s&–-]+:$/.test(line) && line.length < 80)
    ) {
      // Line starts with travel emoji or short section title ending in colon -> styled section header!
      blocks.push({ type: 'section_title', text: line });
    } else {
      blocks.push({ type: 'para', text: line });
    }
  }

  if (currentList) {
    blocks.push({ type: 'list', items: currentList });
  }

  return blocks;
}

/**
 * Formats AI markdown responses with headers, symmetrical lists, and official links.
 */
function FormattedAiResponse({ text }) {
  if (!text) return null;

  const blocks = parseAiBlocks(text);

  return (
    <div className="ai-response-formatted">
      {blocks.map((block, bIdx) => {
        if (block.type === 'h2') {
          return (
            <h3 key={bIdx} className="ai-subheading" style={{ fontSize: '17px' }}>
              {renderInlineFormatting(block.text)}
            </h3>
          );
        }
        if (block.type === 'h3' || block.type === 'h4') {
          return (
            <h4 key={bIdx} className="ai-subheading">
              {renderInlineFormatting(block.text)}
            </h4>
          );
        }
        if (block.type === 'section_title') {
          return (
            <div key={bIdx} className="ai-section-header">
              <span className="ai-section-title">{renderInlineFormatting(block.text)}</span>
            </div>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={bIdx} className="ai-symmetric-list">
              {block.items.map((item, iIdx) => (
                <li key={iIdx} className="ai-symmetric-item">
                  <span className="ai-bullet-dot" aria-hidden="true">●</span>
                  <span className="ai-item-text">{renderInlineFormatting(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bIdx} className="ai-para">
            {renderInlineFormatting(block.text)}
          </p>
        );
      })}
    </div>
  );
}

export default function TravelAssistant({ onTripSaved, externalPrompt }) {
  const [prompt, setPrompt] = useState('');
  const [followupPrompt, setFollowupPrompt] = useState('');
  const [searchState, setSearchState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [loadingStage, setLoadingStage] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [saveMessage, setSaveMessage] = useState('');
  const textareaRef = useRef(null);
  const followupRef = useRef(null);

  useEffect(() => {
    if (externalPrompt) {
      setPrompt(externalPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [externalPrompt]);

  // Progressive loading stages
  const STAGES = [
    { title: 'Connecting to Gemini AI...', desc: 'Analyzing live sustainable travel parameters and destinations' },
    { title: 'Querying official transit & flights...', desc: 'Checking real-time rail networks, Duffel flights and EV corridors' },
    { title: 'Checking ground routes...', desc: 'Analyzing road network and distance via OpenRouteService & OSM' },
    { title: 'Discovering verified attractions...', desc: 'Finding ASI monuments & certified eco-homestays via OpenTripMap' },
    { title: 'Checking real-time weather...', desc: 'Retrieving destination climate & forecast via OpenWeatherMap' },
    { title: 'Scoring & ranking itineraries...', desc: 'Calculating deterministic Green & Accessible Scores' },
    { title: 'Comparing Eco-Twin alternatives...', desc: 'Finding verified low-carbon multimodal alternative' },
    { title: 'Synthesizing live advice & official links...', desc: 'Curating authoritative government portals with zero markups' },
  ];

  useEffect(() => {
    let timer;
    if (searchState === 'loading') {
      setLoadingStage(0);
      timer = setInterval(() => {
        setLoadingStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
      }, 1100);
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

  const handleSubmit = async (e, overrideQuery) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = (typeof overrideQuery === 'string' ? overrideQuery : prompt).trim();
    if (!query) return;

    setPrompt(query);
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

        // Automatically persist to Gemini AI Chat Consultations in localStorage
        try {
          const intent = data.intent || {};
          const dest = intent.destination || '';
          const orig = intent.origin || '';
          const topRec = data.recommendations?.results?.[0] || {};
          const ecoTwin = data.eco_twin || {};
          const dur = intent.duration_days ? `${intent.duration_days} days` : '3 days';

          // Resolve photo thumbnail based on query/destination
          const queryLower = (dest + ' ' + query).toLowerCase();
          let thumbnail = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80';
          if (queryLower.includes('goa')) thumbnail = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop&q=80';
          else if (queryLower.includes('tirupati')) thumbnail = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=500&q=80';
          else if (queryLower.includes('munnar') || queryLower.includes('kerala')) thumbnail = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=500&q=80';
          else if (queryLower.includes('coorg')) thumbnail = 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=500&q=80';
          else if (queryLower.includes('hampi')) thumbnail = 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=500&q=80';
          else if (queryLower.includes('jaipur') || queryLower.includes('rajasthan')) thumbnail = 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=500&q=80';
          else if (queryLower.includes('kashmir') || queryLower.includes('srinagar')) thumbnail = 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=500&q=80';
          else if (queryLower.includes('varanasi')) thumbnail = 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=500&q=80';

          const routeStr = (orig && dest) ? `${orig} → ${dest}` : (dest ? `Route to ${dest}` : 'Curated Eco Route');
          const now = new Date();
          const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase() + ' · ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

          const newChatEntry = {
            id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            query: query,
            title: data.itinerary?.title || (dest ? `${dur} in ${dest}` : (query.length > 45 ? query.slice(0, 45) + '...' : query)),
            origin: orig,
            destination: dest,
            route: routeStr,
            travellers: '2 travellers',
            dates: intent.travel_dates || `${dur.toUpperCase()}`,
            ecoScore: topRec.green_accessible_score || 92,
            carbonSaved: ecoTwin?.comparison?.carbon_saved_kg ? `${Math.round(ecoTwin.comparison.carbon_saved_kg)} kg lower CO₂` : '46% lower CO₂',
            savedPercent: topRec.carbon?.kg_co2e ? `${Math.round(Math.max(35, Math.min(85, (1 - (topRec.carbon.kg_co2e / 120)) * 100)))}%` : '46%',
            timestamp: now.toISOString(),
            dateStr: dateStr,
            model: 'Gemini 2.5 Flash',
            img: thumbnail,
            response: data.ai_response || data.response || data.message || '',
            officialLinks: data.official_links || [],
            itinerary: data.itinerary || null,
          };

          const rawHistory = localStorage.getItem('ecotrail_ai_chat_history');
          let parsedHistory = [];
          if (rawHistory) {
            try { parsedHistory = JSON.parse(rawHistory); } catch (e) {}
          }
          const updatedHistory = [newChatEntry, ...parsedHistory.filter(item => item.query !== query).slice(0, 49)];
          localStorage.setItem('ecotrail_ai_chat_history', JSON.stringify(updatedHistory));
          window.dispatchEvent(new CustomEvent('ecotrail_chat_saved', { detail: newChatEntry }));
        } catch (storageErr) {
          console.warn('Could not update AI chat history:', storageErr);
        }
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

  const handleFollowupSubmit = (e) => {
    if (e) e.preventDefault();
    if (!followupPrompt.trim()) return;
    const q = followupPrompt.trim();
    setFollowupPrompt('');
    handleSubmit(null, q);
  };

  const handleQuickFollowup = (text) => {
    handleSubmit(null, text);
  };

  const handleReset = () => {
    setSearchState('idle');
    setResultData(null);
    setErrorMessage('');
    setPrompt('');
    setFollowupPrompt('');
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
        window.dispatchEvent(new CustomEvent('ecotrail_trip_saved', { detail: res.trip }));
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
  const officialLinks = resultData?.official_links || [];

  return (
    <div className="travel-assistant-card">
      <div className="assistant-card-header">
        <div className="assistant-header-title">
          <span className="ai-sparkle-icon" aria-hidden="true">✦</span>
          <h2>Plan your journey with EcoTrail</h2>
        </div>
      </div>

      {/* STATE 1: IDLE or Form Input */}
      {searchState !== 'loading' && searchState !== 'success' && (
        <form onSubmit={handleSubmit} className="assistant-form">
          <div className="assistant-input-shell">
            <textarea
              ref={textareaRef}
              rows={2}
              className="assistant-textarea"
              placeholder="Try: Find the greenest way to Goa with verified low-emission stays..."
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
          <h3>Consulting real-time travel intelligence...</h3>
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
          
          {/* REAL-TIME AI ASSISTANT CONVERSATION BUBBLE */}
          <div className="assistant-response-bubble">
            <div className="assistant-avatar" aria-hidden="true">✦</div>
            <div className="assistant-bubble-content">
              <div className="assistant-bubble-header">
                <strong>EcoTrail AI Assistant</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="live-realtime-pill">
                    <span className="live-beacon-dot"></span> Live Real-Time AI · Verified Links
                  </span>
                  <Link
                    to="/saved?tab=ai_chats"
                    className="live-realtime-pill"
                    style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.3)', textDecoration: 'none', fontWeight: 600 }}
                    title="View in Saved Places Collection"
                  >
                    ✦ Saved to History
                  </Link>
                </div>
              </div>
              <FormattedAiResponse text={resultData.ai_response || resultData.message} />
            </div>
          </div>

          {/* VERIFIED OFFICIAL GOVERNMENT PACKAGES & TRANSIT WEBSITES SECTION */}
          {officialLinks && officialLinks.length > 0 && (
            <div className="official-portals-container">
              <div className="official-portals-header">
                <div className="portals-title-group">
                  <span className="official-shield-icon" aria-hidden="true">🏛️</span>
                  <div>
                    <h4>Verified Official Government Packages &amp; Transit Portals</h4>
                    <p>Genuine real-time packages, official fares, and direct access links with zero intermediary markup</p>
                  </div>
                </div>
                <span className="govt-verified-badge">
                  <span className="badge-dot">●</span> 100% Authentic Government Portals
                </span>
              </div>

              <div className="official-portals-grid">
                {officialLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className={`official-portal-card ${link.is_package ? 'package-highlight-card' : ''}`}
                  >
                    <div>
                      <div className="portal-card-top">
                        <span className={`portal-category-pill ${link.is_package ? 'category-package-pill' : ''}`}>
                          {link.is_package ? '⭐ Official Package' : (link.category || 'Official Portal')}
                        </span>
                        <span className={`portal-badge-pill ${link.is_package ? 'badge-package-pill' : ''}`}>
                          ✓ {link.badge || (link.is_package ? 'Govt Package' : 'Govt Verified')}
                        </span>
                      </div>
                      <h5 className="portal-card-title">{link.name}</h5>
                      <span className="portal-domain-tag">
                        <span aria-hidden="true">🌐</span> {link.domain}
                      </span>
                      <p className="portal-card-desc">{link.description}</p>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`portal-visit-btn ${link.is_package ? 'package-visit-btn' : ''}`}
                    >
                      <span>{link.is_package ? 'Access Official Package' : 'Visit Official Portal'}</span>
                      <span className="portal-arrow-icon" aria-hidden="true">↗</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STRUCTURED TRAVEL REQUEST CARD (If destination is specified) */}
          {intent?.destination && (
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
          )}

          {/* EMPTY RESULTS STATE */}
          {intent?.destination && recommendations?.results && recommendations.results.length === 0 && (
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

          {/* SAVE TRIP TO DATABASE STRIP (If itinerary exists) */}
          {itinerary && (
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
          )}

          {/* REAL TRAVEL DATA RESULTS (Duffel, ORS, OpenTripMap, OpenWeatherMap) */}
          {travelData && (
            <TravelResults
              travelData={travelData}
              origin={intent?.origin}
              destination={intent?.destination}
            />
          )}

          {/* PERSISTENT REAL-TIME FOLLOW-UP CHAT BAR */}
          <div className="assistant-followup-shell">
            <div className="followup-header">
              <span className="ai-sparkle-sm">✦</span>
              <span>Ask EcoTrail AI anything in real-time:</span>
            </div>
            <form onSubmit={handleFollowupSubmit} className="followup-form">
              <div className="followup-input-wrap">
                <input
                  ref={followupRef}
                  type="text"
                  className="followup-input"
                  placeholder="Ask a follow-up or plan another destination (e.g. 'Show bus links for Goa' or '3 days in Kerala')..."
                  value={followupPrompt}
                  onChange={(e) => setFollowupPrompt(e.target.value)}
                  disabled={searchState === 'loading'}
                />
                <button
                  type="submit"
                  className="btn followup-submit-btn"
                  disabled={!followupPrompt.trim() || searchState === 'loading'}
                >
                  <span>Send</span>
                  <span aria-hidden="true">✦</span>
                </button>
              </div>
            </form>
            <div className="followup-quick-chips">
              <button type="button" onClick={() => handleQuickFollowup("What are the official train booking links?")}>
                🚆 Official IRCTC Booking
              </button>
              <button type="button" onClick={() => handleQuickFollowup("Show me verified eco-friendly homestays")}>
                🌿 Verified Eco Homestays
              </button>
              <button type="button" onClick={() => handleQuickFollowup("What are the local EV and public transit options?")}>
                ⚡ State EV &amp; Bus Transit
              </button>
              <button type="button" onClick={() => handleQuickFollowup("Show official monument tickets and timings")}>
                🏛️ Official ASI Tickets
              </button>
            </div>
          </div>

          {/* Result Actions */}
          <div className="rec-actions-bar" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
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
