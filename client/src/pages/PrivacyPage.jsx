import React from 'react';
import { ArrowLeft, Lock, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPage = () => {
  const navigate = useNavigate();
  return (
    <div className="special-page-container">
      <div className="special-page-card">
        <button onClick={() => navigate(-1)} className="back-circle-btn"><ArrowLeft /></button>
        <h1 className="colorful-title">Privacy & Terms</h1>
        <div className="content-section" style={{ textAlign: 'left' }}>
          <h3><Lock size={20} /> Data Security</h3>
          <p>We use industry-standard encryption to protect your passwords and personal data. Your messages and attendance records are stored securely in our private cloud database.</p>
          
          <h3><Eye size={20} /> Privacy Policy</h3>
          <p>Digital-Janta respects your privacy. We do not share your data with third parties. All data is used strictly for school management purposes.</p>

          <h3><FileText size={20} /> Terms of Use</h3>
          <p>By using this platform, you agree to follow school guidelines. Misuse of the messaging system or attendance features is strictly prohibited.</p>

          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f7fafc', borderRadius: '0.5rem' }}>
            <p><strong>Owner:</strong> DILSHAN</p>
            <p><strong>Contact:</strong> support@digitaljanta.com</p>
            <p style={{ fontSize: '0.8rem', color: '#a0aec0' }}>&copy; 2026 Digital-Janta. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
