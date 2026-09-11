import React from 'react';

export default function WelcomeSection() {
  return (
    <section className="welcome-hero-section">
      <div className="welcome-badge">
        <span className="sparkle">✦</span>
        <span>AI-FIRST SUSTAINABLE TRAVEL PLANNER</span>
      </div>
      <h1 className="welcome-title">
        Where do you want to go? <span className="leaf-emoji">🌱</span>
      </h1>
      <p className="welcome-subtitle">
        Plan smarter journeys that are greener, more accessible, and tailored to you.
      </p>
    </section>
  );
}
