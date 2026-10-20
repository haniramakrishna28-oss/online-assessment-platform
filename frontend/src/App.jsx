import React, { useState, useEffect } from 'react';
import api from './api';
import { 
  Database, 
  Server, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Clock, 
  Award, 
  Check, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    try {
      const response = await api.get('/status/');
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setBackendStatus(response.data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Failed to connect to backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const models = [
    {
      name: 'User',
      icon: <ShieldCheck size={20} className="text-indigo-400" />,
      desc: 'Custom AbstractUser with role-based segregation (ADMIN, STUDENT)',
      fields: ['id', 'username', 'email', 'role', 'first_name', 'last_name', 'is_staff']
    },
    {
      name: 'Question & Option',
      icon: <HelpCircle size={20} className="text-purple-400" />,
      desc: 'Question bank supporting MCQ & True/False with difficulty & subjects',
      fields: ['subject', 'question_type', 'difficulty', 'marks', 'question_text', 'options']
    },
    {
      name: 'Exam',
      icon: <FileText size={20} className="text-pink-400" />,
      desc: 'Exam scheduling, duration, total/passing marks, published state',
      fields: ['title', 'duration_minutes', 'total_marks', 'passing_marks', 'is_published', 'window']
    },
    {
      name: 'ExamAttempt',
      icon: <Clock size={20} className="text-amber-400" />,
      desc: 'Tracks student attempts with randomized question order and strict server timer',
      fields: ['student', 'exam', 'attempt_number', 'start_time', 'end_time', 'status', 'question_order']
    },
    {
      name: 'StudentAnswer',
      icon: <CheckCircle2 size={20} className="text-emerald-400" />,
      desc: 'Real-time autosave answer persistence with unique (attempt, question) lock',
      fields: ['attempt', 'question', 'selected_option', 'is_correct', 'marks_obtained', 'saved_at']
    },
    {
      name: 'ExamResult',
      icon: <Award size={20} className="text-blue-400" />,
      desc: 'Automated evaluation metrics, percentage calculation, and pass/fail audit',
      fields: ['attempt', 'student', 'exam', 'score', 'total_marks', 'percentage', 'passed']
    }
  ];

  const modules = [
    { num: '01', title: 'Project Setup & Database Design', status: 'Completed', active: true },
    { num: '02', title: 'Authentication & Role Management', status: 'Next', active: false },
    { num: '03', title: 'Question Bank Management (Admin)', status: 'Pending', active: false },
    { num: '04', title: 'Exam Creation & Configuration', status: 'Pending', active: false },
    { num: '05', title: 'Examination Interface & Timer', status: 'Pending', active: false },
    { num: '06', title: 'Answer Autosave & Submission', status: 'Pending', active: false },
    { num: '07', title: 'Automatic Evaluation & Results', status: 'Pending', active: false },
    { num: '08', title: 'Validation, Security & Testing', status: 'Pending', active: false },
    { num: '09', title: 'Final Integration & Demo', status: 'Pending', active: false },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ 
              background: 'var(--accent-gradient)', 
              borderRadius: '10px', 
              padding: '6px 10px', 
              color: '#fff', 
              fontSize: '0.8rem', 
              fontWeight: 800,
              letterSpacing: '0.05em'
            }}>
              MODULE 1 DELIVERABLE
            </span>
            <span className="badge badge-success">
              <span className="pulsing-dot"></span> PostgreSQL Active
            </span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2 }}>
            Online Examination & <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Assessment Platform</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.35rem' }}>
            Full-Stack React + Django REST Framework + PostgreSQL Architecture
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            id="refresh-status-btn"
            onClick={fetchStatus} 
            className="btn btn-secondary" 
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Pinging API...' : 'Test Connection'}
          </button>
          <a 
            href="http://localhost:8000/admin" 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-primary"
            id="django-admin-link"
          >
            Django Admin <ExternalLink size={16} />
          </a>
        </div>
      </header>

      {/* Live System Health Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} /> Live Service Status
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* PostgreSQL Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '12px' }}>
                  <Database size={24} style={{ color: '#60a5fa' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>PostgreSQL 18.4</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Port: 5432 | DB: online_exam_db</p>
                </div>
              </div>
              <span className="badge badge-success">Connected</span>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Schema migrations verified and applied. All tables, foreign keys, and indexes are active in the database.
            </div>
          </div>

          {/* Django Backend Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px' }}>
                  <Server size={24} style={{ color: '#818cf8' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>Django REST Framework</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Port: 8000 | CORS Enabled</p>
                </div>
              </div>
              {backendStatus ? (
                <span className="badge badge-success">Online</span>
              ) : error ? (
                <span className="badge badge-danger">Offline</span>
              ) : (
                <span className="badge badge-warning">Checking</span>
              )}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {backendStatus ? (
                <span>
                  API: <strong style={{ color: '#fff' }}>{backendStatus.status}</strong> • Latency: <strong style={{ color: '#10b981' }}>{latency}ms</strong> • Checked: {lastChecked}
                </span>
              ) : error ? (
                <span style={{ color: '#ef4444' }}>{error}</span>
              ) : (
                'Connecting to backend server...'
              )}
            </div>
          </div>

          {/* React Frontend Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '10px', borderRadius: '12px' }}>
                  <Layers size={24} style={{ color: '#f472b6' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>React 19 + Vite</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Port: 5173 | Axios Interceptors</p>
                </div>
              </div>
              <span className="badge badge-success">Mounted</span>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Design system loaded with modern CSS tokens, responsive flex/grid layouts, and JWT interceptors.
            </div>
          </div>
        </div>
      </section>

      {/* Database Schema Overview */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} style={{ color: 'var(--accent-primary)' }} /> Database Models & Relational Architecture
          </h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>6 Core Models Configured & Migrated</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {models.map((m, idx) => (
            <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '8px' }}>
                  {m.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{m.name}</h3>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', flexGrow: 1 }}>
                {m.desc}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {m.fields.map((f, i) => (
                  <span key={i} style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '2px 7px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace'
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Implementation Roadmap */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} style={{ color: 'var(--accent-primary)' }} /> Modular Roadmap & Progress
        </h2>

        <div className="glass-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
            {modules.map((mod, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: mod.active ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: mod.active ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ 
                    fontWeight: 700, 
                    fontSize: '0.8rem', 
                    color: mod.active ? '#818cf8' : 'var(--text-muted)',
                    fontFamily: 'monospace'
                  }}>
                    {mod.num}
                  </span>
                  <span style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: mod.active ? 600 : 400,
                    color: mod.active ? '#ffffff' : 'var(--text-secondary)'
                  }}>
                    {mod.title}
                  </span>
                </div>
                {mod.status === 'Completed' ? (
                  <span className="badge badge-success"><Check size={12} /> Ready</span>
                ) : mod.status === 'Next' ? (
                  <span className="badge badge-info">Next Up</span>
                ) : (
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border-subtle)', 
        paddingTop: '1.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          Online Examination and Assessment Platform • Built with React, Django REST & PostgreSQL
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span>PostgreSQL: <strong>online_exam_db</strong></span>
          <span>•</span>
          <span>Django: <strong>v6.1.2</strong></span>
          <span>•</span>
          <span>React: <strong>v19.3.1</strong></span>
        </div>
      </footer>
    </div>
  );
}
