import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Home.css';
import SectorSlider from './SectorSlider';

export default function Home({ tenders = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedState, setSelectedState] = useState('All');

  const navigate = useNavigate();

  // Redirect to /tenders with query parameters
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const queryParams = new URLSearchParams();

    if (searchTerm.trim()) queryParams.append('q', searchTerm.trim());
    if (selectedSector && selectedSector !== 'All') queryParams.append('sector', selectedSector);
    if (selectedState && selectedState !== 'All') queryParams.append('state', selectedState);

    navigate(`/tenders?${queryParams.toString()}`);
  };

  // State to toggle Sectors grid view (Show 2 rows initially)
  const [showAllSectors, setShowAllSectors] = useState(false);

  // Dynamic Banner State
  const [currentSectorIndex, setCurrentSectorIndex] = useState(0);
  const [tendersCount, setTendersCount] = useState(16500000);
  const [gemBidsCount, setGemBidsCount] = useState(3200000);

  // Map Hover Tooltip State
  const [hoveredStateData, setHoveredStateData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Real State-wise Tender Analytics Data
  const stateTenderData = {
    "IN-DL": { name: "Delhi NCR", count: 12450, totalValue: "₹18,500 Cr", topSector: "Infrastructure" },
    "IN-MH": { name: "Maharashtra", count: 45200, totalValue: "₹85,400 Cr", topSector: "Roads & Highways" },
    "IN-KA": { name: "Karnataka", count: 28900, totalValue: "₹42,100 Cr", topSector: "IT & Smart Cities" },
    "IN-UP": { name: "Uttar Pradesh", count: 38400, totalValue: "₹64,200 Cr", topSector: "Water & Civil" },
    "IN-GJ": { name: "Gujarat", count: 31500, totalValue: "₹52,800 Cr", topSector: "Power & Solar" },
    "IN-TN": { name: "Tamil Nadu", count: 24100, totalValue: "₹38,900 Cr", topSector: "Manufacturing" },
    "IN-RJ": { name: "Rajasthan", count: 19800, totalValue: "₹29,400 Cr", topSector: "Solar & Energy" },
    "IN-WB": { name: "West Bengal", count: 16700, totalValue: "₹22,100 Cr", topSector: "Civic & Works" },
    "IN-MP": { name: "Madhya Pradesh", count: 21300, totalValue: "₹31,600 Cr", topSector: "Irrigation" }
  };

  // Dynamic Sectors for Hero Banner Rotation
  const bannerSectors = [
    {
      name: 'Roads & Highways',
      icon: '🛣️',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      tagline: 'NHAI, CPWD & State Highway Tenders',
      description: 'Track real-time tenders across NIC eProcure, CPWD, and all regional portals.'
    },
    {
      name: 'Water & Irrigation',
      icon: '💧',
      image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Water Supply & Treatment Projects',
      description: 'Lift irrigation schemes, canal developments, and rural WSS notices.'
    },
    {
      name: 'Buildings & Civil',
      icon: '🏗️',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Commercial & Civic Infrastructure',
      description: 'Housing developments, educational hubs, and institutional building contracts.'
    },
    {
      name: 'Power & Electrical',
      icon: '⚡',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Grid Setup & Smart Metering Bids',
      description: 'Thermal energy, solar installations, transmission lines, and power utilities.'
    }
  ];

  // Auto Rotation Timer for Banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSectorIndex((prev) => (prev + 1) % bannerSectors.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [bannerSectors.length]);

  // Animated Counter Effect
  useEffect(() => {
    const targetTenders = 16550701;
    const targetGem = 3225656;
    const duration = 1200;
    const steps = 30;
    const stepTime = duration / steps;

    let currentStep = 0;
    const counterTimer = setInterval(() => {
      currentStep++;
      setTendersCount((prev) => Math.floor((targetTenders / steps) * currentStep));
      setGemBidsCount((prev) => Math.floor((targetGem / steps) * currentStep));

      if (currentStep >= steps) {
        setTendersCount(targetTenders);
        setGemBidsCount(targetGem);
        clearInterval(counterTimer);
      }
    }, stepTime);

    return () => clearInterval(counterTimer);
  }, []);

  // Map Event Handlers
  const handleMapMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleStateHover = (stateId) => {
    const data = stateTenderData[stateId] || {
      name: "State Notice",
      count: 5200,
      totalValue: "₹7,800 Cr",
      topSector: "Civil Infrastructure"
    };
    setHoveredStateData(data);
  };

  const handleStateClick = (stateName) => {
    setSelectedState(stateName);
    const element = document.getElementById('live-tenders-list');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 24 Industry Sectors Array
  const sectorsData = [
    { name: 'Roads & Highways', icon: '🛣️' },
    { name: 'Water / Irrigation / WSS', icon: '💧' },
    { name: 'Supply / Goods', icon: '📦' },
    { name: 'Buildings / Civil', icon: '🏗️' },
    { name: 'Power / Electrical', icon: '⚡' },
    { name: 'Industrial / Process Plant', icon: '🏭' },
    { name: 'Bridges / Structures', icon: '🌉' },
    { name: 'Civic / Administration / Other', icon: '🏛️' },
    { name: 'Services / Manpower / O&M', icon: '👥' },
    { name: 'Railway / Metro', icon: '🚆' },
    { name: 'Medical / Health', icon: '🏥' },
    { name: 'Education / Institutional', icon: '🎓' },
    { name: 'Mining / Quarrying', icon: '⛏️' },
    { name: 'Dams / Hydro / Major Water Infra', icon: '🌊' },
    { name: 'Defence / Paramilitary', icon: '🛡️' },
    { name: 'IT / ICT', icon: '💻' },
    { name: 'Unclassified', icon: '📁' },
    { name: 'Oil & Gas / Petrochem / Refinery', icon: '⛽' },
    { name: 'Parks / Horticulture', icon: '🌳' },
    { name: 'Waste Management', icon: '♻️' },
    { name: 'Ports / Maritime / Navigation', icon: '⚓' },
    { name: 'Heritage / Conservation / ASI', icon: '🕌' },
    { name: 'Real Estate / Land', icon: '🏢' },
    { name: 'Nuclear / Atomic / Strategic', icon: '☢️' }
  ];

  // Slice sectors to show 2 rows
  const visibleSectors = showAllSectors ? sectorsData : sectorsData.slice(0, 6);

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      tender.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.authority?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'All' || tender.sector === selectedSector;
    const matchesState = selectedState === 'All' || tender.state === selectedState;

    return matchesSearch && matchesSector && matchesState;
  });

  const currentBanner = bannerSectors[currentSectorIndex];
  const totalCountFormatted = (tendersCount + gemBidsCount).toLocaleString('en-IN');

  return (
    <div className="home-container">
      {/* 1. HERO SEARCH SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">India's Premier E-Procurement Market Intelligence</span>
          <h1 className="hero-heading">Browse Active Tenders & Awarded Contracts</h1>
          <p className="hero-sub">
            Comprehensive market analytics tracking over ₹6,0,0,000 Cr across 24 key industries.
          </p>

          <form className="search-box" onSubmit={handleSearchSubmit}>
            <div className="input-group main-input">
              <span className="input-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by Keyword, Tender ID, or Authority..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="input-group">
              <span className="input-icon">💼</span>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="select-input"
              >
                <option value="All">All Sectors ({sectorsData.length})</option>
                {sectorsData.map((sec, i) => (
                  <option key={i} value={sec.name}>{sec.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <span className="input-icon">📍</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="select-input"
              >
                <option value="All">All States</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
              </select>
            </div>

            <button type="submit" className="search-btn">Search Tenders</button>
          </form>

          <div className="stats-row">
            <div className="stat-card">
              <h3>60,00,000+</h3>
              <p>Total Contract Awards</p>
            </div>
            <div className="stat-card">
              <h3>₹60,00,000 Cr+</h3>
              <p>Tracked Value</p>
            </div>
            <div className="stat-card">
              <h3>24 Sectors</h3>
              <p>Industry Coverage</p>
            </div>
            <div className="stat-card">
              <h3>500+</h3>
              <p>Work Sub-types</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ROTATING BANNER SECTION */}
      <section className="image-banner-section">
        <div className="banner-card-container">
          <div className="banner-image-box">
            <img 
              src={currentBanner.image} 
              alt={currentBanner.name} 
              className="banner-dynamic-img"
            />
            <div className="banner-badge">
              <span>{currentBanner.icon} {currentBanner.name}</span>
            </div>
            <div className="sector-info-bottom-pill">
              <span className="overlay-tag">{currentBanner.tagline}</span>
              <p className="overlay-desc">{currentBanner.description}</p>
            </div>
          </div>

          <div className="banner-content-box interactive-banner">
            <div className="banner-header-row">
              <div className="live-status-badge">
                <span className="pulse-dot"></span>
                <span className="sub-tagline">INDIAN GOVERNMENT TENDERS</span>
              </div>
            </div>

            <h2 className="banner-counter-heading">
              Search <span className="counter-highlight accent-text">{totalCountFormatted}</span> Tenders & GeM Bids
            </h2>

            <div className="banner-stats-container">
              <div className="stat-card">
                <span className="stat-val">{tendersCount.toLocaleString('en-IN')}</span>
                <span className="stat-lbl">Active Tenders</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-card">
                <span className="stat-val">{gemBidsCount.toLocaleString('en-IN')}</span>
                <span className="stat-lbl">GeM Bids</span>
              </div>
            </div>

            <div className="quick-banner-search-wrapper">
              <form className="quick-banner-search" onSubmit={handleSearchSubmit}>
                <span className="search-icon-prefix">🔍</span>
                <input
                  type="text"
                  placeholder="Search keyword, authority, work..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="banner-search-input"
                />
                <button type="submit" className="banner-search-btn">
                  <span>Search</span>
                  <span className="btn-arrow">→</span>
                </button>
              </form>
            </div>

            <div className="banner-filter-chips">
              {[
                { id: 'tenders', label: '📋 Tenders' },
                { id: 'results', label: '📊 Results' },
                { id: 'companies', label: '🏢 Companies' },
                { id: 'authorities', label: '🏛️ Authorities' }
              ].map((item) => (
                <label key={item.id} className="chip-option">
                  <input 
                    type="radio" 
                    name="searchType" 
                    value={item.id} 
                    defaultChecked={item.id === 'tenders'} 
                  />
                  <span className="chip-btn">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectorSlider />

      {/* 3. REAL INDIA MAP IMAGE + INTERACTIVE HOTSPOTS SECTION */}
      <section className="map-section-container">
        <div className="map-section-header">
          <span className="live-pill">📍 Location Intelligence</span>
          <h2>Pan-India Live Tender Distribution</h2>
          <p>Hover over any state hotspot on the official map to explore active live tenders and budget estimates.</p>
        </div>

        <div 
          className="map-wrapper" 
          onMouseMove={handleMapMouseMove} 
          onMouseLeave={() => setHoveredStateData(null)}
        >
          <div className="map-image-container">
            <img 
              src="/images/Gemini_Generated_Image_kqwzcukqwzcukqwz-removebg-preview.png" 
              alt="Official India Map" 
              className="real-india-map-img"
            />

            {/* Hotspots */}
            <div 
              className="map-hotspot" 
              style={{ top: '28%', left: '41%' }}
              onMouseEnter={() => handleStateHover("IN-DL")}
              onClick={() => handleStateClick("Delhi")}
            >
              <span className="pulse"></span>
              <span className="point"></span>
              <span className="state-name-tag">Delhi NCR</span>
            </div>

            <div 
              className="map-hotspot" 
              style={{ top: '34%', left: '29%' }}
              onMouseEnter={() => handleStateHover("IN-RJ")}
              onClick={() => handleStateClick("Rajasthan")}
            >
              <span className="pulse"></span>
              <span className="point"></span>
              <span className="state-name-tag">Rajasthan</span>
            </div>

            <div 
              className="map-hotspot" 
              style={{ top: '33%', left: '50%' }}
              onMouseEnter={() => handleStateHover("IN-UP")}
              onClick={() => handleStateClick("Uttar Pradesh")}
            >
              <span className="pulse"></span>
              <span className="point"></span>
              <span className="state-name-tag">Uttar Pradesh</span>
            </div>

            <div 
              className="map-hotspot" 
              style={{ top: '46%', left: '23%' }}
              onMouseEnter={() => handleStateHover("IN-GJ")}
              onClick={() => handleStateClick("Gujarat")}
            >
              <span className="pulse"></span>
              <span className="point"></span>
              <span className="state-name-tag">Gujarat</span>
            </div>

            <div 
              className="map-hotspot" 
              style={{ top: '46%', left: '43%' }}
              onMouseEnter={() => handleStateHover("IN-MP")}
              onClick={() => handleStateClick("Madhya Pradesh")}
            >
              <span className="pulse"></span>
              <span className="point"></span>
              <span className="state-name-tag">Madhya Pradesh</span>
            </div>

            <div 
              className="map-hotspot" 
              style={{ top: '58%', left: '36%' }}
              onMouseEnter={() => handleStateHover("IN-MH")}
              onClick={() => handleStateClick("Maharashtra")}
            >
              <span className="pulse"></span>
              <span className="point"></span>
              <span className="state-name-tag">Maharashtra</span>
            </div>

            <div 
              className="map-hotspot" 
              style={{ top: '45%', left: '67%' }}
              onMouseEnter={() => handleStateHover("IN-WB")}
              onClick={() => handleStateClick("West Bengal")}
            >
              <span className="pulse"></span>
              <span className="point"></span>
              <span className="state-name-tag">West Bengal</span>
            </div>

            <div 
              className="map-hotspot" 
              style={{ top: '70%', left: '39%' }}
              onMouseEnter={() => handleStateHover("IN-KA")}
              onClick={() => handleStateClick("Karnataka")}
            >
              <span className="pulse"></span>
              <span className="point"></span>
              <span className="state-name-tag">Karnataka</span>
            </div>

            <div 
              className="map-hotspot" 
              style={{ top: '80%', left: '45%' }}
              onMouseEnter={() => handleStateHover("IN-TN")}
              onClick={() => handleStateClick("Tamil Nadu")}
            >
              <span className="pulse"></span>
              <span className="point"></span>
              <span className="state-name-tag">Tamil Nadu</span>
            </div>
          </div>

          {/* Dynamic Follow Hover Tooltip Card */}
          {hoveredStateData && (
            <div
              className="map-hover-card"
              style={{
                left: `${tooltipPos.x + 15}px`,
                top: `${tooltipPos.y - 10}px`
              }}
            >
              <div className="card-header">
                <span className="pin-icon">📍</span>
                <h4>{hoveredStateData.name}</h4>
              </div>

              <div className="card-body-grid">
                <div className="card-metric">
                  <span className="metric-lbl">Live Tenders</span>
                  <span className="metric-val">{hoveredStateData.count.toLocaleString('en-IN')}</span>
                </div>
                <div className="card-metric">
                  <span className="metric-lbl">Est. Total Budget</span>
                  <span className="metric-val highlight">{hoveredStateData.totalValue}</span>
                </div>
              </div>

              <div className="card-footer-pill">
                Top Sector: <strong>{hoveredStateData.topSector}</strong>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. SECTORS GRID SECTION */}
      <section className="home-section" id="sectors">
        <div className="section-title-wrapper">
          <h2>Browse Awards by Sector</h2>
          <p>Explore contract opportunities across 24 core sectors.</p>
        </div>

        <div className="sector-grid-3">
          {visibleSectors.map((sec, idx) => (
            <div
              key={idx}
              className={`enterprise-sector-card ${selectedSector === sec.name ? 'active-card' : ''}`}
            >
              <div className="sector-card-header">
                <span className="sector-icon-box">{sec.icon}</span>
                <div>
                  <h3 className="sector-title">{sec.name}</h3>
                </div>
              </div>

              <button
                className="filter-sector-btn"
                onClick={() => {
                  setSelectedSector(sec.name);
                  navigate(`/tenders?sector=${encodeURIComponent(sec.name)}`);
                }}
              >
                View {sec.name} Tenders
              </button>
            </div>
          ))}
        </div>

        {/* See More / See Less Toggle Button */}
        {sectorsData.length > 6 && (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              className="see-more-btn"
              onClick={() => setShowAllSectors(!showAllSectors)}
            >
              {showAllSectors ? 'See Less ▲' : 'See More Sectors ▼'}
            </button>
          </div>
        )}
      </section>

      {/* 5. TENDERS LIST SECTION */}
      <section className="tenders-section-container" id="live-tenders-list">
        <div className="tenders-section-header">
          <div className="header-text-group">
            <span className="section-pill">LIVE BIDS</span>
            <h2>Latest Live Procurement Notices</h2>
            <p>High-value opportunities published by Central & State Authorities.</p>
          </div>
          <Link to="/tenders" className="view-all-btn">
            View All Notices <span>→</span>
          </Link>
        </div>

        <div className="tenders-grid">
          {filteredTenders.length > 0 ? (
            filteredTenders.slice(0, 5).map((tender) => {
              const isLive = tender.status === 'LIVE';
              return (
                <div 
                  key={tender.id} 
                  className={`modern-tender-card ${isLive ? 'is-live' : 'is-expiring'}`}
                >
                  <div className="card-top-bar">
                    <div className="badge-group">
                      <span className="tender-id-badge">ID: {tender.id}</span>
                      <span className="sector-pill-tag">{tender.sector}</span>
                    </div>
                    <span className={`status-indicator ${isLive ? 'live-dot' : 'expiring-dot'}`}>
                      <span className="dot-pulse"></span>
                      {tender.status}
                    </span>
                  </div>

                  <h3 className="tender-main-title">{tender.title}</h3>
                  <div className="authority-info">
                    <span className="auth-icon">🏛️</span>
                    <span className="auth-name">{tender.authority}</span>
                  </div>

                  <div className="meta-cards-grid">
                    <div className="meta-card-item">
                      <span className="meta-icon">📍</span>
                      <div>
                        <span className="meta-label">Location</span>
                        <span className="meta-value">{tender.state}</span>
                      </div>
                    </div>

                    <div className="meta-card-item highlight-box">
                      <span className="meta-icon">💰</span>
                      <div>
                        <span className="meta-label">Est. Value</span>
                        <span className="meta-value value-text">{tender.budget}</span>
                      </div>
                    </div>

                    <div className="meta-card-item">
                      <span className="meta-icon">🛡️</span>
                      <div>
                        <span className="meta-label">EMD Fee</span>
                        <span className="meta-value">{tender.emd || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="meta-card-item deadline-box">
                      <span className="meta-icon">⏳</span>
                      <div>
                        <span className="meta-label">Deadline</span>
                        <span className="meta-value deadline-text">{tender.deadline}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-action-bar">
                    <Link to={`/tender/${tender.id}`} className="apply-btn">
                      <span>View Complete Details & Apply</span>
                      <span className="arrow-icon">→</span>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-tenders-card">
              <div className="empty-icon">🔍</div>
              <h3>No Matching Tenders Found</h3>
              <p>Try resetting your search query, sector, or state filters to explore active opportunities.</p>
              <button
                className="reset-filter-btn"
                onClick={() => { setSearchTerm(''); setSelectedSector('All'); setSelectedState('All'); }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}