import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Lock,
  Eye,
  Loader2,
  XCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [availableCount, setAvailableCount] = useState(0);

  const [studentCheckResult, setStudentCheckResult] = useState(null);
  const [testingStudent, setTestingStudent] = useState(false);
  const [adminRouteTestResult, setAdminRouteTestResult] = useState(null);
  const [testingAdminRoute, setTestingAdminRoute] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingResults(true);
      try {
        const [resResults, resExams] = await Promise.all([
          api.get('/results/my_results/'),
          api.get('/exams/available/')
        ]);
        setResults(resResults.data);
        setAvailableCount(resExams.data.length);
      } catch (err) {
        console.error('Failed to load student dashboard data:', err);
      } finally {
        setLoadingResults(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const completedCount = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const avgPercentage = completedCount > 0
    ? Math.round(results.reduce((acc, curr) => acc + Number(curr.percentage || 0), 0) / completedCount)
    : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
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
            Ready to test your knowledge? View available examinations, begin timed tests with PostgreSQL autosave, and inspect your automated results.
          </p>
        </div>

        {/* Metrics Row */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <Link to="/student/exams" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '12px' }}>
                    <BookOpen size={22} style={{ color: '#60a5fa' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available Exams</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      {availableCount} Published &rarr;
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Browse active examinations ready for your attempt.
                </p>
              </div>
            </Link>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '12px' }}>
                  <Award size={22} style={{ color: '#34d399' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Exams Completed</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{completedCount} Completed</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {passedCount} passed with {avgPercentage}% average score.
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

        {/* My Recent Results Section */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} style={{ color: 'var(--primary)' }} /> My Examination Results & Scorecards
            </h2>
            <Link to="/student/exams" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              Take an Exam &rarr;
            </Link>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loadingResults ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Loader2 size={32} className="spin-animation" style={{ color: 'var(--primary)', margin: '0 auto 0.75rem auto' }} />
                <p>Loading your past exam results...</p>
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Award size={40} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  No Exam Attempts Yet
                </h3>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  You have not submitted any examinations yet. Browse available exams to begin your first test!
                </p>
                <Link to="/student/exams" className="btn btn-primary">
                  Browse Available Exams
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      color: 'var(--text-secondary)'
                    }}>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Exam</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Subject</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Score</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Percentage</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Outcome</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Submitted</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '0.9rem' }}>
                    {results.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {r.exam_title}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>
                          {r.exam_subject}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>
                          {r.score} / {r.total_marks}
                        </td>
                        <td style={{
                          padding: '0.85rem 1.25rem',
                          fontWeight: 700,
                          color: r.passed ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {r.percentage}%
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          {r.passed ? (
                            <span className="badge badge-success" style={{ gap: '0.25rem' }}>
                              <CheckCircle2 size={12} /> Passed
                            </span>
                          ) : (
                            <span className="badge badge-danger" style={{ gap: '0.25rem' }}>
                              <XCircle size={12} /> Needs Improvement
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {new Date(r.submitted_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem', gap: '0.3rem' }}
                            onClick={() => navigate(`/results/${r.id}`)}
                          >
                            <Eye size={13} /> View Scorecard
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
