import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, getFriendlyErrorMessage } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Trips from './pages/Trips';
import MyProfile from './pages/MyProfile';
import TravelPreferences from './pages/TravelPreferences';
import SettingsPage from './pages/SettingsPage';
import Onboarding from './pages/Onboarding';
import Planner from './pages/Planner';
import Discover from './pages/Discover';
import TravelAssistant from './components/TravelAssistant';
import AppLayout from './components/AppLayout';
import Logo, { EcoTrailBrandLogo } from './components/BrandLogo';
import './styles.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80';

const places = [
  {
    name: 'Munnar',
    type: 'Tea country',
    img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
    rating: '4.9',
    tag: 'Low-impact stay'
  },
  {
    name: 'Coorg',
    type: 'Forest trails',
    img: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=900&q=80',
    rating: '4.8',
    tag: 'Accessible'
  },
  {
    name: 'Hampi',
    type: 'Living heritage',
    img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=900&q=80',
    rating: '4.7',
    tag: 'Verified clean'
  },
  {
    name: 'Alleppey',
    type: 'Backwater canals',
    img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=900&q=80',
    rating: '4.9',
    tag: 'Low-impact stay'
  },
  {
    name: 'Spiti',
    type: 'Himalayan valley',
    img: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=900&q=80',
    rating: '4.8',
    tag: 'Accessible'
  },
  {
    name: 'Pondicherry',
    type: 'French heritage coast',
    img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=900&q=80',
    rating: '4.7',
    tag: 'Verified clean'
  }
];

function Navbar({ onLogin = () => {}, onSignup = () => {} } = {}){
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#how', label: 'How it works' },
    { href: '#eco-twin', label: 'Eco-Twin' },
    { href: '#impact', label: 'Impact' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <Logo color="#ffffff" size={38} fontSize="26px" />

      {/* Desktop nav links */}
      <nav className="nav-links">
        {navLinks.map(l => (
          <a key={l.href} href={l.href} className="nav-link">
            {l.label}
            <span className="nav-link-bar"/>
          </a>
        ))}
      </nav>

      {/* Desktop actions */}
      <div className="nav-actions">
        {isAuthenticated ? (
          <Link className="btn small" to="/dashboard">Dashboard <b>↗</b></Link>
        ) : (
          <>
            <button className="nav-login-btn" onClick={onLogin}>
              <span className="nav-login-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <span>Log in</span>
            </button>
            <button className="btn small nav-cta" onClick={onSignup}>Start planning <b>↗</b></button>
          </>
        )}
      </div>

      {/* Hamburger button */}
      <button
        id="nav-hamburger"
        className={`hamburger${menuOpen ? ' hamburger--open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <span/><span/><span/>
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-drawer">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="mobile-link" onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <div className="mobile-drawer-actions">
            {isAuthenticated ? (
              <Link className="btn small" to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard <b>↗</b></Link>
            ) : (
              <>
                <button className="nav-login-btn" onClick={() => { setMenuOpen(false); onLogin(); }}>
                  <span className="nav-login-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <span>Log in</span>
                </button>
                <button className="btn small" onClick={() => { setMenuOpen(false); onSignup(); }}>Start planning ↗</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Footer(){return <footer><Logo color="#0b6c57" size={34} fontSize="24px"/><p>Better journeys leave lighter footprints.</p><div><a href="#">Privacy</a><a href="#">Help centre</a><a href="#">Instagram</a></div></footer>}
function Pill({children}){return <span className="pill">{children}</span>}

const faqs = [
  { q: 'What is EcoTrail?', a: 'EcoTrail is an eco-travel platform that helps you plan greener journeys by comparing routes, stays and transport options based on their environmental impact.' },
  { q: 'How does the Eco-Twin work?', a: 'For every trip you plan, EcoTrail generates an Eco-Twin — a smarter, lower-impact alternative — so you can compare carbon, cost, time, comfort and accessibility side by side.' },
  { q: 'Is EcoTrail free to use?', a: 'Yes! Planning and comparing trips is completely free. Premium features for groups and detailed impact reports are coming soon.' },
  { q: 'How is the carbon footprint calculated?', a: 'We use AI-powered analysis across transport modes, accommodation types and distances to estimate CO₂ emissions, referencing industry-standard datasets.' },
  { q: 'Can I book trips directly on EcoTrail?', a: 'Currently EcoTrail is a planning and comparison tool. Direct booking integrations with eco-certified partners are on our roadmap.' },
  { q: 'Does EcoTrail consider accessibility?', a: 'Absolutely. Accessibility and hygiene are core to our Eco-Twin scoring — we make sure sustainable options don\'t compromise your comfort or needs.' },
];

function FaqWidget() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const toggle = (i) => setActive(active === i ? null : i);
  return (
    <div className="faq-widget">
      {open && (
        <div className="faq-panel">
          <div className="faq-panel-head">
            <span>Frequently Asked Questions</span>
            <button className="faq-close" onClick={() => setOpen(false)} aria-label="Close FAQ">✕</button>
          </div>
          <div className="faq-list">
            {faqs.map((item, i) => (
              <div key={i} className={`faq-item${active === i ? ' faq-item--open' : ''}`}>
                <button className="faq-q" onClick={() => toggle(i)}>
                  <span>{item.q}</span>
                  <span className="faq-arrow">{active === i ? '−' : '+'}</span>
                </button>
                {active === i && <p className="faq-a">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      <button
        id="faq-toggle-btn"
        className={`faq-btn${open ? ' faq-btn--active' : ''}`}
        onClick={() => { setOpen(o => !o); setActive(null); }}
        aria-label="Toggle FAQ"
      >
        {open ? '✕' : '?'} <span>FAQ</span>
      </button>
    </div>
  );
}

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' faq-item--open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(o => !o)}>
        <span>{item.q}</span>
        <span className="faq-arrow">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="faq-a">{item.a}</p>}
    </div>
  );
}

function Landing(){
  const { isAuthenticated } = useAuth();
  const nav = useNavigate();
  const [authMode, setAuthMode] = useState(null); // null | 'signup' | 'login'
  const open = (m) => {
    if (isAuthenticated) {
      nav('/dashboard');
    } else {
      setAuthMode(m);
    }
  };
  return <><Navbar onLogin={()=>open('login')} onSignup={()=>open('signup')}/><main className="landing">
 <section className="hero"><div className="hero-copy"><Pill>✦ Travel thoughtfully, beautifully</Pill><h1>Every journey can be<br/><i>a greener one.</i></h1><p className="hero-tagline">Thoughtful travel. Meaningful impact.</p><div className="hero-buttons"><button className="btn" onClick={()=>open('signup')}>Plan your eco-trip <b>↗</b></button></div><div className="hero-proof"><b>4.9/5</b><span className="avatars">◉ ◉ ◉ ◉</span><span>Loved by 40,000+ mindful travellers</span></div></div>
 <div className="hero-art"><div className="sun"></div><div className="cloud c1"></div><div className="cloud c2"></div><div className="float-card card-a">🌿 <b>42% less CO₂</b><small>Your journey, made lighter</small></div><div className="float-card card-b">✦ <b>Comfort, checked</b><small>Access & hygiene verified</small></div></div></section>
 <section className="intro"><div><Pill>THE ECOTRAIL DIFFERENCE</Pill><h2>The trip you want.<br/><em>The impact you choose.</em></h2></div><p>EcoTrail creates an <b>Eco-Twin</b> for every journey: a more considered alternative that makes the trade-offs clear, so you stay in control.</p></section>
 <section className="how-it-works" id="how"><div><Pill>HOW IT WORKS</Pill><h2>Better travel, in three simple steps.</h2></div><div className="steps"><article><span>01</span><h3>Enter your trip</h3><p>Share where you're going, when, and what matters most to you.</p></article><article><span>02</span><h3>EcoTrail analyzes</h3><p>We compare routes, stays and details across every important trade-off.</p></article><article><span>03</span><h3>Get your Eco-Twin plan</h3><p>Choose a clearer, kinder way to make the same journey.</p></article></div></section>
 <section className="twin" id="eco-twin"><div className="twin-image"><div className="twin-overlay"><span>YOUR ECO-TWIN</span><b>75 kg CO₂ saved</b></div></div><div className="twin-copy"><Pill>MEET YOUR ECO-TWIN</Pill><h2>A better version of every escape.</h2><p>See your regular plan beside a smarter alternative. Compare carbon, cost, time, comfort and accessibility — at a glance.</p><div className="metrics"><div><strong>−42%</strong><span>carbon emissions</span></div><div><strong>₹1,840</strong><span>average saved</span></div><div><strong>✓</strong><span>needs considered</span></div></div><Link className="arrow-link" to="/comparison">Compare a sample trip →</Link></div></section>
 <section className="benefits"><article><span>♧</span><h3>Kind to the planet</h3><p>Lower-impact routes and stays, always explained.</p></article><article><span>◌</span><h3>Built around you</h3><p>Accessibility, budget and comfort are not afterthoughts.</p></article><article><span>✦</span><h3>Trust in every detail</h3><p>AI-verified accessibility and hygiene insights.</p></article></section>
 <section className="impact" id="impact"><div><Pill>THE RIPPLE EFFECT</Pill><h2>Small choices.<br/><em>Real change.</em></h2></div><div className="impact-numbers"><article><b>1,280 t</b><span>CO₂ reduced</span></article><article><b>₹24 L</b><span>money saved</span></article><article><b>86,000</b><span>sustainable choices</span></article><article><b>40,000+</b><span>travellers helped</span></article></div></section>
 <section className="cta"><Pill>READY WHEN YOU ARE</Pill><h2>Travel with more<br/>intention.</h2><button className="btn light" onClick={()=>open('signup')}>Start planning <b>↗</b></button></section>
 <section className="faq-section" id="faq">
   <div className="faq-section-head">
     <Pill>FAQ</Pill>
     <h2>Frequently asked<br/><em>questions.</em></h2>
   </div>
   <div className="faq-section-list">
     {faqs.map((item, i) => <FaqItem key={i} item={item}/>)}
   </div>
 </section>
 </main><Footer/>{authMode && <AuthModal mode={authMode} onClose={()=>setAuthMode(null)}/>}</>}

function AuthModal({ mode, onClose }) {
  const nav = useNavigate();
  const { login, signup: authSignup, loginWithGoogle } = useAuth();
  const [isSignup, setIsSignup] = useState(mode === 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(''); setIsSubmitting(true);
    try {
      if (!email.trim()) throw new Error('Please enter your email address.');
      if (!password) throw new Error('Please enter your password.');
      if (isSignup && password.length < 6) {
        const passErr = new Error('Password should be at least 6 characters long.');
        passErr.code = 'auth/weak-password';
        throw passErr;
      }
      if (isSignup) {
        await authSignup(name.trim(), email.trim(), password);
        onClose();
        nav('/onboarding', { replace: true });
      } else {
        await login(email.trim(), password);
        onClose();
        nav('/dashboard', { replace: true });
      }
    } catch (err) { setError(getFriendlyErrorMessage(err)); }
    finally { setIsSubmitting(false); }
  };

  const handleGoogle = async () => {
    setError(''); setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      onClose();
      const uid = res?.user?.uid;
      const completed = uid && localStorage.getItem(`ecotrail_onboarding_completed_${uid}`);
      if (isSignup || !completed) {
        nav('/onboarding', { replace: true });
      } else {
        nav('/dashboard', { replace: true });
      }
    }
    catch (err) { setError(getFriendlyErrorMessage(err)); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="auth-visual">
          <div className="auth-visual-top">
            <Logo color="#ffffff" size={34} fontSize="24px"/>
            <span className="auth-badge">✦ Trusted by 40,000+ travellers</span>
          </div>
          <div className="auth-visual-center">
            <Pill>WELCOME TO ECOTRAIL</Pill>
            <h1>Every better<br/>journey starts<br/><i>with a choice.</i></h1>
            <p>Find travel that works for you and the world around you.</p>
          </div>
          <div className="auth-visual-stats">
            <div className="auth-stat"><b>−42%</b><span>avg. carbon saved</span></div>
            <div className="auth-stat"><b>₹1,840</b><span>avg. money saved</span></div>
            <div className="auth-stat"><b>40K+</b><span>eco journeys</span></div>
          </div>
        </div>
        <section className="auth-form">
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
          <div className="form-box">
            <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
            <p>{isSignup ? 'Start planning journeys that matter.' : 'Your next thoughtful journey is waiting.'}</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              {isSignup && (
                <label>Full name (optional)
                  <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}/>
                </label>
              )}
              <label>Email address
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required/>
              </label>
              <label>Password
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required/>
              </label>
              <button className="btn full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Please wait...' : (isSignup ? 'Create account' : 'Log in')} <b>→</b>
              </button>
            </form>
            <div className="or">or continue with</div>
            <div className="social">
              <button type="button" onClick={handleGoogle} style={{width:'100%'}}><b>G</b> Continue with Google</button>
            </div>
            <p className="switch">
              {isSignup ? 'Already have an account?' : 'New to EcoTrail?'}{' '}
              <a href="#" onClick={e=>{e.preventDefault();setIsSignup(s=>!s);setError('');}}>
                {isSignup ? 'Log in' : 'Create an account'}
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Auth({signup=false}){
  const nav = useNavigate();
  const location = useLocation();
  const { login, signup: authSignup, loginWithGoogle, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || '/dashboard';
      nav(destination, { replace: true });
    }
  }, [isAuthenticated, nav, location]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    try {
      if (!email.trim()) throw new Error('Please enter your email address.');
      if (!password) throw new Error('Please enter your password.');
      if (signup && password.length < 6) {
        const passErr = new Error('Password should be at least 6 characters long.');
        passErr.code = 'auth/weak-password';
        throw passErr;
      }

      setIsSubmitting(true);

      if (signup) {
        await authSignup(name.trim(), email.trim(), password);
        nav('/onboarding', { replace: true });
      } else {
        await login(email.trim(), password);
        const destination = location.state?.from?.pathname || '/dashboard';
        nav(destination, { replace: true });
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      const uid = res?.user?.uid;
      const completed = uid && localStorage.getItem(`ecotrail_onboarding_completed_${uid}`);
      if (signup || !completed) {
        nav('/onboarding', { replace: true });
      } else {
        const destination = location.state?.from?.pathname || '/dashboard';
        nav(destination, { replace: true });
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth-visual">
        <div className="auth-visual-top">
          <Logo color="#ffffff" size={34} fontSize="24px"/>
          <span className="auth-badge">✦ Trusted by 40,000+ travellers</span>
        </div>
        <div className="auth-visual-center">
          <Pill>WELCOME TO ECOTRAIL</Pill>
          <h1>Every better<br/>journey starts<br/><i>with a choice.</i></h1>
          <p>Find travel that works for you and the world around you.</p>
        </div>
        <div className="auth-visual-stats">
          <div className="auth-stat"><b>−42%</b><span>avg. carbon saved</span></div>
          <div className="auth-stat"><b>₹1,840</b><span>avg. money saved</span></div>
          <div className="auth-stat"><b>40K+</b><span>eco journeys</span></div>
        </div>
      </div>
      <section className="auth-form">
        <Link className="back" to="/">← Back to home</Link>
        <div className="form-box">
          <Logo color="#0b6c57" size={34} fontSize="24px" style={{ marginBottom: '18px' }}/>
          <h2>{signup ? 'Create your account' : 'Welcome back'}</h2>
          <p>{signup ? 'Start planning journeys that matter.' : 'Your next thoughtful journey is waiting.'}</p>
          
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {signup && (
              <label>Full name (optional)
                <input 
                  type="text" 
                  placeholder="Your name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </label>
            )}
            <label>Email address
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </label>
            <label>Password
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </label>
            
            <button 
              className="btn full" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Please wait...' 
                : (signup ? 'Create account' : 'Log in')} <b>→</b>
            </button>
          </form>

          <div className="or">or continue with</div>
          <div className="social">
            <button type="button" onClick={handleGoogleSignIn} style={{ width: '100%' }}>
              <b>G</b> Continue with Google
            </button>
          </div>

          <p className="switch">
            {signup ? 'Already have an account?' : 'New to EcoTrail?'}{' '}
            <Link to={signup ? '/login' : '/signup'}>
              {signup ? 'Log in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}



function Dashboard(){
  const { user, profile } = useAuth();
  const displayName = user?.displayName || profile?.name || (user?.email ? user.email.split('@')[0] : 'Yashraj Gadilkar');
  const [activePrompt, setActivePrompt] = useState('');

  const handleTriggerPrompt = (promptText) => {
    setActivePrompt(promptText);
    const el = document.getElementById('ai-assistant-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AppLayout>
      <section className="dash-hero">
        {/* Left Content */}
        <div className="dash-hero-left">
          <span className="hero-date-pill">THURSDAY, 11 SEPTEMBER</span>
          <h1 className="dash-hero-title">
            Good morning, {displayName}{' '}
            <span className="hero-sparkle-icon" aria-hidden="true">✦</span>
          </h1>
          <p className="dash-hero-subtitle">
            New places. Greener choices. A better tomorrow.
          </p>
          <Link className="hero-plan-btn" to="/planner">
            <span>Plan a trip</span>
            <span className="hero-plan-arrow">↗</span>
          </Link>
          <div className="dash-hero-footer-tagline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="tagline-leaf-icon" aria-hidden="true">
              <path d="M17.5 3C9 3 5 8.5 5 14C5 17.5 7.5 20.5 11 21C11.5 17.5 13.5 13.5 18 11.5C18 11.5 16 14.5 14.5 17C18.5 15.5 20.5 11 20 6C19.5 4 18.5 3 17.5 3Z" fill="#0b6c57"/>
            </svg>
            <span>Travel Today &bull; Protect Tomorrow</span>
          </div>
        </div>

        {/* Center Editorial Quote over the water */}
        <div className="dash-hero-center-quote" aria-hidden="true">
          <div className="quote-text">
            <span>Same</span>
            <span>Places</span>
            <span>Greener</span>
            <span>Paths</span>
          </div>
          <svg className="quote-underline-svg" width="56" height="8" viewBox="0 0 56 8" fill="none">
            <path d="M2 4.5C16 2 36 2 54 5.5" stroke="#16a34a" strokeWidth="2.8" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Right Floating Frosted-Glass Boxes (Matching Equal Dimensions) */}
        <div className="dash-hero-floating-boxes">
          {/* BOX 1 — ROUTE */}
          <div className="hero-glass-box">
            <div className="hero-glass-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="#0c4a3e"/>
              </svg>
            </div>
            <div className="hero-glass-content">
              <span className="hero-route-title">Mumbai &nbsp;→&nbsp; Goa</span>
            </div>
          </div>

          {/* BOX 2 — ECO-TWIN IMPACT */}
          <div className="hero-glass-box">
            <div className="hero-glass-badge leaf-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 3C9 3 5 8.5 5 14C5 17.5 7.5 20.5 11 21C11.5 17.5 13.5 13.5 18 11.5C18 11.5 16 14.5 14.5 17C18.5 15.5 20.5 11 20 6C19.5 4 18.5 3 17.5 3Z" fill="#16a34a"/>
              </svg>
            </div>
            <div className="hero-glass-content">
              <div className="hero-impact-stat">~ 46% lower CO₂</div>
              <div className="hero-impact-sub">with Eco-Twin travel</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <section className="dash-grid" style={{ marginTop: '28px' }}>
        <div className="section-title">
          <div><Pill>YOUR TRIPS</Pill><h2>Keep exploring</h2></div>
          <Link to="/saved">View all →</Link>
        </div>
        <div className="trip-row">
          <TripCard/>
          <div className="mini-card">
            <b>♧ 1,280 kg</b>
            <span>CO₂ avoided together</span>
            <small>That’s like growing 21 trees.</small>
          </div>
          <div className="mini-card">
            <b>★ 12 places</b>
            <span>Saved for later</span>
            <small>Your travel wishlist is growing.</small>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title">
          <div><Pill>FOR YOUR NEXT ESCAPE</Pill><h2>Made for you</h2></div>
          <Link to="/discover">Discover more →</Link>
        </div>
        <div className="place-grid">{places.slice(0, 3).map(p=><Place key={p.name} p={p}/>)}</div>
      </section>
    </AppLayout>
  );
}

function TripCard({ title = 'Coastal slow days in Goa', route = 'Mumbai → Goa', dates = '24–28 SEP', savedPercent = '46%' } = {}) {
  return (
    <div className="trip-card">
      <div className="trip-photo"></div>
      <div>
        <Pill>UPCOMING · {dates}</Pill>
        <h3>{title}</h3>
        <p>2 travellers · {route}</p>
        <div className="trip-stats">
          <span>♧ {savedPercent} lower CO₂</span>
          <span>✓ All stays verified</span>
        </div>
      </div>
      <b>→</b>
    </div>
  );
}

function Place({p}){
  return (
    <Link to="/discover" className="place">
      <img
        src={p.img}
        alt={p.name}
        onError={(e) => {
          if (e.currentTarget.src !== FALLBACK_IMAGE) {
            e.currentTarget.src = FALLBACK_IMAGE;
          }
        }}
      />
      <div>
        <Pill>{p.tag}</Pill>
        <h3>{p.name}</h3>
        <p>{p.type} <span>★ {p.rating}</span></p>
      </div>
    </Link>
  );
}

function Results() {
  const location = useLocation();
  const trip = location.state || {};
  const origin = trip.origin || 'Mumbai, India';
  const destination = trip.destination || 'Goa, India';
  const dates = trip.dates || '24 Sep – 28 Sep';
  const travellers = trip.travellers || '2 travellers';
  const priorities = trip.selectedPriorities || ['Lower impact'];

  const originCity = origin.split(',')[0].trim();
  const destCity = destination.split(',')[0].trim();

  const [activeTab, setActiveTab] = useState('recommended');

  return (
    <AppLayout>
      <section className="page-top compact">
        <Pill>{originCity.toUpperCase()} → {destCity.toUpperCase()} · {dates.toUpperCase()}</Pill>
        <h1>Your journey, <i>considered.</i></h1>
        <p>We found balanced options tailored for {travellers} prioritizing {priorities.join(', ')}.</p>
      </section>

      <div className="results-tabs">
        <button
          type="button"
          className={activeTab === 'recommended' ? 'active' : ''}
          onClick={() => setActiveTab('recommended')}
        >
          Recommended
        </button>
        <button
          type="button"
          className={activeTab === 'fastest' ? 'active' : ''}
          onClick={() => setActiveTab('fastest')}
        >
          Fastest
        </button>
        <button
          type="button"
          className={activeTab === 'cost' ? 'active' : ''}
          onClick={() => setActiveTab('cost')}
        >
          Lowest cost
        </button>
        <button
          type="button"
          className={activeTab === 'impact' ? 'active' : ''}
          onClick={() => setActiveTab('impact')}
        >
          Lowest impact
        </button>
      </div>

      <section className="results">
        <div>
          <Result
            type="eco"
            origin={originCity}
            destination={destCity}
            dates={dates}
            activeTab={activeTab}
          />
          <Result
            type="regular"
            origin={originCity}
            destination={destCity}
            dates={dates}
            activeTab={activeTab}
          />
        </div>

        <aside className="result-aside">
          <Pill>YOUR IMPACT</Pill>
          <h3>Choose the Eco-Twin</h3>
          <div className="big-number">−46%<span>less CO₂</span></div>
          <p>Choosing electric rail over flight saves the equivalent of 14 kg of coal burned per traveller.</p>
          <Link
            className="arrow-link"
            to="/comparison"
            state={{ origin: originCity, destination: destCity, dates, travellers }}
          >
            See full comparison →
          </Link>
        </aside>
      </section>
    </AppLayout>
  );
}

function Result({ type, origin = 'Mumbai', destination = 'Goa', dates, activeTab = 'recommended' }) {
  const [expanded, setExpanded] = useState(false);
  const eco = type === 'eco';

  const title = eco
    ? `Electric Express Rail (${origin} → ${destination})`
    : `Direct Airline Route (${origin} → ${destination})`;

  const routeSub = eco
    ? `${origin} Central → ${destination} Station · Scenic Daylight Route`
    : `${origin} Airport → ${destination} Airport · Direct`;

  let time = eco ? '8h 15m' : '2h 10m';
  let price = eco ? '1,280' : '4,850';
  let co2 = eco ? '24' : '118';

  if (activeTab === 'fastest') {
    if (eco) { time = '7h 30m'; price = '1,650'; }
  } else if (activeTab === 'cost') {
    if (eco) { price = '850'; time = '9h 10m'; }
  } else if (activeTab === 'impact') {
    if (eco) { co2 = '18'; }
  }

  return (
    <article className={'result ' + type}>
      <div className="result-img"></div>
      <div className="result-content">
        <Pill>{eco ? 'ECOTRAIL PICK' : 'REGULAR OPTION'}</Pill>
        <h2>{title}</h2>
        <p>{routeSub}</p>
        <div className="result-details">
          <span>◷ {time}</span>
          <span>₹ {price}</span>
          <span>♧ {co2} kg CO₂</span>
        </div>
        {eco && <div className="verified">✓ Accessibility &amp; green stays verified</div>}
        {expanded && (
          <div style={{ marginTop: '12px', fontSize: '12.5px', color: '#3d5c52', lineHeight: '1.45' }}>
            <p><strong>Highlights:</strong> Zero flight emissions, authorized direct government booking, and step-free platform access.</p>
            <Link to={`/discover`} style={{ color: '#0b6c57', fontWeight: 700, textDecoration: 'underline' }}>
              Explore official packages for {destination} ↗
            </Link>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        title={expanded ? 'Collapse details' : 'Expand details'}
        aria-label="Toggle details"
      >
        {expanded ? '⌃' : '⌄'}
      </button>
    </article>
  );
}

function Comparison() {
  const location = useLocation();
  const trip = location.state || {};
  const origin = trip.origin || 'Mumbai';
  const destination = trip.destination || 'Goa';
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const comparisonMetrics = [
    ['Carbon emissions', '118 kg CO₂', '24 kg CO₂', '80% lower'],
    ['Total cost', '₹4,850', '₹1,280', '₹3,570 saved'],
    ['Travel time', '2h 10m', '8h 15m', 'Scenic route'],
    ['Comfort', 'Standard seat', 'AC sleeper cabin', 'More legroom'],
    ['Accessibility', 'Limited info', 'Verified step-free', 'Wheelchair ramps']
  ];

  return (
    <AppLayout>
      <section className="page-top compact">
        <Pill>{origin.toUpperCase()} → {destination.toUpperCase()} COMPARISON</Pill>
        <h1>Same destination.<br /><i>Better way to get there.</i></h1>
      </section>

      <section className="compare">
        <div className="compare-head">
          <div>✈ <b>Regular trip</b><span>Direct flight</span></div>
          <div className="eco-head">♧ <b>Eco-Twin</b><span>Electric Rail / Green Transit</span></div>
        </div>
        {comparisonMetrics.map((x) => (
          <div className="compare-row" key={x[0]}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <b className="green">{x[2]} <small>{x[3]}</small></b>
          </div>
        ))}
      </section>

      <div className="compare-cta">
        <span>♧</span>
        <div>
          <b>Your Eco-Twin saves 94 kg of CO₂</b>
          <p>That's the clearest route to a lighter journey to {destination}.</p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={handleSave}
          style={{ cursor: 'pointer' }}
        >
          {savedSuccess ? '✓ Saved to Collection!' : 'Save this trip →'}
        </button>
      </div>
    </AppLayout>
  );
}

function Saved() {
  const [activeTab, setActiveTab] = useState('trips'); // 'trips' | 'places'

  return (
    <AppLayout>
      <section className="page-top compact">
        <Pill>YOUR COLLECTION</Pill>
        <h1>Saved for <i>some day.</i></h1>
        <p>All the little possibilities waiting for the right moment.</p>
      </section>

      <div className="saved-tabs">
        <button
          type="button"
          className={activeTab === 'trips' ? 'active' : ''}
          onClick={() => setActiveTab('trips')}
        >
          Trips (2)
        </button>
        <button
          type="button"
          className={activeTab === 'places' ? 'active' : ''}
          onClick={() => setActiveTab('places')}
        >
          Places ({places.length})
        </button>
      </div>

      {activeTab === 'trips' ? (
        <div className="saved-list">
          <TripCard
            title="Coastal slow days in Goa"
            route="Mumbai → Goa"
            dates="24–28 SEP"
            savedPercent="46%"
          />
          <TripCard
            title="Heritage and temple walk"
            route="Pune → Tirupati"
            dates="12–15 OCT"
            savedPercent="72%"
          />
        </div>
      ) : (
        <div className="place-grid" style={{ marginTop: '20px' }}>
          {places.map((p) => (
            <Place key={p.name} p={p} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}


function App(){
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing/>}/>
        <Route path="/login" element={<Auth/>}/>
        <Route path="/signup" element={<Auth signup/>}/>

        {/* Protected Routes */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding/></ProtectedRoute>}/>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path="/home" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path="/trips" element={<ProtectedRoute><Saved/></ProtectedRoute>}/>
        <Route path="/saved" element={<ProtectedRoute><Saved/></ProtectedRoute>}/>
        <Route path="/profile" element={<ProtectedRoute><MyProfile/></ProtectedRoute>}/>
        <Route path="/preferences" element={<ProtectedRoute><TravelPreferences/></ProtectedRoute>}/>
        <Route path="/settings" element={<ProtectedRoute><SettingsPage/></ProtectedRoute>}/>
        <Route path="/planner" element={<ProtectedRoute><Planner/></ProtectedRoute>}/>
        <Route path="/results" element={<ProtectedRoute><Results/></ProtectedRoute>}/>
        <Route path="/comparison" element={<ProtectedRoute><Comparison/></ProtectedRoute>}/>
        <Route path="/discover" element={<ProtectedRoute><Discover/></ProtectedRoute>}/>
      </Routes>
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
