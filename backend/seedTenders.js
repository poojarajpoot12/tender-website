// backend/seedTenders.js
const mongoose = require('mongoose');
require('dotenv').config();
const Tender = require('./models/Tender');

const sampleTenders = [
  {
    tenderId: "TEN-2026-001",
    title: "Construction of 4-Lane Highway in Rohini",
    description: "Road expansion and asphalt carpeting work including drainage setup.",
    department: "PWD Delhi",
    category: "Civil Works",
    location: { state: "Delhi", city: "New Delhi" },
    financials: { estimatedCost: 45000000, emdAmount: 900000, tenderFee: 5000 },
    dates: { closingDate: new Date("2026-10-15") },
    status: "ACTIVE"
  },
  {
    tenderId: "TEN-2026-002",
    title: "Supply of IT Equipment and Networking Switches",
    description: "Procurement of CISCO routers and Cat6 wiring for Western Railway HQ.",
    department: "Indian Railways",
    category: "IT & Telecom",
    location: { state: "Maharashtra", city: "Mumbai" },
    financials: { estimatedCost: 12000000, emdAmount: 240000, tenderFee: 2000 },
    dates: { closingDate: new Date("2026-10-05") },
    status: "ACTIVE"
  },
  {
    tenderId: "TEN-2026-003",
    title: "Solar Panel Installation at AIIMS Campus",
    description: "Design, supply, testing and commissioning of 500kW rooftop solar power system.",
    department: "Ministry of Health",
    category: "Electrical & Renewable",
    location: { state: "Delhi", city: "New Delhi" },
    financials: { estimatedCost: 28000000, emdAmount: 560000, tenderFee: 3500 },
    dates: { closingDate: new Date("2026-11-01") },
    status: "ACTIVE"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Tender.deleteMany({}); // Old data clear karne ke liye
    await Tender.insertMany(sampleTenders);
    console.log("✅ Dummy Tenders Added Successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding DB:", err);
    process.exit(1);
  }
};

seedDB();