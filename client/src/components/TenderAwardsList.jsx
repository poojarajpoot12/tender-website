import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TenderAwardsList({ awardsData }) {
  const navigate = useNavigate();
  
  // Track revealed cards (by Tender ID)
  const [revealedCards, setRevealedCards] = useState({});

  // Reveal Button Handler (Toggles blurred bid details)
  const handleReveal = (tenderId) => {
    setRevealedCards((prev) => ({
      ...prev,
      [tenderId]: !prev[tenderId] // Toggle reveal state
    }));
  };

  // Open Page Handler (Navigates to 4th Level Detail Page)
  const handleOpenPage = (tenderId) => {
    navigate(`/tender-detail/${tenderId}`);
  };

  return (
    <div className="awards-container">
      <div className="awards-grid">
        {awardsData.map((award) => {
          const isRevealed = revealedCards[award.id];

          return (
            <div key={award.id} className="award-card">
              <div className="card-header">
                <span className="tag-tender">Tender</span>
                <span className="tender-id">{award.id}</span>
                <span className="award-date">Awarded {award.date}</span>
              </div>

              <h3 className="tender-title">{award.title}</h3>
              <p className="department-info">{award.department} • {award.state}</p>

              {/* Bid Results Section */}
              <div className="bidders-section">
                {award.bidders.map((bid, index) => (
                  <div key={index} className={`bid-row ${!isRevealed ? 'blurred-text' : ''}`}>
                    <span className={`rank-badge rank-${index + 1}`}>L{index + 1}</span>
                    <span className="bidder-name">
                      {isRevealed ? bid.companyName : '██████████████'}
                    </span>
                    <span className="bid-amount">
                      {isRevealed ? `₹ ${bid.amount}` : '₹ ██,██,███'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="card-actions">
                <button 
                  className="reveal-btn" 
                  onClick={() => handleReveal(award.id)}
                >
                  {isRevealed ? 'HIDE ➔' : 'REVEAL ➔'}
                </button>

                <button 
                  className="open-page-btn" 
                  onClick={() => handleOpenPage(award.id)}
                >
                  OPEN PAGE ➔
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}