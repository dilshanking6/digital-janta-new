import React, { useState, useContext } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { LogIn } from 'lucide-react';

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
    <div className="login-form-container">
      <div className="login-card" style={{ cursor: 'default', transform: 'none' }}>
        <h2>{role} Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="login-btn">
            <LogIn size={18} style={{ marginRight: '8px' }} /> Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
