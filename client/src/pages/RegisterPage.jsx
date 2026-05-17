import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
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
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-card" style={{ cursor: 'default', transform: 'none', maxWidth: '400px' }}>
        <Link to="/" className="secondary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '1rem', fontSize: '0.8rem' }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input name="name" placeholder="Full Name" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Role:</label>
            <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="principal">Principal</option>
            </select>
          </div>

          {(formData.role === 'student' || formData.role === 'teacher') && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Class:</label>
                <select name="className" value={formData.className} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <option value="9">9th</option>
                  <option value="10">10th</option>
                  <option value="11">11th</option>
                  <option value="12">12th</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Section:</label>
                <select name="section" value={formData.section} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>
            </div>
          )}

          {error && <p className="error-msg">{error}</p>}
          {success && <p style={{ color: '#48bb78', fontSize: '0.85rem' }}>{success}</p>}
          <button type="submit" className="login-btn">
            <UserPlus size={18} style={{ marginRight: '8px' }} /> Register
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          Already have an account? <Link to="/" style={{ color: 'var(--accent-color)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
