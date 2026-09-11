import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, getFriendlyErrorMessage } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './styles.css';

const places = [
  {name:'Munnar', type:'Tea country', img:'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=900&q=80', rating:'4.9', tag:'Low-impact stay'},
  {name:'Coorg', type:'Forest trails', img:'https://images.unsplash.com/photo-1580974852861-c381510bc98f?auto=format&fit=crop&w=900&q=80', rating:'4.8', tag:'Accessible'},
  {name:'Hampi', type:'Living heritage', img:'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80', rating:'4.7', tag:'Verified clean'}
];

function Logo(){ return <Link className="logo" to="/"><span>◉</span> eco<span>trail</span></Link> }

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
      <Logo/>

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
          </div>
        </div>
      )}
    </header>
  );
}

function Footer(){return <footer><Logo/><p>Better journeys leave lighter footprints.</p><div><a href="#">Privacy</a><a href="#">Help centre</a><a href="#">Instagram</a></div></footer>}
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
  const [authMode, setAuthMode] = useState(null); // null | 'signup' | 'login'
  const open = (m) => setAuthMode(m);
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
      if (isSignup) await authSignup(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      onClose(); nav('/dashboard', { replace: true });
    } catch (err) { setError(getFriendlyErrorMessage(err)); }
    finally { setIsSubmitting(false); }
  };

  const handleGoogle = async () => {
    setError(''); setIsSubmitting(true);
    try { await loginWithGoogle(); onClose(); nav('/dashboard', { replace: true }); }
    catch (err) { setError(getFriendlyErrorMessage(err)); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="auth-visual">
          <div className="auth-visual-top">
            <Logo/>
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
  const { login, signup: authSignup, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!email.trim()) throw new Error('Please enter your email address.');
      if (!password) throw new Error('Please enter your password.');

      if (signup) {
        // Sign up: creates new account, rejects if email already exists
        await authSignup(name.trim(), email.trim(), password);
      } else {
        // Log in: authenticates existing credentials
        await login(email.trim(), password);
      }
      
      const destination = location.state?.from?.pathname || '/dashboard';
      nav(destination, { replace: true });
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
      await loginWithGoogle();
      const destination = location.state?.from?.pathname || '/dashboard';
      nav(destination, { replace: true });
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
          <Logo/>
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
          <Logo/>
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

const Side = () => {
  const { logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    nav('/login');
  };

  return (
    <aside className="sidebar">
      <Logo/>
      <div className="side-links">
        <NavLink to="/dashboard">▦ Overview</NavLink>
        <NavLink to="/planner">⌁ Plan a trip</NavLink>
        <NavLink to="/discover">⌕ Discover</NavLink>
        <NavLink to="/saved">♡ Saved places</NavLink>
      </div>
      <div className="side-bottom">
        <NavLink to="/profile">◎ Profile & settings</NavLink>
        <a href="#logout" onClick={handleLogout}>↪ Log out</a>
      </div>
    </aside>
  );
};

function AppLayout({children}){
  const { user, profile } = useAuth();
  const initial = (user?.displayName || profile?.name || user?.email || 'A')[0].toUpperCase();

  return (
    <div className="app-shell">
      <Side/>
      <main className="app-main">
        <header className="app-head">
          <div className="search">⌕ Search journeys, places...</div>
          <div>⌁ <span className="profile-dot">{initial}</span></div>
        </header>
        {children}
      </main>
    </div>
  );
}

function Dashboard(){
  const { user, profile } = useAuth();
  const displayName = user?.displayName || profile?.name || (user?.email ? user.email.split('@')[0] : 'Traveler');

  return (
    <AppLayout>
      <section className="dash-hero">
        <div>
          <Pill>THURSDAY, 11 SEPTEMBER</Pill>
          <h1>Good morning, {displayName} <i>✦</i></h1>
          <p>Where will your next better journey take you?</p>
          <Link className="btn" to="/planner">Plan a trip <b>↗</b></Link>
        </div>
        <div className="dash-art">✈<span>Mumbai</span><span>Goa</span></div>
      </section>
      <section className="dash-grid">
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
        <div className="place-grid">{places.map(p=><Place key={p.name} p={p}/>)}</div>
      </section>
    </AppLayout>
  );
}

function TripCard(){return <div className="trip-card"><div className="trip-photo"></div><div><Pill>UPCOMING · 24–28 SEP</Pill><h3>Coastal slow days in Goa</h3><p>2 travellers · Mumbai → Goa</p><div className="trip-stats"><span>♧ 46% lower CO₂</span><span>✓ All stays verified</span></div></div><b>→</b></div>}
function Place({p}){return <Link to="/discover" className="place"><img src={p.img} alt={p.name}/><div><Pill>{p.tag}</Pill><h3>{p.name}</h3><p>{p.type} <span>★ {p.rating}</span></p></div></Link>}

function Planner(){const nav=useNavigate(); return <AppLayout><section className="page-top"><Pill>PLAN A JOURNEY</Pill><h1>Let's make this trip count.</h1><p>Tell us what matters to you. We’ll shape an Eco-Twin around it.</p></section><section className="planner"><div className="planner-form"><label>Where are you going?<div className="input-icon">⌖ <input placeholder="Search a destination" defaultValue="Goa, India"/></div></label><div className="two"><label>Leaving from<input defaultValue="Mumbai, India"/></label><label>Travel dates<input defaultValue="24 Sep — 28 Sep"/></label></div><label>Who’s going?<input defaultValue="2 travellers"/></label><h3>What matters most?</h3><div className="choices"><button className="selected" type="button">♧ Lower impact</button><button type="button">♿ Accessibility</button><button type="button">₹ Budget-friendly</button><button type="button">☼ More comfort</button></div><button className="btn full" onClick={()=>nav('/results')}>Find my Eco-Twin <b>→</b></button></div><aside className="planning-note"><span>✦</span><h3>Travel your way.</h3><p>Your preferences help us find options that feel right — not just look good on paper.</p><ul><li>✓ Transport comparisons</li><li>✓ Verified stays</li><li>✓ Weather-aware ideas</li></ul></aside></section></AppLayout>}
function Results(){return <AppLayout><section className="page-top compact"><Pill>MUMBAI → GOA · 24–28 SEP</Pill><h1>Your journey, <i>considered.</i></h1><p>We found options that balance your priorities beautifully.</p></section><div className="results-tabs"><button className="active">Recommended</button><button>Fastest</button><button>Lowest cost</button><button>Lowest impact</button></div><section className="results"><div><Result type="eco"/><Result type="regular"/></div><aside className="result-aside"><Pill>YOUR IMPACT</Pill><h3>Choose the Eco-Twin</h3><div className="big-number">−46%<span>less CO₂</span></div><p>Choosing train over flight saves the equivalent of 14 kg of coal burned.</p><Link className="arrow-link" to="/comparison">See full comparison →</Link></aside></section></AppLayout>}
function Result({type}){let eco=type==='eco'; return <article className={'result '+type}><div className="result-img"></div><div className="result-content"><Pill>{eco?'ECOTRAIL PICK':'REGULAR OPTION'}</Pill><h2>{eco?'Konkan Railway':'Direct flight'}</h2><p>{eco?'Mumbai CSMT → Madgaon · Overnight':'Mumbai → Goa · 1h 20m'}</p><div className="result-details"><span>◷ {eco?'10h 45m':'3h 40m'}</span><span>₹ {eco?'1,280':'5,180'}</span><span>♧ {eco?'35':'130'} kg CO₂</span></div>{eco&&<div className="verified">✓ Accessibility & hygiene details verified</div>}</div><button>⌄</button></article>}
function Comparison(){return <AppLayout><section className="page-top compact"><Pill>YOUR ECO-TWIN</Pill><h1>Same destination.<br/><i>Better way to get there.</i></h1></section><section className="compare"><div className="compare-head"><div>✈ <b>Regular trip</b><span>Direct flight</span></div><div className="eco-head">♧ <b>Eco-Twin</b><span>Konkan Railway</span></div></div>{[['Carbon emissions','130 kg CO₂','35 kg CO₂','73% lower'],['Total cost','₹5,180','₹1,280','₹3,900 saved'],['Travel time','3h 40m','10h 45m','+7h 05m'],['Comfort','Standard seat','Sleeper cabin','More room'],['Accessibility','Limited info','Verified access','Checked for you']].map(x=><div className="compare-row" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><b className="green">{x[2]} <small>{x[3]}</small></b></div>)}</section><div className="compare-cta"><span>♧</span><div><b>Your Eco-Twin saves 95 kg of CO₂</b><p>That's the clearest route to a lighter journey.</p></div><Link className="btn" to="/saved">Save this trip <b>→</b></Link></div></AppLayout>}
function Discover(){return <AppLayout><section className="discover-title"><Pill>EXPLORE MINDFULLY</Pill><h1>Places that give back.</h1><p>Find inspiring destinations with lighter footprints and richer experiences.</p><div className="discover-search">⌕ <input placeholder="Where do you want to go?"/><button>Search</button></div></section><div className="filters"><button className="active">For you</button><button>Nature</button><button>Culture</button><button>Beach</button><button>Weekend escape</button><button>♿ Accessible</button></div><div className="place-grid large">{places.concat(places).map((p,i)=><Place key={i} p={{...p,name:i>2?['Alleppey','Spiti','Pondicherry'][i-3]:p.name}}/>)}</div></AppLayout>}
function Saved(){return <AppLayout><section className="page-top compact"><Pill>YOUR COLLECTION</Pill><h1>Saved for <i>some day.</i></h1><p>All the little possibilities waiting for the right moment.</p></section><div className="saved-tabs"><button className="active">Trips (2)</button><button>Places (12)</button></div><div className="saved-list"><TripCard/><TripCard/></div></AppLayout>}

function Profile(){
  const { user, profile } = useAuth();
  const displayName = user?.displayName || profile?.name || 'EcoTrail Traveler';
  const email = user?.email || profile?.email || '';
  const initial = (displayName || email || 'A')[0].toUpperCase();

  return (
    <AppLayout>
      <section className="page-top compact">
        <Pill>YOUR ACCOUNT</Pill>
        <h1>Profile & preferences</h1>
        <p>Keep your travel experience personal, practical and thoughtful.</p>
      </section>
      <section className="profile-page">
        <div className="profile-card">
          <div className="avatar">{initial}</div>
          <div>
            <h2>{displayName}</h2>
            <p>{email}</p>
          </div>
          <button>Edit profile</button>
        </div>
        <div className="settings">
          <div><h3>Travel preferences</h3><p>Low impact · Comfort · Train travel</p></div><button>Manage →</button>
          <div><h3>Accessibility needs</h3><p>No preferences added yet</p></div><button>Manage →</button>
          <div><h3>Notifications</h3><p>Trip updates and tailored ideas</p></div><button>Manage →</button>
        </div>
      </section>
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
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path="/planner" element={<ProtectedRoute><Planner/></ProtectedRoute>}/>
        <Route path="/results" element={<ProtectedRoute><Results/></ProtectedRoute>}/>
        <Route path="/comparison" element={<ProtectedRoute><Comparison/></ProtectedRoute>}/>
        <Route path="/discover" element={<ProtectedRoute><Discover/></ProtectedRoute>}/>
        <Route path="/saved" element={<ProtectedRoute><Saved/></ProtectedRoute>}/>
        <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
      </Routes>
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
