import React, { useState } from 'react';
import Popup from '../../components/Popup';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Swal from 'sweetalert2';

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      await Swal.fire({
        icon: 'success',
        title: '🎉 Welcome Aboard!',
        html: `<b>${formData.fullName}</b>, your account has been created successfully!<br/><br/>You can now log in and start taking quizzes.`,
        confirmButtonColor: '#7C3AED',
        confirmButtonText: 'Go to Login',
        background: document.body.classList.contains('dark-mode') ? '#1A1A2E' : '#FFFFFF',
        color: document.body.classList.contains('dark-mode') ? '#F1F5F9' : '#1F2937',
        customClass: { popup: 'beautiful-popup' }
      });
      navigate('/auth/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page compact">
      <div className="auth-card">
        {/* Left panel */}
        <div className="auth-left">
          <div style={{
            width: '180px', height: '180px',
            background: 'rgba(124,58,237,.25)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '5rem', color: 'white',
            animation: 'floatAnim 4s ease-in-out infinite'
          }}>
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <div className="auth-left-title">Join QuizMaster</div>
          <div className="auth-left-subtitle">Create your account and start learning today</div>
        </div>

        {/* Right panel */}
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

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '.25rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '1.5rem' }}>Register as a student to take quizzes</p>

          <Popup type="error" message={error} clear={setError} />

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Full Name</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fa-solid fa-user"></i></span>
                <input type="text" name="fullName" className="form-input" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fa-solid fa-envelope"></i></span>
                <input type="email" name="email" className="form-input" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fa-solid fa-lock"></i></span>
                <input type={showPassword ? "text" : "password"} name="password" className="form-input" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required minLength="6" />
                <span 
                  className="input-group-text" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fa-solid fa-lock"></i></span>
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="form-input" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required />
                <span 
                  className="input-group-text" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </span>
              </div>
            </div>

            <button type="submit" className="btn-accent" style={{ width: '100%', justifyContent: 'center', padding: '.75rem' }} disabled={loading}>
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Creating Account...</>
              ) : (
                <><i className="fa-solid fa-user-plus"></i> Register</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.9rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
