import React, { useState } from 'react';
import Popup from '../../components/Popup';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';

const CreateTeacher = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true); setError('');
    try {
      await axios.post('/api/admin/create-teacher', formData);
      navigate('/admin/teachers');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create teacher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Add New Teacher</div>
          <div className="topbar-subtitle">Create a new instructor account for the platform.</div>
        </div>
        <Link to="/admin/teachers" className="btn-outline">
          <i className="fa-solid fa-arrow-left"></i> Back to Teachers
        </Link>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Popup type="error" message={error} clear={setError} />

        <div className="panel">
          <div className="panel-header">Teacher Details</div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="fa-solid fa-user"></i></span>
                  <input type="text" name="fullName" className="form-input" placeholder="e.g. Jane Doe" value={formData.fullName} onChange={handleChange} required />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="fa-solid fa-envelope"></i></span>
                  <input type="email" name="email" className="form-input" placeholder="teacher@school.com" value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label className="form-label">Temporary Password</label>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Link to="/admin/teachers" className="btn-outline">Cancel</Link>
                <button type="submit" className="btn-accent" disabled={loading}>
                  {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Creating...</> : <><i className="fa-solid fa-check"></i> Create Teacher</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTeacher;
