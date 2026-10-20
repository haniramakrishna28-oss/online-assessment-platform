import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import QuestionBankPage from './pages/QuestionBankPage';
import ExamManagementPage from './pages/ExamManagementPage';
import StudentDashboard from './pages/StudentDashboard';
import AvailableExamsPage from './pages/AvailableExamsPage';
import ExamTakingPage from './pages/ExamTakingPage';
import ExamResultPage from './pages/ExamResultPage';
import AdminResultsPage from './pages/AdminResultsPage';
import { AlertCircle } from 'lucide-react';

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        Loading platform...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'ADMIN' || user?.is_staff) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/student/dashboard" replace />;
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <AlertCircle size={48} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        The requested URL does not exist on this assessment platform.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Default redirect based on auth status */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Role-Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/questions" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <QuestionBankPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/exams" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ExamManagementPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/results" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminResultsPage />
              </ProtectedRoute>
            } 
          />

          {/* Role-Protected Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/exams" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AvailableExamsPage />
              </ProtectedRoute>
            } 
          />

          {/* Examination Taking Environment */}
          <Route 
            path="/exam/:id" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <ExamTakingPage />
              </ProtectedRoute>
            } 
          />

          {/* Exam Result / Scorecard (Accessible to Students & Admins) */}
          <Route 
            path="/results/:id" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <ExamResultPage />
              </ProtectedRoute>
            } 
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
