import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import {
  Award,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Calendar,
  User,
  BookOpen,
  Loader2,
  X,
  TrendingUp,
  Percent,
  CheckSquare
} from 'lucide-react';

export default function AdminResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PASSED' | 'FAILED'

  // Modal inspection
  const [inspectedResult, setInspectedResult] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resResults, resExams] = await Promise.all([
        api.get('/results/all_results/'),
        api.get('/exams/')
      ]);
      setResults(resResults.data);
      setExams(resExams.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load examination results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter results
  const filteredResults = results.filter((r) => {
    if (selectedExamId && String(r.exam_id) !== String(selectedExamId)) return false;
    if (statusFilter === 'PASSED' && !r.passed) return false;
    if (statusFilter === 'FAILED' && r.passed) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = r.student_full_name?.toLowerCase().includes(term);
      const matchUser = r.student_username?.toLowerCase().includes(term);
      const matchExam = r.exam_title?.toLowerCase().includes(term);
      return matchName || matchUser || matchExam;
    }
    return true;
  });

  // Calculate high-level metrics
  const totalSubmissions = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const overallPassRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;
  const avgPercentage = totalSubmissions > 0
    ? Math.round(results.reduce((acc, curr) => acc + Number(curr.percentage || 0), 0) / totalSubmissions)
    : 0;
  const uniqueStudents = new Set(results.map((r) => r.student_id)).size;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <Navbar />

      <main style={{ flexGrow: 1, padding: '2rem 1.5rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-primary">
              <Award size={13} /> Assessment Analytics
            </span>
            <span className="badge badge-info">
              Admin Portal
            </span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Student Examination Results
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Monitor and evaluate real-time candidate scores, question analytics, and submission history across all published assessments.
          </p>
        </div>

        {/* Analytics Top Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Submissions</span>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                <CheckSquare size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalSubmissions}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              From {uniqueStudents} unique candidates
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Overall Pass Rate</span>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                <Percent size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
              {overallPassRate}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {passedCount} out of {totalSubmissions} passed
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Average Score</span>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa' }}>
              {avgPercentage}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Across all graded attempts
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search candidate name, username, or exam title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            {/* Filter by Exam */}
            <div style={{ minWidth: '200px' }}>
              <select
                className="input-field"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
              >
                <option value="">All Exams ({exams.length})</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                className="btn"
                onClick={() => setStatusFilter('ALL')}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.85rem',
                  background: statusFilter === 'ALL' ? 'var(--primary)' : '#f8fafc',
                  color: statusFilter === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                All
              </button>
              <button
                className="btn"
                onClick={() => setStatusFilter('PASSED')}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.85rem',
                  background: statusFilter === 'PASSED' ? 'var(--success)' : '#f8fafc',
                  color: statusFilter === 'PASSED' ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                Passed
              </button>
              <button
                className="btn"
                onClick={() => setStatusFilter('FAILED')}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.85rem',
                  background: statusFilter === 'FAILED' ? 'var(--danger)' : '#f8fafc',
                  color: statusFilter === 'FAILED' ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                Failed
              </button>
            </div>
          </div>
        </div>

        {/* Results Data Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Loader2 size={36} className="spin-animation" style={{ color: 'var(--primary)', margin: '0 auto 1rem auto' }} />
              <p>Loading candidate evaluation records...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Award size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No Examination Results Found
              </h3>
              <p style={{ fontSize: '0.9rem' }}>
                {results.length === 0
                  ? 'No students have completed exams yet. Once an exam is submitted, evaluation data will appear here automatically.'
                  : 'Try adjusting your search query or filters above.'}
              </p>
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
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)'
                  }}>
                    <th style={{ padding: '1rem 1.25rem' }}>Candidate</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Exam Title</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Attempt</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Score</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Percentage</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Submitted At</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.9rem' }}>
                  {filteredResults.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.student_full_name}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                          @{item.student_username}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {item.exam_title}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                          {item.exam_subject}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge badge-info">
                          Attempt #{item.attempt_number}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.score}
                        </span>{' '}
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          / {item.total_marks}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{
                          fontWeight: 700,
                          color: item.passed ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {item.percentage}%
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        {item.passed ? (
                          <span className="badge badge-success" style={{ gap: '0.3rem' }}>
                            <CheckCircle2 size={12} /> Passed
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ gap: '0.3rem' }}>
                            <XCircle size={12} /> Failed
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                        {new Date(item.submitted_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.3rem' }}
                          onClick={() => setInspectedResult(item)}
                        >
                          <Eye size={14} /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Candidate Attempt Detailed Review Modal */}
      {inspectedResult && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="card" style={{
            maxWidth: '850px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(30, 41, 59, 0.4)'
            }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Submission Review: {inspectedResult.student_full_name}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', margin: '0.2rem 0 0 0' }}>
                  {inspectedResult.exam_title} &bull; Score: {inspectedResult.score}/{inspectedResult.total_marks} ({inspectedResult.percentage}%)
                </p>
              </div>

              <button
                onClick={() => setInspectedResult(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.4rem'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Questions List */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {inspectedResult.answers_review?.map((q, idx) => (
                <div
                  key={q.question_id}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: q.is_correct ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Q{idx + 1}. {q.question_text}</span>
                    <span style={{ fontWeight: 700, color: q.is_correct ? 'var(--success)' : 'var(--danger)' }}>
                      {q.marks_obtained} / {q.marks} Marks
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                    {q.options?.map((opt) => (
                      <div
                        key={opt.id}
                        style={{
                          fontSize: '0.85rem',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          background: opt.is_correct ? 'rgba(16, 185, 129, 0.15)' : opt.is_selected ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                          color: opt.is_correct ? '#34d399' : opt.is_selected ? '#f87171' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{opt.option_text}</span>
                        <span>
                          {opt.is_correct && <strong style={{ color: 'var(--success)' }}>[Correct Answer]</strong>}
                          {opt.is_selected && <span style={{ marginLeft: '0.5rem' }}>(Selected by Candidate)</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              background: 'rgba(30, 41, 59, 0.4)'
            }}>
              <button className="btn btn-secondary" onClick={() => setInspectedResult(null)}>
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
