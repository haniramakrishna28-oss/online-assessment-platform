import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import { 
  FileText, 
  Clock, 
  Award, 
  Calendar, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock, 
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export default function AvailableExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAvailableExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/exams/available/');
      setExams(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load available exams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableExams();
  }, []);

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flexGrow: 1, padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-success">
              <BookOpen size={13} /> Student Portal
            </span>
            <span className="badge badge-info">
              Published Assessments
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>
            Available Examinations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Select an active examination below to test your knowledge. Timer and autosave will initiate upon starting.
          </p>
        </div>

        {/* Exams Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem auto' }} />
            <p>Loading available exams from PostgreSQL...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '1.5rem', background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5' }}>
            <AlertCircle size={20} style={{ marginBottom: '0.5rem', color: 'var(--danger)' }} />
            <div>{error}</div>
          </div>
        ) : exams.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <FileText size={52} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Active Exams Available</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
              There are currently no published examinations open for attempts. Please check back later or contact your administrator.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {exams.map((exam) => {
              const attemptsLeft = exam.max_attempts - exam.attempts_used;
              const canTake = exam.can_attempt && attemptsLeft > 0;

              return (
                <div key={exam.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ 
                      background: 'rgba(99, 102, 241, 0.15)', 
                      color: '#818cf8', 
                      padding: '3px 10px', 
                      borderRadius: '6px', 
                      fontSize: '0.78rem', 
                      fontWeight: 700 
                    }}>
                      {exam.subject}
                    </span>

                    {canTake ? (
                      <span className="badge badge-success">
                        <span className="pulsing-dot"></span> Open to Attempt
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        Attempts Exhausted
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                    {exam.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flexGrow: 1 }}>
                    {exam.description || 'Comprehensive assessment designed to evaluate your domain knowledge.'}
                  </p>

                  {/* Metrics Box */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '0.5rem', 
                    padding: '0.85rem', 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    borderRadius: '10px',
                    marginBottom: '1.25rem',
                    textAlign: 'center',
                    fontSize: '0.8rem'
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Duration</div>
                      <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{exam.duration_minutes} min</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Questions</div>
                      <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{exam.questions_count}</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Pass Criteria</div>
                      <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>{exam.passing_marks}/{exam.total_marks}</strong>
                    </div>
                  </div>

                  {/* Availability info */}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div>
                      Attempts: <strong>{exam.attempts_used} / {exam.max_attempts}</strong> used ({Math.max(0, attemptsLeft)} remaining)
                    </div>
                    {exam.start_time && exam.end_time && (
                      <div>
                        Window: {new Date(exam.start_time).toLocaleDateString()} - {new Date(exam.end_time).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Start Exam Button */}
                  <button
                    id={`start-exam-btn-${exam.id}`}
                    onClick={() => handleStartExam(exam.id)}
                    className="btn btn-primary"
                    disabled={!canTake}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      fontSize: '0.95rem',
                      opacity: canTake ? 1 : 0.5,
                      cursor: canTake ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {canTake ? (
                      <>
                        <Play size={16} /> Start Examination
                      </>
                    ) : (
                      <>
                        <Lock size={16} /> Maximum Attempts Reached
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
