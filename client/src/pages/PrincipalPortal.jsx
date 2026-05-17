import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import { Megaphone, Inbox, Users, BarChart, UserPlus, Settings } from 'lucide-react';
import { AuthContext } from '../AuthContext';

const PrincipalPortal = () => {
  const [notice, setNotice] = useState('');
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ attendance: [], totalStudents: 0, totalTeachers: 0 });
  const [showRegForm, setShowRegForm] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [regData, setRegData] = useState({ name: '', email: '', password: '', role: 'student', className: '10', section: 'A' });
  const [profileData, setProfileData] = useState({ email: '', password: '' });
  const { user } = useContext(AuthContext);

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

  const handlePostNotice = async () => {
    if (!notice) return;
    try {
      await api.post('/api/messages', {
        senderId: user.id,
        receiverRole: 'all',
        content: notice,
        type: 'notice'
      });
      setNotice('');
      alert('Notice posted for all!');
      fetchMessages();
    } catch (err) {
      alert('Failed to post notice');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/register', regData);
      alert('User registered successfully!');
      setRegData({ name: '', email: '', password: '', role: 'student', className: '10', section: 'A' });
      setShowRegForm(false);
      fetchStats();
    } catch (err) {
      alert('Registration failed');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/users/profile/${user.id}`, profileData);
      alert('Profile updated! Please login again if you changed your email.');
      setShowProfileEdit(false);
    } catch (err) {
      alert('Update failed');
    }
  };

  const attendanceArray = Array.isArray(stats?.attendance) ? stats.attendance : [];
  const totalPresentToday = attendanceArray.reduce((acc, curr) => acc + (curr.presentStudents?.length || 0), 0);

  return (
    <div className="portal-container">
      <header className="portal-header">
        <h2>Principal Dashboard</h2>
      </header>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <h3><Megaphone /> Notice Board</h3>
          <textarea 
            placeholder="Post school-wide announcement (e.g., Summer Vacation)..."
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
          ></textarea>
          <button className="primary-btn" onClick={handlePostNotice}>Post Global Notice</button>
        </section>

        <section className="dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3><Settings size={20} /> Edit Profile</h3>
            <button className="secondary-btn" onClick={() => setShowProfileEdit(!showProfileEdit)}>
              {showProfileEdit ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {showProfileEdit && (
            <form onSubmit={handleUpdateProfile} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <input placeholder="New Email (optional)" type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <input placeholder="New Password (optional)" type="password" value={profileData.password} onChange={(e) => setProfileData({...profileData, password: e.target.value})} />
              </div>
              <button type="submit" className="primary-btn">Update Profile</button>
            </form>
          )}
        </section>

        <section className="dashboard-card">
          <h3><UserPlus /> Add New User</h3>
          <button className="secondary-btn" onClick={() => setShowRegForm(!showRegForm)}>
            {showRegForm ? 'Close Form' : 'Open Form'}
          </button>
          
          {showRegForm && (
            <form onSubmit={handleRegister} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <input placeholder="Full Name" value={regData.name} onChange={(e) => setRegData({...regData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <input placeholder="Email" type="email" value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <input placeholder="Password" type="password" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} required />
              </div>
              <div className="form-group">
                <select value={regData.role} onChange={(e) => setRegData({...regData, role: e.target.value})}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="principal">Principal</option>
                </select>
              </div>
              {regData.role !== 'principal' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select value={regData.className} onChange={(e) => setRegData({...regData, className: e.target.value})}>
                    <option value="9">9th</option>
                    <option value="10">10th</option>
                    <option value="11">11th</option>
                    <option value="12">12th</option>
                  </select>
                  <select value={regData.section} onChange={(e) => setRegData({...regData, section: e.target.value})}>
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                  </select>
                </div>
              )}
              <button type="submit" className="primary-btn" style={{ marginTop: '10px' }}>Register User</button>
            </form>
          )}
        </section>

        <section className="dashboard-card">
          <h3><Users /> School Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#ebf8ff', padding: '1rem', borderRadius: '0.5rem' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><BarChart size={18} /> Today's Attendance</strong>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{totalPresentToday} Students Present</p>
              <small>From {attendanceArray.length} classes marked.</small>
            </div>
            <p>Total Teachers: {stats?.totalTeachers || 0}</p>
            <p>Total Students: {stats?.totalStudents || 0}</p>
          </div>
        </section>

        <section className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3><Inbox /> Recent Complaints/Reports</h3>
          <div className="messages-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {Array.isArray(messages) && messages.filter(m => m.type === 'complaint').map((msg, i) => (
              <div key={i} className="complaint-item">
                <small>{new Date(msg.createdAt).toLocaleDateString()} - {msg.sender?.name}</small>
                <p>{msg.content}</p>
              </div>
            ))}
            {(!messages || messages.length === 0) && <p>No reports yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrincipalPortal;
