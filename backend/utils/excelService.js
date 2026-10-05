const xlsx = require('xlsx');
const path = require('path');

// =========================================================================
// 👇 YAHAN AAPKO APNI EXCEL SHEET KA PATH YA URL ATTACH KARNA HAI
// =========================================================================
// Path 1 (Agar Excel file backend folder mein rakhi hai):
const EXCEL_FILE_PATH = path.join(__dirname, '../data/tenders_data.xlsx'); 

// (Note: Agar URL se download karke read karna ho toh Axios se file stream karke padh sakte hain)
// =========================================================================

const getTendersFromExcel = () => {
  try {
    // Excel workbook read karna
    const workbook = xlsx.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0]; // Pehli sheet uthana
    const sheet = workbook.Sheets[sheetName];

    // Sheet ko JSON Array format mein convert karna
    const data = xlsx.utils.sheet_to_json(sheet);
    return data;
  } catch (error) {
    console.error("Excel Sheet Read karne mein error aaya:", error.message);
    return [];
  }
};

module.exports = { getTendersFromExcel };