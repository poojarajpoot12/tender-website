import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header';
import Home from './components/Home';
import Footer from './components/Footer';
import Login from './components/Login';
import AccountDashboard from './components/AccountDashboard';
import TendersPage from './components/TendersPage';
import TenderDetailPage from './components/TenderDetailPage'; // Import Tender Detail Component
import AdminDashboard from './components/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import SectorPage from './components/SectorPage';

function App() {
  const [tenders, setTenders] = useState([]);
  const [user, setUser] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error loading stored user:', err);
      }
    }
  }, []);

  // Logout Handler function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setUser(null);
  };

  // Helper function to handle conditional redirection for /login
  const renderLoginRoute = () => {
    if (!user) {
      return <Login onLoginSuccess={(u) => setUser(u)} />;
    }
    if (user.role === 'admin' || user.email === 'admin@tender.com') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/account" replace />;
  };

  return (
    <BrowserRouter>
      {/* Dynamic Header */}
      <Header user={user} onLogout={handleLogout} />

      <main>
        <Routes>
          {/* Home Page Route */}
          <Route path="/" element={<Home tenders={tenders} setTenders={setTenders} />} />
          
          {/* Tenders List & Dynamic Single Tender Detail Route */}
          <Route path="/tenders" element={<TendersPage />} />
          <Route path="/tender/:id" element={<TenderDetailPage />} />

          <Route path="/sectors" element={<SectorPage />} />

          {/* Admin Protected Route */}
          <Route 
            path="/admin" 
            element={
              <AdminProtectedRoute user={user}>
                <AdminDashboard onLogout={handleLogout} />
              </AdminProtectedRoute>
            } 
          />

          {/* Login Route */}
          <Route 
            path="/login" 
            element={renderLoginRoute()} 
          />

          {/* User Account Dashboard Route */}
          <Route 
            path="/account" 
            element={
              user ? <AccountDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;