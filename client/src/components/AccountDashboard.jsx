import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AccountDashboard.css';

// Dynamic API Base URL (Local aur Live dono ke liye)
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://tender-website-r77f.onrender.com';

const AVAILABLE_SPECIALIZATIONS = [
  'Medical & Hospital Supplies',
  'IT Infrastructure & Networking',
  'Civil & Road Construction',
  'Electrical & Solar Works',
  'Facility & Security Management',
  'Printing & Stationary'
];

const generateNameFromEmail = (email) => {
  if (!email) return 'User';
  const usernamePart = email.split('@')[0];
  const cleanName = usernamePart.replace(/[._0-9]/g, ' ').trim();
  const formattedName = cleanName
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return formattedName || usernamePart;
};

const AccountDashboard = ({ user: propUser, onLogout }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(
    () => localStorage.getItem('token') || sessionStorage.getItem('token')
  );

  const [userData, setUserData] = useState(() => {
    try {
      return (
        propUser ||
        JSON.parse(
          localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'
        )
      );
    } catch (e) {
      return {};
    }
  });

  const [activeTab, setActiveTab] = useState('Plans');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [companyDetails, setCompanyDetails] = useState({
    mobileNumber: userData?.mobileNumber || '',
    companyName: userData?.companyName || '',
    companyType: userData?.companyType || '',
    gstin: userData?.gstin || '',
    pan: userData?.pan || '',
    companyLogo: userData?.companyLogo || '',
    specializations: userData?.specializations || [],
    locations: userData?.locations || [],
    districtInput: '',
    whatsappAlertsEnabled: userData?.whatsappAlertsEnabled ?? true,
  });

  const [showOtpField, setShowOtpField] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const [selectedLocations, setSelectedLocations] = useState(
    userData?.alertPreferences?.locations || ['Delhi', 'Karnataka']
  );
  const [selectedKeywords, setSelectedKeywords] = useState(
    userData?.alertPreferences?.keywords || ['Hospital Supplies', 'IT Infrastructure']
  );
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [prefSaveStatus, setPrefSaveStatus] = useState('');

  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedBids, setSavedBids] = useState([]);

  const availableLocations = [
    'Delhi', 'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Gujarat', 'Tamil Nadu', 'Rajasthan'
  ];

  // Load Saved Bids from LocalStorage
  useEffect(() => {
    const loadSavedBids = () => {
      try {
        const storedBids = JSON.parse(localStorage.getItem('savedBids') || '[]');
        setSavedBids(storedBids);
      } catch (err) {
        console.error('Error reading saved bids from localStorage', err);
      }
    };
    loadSavedBids();
  }, [activeTab]);

  const handleRemoveSavedBid = (tenderId) => {
    const updated = savedBids.filter((item) => (item.id || item.tenderId || item._id) !== tenderId);
    setSavedBids(updated);
    localStorage.setItem('savedBids', JSON.stringify(updated));
  };

  useEffect(() => {
    if (propUser) {
      setUserData(propUser);
    }
  }, [propUser]);

  useEffect(() => {
    if (userData) {
      setCompanyDetails((prev) => ({
        ...prev,
        mobileNumber: userData?.mobileNumber || prev.mobileNumber || '',
        companyName: userData?.companyName || prev.companyName || '',
        companyType: userData?.companyType || prev.companyType || '',
        gstin: userData?.gstin || prev.gstin || '',
        pan: userData?.pan || prev.pan || '',
        companyLogo: userData?.companyLogo || prev.companyLogo || '',
        specializations: userData?.specializations || prev.specializations || [],
        locations: userData?.locations || prev.locations || [],
        whatsappAlertsEnabled: userData?.whatsappAlertsEnabled ?? true,
      }));

      if (userData?.alertPreferences) {
        setSelectedLocations(userData.alertPreferences.locations || ['Delhi', 'Karnataka']);
        setSelectedKeywords(userData.alertPreferences.keywords || ['Hospital Supplies']);
      }
    }
  }, [userData]);

  useEffect(() => {
    let isMounted = true;

    const fetchLatestProfile = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data && isMounted) {
          setUserData(data);
          if (localStorage.getItem('token')) {
            localStorage.setItem('user', JSON.stringify(data));
          } else {
            sessionStorage.setItem('user', JSON.stringify(data));
          }
        }
      } catch (err) {
        console.error('Error fetching profile from backend:', err);
      }
    };
    fetchLatestProfile();
    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  if (!token) return null;

  const handleSignOut = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    }
    setToken(null);
    setUserData({});
    navigate('/login', { replace: true });
  };

  const derivedName = userData?.name
    ? userData.name
    : userData?.email
    ? generateNameFromEmail(userData.email)
    : 'User';

  const user = {
    initial: derivedName.charAt(0).toUpperCase(),
    name: derivedName,
    email: userData?.email || 'user@example.com',
    isVerified: userData?.isVerified ?? true,
    isMobileVerified: userData?.isMobileVerified ?? false,
    profileStrength: userData?.profileStrength || 20,
  };

  const tabs = ['Plans', 'Profile', 'Usage', 'My Bids', 'Alerts', 'Support'];
  
  const predefinedUsageMetrics = [
    { activity: 'Searches', quota: '250 / month', used: 7 },
    { activity: 'Tender and GeM Pages', quota: '150 / month', used: 14 },
    { activity: 'Document Downloads', quota: '50 / month', used: 1 },
    { activity: 'Bid Results', quota: '8 / month', used: 0 },
    { activity: 'Company, Authority and Sector Profiles', quota: '8 / month', used: 2 },
    { activity: 'New Deep Dive Reports', quota: '1 / month', used: 0 },
    { activity: 'Deep Dive Re-opens', quota: '10 / month', used: 1 },
    { activity: 'Company, Authority, Sector and GeM List Pages', quota: '10 / month', used: 10 },
  ];

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyDetails((prev) => ({ ...prev, companyLogo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpecializationChange = (spec) => {
    const currentSpecs = companyDetails.specializations || [];
    if (currentSpecs.includes(spec)) {
      setCompanyDetails({
        ...companyDetails,
        specializations: currentSpecs.filter((item) => item !== spec),
      });
    } else {
      if (currentSpecs.length < 3) {
        setCompanyDetails({
          ...companyDetails,
          specializations: [...currentSpecs, spec],
        });
      }
    }
  };

  const handleAddDistrict = (e) => {
    if (e.key && e.key !== 'Enter') return;
    if (e.key === 'Enter') e.preventDefault();

    const value = companyDetails.districtInput?.trim();
    if (value && !companyDetails.locations?.includes(value)) {
      setCompanyDetails({
        ...companyDetails,
        locations: [...(companyDetails.locations || []), value],
        districtInput: '',
      });
    }
  };

  const handleRemoveDistrict = (dist) => {
    setCompanyDetails({
      ...companyDetails,
      locations: companyDetails.locations.filter((item) => item !== dist),
    });
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(companyDetails),
      });

      const updatedUser = await res.json();
      if (!res.ok) throw new Error(updatedUser.message || 'Failed to save profile');

      setUserData(updatedUser);

      if (localStorage.getItem('token')) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setIsProfileSaved(true);
      setTimeout(() => setIsProfileSaved(false), 3000);
    } catch (err) {
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSendMobileOtp = async () => {
    if (!companyDetails.mobileNumber) {
      alert('Please enter a mobile number first.');
      return;
    }
    try {
      const targetEmail = userData?.email || '';
      const res = await fetch(`${API_BASE_URL}/api/auth/send-mobile-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: targetEmail,
          mobileNumber: companyDetails.mobileNumber,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowOtpField(true);
        setOtpSentMsg(data.message || 'OTP sent successfully!');
      } else {
        alert(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error('Send OTP Error:', err);
      alert('Error sending OTP. Please try again.');
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (!mobileOtpInput.trim()) {
      alert('Please enter the OTP');
      return;
    }
    try {
      const targetEmail = userData?.email || '';
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-mobile-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: targetEmail,
          mobileNumber: companyDetails.mobileNumber,
          otp: mobileOtpInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = {
          ...userData,
          isMobileVerified: true,
          mobileNumber: companyDetails.mobileNumber,
        };

        setUserData(updatedUser);
        setCompanyDetails((prev) => ({
          ...prev,
          mobileNumber: companyDetails.mobileNumber,
        }));
        setShowOtpField(false);
        setMobileOtpInput('');

        if (localStorage.getItem('token')) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }

        alert('Mobile Number Verified Successfully!');
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verify OTP Error:', err);
      alert('Error verifying OTP. Please try again.');
    }
  };

  const toggleLocation = (loc) => {
    if (selectedLocations.includes(loc)) {
      setSelectedLocations(selectedLocations.filter((l) => l !== loc));
    } else {
      setSelectedLocations([...selectedLocations, loc]);
    }
  };

  const handleAddKeyword = () => {
    const trimmedInput = newKeywordInput.trim();
    if (trimmedInput && !selectedKeywords.includes(trimmedInput)) {
      setSelectedKeywords([...selectedKeywords, trimmedInput]);
      setNewKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw) => {
    setSelectedKeywords(selectedKeywords.filter((k) => k !== kw));
  };

  const handleSavePreferences = async () => {
    try {
      const updatedPayload = {
        ...companyDetails,
        alertPreferences: {
          locations: selectedLocations,
          keywords: selectedKeywords,
        },
      };

      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPayload),
      });
      const updatedUser = await res.json();
      if (res.ok) {
        setUserData(updatedUser);
        setPrefSaveStatus('Alert preferences saved successfully!');
        setTimeout(() => setPrefSaveStatus(''), 3000);
      } else {
        alert(updatedUser.message || 'Failed to save alert preferences.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving preferences');
    }
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (supportMessage.trim()) {
      setIsSent(true);
      setSupportMessage('');
      setTimeout(() => setIsSent(false), 4000);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        {/* PROFILE HEADER CARD */}
        <div className="profile-header-card">
          <div className="profile-info-left">
            <div className="avatar-circle">{user.initial}</div>
            <div>
              <div className="username-row">
                <h2 className="user-email-text">{user.name}</h2>
                <span className={`badge ${user.isVerified ? 'badge-verified' : 'badge-unverified'}`}>
                  {user.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                </span>
                
                <button className="signout-btn" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
              <p className="full-email">{user.email}</p>
            </div>
          </div>

          <div className="profile-strength-box">
            <div className="strength-header">
              <span>PROFILE STRENGTH</span>
              <span>{user.profileStrength}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${user.profileStrength}%` }}></div>
            </div>
            <p
              className="strength-sub" onClick={() => setActiveTab('Profile')} onKeyDown={(e) => e.key === 'Enter' && setActiveTab('Profile')} role="button" tabIndex={0}> Complete profile to double usage → </p>
          </div>
        </div>

        {/* DASHBOARD TABS */}
        <div className="dashboard-tabs">
          {tabs.map((tab) => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}> {tab}</button>
          ))}
        </div>

        {/* 1. PLANS TAB */}
        {activeTab === 'Plans' && (
          <div className="tab-grid plans-grid">
            <div className="content-card">
              <div className="plans-header">
                <h3>Free</h3>
                <span className="badge badge-verified">YOUR PLAN</span>
              </div>
              <h2 className="plan-price">
                ₹0 <span className="plan-price-sub">forever</span>
              </h2>
              <ul className="promo-features margin-top-16">
                <li><span className="check-icon">✓</span> 300 searches & 50 documents a month</li>
                <li><span className="check-icon">✓</span> 8 bid results & profiles a month</li>
                <li><span className="check-icon">✓</span> 1 Deep Dive report · daily email alerts</li>
              </ul>
            </div>

            <div className="content-card">
              <h3>Paid</h3>
              <h2 className="plan-price">
                ₹5,000 <span className="plan-price-sub">/ year + GST</span>
              </h2>
              <ul className="promo-features margin-top-16">
                <li><span className="check-icon">✓</span> Unlimited searches, documents & profiles</li>
                <li><span className="check-icon">✓</span> Bid amounts always shown · 800 results/mo</li>
                <li><span className="check-icon">✓</span> 8 Deep Dives · unlimited re-opens</li>
              </ul>
              <button className="btn-verify-mobile">Upgrade Plan</button>
            </div>

            <div className="content-card">
              <div className="plans-header">
                <h3>Enterprise</h3>
                <span className="badge plans-enterprise-badge">COMING SOON</span>
              </div>
              <h2 className="plan-price-enterprise">Let’s talk</h2>
              <ul className="promo-features margin-top-16">
                <li><span className="check-icon">✓</span> Everything unlimited, scoped coverage</li>
                <li><span className="check-icon">✓</span> Team logins & priority support</li>
                <li><span className="check-icon">✓</span> Custom intelligence & integrations</li>
              </ul>
              <button className="signout-btn full-width-btn">Talk to us</button>
            </div>
          </div>
        )}

        {/* 2. PROFILE TAB */}
        {activeTab === 'Profile' && (
          <div className="tab-grid">
            <div className="profile-section-column">
              <div className="content-card">
                <div className="card-header">
                  <div>
                    <h3>Company & Contact Details</h3>
                    <span className="sub-muted">Used to send WhatsApp alerts, display on Bidder Page, and match eligible tenders.</span>
                  </div>
                </div>
                <form onSubmit={handleCompanySubmit} className="profile-form">
                  {/* WhatsApp Mobile Number */}
                  <div>
                    <div className="form-label-row">
                      <label className="form-label">WhatsApp Mobile Number</label>
                      {user?.isMobileVerified ? (
                        <span className="badge badge-verified">VERIFIED</span>
                      ) : (
                        <button type="button" onClick={handleSendMobileOtp} className="btn-otp-link"> Verify via OTP</button>
                      )}
                    </div>
                    <input type="text" placeholder="e.g. 9876543210" className="dashboard-input input-with-margin" value={companyDetails.mobileNumber} onChange={(e) => setCompanyDetails({ ...companyDetails, mobileNumber: e.target.value })} required />
                  </div>

                  {showOtpField && (
                    <div className="otp-box">
                      <p className="otp-msg">{otpSentMsg}</p>
                      <div className="otp-input-group">
                        <input type="text" placeholder="Enter 6-digit OTP" className="dashboard-input" value={mobileOtpInput} onChange={(e) => setMobileOtpInput(e.target.value)}/>
                        <button type="button" onClick={handleVerifyMobileOtp} className="btn-verify-mobile"> Verify </button>
                      </div>
                    </div>
                  )}

                  {/* Company Name */}
                  <div>
                    <label className="form-label">Company Name</label>
                    <input type="text" placeholder="Company name" className="dashboard-input input-with-margin" value={companyDetails.companyName} onChange={(e) => setCompanyDetails({ ...companyDetails, companyName: e.target.value })}/>
                  </div>

                  {/* Company Logo */}
                  <div>
                    <label className="form-label">Company Logo</label>
                    <div className="logo-upload-wrapper">
                      <div className="logo-preview-box">
                        {companyDetails.companyLogo ? (
                          <img src={companyDetails.companyLogo} alt="Logo Preview" className="logo-preview-img" />
                        ) : (
                          <span className="logo-fallback-text">No Logo</span>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="dashboard-input logo-file-input"/>
                    </div>
                  </div>

                  {/* Specializations Checklist (Max 3) */}
                  <div>
                    <div className="specialization-header">
                      <label className="form-label">Company Specialization</label>
                      <span className="sub-muted specialization-count">
                        ({companyDetails.specializations?.length || 0}/3 Selected)
                      </span>
                    </div>
                    <div className="specialization-checklist-grid">
                      {AVAILABLE_SPECIALIZATIONS.map((spec) => {
                        const isChecked = companyDetails.specializations?.includes(spec);
                        return (
                          <label key={spec} className={`specialization-checkbox-label ${isChecked ? 'selected' : ''}`}>
                            <input type="checkbox" checked={isChecked} onChange={() => handleSpecializationChange(spec)} disabled={!isChecked && (companyDetails.specializations?.length || 0) >= 3}/>
                            {spec}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operating District / Locations */}
                  <div>
                    <label className="form-label">Operating Locations (District Wise)</label>
                    <div className="district-input-row">
                      <input type="text" placeholder="Enter district name (e.g. Lucknow, Gautam Buddha Nagar)" className="dashboard-input" value={companyDetails.districtInput || ''} onChange={(e) => setCompanyDetails({ ...companyDetails, districtInput: e.target.value })} onKeyDown={handleAddDistrict}
                      />
                      <button
                        type="button" onClick={handleAddDistrict} className="btn-verify-mobile btn-add-district"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Added District Badges Container */}
                    <div className="district-tags-container">
                      {companyDetails.locations?.length > 0 ? (
                        companyDetails.locations.map((dist, idx) => (
                          <span key={idx} className="district-tag-badge">
                            📍 {dist}
                            <button
                              type="button" onClick={() => handleRemoveDistrict(dist)} className="btn-remove-district"> ×</button>
                          </span>
                        ))
                      ) : (
                        <span className="sub-muted no-district-msg">No districts added yet.</span>
                      )}
                    </div>
                  </div>

                  {/* Company Type */}
                  <div>
                    <label className="form-label">Company Type</label>
                    <input
                      type="text" placeholder="e.g. Private Limited, Proprietorship" className="dashboard-input input-with-margin" value={companyDetails.companyType} onChange={(e) => setCompanyDetails({ ...companyDetails, companyType: e.target.value })}
                    />
                  </div>

                  {/* GSTIN */}
                  <div>
                    <label className="form-label">GSTIN</label>
                    <input type="text" placeholder="GSTIN" className="dashboard-input input-with-margin"value={companyDetails.gstin} onChange={(e) => setCompanyDetails({ ...companyDetails, gstin: e.target.value })}
                    />
                  </div>

                  {/* PAN */}
                  <div>
                    <label className="form-label">PAN</label>
                    <input type="text" placeholder="PAN" className="dashboard-input input-with-margin" value={companyDetails.pan} onChange={(e) => setCompanyDetails({ ...companyDetails, pan: e.target.value })}
                    />
                  </div>

                  <button type="submit" disabled={saveLoading} className="btn-verify-mobile save-btn">
                    {saveLoading ? 'Saving...' : isProfileSaved ? '✓ Saved' : 'Save Profile Details'}
                  </button>
                </form>
              </div>

              <div className="content-card">
                <h3>Contact & Notifications</h3>
                <div className="notifications-list">
                  <div className="notification-item">
                    <div>
                      <strong className="notification-title">💬 WhatsApp Tender Alerts</strong>
                      <p className="sub-muted margin-0">
                        Get instant daily tender updates on <strong>{userData?.mobileNumber || 'your mobile number'}</strong>
                      </p>
                    </div>
                    <span className={`badge ${userData?.mobileNumber ? 'badge-verified' : 'badge-inactive'}`}>
                      {userData?.mobileNumber ? 'ACTIVE' : 'ADD MOBILE'}
                    </span>
                  </div>

                  <div className="notification-item">
                    <div>
                      <strong className="notification-title">Daily Email Alert</strong>
                      <p className="sub-muted margin-0">Excel sheet of new matching tenders every morning</p>
                    </div>
                    <span className="badge badge-verified">ON</span>
                  </div>

                  <div className="notification-item">
                    <div>
                      <strong className="notification-title">Closing-date Reminders</strong>
                      <p className="sub-muted margin-0">Reminders sent on WhatsApp before closing</p>
                    </div>
                    <span className="badge plans-enterprise-badge">COMING SOON</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section-column">
              {/* PROFILE CHECKLIST */}
              <div className="content-card">
                <h3>PROFILE CHECKLIST</h3>
                <ul className="promo-features checklist-list">
                  <li><span className="check-icon">✓</span> Sign in with email</li>
                  <li>
                    <span className={userData?.mobileNumber ? 'check-active' : 'check-inactive'}>
                      {userData?.mobileNumber ? '✓' : '○'}
                    </span>{' '}
                    Add WhatsApp Mobile Number
                  </li>
                  <li>
                    <span className={userData?.companyName ? 'check-active' : 'check-inactive'}>
                      {userData?.companyName ? '✓' : '○'}
                    </span>{' '}
                    Add Company Details
                  </li>
                  <li>
                    <span className={companyDetails.companyLogo ? 'check-active' : 'check-inactive'}>
                      {companyDetails.companyLogo ? '✓' : '○'}
                    </span>{' '}
                    Upload Company Logo
                  </li>
                  <li>
                    <span className={(companyDetails.specializations?.length || 0) > 0 ? 'check-active' : 'check-inactive'}>
                      {(companyDetails.specializations?.length || 0) > 0 ? '✓' : '○'}
                    </span>{' '}
                    Add Specializations (Max 3)
                  </li>
                  <li>
                    <span className={(companyDetails.locations?.length || 0) > 0 ? 'check-active' : 'check-inactive'}>
                      {(companyDetails.locations?.length || 0) > 0 ? '✓' : '○'}
                    </span>{' '}
                    Add Operating Districts
                  </li>
                  <li><span className="check-icon">✓</span> Set up WhatsApp alerts</li>
                  <li>
                    <span className={savedBids?.length > 0 ? 'check-active' : 'check-inactive'}>
                      {savedBids?.length > 0 ? '✓' : '○'}
                    </span>{' '}
                    Save your first bid
                  </li>
                </ul>
              </div>

              <div className="content-card promo-card">
                <div className="promo-badge">WHATSAPP ALERTS ACTIVE</div>
                <h4>Instant WhatsApp Updates</h4>
                <p>Never miss a high-value tender opportunity in your state.</p>
              </div>

              <div className="content-card">
                <h3>Refer a bidder</h3>
                <p className="sub-muted margin-bottom-12">Share BidEasy with a colleague.</p>
                <button
                  className="signout-btn full-width-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    alert('Invite link copied to clipboard!');
                  }}
                >
                  Copy invite link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. USAGE TAB */}
        {activeTab === 'Usage' && (
          <div className="usage-tab-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="content-card">
              <div className="card-header">
                <div>
                  <h3>Your plan usage · Email account · this month</h3>
                </div>
              </div>

              <table className="usage-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ padding: '12px 8px' }}>ACTIVITY</th>
                    <th style={{ padding: '12px 8px' }}>QUOTA</th>
                    <th style={{ padding: '12px 8px' }}>USED</th>
                  </tr>
                </thead>
                <tbody>
                  {predefinedUsageMetrics.map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px 8px' }}>{row.activity}</td>
                      <td style={{ padding: '12px 8px' }}>{row.quota}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{row.used}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="sub-muted" style={{ marginTop: '20px', fontSize: '0.9rem', lineHeight: '1.5', color: '#6B7280' }}>
                Besides these monthly quotas, one overall daily limit applies to all activities together. It keeps BidEasy fast and fair for everyone, so it can vary a little with server load. It resets every night at midnight IST.
              </p>
              <p className="sub-muted" style={{ marginTop: '10px', fontSize: '0.9rem', lineHeight: '1.5', color: '#6B7280' }}>
                On the Paid plan, the daily limit sits far above what a full day of tender work needs, so in practice it never gets in your way.{' '}
                <span 
                  onClick={() => setActiveTab('Plans')} 
                  style={{ color: '#2563EB', cursor: 'pointer', fontWeight: '500' }}
                >
                  See the Paid plan →
                </span>
              </p>
            </div>

            {/* DOUBLE YOUR FREE USAGE BANNER CARD */}
            <div className="content-card" style={{ borderLeft: '4px solid #2563EB', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '8px' }}>
                ★ DOUBLE YOUR FREE USAGE
              </div>
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', color: '#111827' }}>Double your free limits</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#374151' }}>
                Verify your mobile once and your free monthly limits double — free.
              </p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: '#4B5563' }}>
                <li>✓ One-time OTP, about a minute</li>
                <li>✓ Number never shown on the site</li>
                <li>✓ No selling, no cold calls</li>
              </ul>

              <button 
                className="btn-verify-mobile"
                onClick={() => setActiveTab('Profile')}
                style={{ width: 'fit-content', padding: '10px 20px' }}
              >
                Verify my mobile
              </button>
            </div>
          </div>
        )}

        {/* 4. MY BIDS TAB */}
        {activeTab === 'My Bids' && (
          <div className="content-card">
            <h3>Saved Bids & Bookmarks</h3>
            <p className="sub-muted">Track all the tenders you have saved or bookmarked for later.</p>
            {savedBids.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No saved bids yet.</p>
                <p style={{ fontSize: '0.9rem' }}>Browse tenders and click "Save Bid" to view them here.</p>
              </div>
            ) : (
              <div className="bids-list" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedBids.map((item, index) => {
                  const itemId = item.id || item.tenderId || item._id || index;
                  return (
                    <div 
                      key={itemId} 
                      style={{  display: 'flex', justifyContent: 'space-between',  alignItems: 'center',  padding: '12px 16px', border: '1px solid #E5E7EB',  borderRadius: '8px', backgroundColor: '#FFFFFF'
                      }}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#111827' }}>
                          {item.title || item.tenderName || 'Untitled Tender'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>
                          {item.authority || item.location || 'Location/Authority N/A'}
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveSavedBid(itemId)}
                        style={{backgroundColor: '#FEE2E2',color: '#EF4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',fontWeight: '500'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. ALERTS TAB */}
        {activeTab === 'Alerts' && (
          <div className="content-card">
            <h3>Tender Alert Preferences</h3>
            <p className="sub-muted">Customize keywords and state locations for daily WhatsApp and email alerts.</p>
            
            <div style={{ marginTop: '20px' }}>
              <label className="form-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                Target Locations (States)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {availableLocations.map((loc) => {
                  const isSelected = selectedLocations.includes(loc);
                  return (
                    <button
                      key={loc} type="button" onClick={() => toggleLocation(loc)} style={{ padding: '6px 14px', borderRadius: '20px', border: isSelected ? '1px solid #2563EB' : '1px solid #D1D5DB', backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF', color: isSelected ? '#2563EB' : '#374151', cursor: 'pointer',  fontWeight: isSelected ? '600' : '400',
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}{loc}</button>
                  );
                })}
              </div>

              <label className="form-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                Alert Keywords
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input type="text"  placeholder="e.g. Solar Panel, Laptops..." className="dashboard-input" value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                />
                <button type="button" onClick={handleAddKeyword} className="btn-verify-mobile"> Add </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {selectedKeywords.map((kw) => (
                  <span
                    key={kw}
                    style={{ backgroundColor: '#F3F4F6', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem', display: 'flex',alignItems: 'center', gap: '6px',
                    }}
                  >
                    {kw}
                    <button type="button" onClick={() => handleRemoveKeyword(kw)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444', fontWeight: 'bold' }}>
                      ×</button>
                  </span>
                ))}
              </div>

              {prefSaveStatus && <p style={{ color: '#059669', marginBottom: '12px' }}>{prefSaveStatus}</p>}

              <button type="button" onClick={handleSavePreferences} className="btn-verify-mobile"> Save Preferences </button>
            </div>
          </div>
        )}

        {/* 6. SUPPORT TAB */}
        {activeTab === 'Support' && (
          <div className="content-card">
            <h3>Help & Support</h3>
            <p className="sub-muted">Facing any issues or need custom assistance? Reach out to us directly.</p>

            <form onSubmit={handleSupportSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">How can we help you?</label>
                <textarea
                  rows="4" className="dashboard-input" placeholder="Describe your issue or feedback..." value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '6px', resize: 'vertical' }}
                ></textarea>
              </div>

              {isSent && (
                <p style={{ color: '#059669', fontWeight: '500' }}>
                  ✓ Your message has been sent. We will get back to you shortly!
                </p>
              )}

              <button type="submit" className="btn-verify-mobile" style={{ width: 'fit-content' }}>
                Send Message
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDashboard;