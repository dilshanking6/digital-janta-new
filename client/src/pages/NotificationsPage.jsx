import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { Bell, ArrowLeft, CheckCircle, Info, MessageSquare, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get(`/api/messages/student?className=${user.class || ''}&studentId=${user.id}`);
      const pvtRes = await api.get(`/api/messages/private?user1=${user.id}&user2=all`); // This is hypothetical, let's just use student ones for now
      
      // Combine all relevant notifications
      setNotifications(res.data);
      
      // Update local storage to reflect these are seen
      const countRes = await api.get(`/api/notifications/unread/${user.id}?role=${user.role}&className=${user.class || ''}`);
      localStorage.setItem(`last_read_count_${user.id}`, countRes.data.count.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getIcon = (type) => {
    switch (type) {
      case 'notification': return <CheckCircle size={24} color="#48bb78" />;
      case 'notice': return <Info size={24} color="#4299e1" />;
      case 'note': return <MessageSquare size={24} color="#ed8936" />;
      default: return <AlertCircle size={24} color="#718096" />;
    }
  };

  return (
    <div className="special-page-container">
      <div className="special-page-card" style={{ maxWidth: '700px', minHeight: '600px' }}>
        <button onClick={() => navigate(-1)} className="back-circle-btn"><ArrowLeft /></button>
        <h1 className="colorful-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <Bell size={32} /> Notifications
        </h1>

        {loading ? (
          <div className="logo-animation" style={{ fontSize: '3rem', marginTop: '4rem' }}>🔔</div>
        ) : (
          <div className="notifications-list" style={{ textAlign: 'left', marginTop: '2rem' }}>
            {notifications.length > 0 ? (
              notifications.map((n, i) => (
                <div key={i} className="notification-item-new" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="notif-icon-circle">{getIcon(n.type)}</div>
                  <div className="notif-content-area">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ textTransform: 'uppercase', fontSize: '0.7rem', color: '#a0aec0' }}>{n.type}</strong>
                      <small style={{ color: '#cbd5e0' }}>{new Date(n.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p style={{ margin: '5px 0', fontSize: '1.05rem', color: '#2d3748' }}>{n.content}</p>
                    <small style={{ color: '#718096' }}>From: {n.sender?.name || 'School Admin'}</small>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                <Bell size={64} style={{ marginBottom: '1rem' }} />
                <p>No new notifications for you.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
