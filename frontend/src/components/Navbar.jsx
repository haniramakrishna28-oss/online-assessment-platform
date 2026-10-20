import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  GraduationCap, 
  LogOut, 
  Sparkles, 
  LayoutDashboard, 
  HelpCircle, 
  FileText, 
  Award,
  Database
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Brand / Logo */}
        <Link 
          to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.65rem', 
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div style={{
            background: 'var(--accent-gradient)',
            borderRadius: '10px',
            padding: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 800, 
              fontSize: '1.15rem', 
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              Exam<span style={{ color: 'var(--accent-primary)' }}>Sphere</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Online Assessment Platform
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isAdmin ? (
            <>
              <Link 
                to="/admin/dashboard" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/admin/dashboard') ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive('/admin/dashboard') ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  border: isActive('/admin/dashboard') ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>

              <Link 
                to="/admin/questions" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/admin/questions') ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive('/admin/questions') ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  border: isActive('/admin/questions') ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <HelpCircle size={15} /> Question Bank
              </Link>

              <Link 
                to="/admin/exams" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/admin/exams') ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive('/admin/exams') ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  border: isActive('/admin/exams') ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <FileText size={15} /> Exam Manager
              </Link>

              <span 
                title="Module 7: Results & Evaluation"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  cursor: 'default'
                }}
              >
                <Award size={15} /> Results <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)' }}>M7</span>
              </span>
            </>
          ) : (
            <>
              <Link 
                to="/student/dashboard" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/student/dashboard') ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive('/student/dashboard') ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  border: isActive('/student/dashboard') ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>

              <Link 
                to="/student/exams" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/student/exams') ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive('/student/exams') ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  border: isActive('/student/exams') ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <FileText size={15} /> Available Exams
              </Link>

              <span 
                title="Module 7: My Results"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  cursor: 'default'
                }}
              >
                <Award size={15} /> My Results <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)' }}>M7</span>
              </span>
            </>
          )}
        </div>

        {/* User Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: isAdmin ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#ffffff'
            }}>
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.1 }}>
                {user?.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                {isAdmin ? (
                  <span className="badge badge-info" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                    <ShieldCheck size={10} /> Admin
                  </span>
                ) : (
                  <span className="badge badge-success" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                    <GraduationCap size={10} /> Student
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            id="nav-logout-btn"
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            title="Log out of system"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
