import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { UserCircle, GraduationCap, ShieldCheck, ArrowLeft, LogOut } from 'lucide-react';
import { AuthProvider, AuthContext } from './AuthContext';
import StudentPortal from './pages/StudentPortal';
import TeacherPortal from './pages/TeacherPortal';
import PrincipalPortal from './pages/PrincipalPortal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NoticeBoard from './components/NoticeBoard';
import './App.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  const loginRoles = [
    { title: 'Student', icon: <GraduationCap size={40} />, description: 'Access notes, homework, and talk to Principal.', color: '#4299e1', path: '/login/student' },
    { title: 'Teacher', icon: <UserCircle size={40} />, description: 'Mark attendance, share HW, and report issues.', color: '#48bb78', path: '/login/teacher' },
    { title: 'Principal', icon: <ShieldCheck size={40} />, description: 'Manage school, notices, and handle complaints.', color: '#f56565', path: '/login/principal' }
  ];

  return (
    <div className="app-container">
      <header>
        <div className="school-logo">🏫</div>
        <div className="school-name">Janta +2 High School</div>
        <h1 className="app-title">Digital-Janta</h1>
      </header>
      <main className="main-content">
        <div className="login-options">
          {loginRoles.map((role, index) => (
            <div key={index} className="login-card" onClick={() => navigate(role.path)}>
              <div className="icon-container" style={{ color: role.color }}>{role.icon}</div>
              <h2>{role.title} Portal</h2>
              <p>{role.description}</p>
              <button className="login-btn">Login as {role.title}</button>
            </div>
          ))}
        </div>
      </main>
      <footer>&copy; 2026 Digital-Janta | Built for Janta +2 High School</footer>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Portal...</div>;
  
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PortalWrapper = ({ children }) => {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-container">
      <header style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/')} className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ textAlign: 'center' }}>
          <div className="school-name" style={{ fontSize: '0.8rem' }}>Janta +2 High School</div>
          <div className="app-title" style={{ fontSize: '1rem', margin: 0 }}>Digital-Janta</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.name || 'User'}</span>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>
      <main className="main-content" style={{ display: 'block', padding: '1rem' }}>
        <div className="portal-container">
          <NoticeBoard />
          {children}
        </div>
      </main>
      <footer>&copy; 2026 Digital-Janta</footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/student" element={<LoginPage role="Student" />} />
          <Route path="/login/teacher" element={<LoginPage role="Teacher" />} />
          <Route path="/login/principal" element={<LoginPage role="Principal" />} />
          
          <Route path="/student" element={<ProtectedRoute allowedRole="student"><PortalWrapper><StudentPortal /></PortalWrapper></ProtectedRoute>} />
          <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><PortalWrapper><TeacherPortal /></PortalWrapper></ProtectedRoute>} />
          <Route path="/principal" element={<ProtectedRoute allowedRole="principal"><PortalWrapper><PrincipalPortal /></PortalWrapper></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
