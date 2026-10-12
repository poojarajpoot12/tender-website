// src/pages/TenderResultsPage.jsx
import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, Building2, Download, Bookmark, Eye, Clock, ShieldCheck } from 'lucide-react';
import '../css/TenderResultsPage.css';

const TenderResultsPage = () => {
  // Dummy Data for Preview
  const [tenders] = useState([
    {
      id: "TND-2026-9812",
      title: "Construction of 4-Lane Highway Stretch including Flyover and Drainage System",
      authority: "National Highways Authority of India (NHAI)",
      sector: "Roads & Highways",
      location: "Nagpur, Maharashtra",
      value: "₹142.50 Cr",
      emd: "₹1.42 Cr",
      publishDate: "02 Oct 2026",
      dueDate: "28 Oct 2026",
      daysLeft: 20,
      status: "Live"
    },
    {
      id: "TND-2026-7731",
      title: "Supply, Installation and Maintenance of Enterprise Server Infrastructure & Cybersecurity Suite",
      authority: "State Bank of India (SBI)",
      sector: "IT & Infrastructure",
      location: "Mumbai, Maharashtra",
      value: "₹18.20 Cr",
      emd: "₹18.2 Lakhs",
      publishDate: "05 Oct 2026",
      dueDate: "19 Oct 2026",
      daysLeft: 11,
      status: "Live"
    },
    {
      id: "TND-2026-4091",
      title: "Annual Maintenance Contract for Solar Power Generation Units across Government Buildings",
      authority: "UP New and Renewable Energy Development Agency (UPNEDA)",
      sector: "Power & Energy",
      location: "Lucknow, Uttar Pradesh",
      value: "₹4.80 Cr",
      emd: "₹9.6 Lakhs",
      publishDate: "01 Oct 2026",
      dueDate: "14 Oct 2026",
      daysLeft: 6,
      status: "Closing Soon"
    }
  ]);

  return (
    <div className="tender-results-layout">
      {/* 1. TOP BAR */}
      <header className="results-header">
        <div className="header-content">
          <h1>Tender Search Results</h1>
          <p>Explore <strong>1,248 active procurement notices</strong> matching your criteria</p>
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
            <button className="reset-btn">Reset All</button>
          </div>

          {/* Sector Filter */}
          <div className="filter-group">
            <label className="filter-label">Sector / Domain</label>
            <select className="filter-select">
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
            <select className="filter-select">
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
            <span className="results-count">Showing <strong>3</strong> of 1,248 Tenders</span>
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
            {tenders.map((tender) => (
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
                    <button className="btn-primary flex-icon"><Eye size={16} /> View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TenderResultsPage;