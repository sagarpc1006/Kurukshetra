import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  EcoTrailBrandLogo,
  MountainIllustration,
  BeachIllustration,
  ForestIllustration,
  CityIllustration,
  AdventureIllustration,
  RelaxationIllustration,
  ExplorationIllustration,
  NightlifeIllustration,
  NatureFirstIllustration,
  CultureFirstIllustration,
  FoodFirstIllustration,
  ActivitiesFirstIllustration,
  SpontaneousIllustration,
  WellPlannedIllustration,
  FastPacedIllustration,
  SlowEasyIllustration,
  GreenerTransitIllustration,
  CheaperTransitIllustration,
  FasterTransitIllustration,
  ComfortTransitIllustration,
  DefinitelyGreenIllustration,
  ReasonableGreenIllustration,
  SimilarGreenIllustration,
  LowerImpactIllustration,
  LowerCostIllustration,
  BetterExpIllustration,
  OverallBalanceIllustration,
} from '../components/QuestionIllustrations';

const QUESTIONS = [
  {
    id: 'q1',
    title: 'If you could escape anywhere this weekend, where would you go?',
    options: [
      { id: 'mountains', label: 'Mountains', Illustration: MountainIllustration },
      { id: 'beach', label: 'Beach', Illustration: BeachIllustration },
      { id: 'forest', label: 'Forest', Illustration: ForestIllustration },
      { id: 'city', label: 'City', Illustration: CityIllustration },
    ],
  },
  {
    id: 'q2',
    title: 'What kind of trip sounds most like you?',
    options: [
      { id: 'adventure', label: 'Adventure', Illustration: AdventureIllustration },
      { id: 'relaxation', label: 'Peace & relaxation', Illustration: RelaxationIllustration },
      { id: 'exploration', label: 'Exploration', Illustration: ExplorationIllustration },
      { id: 'nightlife', label: 'Fun & nightlife', Illustration: NightlifeIllustration },
    ],
  },
  {
    id: 'q3',
    title: 'You reach a new destination. What do you want to experience first?',
    options: [
      { id: 'nature', label: 'Nature', Illustration: NatureFirstIllustration },
      { id: 'culture', label: 'Local culture', Illustration: CultureFirstIllustration },
      { id: 'food', label: 'Local food', Illustration: FoodFirstIllustration },
      { id: 'activities', label: 'Activities', Illustration: ActivitiesFirstIllustration },
    ],
  },
  {
    id: 'q4',
    title: 'How do you like to travel?',
    options: [
      { id: 'spontaneous', label: 'Spontaneously', Illustration: SpontaneousIllustration },
      { id: 'planned', label: 'Well-planned', Illustration: WellPlannedIllustration },
      { id: 'fast_paced', label: 'Fast-paced', Illustration: FastPacedIllustration },
      { id: 'slow_easy', label: 'Slow & easy', Illustration: SlowEasyIllustration },
    ],
  },
  {
    id: 'q5',
    title: 'When choosing how to reach your destination, what would you prefer?',
    options: [
      { id: 'greener', label: 'Greener option', Illustration: GreenerTransitIllustration },
      { id: 'cheaper', label: 'Cheaper option', Illustration: CheaperTransitIllustration },
      { id: 'faster', label: 'Faster option', Illustration: FasterTransitIllustration },
      { id: 'comfortable', label: 'More comfortable option', Illustration: ComfortTransitIllustration },
    ],
  },
  {
    id: 'q6',
    title: 'Would you choose a greener option if it took a little longer?',
    options: [
      { id: 'definitely', label: 'Definitely', Illustration: DefinitelyGreenIllustration },
      { id: 'reasonable', label: 'If it’s reasonable', Illustration: ReasonableGreenIllustration },
      { id: 'similar', label: 'Only if everything else is similar', Illustration: SimilarGreenIllustration },
    ],
  },
  {
    id: 'q7',
    title: 'What should EcoTrail prioritize when planning your trip?',
    options: [
      { id: 'lower_impact', label: 'Lower impact', Illustration: LowerImpactIllustration },
      { id: 'lower_cost', label: 'Lower cost', Illustration: LowerCostIllustration },
      { id: 'better_exp', label: 'Better experience', Illustration: BetterExpIllustration },
      { id: 'overall_balance', label: 'Best overall balance', Illustration: OverallBalanceIllustration },
    ],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    q1: 'mountains',
    q2: 'adventure',
    q3: 'nature',
    q4: 'planned',
    q5: 'greener',
    q6: 'definitely',
    q7: 'overall_balance',
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
      // Map cleanly into backend fields without touching backend code
      const ecoPriority =
        answers.q7 === 'lower_impact' || answers.q6 === 'definitely'
          ? 'high'
          : answers.q7 === 'lower_cost'
          ? 'moderate'
          : 'high';

      let budgetPref = 15000;
      if (answers.q7 === 'lower_cost' || answers.q5 === 'cheaper') budgetPref = 8000;
      else if (answers.q7 === 'better_exp' || answers.q5 === 'comfortable') budgetPref = 35000;

      let prefTransport = 'Train';
      if (answers.q5 === 'greener') prefTransport = 'Train';
      else if (answers.q5 === 'cheaper') prefTransport = 'Public Transport';
      else if (answers.q5 === 'faster') prefTransport = 'Flight';
      else if (answers.q5 === 'comfortable') prefTransport = 'Scenic Train';

      const profilePayload = {
        eco_priority: ecoPriority,
        budget_preference: budgetPref,
        preferred_transport: prefTransport,
      };

      // 1. Persist to Django UserProfile in PostgreSQL
      try {
        await api.post('/api/profile/', profilePayload);
      } catch (err) {
        console.warn('Backend profile update note:', err.message);
      }

      // 2. Update user preferences in localStorage
      const prefData = {
        destinationVibe: answers.q1,
        tripStyle: answers.q2,
        firstExperience: answers.q3,
        travelPace: answers.q4,
        transitPreference: answers.q5,
        greenPatience: answers.q6,
        corePriority: answers.q7,
        ecoPriority: ecoPriority === 'high' ? 'High' : 'Moderate',
        budget: `₹${budgetPref.toLocaleString()}`,
        transportPreference: prefTransport,
        accessibility: 'Standard',
      };
      localStorage.setItem('ecotrail_user_preferences', JSON.stringify(prefData));

      if (user?.uid) {
        localStorage.setItem(`ecotrail_onboarding_completed_${user.uid}`, 'true');
        localStorage.setItem(
          `ecotrail_onboarding_answers_${user.uid}`,
          JSON.stringify(answers)
        );
      }

      // 3. Update session object in localStorage so Home/Dashboard reflects it immediately
      const savedSession = localStorage.getItem('ecotrail_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          parsed.profile = {
            ...(parsed.profile || {}),
            eco_priority: ecoPriority,
            budget_preference: budgetPref,
            preferred_transport: prefTransport,
          };
          localStorage.setItem('ecotrail_session', JSON.stringify(parsed));
        } catch (e) {}
      }

      // 4. Navigate to Dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      navigate('/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
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
          {/* Logo shifted to the far left corner - slightly bigger */}
          <div className="onboarding-logo-corner">
            <EcoTrailBrandLogo size={38} fontSize="26px" color="#0b6c57" />
          </div>

          {/* Welcome badge shifted to the right side */}
          <div className="onboarding-header-actions">
            <span className="onboarding-user-badge">
              👋 Welcome, {displayName}
            </span>
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
            {/* Question title without small-font theory or subtitle */}
            <h1 className="onboarding-title clean-title">{currentQ.title}</h1>

            <div className="onboarding-options-grid">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.id;
                const IllustrationComponent = opt.Illustration;

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
                    {/* Illustrated Vector Icon beside the specific option */}
                    <div className="option-icon-wrap illustrated">
                      <IllustrationComponent />
                    </div>

                    {/* Specific option title only - no extra theory or description */}
                    <div className="option-text-wrap">
                      <h3 className="option-label clean-label">{opt.label}</h3>
                    </div>

                    <div className="option-radio-indicator">
                      <div className="radio-inner" />
                    </div>
                  </div>
                );
              })}
            </div>

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
