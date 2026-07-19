import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ teachers: 0, students: 0, quizzes: 0, results: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <i className="fa-solid fa-spinner fa-spin fa-2x text-accent"></i>
    </div>
  );

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">Welcome back, {user?.fullName} 👋</div>
          <div className="topbar-subtitle">Here's what's happening with your quiz platform today.</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="card-stat">
          <div className="card-stat-title">Total Teachers</div>
          <div className="card-stat-value">{stats.totalTeachers || 0}</div>
          <div className="card-stat-icon"><i className="fa-solid fa-chalkboard-user"></i></div>
        </div>
        <div className="card-stat">
          <div className="card-stat-title">Total Students</div>
          <div className="card-stat-value">{stats.totalStudents || 0}</div>
          <div className="card-stat-icon"><i className="fa-solid fa-user-graduate"></i></div>
        </div>
        <div className="card-stat">
          <div className="card-stat-title">Total Quizzes</div>
          <div className="card-stat-value">{stats.totalQuizzes || 0}</div>
          <div className="card-stat-icon"><i className="fa-solid fa-clipboard-list"></i></div>
        </div>
        <div className="card-stat">
          <div className="card-stat-title">Total Results</div>
          <div className="card-stat-value">{stats.totalResults || 0}</div>
          <div className="card-stat-icon"><i className="fa-solid fa-square-poll-vertical"></i></div>
        </div>
      </div>

    </>
  );
};

export default Dashboard;
