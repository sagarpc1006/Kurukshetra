import React, { useRef, useState } from 'react';
import AppNavbar from '../components/AppNavbar';
import WelcomeSection from '../components/WelcomeSection';
import TravelAssistant from '../components/TravelAssistant';
import TravelPreferencesCard from '../components/TravelPreferencesCard';
import RecentTrips from '../components/RecentTrips';
import EcoScore from '../components/EcoScore';
import EcoImpactCard from '../components/EcoImpactCard';

export default function Home() {
  const assistantRef = useRef(null);
  const [activePrompt, setActivePrompt] = useState('');

  const scrollToAssistant = (customPrompt) => {
    if (typeof customPrompt === 'string' && customPrompt.trim()) {
      setActivePrompt(customPrompt);
    }
    if (assistantRef.current) {
      assistantRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTriggerPrompt = (promptText) => {
    setActivePrompt(promptText);
    if (assistantRef.current) {
      assistantRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="authenticated-home-shell">
      {/* A. Top Navigation Bar */}
      <AppNavbar />

      <main className="authenticated-home-main" id="main-content">
        <div className="home-content-container">
          {/* B. Welcome Section */}
          <WelcomeSection />

          {/* Core 2-Column Responsive Workspace */}
          <div className="home-dashboard-layout">
            {/* Left Primary Column: AI Travel Assistant + Recent Trips */}
            <section className="dashboard-primary-col" ref={assistantRef}>
              {/* C. Main AI Travel Assistant & D. Quick Prompts */}
              <TravelAssistant externalPrompt={activePrompt} />

              {/* F. Recent Trips */}
              <RecentTrips onPlanTripClick={scrollToAssistant} />
            </section>

            {/* Right Secondary Column: Eco Score, Eco Impact & Travel Preferences */}
            <aside className="dashboard-secondary-col" aria-label="Website Features & Overview">
              {/* EcoTrail Score Ring (Section 12) */}
              <EcoScore />

              {/* G. Eco Impact Summary (Section 11) */}
              <EcoImpactCard />

              {/* E. Travel Preference Summary (Section 9) */}
              <TravelPreferencesCard />
            </aside>
          </div>
        </div>
      </main>

      {/* H. Minimal Bottom Area / Footer */}
      <footer className="authenticated-minimal-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-dot">◉</span>
            <strong>EcoTrail</strong>
            <span> · Better journeys leave lighter footprints</span>
          </div>
          <div className="footer-meta">
            <span>Accessible &amp; Low-Impact Travel Engine</span>
            <span>© {new Date().getFullYear()} EcoTrail</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
