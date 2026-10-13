// backend/seedTenders.js
const mongoose = require('mongoose');
require('dotenv').config();
const Tender = require('./models/Tender');

const sampleTenders = [
  {
    tenderNumber: "TEN-2026-001",
    tenderID: "TID-901",
    title: "Construction of 4-Lane Highway in Rohini",
    workDescription: "Road expansion and asphalt carpeting work including drainage setup.",
    agencyName: "PWD Delhi",
    stateName: "Delhi",
    country: "India",
    tenderType: "Works",
    category: "Civil Works",
    subCategory: "Roads",
    tenderValue: 45000000,
    emdValue: 900000,
    documentValue: 5000,
    currencyId: "INR",
    siteId: "SITE-01",
    submissionDate: new Date("2026-10-15"),
    openingDate: new Date("2026-10-16"),
    tenderStatus: "ACTIVE",
    isActive: true
  },
  {
    tenderNumber: "TEN-2026-002",
    tenderID: "TID-902",
    title: "Supply of IT Equipment and Networking Switches",
    workDescription: "Procurement of CISCO routers and Cat6 wiring for Western Railway HQ.",
    agencyName: "Indian Railways",
    stateName: "Maharashtra",
    country: "India",
    tenderType: "Supply",
    category: "IT & Telecom",
    subCategory: "Networking",
    tenderValue: 12000000,
    emdValue: 240000,
    documentValue: 2000,
    currencyId: "INR",
    siteId: "SITE-02",
    submissionDate: new Date("2026-10-25"),
    openingDate: new Date("2026-10-26"),
    tenderStatus: "ACTIVE",
    isActive: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Tender.deleteMany({});
    await Tender.insertMany(sampleTenders);
    console.log("✅ Flat Schema Tenders Seeded Successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding DB:", err);
    process.exit(1);
  }
};

seedDB();