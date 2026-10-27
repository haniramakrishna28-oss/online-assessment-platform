import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Users,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BookOpen,
  FileText,
  HelpCircle,
  Search,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Building,
  GraduationCap,
  Send,
  AlertCircle
} from 'lucide-react';

export default function FacultyDirectoryPage({ initialTab = 'staffs' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [inquirySent, setInquirySent] = useState(false);
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  // Faculty & Committee Staff List
  const facultyMembers = [
    {
      id: 'alan-turing',
      name: 'Dr. Alan Turing',
      title: 'Chief Examiner & Academic Board Director',
      badge: 'Chief Examiner',
      badgeClass: 'badge-primary',
      department: 'Computer Science & Algorithmic Foundations',
      specialization: 'Automated Code Verification, Algorithm Analysis & Test Item Synthesis',
      office: 'Turing Computational Complex, Wing 4B',
      email: 'alan.turing@examsphere.edu',
      phone: '+1 (555) 019-2831',
      officeHours: 'Monday & Wednesday: 14:00 - 16:00',
      status: 'Active Examiner',
      isOnline: true,
      bio: 'Directs the Examination Architecture Committee. Oversees standardized test specifications, objective MCQ item banks, and automated PostgreSQL evaluation pipelines.',
      color: '#4f46e5'
    },
    {
      id: 'grace-hopper',
      name: 'Prof. Grace Hopper',
      title: 'Assessment Committee Chair & Systems Moderator',
      badge: 'Assessment Chair',
      badgeClass: 'badge-success',
      department: 'Software Engineering & Computing Systems',
      specialization: 'High-Level Programming Languages, Syntax Parsing & Pass Standards',
      office: 'Hopper Systems Hall, Suite 204',
      email: 'grace.hopper@examsphere.edu',
      phone: '+1 (555) 019-4822',
      officeHours: 'Tuesday & Thursday: 10:00 - 12:00',
      status: 'Active Examiner',
      isOnline: true,
      bio: 'Chairs the Academic Evaluation Committee. Formulates grading rubrics, threshold scoring metrics, and question quality benchmarks across all subjects.',
      color: '#10b981'
    },
    {
      id: 'ada-lovelace',
      name: 'Prof. Ada Lovelace',
      title: 'Senior Assessor & Psychometrics Lead',
      badge: 'Lead Assessor',
      badgeClass: 'badge-warning',
      department: 'Applied Mathematics & Computational Logic',
      specialization: 'Psychometric Calibration, Item Discrimination & Statistical Difficulty',
      office: 'Analytical Engines Lab, Rm 108',
      email: 'ada.lovelace@examsphere.edu',
      phone: '+1 (555) 019-7714',
      officeHours: 'Friday: 11:00 - 13:00',
      status: 'Active Assessor',
      isOnline: false,
      bio: 'Performs statistical audits on test question performance, difficulty normalization (Easy / Medium / Hard), and candidate discrimination curves.',
      color: '#f59e0b'
    },
    {
      id: 'support-desk',
      name: 'Central Admin Support Desk',
      title: 'Examination Operations & Student Support Concierge',
      badge: '24/7 Operations Desk',
      badgeClass: 'badge-info',
      department: 'Central Examination Operations & Academic Support',
      specialization: 'Platform Connectivity, Session Recovery, Candidate Credentialing',
      office: 'Campus Academic Services Center, Room 101',
      email: 'admin.support@examsphere.edu',
      phone: '+1 (800) 555-EXAM (3926)',
      officeHours: 'Available 24/7 during all examination windows',
      status: 'Online Now',
      isOnline: true,
      bio: 'First point of contact for candidate authentication, assessment window extensions, PostgreSQL autosave verification, and real-time exam assistance.',
      color: '#0284c7'
    }
  ];

  // Filter faculty based on search and role
  const filteredFaculty = facultyMembers.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.badge.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRole === 'ALL' ||
      (selectedRole === 'EXAMINER' && fac.badge.includes('Examiner')) ||
      (selectedRole === 'CHAIR' && fac.badge.includes('Chair')) ||
      (selectedRole === 'SUPPORT' && fac.badge.includes('Desk'));

    return matchesSearch && matchesRole;
  });

  const handleSendInquiry = (e) => {
    e.preventDefault();
    if (!inquirySubject.trim() || !inquiryMessage.trim()) return;
    setInquirySent(true);
    setTimeout(() => {
      setInquirySubject('');
      setInquiryMessage('');
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <Navbar />

      {/* Hero Header */}
      <section className="portal-hero-header" style={{ paddingBottom: '3.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => navigate('/student/dashboard')}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>/</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.8rem', fontWeight: 600 }}>
              Academic Directory
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>
                  <ShieldCheck size={13} /> Official Assessment Board
                </span>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7' }}>
                  Active Academic Session
                </span>
              </div>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                Faculty & Examination Committee
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '640px' }}>
                Official directory of chief examiners, assessment chairs, and support officers overseeing question integrity, testing standards, and evaluations.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => window.open(window.location.href, '_blank')}
                className="btn btn-secondary"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  padding: '0.5rem 0.9rem',
                  backdropFilter: 'blur(8px)'
                }}
                title="Open another instance in a new browser tab"
              >
                <ExternalLink size={14} /> New Tab
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main style={{ flexGrow: 1, maxWidth: '1280px', width: '100%', margin: '-2rem auto 3rem auto', padding: '0 1.25rem', position: 'relative', zIndex: 10 }}>
        {/* Navigation Tabs Bar */}
        <div className="glass-card" style={{ padding: '0.5rem', marginBottom: '1.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderRadius: '16px' }}>
          <button
            onClick={() => setActiveTab('staffs')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'staffs' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'staffs' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Users size={17} /> Faculty & Staff Directory ({facultyMembers.length})
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'notices' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'notices' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <FileText size={17} /> Bulletins & Notices
          </button>

          <button
            onClick={() => setActiveTab('library')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'library' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'library' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <BookOpen size={17} /> Resource Handbook
          </button>

          <button
            onClick={() => setActiveTab('support')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'support' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'support' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <MessageSquare size={17} /> Contact & Support
          </button>
        </div>

        {/* TAB 1: FACULTY & STAFF DIRECTORY */}
        {activeTab === 'staffs' && (
          <div>
            {/* Search & Filter Controls */}
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ position: 'relative', flexGrow: 1, minWidth: '260px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by faculty name, subject, or department..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem 0.65rem 2.4rem',
                      borderRadius: '10px',
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'ALL', label: 'All Staff' },
                    { id: 'EXAMINER', label: 'Chief Examiners' },
                    { id: 'CHAIR', label: 'Committee Chairs' },
                    { id: 'SUPPORT', label: 'Support Desk' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedRole(filter.id)}
                      className="btn"
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.82rem',
                        background: selectedRole === filter.id ? 'var(--primary-light)' : '#ffffff',
                        color: selectedRole === filter.id ? 'var(--primary-dark)' : 'var(--text-secondary)',
                        border: selectedRole === filter.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        borderRadius: '9999px'
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Faculty Members Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {filteredFaculty.map((fac) => (
                <div
                  key={fac.id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  {/* Top card banner */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${fac.color} 0%, #3b82f6 100%)`,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        boxShadow: '0 6px 16px rgba(79, 70, 229, 0.2)',
                        flexShrink: 0
                      }}>
                        {fac.name.replace(/^(Dr\.|Prof\.)\s+/, '').charAt(0)}
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {fac.name}
                        </h2>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {fac.title}
                        </div>
                      </div>
                    </div>

                    <span className={`badge ${fac.badgeClass}`}>
                      {fac.badge}
                    </span>
                  </div>

                  {/* Bio */}
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem', flexGrow: 1 }}>
                    {fac.bio}
                  </p>

                  {/* Metadata fields */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <strong>Dept:</strong> {fac.department}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <strong>Office:</strong> {fac.office}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <strong>Hours:</strong> {fac.officeHours}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <strong>Email:</strong> {fac.email}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <a
                      href={`mailto:${fac.email}`}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem', textDecoration: 'none' }}
                    >
                      <Mail size={14} /> Send Email
                    </a>
                    <button
                      onClick={() => {
                        setActiveTab('support');
                        setInquirySubject(`Inquiry for ${fac.name}`);
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem' }}
                    >
                      <MessageSquare size={14} /> Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Assessment Integrity Charter */}
            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Academic Standards & Examination Charter
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Administered by the Online Examination & Assessment Platform Committee
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                    ⏱️ Continuous Real-time Evaluation
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    Every answer choice selected is synchronized and validated directly against PostgreSQL. Timer calculations are enforced strictly on server clocks.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--success)', marginBottom: '0.35rem' }}>
                    🎯 Objective Scoring Criteria
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    MCQ and True/False items have single deterministic truth states. Passing criteria and mark distributions are reviewed by Assessment Chair Prof. Grace Hopper.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f59e0b', marginBottom: '0.35rem' }}>
                    🛡️ Verification & Review Protocol
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    Students are entitled to an itemized breakdown of scores, correct options, and historical attempt numbers immediately upon examination submission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BULLETINS & NOTICES */}
        {activeTab === 'notices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-danger">High Priority Announcement</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>October 27, 2026</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Online Certification Window & Timed Environment Protocol
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                All students taking assessments are reminded that once an examination begins, the timer runs continuously. Full autosave persistence is active on every question selection. Ensure a stable network connection before starting an assessment.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-success">Feature Release</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>October 25, 2026</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                PostgreSQL Autosave & Multi-Attempt Exam Tracking
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                The ExamSphere v2.0 update provides real-time state persistence to prevent loss of progress during network fluctuations. Candidates can take up to the maximum permitted attempts configured by the examiner.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: RESOURCE LIBRARY */}
        {activeTab === 'library' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ padding: '10px', background: 'var(--pastel-lavender)', borderRadius: '12px', width: 'fit-content', marginBottom: '1rem' }}>
                <BookOpen size={24} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Python 3 Standard Reference
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Official core language reference, data structures, built-in functions, and syntax guide for all Python certification modules.
              </p>
              <a
                href="https://docs.python.org/3/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.85rem', textDecoration: 'none' }}
              >
                <ExternalLink size={14} /> Open Official Python Docs
              </a>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ padding: '10px', background: 'var(--pastel-mint)', borderRadius: '12px', width: 'fit-content', marginBottom: '1rem' }}>
                <FileText size={24} style={{ color: 'var(--success)' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Exam Conduct & Proctoring Handbook
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Guidelines on time limits, allowable materials, anti-plagiarism verification, and grievance submission procedures.
              </p>
              <button
                onClick={() => alert('Candidate Handbook is bundled with your assessment registration pack. Contact Dr. Alan Turing for specific syllabus exemptions.')}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <BookOpen size={14} /> View Conduct Rules
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: CONTACT & SUPPORT DESK */}
        {activeTab === 'support' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Submit Inquiry to Committee
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Have questions regarding question formatting, assessment windows, or special accommodations? Submit an inquiry directly to the examination desk.
              </p>

              {inquirySent ? (
                <div style={{ padding: '1.25rem', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '12px', textAlign: 'center' }}>
                  <CheckCircle2 size={32} style={{ color: 'var(--success)', margin: '0 auto 0.5rem auto' }} />
                  <h4 style={{ color: '#065f46', margin: '0 0 0.25rem 0' }}>Inquiry Dispatched Successfully</h4>
                  <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0 }}>
                    Dr. Alan Turing and the support desk have received your message. Expected response within 2-4 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={inquirySubject}
                      onChange={(e) => setInquirySubject(e.target.value)}
                      placeholder="e.g. Question Clarification / Accommodations"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Message to Academic Committee
                    </label>
                    <textarea
                      rows="4"
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="Describe your inquiry or question in detail..."
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
                    <Send size={16} /> Send to Faculty Committee
                  </button>
                </form>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Emergency Exam Support Hotline
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                      +1 (800) 555-EXAM
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Toll-free 24/7 during official examination dates
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Email Channels
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>General Examination Queries:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>exams@examsphere.edu</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Academic Misconduct Desk:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>integrity@examsphere.edu</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Technical Assistance:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>support@examsphere.edu</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
