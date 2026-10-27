import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  CheckCircle2, 
  X, 
  Loader2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Expanded questions map for accordion options
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Question Form State
  const [formData, setFormData] = useState({
    subject: '',
    question_type: 'MCQ',
    difficulty: 'MEDIUM',
    marks: 2,
    question_text: '',
    options: [
      { option_text: '', is_correct: true, order: 0 },
      { option_text: '', is_correct: false, order: 1 },
      { option_text: '', is_correct: false, order: 2 },
      { option_text: '', is_correct: false, order: 3 },
    ]
  });

  // Fetch Questions
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedSubject !== 'ALL') params.subject = selectedSubject;
      if (selectedDifficulty !== 'ALL') params.difficulty = selectedDifficulty;
      if (selectedType !== 'ALL') params.question_type = selectedType;

      const res = await api.get('/questions/', { params });
      setQuestions(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Subjects & Stats
  const fetchMetadata = async () => {
    try {
      const [subjRes, statsRes] = await Promise.all([
        api.get('/questions/subjects/'),
        api.get('/questions/stats/')
      ]);
      setSubjects(subjRes.data.subjects || []);
      setStats(statsRes.data);
    } catch (err) {
      console.warn('Could not load question metadata:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject, selectedDifficulty, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedSubject('ALL');
    setSelectedDifficulty('ALL');
    setSelectedType('ALL');
    setLoading(true);
    setError(null);
    api.get('/questions/')
      .then(res => setQuestions(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load questions.'))
      .finally(() => setLoading(false));
  };

  const hasActiveFilters = search.trim() !== '' || selectedSubject !== 'ALL' || selectedDifficulty !== 'ALL' || selectedType !== 'ALL';

  const toggleExpand = (id) => {
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    setCurrentQuestionId(null);
    setModalError(null);
    setFormData({
      subject: '',
      question_type: 'MCQ',
      difficulty: 'MEDIUM',
      marks: 2,
      question_text: '',
      options: [
        { option_text: '', is_correct: true, order: 0 },
        { option_text: '', is_correct: false, order: 1 },
        { option_text: '', is_correct: false, order: 2 },
        { option_text: '', is_correct: false, order: 3 },
      ]
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (q) => {
    setModalMode('edit');
    setCurrentQuestionId(q.id);
    setModalError(null);
    setFormData({
      subject: q.subject,
      question_type: q.question_type,
      difficulty: q.difficulty,
      marks: q.marks,
      question_text: q.question_text,
      options: q.options.map((opt, i) => ({
        id: opt.id,
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        order: opt.order ?? i
      }))
    });
    setIsModalOpen(true);
  };

  // Delete Question
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question? This cannot be undone.')) {
      try {
        await api.delete(`/questions/${id}/`);
        setQuestions(questions.filter(q => q.id !== id));
        fetchMetadata();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete question.');
      }
    }
  };

  // Handle Form Question Type Change
  const handleTypeChange = (newType) => {
    if (newType === 'TF') {
      setFormData({
        ...formData,
        question_type: 'TF',
        options: [
          { option_text: 'True', is_correct: true, order: 0 },
          { option_text: 'False', is_correct: false, order: 1 },
        ]
      });
    } else {
      setFormData({
        ...formData,
        question_type: 'MCQ',
        options: [
          { option_text: '', is_correct: true, order: 0 },
          { option_text: '', is_correct: false, order: 1 },
          { option_text: '', is_correct: false, order: 2 },
          { option_text: '', is_correct: false, order: 3 },
        ]
      });
    }
  };

  // Option text update
  const handleOptionTextChange = (index, text) => {
    const updated = [...formData.options];
    updated[index].option_text = text;
    setFormData({ ...formData, options: updated });
  };

  // Option correct selection
  const handleOptionCorrectChange = (selectedIndex) => {
    const updated = formData.options.map((opt, i) => ({
      ...opt,
      is_correct: i === selectedIndex
    }));
    setFormData({ ...formData, options: updated });
  };

  // Add Option (for MCQ)
  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [
          ...formData.options,
          { option_text: '', is_correct: false, order: formData.options.length }
        ]
      });
    }
  };

  // Remove Option (for MCQ)
  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const updated = formData.options.filter((_, i) => i !== index);
      // Ensure at least one is correct
      if (!updated.some(o => o.is_correct)) {
        updated[0].is_correct = true;
      }
      setFormData({ ...formData, options: updated });
    }
  };

  // Modal Submit
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    // Frontend validation
    if (!formData.subject.trim()) {
      setModalError('Subject is required.');
      setModalLoading(false);
      return;
    }
    if (!formData.question_text.trim()) {
      setModalError('Question text is required.');
      setModalLoading(false);
      return;
    }
    for (let i = 0; i < formData.options.length; i++) {
      if (!formData.options[i].option_text.trim()) {
        setModalError(`Option #${i + 1} cannot be blank.`);
        setModalLoading(false);
        return;
      }
    }
    if (!formData.options.some(o => o.is_correct)) {
      setModalError('Please select one option as the correct answer.');
      setModalLoading(false);
      return;
    }

    try {
      if (modalMode === 'create') {
        const res = await api.post('/questions/', formData);
        setQuestions([res.data, ...questions]);
      } else {
        const res = await api.put(`/questions/${currentQuestionId}/`, formData);
        setQuestions(questions.map(q => q.id === currentQuestionId ? res.data : q));
      }
      setIsModalOpen(false);
      fetchMetadata();
    } catch (err) {
      const detail = err.response?.data?.options || 
                     err.response?.data?.detail || 
                     JSON.stringify(err.response?.data) || 
                     'Failed to save question.';
      setModalError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setModalLoading(false);
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'EASY':
        return <span className="badge badge-success">Easy</span>;
      case 'MEDIUM':
        return <span className="badge badge-warning">Medium</span>;
      case 'HARD':
        return <span className="badge badge-danger">Hard</span>;
      default:
        return <span className="badge badge-info">{diff}</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flexGrow: 1, padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-info">
                <HelpCircle size={13} /> Question Bank Management
              </span>
              <span className="badge badge-success">
                Module 3 Active
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>
              Question Bank
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Author, edit, categorize, and search MCQ & True/False questions for examination publishing.
            </p>
          </div>

          <button
            id="create-question-btn"
            onClick={openCreateModal}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.4rem' }}
          >
            <Plus size={18} /> Add New Question
          </button>
        </div>

        {/* Stats Row */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Questions</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.total_questions}</div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Easy / Medium / Hard</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>
                <span style={{ color: '#10b981' }}>{stats.easy} Easy</span> • <span style={{ color: '#f59e0b' }}>{stats.medium} Med</span> • <span style={{ color: '#ef4444' }}>{stats.hard} Hard</span>
              </div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Question Types</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>
                <span style={{ color: 'var(--primary)' }}>{stats.mcq} MCQ</span> • <span style={{ color: 'var(--info)' }}>{stats.tf} True/False</span>
              </div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distinct Subjects</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.subjects_count}</div>
            </div>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ flexGrow: 1, minWidth: '240px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="search-questions-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions by keyword or topic..."
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

            {/* Subject Filter */}
            <div style={{ minWidth: '160px' }}>
              <select
                id="filter-subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
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
                <option value="ALL">All Subjects</option>
                {subjects.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div style={{ minWidth: '140px' }}>
              <select
                id="filter-difficulty-select"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
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
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Question Type Filter */}
            <div style={{ minWidth: '140px' }}>
              <select
                id="filter-type-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
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
                <option value="ALL">All Types</option>
                <option value="MCQ">Multiple Choice</option>
                <option value="TF">True / False</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                id="search-submit-btn"
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.15rem' }}
              >
                <Filter size={15} /> Filter
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
                >
                  <X size={15} /> Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Questions Listing */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1rem auto' }} />
            <p>Loading questions from PostgreSQL...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '1.5rem', background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#b91c1c' }}>
            <AlertCircle size={20} style={{ marginBottom: '0.5rem', color: 'var(--danger)' }} />
            <div>{error}</div>
          </div>
        ) : questions.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <HelpCircle size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No questions found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
              No questions matched your search or filter criteria. You can create a new question or clear the filters.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {hasActiveFilters && (
                <button onClick={handleClearFilters} className="btn btn-secondary">
                  <X size={16} /> Reset Filters
                </button>
              )}
              <button onClick={openCreateModal} className="btn btn-primary">
                <Plus size={16} /> Add First Question
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {questions.map((q) => {
              const isExpanded = !!expandedQuestions[q.id];
              return (
                <div key={q.id} className="glass-card" style={{ padding: '1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ 
                        background: 'var(--primary-light)', 
                        color: 'var(--primary-dark)', 
                        padding: '3px 9px', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700 
                      }}>
                        {q.subject}
                      </span>
                      {getDifficultyBadge(q.difficulty)}
                      <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                        {q.question_type === 'MCQ' ? 'Multiple Choice' : 'True/False'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(q)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        title="Edit question"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#dc2626' }}
                        title="Delete question"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
                    {q.question_text}
                  </div>

                  {/* Options Collapsible preview */}
                  <div>
                    <button
                      onClick={() => toggleExpand(q.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: 0
                      }}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Hide Options' : `View ${q.options.length} Options (Answer: ${q.correct_option_text || 'Marked'})`}
                    </button>

                    {isExpanded && (
                      <div style={{ marginTop: '0.85rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
                        {q.options.map((opt, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.65rem 0.85rem',
                              borderRadius: '8px',
                              background: opt.is_correct ? 'var(--success-bg)' : '#f8fafc',
                              border: opt.is_correct ? '1px solid var(--success-border)' : '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.85rem'
                            }}
                          >
                            <span style={{ color: opt.is_correct ? '#065f46' : 'var(--text-primary)' }}>
                              <strong style={{ color: opt.is_correct ? '#059669' : 'var(--text-secondary)', marginRight: '6px' }}>
                                {String.fromCharCode(65 + idx)}.
                              </strong>
                              {opt.option_text}
                            </span>
                            {opt.is_correct && (
                              <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                                <Check size={11} /> Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Question Modal */}
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
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '20px',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {modalMode === 'create' ? 'Add New Question' : 'Edit Question'}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  color: '#b91c1c',
                  fontSize: '0.85rem'
                }}>
                  <AlertCircle size={17} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Subject & Marks */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Subject / Topic
                    </label>
                    <input
                      id="modal-question-subject"
                      type="text"
                      list="subject-datalist"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Python, Mathematics, Physics"
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
                    <datalist id="subject-datalist">
                      {subjects.map((s, idx) => (
                        <option key={idx} value={s} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Marks
                    </label>
                    <input
                      id="modal-question-marks"
                      type="number"
                      min="1"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 1 })}
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

                {/* Question Type & Difficulty */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Question Type
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleTypeChange('MCQ')}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: formData.question_type === 'MCQ' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: formData.question_type === 'MCQ' ? 'var(--primary-light)' : '#f8fafc',
                          color: formData.question_type === 'MCQ' ? 'var(--primary-dark)' : 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Multiple Choice
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTypeChange('TF')}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: formData.question_type === 'TF' ? '2px solid var(--info)' : '1px solid var(--border-color)',
                          background: formData.question_type === 'TF' ? 'var(--info-bg)' : '#f8fafc',
                          color: formData.question_type === 'TF' ? 'var(--info)' : 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        True / False
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Difficulty Level
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setFormData({ ...formData, difficulty: diff })}
                          style={{
                            flex: 1,
                            padding: '0.6rem',
                            borderRadius: '8px',
                            border: formData.difficulty === diff ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            background: formData.difficulty === diff ? 'var(--primary-light)' : '#f8fafc',
                            color: formData.difficulty === diff ? 'var(--primary-dark)' : 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Question Statement / Text
                  </label>
                  <textarea
                    id="modal-question-text"
                    rows="3"
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    placeholder="Enter the complete question statement here..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
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

                {/* Options List */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Answer Choices & Correct Option
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Select the radio button next to the correct answer
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {formData.options.map((opt, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.65rem',
                          background: opt.is_correct ? 'var(--success-bg)' : '#f8fafc',
                          padding: '0.4rem 0.65rem',
                          borderRadius: '10px',
                          border: opt.is_correct ? '1px solid var(--success-border)' : '1px solid var(--border-color)'
                        }}
                      >
                        <input
                          type="radio"
                          name="correct_answer_radio"
                          checked={opt.is_correct}
                          onChange={() => handleOptionCorrectChange(i)}
                          title="Mark this option as correct"
                          style={{ cursor: 'pointer', accentColor: '#10b981', width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: opt.is_correct ? '#059669' : 'var(--text-secondary)' }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <input
                          type="text"
                          value={opt.option_text}
                          onChange={(e) => handleOptionTextChange(i, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + i)} text`}
                          readOnly={formData.question_type === 'TF'}
                          style={{
                            flexGrow: 1,
                            padding: '0.55rem 0.85rem',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.88rem',
                            outline: 'none',
                            fontFamily: 'inherit'
                          }}
                        />
                        {formData.question_type === 'MCQ' && formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(i)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            title="Remove option"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {formData.question_type === 'MCQ' && formData.options.length < 6 && (
                    <button
                      type="button"
                      onClick={addOption}
                      style={{
                        marginTop: '0.65rem',
                        background: 'none',
                        border: '1px dashed var(--border-color)',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        width: '100%',
                        color: 'var(--primary)',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Plus size={14} /> Add Additional Choice
                    </button>
                  )}
                </div>

                {/* Modal Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    id="save-question-btn"
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
                        <Check size={16} /> {modalMode === 'create' ? 'Create Question' : 'Save Changes'}
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
