import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock, 
  User, 
  Mail, 
  ShieldCheck, 
  GraduationCap, 
  Sparkles, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  ArrowRight
} from 'lucide-react';
import GraduationCapLogo from '../components/GraduationCapLogo';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'STUDENT',
    password: '',
    password_confirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const { register, loading, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);

    if (formData.password !== formData.password_confirm) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    const res = await register(formData);
    if (res.success) {
      setSuccessMsg('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '2.5rem 2rem',
        borderRadius: '20px'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            background: '#ffffff',
            boxShadow: '0 10px 28px rgba(99, 102, 241, 0.22)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            marginBottom: '1.25rem'
          }}>
            <GraduationCapLogo size={46} color="#1e293b" />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Create an Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Choose your role and register for the assessment platform
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            background: 'var(--success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#6ee7b7',
            fontSize: '0.88rem'
          }} id="register-success-banner">
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {authError && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#fca5a5',
            fontSize: '0.88rem'
          }} id="register-error-banner">
            <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
            <span>{authError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Role Selector Cards */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Select Account Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div 
                id="role-select-student"
                onClick={() => handleRoleSelect('STUDENT')}
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: formData.role === 'STUDENT' ? '2px solid var(--success)' : '1px solid var(--border-color)',
                  background: formData.role === 'STUDENT' ? 'var(--success-bg)' : '#f8fafc',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#059669', fontWeight: 700, marginBottom: '2px' }}>
                  <GraduationCap size={18} /> Student
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Take exams & view results
                </div>
              </div>

              <div 
                id="role-select-admin"
                onClick={() => handleRoleSelect('ADMIN')}
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: formData.role === 'ADMIN' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: formData.role === 'ADMIN' ? 'var(--primary-light)' : '#f8fafc',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--primary-dark)', fontWeight: 700, marginBottom: '2px' }}>
                  <ShieldCheck size={18} /> Admin
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Manage question bank & exams
                </div>
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a unique username"
                required
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem 0.7rem 2.4rem',
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

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem 0.7rem 2.4rem',
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

          {/* First Name & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                First Name
              </label>
              <input
                id="register-first-name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Optional"
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Last Name
              </label>
              <input
                id="register-last-name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Optional"
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

          {/* Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Confirm Password
              </label>
              <input
                id="register-password-confirm"
                name="password_confirm"
                type={showPassword ? 'text' : 'password'}
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="Repeat password"
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

          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', fontSize: '1rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                Create Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" id="goto-login-link" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
