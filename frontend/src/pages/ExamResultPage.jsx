import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  BookOpen,
  Calendar,
  Loader2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export default function ExamResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'CORRECT' | 'WRONG' | 'UNANSWERED'

  useEffect(() => {
    let isMounted = true;
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/results/${id}/`);
        if (isMounted) setResult(res.data);
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to load exam result details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResult();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: 'var(--text-secondary)'
        }}>
          <Loader2 size={40} className="spin-animation" style={{ color: 'var(--primary)' }} />
          <span>Generating comprehensive evaluation breakdown...</span>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={48} style={{ color: 'var(--danger)', margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Result Not Found</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
            <Link to="/student/dashboard" className="btn btn-primary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const reviewList = result.answers_review || [];
  const filteredReview = reviewList.filter((item) => {
    if (filterMode === 'CORRECT') return item.is_correct;
    if (filterMode === 'WRONG') return !item.is_correct && item.selected_option_id;
    if (filterMode === 'UNANSWERED') return !item.selected_option_id;
    return true;
  });

  const passed = result.passed;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <Navbar />

      <main style={{ flexGrow: 1, padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Navigation back */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="btn btn-secondary"
            style={{ gap: '0.4rem', fontSize: '0.875rem' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <Link to="/student/exams" className="btn btn-primary" style={{ gap: '0.4rem', fontSize: '0.875rem' }}>
            Browse Exams
          </Link>
        </div>

        {/* Hero Performance Card */}
        <section
          className="card"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
            border: passed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
            boxShadow: passed ? '0 8px 32px rgba(16, 185, 129, 0.12)' : '0 8px 32px rgba(239, 68, 68, 0.12)'
          }}
        >
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '100%',
            background: passed
              ? 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.15), transparent 70%)'
              : 'radial-gradient(circle at top right, rgba(239, 68, 68, 0.15), transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-primary">
                  <BookOpen size={12} /> {result.exam_subject}
                </span>
                <span className="badge badge-info">
                  Attempt #{result.attempt_number}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} /> {new Date(result.submitted_at).toLocaleDateString()}
                </span>
              </div>

              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {result.exam_title}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Student: <strong>{result.student_full_name}</strong> ({result.student_username})
              </p>
            </div>

            {/* Pass / Fail Big Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1.5rem',
              borderRadius: '12px',
              background: passed ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
              border: passed ? '1px solid var(--success)' : '1px solid var(--danger)',
              boxShadow: passed ? '0 0 20px rgba(16, 185, 129, 0.25)' : '0 0 20px rgba(239, 68, 68, 0.25)'
            }}>
              {passed ? (
                <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
              ) : (
                <XCircle size={36} style={{ color: 'var(--danger)' }} />
              )}
              <div>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  letterSpacing: '0.05em',
                  color: passed ? 'var(--success)' : 'var(--danger)'
                }}>
                  {passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Passing Mark: {result.passing_marks} / {result.total_marks}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics summary cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Score Achieved
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {result.score} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {result.total_marks}</span>
              </div>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Percentage
              </div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                color: passed ? 'var(--success)' : 'var(--danger)'
              }}>
                {result.percentage}%
              </div>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: '0.3rem' }}>
                Correct Answers
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--success)' }}>
                {result.correct_answers}
              </div>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '0.3rem' }}>
                Incorrect Answers
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--danger)' }}>
                {result.wrong_answers}
              </div>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: '10px',
              background: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Unanswered
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-secondary)' }}>
                {result.unanswered}
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Question-by-Question Review Section */}
        <section>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Question-by-Question Review
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                Inspect your submitted responses alongside correct solutions and mark evaluations.
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn"
                onClick={() => setFilterMode('ALL')}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  background: filterMode === 'ALL' ? 'var(--primary)' : 'rgba(30, 41, 59, 0.6)',
                  color: filterMode === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                All ({reviewList.length})
              </button>
              <button
                className="btn"
                onClick={() => setFilterMode('CORRECT')}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  background: filterMode === 'CORRECT' ? 'var(--success)' : 'rgba(30, 41, 59, 0.6)',
                  color: '#ffffff',
                  border: '1px solid var(--border-color)'
                }}
              >
                Correct ({result.correct_answers})
              </button>
              <button
                className="btn"
                onClick={() => setFilterMode('WRONG')}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  background: filterMode === 'WRONG' ? 'var(--danger)' : 'rgba(30, 41, 59, 0.6)',
                  color: '#ffffff',
                  border: '1px solid var(--border-color)'
                }}
              >
                Incorrect ({result.wrong_answers})
              </button>
              <button
                className="btn"
                onClick={() => setFilterMode('UNANSWERED')}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  background: filterMode === 'UNANSWERED' ? 'var(--text-secondary)' : 'rgba(30, 41, 59, 0.6)',
                  color: '#ffffff',
                  border: '1px solid var(--border-color)'
                }}
              >
                Unanswered ({result.unanswered})
              </button>
            </div>
          </div>

          {/* Questions review list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredReview.map((q, idx) => {
              const isCorrect = q.is_correct;
              const isUnanswered = !q.selected_option_id;

              let statusBadgeBg = 'rgba(16, 185, 129, 0.15)';
              let statusBadgeColor = 'var(--success)';
              let statusText = `+${q.marks_obtained} Marks (Correct)`;

              if (isUnanswered) {
                statusBadgeBg = 'rgba(148, 163, 184, 0.15)';
                statusBadgeColor = 'var(--text-secondary)';
                statusText = '0 Marks (Unanswered)';
              } else if (!isCorrect) {
                statusBadgeBg = 'rgba(239, 68, 68, 0.15)';
                statusBadgeColor = 'var(--danger)';
                statusText = `0 / ${q.marks} Marks (Incorrect)`;
              }

              return (
                <div
                  key={q.question_id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    borderLeft: isCorrect
                      ? '4px solid var(--success)'
                      : isUnanswered
                      ? '4px solid var(--text-secondary)'
                      : '4px solid var(--danger)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Question #{idx + 1}
                    </span>

                    <span style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: statusBadgeBg,
                      color: statusBadgeColor,
                      border: `1px solid ${statusBadgeColor}`
                    }}>
                      {statusText}
                    </span>
                  </div>

                  {/* Question Text */}
                  <div style={{
                    fontSize: '1.05rem',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem',
                    color: 'var(--text-primary)',
                    fontWeight: 500
                  }}>
                    {q.question_text}
                  </div>

                  {/* Options review */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {q.options?.map((opt, optIndex) => {
                      const isCorrectAnswer = opt.is_correct;
                      const isStudentChoice = opt.is_selected;

                      let optBg = '#f8fafc';
                      let optBorder = '1px solid #e2e8f0';
                      let optTextColor = 'var(--text-primary)';

                      if (isCorrectAnswer) {
                        optBg = '#ecfdf5';
                        optBorder = '1.5px solid var(--success)';
                        optTextColor = '#065f46';
                      } else if (isStudentChoice && !isCorrectAnswer) {
                        optBg = '#fef2f2';
                        optBorder = '1.5px solid var(--danger)';
                        optTextColor = '#991b1b';
                      }

                      return (
                        <div
                          key={opt.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            background: optBg,
                            border: optBorder,
                            color: optTextColor,
                            fontSize: '0.925rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{
                              fontWeight: 700,
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              background: 'rgba(255,255,255,0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem'
                            }}>
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span style={{ fontWeight: isStudentChoice || isCorrectAnswer ? 600 : 400 }}>
                              {opt.option_text}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isStudentChoice && (
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                background: isCorrectAnswer ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                                color: '#ffffff',
                                fontWeight: 600
                              }}>
                                Your Selection
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                background: 'rgba(16, 185, 129, 0.3)',
                                color: '#34d399',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem'
                              }}>
                                <CheckCircle2 size={13} /> Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
