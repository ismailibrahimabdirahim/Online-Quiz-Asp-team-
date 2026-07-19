import React, { useEffect, useState } from 'react';
import Popup from '../../components/Popup';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Swal from 'sweetalert2';

const Questions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New question form state
  const [showForm, setShowForm] = useState(false);
  const [questionType, setQuestionType] = useState('MultipleChoice'); // 'MultipleChoice' or 'TrueFalse'
  const [formData, setFormData] = useState({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 1 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`/api/teacher/quizzes/${id}/questions?t=${new Date().getTime()}`);
      if (Array.isArray(res.data)) {
        setQuestions(res.data);
        setQuizTitle('');
      } else {
        setQuestions(res.data.questions || []);
        setQuizTitle(res.data.title || '');
      }
    } catch (err) {
      setError('Failed to fetch questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleTypeChange = (type) => {
    setQuestionType(type);
    if (type === 'TrueFalse') {
      setFormData({ ...formData, optionA: 'True', optionB: 'False', optionC: '', optionD: '', correctOption: 'A' });
    } else {
      setFormData({ ...formData, optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questionType === 'MultipleChoice' && (!formData.text || !formData.optionA || !formData.optionB)) {
      setError('Please provide the question text and at least 2 options.');
      return;
    }
    if (questionType === 'TrueFalse' && !formData.text) {
      setError('Please provide the question text.');
      return;
    }
    setSaving(true); setError('');
    
    let payload;
    if (questionType === 'TrueFalse') {
      payload = {
        questionText: formData.text,
        questionType: 'TrueFalse',
        marks: parseInt(formData.marks) || 1,
        options: [
          { optionText: 'True', isCorrect: formData.correctOption === 'A' },
          { optionText: 'False', isCorrect: formData.correctOption === 'B' }
        ]
      };
    } else {
      payload = {
        questionText: formData.text,
        questionType: 'MultipleChoice',
        marks: parseInt(formData.marks) || 1,
        options: [
          { optionText: formData.optionA, isCorrect: formData.correctOption === 'A' },
          { optionText: formData.optionB, isCorrect: formData.correctOption === 'B' }
        ]
      };
      if (formData.optionC) {
        payload.options.push({ optionText: formData.optionC, isCorrect: formData.correctOption === 'C' });
      }
      if (formData.optionD) {
        payload.options.push({ optionText: formData.optionD, isCorrect: formData.correctOption === 'D' });
      }
    }

    try {
      const res = await axios.post(`/api/teacher/quizzes/${id}/questions`, payload);
      // Wait for fetch to ensure we have the fully hydrated question with option IDs
      await fetchQuestions();
      setShowForm(false);
      setQuestionType('MultipleChoice');
      setFormData({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 1 });
    } catch (err) {
      setError('Failed to add question.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (questionId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this question?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Yes, delete it!',
      background: document.body.classList.contains('dark-mode') ? '#1A1A2E' : '#FFFFFF',
      color: document.body.classList.contains('dark-mode') ? '#F1F5F9' : '#1F2937',
      customClass: { popup: 'beautiful-popup' }
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/api/teacher/questions/${questionId}`);
      setQuestions(questions.filter(q => q.questionId !== questionId));
    } catch (err) {
      setError('Failed to delete question.');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <i className="fa-solid fa-spinner fa-spin fa-2x text-accent"></i>
    </div>
  );

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Editing: {quizTitle || 'Quiz'}</div>
          <div className="topbar-subtitle">Manage questions for this assessment.</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/teacher/quizzes')} className="btn-outline">
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-accent">
              <i className="fa-solid fa-plus"></i> Add Question
            </button>
          )}
        </div>
      </div>

      <Popup type="error" message={error} clear={setError} />

      {showForm && (
        <div className="panel">
          <div className="panel-header">Create New Question</div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Question Text</label>
                  <textarea 
                    name="text" 
                    className="form-input" 
                    rows="2" 
                    placeholder={`E.g., What is the main concept of ${quizTitle || 'this topic'}?`} 
                    value={formData.text} 
                    onChange={handleChange} 
                    required
                  ></textarea>
                </div>
                <div style={{ width: '100px' }}>
                  <label className="form-label">Marks</label>
                  <input 
                    type="number" 
                    name="marks" 
                    className="form-input" 
                    min="1" 
                    value={formData.marks} 
                    onChange={handleChange} 
                    required
                    style={{ minHeight: '42px', padding: '0.4rem 0.6rem' }}
                  />
                </div>
              </div>

              {/* Question Type Switcher */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.4rem' }}>Question Type</label>
                <div style={{ display: 'flex', gap: '0', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid var(--border)', width: 'fit-content' }}>
                  <button type="button" onClick={() => handleTypeChange('MultipleChoice')}
                    style={{ padding: '0.45rem 1.2rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s ease',
                      background: questionType === 'MultipleChoice' ? 'var(--accent)' : 'var(--surface)',
                      color: questionType === 'MultipleChoice' ? 'white' : 'var(--text-secondary)' }}>
                    <i className="fa-solid fa-circle-dot" style={{ marginRight: '6px' }}></i>Multiple Choice
                  </button>
                  <button type="button" onClick={() => handleTypeChange('TrueFalse')}
                    style={{ padding: '0.45rem 1.2rem', border: 'none', borderLeft: '1.5px solid var(--border)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s ease',
                      background: questionType === 'TrueFalse' ? 'var(--accent)' : 'var(--surface)',
                      color: questionType === 'TrueFalse' ? 'white' : 'var(--text-secondary)' }}>
                    <i className="fa-solid fa-check-double" style={{ marginRight: '6px' }}></i>True / False
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.4rem' }}>Answer Options</label>
                
                {questionType === 'TrueFalse' ? (
                  /* ── True / False Layout ── */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div onClick={() => setFormData({ ...formData, correctOption: 'A' })}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s ease',
                        background: formData.correctOption === 'A' ? '#D1FAE5' : 'var(--surface)',
                        border: formData.correctOption === 'A' ? '2px solid #10B981' : '2px solid var(--border)',
                        fontWeight: formData.correctOption === 'A' ? 700 : 500,
                        color: formData.correctOption === 'A' ? '#047857' : 'var(--text-secondary)' }}>
                      <i className={`fa-solid ${formData.correctOption === 'A' ? 'fa-circle-check' : 'fa-circle'}`} style={{ fontSize: '1.1rem' }}></i>
                      <span style={{ fontSize: '1rem' }}>True</span>
                    </div>
                    <div onClick={() => setFormData({ ...formData, correctOption: 'B' })}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s ease',
                        background: formData.correctOption === 'B' ? '#FEE2E2' : 'var(--surface)',
                        border: formData.correctOption === 'B' ? '2px solid #EF4444' : '2px solid var(--border)',
                        fontWeight: formData.correctOption === 'B' ? 700 : 500,
                        color: formData.correctOption === 'B' ? '#B91C1C' : 'var(--text-secondary)' }}>
                      <i className={`fa-solid ${formData.correctOption === 'B' ? 'fa-circle-xmark' : 'fa-circle'}`} style={{ fontSize: '1.1rem' }}></i>
                      <span style={{ fontSize: '1rem' }}>False</span>
                    </div>
                  </div>
                ) : (
                  /* ── Multiple Choice Layout ── */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    {/* Option A */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)', background: formData.correctOption === 'A' ? 'var(--accent-light)' : 'transparent', border: formData.correctOption === 'A' ? '1.5px solid var(--accent)' : '1.5px solid transparent', transition: 'all 0.2s ease' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', margin: 0, minWidth: '85px' }}>
                        <input type="radio" name="correctOption" value="A" checked={formData.correctOption === 'A'} onChange={handleChange} style={{ cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: formData.correctOption === 'A' ? 700 : 500, color: formData.correctOption === 'A' ? 'var(--accent-dark)' : 'var(--text-main)' }}>Option A <span className="text-danger">*</span></span>
                      </label>
                      <input type="text" name="optionA" className="form-input" placeholder="Enter option A" value={formData.optionA} onChange={handleChange} required style={{ flex: 1, padding: '0.4rem 0.6rem', minHeight: '36px' }} />
                    </div>

                    {/* Option B */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)', background: formData.correctOption === 'B' ? 'var(--accent-light)' : 'transparent', border: formData.correctOption === 'B' ? '1.5px solid var(--accent)' : '1.5px solid transparent', transition: 'all 0.2s ease' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', margin: 0, minWidth: '85px' }}>
                        <input type="radio" name="correctOption" value="B" checked={formData.correctOption === 'B'} onChange={handleChange} style={{ cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: formData.correctOption === 'B' ? 700 : 500, color: formData.correctOption === 'B' ? 'var(--accent-dark)' : 'var(--text-main)' }}>Option B <span className="text-danger">*</span></span>
                      </label>
                      <input type="text" name="optionB" className="form-input" placeholder="Enter option B" value={formData.optionB} onChange={handleChange} required style={{ flex: 1, padding: '0.4rem 0.6rem', minHeight: '36px' }} />
                    </div>

                    {/* Option C */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)', background: formData.correctOption === 'C' ? 'var(--accent-light)' : 'transparent', border: formData.correctOption === 'C' ? '1.5px solid var(--accent)' : '1.5px solid transparent', transition: 'all 0.2s ease' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', margin: 0, minWidth: '85px' }}>
                        <input type="radio" name="correctOption" value="C" checked={formData.correctOption === 'C'} onChange={handleChange} style={{ cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: formData.correctOption === 'C' ? 700 : 500, color: formData.correctOption === 'C' ? 'var(--accent-dark)' : 'var(--text-main)' }}>Option C</span>
                      </label>
                      <input type="text" name="optionC" className="form-input" placeholder="Enter option C" value={formData.optionC} onChange={handleChange} style={{ flex: 1, padding: '0.4rem 0.6rem', minHeight: '36px' }} />
                    </div>

                    {/* Option D */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)', background: formData.correctOption === 'D' ? 'var(--accent-light)' : 'transparent', border: formData.correctOption === 'D' ? '1.5px solid var(--accent)' : '1.5px solid transparent', transition: 'all 0.2s ease' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', margin: 0, minWidth: '85px' }}>
                        <input type="radio" name="correctOption" value="D" checked={formData.correctOption === 'D'} onChange={handleChange} style={{ cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: formData.correctOption === 'D' ? 700 : 500, color: formData.correctOption === 'D' ? 'var(--accent-dark)' : 'var(--text-main)' }}>Option D</span>
                      </label>
                      <input type="text" name="optionD" className="form-input" placeholder="Enter option D" value={formData.optionD} onChange={handleChange} style={{ flex: 1, padding: '0.4rem 0.6rem', minHeight: '36px' }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline" style={{ padding: '0.4rem 1rem' }}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={saving} style={{ padding: '0.4rem 1rem' }}>
                  {saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : <><i className="fa-solid fa-plus"></i> Add Question</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Current Questions ({questions.length})
        </h3>
        {questions.length === 0 && !showForm ? (
          <div className="empty-state" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
            <i className="fa-regular fa-folder-open"></i>
            <h3>No questions added yet</h3>
            <p>Click "Add Question" to start building your quiz.</p>
          </div>
        ) : (
          questions.map((q, index) => (
            <div key={q.questionId} className="question-card">
              <div className="question-card-header">
                <div className="question-card-title"><span style={{ color: 'var(--accent)', marginRight: '6px' }}>{index + 1}.</span> {q.questionText}</div>
                <button onClick={() => handleDelete(q.questionId)} className="btn-danger" style={{ padding: '.3rem .6rem', fontSize: '.75rem', borderRadius: '6px' }}>
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
              <ul className="question-options-list">
                {q.options?.map((opt, optIndex) => {
                  const letter = String.fromCharCode(65 + optIndex); // A, B, C, D...
                  return (
                    <li key={opt.optionId || optIndex} className={`question-option ${opt.isCorrect ? 'correct' : ''}`}>
                      <div className="option-letter" style={{ width: '24px', height: '24px', fontSize: '.7rem', ...(opt.isCorrect ? { background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' } : {}) }}>{letter}</div> {opt.optionText}
                      {opt.isCorrect && <i className="fa-solid fa-check" style={{ marginLeft: 'auto' }}></i>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Questions;
