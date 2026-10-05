import React from 'react';

export default function TenderCard({ tender, onSelect }) {
  const isExpiring = tender.status === 'EXPIRING SOON';

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
          {tender.id}
        </span>
        <div className="flex items-center space-x-2">
          {tender.emdExemption && (
            <span className="text-xs font-medium px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-md">
              EMD Exempted
            </span>
          )}
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
            isExpiring ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {tender.status}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1 hover:text-teal-600 cursor-pointer transition" onClick={onSelect}>
        {tender.title}
      </h3>
      <p className="text-sm text-slate-500 mb-4">{tender.organization} • <span className="text-slate-700 font-medium">{tender.location}</span></p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
        <div>
          <span className="text-xs text-slate-400 block uppercase font-medium">Est. Value</span>
          <span className="text-sm font-bold text-slate-800">{tender.value}</span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block uppercase font-medium">EMD Deposit</span>
          <span className="text-sm font-semibold text-slate-700">{tender.emd}</span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block uppercase font-medium">Submission Deadline</span>
          <span className="text-sm font-semibold text-rose-600">{tender.closingDate}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1">
          📄 Download NIT (PDF)
        </button>
        <button 
          onClick={onSelect}
          className="bg-slate-900 hover:bg-slate-800 text-teal-400 px-5 py-2 rounded-xl text-sm font-semibold transition"
        >
          View & Apply Bid →
        </button>
      </div>
    </div>
  );
}