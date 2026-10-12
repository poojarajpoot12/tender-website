import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBulkUpload from './AdminBulkUpload';
import '../css/AdminDashboard.css';

// Dynamic API Base URL (Local aur Live dono ke liye)
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://tender-website-r77f.onrender.com';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bulk-upload' | 'manage'
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTender, setEditingTender] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer state

  const navigate = useNavigate(); // Navigation hook for Home/Logout

  // Backend se Tenders Fetch karein
  const fetchTenders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tenders`);
      const result = await res.json();
      if (result.success) {
        setTenders(result.data || []);
      } else {
        setError('Data fetch karne me dikkat aayi.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Backend connection error! Server check karein.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  // Search Filter
  const filteredTenders = tenders.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(term) ||
      item.tenderId?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      item.location?.state?.toLowerCase().includes(term)
    );
  });

  // Delete Tender
  const handleDelete = async (mongoId) => {
    if (!window.confirm('Kya aap is tender ko delete karna chahte hain?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tenders/${mongoId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setTenders((prev) => prev.filter((item) => item._id !== mongoId));
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (err) {
      alert('Delete request me error aaya!');
    }
  };

  // Edit Modal Open
  const handleEditClick = (item) => {
    const formattedDate = item.dates?.closingDate
      ? new Date(item.dates.closingDate).toISOString().split('T')[0]
      : '';

    setEditingTender({
      _id: item._id,
      tenderId: item.tenderId,
      title: item.title,
      category: item.category || '',
      state: item.location?.state || '',
      deadline: formattedDate,
      status: item.status || 'ACTIVE',
    });
  };

  // Edit Form Submit
  const handleSaveEdit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tenders/${editingTender._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTender),
      });

      const data = await res.json();

      if (data.success) {
        setEditingTender(null);
        fetchTenders(); // Data refresh
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      alert('Update request me error aaya!');
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Mobile me tab click krte hi sidebar close ho jaye
  };

  return (
    <div className="admin-dashboard-container">
      {/* Mobile Top Header (Sirf Mobile ke liye) */}
      <div className="mobile-top-bar">
        <button className="hamburger-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          ☰
        </button>
        <div className="mobile-brand">
          <span>🛡️</span> <h2>Admin Portal</h2>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">🛡️</div>
          <div>
            <h2>Admin Portal</h2>
            <p>Tender Control Center</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button
            className={`menu-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleNavClick('overview')}
          >
            <span className="icon">📊</span> Overview & Stats
          </button>
          <button
            className={`menu-btn ${activeTab === 'bulk-upload' ? 'active' : ''}`}
            onClick={() => handleNavClick('bulk-upload')}
          >
            <span className="icon">📁</span> Bulk Data Ingestion
          </button>
          <button
            className={`menu-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => handleNavClick('manage')}
          >
            <span className="icon">📋</span> Manage All Tenders
            <span className="badge">{tenders.length}</span>
          </button>
        </nav>

        {/* Sidebar Footer Navigation (Home & Logout) */}
        <div className="sidebar-footer">
          <hr className="sidebar-divider" />
          <button className="menu-btn nav-link-btn" onClick={() => navigate('/')}>
            <span className="icon">🏠</span> Home Page
          </button>
          <button className="menu-btn nav-link-btn logout-btn" onClick={() => navigate('/login')}>
            <span className="icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="tab-content fade-in">
            <div className="dashboard-header">
              <h1>Welcome Back, Admin! 👋</h1>
              <p>Real-time database overview & metrics.</p>
            </div>

            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-icon">📑</div>
                <div className="stat-info">
                  <h3>{tenders.length}</h3>
                  <p>Total Tenders Active</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon">🏗️</div>
                <div className="stat-info">
                  <h3>{new Set(tenders.map((t) => t.category).filter(Boolean)).size}</h3>
                  <p>Active Sectors</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-info">
                  <h3>100%</h3>
                  <p>Database Health</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BULK UPLOAD TAB */}
        {activeTab === 'bulk-upload' && (
          <div className="tab-content fade-in">
            <AdminBulkUpload />
          </div>
        )}

        {/* MANAGE TENDERS TAB */}
        {activeTab === 'manage' && (
          <div className="tab-content fade-in">
            <div className="dashboard-header flex-header">
              <div>
                <h1>Manage All Tenders</h1>
                <p>Real-time database records, deadline editing & search.</p>
              </div>

              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search Tender ID, Title, State..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Tender ID</th>
                    <th>Title</th>
                    <th>Sector</th>
                    <th>State</th>
                    <th>Closing Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="empty-row">⏳ Database se tenders load ho rahe hain...</td>
                    </tr>
                  ) : filteredTenders.length > 0 ? (
                    filteredTenders.map((item) => (
                      <tr key={item._id}>
                        <td><span className="id-badge">{item.tenderId}</span></td>
                        <td className="title-cell">{item.title}</td>
                        <td><span className="sector-tag">{item.category || 'N/A'}</span></td>
                        <td>{item.location?.state || 'N/A'}</td>
                        <td>
                          <span className="deadline-tag">
                            📅 {item.dates?.closingDate ? new Date(item.dates.closingDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="edit-btn" onClick={() => handleEditClick(item)}>✏️ Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(item._id)}>🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-row">🚫 Koi tender nahi mila.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* EDIT MODAL */}
      {editingTender && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>✏️ Edit Deadline & Details ({editingTender.tenderId})</h2>
              <button className="close-btn" onClick={() => setEditingTender(null)}>✖</button>
            </div>
            <form onSubmit={handleSaveEdit} className="edit-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingTender.title}
                  onChange={(e) => setEditingTender({ ...editingTender, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sector / Category</label>
                  <input
                    type="text"
                    value={editingTender.category}
                    onChange={(e) => setEditingTender({ ...editingTender, category: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={editingTender.state}
                    onChange={(e) => setEditingTender({ ...editingTender, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Closing Date (Deadline)</label>
                <input
                  type="date"
                  value={editingTender.deadline}
                  onChange={(e) => setEditingTender({ ...editingTender, deadline: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setEditingTender(null)}>Cancel</button>
                <button type="submit" className="save-btn">💾 Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}