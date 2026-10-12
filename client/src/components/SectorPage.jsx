import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SectorPage.css';

// Dynamic API Base URL (Local aur Live dono ke liye)
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://tender-website-r77f.onrender.com';

export default function SectorPage() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [revealedBids, setRevealedBids] = useState({});
  const [loading, setLoading] = useState(false);

  const sectorsData = [
    {
      id: 'roads-highways',
      title: 'Roads & Highways',
      totalAwards: '17,25,008',
      totalAmount: '₹1,286,000 Cr',
      workTypesCount: 39,
      subCategories: [
        { name: 'Roads & Highways', label: 'All Roads & Highways', amount: '₹1,286,000 Cr' },
        { name: 'Flyover', label: 'Flyovers & Bridges', amount: '₹291,000 Cr' },
        { name: 'Road widening', label: 'Road Widening', amount: '₹267,000 Cr' },
        { name: 'Construction', label: 'Road Construction', amount: '₹162,000 Cr' }
      ]
    },
    {
      id: 'water-irrigation',
      title: 'Water / Irrigation / WSS',
      totalAwards: '14,86,140',
      totalAmount: '₹1,170,000 Cr',
      workTypesCount: 53,
      subCategories: [
        { name: 'Water', label: 'Water Supply', amount: '₹241,000 Cr' },
        { name: 'Irrigation', label: 'Lift Irrigation', amount: '₹141,000 Cr' },
        { name: 'Canal', label: 'Canal Works', amount: '₹126,000 Cr' }
      ]
    },
    {
      id: 'buildings-civil',
      title: 'Buildings / Civil',
      totalAwards: '8,69,042',
      totalAmount: '₹669,000 Cr',
      workTypesCount: 76,
      subCategories: [
        { name: 'Building new major', label: 'Building New Major', amount: '₹146,000 Cr' },
        { name: 'Housing', label: 'Housing', amount: '₹103,000 Cr' },
        { name: 'Commercial development', label: 'Commercial Development', amount: '₹44,701 Cr' },
        { name: 'Other building and civil works', label: 'Other Building & Civil', amount: '₹40,228 Cr' }
      ]
    },
    {
      id: 'supply-goods',
      title: 'Supply / Goods',
      totalAwards: '5,75,192',
      totalAmount: '₹650,000 Cr',
      workTypesCount: 101,
      subCategories: [
        { name: 'Fuel lubricants', label: 'Fuel Lubricants', amount: '₹79,497 Cr' },
        { name: 'Other goods and supply contracts', label: 'Other Goods & Supply', amount: '₹67,301 Cr' },
        { name: 'Vehicles', label: 'Vehicles', amount: '₹53,648 Cr' },
        { name: 'Furniture', label: 'Furniture', amount: '₹43,729 Cr' }
      ]
    },
    {
      id: 'power-electrical',
      title: 'Power / Electrical',
      totalAwards: '3,81,739',
      totalAmount: '₹466,000 Cr',
      workTypesCount: 39,
      subCategories: [
        { name: 'Thermal power', label: 'Thermal Power', amount: '₹66,969 Cr' },
        { name: 'Power transmission lines', label: 'Power Transmission Lines', amount: '₹49,868 Cr' },
        { name: 'Other power and electrical works', label: 'Other Power & Electrical', amount: '₹43,473 Cr' },
        { name: 'Smart metering', label: 'Smart Metering', amount: '₹42,389 Cr' }
      ]
    },
    {
      id: 'industrial-process-plant',
      title: 'Industrial / Process Plant',
      totalAwards: '59,016',
      totalAmount: '₹369,000 Cr',
      workTypesCount: 21,
      subCategories: [
        { name: 'Mining mega', label: 'Mining Mega', amount: '₹266,000 Cr' },
        { name: 'Other industrial and plant works', label: 'Other Industrial & Plant', amount: '₹44,207 Cr' },
        { name: 'Industrial estate', label: 'Industrial Estate', amount: '₹16,789 Cr' },
        { name: 'Process plant', label: 'Process Plant', amount: '₹14,792 Cr' }
      ]
    },
    {
      id: 'bridges-structures',
      title: 'Bridges / Structures',
      totalAwards: '1,97,824',
      totalAmount: '₹327,000 Cr',
      workTypesCount: 21,
      subCategories: [
        { name: 'Medium bridges', label: 'Medium Bridges', amount: '₹56,401 Cr' },
        { name: 'Retaining walls', label: 'Retaining Walls', amount: '₹44,971 Cr' },
        { name: 'Flyover elevated', label: 'Flyover Elevated', amount: '₹38,779 Cr' },
        { name: 'Other bridge and structural works', label: 'Other Bridge & Structural', amount: '₹35,184 Cr' }
      ]
    },
    {
      id: 'civic-administration',
      title: 'Civic / Administration / Other',
      totalAwards: '3,03,400',
      totalAmount: '₹246,000 Cr',
      workTypesCount: 34,
      subCategories: [
        { name: 'Other civic and municipal works', label: 'Other Civic & Municipal', amount: '₹145,000 Cr' },
        { name: 'Smart city', label: 'Smart City', amount: '₹65,522 Cr' },
        { name: 'Parking lot', label: 'Parking Lot', amount: '₹8,046 Cr' },
        { name: 'Gates and arches', label: 'Gates & Arches', amount: '₹5,026 Cr' }
      ]
    },
    {
      id: 'services-manpower',
      title: 'Services / Manpower / O&M',
      totalAwards: '1,71,562',
      totalAmount: '₹219,000 Cr',
      workTypesCount: 10,
      subCategories: [
        { name: 'Consultancy and advisory', label: 'Consultancy & Advisory', amount: '₹74,636 Cr' },
        { name: 'Financial services', label: 'Financial Services', amount: '₹59,673 Cr' },
        { name: 'Manpower and O&M services', label: 'Manpower & O&M Services', amount: '₹50,561 Cr' },
        { name: 'Other services and manpower contracts', label: 'Other Services & Manpower', amount: '₹11,439 Cr' }
      ]
    },
    {
      id: 'railway-metro',
      title: 'Railway / Metro',
      totalAwards: '14,665',
      totalAmount: '₹203,000 Cr',
      workTypesCount: 21,
      subCategories: [
        { name: 'Metro rail', label: 'Metro Rail', amount: '₹70,701 Cr' },
        { name: 'Other railway and metro works', label: 'Other Railway & Metro', amount: '₹45,185 Cr' },
        { name: 'Railway track laying', label: 'Railway Track Laying', amount: '₹19,165 Cr' },
        { name: 'Railway parts', label: 'Railway Parts', amount: '₹18,986 Cr' }
      ]
    },
    {
      id: 'medical-health',
      title: 'Medical / Health',
      totalAwards: '1,30,369',
      totalAmount: '₹191,000 Cr',
      workTypesCount: 14,
      subCategories: [
        { name: 'Hospital medical college', label: 'Hospital Medical College', amount: '₹61,363 Cr' },
        { name: 'Hospital district', label: 'Hospital District', amount: '₹34,948 Cr' },
        { name: 'Community health centres', label: 'Community Health Centres', amount: '₹18,286 Cr' },
        { name: 'Medical supply', label: 'Medical Supply', amount: '₹16,087 Cr' }
      ]
    },
    {
      id: 'education-institutional',
      title: 'Education / Institutional',
      totalAwards: '2,25,457',
      totalAmount: '₹178,000 Cr',
      workTypesCount: 12,
      subCategories: [
        { name: 'New school buildings', label: 'New School Buildings', amount: '₹62,280 Cr' },
        { name: 'Schools and colleges', label: 'Schools & Colleges', amount: '₹49,484 Cr' },
        { name: 'School hostels', label: 'School Hostels', amount: '₹29,621 Cr' },
        { name: 'Other education and institutional works', label: 'Other Education & Institutional', amount: '₹9,815 Cr' }
      ]
    },
    {
      id: 'mining-quarrying',
      title: 'Mining / Quarrying',
      totalAwards: '16,400',
      totalAmount: '₹155,000 Cr',
      workTypesCount: 4,
      subCategories: [
        { name: 'Mining', label: 'Mining', amount: '₹146,000 Cr' },
        { name: 'Sand ghat', label: 'Sand Ghat', amount: '₹6,768 Cr' },
        { name: 'Mining site works', label: 'Mining Site Works', amount: '₹2,084 Cr' },
        { name: 'Other mining and quarrying works', label: 'Other Mining & Quarrying', amount: '₹717 Cr' }
      ]
    },
    {
      id: 'dams-hydro',
      title: 'Dams / Hydro / Major Water Infra',
      totalAwards: '10,015',
      totalAmount: '₹113,000 Cr',
      workTypesCount: 3,
      subCategories: [
        { name: 'Dam', label: 'Dam', amount: '₹64,954 Cr' },
        { name: 'Hydro renewable', label: 'Hydro Renewable', amount: '₹41,956 Cr' },
        { name: 'Other dam and hydro works', label: 'Other Dam & Hydro Works', amount: '₹6,157 Cr' }
      ]
    },
    {
      id: 'defence-paramilitary',
      title: 'Defence / Paramilitary',
      totalAwards: '99,953',
      totalAmount: '₹106,000 Cr',
      workTypesCount: 6,
      subCategories: [
        { name: 'Military accommodation', label: 'Military Accommodation', amount: '₹75,403 Cr' },
        { name: 'Defence security', label: 'Defence Security', amount: '₹16,205 Cr' },
        { name: 'Airfield apron', label: 'Airfield Apron', amount: '₹7,344 Cr' },
        { name: 'Other defence and paramilitary works', label: 'Other Defence & Paramilitary', amount: '₹5,708 Cr' }
      ]
    },
    {
      id: 'it-ict',
      title: 'IT / ICT',
      totalAwards: '44,531',
      totalAmount: '₹93,591 Cr',
      workTypesCount: 17,
      subCategories: [
        { name: 'IT software', label: 'IT Software', amount: '₹26,701 Cr' },
        { name: 'IT networking', label: 'IT Networking', amount: '₹20,262 Cr' },
        { name: 'Other IT and ICT contracts', label: 'Other IT & ICT Contracts', amount: '₹8,777 Cr' },
        { name: 'Optical fibre cable', label: 'Optical Fibre Cable', amount: '₹7,667 Cr' }
      ]
    },
    {
      id: 'unclassified',
      title: 'Unclassified',
      totalAwards: '84,676',
      totalAmount: '₹79,445 Cr',
      workTypesCount: 7,
      subCategories: [
        { name: 'Other awarded contracts', label: 'Other Awarded Contracts', amount: '₹76,390 Cr' },
        { name: 'Agriculture', label: 'Agriculture', amount: '₹1,887 Cr' },
        { name: 'Rural development', label: 'Rural Development', amount: '₹671 Cr' },
        { name: 'Scanner', label: 'Scanner', amount: '₹307 Cr' }
      ]
    },
    {
      id: 'oil-gas',
      title: 'Oil & Gas / Petrochem / Refinery',
      totalAwards: '10,541',
      totalAmount: '₹60,485 Cr',
      workTypesCount: 2,
      subCategories: [
        { name: 'Refinery', label: 'Refinery', amount: '₹38,159 Cr' },
        { name: 'Other oil, gas and refinery works', label: 'Other Oil, Gas & Refinery', amount: '₹22,325 Cr' }
      ]
    },
    {
      id: 'parks-horticulture',
      title: 'Parks / Horticulture',
      totalAwards: '1,32,500',
      totalAmount: '₹50,835 Cr',
      workTypesCount: 11,
      subCategories: [
        { name: 'Park garden', label: 'Park Garden', amount: '₹18,283 Cr' },
        { name: 'Park landscaping', label: 'Park Landscaping', amount: '₹8,729 Cr' },
        { name: 'Afforestation and plantation', label: 'Afforestation & Plantation', amount: '₹8,632 Cr' },
        { name: 'Other parks and horticulture works', label: 'Other Parks & Horticulture', amount: '₹8,343 Cr' }
      ]
    },
    {
      id: 'waste-management',
      title: 'Waste Management',
      totalAwards: '44,199',
      totalAmount: '₹46,621 Cr',
      workTypesCount: 9,
      subCategories: [
        { name: 'Waste collection', label: 'Waste Collection', amount: '₹12,660 Cr' },
        { name: 'Waste landfill', label: 'Waste Landfill', amount: '₹11,359 Cr' },
        { name: 'Waste management', label: 'Waste Management', amount: '₹5,998 Cr' },
        { name: 'Waste processing', label: 'Waste Processing', amount: '₹5,755 Cr' }
      ]
    },
    {
      id: 'ports-maritime',
      title: 'Ports / Maritime / Navigation',
      totalAwards: '6,942',
      totalAmount: '₹45,702 Cr',
      workTypesCount: 6,
      subCategories: [
        { name: 'Port', label: 'Port', amount: '₹22,828 Cr' },
        { name: 'Other port and maritime works', label: 'Other Port & Maritime', amount: '₹21,551 Cr' },
        { name: 'Boat ship', label: 'Boat Ship', amount: '₹1,142 Cr' },
        { name: 'Marine equipment', label: 'Marine Equipment', amount: '₹111 Cr' }
      ]
    },
    {
      id: 'heritage-conservation',
      title: 'Heritage / Conservation / ASI',
      totalAwards: '40,088',
      totalAmount: '₹34,744 Cr',
      workTypesCount: 10,
      subCategories: [
        { name: 'Temples and religious buildings', label: 'Temples & Religious Buildings', amount: '₹15,035 Cr' },
        { name: 'Museum construction', label: 'Museum Construction', amount: '₹10,824 Cr' },
        { name: 'Other heritage and conservation works', label: 'Other Heritage & Conservation', amount: '₹3,581 Cr' },
        { name: 'Museum heritage', label: 'Museum Heritage', amount: '₹2,213 Cr' }
      ]
    },
    {
      id: 'real-estate-land',
      title: 'Real Estate / Land',
      totalAwards: '3,574',
      totalAmount: '₹13,943 Cr',
      workTypesCount: 2,
      subCategories: [
        { name: 'Land plot', label: 'Land Plot', amount: '₹13,624 Cr' },
        { name: 'Other land and real estate contracts', label: 'Other Land & Real Estate', amount: '₹320 Cr' }
      ]
    },
    {
      id: 'nuclear-atomic',
      title: 'Nuclear / Atomic / Strategic',
      totalAwards: '792',
      totalAmount: '₹13,253 Cr',
      workTypesCount: 1,
      subCategories: [
        { name: 'Other nuclear and strategic works', label: 'Other Nuclear & Strategic Works', amount: '₹13,253 Cr' }
      ]
    },
    {
      id: 'not-specified-nit',
      title: 'Not Specified in NIT',
      totalAwards: '21,299',
      totalAmount: '₹7,484 Cr',
      workTypesCount: 1,
      subCategories: [
        { name: 'Other awarded contracts', label: 'Other Awarded Contracts', amount: '₹7,484 Cr' }
      ]
    }
  ];

  // Updated Fetch Function passing sector title & subcategory name with dynamic base URL
  const fetchCategoryTenders = async (sectorTitle, subCatName) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/tenders/search?category=${encodeURIComponent(sectorTitle)}&subCategory=${encodeURIComponent(subCatName)}`
      );
      const result = await res.json();
      if (result.success) {
        setTenders(result.data || []);
      } else {
        setTenders([]);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setTenders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubCategoryClick = (sector, subCat) => {
    setSelectedSector(sector);
    setSelectedSubCategory(subCat);
    setCurrentLevel(3);
    fetchCategoryTenders(sector.title, subCat.name);
  };

  const handleRevealToggle = (tenderId) => {
    setRevealedBids((prev) => ({
      ...prev,
      [tenderId]: !prev[tenderId]
    }));
  };

  const handleOpenPage = (tenderId) => {
    navigate(`/tender-detail/${tenderId}`);
  };

  return (
    <div className="sector-container">
      {/* Header */}
      <div className='heroSector'>
        <img src='https://th.bing.com/th/id/OIG3.8gAUnCiyzS4JneSWW0GF?pid=ImgGn' alt='hero' />
      </div>
      <div className="sector-header">
        <div>
          <h1 className="sector-title">Sector Intelligence Hub</h1>
          <p className="sector-subtitle">Explore sector breakdowns, live tenders, and awarded bids</p>
        </div>

        {currentLevel > 1 && (
          <button className="back-btn" onClick={() => setCurrentLevel(1)}>
            ← Back to All Sectors
          </button>
        )}
      </div>

      {/* LEVEL 1: SECTORS OVERVIEW */}
      {currentLevel === 1 && (
        <div className="sector-grid">
          {sectorsData.map((sec) => (
            <div key={sec.id} className="sector-card">
              <div className="sector-card-header">
                <div>
                  <h2 className="sector-card-title">{sec.title}</h2>
                  <span className="sector-card-count">{sec.workTypesCount} Work Categories</span>
                </div>
                <div>
                  <div className="sector-card-amount">{sec.totalAmount}</div>
                  <div className="sector-card-awards">{sec.totalAwards} Awards</div>
                </div>
              </div>

              <div className="divider" />

              <div className="chips-wrapper">
                {sec.subCategories.map((sub, idx) => (
                  <button
                    key={idx}
                    className="subcat-chip"
                    onClick={() => handleSubCategoryClick(sec, sub)}
                  >
                    <span>{sub.label || sub.name}</span>
                    <span className="chip-amount">{sub.amount}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEVEL 3: TENDERS CARDS LIST */}
      {currentLevel === 3 && (
        <div>
          <div className="active-banner">
            ● Displaying Live Records for: <u>{selectedSubCategory?.label || selectedSubCategory?.name}</u> ({selectedSector?.title})
          </div>

          {loading ? (
            <div className="no-records">⏳ Fetching live tenders from database...</div>
          ) : (
            <div className="tender-grid">
              {tenders.length > 0 ? (
                tenders.map((item) => {
                  const isRevealed = revealedBids[item._id];
                  const costValue = item.financials?.estimatedCost || item.financials?.budget || 0;

                  return (
                    <div key={item._id} className="tender-card">
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="tender-badge">TENDER</span>
                          <span className="tender-id">{item.tenderId}</span>
                        </div>

                        <h3 className="tender-card-title">{item.title}</h3>
                        <p className="tender-dept">
                          {item.department}
                          <strong style={{ color: '#334155' }}>{item.location?.state}</strong>
                        </p>

                        {/* Bidder Card */}
                        <div className="bidder-box">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="bidder-winner-tag">L1 WINNER</span>
                            <span className={`bidder-name ${isRevealed ? 'revealed' : 'masked'}`}>
                              {isRevealed ? 'L&T Infrastructure Ltd.' : '██████████████'}
                            </span>
                            <span className="bidder-amount">
                              {isRevealed ? `₹ ${costValue.toLocaleString('en-IN')}` : '₹ ██,██,███'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="btn-wrapper">
                        <button className="btn-reveal" onClick={() => handleRevealToggle(item._id)}>
                          {isRevealed ? 'HIDE DETAILS' : 'REVEAL ➔'}
                        </button>

                        <button className="btn-open" onClick={() => handleOpenPage(item._id)}>
                          OPEN PAGE ➔
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-records">No active tender records found for this selection.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}