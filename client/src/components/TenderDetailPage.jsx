import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Calendar, MapPin, Building, FileText, Download, Share2, ShieldCheck, DollarSign } from 'lucide-react';

// Dynamic API Base URL (Local aur Live dono ke liye)
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://tender-website-r77f.onrender.com';

export default function TenderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // LocalStorage check for Saved Bids
  const checkIfSaved = (tenderId) => {
    try {
      const savedBids = JSON.parse(localStorage.getItem('savedBids')) || [];
      return savedBids.some((item) => (item.id || item._id) === tenderId);
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchTenderDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/tenders/${id}`);
        const result = await response.json();

        if (response.ok && result.success && result.data) {
          const item = result.data;
          const formatted = {
            id: item.tenderId || item._id,
            refNumber: item.refNumber || item.tenderId || 'N/A',
            portalSource: item.portalSource || 'CPSE',
            title: item.title || 'Untitled Tender',
            authority: item.authorityName || item.department || 'Government Authority',
            sector: item.sector || item.category || 'Civil & Construction',
            tenderType: item.tenderType || 'Works',
            state: item.location?.state || 'Delhi',
            city: item.location?.city || 'New Delhi',
            budget: item.financials?.estimatedCost 
              ? `₹${(item.financials.estimatedCost / 10000000).toFixed(2)} Cr`
              : '₹50,00,000',
            emdAmount: item.financials?.emdAmount 
              ? `₹${item.financials.emdAmount.toLocaleString('en-IN')}`
              : '₹1,00,000',
            documentFee: item.financials?.documentFee 
              ? `₹${item.financials.documentFee.toLocaleString('en-IN')}`
              : '₹2,500',
            publishedDate: item.dates?.publishedDate 
              ? new Date(item.dates.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Recent',
            closingDate: item.dates?.closingDate 
              ? new Date(item.dates.closingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'N/A',
            openingDate: item.dates?.openingDate 
              ? new Date(item.dates.openingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'TBA',
            status: item.stage || item.status || 'LIVE',
            description: item.description || 'Full scope of work including supply, civil engineering, site execution, quality assurance, and compliance as per authority guidelines.',
            documents: item.documents || [
              { name: 'Tender Notice (NIT).pdf', size: '1.2 MB' },
              { name: 'Bill of Quantities (BOQ).xlsx', size: '850 KB' },
              { name: 'Technical Specifications.pdf', size: '3.4 MB' }
            ],
            boqItems: item.boqItems || [
              { srNo: 1, itemDescription: 'Earthwork excavation and site leveling', unit: 'Sqm', qty: 15000, estRate: '₹250' },
              { srNo: 2, itemDescription: 'Reinforced Cement Concrete (RCC) structure work', unit: 'Cum', qty: 3200, estRate: '₹6,500' },
              { srNo: 3, itemDescription: 'Drainage piping and stormwater line setup', unit: 'Rmtr', qty: 450, estRate: '₹1,200' }
            ]
          };
          setTender(formatted);
          setIsSaved(checkIfSaved(formatted.id));
        } else {
          // Fallback dummy data for local testing
          setTender(getDummyTender(id));
          setIsSaved(checkIfSaved(id));
        }
      } catch (err) {
        console.error('Error fetching tender detail:', err);
        setTender(getDummyTender(id));
        setIsSaved(checkIfSaved(id));
      } finally {
        setLoading(false);
      }
    };

    fetchTenderDetails();
  }, [id]);

  // Fallback Tender Data generator for quick offline testing
  const getDummyTender = (tenderId) => ({
    id: tenderId,
    refNumber: tenderId || 'TH-2026-DEL-021',
    portalSource: 'CPSE',
    title: 'Road Improvement and Drainage Infrastructure Development',
    authority: 'Public Works Department, Government of NCT of Delhi',
    sector: 'Roads & Highways',
    tenderType: 'Works / Civil Construction',
    state: 'Delhi',
    city: 'New Delhi',
    budget: '₹4.50 Cr',
    emdAmount: '₹9,00,000',
    documentFee: '₹5,000',
    publishedDate: '03 Oct 2026',
    closingDate: '20 Oct 2026',
    openingDate: '21 Oct 2026',
    status: 'LIVE',
    description: 'Engineering, Procurement, and Construction (EPC) contract for road strengthening, stormwater drain construction, and associated civil infrastructure development across identified stretches in New Delhi.',
    documents: [
      { name: 'Notice Inviting Tender (NIT).pdf', size: '1.8 MB' },
      { name: 'Financial BOQ Schedule.xlsx', size: '920 KB' },
      { name: 'Technical Criteria & Conditions.pdf', size: '2.5 MB' }
    ],
    boqItems: [
      { srNo: 1, itemDescription: 'Site clearance, grading, and excavation', unit: 'Sqm', qty: 22000, estRate: '₹220' },
      { srNo: 2, itemDescription: 'Dense Bituminous Macadam (DBM) laying', unit: 'Cum', qty: 4100, estRate: '₹7,800' },
      { srNo: 3, itemDescription: 'Precast RCC drainage channel setup', unit: 'Rmtr', qty: 1200, estRate: '₹2,400' }
    ]
  });

  // Handle Save / Unsave Bid
  const handleToggleSave = () => {
    if (!tender) return;
    let savedBids = JSON.parse(localStorage.getItem('savedBids')) || [];
    const exists = savedBids.some((item) => (item.id || item._id) === tender.id);

    if (exists) {
      savedBids = savedBids.filter((item) => (item.id || item._id) !== tender.id);
      setIsSaved(false);
    } else {
      savedBids.push(tender);
      setIsSaved(true);
    }

    localStorage.setItem('savedBids', JSON.stringify(savedBids));
    window.dispatchEvent(new Event('storage'));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Tender link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', fontSize: '1.1rem', color: '#6B7280' }}>
        Loading Tender Details...
      </div>
    );
  }

  if (!tender) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Tender Not Found</h2>
        <button onClick={() => navigate('/tenders')} style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}>
          Back to Tenders
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* TOP BACK BUTTON */}
        <button 
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: 'none',
            background: 'none',
            color: '#2563EB',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px',
            fontSize: '0.95rem'
          }}
        >
          <ArrowLeft size={18} /> Back to Search Results
        </button>

        {/* HEADER CARD */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: '600', fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px' }}>
                {tender.portalSource} · {tender.refNumber}
              </span>
              <span style={{ backgroundColor: '#F3F4F6', color: '#374151', fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', marginLeft: '8px' }}>
                {tender.sector}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#F3F4F6',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <Share2 size={16} /> Share
              </button>

              <button
                onClick={handleToggleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isSaved ? '#FEE2E2' : '#F3F4F6',
                  color: isSaved ? '#EF4444' : '#374151',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <Heart size={16} fill={isSaved ? '#EF4444' : 'none'} color={isSaved ? '#EF4444' : '#374151'} />
                {isSaved ? 'Saved' : 'Save Tender'}
              </button>
            </div>
          </div>

          <h1 style={{ fontSize: '1.4rem', color: '#111827', margin: '16px 0 8px 0' }}>{tender.title}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4B5563', margin: 0, fontSize: '0.95rem' }}>
            <Building size={16} /> {tender.authority}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
            <div>
              <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>Estimated Value</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '700', fontSize: '1.1rem', color: '#059669' }}>{tender.budget}</p>
            </div>
            <div>
              <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>Location</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#111827' }}>📍 {tender.city}, {tender.state}</p>
            </div>
            <div>
              <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>Closing Date</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#DC2626' }}>⏳ {tender.closingDate}</p>
            </div>
            <div>
              <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>EMD Amount</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#111827' }}>{tender.emdAmount}</p>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '2px solid #E5E7EB' }}>
          {['overview', 'documents', 'boq'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                fontWeight: '600',
                textTransform: 'capitalize',
                cursor: 'pointer',
                color: activeTab === tab ? '#2563EB' : '#6B7280',
                borderBottom: activeTab === tab ? '3px solid #2563EB' : '3px solid transparent',
                marginBottom: '-2px'
              }}
            >
              {tab === 'boq' ? 'BOQ Breakdown' : tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Scope of Work & Overview</h3>
              <p style={{ color: '#374151', lineHeight: '1.6' }}>{tender.description}</p>

              <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>Important Timelines</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: '#4B5563' }}>
                <li>📅 <strong>Published Date:</strong> {tender.publishedDate}</li>
                <li>⏳ <strong>Bid Submission End:</strong> {tender.closingDate}</li>
                <li>🔓 <strong>Technical Opening Date:</strong> {tender.openingDate}</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <h4 style={{ marginTop: 0 }}>Fee Breakdown</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6B7280' }}>Document Fee</span>
                  <strong>{tender.documentFee}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6B7280' }}>EMD Amount</span>
                  <strong>{tender.emdAmount}</strong>
                </div>
              </div>

              <div style={{ backgroundColor: '#EFF6FF', padding: '20px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1E40AF' }}>Ready to Bid?</h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#1E3A8A' }}>
                  Download official BOQ documents or contact the authority for pre-bid meetings.
                </p>
                <button 
                  onClick={() => setActiveTab('documents')}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  View Tender Documents
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h3 style={{ marginTop: 0 }}>Official Tender Documents</h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Download official documents and schedules to evaluate eligibility.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {tender.documents.map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText color="#2563EB" size={20} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>{doc.name}</strong>
                      <small style={{ color: '#6B7280' }}>{doc.size}</small>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Downloading ${doc.name}...`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#EFF6FF', color: '#2563EB', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    <Download size={16} /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT: BOQ BREAKDOWN */}
        {activeTab === 'boq' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h3 style={{ marginTop: 0 }}>Bill of Quantities (BOQ) Schedule</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Sr.</th>
                  <th style={{ padding: '10px' }}>Item Description</th>
                  <th style={{ padding: '10px' }}>Unit</th>
                  <th style={{ padding: '10px' }}>Qty</th>
                  <th style={{ padding: '10px' }}>Est. Rate</th>
                </tr>
              </thead>
              <tbody>
                {tender.boqItems.map((item) => (
                  <tr key={item.srNo} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '10px' }}>{item.srNo}</td>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{item.itemDescription}</td>
                    <td style={{ padding: '10px' }}>{item.unit}</td>
                    <td style={{ padding: '10px' }}>{item.qty.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px', fontWeight: '600', color: '#059669' }}>{item.estRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}