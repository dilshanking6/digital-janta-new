import React, { useState, useContext, useRef } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Lock, FileText, LogOut, ArrowLeft, Save, Upload } from 'lucide-react';

const ProfileSettings = () => {
  const { user, login, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    photo: user?.photo || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = { ...user, ...formData };
      login({ user: updatedUser, token: localStorage.getItem('token') });
      alert('Profile updated successfully!');
      navigate(-1);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
        setUploading(false);
        alert('Photo uploaded locally!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="special-page-container">
      <div className="special-page-card" style={{ maxWidth: '600px' }}>
        <button onClick={() => navigate(-1)} className="back-circle-btn"><ArrowLeft /></button>
        <h1 className="colorful-title">Profile Settings</h1>
        
        <div className="profile-photo-section">
          <div className="profile-avatar">
            {formData.photo ? (
              <img src={formData.photo} alt="Profile" />
            ) : (
              <User size={60} color="#a0aec0" />
            )}
            <div className="photo-upload-overlay" onClick={() => fileInputRef.current.click()}>
              <Camera size={24} color="white" />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <button 
            className="secondary-btn" 
            onClick={() => fileInputRef.current.click()} 
            style={{ marginTop: '1rem', width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload Profile Photo'}
          </button>
        </div>

        <form onSubmit={handleUpdate} className="settings-form">
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '700', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
              <User size={16} /> Full Name
            </label>
            <input 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="modern-input"
            />
          </div>
          
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '700', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
              <FileText size={16} /> Bio
            </label>
            <textarea 
              value={formData.bio} 
              onChange={(e) => setFormData({...formData, bio: e.target.value})} 
              placeholder="Tell us about yourself..."
              className="modern-input"
              style={{ height: '80px' }}
            ></textarea>
          </div>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <label style={{ fontWeight: '700', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
              <Lock size={16} /> Change Password
            </label>
            <input 
              type="password"
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              placeholder="Enter new password"
              className="modern-input"
            />
          </div>

          <div className="settings-actions" style={{ display: 'flex', gap: '15px' }}>
            <button type="submit" className="save-btn" disabled={loading} style={{ flex: 2 }}>
              <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => { logout(); navigate('/'); }} className="logout-full-btn" style={{ flex: 1 }}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
