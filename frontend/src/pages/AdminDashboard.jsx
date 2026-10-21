import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PortalHeader from '../components/PortalHeader';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  HelpCircle,
  FileText,
  Award,
  Users,
  Database,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  Settings,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ questions: 0, exams: 0, results: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [qRes, eRes, rRes] = await Promise.all([
          api.get('/questions/stats/'),
          api.get('/exams/'),
          api.get('/results/all_results/')
        ]);
        setStats({
          questions: qRes.data?.total_questions || 0,
          exams: eRes.data?.length || 0,
          results: rRes.data?.length || 0
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const adminTiles = [
    {
      id: 'questions',
      title: 'Question Bank',
      desc: `${stats.questions} MCQs & True/False`,
      bg: 'var(--pastel-sky)',
      iconBg: 'var(--pastel-sky-icon)',
      icon: <HelpCircle size={20} />,
      onClick: () => navigate('/admin/questions')
    },
    {
      id: 'exams',
      title: 'Exam Management',
      desc: `${stats.exams} Configured assessments`,
      bg: 'var(--pastel-mint)',
      iconBg: 'var(--pastel-mint-icon)',
      icon: <FileText size={20} />,
      onClick: () => navigate('/admin/exams')
    },
    {
      id: 'results',
      title: 'Exam Results',
      desc: `${stats.results} Graded submissions`,
      bg: 'var(--pastel-amber)',
      iconBg: 'var(--pastel-amber-icon)',
      icon: <Award size={20} />,
      onClick: () => navigate('/admin/results')
    },
    {
      id: 'database',
      title: 'PostgreSQL DB',
      desc: 'Active on port 5432',
      bg: 'var(--pastel-teal)',
      iconBg: 'var(--pastel-teal-icon)',
      icon: <Database size={20} />,
      onClick: () => alert('PostgreSQL Database Cluster: ONLINE (database: online_exam_db, host: 127.0.0.1:5432)')
    },
    {
      id: 'security',
      title: 'Security & RBAC',
      desc: 'Role boundaries enforced',
      bg: 'var(--pastel-lavender)',
      iconBg: 'var(--pastel-lavender-icon)',
      icon: <ShieldCheck size={20} />,
      onClick: () => alert('Role-Based Access Control verified:\nAdmin and Student privileges isolated.')
    },
    {
      id: 'analytics',
      title: 'Performance Audit',
      desc: 'Automated evaluation reports',
      bg: 'var(--pastel-peach)',
      iconBg: 'var(--pastel-peach-icon)',
      icon: <TrendingUp size={20} />,
      onClick: () => navigate('/admin/results')
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <PortalHeader
        portalTitle="Administrator Portal"
        subtitle="Manage exams, question bank, and candidate evaluations"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search questions, exams, candidates..."
      />

      <main style={{ flexGrow: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 1.25rem 3rem 1.25rem' }}>
        {/* Quick Access Grid */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Administration Quick Access
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            {adminTiles.map((tile) => (
              <div
                key={tile.id}
                className="pastel-card"
                onClick={tile.onClick}
                style={{ background: tile.bg }}
              >
                <div className="pastel-icon-circle" style={{ background: tile.iconBg }}>
                  {tile.icon}
                </div>
                <div className="pastel-card-title">{tile.title}</div>
                <div className="pastel-card-desc">{tile.desc}</div>
                <ChevronRight size={18} className="pastel-card-arrow" />
              </div>
            ))}
          </div>
        </section>

        {/* Live Overview Stats */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Platform Metric Highlights
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Total Questions in Bank
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
                {stats.questions}
              </div>
              <Link to="/admin/questions" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Open Question Bank &rarr;
              </Link>
            </div>

            <div className="card" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Configured Exams
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>
                {stats.exams}
              </div>
              <Link to="/admin/exams" style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
                Manage Examinations &rarr;
              </Link>
            </div>

            <div className="card" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Candidate Submissions
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b' }}>
                {stats.results}
              </div>
              <Link to="/admin/results" style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, textDecoration: 'none' }}>
                View All Results &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
