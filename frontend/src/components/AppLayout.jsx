import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EcoTrailBrandLogo } from './BrandLogo';
import TravelAssistant from './TravelAssistant';

// Bespoke illustrated vector SVG icon for the Instant Travel Assistant in Navbar (no emoji)
export function TravelAssistantNavIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z"
        fill="url(#sparkle-grad)"
        stroke="#0b6c57"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="4" r="2.5" fill="#cce96d" stroke="#0b6c57" strokeWidth="0.8" />
      <path
        d="M5 19L6.2 16.2L9 15L6.2 13.8L5 11L3.8 13.8L1 15L3.8 16.2L5 19Z"
        fill="#cce96d"
        stroke="#0b6c57"
        strokeWidth="0.8"
      />
      <defs>
        <linearGradient id="sparkle-grad" x1="4" y1="2" x2="20" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0b6c57" />
          <stop offset="0.7" stopColor="#15806c" />
          <stop offset="1" stopColor="#cce96d" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo() {
  return (
    <Link className="logo-sidebar-lockup" to="/dashboard">
      <EcoTrailBrandLogo size={43} fontSize="30px" />
    </Link>
  );
}

export default function AppLayout({ children }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  // Load custom profile info from localStorage if available
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('ecotrail_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: user?.displayName || profile?.name || 'Yashraj Gadilkar',
      email: user?.email || 'yashraj@example.com',
      phone: '+91 98765 43210',
      homeLocation: 'Pune, Maharashtra',
    };
  });

  // Listen for storage updates
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('ecotrail_user_profile');
        if (saved) setProfileData(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ecotrail_profile_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ecotrail_profile_updated', handleStorageChange);
    };
  }, []);

  const displayName = profileData.name || user?.displayName || profile?.name || (user?.email ? user.email.split('@')[0] : 'Traveler');
  const userEmail = user?.email || profileData.email || 'traveler@ecotrail.com';
  const initial = (displayName.trim()[0] || 'T').toUpperCase();

  // Instant Travel Assistant Drawer State
  const [assistantDrawerOpen, setAssistantDrawerOpen] = useState(false);
  const [assistantActivePrompt, setAssistantActivePrompt] = useState('');

  // Listen for open assistant requests across the app (e.g. from Saved page)
  useEffect(() => {
    const handleOpenAssistant = (e) => {
      const prompt = e.detail?.prompt || '';
      if (prompt) {
        setAssistantActivePrompt(prompt);
      }
      setAssistantDrawerOpen(true);
      setNotificationsOpen(false);
      setProfileDropdownOpen(false);
    };
    window.addEventListener('ecotrail_open_assistant', handleOpenAssistant);
    return () => {
      window.removeEventListener('ecotrail_open_assistant', handleOpenAssistant);
    };
  }, []);

  // Notifications State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'reminder',
      icon: '🗓️',
      title: 'Trip reminder',
      body: 'Your journey to Goa starts in 12 days. Check your low-carbon packing checklist.',
      time: '2h ago',
      unread: true,
      link: '/saved',
    },
    {
      id: 2,
      type: 'ecotwin',
      icon: '🌿',
      title: 'Eco-Twin recommendation',
      body: 'New Konkan Railway electric sleeper route available for Mumbai → Goa (-73% CO₂).',
      time: 'Yesterday',
      unread: true,
      link: '/comparison',
    },
    {
      id: 3,
      type: 'update',
      icon: '♿',
      title: 'Saved place update',
      body: '3 places in your wishlist have added verified step-free entrance details.',
      time: '3d ago',
      unread: true,
      link: '/saved',
    },
  ]);

  // Profile Dropdown State
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Refs for outside click closing
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (assistantDrawerOpen) setAssistantDrawerOpen(false);
        if (showLogoutModal) setShowLogoutModal(false);
        if (notificationsOpen) setNotificationsOpen(false);
        if (profileDropdownOpen) setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [assistantDrawerOpen, showLogoutModal, notificationsOpen, profileDropdownOpen]);

  useEffect(() => {
    if (assistantDrawerOpen || showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [assistantDrawerOpen, showLogoutModal]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  return (
    <div className="app-shell">
      {/* ── SIDEBAR ────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        {/* Logo shifted left and properly aligned with nav items */}
        <Logo />
        <div className="side-links">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            ▦ Overview
          </NavLink>
          <NavLink to="/planner" className={({ isActive }) => (isActive ? 'active' : '')}>
            ↗ Plan a Trip
          </NavLink>
          <NavLink to="/comparison" className={({ isActive }) => (isActive ? 'active' : '')}>
            ⇄ Eco-Twin Compare
          </NavLink>
          <NavLink to="/discover" className={({ isActive }) => (isActive ? 'active' : '')}>
            ⌕ Discover Places
          </NavLink>
          <NavLink to="/saved" className={({ isActive }) => (isActive ? 'active' : '')}>
            ♡ Saved Places
          </NavLink>
        </div>

        <div className="side-bottom">
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
            ◎ Profile &amp; Settings
          </NavLink>
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={() => setShowLogoutModal(true)}
          >
            ↪ Log out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────────── */}
      <main className="app-main">
        {/* Top Navbar */}
        <header className="app-head">
          {/* Keep existing search bar */}
          <div className="search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search journeys, places..."
              className="navbar-search-input"
            />
          </div>

          {/* Right Controls: Travel Assistant + Notifications + Profile Avatar */}
          <div className="app-head-actions">
            {/* 1. Instant Travel Assistant Illustrated Icon Button */}
            <button
              type="button"
              className={`nav-icon-btn assistant-nav-btn ${assistantDrawerOpen ? 'active' : ''}`}
              onClick={() => {
                setAssistantDrawerOpen(!assistantDrawerOpen);
                setNotificationsOpen(false);
                setProfileDropdownOpen(false);
              }}
              aria-label="Open Instant Travel Assistant"
              title="Instant Travel Assistant (AI Powered)"
            >
              <TravelAssistantNavIcon size={22} />
              <span className="assistant-btn-pulse" />
            </button>

            {/* 2. Notifications Bell & Dropdown */}
            <div className="nav-dropdown-wrapper" ref={notifRef}>
              <button
                type="button"
                className={`nav-icon-btn bell-nav-btn ${notificationsOpen ? 'active' : ''}`}
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                aria-label="View notifications"
                title="Notifications"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && <span className="nav-badge-dot" />}
              </button>

              {notificationsOpen && (
                <div className="dropdown-panel notifications-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-title-wrap">
                      <h4>Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="notif-count-pill">{unreadCount} new</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="dropdown-action-btn"
                        onClick={handleMarkAllRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="notifications-list">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notification-item ${n.unread ? 'unread' : ''}`}
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((item) =>
                              item.id === n.id ? { ...item, unread: false } : item
                            )
                          );
                          setNotificationsOpen(false);
                          if (n.link) navigate(n.link);
                        }}
                      >
                        <span className="notif-item-icon">{n.icon}</span>
                        <div className="notif-item-content">
                          <div className="notif-item-header">
                            <strong>{n.title}</strong>
                            <span className="notif-time">{n.time}</span>
                          </div>
                          <p>{n.body}</p>
                        </div>
                        {n.unread && <span className="notif-unread-dot" />}
                      </div>
                    ))}
                  </div>

                  <div className="dropdown-footer">
                    <span>EcoTrail Journey Intelligence</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Profile Avatar & Dropdown (Slightly bigger, 42px) */}
            <div className="nav-dropdown-wrapper" ref={profileRef}>
              <button
                type="button"
                className={`profile-avatar-btn ${profileDropdownOpen ? 'active' : ''}`}
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                aria-label="User profile menu"
                title={`Logged in as ${displayName}`}
              >
                <span className="profile-dot-avatar">{initial}</span>
              </button>

              {profileDropdownOpen && (
                <div className="dropdown-panel profile-dropdown">
                  {/* User brief card */}
                  <div className="profile-dropdown-user">
                    <span className="profile-dot-avatar large">{initial}</span>
                    <div className="profile-dropdown-meta">
                      <strong className="profile-dropdown-name">{displayName}</strong>
                      <span className="profile-dropdown-email">{userEmail}</span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  {/* Clean, vertically stacked, equally spaced, perfectly left-aligned items */}
                  <div className="profile-dropdown-menu">
                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/profile');
                      }}
                    >
                      <svg className="menu-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>My Profile</span>
                    </button>

                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/preferences');
                      }}
                    >
                      <svg className="menu-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                      </svg>
                      <span>Travel Preferences</span>
                    </button>

                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/saved');
                      }}
                    >
                      <svg className="menu-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span>Saved Places</span>
                    </button>

                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/settings');
                      }}
                    >
                      <svg className="menu-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      <span>Settings</span>
                    </button>

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      className="profile-menu-item logout-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setShowLogoutModal(true);
                      }}
                    >
                      <svg className="menu-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>

      {/* ── INSTANT TRAVEL ASSISTANT SLIDE-OVER DRAWER ────────────────── */}
      {assistantDrawerOpen && (
        <div
          className="assistant-drawer-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAssistantDrawerOpen(false);
          }}
        >
          <aside className="assistant-drawer-panel" role="dialog" aria-modal="true">
            <div className="assistant-drawer-header">
              <div className="assistant-drawer-title-wrap">
                <div className="assistant-drawer-icon-wrap">
                  <TravelAssistantNavIcon size={24} />
                </div>
                <div>
                  <h3>EcoTrail Agent Workspace</h3>
                  <span className="assistant-drawer-tag">✦ Real-Time AI Agent &amp; Official Portals</span>
                </div>
              </div>
              <button
                type="button"
                className="assistant-drawer-close"
                onClick={() => setAssistantDrawerOpen(false)}
                aria-label="Close Assistant"
              >
                ✕
              </button>
            </div>

            <div className="assistant-drawer-content">
              <TravelAssistant externalPrompt={assistantActivePrompt} />
            </div>

            <div className="assistant-drawer-footer">
              <span>EcoTrail AI Agent · Real-Time Multimodal Intelligence · Official Verified Portals</span>
            </div>
          </aside>
        </div>
      )}

      {/* ── LOGOUT CONFIRMATION MODAL ─────────────────────────────────── */}
      {showLogoutModal && (
        <div
          className="logout-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogoutModal(false);
          }}
        >
          <div className="logout-modal-card" role="dialog" aria-modal="true">
            <div className="logout-modal-icon">↪</div>
            <h3>Log out of EcoTrail?</h3>
            <p>Are you sure you want to log out?</p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-logout-btn"
                onClick={handleConfirmLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
