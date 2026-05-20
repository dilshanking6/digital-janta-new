import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student', // Fixed as student
    className: '10',
    section: 'A'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/register', formData);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login/student'), 2000); // Redirect to student login
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="special-page-container">
      <div className="special-page-card" style={{ maxWidth: '500px' }}>
        <button onClick={() => navigate(-1)} className="back-circle-btn"><ArrowLeft /></button>
        <h1 className="colorful-title">Student Registration</h1>
        <p style={{ color: '#a0aec0', marginBottom: '2rem' }}>Join the Digital-Janta community</p>
        
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '700', marginLeft: '5px' }}>Full Name</label>
            <input name="name" placeholder="e.g. Rahul Kumar" onChange={handleChange} required className="modern-input" />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '700', marginLeft: '5px' }}>Email Address</label>
            <input name="email" type="email" placeholder="student@email.com" onChange={handleChange} required className="modern-input" />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '700', marginLeft: '5px' }}>Create Password</label>
            <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required className="modern-input" />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', marginLeft: '5px' }}>Class</label>
              <select name="className" value={formData.className} onChange={handleChange} className="modern-input">
                <option value="9">9th</option>
                <option value="10">10th</option>
                <option value="11">11th</option>
                <option value="12">12th</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', marginLeft: '5px' }}>Section</label>
              <select name="section" value={formData.section} onChange={handleChange} className="modern-input">
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
          </div>

          {error && <p className="error-msg" style={{ textAlign: 'center' }}>{error}</p>}
          {success && <p style={{ color: '#48bb78', fontSize: '0.9rem', textAlign: 'center', fontWeight: '600' }}>{success}</p>}
          
          <button type="submit" className="main-login-btn" style={{ width: '100%', fontSize: '1.2rem', marginTop: '1rem' }}>
            <UserPlus size={20} style={{ marginRight: '8px' }} /> Register Now
          </button>
        </form>
        
        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#a0aec0' }}>
          Already have an account? <Link to="/" style={{ color: '#667eea', fontWeight: '700', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
