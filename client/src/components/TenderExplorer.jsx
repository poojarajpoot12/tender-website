import React, { useState } from 'react';
import TenderFilterSidebar from './TenderFilterSidebar';
import TenderCard from './TenderCard';
import BidModal from './BidModal';

const sampleTenders = [
  {
    id: 'TND-2026-8902',
    title: 'Supply & Installation of High-Performance Data Center Servers',
    organization: 'Ministry of Electronics & IT',
    category: 'IT & Hardware',
    location: 'New Delhi',
    value: '₹2,40,00,000',
    emd: '₹4,80,000',
    closingDate: '24 Sep 2026',
    status: 'LIVE',
    twoBidSystem: true,
    emdExemption: true
  },
  {
    id: 'TND-2026-4411',
    title: 'Construction of 4-Lane Highway Bypass (Phase II)',
    organization: 'National Highways Authority of India',
    category: 'Civil & Construction',
    location: 'Maharashtra',
    value: '₹45,00,00,000',
    emd: '₹90,00,000',
    closingDate: '18 Sep 2026',
    status: 'EXPIRING SOON',
    twoBidSystem: true,
    emdExemption: false
  },
  {
    id: 'TND-2026-1049',
    title: 'Procurement of Medical Imaging Equipment for City Hospital',
    organization: 'Department of Health & Family Welfare',
    category: 'Healthcare',
    location: 'Karnataka',
    value: '₹85,00,000',
    emd: '₹1,70,000',
    closingDate: '02 Oct 2026',
    status: 'LIVE',
    twoBidSystem: false,
    emdExemption: true
  }
];

export default function TenderExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTender, setSelectedTender] = useState(null);

  const filteredTenders = sampleTenders.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header / Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-500 text-slate-900 font-bold p-2 rounded-lg text-lg">TP</div>
            <span className="text-xl font-bold tracking-tight">TenderHub <span className="text-teal-400 text-xs px-2 py-0.5 bg-slate-800 rounded-full border border-teal-500/30">PROCURIFY</span></span>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
            <a href="#explore" className="text-white hover:text-teal-400 transition">Explore Tenders</a>
            <a href="#categories" className="hover:text-teal-400 transition">Categories</a>
            <a href="#howitworks" className="hover:text-teal-400 transition">How It Works</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="text-sm font-medium text-slate-300 hover:text-white">Login</button>
            <button className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm">
              Register Company
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar & Quick Stats Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Find & Bid on Official Tenders</h1>
            <p className="text-slate-400 mb-6 text-sm sm:text-base">Real-time procurement database with end-to-end encryption.</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search by Keyword, Tender ID, or Department..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition">
                Search Bids
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Grid Layout: Filter Sidebar + Tender Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-1">
            <TenderFilterSidebar 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory} 
            />
          </div>

          {/* Right Results Section */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-sm font-medium text-slate-600">
                Showing <strong className="text-slate-900">{filteredTenders.length}</strong> active tenders
              </span>
              <select className="text-sm border-slate-200 border rounded-lg px-3 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option>Sort by: Closing Date (Soonest)</option>
                <option>Sort by: Highest Value</option>
                <option>Sort by: Newest First</option>
              </select>
            </div>

            {/* List Cards */}
            {filteredTenders.map((tender) => (
              <TenderCard 
                key={tender.id} 
                tender={tender} 
                onSelect={() => setSelectedTender(tender)} 
              />
            ))}
          </div>
        </div>
      </main>

      {/* Bid Details & Application Modal */}
      {selectedTender && (
        <BidModal 
          tender={selectedTender} 
          onClose={() => setSelectedTender(null)} 
        />
      )}
    </div>
  );
}