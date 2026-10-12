import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AuthorityPage.css';

// Dynamic API Base URL (Local aur Live dono ke liye)
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://tender-website-r77f.onrender.com';

const AuthorityPage = () => {
  // Data States
  const [heroStats, setHeroStats] = useState({});
  const [sectors, setSectors] = useState([]);
  const [states, setStates] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  
  // Filter States
  const [selectedSector, setSelectedSector] = useState('All sectors');
  const [selectedState, setSelectedState] = useState('All states');
  const [selectedCost, setSelectedCost] = useState('Any cost bracket');
  const [selectedSort, setSelectedSort] = useState('Sort: Awarded value');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination & Loading States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal / Card Click States
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [authorityDetails, setAuthorityDetails] = useState(null);

  // 1. Fetch Hero Stats, Sectors & States once on mount
  useEffect(() => {
    fetchMetaStats();
  }, []);

  // 2. Fetch Authorities whenever filters, search or page changes
  useEffect(() => {
    fetchAuthorities();
  }, [selectedSector, selectedState, selectedCost, selectedSort, searchQuery, page]);

  const fetchMetaStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/authorities/meta-stats`);
      if (res.data.success) {
        setHeroStats(res.data.heroStats);
        setSectors(res.data.sectors || []);
        setStates(res.data.states || []);
      }
    } catch (err) {
      console.error("Error loading meta stats", err);
    }
  };

  const fetchAuthorities = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        sector: selectedSector,
        state: selectedState,
        costBracket: selectedCost !== 'Any cost bracket' ? selectedCost : '',
        sort: selectedSort,
        search: searchQuery
      };
      const res = await axios.get(`${API_BASE_URL}/api/authorities`, { params });
      if (res.data.success) {
        setAuthorities(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error("Error loading authorities", err);
    } finally {
      setLoading(false);
    }
  };

  // Card Click Handler - Fetch details & open modal
  const handleCardClick = async (authority) => {
    setSelectedAuthority(authority);
    setModalLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/authorities/${authority._id}/details`);
      if (res.data.success) {
        setAuthorityDetails(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching authority details", err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedAuthority(null);
    setAuthorityDetails(null);
  };

  // Helper function to format numbers cleanly
  const formatNum = (num) => (num ? num.toLocaleString('en-IN') : '0');

  return (
    <div className="auth-page-container">
      {/* 1. HERO SECTION */}
      <section className="auth-hero">
        <span className="auth-badge">Procurement Intelligence</span>
        <h1 className="auth-title">Authority Intelligence</h1>
        <p className="auth-subtitle">Who buys. Who awards.</p>
        <p className="auth-description">
          Track <strong>{formatNum(heroStats.totalAuthorities || 9572)}</strong> tendering authorities across{' '}
          <strong>{formatNum(heroStats.totalTenderRecords || 17112832)}</strong> tender records. See who publishes, what they award, at what value — free.
        </p>

        {/* Hero KPI Grid */}
        <div className="auth-kpi-grid">
          <div className="kpi-card">
            <span className="kpi-value">{formatNum(heroStats.totalAuthorities || 9572)}</span>
            <span className="kpi-label">Authorities</span>
            <span className="kpi-subtext">every tendering authority</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-value">1.71 Cr</span>
            <span className="kpi-label">Tender records</span>
            <span className="kpi-subtext">tenders across 10 years</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-value">₹67.94 L Cr</span>
            <span className="kpi-label">Awarded value</span>
            <span className="kpi-subtext">value-guarded total</span>
          </div>
          <div className="kpi-card highlight">
            <span className="kpi-value">{formatNum(heroStats.totalLiveNow || 123402)}</span>
            <span className="kpi-label">Live now</span>
            <span className="kpi-subtext">open for bidding</span>
          </div>
        </div>
      </section>

      {/* 2. FILTER & CONTROLS SECTION */}
      <section className="auth-controls">
        <div className="search-bar-wrapper">
          <input
            type="text"
            className="auth-search-input"
            placeholder="Search tendering authority name or keyword..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>

        <div className="filter-dropdowns-row">
          {/* Sector Select */}
          <select 
            className="auth-select" 
            value={selectedSector} 
            onChange={(e) => { setSelectedSector(e.target.value); setPage(1); }}
          >
            <option value="All sectors">All sectors</option>
            {sectors.map((s, idx) => (
              <option key={idx} value={s.sector}>{s.sector} ({s.count})</option>
            ))}
          </select>

          {/* State Select */}
          <select 
            className="auth-select" 
            value={selectedState} 
            onChange={(e) => { setSelectedState(e.target.value); setPage(1); }}
          >
            <option value="All states">All states</option>
            {states.map((st, idx) => (
              <option key={idx} value={st.state}>{st.state} ({st.count})</option>
            ))}
          </select>

          {/* Cost Bracket */}
          <select 
            className="auth-select" 
            value={selectedCost} 
            onChange={(e) => { setSelectedCost(e.target.value); setPage(1); }}
          >
            <option value="Any cost bracket">Any cost bracket</option>
            <option value="₹500 Cr+">₹500 Cr+</option>
            <option value="₹100–500 Cr">₹100–500 Cr</option>
            <option value="₹25–100 Cr">₹25–100 Cr</option>
            <option value="₹10–25 Cr">₹10–25 Cr</option>
            <option value="₹5–10 Cr">₹5–10 Cr</option>
            <option value="₹2–5 Cr">₹2–5 Cr</option>
            <option value="₹50 L–2 Cr">₹50 L–2 Cr</option>
            <option value="< ₹50 L">&lt; ₹50 L</option>
          </select>

          {/* Sort Option */}
          <select 
            className="auth-select sort-select" 
            value={selectedSort} 
            onChange={(e) => setSelectedSort(e.target.value)}
          >
            <option value="Sort: Awarded value">Sort: Awarded value</option>
            <option value="Sort: Tenders published">Sort: Tenders published</option>
            <option value="Sort: Awarded">Sort: Awarded</option>
            <option value="Sort: Live now">Sort: Live now</option>
          </select>
        </div>
      </section>

      {/* 3. CARDS LISTING SECTION */}
      <section className="auth-list-section">
        <div className="list-header-info">
          <span><strong>{formatNum(totalCount)}</strong> authorities found</span>
          <span>Page {page} of {totalPages}</span>
        </div>

        {loading ? (
          <div className="auth-loading-state">Loading Authorities Intelligence Data...</div>
        ) : authorities.length === 0 ? (
          <div className="auth-empty-state">No authorities match the selected filters.</div>
        ) : (
          <div className="authority-cards-grid">
            {authorities.map((item) => (
              <div 
                key={item._id} 
                className="authority-card"
                onClick={() => handleCardClick(item)}
              >
                <div className="card-top-row">
                  <div className="card-title-group">
                    <span className="authority-avatar">{item.name?.substring(0, 2).toUpperCase()}</span>
                    <div>
                      <h3 className="authority-name">{item.name}</h3>
                      <div className="authority-tags">
                        <span className="tag sector-tag">{item.sector}</span>
                        {item.category && <span className="tag category-tag">{item.category}</span>}
                        {item.primaryState && <span className="tag state-tag">{item.primaryState}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Tenders</span>
                    <span className="stat-val">{formatNum(item.totalTenders)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Awarded</span>
                    <span className="stat-val">{formatNum(item.awardedTenders)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Live</span>
                    <span className="stat-val live-text">{formatNum(item.liveTenders)}</span>
                  </div>
                  <div className="stat-item highlight-item">
                    <span className="stat-label">Awarded value</span>
                    <span className="stat-val value-text">
                      ₹{(item.awardedValue / 100000000).toFixed(1)}k Cr
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <button 
            disabled={page === 1} 
            onClick={() => setPage((prev) => prev - 1)}
            className="page-btn"
          >
            ← Previous
          </button>

          <span className="page-indicator">
            Page {page} of {totalPages}
          </span>

          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage((prev) => prev + 1)}
            className="page-btn"
          >
            Next →
          </button>
        </div>
      </section>

      {/* 4. INTERACTIVE DETAIL OVERLAY MODAL */}
      {selectedAuthority && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeModal}>✕</button>
            
            <div className="modal-header">
              <span className="modal-badge">{selectedAuthority.sector}</span>
              <h2>{selectedAuthority.name}</h2>
              <p>Primary Region: <strong>{selectedAuthority.primaryState}</strong> | Type: <strong>{selectedAuthority.category || 'PSU'}</strong></p>
            </div>

            {modalLoading ? (
              <div className="modal-loading">Fetching real-time tenders & breakdown...</div>
            ) : (
              <div className="modal-body">
                {/* Stats Summary Bar */}
                <div className="modal-kpi-bar">
                  <div>
                    <span>Total Tenders</span>
                    <strong>{formatNum(selectedAuthority.totalTenders)}</strong>
                  </div>
                  <div>
                    <span>Awarded</span>
                    <strong>{formatNum(selectedAuthority.awardedTenders)}</strong>
                  </div>
                  <div>
                    <span>Live Bids</span>
                    <strong className="teal-text">{formatNum(selectedAuthority.liveTenders)}</strong>
                  </div>
                  <div>
                    <span>Total Value</span>
                    <strong className="teal-text">₹{(selectedAuthority.awardedValue / 100000000).toFixed(1)}k Cr</strong>
                  </div>
                </div>

                {/* Live Tenders List */}
                <div className="modal-section">
                  <h3>Active / Live Tenders ({authorityDetails?.liveTenders?.length || 0})</h3>
                  {authorityDetails?.liveTenders?.length > 0 ? (
                    <div className="live-tenders-list">
                      {authorityDetails.liveTenders.map((tender, i) => (
                        <div key={i} className="tender-item-row">
                          <div>
                            <p className="tender-item-title">{tender.title || 'Infrastructure / Supply Procurement Contract'}</p>
                            <span className="tender-sub-info">Ref ID: {tender.tenderId || 'N/A'} | Location: {tender.location || 'India'}</span>
                          </div>
                          <div className="tender-right">
                            <span className="tender-amt">₹{formatNum(tender.tenderValue || 0)}</span>
                            <button className="view-bid-btn">View Bid</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-tenders">No live tenders currently open for bidding under this authority.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityPage;