import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

const Home = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--surface)', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', fontSize: '1.25rem', fontWeight: 800 }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1rem' }}>
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          Quiz<span style={{ color: 'var(--accent)' }}>Master</span> Pro
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Swagger API Documentation Button */}
          <button
            className="topnav-icon-btn"
            title="Open API Documentation (Swagger)"
            onClick={() => window.open('http://localhost:5007/swagger', '_blank')}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-code" style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}></i>
          </button>

          <button
            className="topnav-icon-btn"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={toggleDarkMode}
            style={{ marginRight: '.5rem', border: 'none', background: 'transparent' }}
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`} style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}></i>
          </button>
          <Link to="/auth/login" className="btn-outline" style={{ padding: '.5rem 1.25rem' }}>Sign In</Link>
          <Link to="/auth/register" className="btn-accent glow-shadow" style={{ padding: '.5rem 1.25rem' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ padding: '7rem 2rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto', flex: 1, position: 'relative' }}>
        {/* Background Blur Gradient behind text */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.1) 40%, rgba(251,191,36,0.05) 70%, transparent 100%)',
          filter: 'blur(90px)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-in-up" style={{ display: 'inline-block', padding: '.4rem 1rem', background: 'var(--accent-light)', color: 'var(--accent-dark)', borderRadius: '99px', fontWeight: 700, fontSize: '.85rem', marginBottom: '1.5rem', letterSpacing: '.5px' }}>
            <i className="fa-solid fa-star" style={{ marginRight: '.5rem', color: 'var(--yellow)' }}></i>
            ONLINE QUIZ PLATFORM
          </div>
          
          <h1 className="animate-fade-in-up animate-delay-1" style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            Master Any Subject with <span style={{ color: 'var(--accent)' }}>Gamified Quizzes</span>
          </h1>
          
          <p className="animate-fade-in-up animate-delay-2" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
            Join thousands of students and teachers. Create beautiful assessments, track real-time analytics, and make learning an engaging experience.
          </p>
          
          <div className="animate-fade-in-up animate-delay-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/auth/register" className="btn-accent glow-shadow" style={{ padding: '1rem 2rem', fontSize: '1.1rem', transition: 'all .3s ease' }}>
              Start Learning for Free <i className="fa-solid fa-arrow-right" style={{ marginLeft: '.5rem' }}></i>
            </Link>
            <Link to="/auth/login" className="btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Teacher Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="animate-fade-in-up animate-delay-4" style={{ padding: '2rem 2rem 8rem', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '3.5rem' }}>Why Choose QuizMaster?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            
            {/* Card 1 (Purple) */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'var(--accent)', filter: 'blur(40px)', opacity: 0.15, borderRadius: '16px', zIndex: 0, pointerEvents: 'none', transition: 'opacity 0.3s ease' }}></div>
              <div className="panel" style={{ position: 'relative', zIndex: 1, padding: '2.5rem 2rem', textAlign: 'center', borderTop: '4px solid var(--accent)', transition: 'transform .3s ease', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.previousSibling.style.opacity = '0.3'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.previousSibling.style.opacity = '0.15'; }}>
                <div style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Interactive Learning</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '.95rem' }}>Experience quizzes like never before with instant feedback, timers, and gamified leaderboards.</p>
              </div>
            </div>

            {/* Card 2 (Yellow) */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: '#FBBF24', filter: 'blur(40px)', opacity: 0.15, borderRadius: '16px', zIndex: 0, pointerEvents: 'none', transition: 'opacity 0.3s ease' }}></div>
              <div className="panel" style={{ position: 'relative', zIndex: 1, padding: '2.5rem 2rem', textAlign: 'center', borderTop: '4px solid var(--yellow)', transition: 'transform .3s ease', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.previousSibling.style.opacity = '0.3'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.previousSibling.style.opacity = '0.15'; }}>
                <div style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem', background: '#FEF9C3', color: '#B45309', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                  <i className="fa-solid fa-chart-pie"></i>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Deep Analytics</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '.95rem' }}>Teachers get detailed insights into student performance to identify knowledge gaps instantly.</p>
              </div>
            </div>

            {/* Card 3 (Emerald Green) */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: '#10B981', filter: 'blur(40px)', opacity: 0.15, borderRadius: '16px', zIndex: 0, pointerEvents: 'none', transition: 'opacity 0.3s ease' }}></div>
              <div className="panel" style={{ position: 'relative', zIndex: 1, padding: '2.5rem 2rem', textAlign: 'center', borderTop: '4px solid #10B981', transition: 'transform .3s ease', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.previousSibling.style.opacity = '0.3'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.previousSibling.style.opacity = '0.15'; }}>
                <div style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem', background: '#D1FAE5', color: '#047857', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Secure & Reliable</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '.95rem' }}>Built with state-of-the-art security, ensuring exam integrity and protecting student data.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '4rem 2rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'space-between' }}>
          <div style={{ maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '.9rem' }}>
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              Quiz<span style={{ color: 'var(--accent)' }}>Master</span> Pro
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Empowering educators and students worldwide with engaging, reliable, and gamified assessments.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color='var(--accent)'} onMouseLeave={e => e.target.style.color='var(--text-muted)'}><i className="fa-brands fa-twitter"></i></a>
              <a href="https://github.com/ismailibrahimabdirahim" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color='var(--accent)'} onMouseLeave={e => e.target.style.color='var(--text-muted)'}><i className="fa-brands fa-github"></i></a>
              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color='var(--accent)'} onMouseLeave={e => e.target.style.color='var(--text-muted)'}><i className="fa-brands fa-discord"></i></a>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1.2rem', color: 'var(--text-primary)' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
                <Link to="/auth/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '.95rem' }} onMouseEnter={e => e.target.style.color='var(--accent)'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Features</Link>
                <Link to="/auth/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '.95rem' }} onMouseEnter={e => e.target.style.color='var(--accent)'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Pricing</Link>
                <Link to="/auth/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '.95rem' }} onMouseEnter={e => e.target.style.color='var(--accent)'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Teacher Login</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1.2rem', color: 'var(--text-primary)' }}>Resources</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
                <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '.95rem' }} onMouseEnter={e => e.target.style.color='var(--accent)'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Help Center</a>
                <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '.95rem' }} onMouseEnter={e => e.target.style.color='var(--accent)'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>API Documentation</a>
                <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '.95rem' }} onMouseEnter={e => e.target.style.color='var(--accent)'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Blog</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1100px', margin: '3rem auto 0', paddingTop: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>
          &copy; {new Date().getFullYear()} QuizMaster Pro. All rights reserved. Built for education.
        </div>
      </footer>
    </div>
  );
};

export default Home;
