// backend/routes/adminTenderRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const Tender = require('../models/Tender');

const upload = multer({ dest: 'uploads/' });

function escapeRegex(text) {
  return text ? text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") : "";
}

// ==========================================
// 1. SEARCH & FILTER TENDERS
// ==========================================
router.get('/tenders/search', async (req, res) => {
  try {
    const { category, subCategory, q } = req.query;
    let queryConditions = {};

    const searchTerms = [];
    if (category) searchTerms.push(escapeRegex(category));
    if (subCategory) searchTerms.push(escapeRegex(subCategory));
    if (q) searchTerms.push(escapeRegex(q));

    if (searchTerms.length > 0) {
      const orConditions = searchTerms.flatMap((term) => [
        { category: { $regex: new RegExp(term, 'i') } },
        { sector: { $regex: new RegExp(term, 'i') } },
        { title: { $regex: new RegExp(term, 'i') } },
        { department: { $regex: new RegExp(term, 'i') } },
        { authorityName: { $regex: new RegExp(term, 'i') } }
      ]);

      queryConditions.$or = orConditions;
    }

    const tenders = await Tender.find(queryConditions).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tenders.length, data: tenders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. EXCEL UPLOAD ROUTE (FIXED SCHEMA & UPSERT)
// ==========================================
router.post('/upload-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Kripya Excel ya CSV file select karein!' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Cleanup uploaded temp file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel file khali hai!' });
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const [index, row] of rawData.entries()) {
      const rawTenderId = row['Tender ID'] || row['tenderId'] || `TND-${Date.now()}-${index}`;
      const title = row['Title'] || row['title'] || 'Untitled Tender';
      const authority = row['Authority'] || row['authorityName'] || row['Department'] || row['department'] || 'Government Authority';

      // Parse Dates safely
      const closeVal = row['submissionClose'] || row['Deadline'] || row['closingDate'] || row['Closing Date'];
      const closingDateParsed = closeVal ? new Date(closeVal) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const pubVal = row['publishedDate'] || row['Published Date'];
      const publishedDateParsed = pubVal ? new Date(pubVal) : new Date();

      // Normalize Status
      const rawStatus = row['Status'] || row['status'] || 'ACTIVE';
      const normalizedStatus = String(rawStatus).toUpperCase().trim().includes('LIVE') ? 'ACTIVE' : 'ACTIVE';

      // Fully Map to Upgraded Tender Model
      const tenderPayload = {
        tenderId: String(rawTenderId).trim(),
        refNumber: String(row['refNumber'] || row['Ref Number'] || rawTenderId).trim(),
        title: String(title).trim(),
        portalSource: String(row['portalSource'] || row['Portal Source'] || 'CPSE eProcurement').trim(),
        authorityName: String(authority).trim(),
        department: String(row['Department'] || row['department'] || authority).trim(),
        authorityType: String(row['authorityType'] || 'PSU').trim().toUpperCase(),
        
        tenderType: String(row['tenderType'] || row['Tender Type'] || 'Works').trim(),
        sector: String(row['sector'] || row['Sector'] || row['category'] || 'Roads & Highways').trim(),
        subCategory: String(row['category'] || row['Category'] || 'Civil Works').trim(),
        scheme: String(row['scheme'] || '').trim(),

        location: {
          state: String(row['state'] || row['State'] || 'Delhi').trim(),
          city: String(row['location'] || row['Location'] || row['city'] || 'New Delhi').trim(),
          pincode: String(row['pinCode'] || row['PIN'] || '110001').trim()
        },

        financials: {
          estimatedCost: Number(row['estimatedCost'] || row['Budget'] || row['budget'] || 0),
          emdAmount: Number(row['emdAmount'] || row['EMD'] || row['emd'] || 0),
          tenderFee: Number(row['tenderFee'] || row['Tender Fee'] || 0),
          isEstValue: false
        },

        dates: {
          publishedDate: isNaN(publishedDateParsed.getTime()) ? new Date() : publishedDateParsed,
          closingDate: isNaN(closingDateParsed.getTime()) ? new Date() : closingDateParsed
        },

        stage: String(row['stage'] || 'LIVE').toUpperCase(),
        status: normalizedStatus,
        invitingOfficer: String(row['invitingOfficer'] || '').trim(),
        paymentMode: String(row['paymentMode'] || 'Offline').trim()
      };

      // Safe Upsert (Prevents Duplicate ID Crashes)
      const result = await Tender.updateOne(
        { tenderId: tenderPayload.tenderId },
        { $set: tenderPayload },
        { upsert: true }
      );

      if (result.upsertedCount > 0) insertedCount++;
      else updatedCount++;
    }

    res.status(200).json({
      success: true,
      message: `Excel Bulk Sync Successful! Inserted: ${insertedCount}, Updated: ${updatedCount}`
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('❌ Excel Upload Failed Error:', error);
    res.status(500).json({ success: false, message: `Upload Error: ${error.message}` });
  }
});

// ==========================================
// 3. GOOGLE SHEET DIRECT SYNC
// ==========================================
router.post('/sync-google-sheet', async (req, res) => {
  try {
    const { sheetId } = req.body;
    if (!sheetId) {
      return res.status(400).json({ success: false, message: 'Google Sheet ID zaroori hai!' });
    }

    const sheetCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(sheetCsvUrl);
    
    if (!response.ok) throw new Error('Google Sheet fetch nahi ho saki.');

    const csvText = await response.text();
    const workbook = xlsx.read(csvText, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const [index, row] of rawData.entries()) {
      const rawTenderId = row['Tender ID'] || row['tenderId'] || `GS-${Date.now()}-${index}`;
      const title = row['Title'] || row['title'] || 'Untitled Tender';
      const authority = row['Authority'] || row['Department'] || 'Government Authority';

      const tenderPayload = {
        tenderId: String(rawTenderId).trim(),
        refNumber: String(row['refNumber'] || rawTenderId).trim(),
        title: String(title).trim(),
        portalSource: 'Google Sheet Sync',
        authorityName: String(authority).trim(),
        department: String(authority).trim(),
        sector: String(row['Sector'] || row['category'] || 'Roads & Highways').trim(),
        
        location: { state: String(row['State'] || row['state'] || 'Delhi').trim() },
        financials: { estimatedCost: Number(row['Budget'] || row['budget'] || 0) },
        dates: { closingDate: row['Deadline'] ? new Date(row['Deadline']) : new Date() },
        status: 'ACTIVE'
      };

      await Tender.updateOne(
        { tenderId: tenderPayload.tenderId },
        { $set: tenderPayload },
        { upsert: true }
      );
    }

    res.status(200).json({ success: true, message: `${rawData.length} Tenders synced successfully!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. GET ALL TENDERS
// ==========================================
router.get('/tenders', async (req, res) => {
  try {
    const tenders = await Tender.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tenders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. SECTOR SUMMARY AGGREGATION
// ==========================================
router.get('/sectors/summary', async (req, res) => {
  try {
    const summary = await Tender.aggregate([
      {
        $group: {
          _id: "$sector",
          totalAwards: { $sum: 1 },
          totalBudget: { 
            $sum: { $ifNull: ["$financials.estimatedCost", 0] } 
          },
          statesCount: { $addToSet: "$location.state" }
        }
      },
      {
        $project: {
          category: "$_id",
          totalAwards: 1,
          totalBudget: 1,
          statesCount: { $size: "$statesCount" }
        }
      }
    ]);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;