import React from 'react';

export default function BidModal({ tender, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
        >
          ✕
        </button>

        <span className="text-xs font-mono bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md border border-teal-200">
          {tender.id}
        </span>

        <h2 className="text-xl font-bold text-slate-900 mt-2 mb-2">{tender.title}</h2>
        <p className="text-sm text-slate-500 mb-6">{tender.organization}</p>

        {/* Dynamic Detail Steps */}
        <div className="space-y-4 text-sm border-t border-b border-slate-100 py-4 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500">Industry Category:</span>
            <span className="font-medium text-slate-800">{tender.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated Project Budget:</span>
            <span className="font-bold text-slate-900">{tender.value}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Required Earnest Money (EMD):</span>
            <span className="font-medium text-slate-800">{tender.emd}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Final Submission Date:</span>
            <span className="font-bold text-rose-600">{tender.closingDate}</span>
          </div>
        </div>

        {/* Vendor Action Prompt */}
        <div className="bg-slate-50 p-4 rounded-xl mb-6">
          <h4 className="font-semibold text-slate-800 mb-1">Bid Submission Requirements</h4>
          <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
            <li>Digital Signature Certificate (DSC Class 3) required for upload.</li>
            <li>Encrypted Technical Cover & Financial BOQ files.</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-6 py-2 rounded-xl text-sm font-bold shadow-md transition">
            Proceed to Online Bidding →
          </button>
        </div>
      </div>
    </div>
  );
}