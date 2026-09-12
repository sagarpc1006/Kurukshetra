import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppNavbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract user's first name or clean display name
  const rawName = user?.displayName || profile?.name || user?.email?.split('@')[0] || 'Traveler';
  const firstName = rawName.trim().split(' ')[0] || 'Traveler';
  const initial = (firstName[0] || 'T').toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  return (
    <header className="app-nav-header">
      <div className="app-nav-container">
        {/* Left: Brand + Subtitle */}
        <div className="app-nav-left">
          <Link to="/dashboard" className="app-nav-logo" aria-label="EcoTrail Home">
            <span className="logo-leaf">◉</span>
            <span className="logo-main">Eco</span>
            <span className="logo-accent">Trail</span>
          </Link>
          <span className="app-nav-tagline">Green &amp; Inclusive Travel</span>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="app-nav-links" aria-label="Main Navigation">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
          >
            Home
          </NavLink>
          <NavLink
            to="/trips"
            className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
          >
            My Trips
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
          >
            Profile
          </NavLink>
        </nav>

        {/* Right: Authenticated User Info & Logout */}
        <div className="app-nav-right">
          <div className="user-greeting">
            <span className="greeting-text">Hi, {firstName} 👋</span>
          </div>

          <Link
            to="/profile"
            className="user-avatar-btn"
            title={`View ${rawName}'s profile`}
            aria-label="View Profile"
          >
            <span className="avatar-circle">{initial}</span>
          </Link>

          <button
            type="button"
            className="nav-logout-btn"
            onClick={handleLogout}
            title="Log out of EcoTrail"
          >
            <span>Log out</span>
            <b aria-hidden="true">↪</b>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="app-nav-mobile-drawer">
          <div className="mobile-drawer-user">
            <span className="avatar-circle small">{initial}</span>
            <div>
              <strong>Hi, {firstName} 👋</strong>
              <small>{user?.email || 'Logged in'}</small>
            </div>
          </div>
          <nav className="mobile-drawer-links">
            <NavLink
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              ⌂ Home
            </NavLink>
            <NavLink
              to="/trips"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              ⌁ My Trips
            </NavLink>
            <NavLink
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              ◎ Profile &amp; Preferences
            </NavLink>
          </nav>
          <div className="mobile-drawer-footer">
            <button
              type="button"
              className="btn full small light"
              onClick={handleLogout}
            >
              Log out ↪
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
