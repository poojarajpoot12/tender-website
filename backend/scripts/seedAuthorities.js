// backend/scripts/seedAuthorities.js
const mongoose = require('mongoose');
const Authority = require('../models/Authority');
require('dotenv').config();

const dummyAuthorities = [
  {
    name: "Western Coalfields Limited",
    code: "WCL",
    sector: "Civic",
    category: "PSU",
    primaryState: "Maharashtra",
    totalTenders: 34371,
    awardedTenders: 20897,
    liveTenders: 37,
    awardedValue: 394000000000
  },
  {
    name: "NTPC Limited",
    code: "NTPC",
    sector: "Power & Energy",
    category: "PSU",
    primaryState: "Central",
    totalTenders: 88813,
    awardedTenders: 16310,
    liveTenders: 447,
    awardedValue: 385000000000
  },
  {
    name: "Ministry of Road Transport and Highways",
    code: "MoRTH",
    sector: "Roads & Highways",
    category: "Central",
    primaryState: "Central",
    totalTenders: 21751,
    awardedTenders: 1924,
    liveTenders: 259,
    awardedValue: 312000000000
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/infralens');
    console.log('MongoDB Connected...');
    await Authority.deleteMany({});
    await Authority.insertMany(dummyAuthorities);
    console.log('✅ Data Insert Ho Gaya!');
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

seedData();