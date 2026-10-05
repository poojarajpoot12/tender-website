import React from 'react';
import '../css/SectorSlider.css'; // Apni CSS file import karein

const sectors = [
  { id: 1, name: 'IT & Software', icon: '💻' },
  { id: 2, name: 'Healthcare', icon: '🏥' },
  { id: 3, name: 'Construction', icon: '🏗️' },
  { id: 4, name: 'Education', icon: '🎓' },
  { id: 5, name: 'Finance', icon: '🏦' },
  { id: 6, name: 'Manufacturing', icon: '🏭' },
  { id: 7, name: 'Telecommunication', icon: '📡' },
  { id: 8, name: 'Energy & Power', icon: '⚡' }
];

const SectorSlider = () => {
  // Infinite scroll continuous dikhane ke liye list ko duplicate karenge
  const doubleSectors = [...sectors, ...sectors];

  return (
    <div className="sectors-slider-section">
      <div className="slider-header">
        <h3>Explore Key Sectors</h3>
      </div>

      <div className="slider-container">
        <div className="slider-track">
          {doubleSectors.map((sector, index) => (
            <div key={index} className="sector-slide-card">
              <span className="sector-icon">{sector.icon}</span>
              <span className="sector-name">{sector.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectorSlider;