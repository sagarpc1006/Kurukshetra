import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const QUESTIONS = [
  {
    id: 'style',
    title: 'What kind of travel inspires you most?',
    subtitle: 'This helps our AI prioritize destinations that match your energy and wanderlust.',
    options: [
      {
        id: 'nature',
        label: 'Eco-Sanctuaries & Nature',
        desc: 'National parks, lush forests, wildlife trails & green retreats',
        icon: '🌿',
      },
      {
        id: 'culture',
        label: 'Heritage & Culture',
        desc: 'Historic forts, ancient temples, artisan hubs & rich traditions',
        icon: '🏛️',
      },
      {
        id: 'beach',
        label: 'Coastal & Ocean Calm',
        desc: 'Pristine shores, tranquil backwaters & coastal slow days',
        icon: '🏖️',
      },
      {
        id: 'mountains',
        label: 'Mountain Escapes & Treks',
        desc: 'High-altitude ridges, serene hill stations & scenic valleys',
        icon: '🏔️',
      },
    ],
  },
  {
    id: 'ecoPriority',
    title: 'How important is sustainability to your travel choices?',
    subtitle: 'We calibrate our Eco-Twin recommendations to respect your carbon footprint goals.',
    options: [
      {
        id: 'High',
        label: 'High Priority (Lowest CO₂)',
        desc: 'Always recommend scenic trains, low-carbon transit & verified eco-stays',
        icon: '♧',
        badge: 'Recommended',
      },
      {
        id: 'Moderate',
        label: 'Balanced & Practical',
        desc: 'Choose sustainable options when practical without major travel delays',
        icon: '⚖️',
      },
      {
        id: 'Standard',
        label: 'Flexible',
        desc: 'Keep all standard travel options open, highlighting greener choices',
        icon: '☼',
      },
    ],
  },
  {
    id: 'budget',
    title: 'What is your typical budget per journey?',
    subtitle: 'We use this to find the best balance of value, comfort, and sustainability.',
    options: [
      {
        id: '8000',
        label: 'Pocket-Friendly',
        val: 'Under ₹10,000',
        desc: 'Sleeper trains, eco-hostels & smart budget exploration',
        icon: '🪙',
      },
      {
        id: '18000',
        label: 'Comfort & Value',
        val: '₹10,000 – ₹25,000',
        desc: '3AC/2AC trains, boutique homestays & guided eco-tours',
        icon: '💳',
      },
      {
        id: '35000',
        label: 'Premium Green',
        val: '₹25,000 – ₹50,000',
        desc: 'Vande Bharat / 1AC, certified heritage resorts & bespoke trips',
        icon: '💎',
      },
      {
        id: '75000',
        label: 'Luxury & Splurge',
        val: '₹50,000+',
        desc: 'Luxury sustainable villas, private electric transfers & finest stays',
        icon: '👑',
      },
    ],
  },
  {
    id: 'transport',
    title: 'What is your preferred mode of transport?',
    subtitle: 'EcoTrail loves scenic, low-emission travel. Tell us how you prefer to get there.',
    options: [
      {
        id: 'Train',
        label: 'Scenic Railways & Express Trains',
        desc: 'Vande Bharat, Konkan Railway, sleeper journeys with breathtaking views',
        icon: '🚆',
      },
      {
        id: 'Public Transport',
        label: 'Electric & Shared Buses',
        desc: 'Intercity electric coaches, state transit & shared eco-shuttles',
        icon: '🚌',
      },
      {
        id: 'Road Trip',
        label: 'Road Trips & Car Rentals',
        desc: 'Flexible driving routes, electric vehicle road trips & weekend escapes',
        icon: '🚗',
      },
      {
        id: 'Flight',
        label: 'Fast Flights for Long Distance',
        desc: 'Quick direct connections when time is critical, with carbon offsets',
        icon: '✈️',
      },
    ],
  },
  {
    id: 'accessibility',
    title: 'Do you have any accessibility requirements?',
    subtitle: 'Every traveler deserves dignified access. We verify ramps, lifts, and step-free routes.',
    options: [
      {
        id: 'none',
        label: 'Standard Access (No specific needs)',
        desc: 'Standard walking routes, stairs and regular transport are suitable',
        icon: '🚶',
      },
      {
        id: 'wheelchair',
        label: 'Wheelchair Accessible Routes',
        desc: 'Require step-free access, wheelchair ramps, wide doors & elevators',
        icon: '♿',
      },
      {
        id: 'step_free',
        label: 'Step-Free & Elevator Access',
        desc: 'Prefer lifts, escalators and zero-step boarding where available',
        icon: '🛗',
      },
      {
        id: 'reduced_walking',
        label: 'Reduced Walking Distance',
        desc: 'Prefer short transfer walks, direct pickup points & minimal pacing',
        icon: '⏱️',
      },
    ],
  },
  {
    id: 'group',
    title: 'Who do you usually travel with?',
    subtitle: 'This helps us tune group sizes, seat selections, and itinerary paces.',
    options: [
      {
        id: 'solo',
        label: 'Solo Explorer',
        desc: 'Independent adventures, flexible scheduling & meeting other travelers',
        icon: '🎒',
      },
      {
        id: 'couple',
        label: 'Couple / Duo',
        desc: 'Romantic getaways, calm escapes & quality time together',
        icon: '👫',
      },
      {
        id: 'family',
        label: 'Family & Children / Elders',
        desc: 'Multi-generational comfort, safe paces & verified amenities',
        icon: '👨‍👩‍👧',
      },
      {
        id: 'friends',
        label: 'Group of Friends',
        desc: 'Lively group itineraries, shared cabins, road trips & adventure',
        icon: '👥',
      },
    ],
  },
  {
    id: 'homeCity',
    title: 'Where do you usually start your journeys from?',
    subtitle: 'Your home base lets us calculate real train timings, routes, and carbon savings.',
    isCityPicker: true,
    cities: [
      'Mumbai',
      'Delhi',
      'Bengaluru',
      'Pune',
      'Hyderabad',
      'Chennai',
      'Kolkata',
      'Ahmedabad',
      'Jaipur',
      'Goa',
    ],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    style: 'nature',
    ecoPriority: 'High',
    budget: '18000',
    transport: 'Train',
    accessibility: 'none',
    group: 'solo',
    homeCity: 'Mumbai',
    customCity: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = QUESTIONS.length;
  const currentQ = QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  const handleSelectOption = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: value,
    }));
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const homeCityVal =
        answers.homeCity === 'other'
          ? (answers.customCity || 'Mumbai').trim()
          : answers.homeCity;

      const profilePayload = {
        eco_priority: answers.ecoPriority,
        budget_preference: parseInt(answers.budget, 10) || 18000,
        preferred_transport: answers.transport,
        home_city: homeCityVal,
      };

      // 1. Persist to Django UserProfile in PostgreSQL
      try {
        await api.post('/api/profile/', profilePayload);
      } catch (err) {
        console.warn('Backend profile update note:', err.message);
      }

      // 2. If accessibility options were chosen, persist to Django AccessibilityProfile
      if (answers.accessibility !== 'none') {
        try {
          const accPayload = {
            wheelchair_required: answers.accessibility === 'wheelchair',
            step_free_required:
              answers.accessibility === 'step_free' ||
              answers.accessibility === 'wheelchair',
            reduced_walking: answers.accessibility === 'reduced_walking',
            accessible_venue_required: answers.accessibility === 'wheelchair',
          };
          await api.post('/api/accessibility/profile/', accPayload);
        } catch (err) {
          console.warn('Backend accessibility profile note:', err.message);
        }
      }

      // 3. Update localStorage session & user preferences cache
      const prefData = {
        ecoPriority: answers.ecoPriority,
        budget: `₹${parseInt(answers.budget, 10).toLocaleString()}`,
        transportPreference: answers.transport,
        accessibility:
          answers.accessibility === 'none' ? 'Standard' : 'Special Assistance Required',
        homeCity: homeCityVal,
        travelStyle: answers.style,
        travelGroup: answers.group,
      };
      localStorage.setItem('ecotrail_user_preferences', JSON.stringify(prefData));

      if (user?.uid) {
        localStorage.setItem(`ecotrail_onboarding_completed_${user.uid}`, 'true');
      }

      // 4. Update session object in localStorage so Home picks it up immediately
      const savedSession = localStorage.getItem('ecotrail_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          parsed.profile = {
            ...(parsed.profile || {}),
            eco_priority: answers.ecoPriority,
            budget_preference: parseInt(answers.budget, 10),
            preferred_transport: answers.transport,
            home_city: homeCityVal,
          };
          localStorage.setItem('ecotrail_session', JSON.stringify(parsed));
        } catch (e) {}
      }

      // 5. Navigate to Dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      navigate('/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (user?.uid) {
      localStorage.setItem(`ecotrail_onboarding_completed_${user.uid}`, 'true');
    }
    navigate('/dashboard', { replace: true });
  };

  const displayName =
    user?.displayName || profile?.name || user?.email?.split('@')[0] || 'Traveler';

  return (
    <div className="onboarding-page-wrapper">
      {/* Background Ambience */}
      <div className="onboarding-ambient-bg">
        <div className="onboarding-glow top-glow" />
        <div className="onboarding-glow bottom-glow" />
      </div>

      <header className="onboarding-header">
        <div className="onboarding-header-inner">
          <div className="logo">
            <span>●</span> EcoTrail <span>2.0</span>
          </div>
          <div className="onboarding-header-actions">
            <span className="onboarding-user-badge">
              👋 Welcome, {displayName}
            </span>
            <button
              type="button"
              className="onboarding-skip-btn"
              onClick={handleSkip}
            >
              Skip to Dashboard →
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="onboarding-progress-track">
          <div
            className="onboarding-progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      <main className="onboarding-main">
        <div className="onboarding-container">
          <div className="onboarding-step-indicator">
            <span className="onboarding-step-pill">
              QUESTION {currentStep + 1} OF {totalSteps}
            </span>
            <span className="onboarding-step-pct">{progressPercent}% complete</span>
          </div>

          <div className="onboarding-card">
            <h1 className="onboarding-title">{currentQ.title}</h1>
            <p className="onboarding-subtitle">{currentQ.subtitle}</p>

            {/* Render City Picker for Q7 or Option Cards for Q1-Q6 */}
            {currentQ.isCityPicker ? (
              <div className="onboarding-city-picker">
                <div className="onboarding-city-grid">
                  {currentQ.cities.map((city) => {
                    const isSelected =
                      answers.homeCity === city;
                    return (
                      <button
                        key={city}
                        type="button"
                        className={`onboarding-city-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setAnswers((prev) => ({
                            ...prev,
                            homeCity: city,
                          }));
                        }}
                      >
                        <span className="city-pin">⌖</span>
                        <span className="city-name">{city}</span>
                        {isSelected && <span className="city-check">✓</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="onboarding-custom-city">
                  <label htmlFor="custom-city-input">
                    Starting from another city?
                  </label>
                  <div className="input-icon">
                    <span>📍</span>
                    <input
                      id="custom-city-input"
                      type="text"
                      placeholder="Type your departure city (e.g. Chandigarh, Kochi, Jaipur)"
                      value={answers.customCity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAnswers((prev) => ({
                          ...prev,
                          homeCity: 'other',
                          customCity: val,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="onboarding-options-grid">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`onboarding-option-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(opt.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSelectOption(opt.id);
                        }
                      }}
                    >
                      <div className="option-icon-wrap">
                        <span className="option-icon">{opt.icon}</span>
                      </div>
                      <div className="option-text-wrap">
                        <div className="option-header-row">
                          <h3 className="option-label">{opt.label}</h3>
                          {opt.val && <span className="option-val-tag">{opt.val}</span>}
                          {opt.badge && (
                            <span className="option-badge">{opt.badge}</span>
                          )}
                        </div>
                        <p className="option-desc">{opt.desc}</p>
                      </div>
                      <div className="option-radio-indicator">
                        <div className="radio-inner" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="onboarding-footer">
              <button
                type="button"
                className="onboarding-back-btn"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                ← Back
              </button>

              <div className="onboarding-footer-right">
                <button
                  type="button"
                  className="btn onboarding-next-btn"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Personalizing your experience...'
                  ) : currentStep === totalSteps - 1 ? (
                    <>Complete &amp; Open Dashboard <b>→</b></>
                  ) : (
                    <>Continue <b>→</b></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
