import React from 'react';

const categories = ['All', 'IT & Hardware', 'Civil & Construction', 'Healthcare', 'Electrical'];

export default function TenderFilterSidebar({ selectedCategory, setSelectedCategory }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6 sticky top-20">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800">Filters</h3>
        <button 
          onClick={() => setSelectedCategory('All')} 
          className="text-xs text-teal-600 hover:text-teal-700 font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          Industry Sector
        </label>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-teal-400 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tender Value Slider */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          Tender Value (₹)
        </label>
        <input 
          type="range" 
          min="100000" 
          max="500000000" 
          className="w-full accent-teal-500 cursor-pointer" 
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>₹1 Lakh</span>
          <span>₹50+ Cr</span>
        </div>
      </div>

      {/* Checkbox Options */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          Key Requirements
        </label>
        <div className="space-y-2 text-sm text-slate-600">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="rounded text-teal-500 focus:ring-teal-400" />
            <span>EMD Exemption Allowed</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="rounded text-teal-500 focus:ring-teal-400" />
            <span>Two-Cover Bidding</span>
          </label>
        </div>
      </div>
    </div>
  );
}