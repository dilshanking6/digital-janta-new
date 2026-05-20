import React, { useState, useEffect } from 'react';
import api from '../api';
import { Megaphone } from 'lucide-react';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/api/messages/all');
        setNotices(res.data);
      } catch (err) {
        console.error('Failed to fetch notices');
      }
    };
    fetchNotices();
  }, []);

  if (notices.length === 0) return null;

  return (
    <div className="important-notices" style={{ 
      background: '#fff5f5', 
      border: '2px solid #feb2b2', 
      padding: '1.5rem', 
      borderRadius: '1rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ color: '#e53e3e', fontWeight: '800', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', borderBottom: '2px solid #fed7d7', paddingBottom: '0.5rem' }}>
        <Megaphone size={24} /> IMPORTANT SCHOOL NOTICES
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notices.map((n, i) => (
          <div key={i} style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            borderLeft: '5px solid #f56565',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <p style={{ margin: 0, fontWeight: '600', color: '#2d3748', fontSize: '1.1rem' }}>{n.content}</p>
            <small style={{ color: '#a0aec0', display: 'block', marginTop: '5px' }}>Posted on: {new Date(n.createdAt).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeBoard;
