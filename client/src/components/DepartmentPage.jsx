// src/pages/DepartmentPage.jsx
import React, { useState } from 'react';
import { Building2, MapPin, Layers, Award, FileText, Search, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import '../css/DepartmentPage.css';

const DepartmentPage = () => {
  const [activeTab, setActiveTab] = useState('live'); // 'live', 'awarded', 'analytics'

  // Dummy Department Data
  const deptData = {
    name: "National Highways Authority of India (NHAI)",
    code: "NHAI",
    sector: "Roads & Highways",
    category: "Central Authority / PSU",
    primaryState: "New Delhi (Headquarters)",
    website: "https://nhai.gov.in",
    totalTenders: 21750,
    awardedValue: "₹3,12,000 Cr",
    liveTendersCount: 259,
    description: "NHAI is responsible for the development, maintenance, and management of National Highways entrusted to it and for matters connected or incidental thereto."
  };

  const liveTenders = [
    {
      id: "NHAI/2026/HW-902",
      title: "Four laning of Greenfield Expressway Section from Km 120 to Km 165 (Package 4)",
      value: "₹840.50 Cr",
      emd: "₹8.40 Cr",
      location: "Rajasthan",
      dueDate: "24 Oct 2026"
    },
    {
      id: "NHAI/2026/BR-412",
      title: "Construction of 6-Lane Cable Stayed Bridge over Yamuna River",
      value: "₹310.00 Cr",
      emd: "₹3.10 Cr",
      location: "Uttar Pradesh",
      dueDate: "02 Nov 2026"
    }
  ];

  return (
    <div className="dept-page-container">
      {/* 1. HEADER HERO BANNER */}
      <div className="dept-hero-card">
        <div className="dept-hero-top">
          <div className="dept-logo-badge">
            {deptData.code}
          </div>
          <div className="dept-main-info">
            <div className="dept-tags">
              <span className="tag sector-tag">{deptData.sector}</span>
              <span className="tag category-tag">{deptData.category}</span>
            </div>
            <h1 className="dept-title">{deptData.name}</h1>
            <p className="dept-sub-info">
              <span><MapPin size={14} /> {deptData.primaryState}</span>
              <span>•</span>
              <a href={deptData.website} target="_blank" rel="noreferrer" className="dept-link">
                Official Website <ExternalLink size={12} />
              </a>
            </p>
          </div>
        </div>
        
        <p className="dept-desc">{deptData.description}</p>

        {/* Department KPIs */}
        <div className="dept-kpi-grid">
          <div className="kpi-box">
            <span className="kpi-label">Total Published Tenders</span>
            <span className="kpi-num">{deptData.totalTenders.toLocaleString()}</span>
          </div>
          <div className="kpi-box">
            <span className="kpi-label">Cumulative Awarded Value</span>
            <span className="kpi-num value-green">{deptData.awardedValue}</span>
          </div>
          <div className="kpi-box highlight-box">
            <span className="kpi-label">Active Live Bids</span>
            <span className="kpi-num">{deptData.liveTendersCount}</span>
          </div>
        </div>
      </div>

      {/* 2. TABS NAVIGATION */}
      <div className="dept-tabs-bar">
        <button 
          className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          <FileText size={16} /> Live Bids ({deptData.liveTendersCount})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'awarded' ? 'active' : ''}`}
          onClick={() => setActiveTab('awarded')}
        >
          <Award size={16} /> Awarded Contracts
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <Layers size={16} /> Department Analytics
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      <div className="dept-content-section">
        {activeTab === 'live' && (
          <div className="live-bids-container">
            <div className="content-header">
              <h2>Open Tenders & RFPs</h2>
              <div className="search-box">
                <Search size={16} />
                <input type="text" placeholder="Search tenders of this department..." />
              </div>
            </div>

            <div className="tenders-list">
              {liveTenders.map((tender, i) => (
                <div key={i} className="dept-tender-card">
                  <div className="tender-header">
                    <span className="ref-id">Ref: {tender.id}</span>
                    <span className="due-badge"><Calendar size={12} /> Due: {tender.dueDate}</span>
                  </div>
                  <h3 className="tender-name">{tender.title}</h3>
                  <div className="tender-meta">
                    <div><strong>Value:</strong> <span className="green-text">{tender.value}</span></div>
                    <div><strong>EMD:</strong> {tender.emd}</div>
                    <div><strong>Location:</strong> {tender.location}</div>
                  </div>
                  <div className="card-action">
                    <button className="btn-view">View Bid Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'awarded' && (
          <div className="empty-tab-state">
            <CheckCircle2 size={32} />
            <p>Archive of awarded contracts and winning bidder lists for NHAI.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="empty-tab-state">
            <Layers size={32} />
            <p>State-wise tender breakdown and top winning contractors chart.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentPage;