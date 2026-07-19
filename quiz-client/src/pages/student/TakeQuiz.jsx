import React, { useEffect, useState, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

// ─── Animated Countdown Ring ─────────────────────────────────────────────────
const TimerRing = ({ timeLeft, totalTime }) => {
  const radius = 34; // Reduced radius for smaller timer
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const dashOffset = circumference * (1 - progress);
  const isUrgent = timeLeft < 60;
  const isWarning = timeLeft < totalTime * 0.25 && !isUrgent;
  const color = isUrgent ? '#EF4444' : isWarning ? '#F59E0B' : '#7C3AED';
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const timeStr = `${m}:${s < 10 ? '0' : ''}${s}`;
  return (
    <div style={{
      position: 'absolute', top: '50%', right: '1.5rem', transform: 'translateY(-50%)', zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      filter: isUrgent ? `drop-shadow(0 0 10px ${color}99)` : 'none',
      animation: isUrgent ? 'pulse-urgent 1s ease-in-out infinite' : 'none',
    }}>
      <style>{`@keyframes pulse-urgent { 0%, 100% { transform: scale(1) translateY(-50%); } 50% { transform: scale(1.05) translateY(-50%); } }`}</style>
      <div style={{ position: 'relative', width: '84px', height: '84px' }}>
        <svg width="84" height="84" style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <circle cx="42" cy="42" r={radius} fill="var(--surface)" stroke="var(--border)" strokeWidth="6" />
          <circle cx="42" cy="42" r={radius} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }} />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center', lineHeight: 1.1,
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color, letterSpacing: '-0.5px' }}>{timeStr}</div>
          <div style={{ fontSize: '0.45rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
            {isUrgent ? '⚠ Hurry!' : 'Remaining'}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ answered, total }) => {
  const pct = total > 0 ? (answered / total) * 100 : 0;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '4px', zIndex: 1000, background: 'var(--border)' }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
        transition: 'width 0.4s ease', borderRadius: '0 2px 2px 0',
        boxShadow: '0 0 8px #7C3AED88',
      }} />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const submittingRef = useRef(false);
  const answersRef = useRef({});
  const attemptIdRef = useRef(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { attemptIdRef.current = attemptId; }, [attemptId]);
  
  // ── Submit handler (stable ref-based version for timer) ───────────────────
  const doSubmit = useCallback(async (autoSubmit, currentAnswers, currentAttemptId) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSubmit) {
      await Swal.fire({
        title: "⏰ Time's Up!", text: 'Your quiz has been auto-submitted.',
        icon: 'info', timer: 2000, showConfirmButton: false,
        background: document.body.classList.contains('dark-mode') ? '#1A1A2E' : '#FFFFFF',
        color: document.body.classList.contains('dark-mode') ? '#F1F5F9' : '#1F2937',
      });
    }
    const payload = {
      quizId: parseInt(id),
      answers: Object.keys(currentAnswers).map(qId => ({ questionId: parseInt(qId), selectedOptionId: currentAnswers[qId] })),
    };
    try {
      const res = await axios.post(`/api/student/submit-quiz/${currentAttemptId}`, payload);
      await Swal.fire({
        title: '🎉 Submitted!',
        html: `<div style="text-align:center;padding:1rem 0">
          <div style="font-size:3.5rem;font-weight:900;color:#7C3AED;margin-bottom:.5rem">${Math.round(res.data.percentage)}%</div>
          <div style="font-size:1.1rem;font-weight:700;margin-bottom:.5rem">Grade: <span style="color:#7C3AED">${res.data.grade}</span></div>
          <div style="color:#6B7280;font-size:.9rem">Score: ${res.data.score} / ${res.data.totalMarks} marks</div>
        </div>`,
        confirmButtonColor: '#7C3AED', confirmButtonText: 'View My Results',
        background: document.body.classList.contains('dark-mode') ? '#1A1A2E' : '#FFFFFF',
        color: document.body.classList.contains('dark-mode') ? '#F1F5F9' : '#1F2937',
      });
      navigate('/student/results');
    } catch (err) {
      setError('Failed to submit. Please try again.');
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [id, navigate]);

  // ── Timer countdown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!quiz || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          doSubmit(true, answersRef.current, attemptIdRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [quiz]);  // eslint-disable-line

  // ── Start quiz via POST ───────────────────────────────────────────────────
  useEffect(() => {
    const startQuiz = async () => {
      try {
        const res = await axios.post(`/api/student/take-quiz/${id}`);
        const data = res.data;
        setQuiz(data);
        setAttemptId(data.attemptId);
        attemptIdRef.current = data.attemptId;
        
        // Restore saved answers from the backend database
        const loadedAnswers = {};
        if (data.savedAnswers) {
          data.savedAnswers.forEach(ans => {
            loadedAnswers[ans.questionId] = ans.selectedOptionId;
          });
        }
        setAnswers(loadedAnswers);

        // Resume timer accurately
        const seconds = data.remainingSeconds !== undefined ? Math.floor(data.remainingSeconds) : (data.duration || 30) * 60;
        setTimeLeft(seconds);
        setTotalTime((data.duration || 30) * 60); // Total time remains the max duration for the ring progress
        
        if (seconds <= 0) {
          // Attempt has already expired before loading! Auto-submit immediately.
          doSubmit(true, loadedAnswers, data.attemptId);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to start quiz. You may have already taken it.');
      } finally {
        setLoading(false);
      }
    };
    startQuiz();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [id]);

  const handleSelect = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    
    // Auto-save silently in the background
    if (attemptIdRef.current) {
      axios.post(`/api/student/save-answer/${attemptIdRef.current}`, {
        questionId: questionId,
        selectedOptionId: optionId
      }).catch(err => console.error("Failed to auto-save answer:", err));
    }
    
    // Optional: auto-advance to next question after a short delay
    if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
       setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 400);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const totalCount = quiz?.questions?.length || 0;
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < totalCount) {
      await Swal.fire({
        title: 'Incomplete Quiz!',
        html: `You have unanswered questions. Please go back and answer all questions before submitting.`,
        icon: 'error',
        confirmButtonColor: '#7C3AED',
        confirmButtonText: 'Okay',
        background: document.body.classList.contains('dark-mode') ? '#1A1A2E' : '#FFFFFF',
        color: document.body.classList.contains('dark-mode') ? '#F1F5F9' : '#1F2937',
      });
      return; // Block submission
    }
    doSubmit(false, answers, attemptId);
  };


  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };


  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
      <i className="fa-solid fa-spinner fa-spin fa-3x" style={{ color: 'var(--accent)' }}></i>
      <p style={{ color: 'var(--text-muted)' }}>Starting quiz…</p>
    </div>
  );

  if (error && !quiz) return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <i className="fa-solid fa-circle-xmark fa-lg" style={{ marginTop: '2px' }}></i>
        <div><strong>Unable to Start Quiz</strong><p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{error}</p></div>
      </div>
      <button onClick={() => navigate('/student/quizzes')} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <i className="fa-solid fa-arrow-left"></i> Back to Quizzes
      </button>
    </div>
  );

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz?.questions?.length || 0;
  const optionLabels = ['A', 'B', 'C', 'D', 'E'];
  const currentQ = quiz?.questions?.[currentQuestionIndex];

  return (
    <>
      <ProgressBar answered={answeredCount} total={totalQuestions} />

      <div style={{ width: '100%', margin: '0 auto', padding: '1rem 1rem 5rem' }}>
        {/* Quiz Header */}
        <div style={{
          background: 'var(--surface)', padding: '1rem 1.5rem', borderRadius: '14px',
          boxShadow: 'var(--shadow-sm)', marginBottom: '1rem',
          borderTop: '4px solid var(--accent)', position: 'relative',
        }}>
          {/* Decorative background needs to be hidden but not the timer */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '14px', pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '140px', height: '140px',
              background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
              borderRadius: '50%', transform: 'translate(30%, -30%)'
            }} />
          </div>
          
          <TimerRing timeLeft={timeLeft} totalTime={totalTime} />
          
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 .5rem', position: 'relative' }}>{quiz.title}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '.85rem', position: 'relative', alignItems: 'center', paddingRight: '100px' }}>
            <span><i className="fa-solid fa-list-ol" style={{ color: 'var(--accent)', marginRight: '5px' }}></i>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span><i className="fa-solid fa-clock" style={{ color: 'var(--accent)', marginRight: '5px' }}></i>{quiz.duration} min</span>
            <span style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '3px 12px', borderRadius: '99px', fontWeight: 700, fontSize: '0.8rem' }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: '5px' }}></i>{answeredCount}/{totalQuestions} Answered
            </span>
          </div>
        </div>

        {/* Question Progress Dots Removed as requested */}

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {currentQ && (() => {
            const selected = answers[currentQ.questionId];
            return (
              <div style={{
                background: 'var(--surface)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem',
                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
                animation: 'fadeIn 0.3s ease'
              }}>
                <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '1rem' }}>
                  <div style={{
                    minWidth: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: selected ? 'var(--accent)' : 'var(--accent-light)',
                    color: selected ? 'white' : 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.2s ease', marginTop: '2px'
                  }}>
                    {selected ? <i className="fa-solid fa-check" style={{ fontSize: '0.8rem' }}></i> : currentQuestionIndex + 1}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {currentQ.questionText}
                    {currentQ.marks > 1 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '8px' }}>({currentQ.marks} marks)</span>}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '42px', paddingRight: '1rem' }}>
                  {currentQ.options?.map((opt, oi) => {
                    const isSelected = selected === opt.optionId;
                    return (
                      <label key={opt.optionId} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.65rem 1rem', borderRadius: '10px',
                        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--accent-light)' : 'var(--bg)',
                        cursor: 'pointer', transition: 'all 0.15s ease', userSelect: 'none',
                        width: '100%',
                      }}>
                        <input type="radio" name={`q_${currentQ.questionId}`} value={opt.optionId} checked={isSelected}
                          onChange={() => handleSelect(currentQ.questionId, opt.optionId)} style={{ display: 'none' }} />
                        <div style={{
                          minWidth: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          background: isSelected ? 'var(--accent)' : 'transparent',
                          color: isSelected ? 'white' : 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.15s ease',
                        }}>
                          {optionLabels[oi]}
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--accent)' : 'var(--text-primary)', lineHeight: 1.3 }}>
                          {opt.optionText}
                        </span>
                        {isSelected && <i className="fa-solid fa-circle-check" style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: '0.9rem' }}></i>}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', alignItems: 'center' }}>
            <button type="button" onClick={handlePrev} disabled={currentQuestionIndex === 0} style={{
              padding: '0.55rem 1.25rem', borderRadius: '99px', border: '2px solid var(--border)',
              background: 'var(--surface)', color: currentQuestionIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 600,
              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px',
              opacity: currentQuestionIndex === 0 ? 0.5 : 1
            }}>
              <i className="fa-solid fa-arrow-left"></i> Previous
            </button>
            
            {currentQuestionIndex === totalQuestions - 1 ? (
              <button type="button" onClick={handleSubmit} className="btn-accent"
                style={{ padding: '0.55rem 1.5rem', fontSize: '0.9rem', borderRadius: '99px', minWidth: '160px', display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                disabled={submitting}>
                {submitting
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Submitting…</>
                  : <><i className="fa-solid fa-paper-plane"></i> Submit Quiz</>}
              </button>
            ) : (
              <button type="button" onClick={handleNext} style={{
                padding: '0.55rem 1.25rem', borderRadius: '99px', border: 'none',
                background: 'var(--text-primary)', color: 'var(--surface)', fontWeight: 600,
                cursor: 'pointer', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}>
                Next <i className="fa-solid fa-arrow-right"></i>
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default TakeQuiz;
