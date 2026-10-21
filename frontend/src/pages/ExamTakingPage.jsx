import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  ShieldAlert,
  HelpCircle,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export default function ExamTakingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptData, setAttemptData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionId }
  const [flagged, setFlagged] = useState({}); // { questionId: boolean }
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'saving' | 'saved' | 'error'
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeExpiredModal, setTimeExpiredModal] = useState(false);

  const timerRef = useRef(null);
  const isExpiredHandledRef = useRef(false);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (secs) => {
    if (secs <= 0) return '00:00';
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Submit attempt helper
  const submitExam = useCallback(async (isExpired = false) => {
    if (submitting || !attemptData) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/attempts/${attemptData.id}/submit/`);
      const resultId = res.data?.result?.id;
      if (resultId) {
        navigate(`/results/${resultId}`, { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      const resultId = err.response?.data?.result?.id;
      if (resultId) {
        navigate(`/results/${resultId}`, { replace: true });
      } else {
        setError(err.response?.data?.detail || 'Failed to submit exam.');
        setSubmitting(false);
      }
    }
  }, [attemptData, submitting, navigate]);

  // Load or resume attempt
  useEffect(() => {
    let isMounted = true;

    const startOrResumeExam = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post(`/exams/${id}/start/`);
        if (!isMounted) return;

        const data = res.data;
        setAttemptData(data);
        setRemainingSeconds(Math.max(0, data.remaining_seconds || 0));

        // Restore saved answers from PostgreSQL
        if (data.saved_answers) {
          const restoredAnswers = {};
          // data.saved_answers is { qId: optId }
          Object.entries(data.saved_answers).forEach(([qId, optId]) => {
            if (optId) {
              restoredAnswers[Number(qId)] = optId;
            }
          });
          setAnswers(restoredAnswers);
        }

        if (data.remaining_seconds <= 0) {
          setTimeExpiredModal(true);
          submitExam(true);
        }
      } catch (err) {
        if (!isMounted) return;
        const detail = err.response?.data?.detail || 'Unable to start or resume this exam.';
        setError(detail);
        if (err.response?.data?.expired) {
          setTimeExpiredModal(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    startOrResumeExam();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id, submitExam]);

  // Persistent Countdown Timer
  useEffect(() => {
    if (loading || !attemptData || remainingSeconds <= 0) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!isExpiredHandledRef.current) {
            isExpiredHandledRef.current = true;
            setTimeExpiredModal(true);
            submitExam(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, attemptData, submitExam]);

  // Autosave answer selection to PostgreSQL
  const handleSelectOption = async (questionId, optionId) => {
    // Optimistic local update
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    if (!attemptData) return;

    setSaveStatus('saving');
    try {
      const res = await api.post(`/attempts/${attemptData.id}/autosave/`, {
        question_id: questionId,
        selected_option_id: optionId,
      });

      if (res.data?.expired) {
        setTimeExpiredModal(true);
        submitExam(true);
        return;
      }

      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
      if (typeof res.data?.remaining_seconds === 'number') {
        // Soft sync remaining seconds with server
        setRemainingSeconds(res.data.remaining_seconds);
      }
    } catch (err) {
      setSaveStatus('error');
      if (err.response?.data?.expired) {
        setTimeExpiredModal(true);
        submitExam(true);
      }
    }
  };

  const handleClearAnswer = async (questionId) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });

    if (!attemptData) return;

    setSaveStatus('saving');
    try {
      await api.post(`/attempts/${attemptData.id}/autosave/`, {
        question_id: questionId,
        selected_option_id: null,
      });
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch {
      setSaveStatus('error');
    }
  };

  const handleToggleFlag = (questionId) => {
    setFlagged((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        background: 'var(--bg-main)'
      }}>
        <Loader2 size={44} className="spin-animation" style={{ color: 'var(--primary)' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading Examination Environment...</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Restoring attempt state, randomized questions, and answers from PostgreSQL.
        </p>
      </div>
    );
  }

  if (error && !attemptData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-main)'
      }}>
        <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
          <ShieldAlert size={48} style={{ color: 'var(--danger)', margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            {error}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/student/exams')}>
            Return to Available Exams
          </button>
        </div>
      </div>
    );
  }

  const questions = attemptData?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || null;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  const isLowTime = remainingSeconds < 300; // < 5 mins
  const isCriticalTime = remainingSeconds < 60; // < 1 min

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Top Test Header Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--portal-gradient)',
        color: '#ffffff',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '0.85rem 1.5rem',
        boxShadow: '0 4px 20px rgba(79, 70, 229, 0.25)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Exam info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <BookOpen size={12} /> {attemptData?.exam_subject || 'Assessment'}
              </span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                Attempt #{attemptData?.attempt_number}
              </span>
            </div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {attemptData?.exam_title}
            </h1>
          </div>

          {/* Center Autosave indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.825rem',
            padding: '0.45rem 0.9rem',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            fontWeight: 600
          }}>
            {saveStatus === 'saving' && (
              <>
                <Loader2 size={14} className="spin-animation" style={{ color: '#ffffff' }} />
                <span>Autosaving to PostgreSQL...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 size={14} style={{ color: '#6ee7b7' }} />
                <span>
                  All answers saved {lastSavedTime ? `at ${lastSavedTime}` : ''}
                </span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertTriangle size={14} style={{ color: '#fca5a5' }} />
                <span>Autosave connection error</span>
              </>
            )}
            {saveStatus === 'idle' && (
              <>
                <CheckCircle2 size={14} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                <span>PostgreSQL Autosave Active</span>
              </>
            )}
          </div>

          {/* Right Timer & Quick Submit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '0.05em',
              background: isCriticalTime
                ? '#fef2f2'
                : isLowTime
                ? '#fffbeb'
                : '#ffffff',
              color: isCriticalTime ? 'var(--danger)' : isLowTime ? 'var(--warning)' : 'var(--primary)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              animation: isCriticalTime ? 'pulse 1s infinite' : 'none'
            }}>
              <Clock size={18} />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            <button
              className="btn btn-secondary"
              style={{
                padding: '0.55rem 1.15rem',
                fontSize: '0.9rem',
                borderRadius: '9999px',
                fontWeight: 700,
                background: '#ffffff',
                color: 'var(--primary)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting}
            >
              <Send size={15} />
              <span>Finish Exam</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Body */}
      <main style={{
        flexGrow: 1,
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Active Question Workspace */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '620px', padding: '1.75rem' }}>
          {currentQuestion ? (
            <>
              {/* Question Meta Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span className="badge badge-info">
                    {currentQuestion.marks} {currentQuestion.marks === 1 ? 'Mark' : 'Marks'}
                  </span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {currentQuestion.question_type === 'MCQ' ? 'Multiple Choice' : 'True / False'}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleFlag(currentQuestion.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: flagged[currentQuestion.id] ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    border: flagged[currentQuestion.id] ? '1px solid var(--warning)' : '1px solid var(--border-color)',
                    color: flagged[currentQuestion.id] ? 'var(--warning)' : 'var(--text-secondary)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Bookmark size={15} fill={flagged[currentQuestion.id] ? 'var(--warning)' : 'none'} />
                  <span>{flagged[currentQuestion.id] ? 'Flagged for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Question Text */}
              <div style={{
                fontSize: '1.15rem',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                marginBottom: '2rem',
                fontWeight: 500,
                whiteSpace: 'pre-wrap'
              }}>
                {currentQuestion.text}
              </div>

              {/* Options List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.5rem' }}>
                {currentQuestion.options?.map((option, optIdx) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <label
                      key={option.id}
                      onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 1.25rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: isSelected ? '#eef2ff' : '#f8fafc',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                        boxShadow: isSelected ? '0 4px 14px rgba(79, 70, 229, 0.15)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ display: 'none' }}
                      />

                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        flexShrink: 0,
                        background: isSelected ? 'var(--primary)' : '#e2e8f0',
                        color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        transition: 'all 0.15s ease'
                      }}>
                        {optionLabel}
                      </div>

                      <div style={{
                        fontSize: '1rem',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 600 : 400,
                        flexGrow: 1
                      }}>
                        {option.text}
                      </div>

                      {isSelected && (
                        <CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Navigation Footer */}
              <div style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1.25rem'
              }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  style={{ gap: '0.4rem' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {answers[currentQuestion.id] && (
                    <button
                      className="btn"
                      onClick={() => handleClearAnswer(currentQuestion.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <RotateCcw size={14} /> Clear Choice
                    </button>
                  )}

                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      style={{ gap: '0.4rem' }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowSubmitModal(true)}
                      style={{ gap: '0.4rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                    >
                      Review & Submit <Send size={15} />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
              <HelpCircle size={48} style={{ margin: '0 auto 1rem auto' }} />
              <p>No question selected.</p>
            </div>
          )}
        </section>

        {/* Right Column: Question Palette & Overview */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Question Summary Stats */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Attempt Progress
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', textAlign: 'center' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                padding: '0.6rem'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>{answeredCount}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Answered</div>
              </div>

              <div style={{
                background: 'rgba(148, 163, 184, 0.1)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '8px',
                padding: '0.6rem'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{unansweredCount}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Unanswered</div>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '8px',
                padding: '0.6rem'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning)' }}>{flaggedCount}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Flagged</div>
              </div>
            </div>
          </div>

          {/* Palette Grid */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Question Palette
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {answeredCount}/{totalQuestions} completed
              </span>
            </div>

            {/* Grid numbers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.6rem',
              maxHeight: '320px',
              overflowY: 'auto',
              paddingRight: '0.25rem'
            }}>
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(answers[q.id]);
                const isFlagged = Boolean(flagged[q.id]);

                let bg = '#f8fafc';
                let border = '1px solid #e2e8f0';
                let color = 'var(--text-secondary)';

                if (isCurrent) {
                  border = '2px solid var(--primary)';
                  color = '#ffffff';
                  bg = 'var(--primary)';
                } else if (isFlagged) {
                  bg = 'var(--pastel-peach)';
                  border = '1px solid var(--warning)';
                  color = 'var(--warning)';
                } else if (isAnswered) {
                  bg = 'var(--pastel-mint)';
                  border = '1px solid var(--success)';
                  color = 'var(--success)';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      height: '42px',
                      borderRadius: '8px',
                      background: bg,
                      border: border,
                      color: color,
                      fontWeight: isCurrent ? 800 : 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--warning)'
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.6)' }} />
                <span>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-color)' }} />
                <span>Unanswered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(245, 158, 11, 0.7)' }} />
                <span>Flagged</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', border: '2px solid var(--primary)', background: 'transparent' }} />
                <span>Current</span>
              </div>
            </div>

            {/* Big Submit Button */}
            <button
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '1.25rem',
                padding: '0.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
              }}
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting}
            >
              <Send size={16} /> Submit Examination
            </button>
          </div>
        </aside>
      </main>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertTriangle size={28} style={{ color: 'var(--warning)' }} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
                Confirm Exam Submission
              </h2>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to finish and submit your examination? Once submitted, answers are permanently recorded and cannot be modified.
            </p>

            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalQuestions}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total</div>
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>{answeredCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Answered</div>
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: unansweredCount > 0 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                  {unansweredCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Unanswered</div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'var(--warning)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem'
              }}>
                Warning: You still have {unansweredCount} unanswered {unansweredCount === 1 ? 'question' : 'questions'}.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
              >
                Back to Exam
              </button>
              <button
                className="btn btn-primary"
                onClick={() => submitExam(false)}
                disabled={submitting}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spin-animation" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Yes, Submit Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Submit Expired Notification Modal */}
      {timeExpiredModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 150,
          padding: '1.5rem'
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
            <Clock size={52} style={{ color: 'var(--danger)', margin: '0 auto 1.25rem auto', animation: 'pulse 1s infinite' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Time Has Expired!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              The allocated time limit for this examination has reached zero. All saved answers are now being evaluated by the server.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <Loader2 size={18} className="spin-animation" />
              <span>Finalizing evaluation and preparing your results...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
