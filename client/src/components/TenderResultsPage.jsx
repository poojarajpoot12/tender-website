// src/pages/TenderResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Building2, Download, Bookmark, Eye, Clock, ShieldCheck } from 'lucide-react';
import '../css/TenderResultsPage.css';

// Dynamic API Base URL (Local aur Live dono ke liye)
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://tender-website-r77f.onrender.com';

const TenderResultsPage = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // URL query parameters read karein (jaise search query, sector, state)
  const searchParams = new URLSearchParams(location.search);
  const queryKeyword = searchParams.get('q') || '';
  const selectedSector = searchParams.get('sector') || '';
  const selectedState = searchParams.get('state') || '';

  useEffect(() => {
    const fetchFilteredTenders = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (queryKeyword) queryParams.append('search', queryKeyword);
        if (selectedSector && selectedSector !== 'All') queryParams.append('sector', selectedSector);
        if (selectedState && selectedState !== 'All') queryParams.append('state', selectedState);

        const res = await fetch(`${API_BASE_URL}/api/tenders/search?${queryParams.toString()}`);
        const result = await res.json();

        if (res.ok && result.success) {
          const formattedTenders = (result.data || []).map((item) => ({
            id: item.tenderId || item._id,
            title: item.title || 'Untitled Tender',
            authority: item.authorityName || item.department || 'Government Authority',
            sector: item.sector || item.category || 'General',
            location: `${item.location?.city || ''}, ${item.location?.state || 'India'}`.replace(/^, /, ''),
            value: item.financials?.estimatedCost ? `₹${(item.financials.estimatedCost / 10000000).toFixed(2)} Cr` : 'As per NIT',
            emd: item.financials?.emdAmount ? `₹${item.financials.emdAmount.toLocaleString('en-IN')}` : 'N/A',
            publishDate: item.dates?.publishedDate ? new Date(item.dates.publishedDate).toLocaleDateString() : 'Recent',
            dueDate: item.dates?.closingDate ? new Date(item.dates.closingDate).toLocaleDateString() : 'N/A',
            daysLeft: item.dates?.closingDate ? Math.max(0, Math.ceil((new Date(item.dates.closingDate) - new Date()) / (1000 * 60 * 60 * 24))) : 15,
            status: item.status || 'Live'
          }));

          setTenders(formattedTenders);
          setTotalCount(formattedTenders.length);
        } else {
          setTenders([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setTenders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredTenders();
  }, [location.search]);

  return (
    <div className="tender-results-layout">
      {/* 1. TOP BAR */}
      <header className="results-header">
        <div className="header-content">
          <h1>Tender Search Results</h1>
          <p>Explore <strong>{totalCount} active procurement notices</strong> matching your criteria</p>
        </div>
        <div className="search-summary-pills">
          <span className="pill active">All Live Tenders</span>
          <span className="pill">High Value (&gt; ₹10 Cr)</span>
          <span className="pill">Closing in 7 Days</span>
          <span className="pill">MSME Exempted</span>
        </div>
      </header>

      <div className="results-main-container">
        {/* 2. LEFT SIDEBAR FILTERS */}
        <aside className="filters-sidebar">
          <div className="sidebar-header">
            <h3><Filter size={18} /> Filter Results</h3>
            <button className="reset-btn" onClick={() => navigate('/tenders')}>Reset All</button>
          </div>

          {/* Sector Filter */}
          <div className="filter-group">
            <label className="filter-label">Sector / Domain</label>
            <select 
              className="filter-select"
              value={selectedSector}
              onChange={(e) => {
                const val = e.target.value;
                const params = new URLSearchParams(location.search);
                if (val === 'All Sectors') params.delete('sector');
                else params.set('sector', val);
                navigate(`/tenders?${params.toString()}`);
              }}
            >
              <option>All Sectors</option>
              <option>Roads & Highways</option>
              <option>Civil & Building</option>
              <option>IT & Telecom</option>
              <option>Power & Energy</option>
              <option>Water & Sanitation</option>
            </select>
          </div>

          {/* State Filter */}
          <div className="filter-group">
            <label className="filter-label">State / Region</label>
            <select 
              className="filter-select"
              value={selectedState}
              onChange={(e) => {
                const val = e.target.value;
                const params = new URLSearchParams(location.search);
                if (val === 'All States') params.delete('state');
                else params.set('state', val);
                navigate(`/tenders?${params.toString()}`);
              }}
            >
              <option>All States</option>
              <option>Maharashtra</option>
              <option>Delhi NCR</option>
              <option>Uttar Pradesh</option>
              <option>Gujarat</option>
              <option>Karnataka</option>
            </select>
          </div>

          {/* Tender Value Filter */}
          <div className="filter-group">
            <label className="filter-label">Tender Value Bracket</label>
            <div className="checkbox-list">
              <label><input type="checkbox" defaultChecked /> Above ₹100 Cr</label>
              <label><input type="checkbox" defaultChecked /> ₹25 Cr – ₹100 Cr</label>
              <label><input type="checkbox" defaultChecked /> ₹5 Cr – ₹25 Cr</label>
              <label><input type="checkbox" defaultChecked /> Below ₹5 Cr</label>
            </div>
          </div>

          {/* Authority Type */}
          <div className="filter-group">
            <label className="filter-label">Buyer Category</label>
            <div className="checkbox-list">
              <label><input type="checkbox" defaultChecked /> Central PSUs</label>
              <label><input type="checkbox" defaultChecked /> State PWDs</label>
              <label><input type="checkbox" defaultChecked /> Municipal Bodies</label>
              <label><input type="checkbox" defaultChecked /> Railways & Metro</label>
            </div>
          </div>
        </aside>

        {/* 3. CENTER FEED (CARDS) */}
        <main className="results-feed">
          {/* Controls Bar */}
          <div className="feed-controls">
            <span className="results-count">Showing <strong>{tenders.length}</strong> Tenders</span>
            <div className="sort-wrapper">
              <span>Sort By:</span>
              <select className="sort-select">
                <option>Due Date (Soonest First)</option>
                <option>Tender Value (High to Low)</option>
                <option>Newly Published</option>
              </select>
            </div>
          </div>

          {/* Tender Cards List */}
          <div className="tender-cards-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Loading matching tenders...</div>
            ) : tenders.length > 0 ? (
              tenders.map((tender) => (
                <div key={tender.id} className="tender-card">
                  <div className="card-header-row">
                    <div className="authority-info">
                      <Building2 size={18} className="icon-teal" />
                      <span className="authority-name">{tender.authority}</span>
                    </div>
                    <span className={`status-badge ${tender.daysLeft <= 7 ? 'urgent' : 'live'}`}>
                      <Clock size={12} /> {tender.daysLeft} Days Left
                    </span>
                  </div>

                  <h2 className="tender-title">{tender.title}</h2>

                  <div className="tender-meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">Estimated Value</span>
                      <span className="meta-value value-highlight">{tender.value}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">EMD Amount</span>
                      <span className="meta-value">{tender.emd}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Location</span>
                      <span className="meta-value flex-icon"><MapPin size={14} /> {tender.location}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Submission Due</span>
                      <span className="meta-value flex-icon"><Calendar size={14} /> {tender.dueDate}</span>
                    </div>
                  </div>

                  <div className="card-footer-row">
                    <div className="tags-group">
                      <span className="tag sector-tag">{tender.sector}</span>
                      <span className="tag id-tag">Ref: {tender.id}</span>
                    </div>
                    <div className="card-actions">
                      <button className="icon-btn" title="Save Tender"><Bookmark size={16} /></button>
                      <button className="icon-btn" title="Download Document"><Download size={16} /></button>
                      <button className="btn-primary flex-icon" onClick={() => navigate(`/tender/${tender.id}`)}>
                        <Eye size={16} /> View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                No active tenders found matching your criteria. Try resetting filters.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TenderResultsPage;