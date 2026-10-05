import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Email/Pass, Step 2: OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Predefined Fixed Admin Credentials
  const ADMIN_EMAIL = 'admin@tender.com';
  const ADMIN_PASSWORD = 'admin123';

  // Send OTP or Handle Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // ========================================================
    // 1. PREDEFINED ADMIN LOGIN CHECK
    // ========================================================
    if (!isRegister && cleanEmail === ADMIN_EMAIL.toLowerCase() && cleanPassword === ADMIN_PASSWORD) {
      const adminUser = {
        name: 'Super Admin',
        email: ADMIN_EMAIL,
        role: 'admin'
      };

      localStorage.setItem('token', 'fixed-admin-token-2026');
      localStorage.setItem('user', JSON.stringify(adminUser));
      
      if (onLoginSuccess) onLoginSuccess(adminUser);

      setLoading(false);
      navigate('/admin');
      return;
    }

    // ========================================================
    // 2. NORMAL USER REGISTER & LOGIN FLOW
    // ========================================================
    if (isRegister && step === 1) {
      try {
        const res = await fetch('http://localhost:5000/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'OTP send karne me viphalta hui');
        }
        
        setStep(2); // Move to OTP Screen
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    } else if (!isRegister) {
      // Direct User Login Logic
      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Login viphal raha. Kripya credentials check karein.');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onLoginSuccess) onLoginSuccess(data.user);
        
        if (data.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/account');
        }
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Verify OTP Action
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim(); // Strictly string conversion to avoid 400 bad request

    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Kripya 6-digit OTP enter karein.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanEmail, 
          otp: cleanOtp 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'OTP verification fail ho gaya');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (onLoginSuccess) onLoginSuccess(data.user);

      navigate('/account');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isRegister ? (step === 1 ? 'Create Account' : 'Enter Verification OTP') : 'Welcome Back'}</h2>
          <p>{step === 2 ? 'Check your VS Code Backend Terminal for the 6-digit code' : 'Enter credentials to proceed'}</p>
        </div>

        {errorMessage && <div className="auth-error-alert">⚠️ {errorMessage}</div>}

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="auth-email">Email Address</label>
              <input 
                id="auth-email"
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="input-group">
              <label htmlFor="auth-password">Password</label>
              <input 
                id="auth-password"
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Processing...' : isRegister ? 'Get Verification OTP' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div className="input-group">
              <label htmlFor="auth-otp">Terminal Verification OTP</label>
              <input 
                id="auth-otp"
                type="text" 
                placeholder="123456" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                maxLength={6} 
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Complete Registration'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <button 
            type="button"
            className="auth-toggle-link" 
            onClick={() => { 
              setIsRegister(!isRegister); 
              setStep(1); 
              setErrorMessage(''); 
            }}
          >
            {isRegister ? 'Already registered? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}