import React, { useState } from 'react';
import '../css/AdminBulkUpload.css';

// Dynamic API Base URL (Local aur Live dono ke liye)
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://tender-website-r77f.onrender.com';

export default function AdminBulkUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [sheetId, setSheetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [statusType, setStatusType] = useState('success');

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Pehle koi Excel (.xlsx ya .csv) file select karein!');

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/upload-excel`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message || 'Excel File Uploaded Successfully!');
      setStatusType('success');
    } catch (err) {
      setMessage('Excel Upload failed!');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSheetSync = async (e) => {
    e.preventDefault();
    if (!sheetId.trim()) return alert('Pehle Google Sheet ID daalein!');

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sync-google-sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetId: sheetId.trim() }),
      });
      const data = await res.json();
      setMessage(data.message || 'Google Sheet Synced Successfully!');
      setStatusType('success');
    } catch (err) {
      setMessage('Google Sheet Sync failed!');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-upload-container">
      <div className="admin-upload-header">
        <h2>📁 Bulk Data Ingestion Hub</h2>
        <p>Aap neeche diye gaye dono tariko me se kisi se bhi bulk tenders upload kar sakte hain.</p>
      </div>

      {message && (
        <div className={`upload-alert-message ${statusType}`}>
          <span>{statusType === 'success' ? '✅' : '⚠️'}</span>
          <strong>{message}</strong>
        </div>
      )}

      {/* OPTION 1 CARD */}
      <div className="upload-card-wrapper">
        <div className="card-title-group">
          <h3>📊 Option 1: Excel / CSV File Upload</h3>
          <p>Apni laptop se `.xlsx` ya `.csv` file select karke ek click me upload karein.</p>
        </div>

        <form onSubmit={handleExcelUpload} className="upload-form-row">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="custom-file-input"
          />
          <button type="submit" disabled={loading} className="upload-action-btn btn-excel">
            {loading ? 'Uploading...' : '⚡ Upload Excel'}
          </button>
        </form>
      </div>

      {/* OPTION 2 CARD */}
      <div className="upload-card-wrapper">
        <div className="card-title-group">
          <h3>🟢 Option 2: Live Google Sheet Direct Sync</h3>
          <p>
            Google Sheet ka ID (URL me se <code>spreadsheets/d/<b>ID_HERE</b>/edit</code>) yahan paste karke sync karein.
          </p>
        </div>

        <form onSubmit={handleGoogleSheetSync} className="upload-form-row">
          <input
            type="text"
            placeholder="Paste Google Sheet ID..."
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            className="custom-text-input"
          />
          <button type="submit" disabled={loading} className="upload-action-btn btn-google">
            {loading ? 'Syncing...' : '🔄 Sync Google Sheet'}
          </button>
        </form>
      </div>

      {/* Formatting Guide Box */}
      <div className="formatting-guide-box">
        <h4>📌 Important Formatting Instructions:</h4>
        <ul>
          <li>Ensure column headers match: <b>ID, Title, Sector, State, Deadline</b>.</li>
          <li>Date formats should ideally be in YYYY-MM-DD.</li>
        </ul>
      </div>
    </div>
  );
}