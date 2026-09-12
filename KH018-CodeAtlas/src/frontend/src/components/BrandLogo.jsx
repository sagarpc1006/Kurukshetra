import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Unified Official EcoTrail Brand Logo Component
 * Single source of truth used across Landing Page, Login, Signup, Dashboard, Profile, and all other pages.
 * 
 * Features:
 * - Circular emblem with outer ring in currentColor
 * - Stylized leaf silhouette in currentColor with a true transparent center vein slit
 * - Signature lime-green accent sphere (#cce96d) at the top-right
 * - "ecotrail" text in DM Sans 800 bold with tight tracking (-0.04em)
 */
export function EcoTrailBrandLogo({
  className = 'ecotrail-logo-lockup',
  size = 38,
  fontSize = '26px',
  color,
  style = {},
}) {
  const maskId = React.useId
    ? React.useId().replace(/[^a-zA-Z0-9_-]/g, '')
    : 'ecotrail-leaf-mask';

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        color: color || 'inherit',
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 34 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block' }}
      >
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="34" height="34" fill="#ffffff" />
            <path
              d="M17 11.2V21.2"
              stroke="#000000"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </mask>
        </defs>

        {/* Outer Circular Ring */}
        <circle cx="17" cy="17" r="15" stroke="currentColor" strokeWidth="2.4" fill="transparent" />

        {/* Stylized Leaf Silhouette inside with transparent negative stem slit */}
        <path
          d="M17 7.5C12.8 11.5 12.8 20 17 24.5C21.2 20 21.2 11.5 17 7.5Z"
          fill="currentColor"
          mask={`url(#${maskId})`}
        />

        {/* Lime Accent Sphere at top-right of leaf */}
        <circle cx="23.2" cy="10.8" r="4.2" fill="#cce96d" />
      </svg>

      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 800,
          fontSize: fontSize,
          letterSpacing: '-0.04em',
          color: 'currentColor',
          lineHeight: 1,
        }}
      >
        ecotrail
      </span>
    </div>
  );
}

/**
 * Clickable Brand Logo Link that routes to home or dashboard
 */
export default function Logo({
  to = '/',
  color,
  size = 38,
  fontSize = '26px',
  className = 'logo',
  style = {},
}) {
  return (
    <Link
      to={to}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: color || 'inherit',
        ...style,
      }}
    >
      <EcoTrailBrandLogo size={size} fontSize={fontSize} color={color} />
    </Link>
  );
}
