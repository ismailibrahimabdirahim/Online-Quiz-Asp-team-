import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ quizzes: 0, attempts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/teacher/dashboard');
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
      <div className="topbar">
        <div>
          <div className="topbar-title">Welcome back, {user?.fullName} 👨‍🏫</div>
          <div className="topbar-subtitle">Manage your quizzes and track student progress.</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card-stat">
          <div className="card-stat-title">My Quizzes</div>
          <div className="card-stat-value">{stats.quizzes}</div>
          <div className="card-stat-icon"><i className="fa-solid fa-clipboard-list"></i></div>
        </div>
        <div className="card-stat">
          <div className="card-stat-title">Total Attempts</div>
          <div className="card-stat-value">{stats.attempts}</div>
          <div className="card-stat-icon"><i className="fa-solid fa-graduation-cap"></i></div>
        </div>
      </div>

    </>
  );
};

export default Dashboard;
