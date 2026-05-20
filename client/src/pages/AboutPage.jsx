import React from 'react';
import { ArrowLeft, Mail, ShieldCheck, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();
  return (
    <div className="special-page-container">
      <div className="special-page-card">
        <button onClick={() => navigate(-1)} className="back-circle-btn"><ArrowLeft /></button>
        <h1 className="colorful-title">About Digital-Janta</h1>
        <div className="content-section">
          <p>Digital-Janta is a modern school management platform designed specifically for <strong>Janta +2 High School</strong>. It bridges the gap between students, teachers, and the principal through seamless digital communication.</p>
          
          <div className="feature-grid">
            <div className="feature-item">
              <ShieldCheck className="feature-icon" color="#4299e1" />
              <h3>Secure Login</h3>
              <p>Role-based access for Students, Teachers, and Principal.</p>
            </div>
            <div className="feature-item">
              <Mail className="feature-icon" color="#48bb78" />
              <h3>Instant Messaging</h3>
              <p>Share notes, homework, and reports instantly.</p>
            </div>
          </div>

          <div className="owner-section">
            <h3>Created with <Heart color="#f56565" fill="#f56565" size={16} /> by</h3>
            <div className="owner-badge">
              <span className="owner-name">DILSHAN</span>
              <span className="owner-role">Owner & Lead Developer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
