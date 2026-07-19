import React, { useState, useContext } from 'react';
import Popup from '../../components/Popup';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      // If we reach here, the login was successful (Axios throws on 401/400)
      const role = result.role;
      if (role === 'Admin') navigate('/admin/dashboard');
      else if (role === 'Teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left panel */}
        <div className="auth-left">
          <div className="auth-left-avatar" style={{
            width: '180px', height: '180px',
            background: 'rgba(124,58,237,.25)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '5rem', color: 'white',
            animation: 'floatAnim 4s ease-in-out infinite'
          }}>
            <i className="fa-solid fa-user-lock"></i>
          </div>
          <div className="auth-left-title">Welcome Back!</div>
          <div className="auth-left-subtitle">Sign in to continue your learning journey</div>
        </div>

        {/* Right panel */}
        <div className="auth-right" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div className="auth-logo" style={{ marginBottom: 0 }}>
              <div className="auth-logo-icon"><i className="fa-solid fa-graduation-cap"></i></div>
              Quiz<span style={{ color: 'var(--accent)' }}>Master</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="topnav-icon-btn" 
                title="Back to Home"
                onClick={() => navigate('/')}
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '.25rem' }}>Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '1.5rem' }}>Enter your credentials to access your account</p>

          <Popup type="error" message={error} clear={setError} />

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fa-solid fa-envelope"></i></span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fa-solid fa-lock"></i></span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <span 
                  className="input-group-text" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </span>
              </div>
            </div>

            <button type="submit" className="btn-accent" style={{ width: '100%', justifyContent: 'center', padding: '.75rem' }} disabled={loading}>
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Signing in...</>
              ) : (
                <><i className="fa-solid fa-right-to-bracket"></i> Sign In</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.9rem', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/auth/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
