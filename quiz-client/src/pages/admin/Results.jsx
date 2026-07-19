import React, { useEffect, useState } from 'react';
import Popup from '../../components/Popup';
import axios from '../../api/axios';

const Results = () => {
  const [results, setResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [resResults, resLeaderboard] = await Promise.all([
          axios.get('/api/admin/results'),
          axios.get('/api/admin/leaderboard')
        ]);
        setResults(resResults.data);
        setLeaderboard(resLeaderboard.data);
      } catch (err) {
        setError('Failed to fetch results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Global Results</div>
          <div className="topbar-subtitle">View all student quiz attempts across the platform.</div>
        </div>
      </div>

      <Popup type="error" message={error} clear={setError} />

      <div className="panel">
        <div className="panel-header">Quiz Submissions</div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x text-accent"></i>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-square-poll-vertical"></i>
            <h3>No results found</h3>
            <p>Students have not attempted any quizzes yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Quiz</th>
                  <th>Teacher</th>
                  <th>Score</th>
                  <th>Date Attempted</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.resultId}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.studentName}</td>
                    <td style={{ fontWeight: 600 }}>{r.quizTitle}</td>
                    <td>{r.teacherName}</td>
                    <td>
                      <span className={`badge ${r.score >= 50 ? 'badge-success' : 'badge-danger'}`}>
                        <i className={`fa-solid ${r.score >= 50 ? 'fa-check' : 'fa-xmark'}`} style={{marginRight: '4px'}}></i>
                        {r.score}%
                      </span>
                    </td>
                    <td className="text-muted">{new Date(r.attemptedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: '2rem' }}>
        <div className="panel-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <i className="fa-solid fa-ranking-star" style={{ color: 'var(--accent)' }}></i> Global Student Leaderboard
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x text-accent"></i>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-users-slash"></i>
            <h3>No data available</h3>
            <p>Students have not completed any quizzes yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                  <th>Student Name</th>
                  <th style={{ textAlign: 'center' }}>Quizzes Taken</th>
                  <th style={{ textAlign: 'right' }}>Average Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((student, index) => (
                  <tr key={student.studentId}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {index === 0 ? <span style={{ color: '#F59E0B' }}><i className="fa-solid fa-medal"></i> 1</span>
                       : index === 1 ? <span style={{ color: '#9CA3AF' }}><i className="fa-solid fa-medal"></i> 2</span>
                       : index === 2 ? <span style={{ color: '#B45309' }}><i className="fa-solid fa-medal"></i> 3</span>
                       : <span>{index + 1}</span>}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.studentName}</td>
                    <td style={{ textAlign: 'center' }}>{student.quizzesTaken}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${student.averagePercentage >= 50 ? 'badge-success' : 'badge-danger'}`}>
                        {student.averagePercentage}%
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

export default Results;
