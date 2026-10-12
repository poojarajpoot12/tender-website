import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState(''); // Locked email for OTP step
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const ADMIN_EMAIL = 'admin@tender.com';
  const ADMIN_PASSWORD = 'admin123';

  // Handle Form Submit (Login / Get OTP)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!isRegister && cleanEmail === ADMIN_EMAIL.toLowerCase() && cleanPassword === ADMIN_PASSWORD) {
      const adminUser = { name: 'Super Admin', email: ADMIN_EMAIL, role: 'admin' };
      localStorage.setItem('token', 'fixed-admin-token-2026');
      localStorage.setItem('user', JSON.stringify(adminUser));
      if (onLoginSuccess) onLoginSuccess(adminUser);
      setLoading(false);
      navigate('/admin');
      return;
    }

    if (isRegister && step === 1) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
        
        setRegisteredEmail(cleanEmail); // Save locked email for verification
        setSuccessMessage('OTP generated! Check backend terminal.');
        setStep(2);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    } else if (!isRegister) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed.');

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

  // Verify OTP Function
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const targetEmail = (registeredEmail || email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Please enter 6-digit OTP code.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: targetEmail, 
          otp: cleanOtp
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed.');

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
          <p>{step === 2 ? `OTP sent for ${registeredEmail || email}` : 'Enter credentials to proceed'}</p>
        </div>

        {errorMessage && <div className="auth-error-alert">⚠️ {errorMessage}</div>}
        {successMessage && <div className="auth-success-alert">✅ {successMessage}</div>}

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
              <label htmlFor="auth-otp">6-Digit Verification OTP</label>
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
              setSuccessMessage('');
            }}
          >
            {isRegister ? 'Already registered? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}