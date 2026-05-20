import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { Send, User, Search, ArrowLeft, MessageSquare, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUsers = useCallback(async () => {
    try {
      const searchRes = await api.get(`/api/users/search?name=${search}`);
      setUsers(Array.isArray(searchRes.data) ? searchRes.data : []);
    } catch (err) {
      console.error(err);
    }
  }, [search]);

  const fetchMessages = useCallback(async () => {
    if (!selectedUser) return;
    setFetching(true);
    try {
      const res = await api.get(`/api/messages/private?user1=${user.id}&user2=${selectedUser.id}`, { timeout: 10000 });
      
      setMessages(prev => {
        // Keep messages that are still "sending"
        const sendingMessages = prev.filter(m => m.sending);
        const serverMessages = res.data.map(m => ({ ...m, sending: false }));
        
        // Filter out sending messages that have now been received from server
        const uniqueSending = sendingMessages.filter(sm => 
          !serverMessages.some(svm => svm.content === sm.content && Math.abs(new Date(svm.createdAt) - new Date(sm.createdAt)) < 60000)
        );
        
        return [...serverMessages, ...uniqueSending];
      });
      
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setFetching(false);
    }
  }, [user.id, selectedUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser, fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser || sending) return;
    
    const messageText = message.trim();
    const tempId = 'temp-' + Date.now();
    
    const newMessage = {
      id: tempId,
      content: messageText,
      senderId: user.id,
      receiverId: selectedUser.id,
      createdAt: new Date().toISOString(),
      sending: true
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setSending(true);
    
    try {
      console.log(`ChatPage: Sending message to ${selectedUser.id}`);
      const res = await api.post('/api/messages/private', {
        senderId: String(user.id),
        receiverId: String(selectedUser.id),
        content: messageText
      });
      
      if (res.status === 201 || res.status === 200) {
        console.log("ChatPage: Send successful");
        // Don't wait for fetchMessages to clear "sending", do it now locally
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, sending: false, id: res.data.id } : m));
        // Still fetch to get official timestamp etc.
        fetchMessages();
      } else {
        throw new Error('Server returned non-ok status');
      }
    } catch (err) {
      console.error("ChatPage: Send failed", err);
      alert('Failed to send message. Please check your internet or try again.');
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setMessage(messageText);
    } finally {
      setSending(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="special-page-container" style={{ padding: 0 }}>
      <div className="chat-layout" style={{ width: '100vw', maxWidth: '1400px', height: '90vh' }}>
        <div className="user-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <button onClick={() => navigate(-1)} className="secondary-btn" style={{ padding: '8px', borderRadius: '50%', background: 'white' }}><ArrowLeft size={18} /></button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Chats</h2>
          </div>
          
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <input 
              placeholder="Search people..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="modern-input"
              style={{ paddingLeft: '2.5rem', marginTop: 0 }}
            />
            <Search size={16} style={{ position: 'absolute', left: '15px', top: '15px', color: '#a0aec0' }} />
          </div>

          <div className="users-list">
            {users.filter(u => u.id !== user.id).map(u => (
              <div 
                key={u.id} 
                className={`user-item ${selectedUser?.id === u.id ? 'active interactive-tap' : 'interactive-tap'}`}
                onClick={() => setSelectedUser(u)}
              >
                <div className="user-avatar-mini" style={{ background: selectedUser?.id === u.id ? 'rgba(255,255,255,0.2)' : '#edf2f7', color: selectedUser?.id === u.id ? 'white' : '#4a5568' }}><User size={20} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{u.name}</div>
                  <span className="user-role-badge">STUDENT</span>
                </div>
              </div>
            ))}
            {users.length === 0 && <p style={{ textAlign: 'center', color: '#a0aec0', fontSize: '0.8rem', padding: '1rem' }}>No users found</p>}
          </div>
        </div>

        <div className="chat-window">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div style={{ background: '#f7fafc', padding: '10px', borderRadius: '12px' }}><User size={24} color="#667eea" /></div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>{selectedUser.name}</h3>
                  <small style={{ color: '#48bb78' }}>Connected</small>
                </div>
                <button onClick={fetchMessages} className={`refresh-btn ${fetching ? 'spinning' : ''}`} disabled={fetching}>
                  <RefreshCw size={20} />
                </button>
              </div>
              
              <div className="message-thread">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`message-bubble ${msg.senderId === user.id ? 'message-sent' : 'message-received'}`}
                    style={{ opacity: msg.sending ? 0.6 : 1 }}
                  >
                    {msg.content}
                    {msg.sending && <div style={{ fontSize: '0.5rem', fontStyle: 'italic' }}>Sending...</div>}
                    <div style={{ fontSize: '0.6rem', opacity: 0.7, marginTop: '5px', textAlign: 'right' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', margin: 'auto', color: '#a0aec0' }}>
                    <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                    <p>Start a private conversation with {selectedUser.name}</p>
                  </div>
                )}
              </div>

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input 
                  placeholder="Type a message..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="modern-input"
                  style={{ marginTop: 0 }}
                />
                <button type="submit" className="primary-btn interactive-tap" disabled={sending} style={{ width: 'auto', borderRadius: '1rem', padding: '0 25px' }}>
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#a0aec0' }}>
              <div className="logo-animation" style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
              <h2>Select a contact to start chatting</h2>
              <p>Your messages are private and encrypted.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
