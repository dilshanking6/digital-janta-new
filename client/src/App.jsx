import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import { UserCircle, GraduationCap, ShieldCheck, ArrowLeft, LogOut, Settings, HelpCircle, X, MessageCircle, Bell } from 'lucide-react';
import { AuthProvider, AuthContext } from './AuthContext';
import StudentPortal from './pages/StudentPortal';
import TeacherPortal from './pages/TeacherPortal';
import PrincipalPortal from './pages/PrincipalPortal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NoticeBoard from './components/NoticeBoard';
import './App.css';
import logo from './assets/logo.jpg';
import api from './api';

import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import ProfileSettings from './pages/ProfileSettings';
import ChatPage from './pages/ChatPage';

import NotificationsPage from './pages/NotificationsPage';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [showRoleSelection, setShowRoleSelection] = React.useState(false);

  const loginRoles = [
    { title: 'Student', icon: <GraduationCap size={24} />, path: '/login/student' },
    { title: 'Teacher', icon: <UserCircle size={24} />, path: '/login/teacher' },
    { title: 'Principal', icon: <ShieldCheck size={24} />, path: '/login/principal' }
  ];

  return (
    <div className="landing-hero">
      <Link to="/about" className="top-left-about"><HelpCircle size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> About</Link>
      
      <div className="logo-animation">
        <img src={logo} alt="School Logo" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #667eea', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }} />
      </div>
      <div className="school-name-large">Janta +2 High School</div>
      <h1 className="welcome-title main-title-animated">Welcome to Digital-Janta</h1>
      
      {!user ? (
        <button onClick={() => setShowRoleSelection(true)} className="main-login-btn interactive-tap">
          Login Here
        </button>
      ) : (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          <p style={{ fontSize: '1.2rem', color: '#718096' }}>Welcome back, <b>{user.name}</b>!</p>
          <button onClick={() => navigate(`/${user.role}`)} className="main-login-btn interactive-tap" style={{ marginTop: '1rem' }}>
            Go to Portal
          </button>
        </div>
      )}

      {showRoleSelection && (
        <div className="selection-overlay">
          <div className="selection-card">
            <button onClick={() => setShowRoleSelection(false)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Who are you?</h2>
            <div className="role-buttons">
              {loginRoles.map((role, index) => (
                <button key={index} className="role-btn interactive-tap" onClick={() => navigate(role.path)}>
                  {role.icon} {role.title}
                </button>
              ))}
              <button className="role-btn interactive-tap" style={{ borderColor: '#667eea', color: '#667eea' }} onClick={() => navigate('/register')}>
                <UserCircle /> New Student? Register
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="footer-links">
        <Link to="/privacy" className="footer-link">Privacy Policy</Link>
        <Link to="/privacy" className="footer-link">Terms & Conditions</Link>
        <span className="footer-link">Created by DILSHAN</span>
      </div>
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

  if (user.role.toLowerCase() !== allowedRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PortalWrapper = ({ children }) => {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const checkNotifications = React.useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/api/notifications/unread/${user.id}?role=${user.role}&className=${user.class || ''}`);
      const lastReadCount = parseInt(localStorage.getItem(`last_read_count_${user.id}`) || '0');
      const newCount = res.data.count - lastReadCount;
      setUnreadCount(newCount > 0 ? newCount : 0);
    } catch (err) {
      console.error("Notif check failed", err);
    }
  }, [user]);

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [checkNotifications]);

  // Click effect handler
  useEffect(() => {
    const handleTap = (e) => {
      const ripple = document.createElement('div');
      ripple.className = 'ripple-effect';
      ripple.style.left = `${e.clientX - 10}px`;
      ripple.style.top = `${e.clientY - 10}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    };
    window.addEventListener('mousedown', handleTap);
    return () => window.removeEventListener('mousedown', handleTap);
  }, []);

  return (
    <div className="app-container">
      <div className="top-nav-controls">
        <div className="notification-bell interactive-tap" onClick={() => {
          localStorage.setItem(`last_read_count_${user.id}`, (parseInt(localStorage.getItem(`last_read_count_${user.id}`) || '0') + unreadCount).toString());
          setUnreadCount(0);
          navigate('/notifications');
        }}>
          <Bell size={28} color="#667eea" />
          {unreadCount > 0 && <span className="notification-dot"></span>}
        </div>
        <div className="settings-gear interactive-tap" onClick={() => navigate('/settings')}>
          <Settings size={28} color="#667eea" />
        </div>
      </div>

      <div className="floating-chat-btn interactive-tap" onClick={() => navigate('/chat')}>
        <MessageCircle size={28} color="white" />
      </div>
      
      <header style={{ padding: '2rem', background: 'transparent', color: 'var(--text-main)', boxShadow: 'none' }}>
        <div style={{ textAlign: 'left' }}>
          <div className="school-name-large" style={{ fontSize: '1rem', letterSpacing: '2px', margin: 0 }}>Janta +2 High School</div>
          <h1 className="welcome-title" style={{ fontSize: '2rem', margin: 0 }}>Digital-Janta</h1>
        </div>
      </header>
      
      <main className="main-content" style={{ display: 'block', padding: '1rem' }}>
        <div className="portal-container" style={{ paddingTop: 0 }}>
          <NoticeBoard />
          {children}
        </div>
      </main>
      <footer style={{ background: '#f7fafc', padding: '2rem' }}>&copy; 2026 Digital-Janta | Built by DILSHAN</footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/settings" element={<ProfileSettings />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          
          <Route path="/login/student" element={<LoginPage role="Student" />} />
          <Route path="/login/teacher" element={<LoginPage role="Teacher" />} />
          <Route path="/login/principal" element={<LoginPage role="Principal" />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/student/*" element={<ProtectedRoute allowedRole="student"><PortalWrapper><StudentPortal /></PortalWrapper></ProtectedRoute>} />
          <Route path="/teacher/*" element={<ProtectedRoute allowedRole="teacher"><PortalWrapper><TeacherPortal /></PortalWrapper></ProtectedRoute>} />
          <Route path="/principal/*" element={<ProtectedRoute allowedRole="principal"><PortalWrapper><PrincipalPortal /></PortalWrapper></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
