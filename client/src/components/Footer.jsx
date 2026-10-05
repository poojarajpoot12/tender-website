import React from 'react';
import '../css/Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Portal Branding & Overview */}
        <div className="footer-brand">
          <Link to="/" className="navbar-logo">
          <div className="logo-badge">IL</div>
          <span className="logo-text">
            InfraLens <span className="logo-subtext">TENDERS</span>
          </span>
        </Link>
          <p className="footer-description">
            India's unified online portal for government & private procurement notices, RFPs, e-Auctions, and real-time live tender tracking.
          </p>
          <div className="social-links">
            <a href="#linkedin" title="LinkedIn">💼</a>
            <a href="#twitter" title="Twitter">🌐</a>
            <a href="#facebook" title="Facebook">📘</a>
          </div>
        </div>

        {/* Tenders by Category / Sector */}
        <div className="footer-links-group">
          <h4>Tenders by Sector</h4>
          <ul>
            <li><a href="#civil-tenders">Civil & Construction</a></li>
            <li><a href="#it-software">IT & Software Solutions</a></li>
            <li><a href="#electrical-tenders">Electrical & Power</a></li>
            <li><a href="#healthcare-tenders">Healthcare & Medical</a></li>
            <li><a href="#defense-tenders">Defense & Security</a></li>
          </ul>
        </div>

        {/* Quick Search & Classification */}
        <div className="footer-links-group">
          <h4>Browse Procurements</h4>
          <ul>
            <li><a href="#latest-tenders">Latest Live Tenders</a></li>
            <li><a href="#expiring-tenders">Expiring Soon</a></li>
            <li><a href="#state-tenders">State-wise Tenders</a></li>
            <li><a href="#authority-tenders">Tenders by Authority</a></li>
            <li><a href="#archive">Archive / Results</a></li>
          </ul>
        </div>

        {/* Support & Contractor Services */}
        <div className="footer-links-group">
          <h4>Bidders & Support</h4>
          <ul className="contact-list">
            <li><a href="#register">Contractor Registration</a></li>
            <li><a href="#publish">Publish Tender Notice</a></li>
            <li><a href="#helpdesk">24x7 Tender Helpdesk</a></li>
            <li>✉️ support@etenderportal.com</li>
            <li>📍 New Delhi, India</li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} eTender Portal. All rights reserved.</p>
        <div className="bottom-policies">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#disclaimer">Disclaimer & Legal Notice</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;