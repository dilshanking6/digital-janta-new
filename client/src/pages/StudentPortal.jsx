import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import { Upload, FileText, AlertCircle, MessageSquare } from 'lucide-react';
import { AuthContext } from '../AuthContext';

const StudentPortal = () => {
  const [complaint, setComplaint] = useState('');
  const [messages, setMessages] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get(`/api/messages/student?className=${user.class}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [user.class]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendComplaint = async () => {
    if (!complaint) return;
    try {
      await api.post('/api/messages', {
        senderId: user.id,
        receiverRole: 'principal',
        content: complaint,
        type: 'complaint'
      });
      setComplaint('');
      alert('Complaint sent to Principal!');
    } catch (err) {
      alert('Failed to send complaint');
    }
  };

  return (
    <div className="portal-container">
      <header className="portal-header">
        <h2>Student Dashboard (Class: {user.class})</h2>
      </header>
      
      <div className="dashboard-grid">
        <section className="dashboard-card">
          <h3><FileText /> Shared Notes</h3>
          <div className="upload-section">
            <button className="secondary-btn"><Upload size={16} /> Upload Notes</button>
          </div>
          <ul className="notes-list">
            <li>Coming Soon: Cloud Storage Integration</li>
          </ul>
        </section>

        <section className="dashboard-card">
          <h3><MessageSquare /> Homework & Messages</h3>
          <div className="messages-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {messages.filter(m => m.type !== 'complaint').map((msg, i) => (
              <div key={i} className="hw-item">
                <small>{new Date(msg.createdAt).toLocaleDateString()} - {msg.sender?.name}</small>
                <div><strong>[{msg.type.toUpperCase()}]</strong> {msg.content}</div>
              </div>
            ))}
            {messages.length === 0 && <p>No messages yet.</p>}
          </div>
        </section>

        <section className="dashboard-card">
          <h3><AlertCircle /> Report / Complaint</h3>
          <textarea 
            placeholder="Write your complaint or report teacher absence to Principal..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
          ></textarea>
          <button className="primary-btn" onClick={handleSendComplaint}>Send to Principal</button>
        </section>
      </div>
    </div>
  );
};

export default StudentPortal;
