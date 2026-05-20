import React, { useState, useContext } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { LogIn, ArrowLeft } from 'lucide-react';

const LoginPage = ({ role }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/login', { email, password });
      if (response.data.user.role !== role.toLowerCase()) {
        setError(`This login is for ${role}s only.`);
        return;
      }
      login(response.data);
      navigate(`/${role.toLowerCase()}`);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="special-page-container">
      <div className="special-page-card" style={{ maxWidth: '450px' }}>
        <button 
          onClick={() => navigate('/')} 
          className="back-circle-btn"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          {role === 'Student' ? '🎓' : role === 'Teacher' ? '👨‍🏫' : '🛡️'}
        </div>
        
        <h1 className="colorful-title">{role} Login</h1>
        <p style={{ color: '#a0aec0', marginBottom: '2rem' }}>Enter your credentials to access your portal</p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '700', marginLeft: '5px' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="name@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="modern-input"
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '700', marginLeft: '5px' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="modern-input"
            />
          </div>
          
          {error && <p className="error-msg" style={{ textAlign: 'center' }}>{error}</p>}
          
          <button type="submit" className="main-login-btn" style={{ width: '100%', fontSize: '1.2rem', marginTop: '1rem' }}>
            <LogIn size={20} style={{ marginRight: '8px' }} /> Login to Portal
          </button>
        </form>
        
        {role === 'Student' && (
          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#a0aec0' }}>
            New student? <button onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: 'bold' }}>Create Account</button>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
