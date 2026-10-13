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
// 1. SEARCH & FILTER TENDERS (Flat Schema)
// ==========================================
router.get('/tenders/search', async (req, res) => {
  try {
    const { category, subCategory, q } = req.query;
    let queryConditions = { isActive: true };

    const searchTerms = [];
    if (category) searchTerms.push(escapeRegex(category));
    if (subCategory) searchTerms.push(escapeRegex(subCategory));
    if (q) searchTerms.push(escapeRegex(q));

    if (searchTerms.length > 0) {
      const orConditions = searchTerms.flatMap((term) => [
        { category: { $regex: new RegExp(term, 'i') } },
        { subCategory: { $regex: new RegExp(term, 'i') } },
        { title: { $regex: new RegExp(term, 'i') } },
        { agencyName: { $regex: new RegExp(term, 'i') } },
        { tenderNumber: { $regex: new RegExp(term, 'i') } }
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
// 2. EXCEL UPLOAD ROUTE (Updated for Flat Schema)
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
      const rawTenderNumber = row['Tender Number'] || row['tenderNumber'] || row['Tender ID'] || row['tenderId'] || `TND-${Date.now()}-${index}`;
      const title = row['Title'] || row['title'] || 'Untitled Tender';
      const agency = row['Agency Name'] || row['agencyName'] || row['Authority'] || row['Department'] || 'Government Authority';

      // Parse Dates safely
      const closeVal = row['submissionDate'] || row['Submission Date'] || row['Deadline'] || row['closingDate'];
      const submissionDateParsed = closeVal ? new Date(closeVal) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const pubVal = row['publicDate'] || row['Public Date'] || row['publishedDate'];
      const publicDateParsed = pubVal ? new Date(pubVal) : new Date();

      // Fully Map to Flat Tender Model Fields
      const tenderPayload = {
        tenderNumber: String(rawTenderNumber).trim(),
        tenderID: String(row['tenderID'] || row['TenderID'] || rawTenderNumber).trim(),
        title: String(title).trim(),
        workDescription: String(row['workDescription'] || row['Work Description'] || row['Description'] || '').trim(),
        searchKeyword: String(row['searchKeyword'] || '').trim(),
        laguage: String(row['laguage'] || 'English').trim(),

        publicDate: isNaN(publicDateParsed.getTime()) ? new Date() : publicDateParsed,
        submissionDate: isNaN(submissionDateParsed.getTime()) ? new Date() : submissionDateParsed,
        openingDate: row['openingDate'] ? new Date(row['openingDate']) : new Date(),

        tenderValue: Number(row['tenderValue'] || row['Tender Value'] || row['Budget'] || 0),
        emdValue: Number(row['emdValue'] || row['EMD'] || 0),
        documentValue: Number(row['documentValue'] || row['Document Value'] || 0),

        agencyName: String(agency).trim(),
        stateName: String(row['stateName'] || row['State'] || 'Delhi').trim(),
        location: String(row['location'] || row['Location'] || 'New Delhi').trim(),
        address: String(row['address'] || '').trim(),
        pinCode: String(row['pinCode'] || row['PIN'] || '110001').trim(),
        country: String(row['country'] || 'India').trim(),

        tenderType: String(row['tenderType'] || row['Tender Type'] || 'Works').trim(),
        tenderCategory: String(row['tenderCategory'] || '').trim(),
        category: String(row['category'] || row['Category'] || 'Civil Works').trim(),
        subCategory: String(row['subCategory'] || row['SubCategory'] || '').trim(),
        baseType: String(row['baseType'] || '').trim(),

        tenderURI: String(row['tenderURI'] || '').trim(),
        tenderHtmlDoc: String(row['tenderHtmlDoc'] || '').trim(),
        tenderPdf: String(row['tenderPdf'] || '').trim(),
        tenderZipDoc: String(row['tenderZipDoc'] || '').trim(),
        documentURL: String(row['documentURL'] || '').trim(),

        tenderStatus: String(row['tenderStatus'] || 'ACTIVE').toUpperCase(),
        entryStatus: String(row['entryStatus'] || '').trim(),
        isActive: true,
        isUploaded: true
      };

      // Safe Upsert matching by tenderNumber
      const result = await Tender.updateOne(
        { tenderNumber: tenderPayload.tenderNumber },
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
      const rawTenderNumber = row['Tender Number'] || row['tenderNumber'] || `GS-${Date.now()}-${index}`;
      const title = row['Title'] || row['title'] || 'Untitled Tender';
      const agency = row['Agency Name'] || row['Agency'] || 'Government Authority';

      const tenderPayload = {
        tenderNumber: String(rawTenderNumber).trim(),
        title: String(title).trim(),
        agencyName: String(agency).trim(),
        stateName: String(row['State'] || row['state'] || 'Delhi').trim(),
        tenderValue: Number(row['Budget'] || row['tenderValue'] || 0),
        submissionDate: row['Deadline'] ? new Date(row['Deadline']) : new Date(),
        tenderStatus: 'ACTIVE',
        isActive: true
      };

      await Tender.updateOne(
        { tenderNumber: tenderPayload.tenderNumber },
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
// 5. SECTOR/CATEGORY SUMMARY AGGREGATION
// ==========================================
router.get('/sectors/summary', async (req, res) => {
  try {
    const summary = await Tender.aggregate([
      {
        $group: {
          _id: "$category",
          totalAwards: { $sum: 1 },
          totalBudget: { 
            $sum: { $ifNull: ["$tenderValue", 0] } 
          },
          statesCount: { $addToSet: "$stateName" }
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