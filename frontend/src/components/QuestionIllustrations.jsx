import React from 'react';
export { EcoTrailBrandLogo } from './BrandLogo';

// ─────────────────────────────────────────────────────────────────────────────
// Question 1: If you could escape anywhere this weekend, where would you go?
// ─────────────────────────────────────────────────────────────────────────────

export function MountainIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="21" cy="7" r="3" fill="#f1aa67" opacity="0.85" />
      {/* Background Mountain */}
      <path d="M12 9L21 23H3L12 9Z" fill="#1b6256" />
      <path d="M12 9L15 14L13.5 15L12 13L10.5 15L9 14L12 9Z" fill="#cce96d" />
      {/* Foreground Mountain */}
      <path d="M18 13L25 23H11L18 13Z" fill="#0b6c57" />
      <path d="M18 13L20 16.5L19 17L18 16L17 17L16 16.5L18 13Z" fill="#eaf7ed" />
    </svg>
  );
}

export function BeachIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="10" r="4.5" fill="#f1aa67" />
      {/* Wave 1 */}
      <path d="M3 18C5.5 16.5 8.5 16.5 11 18C13.5 19.5 16.5 19.5 19 18C21.5 16.5 24.5 16.5 27 18" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      {/* Wave 2 */}
      <path d="M2 22C4.5 20.5 7.5 20.5 10 22C12.5 23.5 15.5 23.5 18 22C20.5 20.5 23.5 20.5 26 22" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
      {/* Palm leaf accent */}
      <path d="M21 7C20 9 22 12 24 13" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24 7C22.5 8.5 23 11 25 12" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ForestIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pine Tree Back */}
      <path d="M9 10L13 16H10.5L14 21H4L7.5 16H5L9 10Z" fill="#1b6256" />
      <rect x="8.2" y="21" width="1.6" height="3" fill="#658078" rx="0.5" />
      {/* Pine Tree Front */}
      <path d="M19 6L23.5 13H21L25 19H13L17 13H14.5L19 6Z" fill="#0b6c57" />
      <path d="M19 6L21 9.5H19L22 14.5H16L19 9.5H17L19 6Z" fill="#cce96d" opacity="0.4" />
      <rect x="18" y="19" width="2" height="4.5" fill="#507067" rx="0.8" />
    </svg>
  );
}

export function CityIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Skyline */}
      <rect x="4" y="11" width="6" height="13" rx="1" fill="#8ca89f" />
      <rect x="18" y="9" width="6" height="15" rx="1" fill="#69857c" />
      {/* Central Skyscraper */}
      <rect x="11" y="5" width="7" height="19" rx="1.5" fill="#0b6c57" />
      <path d="M14.5 2V5" stroke="#cce96d" strokeWidth="1.8" strokeLinecap="round" />
      {/* Windows */}
      <circle cx="13" cy="8" r="0.8" fill="#cce96d" />
      <circle cx="16" cy="8" r="0.8" fill="#cce96d" />
      <circle cx="13" cy="12" r="0.8" fill="#cce96d" />
      <circle cx="16" cy="12" r="0.8" fill="#cce96d" />
      <circle cx="13" cy="16" r="0.8" fill="#cce96d" />
      <circle cx="16" cy="16" r="0.8" fill="#cce96d" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Question 2: What kind of trip sounds most like you?
// ─────────────────────────────────────────────────────────────────────────────

export function AdventureIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hiking Boot / Compass trail */}
      <circle cx="14" cy="14" r="10" stroke="#0b6c57" strokeWidth="1.8" />
      {/* Compass Needle */}
      <polygon points="14,6 17,14 14,12 11,14" fill="#f43f5e" />
      <polygon points="14,22 17,14 14,16 11,14" fill="#1b6256" />
      <circle cx="14" cy="14" r="1.8" fill="#cce96d" />
      <path d="M14 3V5M14 23V25M3 14H5M23 14H25" stroke="#cce96d" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function RelaxationIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Lotus / Zen Stone */}
      <ellipse cx="14" cy="21" rx="9" ry="2.5" fill="#8ba89e" opacity="0.4" />
      <path d="M14 7C14 7 11 13 11 17C11 19 12.3 20.5 14 20.5C15.7 20.5 17 19 17 17C17 13 14 7 14 7Z" fill="#0b6c57" />
      <path d="M8 17C8 14 11 11 11 11C11 14.5 10 18.5 8 17Z" fill="#1b856e" />
      <path d="M20 17C20 14 17 11 17 11C17 14.5 18 18.5 20 17Z" fill="#1b856e" />
      <circle cx="14" cy="6.5" r="1.8" fill="#cce96d" />
    </svg>
  );
}

export function ExplorationIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Folded Map */}
      <path d="M4 6L10 8.5L18 6L24 8.5V22L18 19.5L10 22L4 19.5V6Z" fill="#e7f4ea" stroke="#0b6c57" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 8.5V22" stroke="#0b6c57" strokeWidth="1.4" strokeDasharray="2 2" />
      <path d="M18 6V19.5" stroke="#0b6c57" strokeWidth="1.4" strokeDasharray="2 2" />
      {/* Destination Pin */}
      <circle cx="14" cy="12" r="2.5" fill="#f43f5e" />
      <circle cx="14" cy="12" r="1" fill="#ffffff" />
    </svg>
  );
}

export function NightlifeIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Celebratory Sparks / Starburst */}
      <path d="M14 3L16.2 9.8L23 12L16.2 14.2L14 21L11.8 14.2L5 12L11.8 9.8L14 3Z" fill="#f1aa67" />
      <path d="M21 4L22 7L25 8L22 9L21 12L20 9L17 8L20 7L21 4Z" fill="#cce96d" />
      <circle cx="7" cy="20" r="1.5" fill="#f43f5e" />
      <circle cx="21" cy="20" r="1.5" fill="#38bdf8" />
      <circle cx="14" cy="12" r="2" fill="#ffffff" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Question 3: You reach a new destination. What do you want to experience first?
// ─────────────────────────────────────────────────────────────────────────────

export function NatureFirstIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sprouting Leaves with Dew */}
      <path d="M14 22V13" stroke="#0b6c57" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M14 13C14 8 8 7 8 7C8 12 11 15 14 15.5" fill="#10b981" />
      <path d="M14 11C14 6 20 5 20 5C20 10 17 13 14 13.5" fill="#cce96d" />
      <circle cx="17.5" cy="8.5" r="1.2" fill="#ffffff" />
    </svg>
  );
}

export function CultureFirstIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Heritage Temple / Classical Arch */}
      <path d="M5 9H23M14 4L23 9H5L14 4Z" fill="#1b6256" stroke="#0b6c57" strokeWidth="1.5" />
      {/* Pillars */}
      <rect x="7" y="9" width="2.5" height="11" fill="#0b6c57" />
      <rect x="12.7" y="9" width="2.5" height="11" fill="#0b6c57" />
      <rect x="18.5" y="9" width="2.5" height="11" fill="#0b6c57" />
      {/* Base */}
      <rect x="4" y="20" width="20" height="3" rx="0.5" fill="#cce96d" />
    </svg>
  );
}

export function FoodFirstIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Steaming Bowl */}
      <path d="M6 13C6 19 10 21 14 21C18 21 22 19 22 13H6Z" fill="#f1aa67" />
      <rect x="11" y="21" width="6" height="2" rx="0.5" fill="#b45309" />
      {/* Steam curves */}
      <path d="M10 9C9.5 7.5 11 6.5 10.5 5" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 9C13.5 7 15 6 14.5 4.5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 9C17.5 7.5 19 6.5 18.5 5" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ActivitiesFirstIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Target Bullseye with Arrow */}
      <circle cx="14" cy="14" r="10" stroke="#0b6c57" strokeWidth="1.8" />
      <circle cx="14" cy="14" r="6.5" stroke="#f43f5e" strokeWidth="1.6" />
      <circle cx="14" cy="14" r="3" fill="#cce96d" />
      {/* Arrow hitting center */}
      <path d="M21 7L14 14M21 7H17M21 7V11" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Question 4: How do you like to travel?
// ─────────────────────────────────────────────────────────────────────────────

export function SpontaneousIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hot Air Balloon */}
      <path d="M14 4C9.5 4 6 7.5 6 12C6 15.5 10 18.5 14 18.5C18 18.5 22 15.5 22 12C22 7.5 18.5 4 14 4Z" fill="#f43f5e" />
      <path d="M14 4C11.5 4 10 7.5 10 12C10 15.5 12 18.5 14 18.5C16 18.5 18 15.5 18 12C18 7.5 16.5 4 14 4Z" fill="#f1aa67" />
      <path d="M14 4V18.5" stroke="#ffffff" strokeWidth="1.2" />
      {/* Basket */}
      <rect x="12" y="21.5" width="4" height="3" rx="0.5" fill="#854d0e" />
      <line x1="12.5" y1="18.5" x2="12.5" y2="21.5" stroke="#658078" strokeWidth="1" />
      <line x1="15.5" y1="18.5" x2="15.5" y2="21.5" stroke="#658078" strokeWidth="1" />
    </svg>
  );
}

export function WellPlannedIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Checklist Clipboard */}
      <rect x="6" y="5" width="16" height="19" rx="2" fill="#ffffff" stroke="#0b6c57" strokeWidth="1.8" />
      <path d="M11 3.5H17V6H11V3.5Z" fill="#cce96d" stroke="#0b6c57" strokeWidth="1.2" />
      {/* Checked lines */}
      <path d="M9 10L11 12L14.5 8.5" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="10" x2="19" y2="10" stroke="#0b6c57" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 15L11 17L14.5 13.5" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="15" x2="19" y2="15" stroke="#0b6c57" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="20" x2="19" y2="20" stroke="#8ca89f" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FastPacedIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dynamic Lightning Bolt */}
      <path d="M16 3L6 15H14L12 25L22 13H14L16 3Z" fill="#f1aa67" stroke="#d97706" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="21" cy="7" r="1.5" fill="#cce96d" />
      <line x1="4" y1="8" x2="8" y2="8" stroke="#f1aa67" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="11" x2="5" y2="11" stroke="#f1aa67" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SlowEasyIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Friendly Turtle / Calm Shell */}
      <path d="M8 18C8 12.5 11 9 16 9C20.5 9 23 12.5 23 18H8Z" fill="#10b981" />
      <path d="M12 18C12 14 13.5 12 16 12C18.5 12 19.5 14 20 18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      {/* Head & Legs */}
      <circle cx="24" cy="16" r="2.5" fill="#0b6c57" />
      <circle cx="25" cy="15.5" r="0.6" fill="#cce96d" />
      <circle cx="9" cy="19" r="1.5" fill="#0b6c57" />
      <circle cx="20" cy="19" r="1.5" fill="#0b6c57" />
      <ellipse cx="15" cy="22" rx="10" ry="1.5" fill="#cce96d" opacity="0.4" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Question 5: When choosing how to reach your destination, what would you prefer?
// ─────────────────────────────────────────────────────────────────────────────

export function GreenerTransitIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Modern High-Speed Electric Train with Green Sprout */}
      <rect x="7" y="6" width="14" height="16" rx="4" fill="#0b6c57" />
      <path d="M9 10H19V14H9V10Z" fill="#cce96d" />
      <circle cx="10.5" cy="18" r="1.5" fill="#ffffff" />
      <circle cx="17.5" cy="18" r="1.5" fill="#ffffff" />
      <path d="M9 24L7 22M19 24L21 22" stroke="#0b6c57" strokeWidth="2" strokeLinecap="round" />
      {/* Leaf sprout on top */}
      <path d="M14 6C14 3 17 2 17 2C17 5 15.5 6 14 6Z" fill="#10b981" />
    </svg>
  );
}

export function CheaperTransitIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Coin stack with Rupee/Savings check */}
      <ellipse cx="14" cy="21" rx="8" ry="3" fill="#b45309" />
      <ellipse cx="14" cy="16" rx="8" ry="3" fill="#d97706" />
      <ellipse cx="14" cy="11" rx="8" ry="3" fill="#f1aa67" />
      <path d="M14 8C10 8 10 13 14 13C16 13 17 11 17 11" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="21" cy="7" r="3.5" fill="#10b981" />
      <path d="M19.5 7L20.5 8L22.5 6" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FasterTransitIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stopwatch with Motion Rays */}
      <circle cx="14" cy="15" r="9" stroke="#0b6c57" strokeWidth="1.8" />
      <path d="M14 4V6M12 4H16" stroke="#0b6c57" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 15L18 11" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="14" cy="15" r="1.5" fill="#0b6c57" />
      <path d="M4 11L1 11M3 15L1 15M4 19L1 19" stroke="#cce96d" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ComfortTransitIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Plush Recliner Armchair with Sparkles */}
      <path d="M9 7C9 5.5 10 4.5 11.5 4.5H16.5C18 4.5 19 5.5 19 7V16H9V7Z" fill="#1b6256" />
      <rect x="7" y="14" width="14" height="6" rx="2" fill="#0b6c57" />
      <rect x="5" y="12" width="3" height="7" rx="1" fill="#cce96d" />
      <rect x="20" y="12" width="3" height="7" rx="1" fill="#cce96d" />
      <path d="M8 20L7 24M20 20L21 24" stroke="#0b6c57" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="23" cy="6" r="1" fill="#f1aa67" />
      <circle cx="21" cy="4" r="0.6" fill="#f1aa67" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Question 6: Would you choose a greener option if it took a little longer?
// ─────────────────────────────────────────────────────────────────────────────

export function DefinitelyGreenIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hands holding seedling / Heart-Sprout */}
      <circle cx="14" cy="14" r="10.5" fill="#eaf7ed" stroke="#10b981" strokeWidth="1.6" />
      <path d="M14 19V12" stroke="#0b6c57" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 12C14 8 9 8 9 8C9 12 12 13 14 13.5" fill="#0b6c57" />
      <path d="M14 10.5C14 6.5 19 6.5 19 6.5C19 10.5 16 11.5 14 12" fill="#cce96d" />
      <circle cx="14" cy="5" r="1.5" fill="#f1aa67" />
    </svg>
  );
}

export function ReasonableGreenIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Thumbs Up with Green Leaf Halo */}
      <circle cx="14" cy="14" r="10.5" fill="#f2f9f3" stroke="#0b6c57" strokeWidth="1.6" />
      <path d="M9 13H11V20H9V13Z" fill="#0b6c57" />
      <path d="M11 15C12 15 13.5 14 14 12C14.5 10 14 8 15 8C15.8 8 16.5 8.7 16.5 9.5C16.5 10.5 15.8 12 15.8 12H19C20 12 20.5 12.8 20.5 13.8L19.5 19C19.3 19.6 18.7 20 18 20H11V15Z" fill="#cce96d" stroke="#0b6c57" strokeWidth="1.2" />
    </svg>
  );
}

export function SimilarGreenIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Equal Balance Scales */}
      <path d="M14 5V21M10 21H18" stroke="#0b6c57" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 9H22" stroke="#0b6c57" strokeWidth="1.8" strokeLinecap="round" />
      {/* Left Pan */}
      <path d="M6 9L4 14H8L6 9Z" fill="#cce96d" stroke="#0b6c57" strokeWidth="1.2" />
      {/* Right Pan */}
      <path d="M22 9L20 14H24L22 9Z" fill="#cce96d" stroke="#0b6c57" strokeWidth="1.2" />
      <circle cx="14" cy="5" r="1.5" fill="#f1aa67" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Question 7: What should EcoTrail prioritize when planning your trip?
// ─────────────────────────────────────────────────────────────────────────────

export function LowerImpactIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Planet Earth with Green Ring */}
      <circle cx="14" cy="14" r="8.5" fill="#38bdf8" />
      <path d="M10 11C11 10 13 11 13 13C13 14 11 15 10 15C9 15 8 13 10 11Z" fill="#10b981" />
      <path d="M16 10C17 9 19 10 19 12C18 13 16 14 15 13C15 11 15 10 16 10Z" fill="#10b981" />
      <path d="M12 17C14 16 16 17 17 19C15 21 12 21 11 19C11 18 11 17 12 17Z" fill="#10b981" />
      {/* Orbit Ring */}
      <ellipse cx="14" cy="14" rx="12" ry="4" stroke="#cce96d" strokeWidth="1.6" transform="rotate(-25 14 14)" />
    </svg>
  );
}

export function LowerCostIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Piggy Bank / Savings Shield */}
      <path d="M14 4L22 7.5V13C22 18.5 18.5 22.5 14 24C9.5 22.5 6 18.5 6 13V7.5L14 4Z" fill="#e7f5ea" stroke="#0b6c57" strokeWidth="1.6" />
      <circle cx="14" cy="13.5" r="4" fill="#f1aa67" />
      <path d="M14 11.5V15.5M12.5 13.5H15.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function BetterExpIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Heart with 5-Star Sparkle */}
      <path d="M14 22C14 22 5 16.5 5 10.5C5 7.5 7.5 5 10.5 5C12.3 5 13.4 6 14 7C14.6 6 15.7 5 17.5 5C20.5 5 23 7.5 23 10.5C23 16.5 14 22 14 22Z" fill="#f43f5e" />
      <path d="M14 9L15 11.5L17.5 12L15.5 13.5L16 16L14 14.5L12 16L12.5 13.5L10.5 12L13 11.5L14 9Z" fill="#cce96d" />
    </svg>
  );
}

export function OverallBalanceIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 3-Way Equilibrium Diamond / Harmony Triangle */}
      <polygon points="14,4 23,20 5,20" stroke="#0b6c57" strokeWidth="1.8" fill="#eaf7ee" />
      <circle cx="14" cy="8" r="2.5" fill="#10b981" />
      <circle cx="19" cy="18" r="2.5" fill="#f1aa67" />
      <circle cx="9" cy="18" r="2.5" fill="#38bdf8" />
      <circle cx="14" cy="15" r="1.5" fill="#cce96d" />
    </svg>
  );
}
