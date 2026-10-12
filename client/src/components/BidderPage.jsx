import React, { useEffect, useState } from 'react';
import BidderCard from './BidderCard';
import '../css/BidderPage.css';

const BidderPage = () => {
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchBidders = async () => {
      try {
        setLoading(true);
        setApiError(null);

        // Standard API Endpoint
        const apiUrl = 'http://localhost:5000/api/bids/bidders';
        console.log('📡 Hitting API Endpoint:', apiUrl);

        const response = await fetch(apiUrl);
        console.log('📥 API Response Status Code:', response.status);

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Data Received from Backend:', data);

        if (Array.isArray(data)) {
          setBidders(data);
        } else {
          console.warn('⚠️ Response is not an array:', data);
          setBidders([]);
        }
      } catch (err) {
        console.error('❌ API FETCH FAILED:', err.message);
        setApiError(err.message);
        setBidders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBidders();
  }, []);

  const filteredBidders = bidders.filter((b) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    const matchesName = b.companyName?.toLowerCase().includes(query);
    const matchesSpec = b.specializations?.some((s) => s.toLowerCase().includes(query));
    const matchesLoc = b.locations?.some((l) => l.toLowerCase().includes(query));

    return matchesName || matchesSpec || matchesLoc;
  });

  if (loading) {
    return <div className="bidder-loading-state">Loading registered companies...</div>;
  }

  return (
    <div className="bidder-page-container">
      <div className="bidder-header">
        <div>
          <h1 className="bidder-title">Registered Bidders & Contractors</h1>
          <p className="bidder-subtitle">
            Explore verified enterprise partners, specializations, and win track records.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by company, specialization, or district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bidder-search-input"
        />
      </div>

      {/* Show Error banner if API fails */}
      {apiError && (
        <div style={{ color: 'red', background: '#fee2e2', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <strong>API Error:</strong> {apiError}. Make sure node backend server is running on port 5000!
        </div>
      )}

      {filteredBidders.length > 0 ? (
        <div className="bidder-grid">
          {filteredBidders.map((bidder, index) => (
            <BidderCard 
              key={bidder._id || index} 
              bidder={bidder} 
            />
          ))}
        </div>
      ) : (
        <div className="bidder-empty-state">
          No registered bidders found. Registered companies in the database will appear here.
        </div>
      )}
    </div>
  );
};

export default BidderPage;