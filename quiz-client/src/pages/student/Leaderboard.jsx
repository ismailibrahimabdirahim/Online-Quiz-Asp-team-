import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import Popup from '../../components/Popup';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/api/student/leaderboard');
        setLeaderboard(res.data);
      } catch (err) {
        setError('Failed to fetch leaderboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
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
          <div className="topbar-title">Global Leaderboard</div>
          <div className="topbar-subtitle">See where you rank among all students on the platform.</div>
        </div>
      </div>

      <Popup type="error" message={error} clear={setError} />

      <div className="panel">
        <div className="panel-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <i className="fa-solid fa-trophy" style={{ color: '#F59E0B' }}></i> Top Students
        </div>
        
        {leaderboard.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-ranking-star"></i>
            <h3>No data yet</h3>
            <p>Complete a quiz to get on the leaderboard!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                  <th>Student</th>
                  <th style={{ textAlign: 'center' }}>Quizzes Taken</th>
                  <th style={{ textAlign: 'right' }}>Average Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((student, index) => (
                  <tr key={student.studentId}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {index === 0 ? (
                        <span style={{ color: '#F59E0B', fontSize: '1.2rem' }}><i className="fa-solid fa-medal"></i> 1</span>
                      ) : index === 1 ? (
                        <span style={{ color: '#9CA3AF', fontSize: '1.1rem' }}><i className="fa-solid fa-medal"></i> 2</span>
                      ) : index === 2 ? (
                        <span style={{ color: '#B45309', fontSize: '1.1rem' }}><i className="fa-solid fa-medal"></i> 3</span>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.studentName}</td>
                    <td style={{ textAlign: 'center' }}>{student.quizzesTaken}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${student.averagePercentage >= 50 ? 'badge-success' : 'badge-danger'}`}>
                        {Math.round(student.averagePercentage)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Leaderboard;
