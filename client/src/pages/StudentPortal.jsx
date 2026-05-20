import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../api';
import { Upload, FileText, AlertCircle, MessageSquare, Search, Send, User, Camera, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../AuthContext';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';

const DashboardCard = ({ title, icon: Icon, color, onClick, description }) => (
  <div className="dashboard-item-card interactive-tap" onClick={onClick} style={{ '--card-color': color }}>
    <div className="card-icon"><Icon size={32} /></div>
    <div className="card-info">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  </div>
);

const NotesSection = ({ user }) => {
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearchStudents = async () => {
    if (!searchName) return;
    try {
      const res = await api.get(`/api/users/search?name=${searchName}`);
      setSearchResults(res.data);
    } catch (err) {
      alert('Search failed');
    }
  };

  const handleShareNote = async () => {
    if (!selectedStudent || !noteContent || sending) return;
    setSending(true);
    try {
      await api.post('/api/messages', {
        senderId: user.id,
        receiverRole: 'student',
        content: `SHARED NOTE: ${noteContent}`,
        type: 'note',
        targetStudentId: selectedStudent.id
      });
      setNoteContent('');
      setSelectedStudent(null);
      setSearchName('');
      setSearchResults([]);
      alert('Note shared successfully! It will appear in their Inbox.');
    } catch (err) {
      alert('Failed to share note. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      // Simulate upload
      setTimeout(() => {
        setNoteContent(prev => prev + `\n[Attached File: ${file.name}]`);
        setUploading(false);
        alert('File attached to note!');
      }, 1500);
    }
  };

  return (
    <div className="portal-sub-page">
      <button onClick={() => navigate('/student')} className="back-btn"><ArrowLeft size={20} /> Back to Dashboard</button>
      <h3 className="page-title"><FileText /> Share Notes & Files</h3>
      
      <div className="dashboard-card" style={{ background: 'white !important', padding: '2rem !important', borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05) !important' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              placeholder="Search student name to share with..." 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="modern-input"
              style={{ paddingLeft: '3rem', marginTop: 0 }}
            />
            <Search size={20} style={{ position: 'absolute', left: '15px', top: '15px', color: '#a0aec0' }} />
          </div>
          <button className="primary-btn" onClick={handleSearchStudents} style={{ width: 'auto', padding: '0 30px' }}>Search</button>
        </div>

        {searchResults.length > 0 && !selectedStudent && (
          <div className="search-results-list">
            {searchResults.map(s => (
              <div key={s.id} onClick={() => setSelectedStudent(s)} className="search-item-hover">
                <div className="user-avatar-mini"><User size={20} /></div>
                <div>
                  <div style={{ fontWeight: '700' }}>{s.name}</div>
                  <small>Class {s.class}-{s.section}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedStudent && (
          <div className="share-form">
            <p>Sharing with: <strong>{selectedStudent.name}</strong> <button onClick={() => setSelectedStudent(null)} className="change-btn">Change</button></p>
            <textarea 
              placeholder="Paste notes, links, or type your message..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="modern-input"
              style={{ height: '150px' }}
            ></textarea>
            
            <div className="upload-controls">
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              <button className="upload-btn" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                {uploading ? 'Attaching...' : <><Camera size={18} /> Upload Photo/Document</>}
              </button>
              <button className="primary-btn" onClick={handleShareNote} style={{ flex: 1 }}>Send Note</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InboxSection = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get(`/api/messages/student?className=${user.class}&studentId=${user.id}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [user.class, user.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="portal-sub-page">
      <button onClick={() => navigate('/student')} className="back-btn"><ArrowLeft size={20} /> Back to Dashboard</button>
      <h3 className="page-title"><MessageSquare /> My Inbox & Homework</h3>
      <div className="messages-list-vertical">
        {messages.filter(m => !['complaint', 'query'].includes(m.type)).map((msg, i) => (
          <div key={i} className="message-card" style={{ borderLeftColor: msg.type === 'note' ? '#4299e1' : '#ed8936' }}>
            <div className="msg-header">
              <span className="msg-sender">{msg.sender?.name}</span>
              <small className="msg-date">{new Date(msg.createdAt).toLocaleDateString()}</small>
            </div>
            <div className="msg-type">[{msg.type.toUpperCase()}]</div>
            <div className="msg-content">{msg.content}</div>
          </div>
        ))}
        {messages.length === 0 && <p className="empty-state">No messages yet.</p>}
      </div>
    </div>
  );
};

const ComplaintsSection = ({ user }) => {
  const [complaint, setComplaint] = useState('');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

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

  const handleSendQuery = async () => {
    if (!query) return;
    try {
      await api.post('/api/messages', {
        senderId: user.id,
        receiverRole: 'teacher',
        content: `QUERY: ${query}`,
        type: 'query',
        targetClass: user.class
      });
      setQuery('');
      alert('Query sent to teachers!');
    } catch (err) {
      alert('Failed to send query');
    }
  };

  return (
    <div className="portal-sub-page">
      <button onClick={() => navigate('/student')} className="back-btn"><ArrowLeft size={20} /> Back to Dashboard</button>
      <h3 className="page-title"><AlertCircle /> Reports & Queries</h3>
      
      <div className="dashboard-grid-2">
        <section className="dashboard-card">
          <h4>Ask Teacher / Doubt</h4>
          <textarea 
            placeholder="Ask a question to your teachers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="modern-input"
            style={{ height: '120px' }}
          ></textarea>
          <button className="primary-btn" style={{ background: 'var(--secondary-gradient)' }} onClick={handleSendQuery}><Send size={18} /> Send to Teachers</button>
        </section>

        <section className="dashboard-card">
          <h4>Report to Principal</h4>
          <textarea 
            placeholder="Write your complaint or feedback..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="modern-input"
            style={{ height: '120px' }}
          ></textarea>
          <button className="primary-btn" style={{ background: '#f56565' }} onClick={handleSendComplaint}>Submit Complaint</button>
        </section>
      </div>
    </div>
  );
};

const StudentPortal = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="portal-container">
      <header className="portal-header">
        <div>
          <h2 className="portal-welcome-text">Student Portal</h2>
          <p className="portal-subtitle">Class {user.class} | Welcome, {user.name}</p>
        </div>
      </header>
      
      <Routes>
        <Route path="/" element={
          <div className="portal-dashboard-grid">
            <DashboardCard 
              title="Share Notes" 
              icon={FileText} 
              color="#667eea" 
              description="Share files and notes with classmates"
              onClick={() => navigate('notes')}
            />
            <DashboardCard 
              title="Inbox" 
              icon={MessageSquare} 
              color="#48bb78" 
              description="Check homework and messages"
              onClick={() => navigate('inbox')}
            />
            <DashboardCard 
              title="Complaints" 
              icon={AlertCircle} 
              color="#f56565" 
              description="Ask doubts or report issues"
              onClick={() => navigate('complaints')}
            />
            <DashboardCard 
              title="Attendance" 
              icon={User} 
              color="#ed8936" 
              description="View your attendance history"
              onClick={() => alert('Attendance feature coming soon!')}
            />
          </div>
        } />
        <Route path="notes" element={<NotesSection user={user} />} />
        <Route path="inbox" element={<InboxSection user={user} />} />
        <Route path="complaints" element={<ComplaintsSection user={user} />} />
      </Routes>
    </div>
  );
};

export default StudentPortal;
