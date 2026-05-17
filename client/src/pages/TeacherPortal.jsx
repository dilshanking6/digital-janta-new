import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import { ClipboardCheck, Send, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { AuthContext } from '../AuthContext';

const TeacherPortal = () => {
  const [content, setContent] = useState('');
  const [report, setReport] = useState('');
  const [targetClass, setTargetClass] = useState('10');
  const [targetSection, setTargetSection] = useState('A');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: true/false }
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.class) setTargetClass(user.class);
    if (user?.section) setTargetSection(user.section);
  }, [user]);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get(`/api/users/class/${targetClass}/${targetSection}`);
      const studentData = Array.isArray(res.data) ? res.data : [];
      setStudents(studentData);
      const initialAttendance = {};
      studentData.forEach(s => initialAttendance[s._id] = true);
      setAttendance(initialAttendance);
    } catch (err) {
      alert('Failed to fetch students');
    }
  }, [targetClass, targetSection]);

  const handleMarkAttendance = async () => {
    const presentStudents = Object.keys(attendance).filter(id => attendance[id]);
    const absentStudents = Object.keys(attendance).filter(id => !attendance[id]);

    try {
      await api.post('/api/attendance', {
        className: targetClass,
        section: targetSection,
        presentStudents,
        absentStudents,
        markedBy: user.id
      });
      alert('Attendance marked successfully!');
    } catch (err) {
      alert('Failed to mark attendance');
    }
  };

  const toggleAttendance = (id) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendMessage = async (type) => {
    if (!content && type !== 'report') return;
    try {
      await api.post('/api/messages', {
        senderId: user.id,
        receiverRole: type === 'report' ? 'principal' : 'student',
        content: type === 'report' ? report : content,
        type: type === 'report' ? 'complaint' : type,
        targetClass: type === 'report' ? null : targetClass
      });
      if (type === 'report') setReport('');
      else setContent('');
      alert('Sent successfully!');
    } catch (err) {
      alert('Failed to send');
    }
  };

  return (
    <div className="portal-container">
      <header className="portal-header">
        <h2>Teacher Dashboard</h2>
        <p>Assigned: Class {user?.class}-{user?.section}</p>
      </header>

      <div className="dashboard-grid">
        <section className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3><ClipboardCheck /> Attendance (Class {targetClass}-{targetSection})</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
            <select value={targetClass} onChange={(e) => setTargetClass(e.target.value)}>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
            <select value={targetSection} onChange={(e) => setTargetSection(e.target.value)}>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
            <button className="secondary-btn" onClick={fetchStudents}>Fetch Students</button>
          </div>

          {students.length > 0 && (
            <div className="attendance-list">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
                    <th style={{ textAlign: 'center', padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{s.name}</td>
                      <td style={{ textAlign: 'center', padding: '10px' }}>
                        <button 
                          onClick={() => toggleAttendance(s._id)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            color: attendance[s._id] ? '#48bb78' : '#f56565'
                          }}
                        >
                          {attendance[s._id] ? <CheckCircle size={24} /> : <XCircle size={24} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="primary-btn" style={{ marginTop: '1rem' }} onClick={handleMarkAttendance}>Submit Attendance</button>
            </div>
          )}
        </section>

        <section className="dashboard-card">
          <h3><Send /> Send Homework/Message</h3>
          <textarea 
            placeholder="Write homework or message for students..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="primary-btn" onClick={() => handleSendMessage('homework')}>Send HW</button>
            <button className="secondary-btn" onClick={() => handleSendMessage('message')}>Send Msg</button>
          </div>
        </section>

        <section className="dashboard-card">
          <h3><AlertTriangle /> Report to Principal</h3>
          <textarea 
            placeholder="Submit reports or complaints to the Principal..."
            value={report}
            onChange={(e) => setReport(e.target.value)}
          ></textarea>
          <button className="secondary-btn" onClick={handleSendMessage('report')}>Submit Report</button>
        </section>
      </div>
    </div>
  );
};

export default TeacherPortal;
