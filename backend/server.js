// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const initDailyCron = require('./cron/dailyAlerts');
const authorityRoutes = require('./routes/authorityRoutes');

dotenv.config();
connectDB();

const app = express();

// --- FIXED CORS CONFIGURATION FOR NETLIFY ---
const allowedOrigins = [
  'https://keen-fox-146ac8.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// ---------------------------------------------

// Increase payload limits to support Base64 image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

initDailyCron();

// ROUTES CONFIGURATION
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/tenders', require('./routes/tenderRoutes'));
app.use('/api/admin', require('./routes/adminTenderRoutes'));

// DASHBOARD MODULE ROUTES
app.use('/api/usage', require('./routes/usage'));
app.use('/api/bids', require('./routes/bidRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/authorities', require('./routes/authorityRoutes')); // <-- Fixed path corrected here

// HEALTH CHECK ROUTE
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'InfraLens Backend Server Running Smoothly' });
});

// 404 HANDLER FOR UNMATCHED ROUTES
app.use((req, res) => res.status(404).json({ success: false, message: 'API Route Not Found' }));

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 InfraLens Server listening on port ${PORT}`));