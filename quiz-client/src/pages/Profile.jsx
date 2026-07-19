import React, { useContext, useState, useEffect } from 'react';
import Popup from '../components/Popup';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, checkAuth } = useContext(AuthContext);
  const [formData, setFormData] = useState({ fullName: '', email: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  useEffect(() => {
    if (user) setFormData({ fullName: user.fullName, email: user.email });
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePwChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await axios.put('/api/auth/profile', formData);
      await checkAuth();
      setSuccess('Profile updated successfully.');
      setIsEditing(false); // Disable editing after save
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setAvatarLoading(true);
    setError('');
    
    try {
      await axios.post('/api/auth/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await checkAuth(); // Refresh user data to get new avatar URL
      setSuccess('Profile picture updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPwError('');
    if (!passwords.oldPassword || !passwords.newPassword) {
      setPwError('Please fill in both password fields.'); return;
    }
    if (passwords.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.'); return;
    }
    setPwLoading(true);
    setTimeout(() => {
      setPwLoading(false);
      setPwError('Password changes must be done by the administrator.');
    }, 600);
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const roleColor = user?.role === 'Admin' ? '#7C3AED'
    : user?.role === 'Teacher' ? '#0284C7'
    : '#059669';

  const roleIcon = user?.role === 'Admin' ? 'fa-shield-halved'
    : user?.role === 'Teacher' ? 'fa-chalkboard-user'
    : 'fa-user-graduate';

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Account Management</div>
          <div className="topbar-subtitle">Update your profile details and change your password.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Left Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Avatar Card */}
          <div className="panel" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <label 
              htmlFor="avatar-upload"
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              style={{
                display: 'block',
                width: '110px', height: '110px', borderRadius: '50%',
                margin: '0 auto 1rem', position: 'relative',
                cursor: 'pointer', overflow: 'hidden',
                boxShadow: `0 4px 20px ${roleColor}44`,
                background: user?.avatarUrl ? `url(http://localhost:5007${user.avatarUrl}) center/cover` : `linear-gradient(135deg, ${roleColor}, ${roleColor}bb)`,
                color: 'white'
              }}
            >
              {!user?.avatarUrl && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '2.5rem', fontWeight: 800 }}>
                  {initials}
                </div>
              )}

              {/* Shadowed Gradient Blur Effect Overlay */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3))',
                backdropFilter: 'blur(4px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                opacity: avatarHover || avatarLoading ? 1 : 0,
                transition: 'all 0.3s ease',
                color: 'white'
              }}>
                {avatarLoading ? (
                  <i className="fa-solid fa-spinner fa-spin fa-lg"></i>
                ) : (
                  <>
                    <i className="fa-solid fa-camera fa-lg" style={{ marginBottom: '4px' }}></i>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Change</span>
                  </>
                )}
              </div>
            </label>
            <input 
              type="file" 
              id="avatar-upload" 
              accept="image/png, image/jpeg, image/webp" 
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
              disabled={avatarLoading}
            />
            
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '.25rem' }}>{user?.fullName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '.82rem', marginBottom: '1rem' }}>{user?.email}</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '.5rem',
              background: `${roleColor}18`, color: roleColor,
              padding: '.35rem .9rem', borderRadius: '99px',
              fontWeight: 700, fontSize: '.8rem'
            }}>
              <i className={`fa-solid ${roleIcon}`}></i>
              {user?.role}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="panel">
            <div className="panel-header" style={{ fontSize: '.9rem' }}>
              <i className="fa-solid fa-lock" style={{ marginRight: '8px', color: 'var(--accent)' }}></i>
              Change Password
            </div>
            <div className="panel-body">
              <Popup type="error" message={pwError} clear={setPwError} />
              <Popup type="success" message={pwSuccess} clear={setPwSuccess} />
              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: '.85rem' }}>
                  <label className="form-label" style={{ fontSize: '.82rem' }}>Old Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={passwords.oldPassword}
                    onChange={handlePwChange}
                    style={{ fontSize: '.85rem', padding: '.55rem .85rem' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '.82rem' }}>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={passwords.newPassword}
                    onChange={handlePwChange}
                    style={{ fontSize: '.85rem', padding: '.55rem .85rem' }}
                  />
                </div>
                <button type="submit" className="btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '.85rem', padding: '.55rem' }} disabled={pwLoading}>
                  {pwLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> Changing...</> : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div>
          <Popup type="error" message={error} clear={setError} />
          <Popup type="success" message={success} clear={setSuccess} />

          <div className="panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Profile Information</span>
              <button 
                type="button" 
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: isEditing ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: '.5rem'
                }}
              >
                <i className="fa-solid fa-pen"></i> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
            
            <div className="panel-body">
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                  
                  <div>
                    <label className="form-label">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        className="form-input"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    ) : (
                      <div style={{ padding: '.6rem 1rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                        {user?.fullName}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="form-label">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    ) : (
                      <div style={{ padding: '.6rem 1rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                        {user?.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Role</label>
                    <div style={{ padding: '.6rem 1rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', color: roleColor, fontWeight: 700 }}>
                      {user?.role}
                    </div>
                  </div>

                </div>

                {isEditing && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn-accent" style={{ padding: '.75rem 2rem' }} disabled={loading}>
                      {loading
                        ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
                        : <><i className="fa-solid fa-floppy-disk"></i> Save Profile</>}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
