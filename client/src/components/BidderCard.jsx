import React from 'react';
import '../css/BidderPage.css';
import './BidderPage.jsx';

const BidderCard = ({ bidder }) => {
  const {
    companyName,
    companyLogo,
    specializations = [],
    locations = [],
    totalTenders = 0,
    wonTenders = 0,
    wonValue = 0,
    email,
    isLeader = false
  } = bidder || {};

  // Display Name Fallback
  const displayName =
    companyName && companyName.trim() !== ''
      ? companyName
      : email
        ? email.split('@')[0]
        : 'Registered Bidder';

  const avatarText = displayName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CO';

  const winRate = totalTenders > 0 ? Math.round((wonTenders / totalTenders) * 100) : 0;

  // Exact Screenshot Format (₹2.85L Cr / ₹71,251 Cr / ₹58,387 Cr / ₹0)
  const formatWonValue = (val) => {
    if (!val || val === 0) return '₹0';
    if (val >= 100000000000) {
      return `₹${(val / 100000000000).toFixed(2)}L Cr`;
    } else if (val >= 10000000) {
      const crVal = Math.round(val / 10000000);
      return `₹${crVal.toLocaleString('en-IN')} Cr`;
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Badges Limit
  const allBadges = [
    ...(Array.isArray(specializations) ? specializations : []),
    ...(Array.isArray(locations) ? locations : [])
  ].slice(0, 3);

  return (
    <div className="modern-bidder-card">
      <div className="card-top">
        {/* Logo / Avatar Box */}
        <div className="logo-box">
          {companyLogo ? (
            <img src={companyLogo} alt={displayName} className="logo-img" />
          ) : (
            <span className="logo-fallback">{avatarText}</span>
          )}
        </div>

        {/* Company Details */}
        <div className="company-details">
          <div className="title-row">
            <h3 className="company-title">{displayName}</h3>
            {isLeader && <span className="leader-badge">★ LEADER</span>}
          </div>

          <div className="tags-row">
            {allBadges.length > 0 ? (
              allBadges.map((tag, idx) => (
                <span key={idx} className="category-tag">
                  {tag}
                </span>
              ))
            ) : (
              <span className="category-tag">General Contractor</span>
            )}
          </div>
        </div>
      </div>

      <div className="card-divider" />

      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="metric-col">
          <span className="metric-label">TENDERS</span>
          <span className="metric-value dark">{totalTenders.toLocaleString('en-IN')}</span>
        </div>

        <div className="metric-col">
          <span className="metric-label">WON</span>
          <span className="metric-value dark">{wonTenders.toLocaleString('en-IN')}</span>
        </div>

        <div className="metric-col">
          <span className="metric-label">WIN RATE</span>
          <span className="metric-value green">{winRate}%</span>
        </div>

        <div className="metric-col">
          <span className="metric-label">WON VALUE</span>
          <span className="metric-value orange">{formatWonValue(wonValue)}</span>
        </div>
      </div>
    </div>
  );
};

export default BidderCard;