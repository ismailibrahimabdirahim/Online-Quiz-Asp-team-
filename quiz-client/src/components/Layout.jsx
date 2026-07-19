import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const linkClass = ({ isActive }) =>
    `sidebar-menu-link${isActive ? ' active' : ''}`;

  const profilePath = user?.role === 'Admin'
    ? '/admin/profile'
    : user?.role === 'Teacher'
    ? '/teacher/profile'
    : '/student/profile';

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><i className="fa-solid fa-graduation-cap"></i></div>
          Quiz<span>Master</span>
        </div>

        <ul className="sidebar-menu">
          {user?.role === 'Admin' && (
            <>
              <li><NavLink to="/admin/dashboard" className={linkClass}><i className="fa-solid fa-chart-line"></i>Dashboard</NavLink></li>
              <li><NavLink to="/admin/teachers" className={linkClass}><i className="fa-solid fa-chalkboard-user"></i>Teachers</NavLink></li>
              <li><NavLink to="/admin/students" className={linkClass}><i className="fa-solid fa-user-graduate"></i>Students</NavLink></li>
              <li><NavLink to="/admin/quizzes" className={linkClass}><i className="fa-solid fa-clipboard-list"></i>Quizzes</NavLink></li>
              <li><NavLink to="/admin/results" className={linkClass}><i className="fa-solid fa-square-poll-vertical"></i>Results</NavLink></li>
              <li><NavLink to="/admin/logs" className={linkClass}><i className="fa-solid fa-list-check"></i>Audit Logs</NavLink></li>
              <li><NavLink to="/admin/profile" className={linkClass}><i className="fa-solid fa-user"></i>My Profile</NavLink></li>
            </>
          )}
          {user?.role === 'Teacher' && (
            <>
              <li><NavLink to="/teacher/dashboard" className={linkClass}><i className="fa-solid fa-house"></i>Dashboard</NavLink></li>
              <li><NavLink to="/teacher/quizzes" className={linkClass}><i className="fa-solid fa-pen-to-square"></i>My Quizzes</NavLink></li>
              <li><NavLink to="/teacher/attempts" className={linkClass}><i className="fa-solid fa-clipboard-list"></i>Attempts</NavLink></li>
              <li><NavLink to="/teacher/results" className={linkClass}><i className="fa-solid fa-chart-bar"></i>Results</NavLink></li>
              <li><NavLink to="/teacher/profile" className={linkClass}><i className="fa-solid fa-user"></i>My Profile</NavLink></li>
            </>
          )}
          {user?.role === 'Student' && (
            <>
              <li><NavLink to="/student/dashboard" className={linkClass}><i className="fa-solid fa-gauge"></i>Dashboard</NavLink></li>
              <li><NavLink to="/student/quizzes" className={linkClass}><i className="fa-solid fa-feather-pointed"></i>Take Quizzes</NavLink></li>
              <li><NavLink to="/student/results" className={linkClass}><i className="fa-solid fa-clock-rotate-left"></i>My Results</NavLink></li>
              <li><NavLink to="/student/performance" className={linkClass}><i className="fa-solid fa-chart-simple"></i>Performance</NavLink></li>
              <li><NavLink to="/student/leaderboard" className={linkClass}><i className="fa-solid fa-ranking-star"></i>Leaderboard</NavLink></li>
              <li><NavLink to="/student/profile" className={linkClass}><i className="fa-solid fa-user"></i>My Profile</NavLink></li>
            </>
          )}
        </ul>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-name">{user?.fullName}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
          <button onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Global Top Navbar */}
        <div className="global-topnav">
          <div className="global-topnav-left">
            <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--accent)', marginRight: '8px' }}></i>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              QuizMaster <span style={{ color: 'var(--accent)' }}>Pro</span>
            </span>
          </div>
          <div className="global-topnav-right">
            {/* Swagger API Documentation Button */}
            <button
              className="topnav-icon-btn"
              title="Open API Documentation (Swagger)"
              onClick={() => window.open('http://localhost:5007/swagger', '_blank')}
            >
              <i className="fa-solid fa-code"></i>
            </button>

            {/* Dark Mode Toggle */}
            <button
              className="topnav-icon-btn"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              onClick={toggleDarkMode}
            >
              <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            {/* Profile Avatar */}
            <Link 
              to={profilePath} 
              className="topnav-avatar" 
              title={user?.fullName}
              style={user?.avatarUrl ? { 
                background: `url(http://localhost:5007${user.avatarUrl}) center/cover`, 
                color: 'transparent' 
              } : {}}
            >
              {!user?.avatarUrl && initials}
            </Link>

            <div className="topnav-user-info">
              <div className="topnav-user-name">{user?.fullName}</div>
              <div className="topnav-user-role">{user?.role}</div>
            </div>
          </div>
        </div>

        <Outlet />
      </div>
    </>
  );
};

export default Layout;
