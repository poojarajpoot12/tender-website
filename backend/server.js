// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const initDailyCron = require('./cron/dailyAlerts');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'InfraLens Backend Server Running Smoothly' });
});

app.use((req, res) => res.status(404).json({ success: false, message: 'API Route Not Found' }));

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 InfraLens Server listening on port ${PORT}`));