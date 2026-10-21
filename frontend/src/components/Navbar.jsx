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
  BookOpen
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
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 1.5rem',
      boxShadow: 'var(--shadow-sm)'
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
            background: 'var(--portal-gradient)',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
          }}>
            <Sparkles size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ 
              fontWeight: 800, 
              fontSize: '1.15rem', 
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: 'var(--text-primary)'
            }}>
              Exam<span style={{ color: 'var(--primary)' }}>Sphere</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Online Assessment Platform
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {isAdmin ? (
            <>
              <Link 
                to="/admin/dashboard" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/admin/dashboard') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/admin/dashboard') ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.15s ease'
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
                  padding: '0.45rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/admin/questions') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/admin/questions') ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.15s ease'
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
                  padding: '0.45rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/admin/exams') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/admin/exams') ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <FileText size={15} /> Exam Manager
              </Link>

              <Link 
                to="/admin/results" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/admin/results') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/admin/results') ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Award size={15} /> Results & Analytics
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/student/dashboard" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/student/dashboard') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/student/dashboard') ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <LayoutDashboard size={15} /> Portal
              </Link>

              <Link 
                to="/student/exams" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive('/student/exams') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/student/exams') ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <BookOpen size={15} /> Available Exams
              </Link>
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
            borderRadius: '9999px',
            background: '#f8fafc',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--portal-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#ffffff'
            }}>
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.1, color: 'var(--text-primary)' }}>
                {user?.username}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {isAdmin ? 'Administrator' : 'Student'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.3rem' }}
            title="Log out of system"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
