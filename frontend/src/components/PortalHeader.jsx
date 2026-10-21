import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Bell,
  Search,
  X,
  LayoutDashboard,
  HelpCircle,
  FileText,
  Award,
  LogOut,
  User,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function PortalHeader({
  portalTitle = 'Student Portal',
  subtitle = 'Have a great day ahead!',
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search anything...'
}) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.first_name ? user.first_name : user?.username || 'User';

  return (
    <>
      {/* Curved Indigo/Violet Hero Header */}
      <header className="portal-hero-header">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Top Bar: Menu, Title, Notifications, Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '12px',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'background 0.2s ease'
                }}
                title="Open Navigation Menu"
              >
                <Menu size={22} />
              </button>

              <h1 style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                {portalTitle}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    position: 'relative'
                  }}
                  title="Notifications"
                >
                  <Bell size={20} />
                  <span className="notification-dot">3</span>
                </button>

                {/* Notifications Popup Dropdown */}
                {notificationsOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '52px',
                    right: 0,
                    width: '280px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.18)',
                    border: '1px solid #e2e8f0',
                    padding: '1rem',
                    zIndex: 50,
                    color: 'var(--text-primary)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Mark read</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
                      <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 600 }}>📝 Exam Published</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Full-Stack Engineering Exam is now live.</div>
                      </div>
                      <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 600 }}>⏱️ PostgreSQL Autosave</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Real-time persistence enabled for all sessions.</div>
                      </div>
                      <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 600 }}>🎉 Score Evaluated</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Automated result generated for latest test.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div
                onClick={() => setDrawerOpen(true)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a5b4fc 0%, #ffffff 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  overflow: 'hidden'
                }}
                title={`${displayName} (${user?.role})`}
              >
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-dark)' }}>
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Greeting & Subtitle */}
          <div style={{ paddingLeft: '0.25rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              Hello, {displayName} <span style={{ fontSize: '1.4rem' }}>👋</span>
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.85)',
              margin: 0,
              fontWeight: 500
            }}>
              {subtitle}
            </p>
          </div>
        </div>
      </header>

      {/* Floating Pill Search Bar (overlapping curved hero) */}
      <div className="search-pill-container">
        <Search size={18} className="search-pill-icon" />
        <input
          type="text"
          className="search-pill-input"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </div>

      {/* Slide-out Navigation Drawer */}
      {drawerOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 100,
          display: 'flex',
          transition: 'opacity 0.2s ease'
        }}>
          <div style={{
            width: '320px',
            maxWidth: '85%',
            background: '#ffffff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '8px 0 30px rgba(0, 0, 0, 0.15)',
            animation: 'slideInLeft 0.25s ease'
          }}>
            {/* Drawer Header */}
            <div style={{
              background: 'var(--portal-gradient)',
              padding: '1.75rem 1.5rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>{displayName}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                    {isAdmin ? 'Administrator' : 'Candidate / Student'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Links */}
            <div style={{ flexGrow: 1, padding: '1.25rem 1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {isAdmin ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    <LayoutDashboard size={18} color="var(--primary)" /> Admin Dashboard
                  </Link>

                  <Link
                    to="/admin/questions"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    <HelpCircle size={18} color="#0284c7" /> Question Bank
                  </Link>

                  <Link
                    to="/admin/exams"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    <FileText size={18} color="#10b981" /> Exam Management
                  </Link>

                  <Link
                    to="/admin/results"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    <Award size={18} color="#f59e0b" /> Examination Results
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/student/dashboard"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    <LayoutDashboard size={18} color="var(--primary)" /> Student Portal
                  </Link>

                  <Link
                    to="/student/exams"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    <BookOpen size={18} color="#10b981" /> Available Exams
                  </Link>
                </>
              )}
            </div>

            {/* Drawer Footer / Logout */}
            <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  color: 'var(--danger)',
                  borderColor: '#fecaca',
                  background: '#fef2f2'
                }}
              >
                <LogOut size={16} /> Sign Out of Platform
              </button>
            </div>
          </div>

          {/* Click outside to close */}
          <div style={{ flexGrow: 1 }} onClick={() => setDrawerOpen(false)} />
        </div>
      )}
    </>
  );
}
