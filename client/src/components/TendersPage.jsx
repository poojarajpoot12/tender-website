import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import '../css/TendersPage.css';

// Dynamic API Base URL (Local aur Live dono ke liye)
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://tender-website-r77f.onrender.com';

const QUICK_TAGS = [
  'NHAI roads',
  'hospital > 20 Cr',
  '2026_NHAI_281721_1',
  'water supply',
  'PHED Rajasthan',
  'JJM',
  'Roads > 5 Cr'
];

const VALUE_BUCKETS = [
  { label: '< ₹50 L', value: '<50L' },
  { label: '₹50 L–2 Cr', value: '50L-2Cr' },
  { label: '₹2–5 Cr', value: '2Cr-5Cr' },
  { label: '₹5–10 Cr', value: '5Cr-10Cr' },
  { label: '₹10–25 Cr', value: '10Cr-25Cr' },
  { label: '₹25–100 Cr', value: '25Cr-100Cr' },
  { label: '₹100–500 Cr', value: '100Cr-500Cr' },
  { label: '₹500 Cr+', value: '500Cr+' },
];

export default function TendersPage({ tenders: propTenders = [] }) {
  const [searchParams] = useSearchParams();

  // Active Display Tenders & API States
  const [tendersList, setTendersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Saved Bids State (Persisted in localStorage)
  const [savedBids, setSavedBids] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('savedBids')) || [];
    } catch (e) {
      return [];
    }
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [stage, setStage] = useState('LIVE');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedValueBucket, setSelectedValueBucket] = useState('');
  const [selectedScheme, setSelectedScheme] = useState('All');

  // URL query params parse
  const queryQ = searchParams.get('q') || '';
  const querySector = searchParams.get('sector') || 'All';
  const queryState = searchParams.get('state') || 'All';

  // Synchronize URL query params to Local State
  useEffect(() => {
    setSearchTerm(queryQ);
    setSelectedSector(querySector);
    setSelectedState(queryState);
  }, [queryQ, querySector, queryState]);

  // Sync savedBids across components / storage events
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const currentSaved = JSON.parse(localStorage.getItem('savedBids')) || [];
        setSavedBids(currentSaved);
      } catch (err) {
        console.error('Error syncing savedBids', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch Tenders from Backend API
  const fetchTenders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.append('q', searchTerm);
      if (stage) query.append('stage', stage);
      if (selectedSector !== 'All') query.append('category', selectedSector);
      if (selectedState !== 'All') query.append('state', selectedState);
      if (selectedType !== 'All') query.append('tenderType', selectedType);
      if (selectedScheme !== 'All') query.append('scheme', selectedScheme);
      if (selectedValueBucket) query.append('valueBucket', selectedValueBucket);

      const response = await fetch(`${API_BASE_URL}/api/tenders/search?${query.toString()}`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const formatted = result.data.map((item) => ({
          id: item.tenderId || item._id,
          refNumber: item.refNumber || item.tenderId,
          portalSource: item.portalSource || 'CPSE',
          title: item.title,
          authority: item.authorityName || item.department || 'Government Authority',
          sector: item.sector || item.category || 'Civil / General',
          state: item.location?.state || 'Delhi',
          location: item.location?.state || 'Delhi',
          budget: item.financials?.estimatedCost 
            ? item.financials.estimatedCost >= 10000000 
              ? `₹${(item.financials.estimatedCost / 10000000).toFixed(2)} Cr`
              : `₹${item.financials.estimatedCost.toLocaleString('en-IN')}`
            : '₹50,00,000',
          deadline: item.dates?.closingDate 
            ? new Date(item.dates.closingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
            : 'N/A',
          status: item.stage || item.status || 'LIVE'
        }));
        setTendersList(formatted);
      } else {
        setTendersList(propTenders);
      }
    } catch (error) {
      console.error('Error fetching backend tenders:', error);
      setTendersList(propTenders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTenders();
  }, [stage, selectedSector, selectedState, selectedType, selectedValueBucket, selectedScheme]);

  // Handle Save / Unsave Tender (Heart Icon Click)
  const toggleSaveBid = (e, tender) => {
    e.preventDefault();
    e.stopPropagation();

    let updatedBids;
    const isAlreadySaved = savedBids.some((item) => (item.id || item._id) === (tender.id || tender._id));

    if (isAlreadySaved) {
      updatedBids = savedBids.filter((item) => (item.id || item._id) !== (tender.id || tender._id));
    } else {
      updatedBids = [...savedBids, tender];
    }

    setSavedBids(updatedBids);
    localStorage.setItem('savedBids', JSON.stringify(updatedBids));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTenders();
  };

  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    fetchTenders();
  };

  const handleReset = () => {
    setSearchTerm('');
    setStage('LIVE');
    setSelectedSector('All');
    setSelectedState('All');
    setSelectedType('All');
    setSelectedValueBucket('');
    setSelectedScheme('All');
  };

  return (
    <div className="tenders-page-wrapper">
      
      {/* ================= HERO HEADER BANNER ================= */}
      <div className="tenders-hero-banner">
        <div className="hero-content-inner">
          <span className="live-status-pill">
            <span className="pulsing-dot"></span>
            Refreshed 19h ago · 110+ portals · 1,71,33,535 indexed
          </span>
          
          <h1>Live Government Tenders & Bids</h1>
          <p>Explore active tenders, state-wise notices, and sectoral procurement opportunities.</p>

          {/* Large Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="unified-banner-search">
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="search-stage-dropdown"
            >
              <option value="LIVE">Live Tenders</option>
              <option value="CLOSED">Closed Tenders</option>
              <option value="RESULTS">Results & Past Stages</option>
              <option value="GEM">GeM Bids</option>
            </select>

            <input
              type="text"
              placeholder="Search Keyword, Tender ID, Authority, Road, Hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-keyword-input"
            />

            <button type="submit" className="search-submit-btn">
              🔍 Search
            </button>
          </form>

          {/* Quick Suggestion Tags */}
          <div className="hero-quick-tags">
            <span>Try:</span>
            {QUICK_TAGS.map((tag, idx) => (
              <button key={idx} onClick={() => handleTagClick(tag)} className="tag-chip">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="tenders-page-container">
        
        {/* ================= TOP HORIZONTAL FILTERS BAR ================= */}
        <div className="horizontal-filter-bar">
          <div className="horizontal-filter-header">
            <h3>⚡ Refine Filters</h3>
            <button onClick={handleReset} className="reset-link">Reset All</button>
          </div>

          <div className="horizontal-filter-controls">
            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="top-filter-select"
            >
              <option value="All">All States / Regions</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Jammu & Kashmir">Jammu & Kashmir</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Delhi">Delhi NCR</option>
            </select>

            {/* Sector / Department */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="top-filter-select"
            >
              <option value="All">All Sectors / Depts</option>
              <option value="Civic">Civic</option>
              <option value="Railways">Railways</option>
              <option value="Urban Development & Housing">Urban Development</option>
              <option value="Roads & Highways">Roads & Highways</option>
              <option value="Water Resources & Irrigation">Water & Irrigation</option>
              <option value="Defence & Paramilitary">Defence</option>
              <option value="Power & Energy">Power & Energy</option>
              <option value="Health & Medical">Health & Medical</option>
            </select>

            {/* Contract Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="top-filter-select"
            >
              <option value="All">All Contract Types</option>
              <option value="Works">Works</option>
              <option value="Supply">Supply</option>
              <option value="Services">Services</option>
              <option value="Consulting">Consulting</option>
              <option value="Leasing">Leasing</option>
            </select>

            {/* Schemes Filter */}
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="top-filter-select"
            >
              <option value="All">All Govt Schemes</option>
              <option value="Jal Jeevan Mission">Jal Jeevan Mission</option>
              <option value="Smart City">Smart City</option>
              <option value="AMRUT">AMRUT</option>
              <option value="PMGSY">PMGSY</option>
              <option value="MGNREGA">MGNREGA</option>
            </select>
          </div>

          {/* Tender Value Quick Buckets */}
          <div className="horizontal-value-buckets">
            <span className="buckets-label">Value:</span>
            <div className="buckets-row">
              {VALUE_BUCKETS.map((bucket) => (
                <button
                  key={bucket.value}
                  onClick={() => setSelectedValueBucket(selectedValueBucket === bucket.value ? '' : bucket.value)}
                  className={`bucket-btn ${selectedValueBucket === bucket.value ? 'active' : ''}`}
                >
                  {bucket.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= FULL WIDTH TENDERS FEED ================= */}
        <main className="tenders-fullwidth-feed">
          
          {/* Results Summary Bar */}
          <div className="results-summary">
            Showing <strong>{tendersList.length}</strong> active tenders
          </div>

          {/* Grid / Feed Content */}
          {loading ? (
            <div className="loading-state-card">
              <h3>Loading Tenders from Database...</h3>
            </div>
          ) : tendersList.length > 0 ? (
            <div className="tenders-grid">
              {tendersList.map((tender) => {
                const tenderId = tender.id || tender._id;
                const isSaved = savedBids.some((item) => (item.id || item._id) === tenderId);

                return (
                  <div key={tenderId} className="modern-tender-card">
                    <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="tender-id-badge">{tender.portalSource} · {tender.refNumber}</span>
                        <span className="sector-pill-tag" style={{ marginLeft: '8px' }}>{tender.sector}</span>
                      </div>

                      {/* Heart Icon Button for Saving Bid */}
                      <button
                        type="button"
                        onClick={(e) => toggleSaveBid(e, tender)}
                        title={isSaved ? 'Remove from saved bids' : 'Save this bid'}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.4rem',
                          color: isSaved ? '#EF4444' : '#9CA3AF',
                          transition: 'transform 0.15s ease, color 0.15s ease',
                          padding: '0 4px',
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        {isSaved ? '♥' : '♡'}
                      </button>
                    </div>

                    <h3 className="tender-main-title">{tender.title}</h3>
                    <p className="auth-name">🏛️ {tender.authority}</p>

                    <div className="meta-info">
                      <span>📍 Location: {tender.state}</span>
                      <span>💰 Value: {tender.budget}</span>
                      <span>⏳ Closes: {tender.deadline}</span>
                    </div>

                    <Link to={`/tender/${tenderId}`} className="apply-btn">
                      View Details & Apply →
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-tenders-card">
              <h3>No Tenders Found</h3>
              <p>Try resetting filters or searching with a different keyword.</p>
              <button onClick={handleReset} className="reset-btn">
                Reset Filters
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}