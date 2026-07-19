import React, { useState } from 'react';
import Popup from '../../components/Popup';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';

const CreateQuiz = () => {
  const [formData, setFormData] = useState({ title: '', duration: 30 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || formData.duration < 1) {
      setError('Please provide a valid title and time limit.');
      return;
    }
    setLoading(true); setError('');
    try {
      await axios.post('/api/teacher/create-quiz', formData);
      navigate('/teacher/quizzes');
    } catch (err) {
      setError('Failed to create quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Create New Quiz</div>
          <div className="topbar-subtitle">Set up the details for your new assessment.</div>
        </div>
        <button onClick={() => navigate('/teacher/quizzes')} className="btn-outline">
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
      </div>

      <Popup type="error" message={error} clear={setError} />

      <div className="panel">
        <div className="panel-header">Quiz Configuration</div>
        <div className="panel-body">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Quiz Title</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fa-solid fa-heading"></i>
                </span>
                <input 
                  type="text" 
                  name="title" 
                  className="form-input" 
                  placeholder="E.g., Midterm Exam: Biology 101" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label className="form-label">Time Limit (Minutes)</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fa-regular fa-clock"></i>
                </span>
                <input 
                  type="number" 
                  name="duration" 
                  className="form-input" 
                  min="1" 
                  value={formData.duration} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                Students will be automatically submitted when this time limit is reached.
              </small>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <button type="submit" className="btn-accent" disabled={loading}>
                {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : <><i className="fa-solid fa-check"></i> Create Quiz</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateQuiz;
