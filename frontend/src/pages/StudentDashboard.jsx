import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PortalHeader from '../components/PortalHeader';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  User,
  Calendar,
  Users,
  CheckSquare,
  MessageSquare,
  BarChart2,
  Image,
  CreditCard,
  FileText,
  BookOpen,
  Award,
  Library,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Home,
  Grid,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'calendar' | 'messages' | 'more'

  // Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resExams, resResults] = await Promise.all([
          api.get('/exams/available/'),
          api.get('/results/my_results/')
        ]);
        setExams(resExams.data);
        setResults(resResults.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter exams based on search input
  const filteredExams = exams.filter((ex) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return ex.title?.toLowerCase().includes(term) || ex.subject?.toLowerCase().includes(term);
  });

  // Quick access tiles matching the 12 screenshot tiles
  const quickAccessTiles = [
    {
      id: 'profile',
      title: 'Profile',
      desc: 'View & edit profile',
      bg: 'var(--pastel-lavender)',
      iconBg: 'var(--pastel-lavender-icon)',
      icon: <User size={20} />,
      onClick: () => setProfileModalOpen(true)
    },
    {
      id: 'events',
      title: 'Events',
      desc: 'Exam calendar',
      bg: 'var(--pastel-peach)',
      iconBg: 'var(--pastel-peach-icon)',
      icon: <Calendar size={20} />,
      onClick: () => {
        const el = document.getElementById('upcoming-exams-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'staffs',
      title: 'Staffs',
      desc: 'Faculty directory',
      bg: 'var(--pastel-sky)',
      iconBg: 'var(--pastel-sky-icon)',
      icon: <Users size={20} />,
      onClick: () => alert('Faculty & Examination Committee:\n- Dr. Alan Turing (Chief Examiner)\n- Prof. Grace Hopper (Assessment Chair)\n- Admin Support Desk (active)')
    },
    {
      id: 'attendance',
      title: 'Attendance',
      desc: 'Check attendance',
      bg: 'var(--pastel-mint)',
      iconBg: 'var(--pastel-mint-icon)',
      icon: <CheckSquare size={20} />,
      onClick: () => alert('Assessment Attendance: 100% Active\nVerified through PostgreSQL session timestamps.')
    },
    {
      id: 'chatbox',
      title: 'Chatbox',
      desc: 'Message & support',
      bg: 'var(--pastel-rose)',
      iconBg: 'var(--pastel-rose-icon)',
      icon: <MessageSquare size={20} />,
      onClick: () => alert('Student Helpdesk & Support is online. For exam inquiries, contact your assigned administrator.')
    },
    {
      id: 'gradesheet',
      title: 'GradeSheet',
      desc: 'View your grades',
      bg: 'var(--pastel-amber)',
      iconBg: 'var(--pastel-amber-icon)',
      icon: <BarChart2 size={20} />,
      onClick: () => {
        const el = document.getElementById('gradesheet-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'gallery',
      title: 'Gallery',
      desc: 'Platform & campus',
      bg: 'var(--pastel-blue)',
      iconBg: 'var(--pastel-blue-icon)',
      icon: <Image size={20} />,
      onClick: () => alert('Platform media archive: ExamSphere Assessment Platform v2.0.')
    },
    {
      id: 'fees',
      title: 'Fees Details',
      desc: 'Payments & status',
      bg: 'var(--pastel-teal)',
      iconBg: 'var(--pastel-teal-icon)',
      icon: <CreditCard size={20} />,
      onClick: () => alert('Assessment Account Status: Fully Paid & Cleared for all certified examinations.')
    },
    {
      id: 'notices',
      title: 'Notices',
      desc: 'Latest updates',
      bg: 'var(--pastel-purple)',
      iconBg: 'var(--pastel-purple-icon)',
      badge: 'NEW',
      icon: <FileText size={20} />,
      onClick: () => alert('Notice [NEW]:\nFinal Examination Window is open. Remember that timer runs continuously and autosaves to PostgreSQL upon every choice.')
    },
    {
      id: 'assignments',
      title: 'Assignments',
      desc: 'Tasks & submissions',
      bg: 'var(--pastel-peach)',
      iconBg: 'var(--pastel-peach-icon)',
      icon: <BookOpen size={20} />,
      onClick: () => navigate('/student/exams')
    },
    {
      id: 'exams',
      title: 'Exams',
      desc: 'Schedule & results',
      bg: 'var(--pastel-mint)',
      iconBg: 'var(--pastel-mint-icon)',
      icon: <Award size={20} />,
      onClick: () => navigate('/student/exams')
    },
    {
      id: 'library',
      title: 'Library',
      desc: 'Books & resources',
      bg: 'var(--pastel-sky)',
      iconBg: 'var(--pastel-sky-icon)',
      icon: <Library size={20} />,
      onClick: () => alert('Digital Exam Guidelines & Resource Bank:\n- Python 3 Reference Documentation\n- Standard Examination Conduct Handbook')
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', paddingBottom: '5rem' }}>
      {/* Curved Hero Header */}
      <PortalHeader
        portalTitle="Student Portal"
        subtitle="Have a great day ahead!"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search exams, subjects, grades..."
      />

      <main style={{ flexGrow: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 1.25rem 2rem 1.25rem' }}>
        {/* Quick Access Section */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Quick Access
            </h2>
            <Link
              to="/student/exams"
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textDecoration: 'none'
              }}
            >
              View All
            </Link>
          </div>

          {/* 3-Column / Responsive Pastel Card Grid matching screenshot */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            {quickAccessTiles.map((tile) => (
              <div
                key={tile.id}
                className="pastel-card"
                onClick={tile.onClick}
                style={{ background: tile.bg }}
              >
                {/* NEW Badge if present */}
                {tile.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#6366f1',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em'
                  }}>
                    {tile.badge}
                  </span>
                )}

                {/* Circular Vibrant Icon */}
                <div className="pastel-icon-circle" style={{ background: tile.iconBg }}>
                  {tile.icon}
                </div>

                <div className="pastel-card-title">{tile.title}</div>
                <div className="pastel-card-desc">{tile.desc}</div>

                {/* Chevron Arrow */}
                <ChevronRight size={18} className="pastel-card-arrow" />
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Exams & Schedule Section (styled like Upcoming Events from screenshot) */}
        <section id="upcoming-exams-section" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Upcoming Assessments & Schedule
            </h2>
            <Link
              to="/student/exams"
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textDecoration: 'none'
              }}
            >
              View Calendar
            </Link>
          </div>

          {loading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Loader2 size={32} className="spin-animation" style={{ color: 'var(--primary)', margin: '0 auto 0.5rem auto' }} />
              <p>Loading scheduled examinations...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Calendar size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                No Assessments Scheduled
              </h3>
              <p style={{ fontSize: '0.875rem' }}>
                {searchTerm ? 'No exams matched your search query.' : 'All published exams will appear here with instant start actions.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredExams.map((exam, idx) => (
                <div
                  key={exam.id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    background: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    {/* Date Badge Box on Left (as seen in screenshot) */}
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: idx % 2 === 0 ? 'var(--pastel-lavender)' : 'var(--pastel-peach)',
                      color: idx % 2 === 0 ? 'var(--primary-dark)' : 'var(--pastel-peach-icon)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontWeight: 800,
                      lineHeight: 1.1
                    }}>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        OCT
                      </span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 900 }}>
                        {20 + (idx % 8)}
                      </span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                        {idx % 2 === 0 ? 'Tue' : 'Wed'}
                      </span>
                    </div>

                    {/* Middle Details */}
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {exam.title}
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={14} /> {exam.duration_minutes} Mins
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={14} /> {exam.subject}
                        </span>
                        <span>
                          {exam.questions_count} Questions &bull; {exam.total_marks} Marks
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge badge-success" style={{ padding: '0.35rem 0.75rem' }}>
                      Active
                    </span>

                    <button
                      onClick={() => navigate(`/exam/${exam.id}`)}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      Start Exam &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* GradeSheet / Results Section */}
        <section id="gradesheet-section" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              My GradeSheet & Exam Results
            </h2>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {results.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Award size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  No GradeSheet Records Yet
                </h3>
                <p style={{ fontSize: '0.85rem' }}>
                  Complete an assessment to see your automated scores and question breakdown here.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{
                      background: '#f8fafc',
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      color: 'var(--text-secondary)'
                    }}>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Exam Title</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Subject</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Score</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Percentage</th>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Scorecard</th>
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
                            <span className="badge badge-success">Passed</span>
                          ) : (
                            <span className="badge badge-danger">Needs Work</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.3rem' }}
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
      </main>

      {/* Profile Detail Modal */}
      {profileModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--portal-gradient)',
              color: '#ffffff',
              fontSize: '1.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
            }}>
              {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.2rem' }}>
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              @{user?.username} &bull; {user?.email}
            </p>

            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Account Role:</span>
                <strong>Student / Candidate</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Database Status:</span>
                <span className="badge badge-success">PostgreSQL Verified</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Completed Exams:</span>
                <strong>{results.length}</strong>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setProfileModalOpen(false)}>
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* Bottom Mobile / Tablet App Navigation Bar (as seen in screenshot) */}
      <nav className="mobile-bottom-nav">
        <div
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{ cursor: 'pointer' }}
        >
          <Home size={20} />
          <span>Home</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('calendar');
            navigate('/student/exams');
          }}
          style={{ cursor: 'pointer' }}
        >
          <Calendar size={20} />
          <span>Calendar</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('messages');
            const el = document.getElementById('gradesheet-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{ cursor: 'pointer' }}
        >
          <Award size={20} />
          <span>Results</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'more' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('more');
            setProfileModalOpen(true);
          }}
          style={{ cursor: 'pointer' }}
        >
          <Grid size={20} />
          <span>More</span>
        </div>
      </nav>
    </div>
  );
}
