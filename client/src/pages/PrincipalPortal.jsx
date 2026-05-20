import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import { Megaphone, Inbox, Users, BarChart, UserPlus, ArrowLeft, Edit, Trash2, Check, X } from 'lucide-react';
import { AuthContext } from '../AuthContext';
import { Routes, Route, useNavigate } from 'react-router-dom';

const DashboardCard = ({ title, icon: Icon, color, onClick, description }) => (
  <div className="dashboard-item-card interactive-tap" onClick={onClick} style={{ '--card-color': color }}>
    <div className="card-icon"><Icon size={32} /></div>
    <div className="card-info">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  </div>
);

const NoticesSection = ({ user, fetchMessages, messages }) => {
  const [notice, setNotice] = useState('');
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePostNotice = async () => {
    if (!notice || loading) return;
    setLoading(true);
    try {
      if (editingNoticeId) {
        await api.put(`/api/messages/${editingNoticeId}`, { content: notice });
      } else {
        await api.post('/api/messages', {
          senderId: user.id,
          receiverRole: 'all',
          content: notice,
          type: 'notice'
        });
      }
      setNotice('');
      setEditingNoticeId(null);
      fetchMessages();
      alert('Notice published!');
    } catch (err) {
      alert('Failed to save notice');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure?') || loading) return;
    setLoading(true);
    try {
      await api.delete(`/api/messages/${id}`);
      fetchMessages();
    } catch (err) {
      alert('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-sub-page">
      <button onClick={() => navigate('/principal')} className="back-btn"><ArrowLeft size={20} /> Back to Dashboard</button>
      <h3 className="page-title"><Megaphone /> Global Notice Board</h3>
      
      <div className="dashboard-card" style={{ background: 'white !important', padding: '2rem !important', borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05) !important' }}>
        <textarea 
          placeholder="Post an announcement for everyone..."
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
          className="modern-input"
          style={{ height: '120px' }}
        ></textarea>
        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
          <button className="primary-btn" onClick={handlePostNotice} disabled={loading}>
            {editingNoticeId ? 'Update Notice' : 'Publish Notice'}
          </button>
          {editingNoticeId && (
            <button className="secondary-btn" onClick={() => { setNotice(''); setEditingNoticeId(null); }}>Cancel</button>
          )}
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h4>Live Notices</h4>
        <div className="messages-list-vertical" style={{ marginTop: '1rem' }}>
          {messages.filter(m => m.type === 'notice').map((msg, i) => (
            <div key={i} className="message-card" style={{ borderLeftColor: '#f56565' }}>
              <div className="msg-header">
                <span className="msg-sender">PRINCIPAL</span>
                <small className="msg-date">{new Date(msg.createdAt).toLocaleDateString()}</small>
              </div>
              <p className="msg-content">{msg.content}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button onClick={() => { setNotice(msg.content); setEditingNoticeId(msg.id); }} className="secondary-btn" style={{ padding: '5px 15px', fontSize: '0.8rem' }}>Edit</button>
                <button onClick={() => handleDeleteNotice(msg.id)} className="logout-btn" style={{ padding: '5px 15px', fontSize: '0.8rem', color: '#f56565', borderColor: '#f56565' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ComplaintsManager = ({ user, fetchMessages, messages }) => {
  const navigate = useNavigate();

  const handleAction = async (msg, action) => {
    try {
      const responseText = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
      // 1. Send response message back to student
      await api.post('/api/messages', {
        senderId: user.id,
        receiverRole: 'student',
        targetStudentId: msg.senderId, // We need senderId in messages
        content: `Your complaint: "${msg.content.substring(0, 20)}..." has been ${responseText} by the Principal.`,
        type: 'notification'
      });
      
      // 2. Delete or mark as handled (we'll just delete for now as per current schema)
      await api.delete(`/api/messages/${msg.id}`);
      fetchMessages();
      alert(`Complaint ${action}ed and student notified!`);
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="portal-sub-page">
      <button onClick={() => navigate('/principal')} className="back-btn"><ArrowLeft size={20} /> Back to Dashboard</button>
      <h3 className="page-title"><Inbox /> Complaints & Reports</h3>
      
      <div className="messages-list-vertical">
        {messages.filter(m => m.type === 'complaint').map((msg, i) => (
          <div key={i} className="message-card" style={{ borderLeftColor: '#667eea' }}>
            <div className="msg-header">
              <span className="msg-sender">{msg.sender?.name}</span>
              <small className="msg-date">{new Date(msg.createdAt).toLocaleDateString()}</small>
            </div>
            <p className="msg-content">{msg.content}</p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '1.5rem' }}>
              <button onClick={() => handleAction(msg, 'accept')} className="primary-btn" style={{ background: '#48bb78', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Check size={18} /> Accept
              </button>
              <button onClick={() => handleAction(msg, 'reject')} className="primary-btn" style={{ background: '#f56565', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <X size={18} /> Reject
              </button>
            </div>
          </div>
        ))}
        {messages.filter(m => m.type === 'complaint').length === 0 && <p className="empty-state">No pending complaints.</p>}
      </div>
    </div>
  );
};

const UserManagement = ({ user, fetchStats }) => {
  const [showRegForm, setShowRegForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [regData, setRegData] = useState({ name: '', password: '123', role: 'student', className: '10', section: 'A' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Auto-generate email for backend compatibility
      const generatedEmail = `${regData.name.replace(/\s/g, '').toLowerCase()}${Date.now()}@janta.com`;
      await api.post('/api/register', { ...regData, email: generatedEmail });
      alert('User Registered Successfully!');
      setRegData({ name: '', password: '123', role: 'student', className: '10', section: 'A' });
      setShowRegForm(false);
      fetchStats();
    } catch (err) {
      alert('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-sub-page">
      <button onClick={() => navigate('/principal')} className="back-btn"><ArrowLeft size={20} /> Back to Dashboard</button>
      <h3 className="page-title"><UserPlus /> User Management</h3>
      
      <div className="dashboard-card" style={{ background: 'white !important', padding: '2rem !important', borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05) !important' }}>
        <button className="primary-btn" onClick={() => setShowRegForm(!showRegForm)} style={{ marginBottom: '1.5rem' }}>
          {showRegForm ? 'Close Form' : '+ Register New User'}
        </button>

        {showRegForm && (
          <form onSubmit={handleRegister} className="modern-form">
            <div className="form-row">
              <input placeholder="Full Name" value={regData.name} onChange={(e) => setRegData({...regData, name: e.target.value})} required className="modern-input" />
              <select value={regData.role} onChange={(e) => setRegData({...regData, role: e.target.value})} className="modern-input">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="principal">Principal</option>
              </select>
            </div>
            <div className="form-row">
              <input placeholder="Password (Default: 123)" type="text" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} required className="modern-input" />
              {regData.role !== 'principal' && (
                <>
                  <select value={regData.className} onChange={(e) => setRegData({...regData, className: e.target.value})} className="modern-input">
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                  <select value={regData.section} onChange={(e) => setRegData({...regData, section: e.target.value})} className="modern-input">
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </>
              )}
            </div>
            <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>{loading ? 'Registering...' : 'Register User'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

const PrincipalPortal = () => {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ attendance: [], totalStudents: 0, totalTeachers: 0 });
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get('/api/messages/principal');
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/api/attendance/stats');
      setStats(res.data || { attendance: [], totalStudents: 0, totalTeachers: 0 });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchMessages();
      fetchStats();
    }
  }, [user, fetchMessages, fetchStats]);

  const attendanceArray = Array.isArray(stats?.attendance) ? stats.attendance : [];
  const totalPresentToday = attendanceArray.reduce((acc, curr) => acc + (curr.presentStudents?.length || 0), 0);

  return (
    <div className="portal-container">
      <header className="portal-header">
        <div>
          <h2 className="portal-welcome-text">Principal Portal</h2>
          <p className="portal-subtitle">School Administration | Welcome, {user.name}</p>
        </div>
      </header>

      <Routes>
        <Route path="/" element={
          <div className="portal-dashboard-grid">
            <DashboardCard 
              title="Notices" 
              icon={Megaphone} 
              color="#f56565" 
              description="Post school-wide announcements"
              onClick={() => navigate('notices')}
            />
            <DashboardCard 
              title="Complaints" 
              icon={Inbox} 
              color="#667eea" 
              description="Manage student and teacher reports"
              onClick={() => navigate('complaints')}
            />
            <DashboardCard 
              title="User Management" 
              icon={UserPlus} 
              color="#48bb78" 
              description="Register new students and teachers"
              onClick={() => navigate('users')}
            />
            <DashboardCard 
              title="School Stats" 
              icon={BarChart} 
              color="#ed8936" 
              description="View attendance and school overview"
              onClick={() => alert(`Today's Attendance: ${totalPresentToday} students present.`)}
            />
          </div>
        } />
        <Route path="notices" element={<NoticesSection user={user} fetchMessages={fetchMessages} messages={messages} />} />
        <Route path="complaints" element={<ComplaintsManager user={user} fetchMessages={fetchMessages} messages={messages} />} />
        <Route path="users" element={<UserManagement user={user} fetchStats={fetchStats} />} />
      </Routes>
    </div>
  );
};

export default PrincipalPortal;
