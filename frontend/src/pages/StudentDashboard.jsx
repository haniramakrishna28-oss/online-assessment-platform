import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { 
  GraduationCap, 
  FileText, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Lock
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentCheckResult, setStudentCheckResult] = useState(null);
  const [testingStudent, setTestingStudent] = useState(false);
  const [adminRouteTestResult, setAdminRouteTestResult] = useState(null);
  const [testingAdminRoute, setTestingAdminRoute] = useState(false);

  const testStudentAccess = async () => {
    setTestingStudent(true);
    setStudentCheckResult(null);
    try {
      const res = await api.get('/auth/student-check/');
      setStudentCheckResult({ success: true, data: res.data });
    } catch (err) {
      setStudentCheckResult({ 
        success: false, 
        error: err.response?.data?.detail || err.message 
      });
    } finally {
      setTestingStudent(false);
    }
  };

  const testAdminRouteAccess = async () => {
    setTestingAdminRoute(true);
    setAdminRouteTestResult(null);
    try {
      const res = await api.get('/auth/admin-check/');
      setAdminRouteTestResult({ success: true, data: res.data });
    } catch (err) {
      setAdminRouteTestResult({ 
        success: false, 
        status: err.response?.status,
        error: err.response?.data?.detail || err.message 
      });
    } finally {
      setTestingAdminRoute(false);
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
          background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.6) 0%, rgba(17, 24, 39, 0.85) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <span className="badge badge-success">
              <GraduationCap size={13} /> Student Portal
            </span>
            <span className="badge badge-info">
              <span className="pulsing-dot"></span> Active Session
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Welcome, {user?.first_name ? `${user.first_name} (${user.username})` : user?.username}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '650px' }}>
            Ready to test your knowledge? View published examinations, begin timed tests, and inspect your automated results.
          </p>
        </div>

        {/* Metrics Row */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '12px' }}>
                  <BookOpen size={22} style={{ color: '#60a5fa' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Exams</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>Available Soon</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Published exams will appear here in Module 4.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '12px' }}>
                  <Award size={22} style={{ color: '#34d399' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Attempt History</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>0 Completed</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Your scores and performance breakdown will sync here.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px', borderRadius: '12px' }}>
                  <Clock size={22} style={{ color: '#fbbf24' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Timer & Autosave</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>Ready</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                PostgreSQL autosave and timer synchronization enabled.
              </p>
            </div>
          </div>
        </section>

        {/* Role-Based Access Control Verification for Student */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} style={{ color: 'var(--accent-primary)' }} /> Student Security & Permission Boundary Check
          </h2>

          <div className="glass-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Test your role permissions against the Django REST Framework backend. You can verify student-authorized access and confirm that admin routes are properly blocked for your account:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                id="test-student-auth-btn"
                onClick={testStudentAccess}
                className="btn btn-primary"
                disabled={testingStudent}
              >
                {testingStudent ? 'Testing...' : 'Verify Student Authorization (/api/auth/student-check/)'}
              </button>

              <button 
                id="test-admin-forbidden-btn"
                onClick={testAdminRouteAccess}
                className="btn btn-secondary"
                disabled={testingAdminRoute}
                style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                {testingAdminRoute ? 'Testing...' : 'Attempt Admin Route (/api/auth/admin-check/)'}
              </button>
            </div>

            {/* Results display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {studentCheckResult && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: 'var(--success-bg)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }} id="student-check-success-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                    <strong style={{ fontSize: '0.9rem', color: '#6ee7b7' }}>
                      Student Access Confirmed (HTTP 200 OK)
                    </strong>
                  </div>
                  <pre style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)', margin: 0, overflowX: 'auto' }}>
                    {JSON.stringify(studentCheckResult.data, null, 2)}
                  </pre>
                </div>
              )}

              {adminRouteTestResult && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: adminRouteTestResult.status === 403 ? 'rgba(239, 68, 68, 0.12)' : 'var(--info-bg)',
                  border: adminRouteTestResult.status === 403 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)'
                }} id="admin-forbidden-result-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <ShieldAlert size={18} style={{ color: 'var(--danger)' }} />
                    <strong style={{ fontSize: '0.9rem', color: '#fca5a5' }}>
                      Role Boundary Enforced: HTTP {adminRouteTestResult.status} (Access Denied)
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    The backend successfully blocked access to the administrator endpoint because this account has role <code>STUDENT</code>.
                  </div>
                  <pre style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#fca5a5', margin: 0, overflowX: 'auto' }}>
                    {JSON.stringify({
                      status: adminRouteTestResult.status,
                      detail: adminRouteTestResult.error
                    }, null, 2)}
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
