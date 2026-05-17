import React, { useState, useEffect } from 'react';
import api from '../api';
import { Megaphone } from 'lucide-react';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/api/messages/all');
        const globalNotices = res.data.filter(m => m.type === 'notice' || m.receiverRole === 'all');
        setNotices(globalNotices);
      } catch (err) {
        console.error('Failed to fetch notices');
      }
    };
    fetchNotices();
  }, []);

  if (notices.length === 0) return null;

  return (
    <div className="notice-ticker" style={{ 
      background: '#fff5f5', 
      border: '1px solid #feb2b2', 
      padding: '0.5rem 1rem', 
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      overflow: 'hidden'
    }}>
      <div style={{ color: '#f56565', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
        <Megaphone size={16} /> LATEST NOTICE:
      </div>
      <marquee style={{ color: '#c53030', fontWeight: '500' }}>
        {notices.map((n, i) => (
          <span key={i} style={{ marginRight: '3rem' }}>• {n.content} ({new Date(n.createdAt).toLocaleDateString()})</span>
        ))}
      </marquee>
    </div>
  );
};

export default NoticeBoard;
