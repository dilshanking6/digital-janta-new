import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import { ClipboardCheck, Send, AlertTriangle, CheckCircle, XCircle, ArrowLeft, Users, MessageSquare } from 'lucide-react';
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

const AttendanceSection = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickStudent, setQuickStudent] = useState({ name: '', className: user.class || '10', section: user.section || 'A' });
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const navigate = useNavigate();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    console.log(`Teacher Portal: Fetching students for Class ${user.class}, Section ${user.section}`);
    try {
      const targetClass = user.class || '10';
      const targetSection = user.section || 'A';
      const res = await api.get(`/api/users/class/${targetClass}/${targetSection}`);
      const studentData = Array.isArray(res.data) ? res.data : [];
      console.log(`Teacher Portal: Received ${studentData.length} students`);
      setStudents(studentData);
      const initialAttendance = {};
      studentData.forEach(s => initialAttendance[String(s.id)] = false);
      setAttendance(initialAttendance);
    } catch (err) {
      console.error("Teacher Portal: Fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [user.class, user.section]);

  useEffect(() => {
    if (user.class && user.section) {
      fetchStudents();
    }
  }, [fetchStudents, user.class, user.section]);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const generatedEmail = `${quickStudent.name.replace(/\s/g, '').toLowerCase()}${Date.now()}@janta.com`;
      await api.post('/api/register', {
        ...quickStudent,
        email: generatedEmail,
        password: '123',
        role: 'student'
      });
      alert('Student registered successfully!');
      setQuickStudent({ name: '', className: user.class || '10', section: user.section || 'A' });
      setShowQuickAdd(false);
      setTimeout(fetchStudents, 1000);
    } catch (err) {
      alert('Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    const presentStudents = students.filter(s => attendance[String(s.id)]).map(s => ({ id: s.id, name: s.name }));
    const absentStudents = students.filter(s => !attendance[String(s.id)]).map(s => ({ id: s.id, name: s.name }));

    if (students.length === 0 || marking) return;
    setMarking(true);
    try {
      await api.post('/api/attendance', {
        className: user.class || '10',
        section: user.section || 'A',
        presentStudents,
        absentStudents,
        markedBy: user.id,
        teacherName: user.name
      });
      
      await api.post('/api/messages', {
        senderId: user.id,
        receiverRole: 'principal',
        content: `Attendance for Class ${user.class}-${user.section} has been submitted by ${user.name}. ${presentStudents.length} present, ${absentStudents.length} absent.`,
        type: 'notification'
      });

      alert('Attendance marked and Principal notified!');
    } catch (err) {
      alert('Failed to mark attendance');
    } finally {
      setMarking(false);
    }
  };

  const toggleAttendance = (id) => {
    setAttendance(prev => ({ ...prev, [String(id)]: !prev[String(id)] }));
  };

  return (
    <div className="portal-sub-page">
      <button onClick={() => navigate('/teacher')} className="back-btn"><ArrowLeft size={20} /> Back to Dashboard</button>
      <h3 className="page-title"><ClipboardCheck /> Attendance: Class {user.class}-{user.section}</h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="secondary-btn" onClick={fetchStudents} disabled={loading} style={{ padding: '10px 20px' }}>
          {loading ? 'Refreshing...' : '🔄 Reload Student List'}
        </button>
        <button className="primary-btn" style={{ width: 'auto', padding: '10px 20px', background: 'var(--secondary-gradient)' }} onClick={() => setShowQuickAdd(!showQuickAdd)}>
          {showQuickAdd ? 'Close' : '+ Quick Add Student'}
        </button>
      </div>

      {showQuickAdd && (
        <div style={{ background: '#f7fafc', padding: '2rem', borderRadius: '1.5rem', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
          <h4>New Student for Class {user.class}-{user.section}</h4>
          <form onSubmit={handleQuickAdd} className="quick-add-form" style={{ gridTemplateColumns: '1fr auto', gap: '10px', marginTop: '1rem' }}>
            <input value={quickStudent.name} onChange={(e) => setQuickStudent({...quickStudent, name: e.target.value})} required className="modern-input" placeholder="Full Student Name" style={{ marginTop: 0 }} />
            <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Adding...' : 'Register Now'}</button>
          </form>
        </div>
      )}

      {students.length > 0 ? (
        <div className="attendance-card">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>TICK</th>
                <th>STUDENT NAME</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} onClick={() => toggleAttendance(s.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={!!attendance[String(s.id)]} 
                      onChange={() => {}} 
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ fontWeight: '700' }}>{s.name}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ 
                      padding: '5px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.7rem', 
                      fontWeight: '800',
                      background: attendance[String(s.id)] ? '#e6fffa' : '#fff5f5',
                      color: attendance[String(s.id)] ? '#38a169' : '#e53e3e'
                    }}>
                      {attendance[String(s.id)] ? 'PRESENT' : 'ABSENT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="primary-btn" disabled={marking} onClick={handleMarkAttendance} style={{ marginTop: '2rem', padding: '1.2rem', width: '100%' }}>
            {marking ? 'SUBMITTING...' : `SUBMIT ATTENDANCE FOR ${students.length} STUDENTS`}
          </button>
        </div>
      ) : (
        <div className="empty-state">
          {loading ? 'Fetching...' : `No students found in Class ${user.class}-${user.section}`}
        </div>
      )}
    </div>
  );
};

const MessagingSection = ({ user }) => {
  const [content, setContent] = useState('');
  const [report, setReport] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleSendMessage = async (type) => {
    if ((!content && type !== 'report') || sending) return;
    setSending(true);
    try {
      await api.post('/api/messages', {
        senderId: user.id,
        receiverRole: type === 'report' ? 'principal' : 'student',
        content: type === 'report' ? report : content,
        type: type === 'report' ? 'complaint' : type,
        targetClass: type === 'report' ? null : (user.class || '10')
      });
      if (type === 'report') setReport('');
      else setContent('');
      alert('Sent successfully!');
    } catch (err) {
      alert('Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="portal-sub-page">
      <button onClick={() => navigate('/teacher')} className="back-btn"><ArrowLeft size={20} /> Back to Dashboard</button>
      <h3 className="page-title"><Send /> Homework & Reports</h3>
      
      <div className="dashboard-grid-2">
        <section className="dashboard-card">
          <h4>Send Homework to Class</h4>
          <textarea 
            placeholder="Assign homework to your students..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="modern-input"
            style={{ height: '150px' }}
          ></textarea>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="primary-btn" onClick={() => handleSendMessage('homework')} disabled={sending}>Send HW</button>
            <button className="secondary-btn" onClick={() => handleSendMessage('message')} disabled={sending}>Send Msg</button>
          </div>
        </section>

        <section className="dashboard-card">
          <h4>Report to Principal</h4>
          <textarea 
            placeholder="Submit report or feedback..."
            value={report}
            onChange={(e) => setReport(e.target.value)}
            className="modern-input"
            style={{ height: '150px' }}
          ></textarea>
          <button className="primary-btn" style={{ background: '#f56565' }} onClick={() => handleSendMessage('report')} disabled={sending}>Submit Report</button>
        </section>
      </div>
    </div>
  );
};

const TeacherPortal = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="portal-container">
      <header className="portal-header">
        <div>
          <h2 className="portal-welcome-text">Teacher Portal</h2>
          <p className="portal-subtitle">Assigned: Class {user.class}-{user.section} | Welcome, {user.name}</p>
        </div>
      </header>

      <Routes>
        <Route path="/" element={
          <div className="portal-dashboard-grid">
            <DashboardCard 
              title="Attendance" 
              icon={ClipboardCheck} 
              color="#48bb78" 
              description="Mark and view student attendance"
              onClick={() => navigate('attendance')}
            />
            <DashboardCard 
              title="Homework" 
              icon={Send} 
              color="#667eea" 
              description="Assign homework and tasks"
              onClick={() => navigate('messages')}
            />
            <DashboardCard 
              title="Class Overview" 
              icon={Users} 
              color="#ed8936" 
              description="View and manage your students"
              onClick={() => navigate('attendance')}
            />
            <DashboardCard 
              title="Reports" 
              icon={AlertTriangle} 
              color="#f56565" 
              description="Submit reports to Principal"
              onClick={() => navigate('messages')}
            />
          </div>
        } />
        <Route path="attendance" element={<AttendanceSection user={user} />} />
        <Route path="messages" element={<MessagingSection user={user} />} />
      </Routes>
    </div>
  );
};

export default TeacherPortal;
