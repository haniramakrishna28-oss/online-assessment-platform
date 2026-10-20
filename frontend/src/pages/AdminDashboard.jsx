import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Users, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Layers, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
  Cpu
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [adminCheckResult, setAdminCheckResult] = useState(null);
  const [testingAdmin, setTestingAdmin] = useState(false);
  const [studentRouteTestResult, setStudentRouteTestResult] = useState(null);
  const [testingStudentRoute, setTestingStudentRoute] = useState(false);

  const testAdminAccess = async () => {
    setTestingAdmin(true);
    setAdminCheckResult(null);
    try {
      const res = await api.get('/auth/admin-check/');
      setAdminCheckResult({ success: true, data: res.data });
    } catch (err) {
      setAdminCheckResult({ 
        success: false, 
        error: err.response?.data?.detail || err.message 
      });
    } finally {
      setTestingAdmin(false);
    }
  };

  const testStudentRouteAccess = async () => {
    setTestingStudentRoute(true);
    setStudentRouteTestResult(null);
    try {
      const res = await api.get('/auth/student-check/');
      setStudentRouteTestResult({ success: true, data: res.data });
    } catch (err) {
      setStudentRouteTestResult({ 
        success: false, 
        status: err.response?.status,
        error: err.response?.data?.detail || err.message 
      });
    } finally {
      setTestingStudentRoute(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flexGrow: 1, padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {/* Hero Section */}
        <div className="glass-card" style={{ 
          marginBottom: '2rem', 
          padding: '2rem 2.5rem',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.75) 0%, rgba(17, 24, 39, 0.85) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <span className="badge badge-info">
                  <ShieldCheck size={13} /> Administrator Workspace
                </span>
                <span className="badge badge-success">
                  <span className="pulsing-dot"></span> Full Access Granted
                </span>
              </div>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                Welcome, {user?.first_name ? `${user.first_name} (${user.username})` : user?.username}!
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '650px' }}>
                Manage the question bank, configure timed assessments, and review real-time candidate examination performance.
              </p>
            </div>

            <a 
              href="http://localhost:8000/admin" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-secondary"
              id="admin-django-portal-btn"
            >
              Django Admin Portal <ExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* Feature / Module Action Cards */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} style={{ color: 'var(--accent-primary)' }} /> Administrative Controls
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Question Bank (Module 3) */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '10px', borderRadius: '12px' }}>
                  <HelpCircle size={24} style={{ color: '#c084fc' }} />
                </div>
                <span className="badge badge-info">Module 3</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Question Bank</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Create, update, and categorize MCQ & True/False questions by subject, difficulty, and marks.
              </p>
              <Link
                to="/admin/questions"
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem', justifyContent: 'space-between' }}
              >
                <span>Manage Questions</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Exam Management (Module 4) */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px' }}>
                  <FileText size={24} style={{ color: '#818cf8' }} />
                </div>
                <span className="badge badge-info">Module 4</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Exam Configuration</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Configure exam durations, pass criteria, time windows, and select questions for publishing.
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} /> Scheduled in Module 4
              </div>
            </div>

            {/* Student Results (Module 7) */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '12px' }}>
                  <Award size={24} style={{ color: '#60a5fa' }} />
                </div>
                <span className="badge badge-info">Module 7</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Result Analytics</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Review server-side evaluated scores, question-by-question performance, and percentage audits.
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} /> Scheduled in Module 7
              </div>
            </div>
          </div>
        </section>

        {/* Live Backend Role Permission Verification Section */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} style={{ color: 'var(--accent-primary)' }} /> Role-Based Access Control Verification
          </h2>

          <div className="glass-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Test backend role permission enforcement live. Click below to execute authenticated requests against protected Django REST Framework endpoints:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                id="test-admin-check-btn"
                onClick={testAdminAccess}
                className="btn btn-primary"
                disabled={testingAdmin}
              >
                {testingAdmin ? 'Verifying...' : 'Verify Admin Permission (/api/auth/admin-check/)'}
              </button>

              <button 
                id="test-student-check-btn"
                onClick={testStudentRouteAccess}
                className="btn btn-secondary"
                disabled={testingStudentRoute}
              >
                {testingStudentRoute ? 'Testing...' : 'Test Student-Only Endpoint (/api/auth/student-check/)'}
              </button>
            </div>

            {/* Results display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {adminCheckResult && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: adminCheckResult.success ? 'var(--success-bg)' : 'var(--danger-bg)',
                  border: adminCheckResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                }} id="admin-check-result-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {adminCheckResult.success ? (
                      <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                    ) : (
                      <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
                    )}
                    <strong style={{ fontSize: '0.9rem', color: adminCheckResult.success ? '#6ee7b7' : '#fca5a5' }}>
                      Admin Endpoint Result (HTTP 200 OK)
                    </strong>
                  </div>
                  <pre style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)', margin: 0, overflowX: 'auto' }}>
                    {JSON.stringify(adminCheckResult.data || adminCheckResult.error, null, 2)}
                  </pre>
                </div>
              )}

              {studentRouteTestResult && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: studentRouteTestResult.success ? 'var(--info-bg)' : 'rgba(239, 68, 68, 0.12)',
                  border: studentRouteTestResult.success ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                }} id="student-check-result-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <ShieldCheck size={18} style={{ color: studentRouteTestResult.success ? '#60a5fa' : 'var(--danger)' }} />
                    <strong style={{ fontSize: '0.9rem', color: studentRouteTestResult.success ? '#93c5fd' : '#fca5a5' }}>
                      Student-Only Endpoint Result: {studentRouteTestResult.success ? 'Allowed' : `HTTP ${studentRouteTestResult.status} (Forbidden)`}
                    </strong>
                  </div>
                  <pre style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)', margin: 0, overflowX: 'auto' }}>
                    {JSON.stringify(studentRouteTestResult.data || studentRouteTestResult.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
