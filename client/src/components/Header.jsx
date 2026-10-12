import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Header.css';

export default function Header({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Close mobile menu when a navigation item is clicked
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Left Side: Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="logo-badge">IL</div>
          <span className="logo-text">
            InfraLens <span className="logo-subtext">TENDERS</span>
          </span>
        </Link>

        {/* Hamburger Toggle Button for Mobile */}
        <button
          className={`hamburger ${isOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* Right Side: Navigation Links */}
        <nav className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <Link to="/tenders" className="nav-item" onClick={closeMenu}>
            Tenders
          </Link>
          <Link to="/results" className="nav-item" onClick={closeMenu}>
            Results
          </Link>
          <Link to="/bidders" className="nav-item" onClick={closeMenu}>
            Companies
          </Link>
          <Link to="/authorities" className="nav-item" onClick={closeMenu}>
            Authorities
          </Link>
          <Link to="/sectors" className="nav-item" onClick={closeMenu}>
            Sectors
          </Link>
          <Link to="/departments" className="nav-item" onClick={closeMenu}>
            Departments
          </Link>
          <Link to="/alerts" className="nav-item nav-alert" onClick={closeMenu}>
            Alerts
          </Link>

          {/* Conditional Button: "My Account" when logged in, "Login" when logged out */}
          {user ? (
            <Link to="/account" className="btn-login" onClick={closeMenu}>
              My Account
            </Link>
          ) : (
            <Link to="/login" className="btn-login" onClick={closeMenu}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}