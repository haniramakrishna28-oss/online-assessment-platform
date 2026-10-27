import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { 
  FileText, 
  Plus, 
  Search, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  X, 
  Check, 
  Layers,
  Award,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function ExamManagementPage() {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentExamId, setCurrentExamId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Exam Form Data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    duration_minutes: 30,
    passing_marks: 40,
    max_attempts: 1,
    is_published: false,
    start_time: '',
    end_time: '',
    question_ids: []
  });

  // Question selection filter within modal
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState('ALL');

  // Fetch Exams
  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter.toLowerCase();
      const res = await api.get('/exams/', { params });
      setExams(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch exams.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all questions for assignment
  const fetchQuestions = async () => {
    try {
      const res = await api.get('/questions/');
      setQuestions(res.data);
    } catch (err) {
      console.warn('Could not load question bank for exam creator:', err);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExams();
  };

  // Toggle publish state
  const handleTogglePublish = async (exam) => {
    try {
      if (exam.is_published) {
        await api.post(`/exams/${exam.id}/unpublish/`);
      } else {
        await api.post(`/exams/${exam.id}/publish/`);
      }
      setExams(exams.map(e => e.id === exam.id ? { ...e, is_published: !exam.is_published } : e));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update publish state.');
    }
  };

  // Delete Exam
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await api.delete(`/exams/${id}/`);
        setExams(exams.filter(e => e.id !== id));
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete exam.');
      }
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    setCurrentExamId(null);
    setModalError(null);
    setFormData({
      title: '',
      description: '',
      subject: '',
      duration_minutes: 30,
      passing_marks: 40,
      max_attempts: 1,
      is_published: false,
      start_time: '',
      end_time: '',
      question_ids: []
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = async (exam) => {
    setModalMode('edit');
    setCurrentExamId(exam.id);
    setModalError(null);
    try {
      const res = await api.get(`/exams/${exam.id}/`);
      const examDetail = res.data;
      setFormData({
        title: examDetail.title,
        description: examDetail.description || '',
        subject: examDetail.subject,
        duration_minutes: examDetail.duration_minutes,
        passing_marks: examDetail.passing_marks,
        max_attempts: examDetail.max_attempts,
        is_published: examDetail.is_published,
        start_time: examDetail.start_time ? examDetail.start_time.substring(0, 16) : '',
        end_time: examDetail.end_time ? examDetail.end_time.substring(0, 16) : '',
        question_ids: (examDetail.questions || []).map(q => q.id)
      });
      setIsModalOpen(true);
    } catch (err) {
      alert('Failed to load exam details.');
    }
  };

  // Toggle question selection
  const toggleQuestionSelection = (qId) => {
    const selected = new Set(formData.question_ids);
    if (selected.has(qId)) {
      selected.delete(qId);
    } else {
      selected.add(qId);
    }
    setFormData({ ...formData, question_ids: Array.from(selected) });
  };

  // Select all filtered questions
  const selectAllFilteredQuestions = (filteredList) => {
    const current = new Set(formData.question_ids);
    filteredList.forEach(q => current.add(q.id));
    setFormData({ ...formData, question_ids: Array.from(current) });
  };

  // Clear all question selections
  const clearQuestionSelections = () => {
    setFormData({ ...formData, question_ids: [] });
  };

  // Calculate total marks of currently selected questions
  const calculatedTotalMarks = questions
    .filter(q => formData.question_ids.includes(q.id))
    .reduce((sum, q) => sum + (q.marks || 1), 0);

  // Submit Modal
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    if (!formData.title.trim()) {
      setModalError('Exam title is required.');
      setModalLoading(false);
      return;
    }
    if (!formData.subject.trim()) {
      setModalError('Subject is required.');
      setModalLoading(false);
      return;
    }
    if (formData.question_ids.length === 0) {
      setModalError('Please select at least 1 question for the examination.');
      setModalLoading(false);
      return;
    }

    const payload = {
      ...formData,
      total_marks: calculatedTotalMarks,
      start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null,
      end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
    };

    try {
      if (modalMode === 'create') {
        const res = await api.post('/exams/', payload);
        setExams([res.data, ...exams]);
      } else {
        const res = await api.put(`/exams/${currentExamId}/`, payload);
        setExams(exams.map(e => e.id === currentExamId ? res.data : e));
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err) {
      const detail = err.response?.data?.detail || 
                     JSON.stringify(err.response?.data) || 
                     'Failed to save exam.';
      setModalError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setModalLoading(false);
    }
  };

  // Filtered questions inside modal selector
  const modalFilteredQuestions = questions.filter(q => {
    const matchesSubject = questionSubjectFilter === 'ALL' || q.subject === questionSubjectFilter;
    const matchesSearch = !questionSearch.trim() || 
      q.question_text.toLowerCase().includes(questionSearch.toLowerCase()) ||
      q.subject.toLowerCase().includes(questionSearch.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const distinctSubjects = Array.from(new Set(questions.map(q => q.subject)));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flexGrow: 1, padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-info">
                <FileText size={13} /> Exam Administration
              </span>
              <span className="badge badge-success">
                Module 4 Active
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>
              Exam Management & Configuration
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Create, configure duration, select questions, set scheduling windows, and publish exams to students.
            </p>
          </div>

          <button
            id="create-exam-btn"
            onClick={openCreateModal}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.4rem' }}
          >
            <Plus size={18} /> Create New Exam
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flexGrow: 1, minWidth: '240px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="search-exams-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exams by title or subject..."
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ minWidth: '150px' }}>
              <select
                id="filter-exam-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Drafts</option>
              </select>
            </div>

            <button type="submit" className="btn btn-secondary" style={{ padding: '0.65rem 1.15rem' }}>
              Filter
            </button>
          </form>
        </div>

        {/* Exams List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1rem auto' }} />
            <p>Loading exam configurations from PostgreSQL...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '1.5rem', background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#b91c1c' }}>
            <AlertCircle size={20} style={{ marginBottom: '0.5rem', color: 'var(--danger)' }} />
            <div>{error}</div>
          </div>
        ) : exams.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No exams found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              No exams matched your filter. Click below to configure your first examination.
            </p>
            <button onClick={openCreateModal} className="btn btn-primary">
              <Plus size={16} /> Create Exam
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem' }}>
            {exams.map((exam) => (
              <div key={exam.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Card Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <span style={{ 
                    background: 'var(--primary-light)', 
                    color: 'var(--primary-dark)', 
                    padding: '3px 9px', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700 
                  }}>
                    {exam.subject}
                  </span>

                  <span className={exam.is_published ? 'badge badge-success' : 'badge badge-warning'}>
                    {exam.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  {exam.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flexGrow: 1 }}>
                  {exam.description || 'No description provided.'}
                </p>

                {/* Exam Key Metrics */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '0.5rem', 
                  padding: '0.75rem', 
                  background: '#f8fafc', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                  fontSize: '0.78rem'
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Duration</div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{exam.duration_minutes} min</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Questions</div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{exam.questions_count}</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Pass / Total</div>
                    <strong style={{ color: '#059669', fontSize: '0.9rem' }}>{exam.passing_marks}/{exam.total_marks}</strong>
                  </div>
                </div>

                {/* Window info */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={13} />
                  <span>
                    {exam.start_time && exam.end_time ? (
                      `Window: ${new Date(exam.start_time).toLocaleDateString()} - ${new Date(exam.end_time).toLocaleDateString()}`
                    ) : (
                      'Window: Open availability (No expiry)'
                    )}
                  </span>
                  <span>• Max Attempts: <strong>{exam.max_attempts}</strong></span>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <button
                    onClick={() => handleTogglePublish(exam)}
                    className="btn btn-secondary"
                    style={{ 
                      flex: 1, 
                      fontSize: '0.8rem', 
                      padding: '0.45rem',
                      borderColor: exam.is_published ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                      color: exam.is_published ? '#f59e0b' : '#34d399'
                    }}
                  >
                    {exam.is_published ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
                  </button>

                  <button
                    onClick={() => openEditModal(exam)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                    title="Edit exam settings"
                  >
                    <Edit3 size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
                    title="Delete exam"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Exam Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}>
            <div className="glass-card" style={{
              width: '100%',
              maxWidth: '780px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '20px',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {modalMode === 'create' ? 'Configure New Exam' : 'Edit Exam Configuration'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {modalError && (
                <div style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  color: '#b91c1c',
                  fontSize: '0.85rem'
                }}>
                  {modalError}
                </div>
              )}

              <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {/* Title & Subject */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Exam Title
                    </label>
                    <input
                      id="exam-title-input"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Python Core Certification"
                      required
                      style={{
                        width: '100%',
                        padding: '0.7rem 1rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Subject
                    </label>
                    <input
                      id="exam-subject-input"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Python"
                      required
                      style={{
                        width: '100%',
                        padding: '0.7rem 1rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Description
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the examination goals and topics covered..."
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem',
                      borderRadius: '10px',
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Duration, Passing Marks, Max Attempts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 1 })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.7rem 1rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Passing Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.passing_marks}
                      onChange={(e) => setFormData({ ...formData, passing_marks: parseInt(e.target.value) || 1 })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.7rem 1rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Max Attempts
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_attempts}
                      onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) || 1 })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.7rem 1rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>

                {/* Availability Window (Start & End Time) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Availability Start Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Availability End Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Published Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    id="exam-is-published"
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ accentColor: '#10b981', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="exam-is-published" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Publish exam immediately (visible to students)
                  </label>
                </div>

                {/* Question Selection Section */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Select Examination Questions</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Selected: <strong style={{ color: 'var(--primary)' }}>{formData.question_ids.length}</strong> questions • Total Marks: <strong style={{ color: '#059669' }}>{calculatedTotalMarks}</strong>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => selectAllFilteredQuestions(modalFilteredQuestions)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        Select All Filtered
                      </button>
                      <button
                        type="button"
                        onClick={clearQuestionSelections}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Filter inside modal */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                      placeholder="Filter questions..."
                      style={{
                        flex: 1,
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    />

                    <select
                      value={questionSubjectFilter}
                      onChange={(e) => setQuestionSubjectFilter(e.target.value)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    >
                      <option value="ALL">All Subjects</option>
                      {distinctSubjects.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Questions Scrollable Checkbox List */}
                  <div style={{ 
                    maxHeight: '220px', 
                    overflowY: 'auto', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '10px', 
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    background: '#f8fafc'
                  }}>
                    {modalFilteredQuestions.map((q) => {
                      const isSelected = formData.question_ids.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleQuestionSelection(q.id)}
                          style={{
                            padding: '0.55rem 0.75rem',
                            borderRadius: '8px',
                            background: isSelected ? 'var(--primary-light)' : '#ffffff',
                            border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            fontSize: '0.82rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                            />
                            <span style={{ color: isSelected ? 'var(--primary-dark)' : 'var(--text-primary)' }}>
                              <strong style={{ color: 'var(--primary)', marginRight: '6px' }}>[{q.subject}]</strong>
                              {q.question_text}
                            </span>
                          </div>

                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                            {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    id="save-exam-btn"
                    type="submit"
                    className="btn btn-primary"
                    disabled={modalLoading}
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check size={16} /> {modalMode === 'create' ? 'Create Exam' : 'Save Changes'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
